import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import GpsCheckinClient from '@/components/GpsCheckinClient';
import type { GpsCheckpoint } from '@/lib/types';

export default async function GpsCheckinPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;
  if (!id) notFound();

  const row = await prisma.checkpoint.findUnique({ where: { id } });
  if (!row || row.type !== 'gps' || row.lat === null || row.lng === null) notFound();

  const checkpoint: GpsCheckpoint = {
    id: row.id,
    type: 'gps',
    lat: row.lat,
    lng: row.lng,
    title: row.title,
    description: row.description ?? undefined,
  };

  return <GpsCheckinClient checkpoints={[checkpoint]} />;
}
