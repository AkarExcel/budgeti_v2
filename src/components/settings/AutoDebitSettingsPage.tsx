'use client';

import React from 'react';
import Link from 'next/link';
import { CalendarCheck, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';

export function AutoDebitSettingsPage() {
  const recurringBudgets = [
    { title: 'Rent & Housing', schedule: 'Monthly on 1st', amount: '₦100,000' },
    { title: 'Internet Broadband', schedule: 'Monthly on 5th', amount: '₦20,000' },
    { title: 'Electricity Tokens (IKEDC)', schedule: 'Monthly on 10th', amount: '₦15,000' },
  ];

  return (
    <div className="space-y-4">
      {/* Recurring Schedule Card */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm space-y-3">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Scheduled Expenses & Auto-Debits
        </h4>

        <div className="space-y-2">
          {recurringBudgets.map((item, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/20">
                  <CalendarCheck className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-100">{item.title}</p>
                  <p className="text-[10px] text-slate-400">{item.schedule}</p>
                </div>
              </div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-100">{item.amount}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Link to Budgets page */}
      <Link
        href="/budget"
        className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/40 transition block"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/20">
            <CalendarCheck className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">Monthly Budget Overview</h4>
            <p className="text-[11px] text-slate-400">Adjust limits and category budget amounts</p>
          </div>
        </div>
        <ArrowRight className="w-4 h-4 text-slate-400" />
      </Link>
    </div>
  );
}
