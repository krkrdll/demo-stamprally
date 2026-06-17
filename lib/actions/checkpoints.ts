'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/session';

async function requireAdmin() {
  const ok = await getSession();
  if (!ok) throw new Error('Unauthorized');
}

export async function createCheckpoint(formData: FormData) {
  await requireAdmin();

  const type = formData.get('type') as string;
  const title = (formData.get('title') as string).trim();
  const description = (formData.get('description') as string)?.trim() || null;

  const id = crypto.randomUUID();
  const count = await prisma.checkpoint.count();

  if (type === 'gps') {
    await prisma.checkpoint.create({
      data: {
        id,
        type,
        order: count,
        title,
        description,
        lat: parseFloat(formData.get('lat') as string),
        lng: parseFloat(formData.get('lng') as string),
      },
    });
  } else if (type === 'passcode') {
    const passcode = (formData.get('passcode') as string).trim();
    await prisma.checkpoint.create({
      data: { id, type, order: count, title, description, passcode },
    });
  } else {
    const customUrl = (formData.get('markerImageUrl') as string)?.trim();
    await prisma.checkpoint.create({
      data: {
        id,
        type,
        order: count,
        title,
        description,
        markerImageUrl: customUrl || `/api/qr/${id}`,
      },
    });
  }

  revalidatePath('/admin');
  revalidatePath('/');
  redirect('/admin');
}

export async function updateCheckpoint(id: string, formData: FormData) {
  await requireAdmin();

  const type = formData.get('type') as string;
  const title = (formData.get('title') as string).trim();
  const description = (formData.get('description') as string)?.trim() || null;

  const data: Record<string, unknown> = { title, description };

  if (type === 'gps') {
    data.lat = parseFloat(formData.get('lat') as string);
    data.lng = parseFloat(formData.get('lng') as string);
  } else if (type === 'passcode') {
    data.passcode = (formData.get('passcode') as string).trim();
  } else {
    const customUrl = (formData.get('markerImageUrl') as string)?.trim();
    data.markerImageUrl = customUrl || `/api/qr/${id}`;
  }

  await prisma.checkpoint.update({ where: { id }, data });

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

  // 位置番号で swap（order 値の重複を気にしない絶対位置指定）
  await Promise.all([
    prisma.checkpoint.update({ where: { id: all[idx].id }, data: { order: targetIdx } }),
    prisma.checkpoint.update({ where: { id: all[targetIdx].id }, data: { order: idx } }),
  ]);

  revalidatePath('/admin');
  revalidatePath('/');
}
