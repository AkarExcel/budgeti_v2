'use client';

import React, { useState, useEffect, useRef } from 'react';
import { RefreshCw, CheckCircle2, AlertCircle, Database, Wifi, WifiOff, Upload } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useOnlineStatus } from '@/lib/pwa/useOnlineStatus';
import { useSyncQueue } from '@/lib/pwa/useSyncQueue';

interface SyncBadgeProps {
  lastSyncedAt: string | null;
  isMock: boolean;
  onSyncComplete?: () => void;
}

export function SyncBadge({ lastSyncedAt, isMock, onSyncComplete }: SyncBadgeProps) {
  const [mounted, setMounted] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showOnlinePopup, setShowOnlinePopup] = useState(false);

  const isOnline = useOnlineStatus();
  const prevOnlineRef = useRef<boolean | null>(null);
  const { pendingCount, isSyncing: queueSyncing, lastError: queueError, drainQueue } = useSyncQueue(onSyncComplete);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle transition from offline -> online with a 5-second popup flag
  useEffect(() => {
    if (prevOnlineRef.current === false && isOnline) {
      setShowOnlinePopup(true);
      const timer = setTimeout(() => {
        setShowOnlinePopup(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
    if (!isOnline) {
      setShowOnlinePopup(false);
    }
    prevOnlineRef.current = isOnline;
  }, [isOnline]);

  const handleSync = async () => {
    if (syncing || queueSyncing) return;

    // If offline, nothing to do with the server — just drain if we somehow have connection
    if (!isOnline) {
      setErrorMsg('No internet connection');
      setTimeout(() => setErrorMsg(null), 3000);
      return;
    }

    setSyncing(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      // First drain any pending queue
      if (pendingCount > 0) {
        await drainQueue();
      }

      const res = await fetch('/api/sync', { method: 'POST' });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Sync failed');
      }

      setSuccessMsg(data.message || 'Synced successfully');
      if (onSyncComplete) onSyncComplete();

      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Sync failed';
      setErrorMsg(msg);
      setTimeout(() => setErrorMsg(null), 5000);
    } finally {
      setSyncing(false);
    }
  };

  const isBusy = syncing || queueSyncing;
  const effectiveError = errorMsg || queueError;

  if (!mounted) {
    return (
      <div className="flex flex-col items-end gap-1">
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <button
            type="button"
            disabled
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-800 text-slate-400 border border-slate-700 opacity-60"
            title="Sync with Google Sheets"
          >
            <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
            <span>Sync Now</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex items-center gap-2 flex-wrap justify-end">
        {/* Offline pill — stays permanently while offline */}
        {!isOnline && (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 shadow-sm">
            <WifiOff className="w-3 h-3" />
            Offline
          </span>
        )}

        {/* Online pop-up badge — replaces offline flag when connection is restored, disappears after 5s */}
        {isOnline && showOnlinePopup && (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm animate-in fade-in zoom-in-95 duration-200">
            <Wifi className="w-3 h-3 text-emerald-400" />
            Online
          </span>
        )}

        {/* Pending queue badge */}
        {pendingCount > 0 && (
          <span
            className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 cursor-pointer hover:bg-amber-500/20 transition"
            onClick={isOnline ? drainQueue : undefined}
            title={isOnline ? 'Click to sync pending changes' : 'Will sync when online'}
          >
            <Upload className="w-3 h-3" />
            {pendingCount} pending
          </span>
        )}

        {isMock && (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Database className="w-3 h-3" />
            Mock Data
          </span>
        )}

        <button
          onClick={handleSync}
          disabled={isBusy || !isOnline}
          className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          title={!isOnline ? 'Sync unavailable while offline' : 'Sync with Google Sheets'}
        >
          <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${isBusy ? 'animate-spin' : ''}`} />
          <span>{isBusy ? 'Syncing...' : 'Sync Now'}</span>
        </button>
      </div>

      {lastSyncedAt && !effectiveError && !successMsg && (
        <span className="text-[10px] text-slate-400">
          Synced {formatDistanceToNow(new Date(lastSyncedAt), { addSuffix: true })}
        </span>
      )}

      {!isOnline && !effectiveError && !successMsg && (
        <span className="text-[10px] text-rose-400/80">
          Using cached data
          {pendingCount > 0 ? ` · ${pendingCount} change${pendingCount !== 1 ? 's' : ''} queued` : ''}
        </span>
      )}

      {successMsg && (
        <span className="text-[10px] text-emerald-400 flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3" /> {successMsg}
        </span>
      )}

      {effectiveError && (
        <span className="text-[10px] text-rose-400 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" /> {effectiveError}
        </span>
      )}
    </div>
  );
}
