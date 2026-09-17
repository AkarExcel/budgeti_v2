'use client';

import React from 'react';
import Link from 'next/link';
import { Transaction } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils/formatters';
import { ArrowDownRight, ArrowUpRight, ChevronRight, Receipt } from 'lucide-react';

interface RecentTransactionsProps {
  transactions: Transaction[];
  onSelectTransaction?: (tx: Transaction) => void;
}

export function RecentTransactions({
  transactions,
  onSelectTransaction,
}: RecentTransactionsProps) {
  const recent = transactions.slice(0, 5);

  if (recent.length === 0) {
    return (
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 text-center">
        <Receipt className="w-10 h-10 text-slate-600 mx-auto mb-2" />
        <h3 className="text-sm font-bold text-slate-200">No transactions yet</h3>
        <p className="text-xs text-slate-400 mt-1">
          Add your first income or expense to start tracking your finances.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900/50">
        <h3 className="text-sm font-bold text-slate-200">Recent Transactions</h3>
        <Link
          href="/transactions"
          className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-0.5"
        >
          View All <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="divide-y divide-slate-800/60">
        {recent.map((tx) => (
          <div
            key={tx.id}
            onClick={() => onSelectTransaction && onSelectTransaction(tx)}
            className="flex items-center justify-between p-3.5 hover:bg-slate-800/40 transition cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                  tx.type === 'income'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                }`}
              >
                {tx.type === 'income' ? (
                  <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
                ) : (
                  <ArrowDownRight className="w-4 h-4 stroke-[2.5]" />
                )}
              </div>
              <div>
                <p className="text-xs font-bold text-slate-100 line-clamp-1">
                  {tx.description || tx.category}
                </p>
                <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-400">
                  <span className="font-medium text-slate-300">{tx.category}</span>
                  <span>•</span>
                  <span>{formatDate(tx.date)}</span>
                  <span>•</span>
                  <span className="bg-slate-800 px-1.5 py-0.5 rounded text-slate-300">
                    {tx.account}
                  </span>
                </div>
              </div>
            </div>

            <div className="text-right">
              <p
                className={`text-xs font-bold ${
                  tx.type === 'income' ? 'text-emerald-400' : 'text-slate-100'
                }`}
              >
                {tx.type === 'income' ? '+' : '-'} {formatCurrency(tx.amount)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
