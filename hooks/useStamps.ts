'use client';

import { useState, useEffect, useCallback } from 'react';
import type { CollectedStamp } from '@/lib/types';

const SESSION_KEY = 'stamp-rally-session-id';

function getOrCreateSessionId(): string {
  let id = localStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

export function useStamps() {
  const [stamps, setStamps] = useState<CollectedStamp[]>([]);
  const [ready, setReady] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    const id = getOrCreateSessionId();
    setSessionId(id);

    fetch(`/api/stamps?sessionId=${encodeURIComponent(id)}`)
      .then(r => r.json())
      .then((data: Array<{ checkpointId: string; title: string; collectedAt: string }>) => {
        setStamps(data.map(s => ({
          checkpointId: s.checkpointId,
          title: s.title,
          collectedAt: s.collectedAt,
        })));
      })
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);

  const addStamp = useCallback((checkpointId: string, title: string) => {
    if (!sessionId) return;
    // Optimistic update
    setStamps(prev => {
      if (prev.some(s => s.checkpointId === checkpointId)) return prev;
      return [...prev, { checkpointId, title, collectedAt: new Date().toISOString() }];
    });
    fetch('/api/stamps', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, checkpointId, title }),
    }).catch(() => {});
  }, [sessionId]);

  const hasStamp = useCallback(
    (checkpointId: string) => stamps.some(s => s.checkpointId === checkpointId),
    [stamps]
  );

  const clearAll = useCallback(() => {
    if (!sessionId) return;
    setStamps([]);
    fetch(`/api/stamps?sessionId=${encodeURIComponent(sessionId)}`, {
      method: 'DELETE',
    }).catch(() => {});
  }, [sessionId]);

  return { stamps, ready, addStamp, hasStamp, clearAll };
}
