'use client';

import React, { useState } from 'react';
import { Home, Eye, Check, SlidersHorizontal } from 'lucide-react';

export function HomepageSettingsPage() {
  const [widgets, setWidgets] = useState({
    heroBalance: true,
    recentTransactions: true,
    budgetProgress: true,
    financialGoals: true,
    habitBanner: true,
  });

  const toggleWidget = (key: keyof typeof widgets) => {
    setWidgets((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-4">
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm space-y-3">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Dashboard Widgets Customization
        </h4>

        <div className="space-y-2">
          {[
            { key: 'heroBalance' as const, label: 'Hero Net Cash Flow & Balance Card', desc: 'Total balance, monthly income, expense & savings' },
            { key: 'habitBanner' as const, label: 'Daily Habit & Streak Banner', desc: 'Prompts to record expenses and track consistent logging' },
            { key: 'recentTransactions' as const, label: 'Recent Transactions Widget', desc: 'Latest 5 transactions with quick edit/delete' },
            { key: 'budgetProgress' as const, label: 'Budget Progress Tracker', desc: 'Category-by-category progress bar with remaining amounts' },
            { key: 'financialGoals' as const, label: 'Financial Goals Tracker', desc: 'Active savings goals progress and target dates' },
          ].map((item) => (
            <div
              key={item.key}
              className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 flex items-center justify-between"
            >
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-100">{item.label}</p>
                <p className="text-[10px] text-slate-400">{item.desc}</p>
              </div>
              <button
                type="button"
                onClick={() => toggleWidget(item.key)}
                className={`w-11 h-6 rounded-full transition-colors relative flex items-center p-0.5 ${
                  widgets[item.key] ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    widgets[item.key] ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
