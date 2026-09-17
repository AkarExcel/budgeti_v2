'use client';

import React, { useState } from 'react';
import { RefreshCw, CheckCircle2, AlertCircle, Database } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface SyncBadgeProps {
  lastSyncedAt: string | null;
  isMock: boolean;
  onSyncComplete?: () => void;
}

export function SyncBadge({ lastSyncedAt, isMock, onSyncComplete }: SyncBadgeProps) {
  const [syncing, setSyncing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSync = async () => {
    if (syncing) return;
    setSyncing(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch('/api/sync', { method: 'POST' });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Sync failed');
      }

      setSuccessMsg(data.message || 'Synced successfully');
      if (onSyncComplete) onSyncComplete();
      
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Sync failed');
      setTimeout(() => setErrorMsg(null), 5000);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex items-center gap-2">
        {isMock && (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Database className="w-3 h-3" />
            Mock Data
          </span>
        )}
        <button
          onClick={handleSync}
          disabled={syncing}
          className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition active:scale-95 disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${syncing ? 'animate-spin' : ''}`} />
          <span>{syncing ? 'Syncing...' : 'Sync Now'}</span>
        </button>
      </div>

      {lastSyncedAt && !errorMsg && !successMsg && (
        <span className="text-[10px] text-slate-400">
          Synced {formatDistanceToNow(new Date(lastSyncedAt), { addSuffix: true })}
        </span>
      )}

      {successMsg && (
        <span className="text-[10px] text-emerald-400 flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3" /> {successMsg}
        </span>
      )}

      {errorMsg && (
        <span className="text-[10px] text-rose-400 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" /> {errorMsg}
        </span>
      )}
    </div>
  );
}
