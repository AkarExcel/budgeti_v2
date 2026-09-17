'use client';

import React, { useState } from 'react';
import { Transaction, Category, Account } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils/formatters';
import {
  Search,
  Filter,
  ArrowDownRight,
  ArrowUpRight,
  Trash2,
  Edit2,
  Receipt,
  Plus,
  ArrowUpDown,
} from 'lucide-react';

interface TransactionListProps {
  transactions: Transaction[];
  categories: Category[];
  accounts: Account[];
  onAddTransaction: () => void;
  onEditTransaction: (tx: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
}

export function TransactionList({
  transactions = [],
  categories = [],
  accounts = [],
  onAddTransaction,
  onEditTransaction,
  onDeleteTransaction,
}: TransactionListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [accountFilter, setAccountFilter] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'highest'>('newest');

  // Filtering
  const filtered = transactions.filter((tx) => {
    const matchesSearch =
      tx.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.notes?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = typeFilter === 'all' || tx.type === typeFilter;
    const matchesCategory =
      categoryFilter === 'all' || tx.category.toLowerCase() === categoryFilter.toLowerCase();
    const matchesAccount =
      accountFilter === 'all' || tx.account.toLowerCase() === accountFilter.toLowerCase();

    return matchesSearch && matchesType && matchesCategory && matchesAccount;
  });

  // Sorting
  const sorted = [...filtered].sort((a, b) => {
    if (sortOrder === 'newest') {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    } else if (sortOrder === 'oldest') {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    } else {
      return b.amount - a.amount;
    }
  });

  return (
    <div className="space-y-4">
      {/* Header & Quick Action */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-100">Transactions</h2>
          <p className="text-xs text-slate-400">Manage and track your income & expenses</p>
        </div>
        <button
          onClick={onAddTransaction}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-bold shadow-lg shadow-emerald-500/20 transition active:scale-95"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" /> Add New
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
        <input
          type="text"
          placeholder="Search by description, category, or notes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-slate-900 text-slate-100 text-xs font-medium pl-9 pr-3 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-emerald-500"
        />
      </div>

      {/* Filter Controls Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {/* Type Toggle */}
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as any)}
          className="bg-slate-900 text-slate-200 text-xs font-medium px-2.5 py-2 rounded-xl border border-slate-800 focus:outline-none focus:border-emerald-500"
        >
          <option value="all">All Types</option>
          <option value="income">Income Only</option>
          <option value="expense">Expenses Only</option>
        </select>

        {/* Category Filter */}
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="bg-slate-900 text-slate-200 text-xs font-medium px-2.5 py-2 rounded-xl border border-slate-800 focus:outline-none focus:border-emerald-500"
        >
          <option value="all">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>

        {/* Account Filter */}
        <select
          value={accountFilter}
          onChange={(e) => setAccountFilter(e.target.value)}
          className="bg-slate-900 text-slate-200 text-xs font-medium px-2.5 py-2 rounded-xl border border-slate-800 focus:outline-none focus:border-emerald-500"
        >
          <option value="all">All Accounts</option>
          {accounts.map((a) => (
            <option key={a.id} value={a.name}>
              {a.name}
            </option>
          ))}
        </select>

        {/* Sort Order */}
        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value as any)}
          className="bg-slate-900 text-slate-200 text-xs font-medium px-2.5 py-2 rounded-xl border border-slate-800 focus:outline-none focus:border-emerald-500"
        >
          <option value="newest">Sort: Newest First</option>
          <option value="oldest">Sort: Oldest First</option>
          <option value="highest">Sort: Highest Amount</option>
        </select>
      </div>

      {/* Transactions List */}
      {sorted.length === 0 ? (
        <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center">
          <Receipt className="w-10 h-10 text-slate-600 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-200">No matching transactions</h3>
          <p className="text-xs text-slate-400 mt-1">
            Try adjusting your search query or filter selection.
          </p>
        </div>
      ) : (
        <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden divide-y divide-slate-800/60">
          {sorted.map((tx) => (
            <div
              key={tx.id}
              className="p-4 flex items-center justify-between hover:bg-slate-800/40 transition group"
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                    tx.type === 'income'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  }`}
                >
                  {tx.type === 'income' ? (
                    <ArrowUpRight className="w-5 h-5 stroke-[2.5]" />
                  ) : (
                    <ArrowDownRight className="w-5 h-5 stroke-[2.5]" />
                  )}
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-100">{tx.description}</h4>
                  <div className="flex flex-wrap items-center gap-1.5 mt-1 text-[11px] text-slate-400">
                    <span className="font-semibold text-slate-300 bg-slate-800/80 px-2 py-0.5 rounded">
                      {tx.category}
                    </span>
                    <span>•</span>
                    <span>{formatDate(tx.date)}</span>
                    <span>•</span>
                    <span className="text-slate-300 font-medium">{tx.account}</span>
                    {tx.payment_method && (
                      <>
                        <span>•</span>
                        <span className="text-slate-400">{tx.payment_method}</span>
                      </>
                    )}
                  </div>
                  {tx.notes && (
                    <p className="text-[10px] text-slate-400 italic mt-1">{tx.notes}</p>
                  )}
                </div>
              </div>

              <div className="flex flex-col items-end gap-2 shrink-0">
                <span
                  className={`text-sm font-extrabold ${
                    tx.type === 'income' ? 'text-emerald-400' : 'text-slate-100'
                  }`}
                >
                  {tx.type === 'income' ? '+' : '-'} {formatCurrency(tx.amount)}
                </span>

                <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition">
                  <button
                    onClick={() => onEditTransaction(tx)}
                    className="p-1 rounded text-slate-400 hover:text-emerald-400 hover:bg-slate-800"
                    title="Edit transaction"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDeleteTransaction(tx.id)}
                    className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-800"
                    title="Delete transaction"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
