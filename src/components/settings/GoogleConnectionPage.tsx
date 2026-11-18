'use client';

import React from 'react';
import { Mail, Link as LinkIcon, CheckCircle2, AlertTriangle, FileSpreadsheet, RefreshCw, ExternalLink } from 'lucide-react';

interface GoogleConnectionPageProps {
  userGmail: string | null;
  sheetId: string | null;
  setupComplete: boolean;
  setupAt: string | null;
  isMock: boolean;
  onOpenSetupModal: () => void;
  onDisconnect?: () => void;
}

export function GoogleConnectionPage({
  userGmail,
  sheetId,
  setupComplete,
  setupAt,
  isMock,
  onOpenSetupModal,
  onDisconnect,
}: GoogleConnectionPageProps) {
  const isConnected = setupComplete && Boolean(sheetId);
  const sheetUrl = sheetId ? `https://docs.google.com/spreadsheets/d/${sheetId}/edit` : null;

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs text-slate-400">
          Manage your Google Account connection and primary Google Sheets spreadsheet sync.
        </p>
      </div>

      {/* Main Connection Status Card */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center border ${
                isConnected
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
              }`}
            >
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-100">
                {isConnected ? 'Google Sheet Connected' : 'No Sheet Connected'}
              </h4>
              <p className="text-[11px] text-slate-400">
                {isConnected ? 'Syncing transactions & budgets' : 'Using local mock repository'}
              </p>
            </div>
          </div>
          <span
            className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
              isConnected
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
            }`}
          >
            {isConnected ? 'Connected' : 'Pending'}
          </span>
        </div>

        {/* Details Grid */}
        <div className="space-y-2 pt-1 text-xs">
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-slate-400 flex items-center gap-1.5 text-[11px]">
              <Mail className="w-3.5 h-3.5 text-emerald-400" /> Connected Gmail Account
            </span>
            <span className="font-semibold text-slate-100 block truncate">
              {userGmail || 'None configured'}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-1.5 text-[11px]">
                <LinkIcon className="w-3.5 h-3.5 text-emerald-400" /> Google Sheet ID
              </span>
              {sheetUrl && (
                <a
                  href={sheetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-400 hover:text-emerald-300 text-[11px] font-semibold flex items-center gap-1"
                >
                  Open in Sheets <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
            <span className="font-mono text-slate-100 block truncate text-[11px]">
              {sheetId || 'None configured'}
            </span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2
              className={`w-4 h-4 ${setupComplete ? 'text-emerald-400' : 'text-amber-400'}`}
            />
            <span className="text-slate-300 font-medium">Worksheet Verification:</span>
          </div>
          <span
            className={`font-bold px-2 py-0.5 rounded-full text-[10px] ${
              setupComplete
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
            }`}
          >
            {setupComplete ? 'Verified (7/7 Sheets)' : 'Pending Setup'}
          </span>
        </div>

        {setupAt && (
          <p className="text-[10px] text-slate-500">
            Last configured: {new Date(setupAt).toLocaleString()}
          </p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="space-y-2 pt-1">
        <button
          onClick={onOpenSetupModal}
          className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition flex items-center justify-center gap-1.5"
        >
          <RefreshCw className="w-4 h-4" />
          {isConnected ? 'Reconfigure or Change Sheet' : 'Connect Google Sheet'}
        </button>

        {isConnected && onDisconnect && (
          <button
            onClick={onDisconnect}
            className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-rose-500/10 text-rose-400 border border-slate-800 hover:border-rose-500/30 text-xs font-semibold transition"
          >
            Disconnect Google Account
          </button>
        )}
      </div>
    </div>
  );
}
