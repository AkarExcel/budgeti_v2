'use client';

import React from 'react';
import { UserSettings } from '@/types';
import { formatCurrency } from '@/lib/utils/formatters';
import { Target, Wallet, Landmark, Calendar } from 'lucide-react';

interface FinancialPreferencesPageProps {
  settings: UserSettings;
}

export function FinancialPreferencesPage({ settings }: FinancialPreferencesPageProps) {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs text-slate-400">
          Your core currency, default accounts, and monthly financial milestones.
        </p>
      </div>

      <div className="space-y-2.5">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Landmark className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Default Currency</p>
              <p className="text-sm font-bold text-slate-100">{settings.currency} (Nigerian Naira ₦)</p>
            </div>
          </div>
          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
            {settings.currency}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Wallet className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Default Account</p>
              <p className="text-sm font-bold text-slate-100">{settings.default_account}</p>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Monthly Income Target</p>
              <p className="text-sm font-bold text-emerald-400">
                {formatCurrency(settings.monthly_income_target)}
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Monthly Savings Target</p>
              <p className="text-sm font-bold text-indigo-400">
                {formatCurrency(settings.monthly_savings_target)}
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Date Format</p>
              <p className="text-sm font-bold text-slate-100">{settings.date_format || 'YYYY-MM-DD'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
