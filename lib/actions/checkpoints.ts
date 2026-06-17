'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
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

export async function createCheckpoint(formData: FormData) {
  await requireAdmin();

  const title = (formData.get('title') as string).trim();
  const description = (formData.get('description') as string)?.trim() || null;
  const conditions = parseConditions(formData);

  if (conditions.length === 0) throw new Error('条件が必要です');

  const id = crypto.randomUUID();
  const count = await prisma.checkpoint.count();

  await prisma.checkpoint.create({
    data: {
      id,
      order: count,
      title,
      description,
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

  await prisma.$transaction([
    prisma.checkpointCondition.deleteMany({ where: { checkpointId: id } }),
    prisma.checkpoint.update({
      where: { id },
      data: {
        title,
        description,
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
