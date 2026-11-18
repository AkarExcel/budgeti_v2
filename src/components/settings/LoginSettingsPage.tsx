'use client';

import React from 'react';
import { KeyRound, ShieldCheck, CheckCircle2, Lock, FileCode } from 'lucide-react';

interface LoginSettingsPageProps {
  onOpenSetupGuide: () => void;
}

export function LoginSettingsPage({ onOpenSetupGuide }: LoginSettingsPageProps) {
  return (
    <div className="space-y-4">
      {/* Google Cloud Service Account Credentials Card */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm space-y-3">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Authentication & API Credentials
        </h4>

        <div className="space-y-2.5 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/20">
                <KeyRound className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-100">Service Account Key</p>
                <p className="text-[11px] text-slate-400">Google Cloud Sheets API v4</p>
              </div>
            </div>
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              Enabled
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center border border-indigo-500/20">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-100">Local Session Security</p>
                <p className="text-[11px] text-slate-400">Offline-first encrypted token storage</p>
              </div>
            </div>
            <span className="text-[10px] font-bold text-slate-500 bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded-full">
              AES-256
            </span>
          </div>
        </div>
      </div>

      {/* Setup Guide Link */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/20">
            <FileCode className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">Google API Setup Guide</h4>
            <p className="text-[11px] text-slate-400">View service account instructions and keys</p>
          </div>
        </div>
        <button
          onClick={onOpenSetupGuide}
          className="text-xs font-bold text-emerald-500 hover:text-emerald-600 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 transition"
        >
          View Guide
        </button>
      </div>
    </div>
  );
}
