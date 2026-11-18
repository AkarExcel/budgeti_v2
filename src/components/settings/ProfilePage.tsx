'use client';

import React from 'react';
import { User, Mail, Link as LinkIcon, CheckCircle2, RefreshCw, ExternalLink, ShieldCheck } from 'lucide-react';

interface ProfilePageProps {
  userGmail: string | null;
  sheetId: string | null;
  setupComplete: boolean;
  setupAt: string | null;
  isMock: boolean;
  onOpenSetupModal: () => void;
  onDisconnect: () => void;
}

export function ProfilePage({
  userGmail,
  sheetId,
  setupComplete,
  setupAt,
  isMock,
  onOpenSetupModal,
  onDisconnect,
}: ProfilePageProps) {
  const isConnected = setupComplete && Boolean(sheetId);
  const sheetUrl = sheetId ? `https://docs.google.com/spreadsheets/d/${sheetId}/edit` : null;

  return (
    <div className="space-y-4">
      {/* Profile Header Card */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md shadow-black/20 flex items-center gap-4 text-slate-100">
        <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 text-xl font-bold shrink-0">
          {userGmail ? userGmail.charAt(0).toUpperCase() : <User className="w-7 h-7" />}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-bold text-slate-100 truncate">
            {userGmail ? userGmail.split('@')[0] : 'Budgeti User'}
          </h3>
          <p className="text-xs text-slate-400 truncate">
            {userGmail || 'No Google Account linked'}
          </p>
          <div className="mt-1 flex items-center gap-1.5">
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                isConnected
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
              }`}
            >
              {isConnected ? 'Sheets Sync Active' : 'Offline / Mock Store'}
            </span>
          </div>
        </div>
      </div>

      {/* Google Sheets Document Details */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md shadow-black/20 space-y-3.5 text-slate-100">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Google Sheets Configuration
        </h4>

        <div className="space-y-2 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
            <span className="text-slate-400 flex items-center gap-1.5 text-[11px] mb-1">
              <Mail className="w-3.5 h-3.5 text-emerald-500" /> Linked Google Account
            </span>
            <span className="font-semibold text-slate-800 dark:text-slate-100 block truncate">
              {userGmail || 'Not configured'}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-1">
              <span className="text-slate-400 flex items-center gap-1.5 text-[11px]">
                <LinkIcon className="w-3.5 h-3.5 text-emerald-500" /> Target Spreadsheet Address / ID
              </span>
              {sheetUrl && (
                <a
                  href={sheetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-500 hover:text-emerald-600 text-[11px] font-semibold flex items-center gap-1"
                >
                  Open in Sheets <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
            <span className="font-mono text-slate-800 dark:text-slate-200 block truncate text-[11px]">
              {sheetId || 'Not configured'}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2
                className={`w-4 h-4 ${setupComplete ? 'text-emerald-500' : 'text-amber-500'}`}
              />
              <span className="text-slate-600 dark:text-slate-300 font-medium">Worksheet Structure:</span>
            </div>
            <span className="font-bold text-[11px] text-emerald-600 dark:text-emerald-400">
              {setupComplete ? 'Verified (7/7 Sheets)' : 'Pending'}
            </span>
          </div>
        </div>

        {setupAt && (
          <p className="text-[10px] text-slate-400 pt-1">
            Last configured: {new Date(setupAt).toLocaleString()}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="space-y-2 pt-2">
        <button
          onClick={onOpenSetupModal}
          className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition flex items-center justify-center gap-1.5 active:scale-98"
        >
          <RefreshCw className="w-4 h-4" />
          {isConnected ? 'Reconfigure or Change Sheet' : 'Connect Google Sheet'}
        </button>

        {isConnected && (
          <button
            onClick={onDisconnect}
            className="w-full py-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 active:bg-rose-500/30 text-rose-400 border border-rose-500/30 text-xs font-bold transition flex items-center justify-center gap-2"
          >
            Sign Out / Disconnect Google Account
          </button>
        )}
      </div>
    </div>
  );
}
