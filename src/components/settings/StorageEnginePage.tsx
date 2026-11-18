'use client';

import React, { useState, useEffect } from 'react';
import { Database, ShieldCheck, Wifi, WifiOff, HardDrive, Trash2, CheckCircle2 } from 'lucide-react';
import { offlineDB } from '@/lib/pwa/db';
import { useOnlineStatus } from '@/lib/pwa/useOnlineStatus';

interface StorageEnginePageProps {
  isMock: boolean;
}

export function StorageEnginePage({ isMock }: StorageEnginePageProps) {
  const isOnline = useOnlineStatus();
  const [queueLength, setQueueLength] = useState(0);
  const [hasSnapshot, setHasSnapshot] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    offlineDB.queueLength().then(setQueueLength).catch(() => {});
    offlineDB.hasSnapshot().then(setHasSnapshot).catch(() => {});
  }, []);

  const handleClearCache = async () => {
    if (!confirm('Clear local offline cache? Your synced data on Google Sheets remains safe.')) return;
    setClearing(true);
    try {
      await offlineDB.clearQueue();
      setQueueLength(0);
      setMessage('Offline queue cleared');
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setClearing(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs text-slate-400">
          Status of Budgeti&apos;s offline-first architecture, local IndexedDB snapshot, and sync engine.
        </p>
      </div>

      <div className="space-y-2.5">
        {/* Backend Store Engine */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <h4 className="text-xs font-bold text-slate-200">Active Storage Provider</h4>
            </div>
            <span
              className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                isMock
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              }`}
            >
              {isMock ? 'Mock Repository' : 'Live Google Sheets'}
            </span>
          </div>
          <p className="text-xs text-slate-400">
            {isMock
              ? 'Local memory-seeded mock repository for zero-config testing.'
              : 'Direct API connection to Google Sheets spreadsheet.'}
          </p>
        </div>

        {/* Network & Offline Status */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center border ${
                isOnline
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
              }`}
            >
              {isOnline ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
            </div>
            <div>
              <p className="text-xs text-slate-400">Network Connectivity</p>
              <p className="text-sm font-bold text-slate-100">{isOnline ? 'Online' : 'Offline'}</p>
            </div>
          </div>
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded ${
              isOnline ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
            }`}
          >
            {isOnline ? 'Connected' : 'Offline Mode'}
          </span>
        </div>

        {/* IndexedDB Cache Status */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
              <HardDrive className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs text-slate-400">IndexedDB Local Snapshot</p>
              <p className="text-sm font-bold text-slate-100">
                {hasSnapshot ? 'Available (Instant Offline Launch)' : 'Initializing'}
              </p>
            </div>
          </div>
          {hasSnapshot && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
        </div>

        {/* Pending Sync Queue */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Pending Offline Mutations</p>
              <p className="text-sm font-bold text-slate-100">{queueLength} queued operations</p>
            </div>
          </div>
          {queueLength > 0 && (
            <button
              onClick={handleClearCache}
              disabled={clearing}
              className="text-xs font-semibold px-2.5 py-1 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 transition"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {message && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400">
          {message}
        </div>
      )}
    </div>
  );
}
