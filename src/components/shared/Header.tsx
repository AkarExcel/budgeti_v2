'use client';

import React from 'react';
import Link from 'next/link';
import { SyncBadge } from './SyncBadge';
import { Settings, Target, Wallet, Calendar } from 'lucide-react';
import { getMonthYearString } from '@/lib/utils/formatters';

interface HeaderProps {
  selectedMonth: string;
  onMonthChange: (month: string) => void;
  lastSyncedAt: string | null;
  isMock: boolean;
  onSyncComplete: () => void;
  onOpenSetupModal?: () => void;
}

export function Header({
  selectedMonth,
  onMonthChange,
  lastSyncedAt,
  isMock,
  onSyncComplete,
  onOpenSetupModal,
}: HeaderProps) {
  // Generate month options (past 12 months + current month)
  const monthOptions = Array.from({ length: 12 }).map((_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const val = `${y}-${m}`;
    return { value: val, label: getMonthYearString(val) };
  });

  return (
    <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 py-3">
      <div className="max-w-md mx-auto sm:max-w-lg md:max-w-2xl lg:max-w-4xl flex items-center justify-between gap-3">
        {/* Logo & App Name */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-lg">
            ₦
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-100 tracking-tight leading-tight">
              Budgeti
            </h1>
            <p className="text-[10px] text-slate-400 font-medium">Personal Finance System</p>
          </div>
        </div>

        {/* Month Selector & Controls */}
        <div className="flex items-center gap-2">
          <div className="relative flex items-center">
            <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-2 pointer-events-none" />
            <select
              value={selectedMonth}
              onChange={(e) => onMonthChange(e.target.value)}
              className="bg-slate-800 text-slate-200 text-xs font-medium pl-7 pr-2.5 py-1.5 rounded-lg border border-slate-700 focus:outline-none focus:border-emerald-500 appearance-none cursor-pointer"
            >
              {monthOptions.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          {/* Settings & Extra icons */}
          <div className="flex items-center gap-1">
            <Link
              href="/goals"
              className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-emerald-400 border border-slate-700 transition"
              title="Financial Goals"
            >
              <Target className="w-4 h-4" />
            </Link>
            <Link
              href="/accounts"
              className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-emerald-400 border border-slate-700 transition"
              title="Accounts"
            >
              <Wallet className="w-4 h-4" />
            </Link>
            <Link
              href="/settings"
              className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-emerald-400 border border-slate-700 transition"
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto sm:max-w-lg md:max-w-2xl lg:max-w-4xl mt-2 flex items-center justify-between gap-2">
        {onOpenSetupModal && (
          <button
            onClick={onOpenSetupModal}
            className="text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 bg-emerald-500/10 hover:bg-emerald-500/20 px-2.5 py-1 rounded-lg border border-emerald-500/20 transition"
          >
            <span>Connect Google Sheet</span>
          </button>
        )}
        <div className="ml-auto">
          <SyncBadge
            lastSyncedAt={lastSyncedAt}
            isMock={isMock}
            onSyncComplete={onSyncComplete}
          />
        </div>
      </div>
    </header>
  );
}

