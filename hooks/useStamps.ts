'use client';

import { useState, useEffect, useCallback } from 'react';
import type { CollectedStamp } from '@/lib/types';

const STORAGE_KEY = 'stamp-rally-collected';

export function useStamps() {
  const [stamps, setStamps] = useState<CollectedStamp[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setStamps(JSON.parse(raw));
    } catch {
      // ignore parse errors
    }
    setReady(true);
  }, []);

  const addStamp = useCallback((checkpointId: string, title: string) => {
    setStamps(prev => {
      if (prev.some(s => s.checkpointId === checkpointId)) return prev;
      const next: CollectedStamp[] = [
        ...prev,
        { checkpointId, title, collectedAt: new Date().toISOString() },
      ];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const hasStamp = useCallback(
    (checkpointId: string) => stamps.some(s => s.checkpointId === checkpointId),
    [stamps]
  );

  const clearAll = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setStamps([]);
  }, []);

  return { stamps, ready, addStamp, hasStamp, clearAll };
}
