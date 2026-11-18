'use client';

import React from 'react';
import Link from 'next/link';
import { UserSettings } from '@/types';
import { formatCurrency } from '@/lib/utils/formatters';
import { Target, TrendingUp, PiggyBank, ArrowRight } from 'lucide-react';

interface SavingsSettingsPageProps {
  settings: UserSettings;
}

export function SavingsSettingsPage({ settings }: SavingsSettingsPageProps) {
  return (
    <div className="space-y-4">
      {/* Monthly Targets Card */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm space-y-3">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Savings & Income Milestones
        </h4>

        <div className="space-y-2.5">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/20">
                <PiggyBank className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs text-slate-400">Monthly Savings Target</p>
                <p className="text-sm font-bold text-emerald-500">
                  {formatCurrency(settings.monthly_savings_target || 150000)}
                </p>
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center border border-indigo-500/20">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs text-slate-400">Monthly Income Target</p>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                  {formatCurrency(settings.monthly_income_target || 500000)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Link to Financial Goals */}
      <Link
        href="/goals"
        className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/40 transition block"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/20">
            <Target className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">Manage Financial Goals</h4>
            <p className="text-[11px] text-slate-400">Track target dates, progress bars & deposits</p>
          </div>
        </div>
        <ArrowRight className="w-4 h-4 text-slate-400" />
      </Link>
    </div>
  );
}
