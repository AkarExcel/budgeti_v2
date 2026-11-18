'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { offlineDB, QueuedMutation } from './db';
import { useOnlineStatus } from './useOnlineStatus';

export interface SyncQueueState {
  pendingCount: number;
  isSyncing: boolean;
  lastError: string | null;
  drainQueue: () => Promise<void>;
}

/**
 * Drains the offline sync queue by replaying mutations against the live API.
 * Automatically fires when the user comes back online.
 */
export function useSyncQueue(onSyncComplete?: () => void): SyncQueueState {
  const isOnline = useOnlineStatus();
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);
  const syncingRef = useRef(false);

  const refreshCount = useCallback(async () => {
    try {
      const len = await offlineDB.queueLength();
      setPendingCount(len);
    } catch {
      // db not available yet
    }
  }, []);

  // Poll pending count every 10 s
  useEffect(() => {
    refreshCount();
    const id = setInterval(refreshCount, 10_000);
    return () => clearInterval(id);
  }, [refreshCount]);

  const drainQueue = useCallback(async () => {
    if (syncingRef.current) return;
    syncingRef.current = true;
    setIsSyncing(true);
    setLastError(null);

    try {
      const queue = await offlineDB.getQueue();
      if (queue.length === 0) {
        setIsSyncing(false);
        syncingRef.current = false;
        return;
      }

      let hadError = false;

      for (const mutation of queue) {
        try {
          await replayMutation(mutation);
          await offlineDB.dequeue(mutation.id);
        } catch (err: unknown) {
          hadError = true;
          const msg = err instanceof Error ? err.message : String(err);
          console.warn('[Budgeti Sync] Failed to replay mutation', mutation, msg);
          // Keep it in the queue; stop draining on first failure to preserve order
          setLastError(`Sync partial failure: ${msg}`);
          break;
        }
      }

      await refreshCount();

      if (!hadError && onSyncComplete) {
        onSyncComplete();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setLastError(msg);
    } finally {
      setIsSyncing(false);
      syncingRef.current = false;
    }
  }, [onSyncComplete, refreshCount]);

  // Auto-drain when coming back online
  useEffect(() => {
    if (isOnline) {
      refreshCount().then((cnt) => {
        // give a small delay so the connection actually stabilises
        setTimeout(() => drainQueue(), 1500);
      });
    }
  }, [isOnline]); // eslint-disable-line react-hooks/exhaustive-deps

  // Listen for SW background-sync signal
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === 'BUDGETI_SYNC') {
        drainQueue();
      }
    };
    navigator.serviceWorker?.addEventListener('message', handler);
    return () => navigator.serviceWorker?.removeEventListener('message', handler);
  }, [drainQueue]);

  return { pendingCount, isSyncing, lastError, drainQueue };
}

async function replayMutation(mutation: QueuedMutation): Promise<void> {
  const opts: RequestInit = {
    method: mutation.method,
    headers: { 'Content-Type': 'application/json' },
  };

  if (mutation.body !== undefined) {
    opts.body = JSON.stringify(mutation.body);
  }

  const res = await fetch(mutation.url, opts);
  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw new Error(json.message || `HTTP ${res.status}`);
  }
}
