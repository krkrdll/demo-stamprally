'use server';

import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';
import { isThemeKey } from '@/lib/themes';
import { getSession } from '@/lib/session';

export async function updateSiteSettings(_prev: null | void, formData: FormData) {
  const ok = await getSession();
  if (!ok) throw new Error('Unauthorized');

  const siteTitle = (formData.get('siteTitle') as string)?.trim();
  const theme = formData.get('theme') as string;

  if (!siteTitle || !isThemeKey(theme)) return;

  await prisma.siteSettings.upsert({
    where: { id: 'default' },
    create: { id: 'default', siteTitle, theme },
    update: { siteTitle, theme },
  });

  revalidatePath('/', 'layout');
}
