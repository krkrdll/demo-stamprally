import prisma from './prisma';
import type { Checkpoint, CheckpointCondition } from './types';

type ConditionRow = {
  id: string;
  type: string;
  lat: number | null;
  lng: number | null;
  radiusMeters: number | null;
  markerImageUrl: string | null;
  passcode: string | null;
  sortOrder: number;
};

type Row = {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  conditions: ConditionRow[];
};

function toCondition(row: ConditionRow): CheckpointCondition {
  if (row.type === 'gps') {
    return { id: row.id, type: 'gps', lat: row.lat!, lng: row.lng!, radiusMeters: row.radiusMeters ?? 20 };
  }
  if (row.type === 'passcode') {
    return { id: row.id, type: 'passcode', passcode: row.passcode! };
  }
  return { id: row.id, type: 'marker', markerImageUrl: row.markerImageUrl! };
}

function toCheckpoint(row: Row): Checkpoint {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? undefined,
    imageUrl: row.imageUrl ?? undefined,
    conditions: row.conditions
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map(toCondition),
  };
}

const includeConditions = {
  conditions: { orderBy: { sortOrder: 'asc' as const } },
};

export async function getAllCheckpoints(): Promise<Checkpoint[]> {
  const rows = await prisma.checkpoint.findMany({
    orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
    include: includeConditions,
  });
  return rows.map(toCheckpoint);
}

export async function getCheckpointById(id: string): Promise<Checkpoint | null> {
  const row = await prisma.checkpoint.findUnique({
    where: { id },
    include: includeConditions,
  });
  return row ? toCheckpoint(row) : null;
}

export async function getMarkerCheckpoints(): Promise<Checkpoint[]> {
  const rows = await prisma.checkpoint.findMany({
    where: { conditions: { some: { type: 'marker' } } },
    orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
    include: includeConditions,
  });
  return rows.map(toCheckpoint);
}
