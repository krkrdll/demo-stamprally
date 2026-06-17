'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { promises as fs } from 'fs';
import path from 'path';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/session';

async function requireAdmin() {
  const ok = await getSession();
  if (!ok) throw new Error('Unauthorized');
}

type ConditionInput = {
  type: 'gps' | 'marker' | 'passcode';
  lat?: number;
  lng?: number;
  markerImageUrl?: string;
  passcode?: string;
};

function parseConditions(formData: FormData): ConditionInput[] {
  const raw = formData.get('conditions') as string;
  if (!raw) return [];
  try {
    return JSON.parse(raw) as ConditionInput[];
  } catch {
    return [];
  }
}

const UPLOAD_DIR = path.join(process.cwd(), 'public/uploads/checkpoints');
const ALLOWED_EXTS = new Set(['jpg', 'jpeg', 'png', 'webp', 'gif']);

async function saveImage(file: File, checkpointId: string): Promise<string> {
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  const ext = (file.name.split('.').pop() ?? 'jpg').toLowerCase();
  const safeExt = ALLOWED_EXTS.has(ext) ? ext : 'jpg';
  const filename = `${checkpointId}.${safeExt}`;
  const bytes = await file.arrayBuffer();
  await fs.writeFile(path.join(UPLOAD_DIR, filename), Buffer.from(bytes));
  return `/uploads/checkpoints/${filename}`;
}

async function deleteImage(imageUrl: string) {
  try {
    await fs.unlink(path.join(process.cwd(), 'public', imageUrl));
  } catch {
    // Ignore if file doesn't exist
  }
}

export async function createCheckpoint(formData: FormData) {
  await requireAdmin();

  const title = (formData.get('title') as string).trim();
  const description = (formData.get('description') as string)?.trim() || null;
  const conditions = parseConditions(formData);

  if (conditions.length === 0) throw new Error('条件が必要です');

  const id = crypto.randomUUID();
  const count = await prisma.checkpoint.count();

  const imageFile = formData.get('image') as File | null;
  let imageUrl: string | null = null;
  if (imageFile && imageFile.size > 0) {
    imageUrl = await saveImage(imageFile, id);
  }

  await prisma.checkpoint.create({
    data: {
      id,
      order: count,
      title,
      description,
      imageUrl,
      conditions: {
        create: conditions.map((c, i) => ({
          id: crypto.randomUUID(),
          type: c.type,
          lat: c.type === 'gps' ? c.lat : null,
          lng: c.type === 'gps' ? c.lng : null,
          passcode: c.type === 'passcode' ? c.passcode : null,
          markerImageUrl:
            c.type === 'marker'
              ? (c.markerImageUrl?.trim() || `/api/qr/${id}`)
              : null,
          sortOrder: i,
        })),
      },
    },
  });

  revalidatePath('/admin');
  revalidatePath('/');
  redirect('/admin');
}

export async function updateCheckpoint(id: string, formData: FormData) {
  await requireAdmin();

  const title = (formData.get('title') as string).trim();
  const description = (formData.get('description') as string)?.trim() || null;
  const conditions = parseConditions(formData);

  if (conditions.length === 0) throw new Error('条件が必要です');

  const existingImageUrl = (formData.get('existingImageUrl') as string) || null;
  const deleteImageFlag = formData.get('deleteImage') === 'true';
  const imageFile = formData.get('image') as File | null;

  let imageUrl: string | null = existingImageUrl;

  if (deleteImageFlag) {
    if (existingImageUrl) await deleteImage(existingImageUrl);
    imageUrl = null;
  } else if (imageFile && imageFile.size > 0) {
    if (existingImageUrl) await deleteImage(existingImageUrl);
    imageUrl = await saveImage(imageFile, id);
  }

  await prisma.$transaction([
    prisma.checkpointCondition.deleteMany({ where: { checkpointId: id } }),
    prisma.checkpoint.update({
      where: { id },
      data: {
        title,
        description,
        imageUrl,
        conditions: {
          create: conditions.map((c, i) => ({
            id: crypto.randomUUID(),
            type: c.type,
            lat: c.type === 'gps' ? c.lat : null,
            lng: c.type === 'gps' ? c.lng : null,
            passcode: c.type === 'passcode' ? c.passcode : null,
            markerImageUrl:
              c.type === 'marker'
                ? (c.markerImageUrl?.trim() || `/api/qr/${id}`)
                : null,
            sortOrder: i,
          })),
        },
      },
    }),
  ]);

  revalidatePath('/admin');
  revalidatePath('/');
  redirect('/admin');
}

export async function deleteCheckpoint(formData: FormData) {
  await requireAdmin();

  const id = formData.get('id') as string;

  const cp = await prisma.checkpoint.findUnique({ where: { id }, select: { imageUrl: true } });
  if (cp?.imageUrl) await deleteImage(cp.imageUrl);

  await prisma.checkpoint.delete({ where: { id } });

  revalidatePath('/admin');
  revalidatePath('/');
}

export async function moveCheckpoint(id: string, direction: 'up' | 'down') {
  await requireAdmin();

  const all = await prisma.checkpoint.findMany({
    orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
    select: { id: true, order: true },
  });

  const idx = all.findIndex(cp => cp.id === id);
  if (idx === -1) return;

  const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
  if (targetIdx < 0 || targetIdx >= all.length) return;

  await Promise.all([
    prisma.checkpoint.update({ where: { id: all[idx].id }, data: { order: targetIdx } }),
    prisma.checkpoint.update({ where: { id: all[targetIdx].id }, data: { order: idx } }),
  ]);

  revalidatePath('/admin');
  revalidatePath('/');
}
