'use client';

import React from 'react';
import Link from 'next/link';
import { Budget, Transaction } from '@/types';
import { calculateBudgetSpent, calculateBudgetPercentage } from '@/lib/calculations/finance';
import { formatCurrency } from '@/lib/utils/formatters';
import { ChevronRight, AlertTriangle, PieChart } from 'lucide-react';

interface BudgetProgressWidgetProps {
  budgets: Budget[];
  transactions: Transaction[];
  month: string;
}

export function BudgetProgressWidget({
  budgets = [],
  transactions = [],
  month,
}: BudgetProgressWidgetProps) {
  const currentBudgets = budgets.filter((b) => b.month === month);

  if (currentBudgets.length === 0) {
    return (
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 text-center">
        <PieChart className="w-8 h-8 text-slate-600 mx-auto mb-2" />
        <h3 className="text-xs font-bold text-slate-300">No budget created for this month</h3>
        <p className="text-[11px] text-slate-400 mt-1">
          Set category budgets to track and limit your monthly spending.
        </p>
        <Link
          href="/budget"
          className="inline-block mt-3 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20 hover:bg-emerald-500/20 transition"
        >
          Create Monthly Budget
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-200">Budget Progress</h3>
        <Link
          href="/budget"
          className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-0.5"
        >
          Manage <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="space-y-3">
        {currentBudgets.map((b) => {
          const spent = calculateBudgetSpent(b.category, month, transactions);
          const pct = calculateBudgetPercentage(spent, b.budget_amount);
          const isExceeded = spent > b.budget_amount;

          return (
            <div key={b.id} className="space-y-1">
              <div className="flex items-center justify-between text-xs font-medium">
                <span className="text-slate-200 flex items-center gap-1.5 font-semibold">
                  {b.category}
                  {isExceeded && (
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center gap-0.5">
                      <AlertTriangle className="w-2.5 h-2.5" /> Exceeded
                    </span>
                  )}
                </span>
                <span className="text-slate-400">
                  <strong className={isExceeded ? 'text-rose-400' : 'text-slate-100'}>
                    {formatCurrency(spent)}
                  </strong>{' '}
                  / {formatCurrency(b.budget_amount)} ({pct}%)
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    isExceeded
                      ? 'bg-rose-500'
                      : pct >= 80
                      ? 'bg-amber-400'
                      : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(100, pct)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
