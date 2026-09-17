'use client';

import React, { useState } from 'react';
import { Transaction, Account } from '@/types';
import {
  calculateCategorySpending,
  calculateIncomeBySource,
  calculateMonthlyTotals,
  calculateAccountBalance,
} from '@/lib/calculations/finance';
import { formatCurrency } from '@/lib/utils/formatters';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart as RePieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { BarChart3, PieChart, TrendingUp, Wallet } from 'lucide-react';

interface ReportsOverviewProps {
  transactions: Transaction[];
  accounts: Account[];
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#64748b'];

export function ReportsOverview({ transactions = [], accounts = [] }: ReportsOverviewProps) {
  const [timeframe, setTimeframe] = useState<'this_month' | 'last_month' | 'this_year' | 'all'>('this_year');

  const filteredTransactions = transactions.filter((tx) => {
    if (timeframe === 'all') return true;
    const now = new Date();
    const txDate = new Date(tx.date);

    if (timeframe === 'this_month') {
      return (
        txDate.getMonth() === now.getMonth() && txDate.getFullYear() === now.getFullYear()
      );
    } else if (timeframe === 'last_month') {
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      return (
        txDate.getMonth() === lastMonth.getMonth() &&
        txDate.getFullYear() === lastMonth.getFullYear()
      );
    } else if (timeframe === 'this_year') {
      return txDate.getFullYear() === now.getFullYear();
    }
    return true;
  });

  const categorySpending = calculateCategorySpending(filteredTransactions);
  const incomeSources = calculateIncomeBySource(filteredTransactions);
  const monthlyTotals = calculateMonthlyTotals(filteredTransactions);

  const accountBalances = accounts.map((acc) => ({
    name: acc.name,
    balance: calculateAccountBalance(acc, transactions),
  }));

  return (
    <div className="space-y-4">
      {/* Header & Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-100">Financial Reports</h2>
          <p className="text-xs text-slate-400">Visual breakdown of income, expenses & trends</p>
        </div>

        {/* Timeframe selector */}
        <select
          value={timeframe}
          onChange={(e) => setTimeframe(e.target.value as any)}
          className="bg-slate-900 text-slate-200 text-xs font-semibold px-3 py-2 rounded-xl border border-slate-800 focus:outline-none focus:border-emerald-500 cursor-pointer"
        >
          <option value="this_month">This Month</option>
          <option value="last_month">Last Month</option>
          <option value="this_year">This Year</option>
          <option value="all">All Time</option>
        </select>
      </div>

      {/* Income vs Expenses Monthly Trend Bar Chart */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-1.5">
            <BarChart3 className="w-4 h-4 text-emerald-400" /> Income vs Expenses Trend
          </h3>
        </div>

        <div className="h-64 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyTotals} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="month" stroke="#64748b" fontSize={10} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                formatter={(val: any) => [formatCurrency(Number(val)), '']}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
              <Bar dataKey="income" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expense" name="Expenses" fill="#f43f5e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grid: Category Spending Pie & Income Sources */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Spending by Category */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-1.5">
            <PieChart className="w-4 h-4 text-amber-400" /> Spending by Category
          </h3>

          {categorySpending.length === 0 ? (
            <p className="text-xs text-slate-400 py-8 text-center">No expense data found</p>
          ) : (
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie
                    data={categorySpending}
                    dataKey="amount"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    outerRadius={70}
                    innerRadius={35}
                    paddingAngle={3}
                  >
                    {categorySpending.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                    formatter={(val: any) => [formatCurrency(Number(val)), 'Amount']}
                  />
                  <Legend wrapperStyle={{ fontSize: '10px' }} />
                </RePieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Income by Source */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-emerald-400" /> Income by Source
          </h3>

          {incomeSources.length === 0 ? (
            <p className="text-xs text-slate-400 py-8 text-center">No income data found</p>
          ) : (
            <div className="space-y-3 pt-2">
              {incomeSources.map((src, i) => (
                <div key={src.source} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-200">{src.source}</span>
                    <span className="text-emerald-400">{formatCurrency(src.amount)}</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${src.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Account Balances Breakdown */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
        <h3 className="text-sm font-bold text-slate-200 flex items-center gap-1.5">
          <Wallet className="w-4 h-4 text-indigo-400" /> Account Balances Overview
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {accountBalances.map((acc) => (
            <div key={acc.name} className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <p className="text-[11px] font-semibold text-slate-400">{acc.name}</p>
              <p className="text-sm font-bold text-slate-100 mt-1">{formatCurrency(acc.balance)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
