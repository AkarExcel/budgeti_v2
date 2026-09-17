'use client';

import React from 'react';
import { formatCurrency, formatPercentage } from '@/lib/utils/formatters';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  PiggyBank,
  PieChart,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

interface BalanceOverviewCardProps {
  totalBalance: number;
  totalIncome: number;
  totalExpenses: number;
  netCashFlow: number;
  savings: number;
  savingsRate: number;
  monthlyBudget: number;
  budgetSpent: number;
  budgetRemaining: number;
  currency?: string;
}

export function BalanceOverviewCard({
  totalBalance,
  totalIncome,
  totalExpenses,
  netCashFlow,
  savings,
  savingsRate,
  monthlyBudget,
  budgetSpent,
  budgetRemaining,
  currency = 'NGN',
}: BalanceOverviewCardProps) {
  const budgetUsagePct = monthlyBudget > 0 ? Math.round((budgetSpent / monthlyBudget) * 100) : 0;

  return (
    <div className="space-y-3">
      {/* Primary Balance Hero Card */}
      <div className="relative overflow-hidden p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700/60 shadow-xl">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Wallet className="w-3.5 h-3.5 text-emerald-400" /> Current Total Balance
          </span>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-medium border border-emerald-500/20">
            Calculated Live
          </span>
        </div>

        <div className="mt-2 text-3xl font-extrabold text-white tracking-tight">
          {formatCurrency(totalBalance, currency)}
        </div>

        {/* Income vs Expenses quick bar */}
        <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-medium">Total Income</p>
              <p className="text-sm font-bold text-emerald-400">
                {formatCurrency(totalIncome, currency)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <ArrowDownRight className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-medium">Total Expenses</p>
              <p className="text-sm font-bold text-rose-400">
                {formatCurrency(totalExpenses, currency)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Grid of 4 Key Indicators */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {/* Net Cash Flow */}
        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-medium">Net Cash Flow</span>
            {netCashFlow >= 0 ? (
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
            )}
          </div>
          <div
            className={`text-base font-bold mt-1.5 ${
              netCashFlow >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {formatCurrency(netCashFlow, currency)}
          </div>
        </div>

        {/* Savings & Rate */}
        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-medium">Savings ({formatPercentage(savingsRate)})</span>
            <PiggyBank className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <div className="text-base font-bold text-slate-100 mt-1.5">
            {formatCurrency(savings, currency)}
          </div>
        </div>

        {/* Budget Used */}
        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-medium">Budget Used</span>
            <PieChart className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-base font-bold text-slate-100 mt-1.5">
            {formatCurrency(budgetSpent, currency)}
          </div>
        </div>

        {/* Budget Remaining */}
        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-medium">Budget Left</span>
            <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div
            className={`text-base font-bold mt-1.5 ${
              budgetRemaining < 0 ? 'text-rose-400' : 'text-emerald-400'
            }`}
          >
            {formatCurrency(budgetRemaining, currency)}
          </div>
        </div>
      </div>
    </div>
  );
}
