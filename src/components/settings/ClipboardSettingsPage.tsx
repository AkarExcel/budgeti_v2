'use client';

import React, { useState } from 'react';
import { Clipboard, ShieldCheck, Check, Sparkles } from 'lucide-react';

export function ClipboardSettingsPage() {
  const [clipboardParsing, setClipboardParsing] = useState(true);

  return (
    <div className="space-y-4">
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm space-y-3">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Transaction SMS & Bank Alert Parser
        </h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          Allow Budgeti to read copied transaction SMS or debit alerts from your clipboard to auto-fill amount, account, and description.
        </p>

        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-800 dark:text-slate-100">Clipboard Auto-Detect</p>
            <p className="text-[10px] text-slate-400">Prompts to record when debit SMS is copied</p>
          </div>
          <button
            type="button"
            onClick={() => setClipboardParsing(!clipboardParsing)}
            className={`w-11 h-6 rounded-full transition-colors relative flex items-center p-0.5 ${
              clipboardParsing ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform ${
                clipboardParsing ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Supported Banks Grid */}
        <div className="pt-2">
          <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-2">
            Supported Nigerian Bank Alert Formats:
          </p>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            {['GTBank (SMS/Push)', 'Access Bank', 'Zenith Bank', 'Moniepoint', 'OPay', 'PalmPay', 'Kuda Bank', 'First Bank'].map((b) => (
              <div
                key={b}
                className="p-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 flex items-center gap-1.5"
              >
                <Check className="w-3 h-3 text-emerald-500" />
                <span className="text-slate-700 dark:text-slate-300 font-medium">{b}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Privacy badge */}
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2 mt-2">
          <ShieldCheck className="w-4 h-4 shrink-0" />
          <span>All clipboard analysis runs 100% locally on your device offline.</span>
        </div>
      </div>
    </div>
  );
}
