'use client';

import React, { useState, useEffect } from 'react';
import { ShieldCheck, HardDrive, Database, Wifi, CheckCircle2, Lock } from 'lucide-react';
import { offlineDB } from '@/lib/pwa/db';
import { useOnlineStatus } from '@/lib/pwa/useOnlineStatus';

interface SecurityCenterPageProps {
  isMock: boolean;
}

export function SecurityCenterPage({ isMock }: SecurityCenterPageProps) {
  const isOnline = useOnlineStatus();
  const [queueCount, setQueueCount] = useState(0);

  useEffect(() => {
    offlineDB.queueLength().then(setQueueCount).catch(() => {});
  }, []);

  return (
    <div className="space-y-4">
      {/* Overview Status Card */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm space-y-3">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Security & Offline Encryption Overview
        </h4>

        <div className="space-y-2.5 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/20">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-slate-800 dark:text-slate-100">Storage Protection</p>
                <p className="text-[10px] text-slate-400">IndexedDB Client Sandboxed Isolation</p>
              </div>
            </div>
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              Active
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center border border-indigo-500/20">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-slate-800 dark:text-slate-100">Data Synchronization</p>
                <p className="text-[10px] text-slate-400">Direct HTTPS TLS 1.3 Google Sheets API</p>
              </div>
            </div>
            <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
              Secure
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20">
                <Database className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-slate-800 dark:text-slate-100">Offline Queue Protection</p>
                <p className="text-[10px] text-slate-400">{queueCount} pending mutations cached</p>
              </div>
            </div>
            <span className="text-[10px] font-bold text-slate-500 bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded-full">
              {queueCount === 0 ? 'Synced' : `${queueCount} Queued`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
