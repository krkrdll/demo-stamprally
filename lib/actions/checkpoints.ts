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

  if (type === 'gps') {
    await prisma.checkpoint.create({
      data: {
        id,
        type,
        title,
        description,
        lat: parseFloat(formData.get('lat') as string),
        lng: parseFloat(formData.get('lng') as string),
      },
    });
  } else if (type === 'passcode') {
    const passcode = (formData.get('passcode') as string).trim();
    await prisma.checkpoint.create({
      data: { id, type, title, description, passcode },
    });
  } else {
    const customUrl = (formData.get('markerImageUrl') as string)?.trim();
    await prisma.checkpoint.create({
      data: {
        id,
        type,
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
