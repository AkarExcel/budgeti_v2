'use client';

import React from 'react';
import Link from 'next/link';
import { FinancialGoal } from '@/types';
import { formatCurrency, formatPercentage } from '@/lib/utils/formatters';
import { Target, ChevronRight, CheckCircle2 } from 'lucide-react';

interface GoalsProgressWidgetProps {
  goals: FinancialGoal[];
  onUpdateGoal?: (goal: FinancialGoal) => void;
}

export function GoalsProgressWidget({ goals = [] }: GoalsProgressWidgetProps) {
  if (goals.length === 0) {
    return (
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 text-center">
        <Target className="w-8 h-8 text-slate-600 mx-auto mb-2" />
        <h3 className="text-xs font-bold text-slate-300">No financial goals yet</h3>
        <p className="text-[11px] text-slate-400 mt-1">
          Set goals like Emergency Fund, New Laptop, or Land Investment.
        </p>
        <Link
          href="/goals"
          className="inline-block mt-3 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20 hover:bg-emerald-500/20 transition"
        >
          Add Financial Goal
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-200">Financial Goals Progress</h3>
        <Link
          href="/goals"
          className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-0.5"
        >
          View All <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {goals.map((g) => {
          const pct = Math.min(
            100,
            Math.round((g.current_amount / (g.target_amount || 1)) * 100)
          );
          const isCompleted = g.status === 'completed' || pct >= 100;

          return (
            <div
              key={g.id}
              className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-100 flex items-center gap-1">
                    {g.name}
                    {isCompleted && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                  </h4>
                  <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                    {formatPercentage(pct)}
                  </span>
                </div>
                <p className="text-xs font-semibold text-slate-300 mt-1">
                  {formatCurrency(g.current_amount)}{' '}
                  <span className="text-[10px] text-slate-400 font-normal">
                    / {formatCurrency(g.target_amount)}
                  </span>
                </p>
              </div>

              <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden mt-3">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    isCompleted ? 'bg-emerald-400' : 'bg-indigo-500'
                  }`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
