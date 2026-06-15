import prisma from './prisma';
import type { Checkpoint, GpsCheckpoint, MarkerCheckpoint } from './types';

type Row = {
  id: string;
  type: string;
  lat: number | null;
  lng: number | null;
  markerImageUrl: string | null;
  title: string;
  description: string | null;
};

function toCheckpoint(row: Row): Checkpoint {
  if (row.type === 'gps') {
    return {
      id: row.id,
      type: 'gps',
      lat: row.lat!,
      lng: row.lng!,
      title: row.title,
      description: row.description ?? undefined,
    };
  }
  return {
    id: row.id,
    type: 'marker',
    markerImageUrl: row.markerImageUrl!,
    title: row.title,
    description: row.description ?? undefined,
  };
}

export async function getAllCheckpoints(): Promise<Checkpoint[]> {
  const rows = await prisma.checkpoint.findMany({ orderBy: { createdAt: 'asc' } });
  return rows.map(toCheckpoint);
}

export async function getGpsCheckpoints(): Promise<GpsCheckpoint[]> {
  const rows = await prisma.checkpoint.findMany({
    where: { type: 'gps' },
    orderBy: { createdAt: 'asc' },
  });
  return rows.map(toCheckpoint) as GpsCheckpoint[];
}

export async function getMarkerCheckpoints(): Promise<MarkerCheckpoint[]> {
  const rows = await prisma.checkpoint.findMany({
    where: { type: 'marker' },
    orderBy: { createdAt: 'asc' },
  });
  return rows.map(toCheckpoint) as MarkerCheckpoint[];
}
