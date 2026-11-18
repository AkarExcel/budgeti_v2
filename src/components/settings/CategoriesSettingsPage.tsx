'use client';

import React from 'react';
import { Category } from '@/types';
import { Tag, Plus } from 'lucide-react';

interface CategoriesSettingsPageProps {
  categories: Category[];
  onOpenAddCategory: () => void;
}

export function CategoriesSettingsPage({
  categories = [],
  onOpenAddCategory,
}: CategoriesSettingsPageProps) {
  const expenseCategories = categories.filter((c) => c.type === 'expense' || c.type === 'both');
  const incomeCategories = categories.filter((c) => c.type === 'income' || c.type === 'both');

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-400">
          Manage transaction categories ({categories.length} total active categories).
        </p>
        <button
          onClick={onOpenAddCategory}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-bold shadow-md shadow-emerald-500/20 transition active:scale-95"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" /> Add Category
        </button>
      </div>

      {/* Expense Categories */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <Tag className="w-3.5 h-3.5 text-rose-400" /> Expense Categories ({expenseCategories.length})
        </h4>
        <div className="flex flex-wrap gap-2 pt-1">
          {expenseCategories.map((cat) => (
            <div
              key={cat.id}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs"
            >
              <span className="font-semibold text-slate-200">{cat.name}</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">
                Expense
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Income Categories */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <Tag className="w-3.5 h-3.5 text-emerald-400" /> Income Categories ({incomeCategories.length})
        </h4>
        <div className="flex flex-wrap gap-2 pt-1">
          {incomeCategories.map((cat) => (
            <div
              key={cat.id}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs"
            >
              <span className="font-semibold text-slate-200">{cat.name}</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Income
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
