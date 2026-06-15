import checkpointData from '@/data/checkpoints.json';
import type { Checkpoint, GpsCheckpoint, MarkerCheckpoint } from './types';

export function getAllCheckpoints(): Checkpoint[] {
  return checkpointData.checkpoints as Checkpoint[];
}

export function getGpsCheckpoints(): GpsCheckpoint[] {
  return (checkpointData.checkpoints as Checkpoint[]).filter(
    (cp): cp is GpsCheckpoint => cp.type === 'gps'
  );
}

export function getMarkerCheckpoints(): MarkerCheckpoint[] {
  return (checkpointData.checkpoints as Checkpoint[]).filter(
    (cp): cp is MarkerCheckpoint => cp.type === 'marker'
  );
}
