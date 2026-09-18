'use client';

import React, { useState } from 'react';
import { Budget, Category, Transaction } from '@/types';
import { calculateBudgetSpent, calculateBudgetPercentage, calculateBudgetRemaining } from '@/lib/calculations/finance';
import { formatCurrency } from '@/lib/utils/formatters';
import { Plus, AlertTriangle, CheckCircle2, Trash2 } from 'lucide-react';
import { AddCategoryModal } from '@/components/categories/AddCategoryModal';

interface BudgetOverviewProps {
  budgets: Budget[];
  categories: Category[];
  transactions: Transaction[];
  selectedMonth: string;
  onSaveBudget: (budget: { month: string; category: string; budget_amount: number }) => Promise<void>;
  onDeleteBudget: (id: string) => Promise<void>;
  onRefreshData?: () => void;
}

export function BudgetOverview({
  budgets = [],
  categories = [],
  transactions = [],
  selectedMonth,
  onSaveBudget,
  onDeleteBudget,
  onRefreshData,
}: BudgetOverviewProps) {
  const [showModal, setShowModal] = useState(false);
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState<number | ''>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  const currentBudgets = budgets.filter((b) => b.month === selectedMonth);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category || !amount || amount <= 0) return;
    setIsSubmitting(true);
    try {
      await onSaveBudget({
        month: selectedMonth,
        category,
        budget_amount: Number(amount),
      });
      setShowModal(false);
      setCategory('');
      setAmount('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-100">Monthly Budget</h2>
          <p className="text-xs text-slate-400">Set spending limits per category for {selectedMonth}</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-bold shadow-lg shadow-emerald-500/20 transition active:scale-95"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" /> Set Category Budget
        </button>
      </div>

      {currentBudgets.length === 0 ? (
        <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-2">
          <p className="text-sm font-bold text-slate-200">No budget created for this month</p>
          <p className="text-xs text-slate-400">
            Click &quot;Set Category Budget&quot; to define monthly spending targets.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {currentBudgets.map((b) => {
            const spent = calculateBudgetSpent(b.category, selectedMonth, transactions);
            const remaining = calculateBudgetRemaining(b.budget_amount, spent);
            const pct = calculateBudgetPercentage(spent, b.budget_amount);
            const isExceeded = spent > b.budget_amount;

            return (
              <div
                key={b.id}
                className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 relative group"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-100">{b.category}</h3>
                  <button
                    onClick={() => onDeleteBudget(b.id)}
                    className="text-slate-500 hover:text-rose-400 p-1 rounded opacity-80 group-hover:opacity-100 transition"
                    title="Delete budget"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-baseline justify-between text-xs">
                  <span className="text-slate-400">Budget: <strong className="text-slate-200">{formatCurrency(b.budget_amount)}</strong></span>
                  <span className="text-slate-400">Spent: <strong className={isExceeded ? 'text-rose-400' : 'text-emerald-400'}>{formatCurrency(spent)}</strong></span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      isExceeded ? 'bg-rose-500' : pct >= 80 ? 'bg-amber-400' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, pct)}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] font-medium pt-1">
                  <span className={isExceeded ? 'text-rose-400 flex items-center gap-1 font-bold' : 'text-slate-400'}>
                    {isExceeded ? (
                      <>
                        <AlertTriangle className="w-3.5 h-3.5" /> Exceeded by {formatCurrency(Math.abs(remaining))}
                      </>
                    ) : (
                      `Remaining: ${formatCurrency(remaining)}`
                    )}
                  </span>
                  <span className="text-slate-400">{pct}% Used</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Set Budget Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-base font-bold text-slate-100">Set Category Budget</h3>
            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-300">Category</label>
                  <button
                    type="button"
                    onClick={() => setIsCategoryModalOpen(true)}
                    className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    New Category
                  </button>
                </div>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-950 text-slate-200 text-xs py-2.5 px-3 rounded-xl border border-slate-800 focus:outline-none focus:border-emerald-500"
                  required
                >
                  <option value="">Select Category</option>
                  {categories.filter((c) => c.type === 'expense' || c.type === 'both').map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Monthly Budget Amount (₦)</label>
                <input
                  type="number"
                  placeholder="e.g. 80000"
                  value={amount}
                  onChange={(e) => setAmount(parseFloat(e.target.value) || '')}
                  className="w-full bg-slate-950 text-slate-100 text-sm py-2.5 px-3 rounded-xl border border-slate-800 focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-500 text-slate-950 text-xs font-bold hover:bg-emerald-600 disabled:opacity-50"
                >
                  Save Budget
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <AddCategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        defaultType="expense"
        onSuccess={() => {
          if (onRefreshData) onRefreshData();
        }}
      />
    </div>
  );
}
