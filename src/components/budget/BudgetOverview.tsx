'use client';

import React, { useState } from 'react';
import { Budget, Category, Transaction } from '@/types';
import {
  calculateBudgetSpent,
  calculateBudgetPercentage,
  calculateBudgetRemaining,
} from '@/lib/calculations/finance';
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
          <p className="text-xs text-slate-400">
            Set spending limits per category for {selectedMonth}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <CopyBudgetButton
            budgets={budgets}
            selectedMonth={selectedMonth}
            onSaveBudget={onSaveBudget}
            onRefreshData={onRefreshData}
          />
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-bold shadow-lg shadow-emerald-500/20 transition active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" /> Set Category Budget
          </button>
        </div>
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
                  <span className="text-slate-400">
                    Budget:{' '}
                    <strong className="text-slate-200">{formatCurrency(b.budget_amount)}</strong>
                  </span>
                  <span className="text-slate-400">
                    Spent:{' '}
                    <strong className={isExceeded ? 'text-rose-400' : 'text-emerald-400'}>
                      {formatCurrency(spent)}
                    </strong>
                  </span>
                </div>

                <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      isExceeded ? 'bg-rose-500' : pct >= 80 ? 'bg-amber-400' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, pct)}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] font-medium pt-1">
                  <span
                    className={
                      isExceeded ? 'text-rose-400 flex items-center gap-1 font-bold' : 'text-slate-400'
                    }
                  >
                    {isExceeded ? (
                      <>
                        <AlertTriangle className="w-3.5 h-3.5" /> Exceeded by{' '}
                        {formatCurrency(Math.abs(remaining))}
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
                  {categories
                    .filter((c) => c.type === 'expense' || c.type === 'both')
                    .map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Monthly Budget Amount
                </label>
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

// -- Copy Budget Button + Modal --

interface CopyBudgetButtonProps {
  budgets: Budget[];
  selectedMonth: string;
  onSaveBudget: (budget: { month: string; category: string; budget_amount: number }) => Promise<void>;
  onRefreshData?: () => void;
}

type CopyStep = 'pick' | 'copying' | 'done';

function CopyBudgetButton({
  budgets,
  selectedMonth,
  onSaveBudget,
  onRefreshData,
}: CopyBudgetButtonProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<CopyStep>('pick');
  const [sourceMonth, setSourceMonth] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [copiedCount, setCopiedCount] = useState(0);
  const [skippedCount, setSkippedCount] = useState(0);

  const availableMonths = Array.from(
    new Set(budgets.filter((b) => b.month !== selectedMonth).map((b) => b.month))
  ).sort((a, b) => b.localeCompare(a));

  const sourceBudgets = budgets.filter((b) => b.month === sourceMonth);
  const existingCategories = new Set(
    budgets.filter((b) => b.month === selectedMonth).map((b) => b.category)
  );
  // items that CAN be copied (not already in target month)
  const copyable = sourceBudgets.filter((b) => !existingCategories.has(b.category));
  // items selected by the user that will actually be copied
  const toAdd = copyable.filter((b) => selected.has(b.id));
  const skipped = sourceBudgets.filter((b) => existingCategories.has(b.category));

  function formatMonthLabel(m: string) {
    if (!m) return '';
    const [y, mo] = m.split('-');
    const date = new Date(Number(y), Number(mo) - 1, 1);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }

  function handleOpen() {
    setStep('pick');
    setSourceMonth('');
    setSelected(new Set());
    setCopiedCount(0);
    setSkippedCount(0);
    setOpen(true);
  }

  function handleSourceChange(month: string) {
    setSourceMonth(month);
    // Auto-select all copyable items for the new month
    const newCopyable = budgets.filter(
      (b) => b.month === month && !existingCategories.has(b.category)
    );
    setSelected(new Set(newCopyable.map((b) => b.id)));
  }

  function toggleItem(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function toggleAll() {
    if (selected.size === copyable.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(copyable.map((b) => b.id)));
    }
  }

  async function handleCopy() {
    if (toAdd.length === 0) return;
    setStep('copying');
    let copied = 0;
    for (const b of toAdd) {
      await onSaveBudget({
        month: selectedMonth,
        category: b.category,
        budget_amount: b.budget_amount,
      });
      copied++;
    }
    setCopiedCount(copied);
    setSkippedCount(skipped.length + (copyable.length - toAdd.length));
    setStep('done');
    if (onRefreshData) onRefreshData();
  }

  if (availableMonths.length === 0) return null;

  const allSelected = copyable.length > 0 && selected.size === copyable.length;
  const someSelected = selected.size > 0 && selected.size < copyable.length;

  return (
    <>
      <button
        id="copy-budget-month-btn"
        onClick={handleOpen}
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition active:scale-95"
        title="Copy budgets from another month"
      >
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="9" y="9" width="13" height="13" rx="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
        Copy Month
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">

            {/* Header */}
            <div className="px-5 pt-5 pb-4 border-b border-slate-800">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg style={{ width: 18, height: 18, color: '#818cf8' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-100">Copy Budget</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Copy selected budgets into{' '}
                    <span className="text-indigo-400 font-semibold">{formatMonthLabel(selectedMonth)}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="p-5 space-y-4">
              {step === 'pick' && (
                <>
                  {/* Month picker */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Copy from month</label>
                    <select
                      value={sourceMonth}
                      onChange={(e) => handleSourceChange(e.target.value)}
                      className="w-full bg-slate-950 text-slate-200 text-xs py-2.5 px-3 rounded-xl border border-slate-800 focus:outline-none focus:border-indigo-500 transition"
                    >
                      <option value="">Select a month…</option>
                      {availableMonths.map((m) => (
                        <option key={m} value={m}>{formatMonthLabel(m)}</option>
                      ))}
                    </select>
                  </div>

                  {/* Preview list with checkboxes */}
                  {sourceMonth && sourceBudgets.length > 0 && (
                    <div className="space-y-2">
                      {/* Select-all row */}
                      {copyable.length > 0 && (
                        <div className="flex items-center justify-between">
                          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                            {sourceBudgets.length} budget{sourceBudgets.length !== 1 ? 's' : ''} in {formatMonthLabel(sourceMonth)}
                          </p>
                          <button
                            type="button"
                            onClick={toggleAll}
                            className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 transition"
                          >
                            {allSelected ? 'Deselect all' : 'Select all'}
                          </button>
                        </div>
                      )}

                      <div className="max-h-56 overflow-y-auto rounded-xl border border-slate-800 divide-y divide-slate-800">
                        {sourceBudgets.map((b) => {
                          const isExisting = existingCategories.has(b.category);
                          const isChecked = selected.has(b.id);

                          return (
                            <label
                              key={b.id}
                              className={`flex items-center gap-3 px-3 py-2.5 text-xs cursor-pointer select-none transition-colors ${
                                isExisting
                                  ? 'opacity-40 cursor-not-allowed'
                                  : isChecked
                                  ? 'bg-indigo-500/8 hover:bg-indigo-500/12'
                                  : 'hover:bg-slate-800/60'
                              }`}
                            >
                              {/* Checkbox */}
                              <span className="relative flex-shrink-0">
                                <input
                                  type="checkbox"
                                  className="sr-only"
                                  disabled={isExisting}
                                  checked={isChecked}
                                  onChange={() => !isExisting && toggleItem(b.id)}
                                />
                                <span
                                  className={`w-4 h-4 rounded flex items-center justify-center border transition-colors ${
                                    isExisting
                                      ? 'border-slate-700 bg-slate-800'
                                      : isChecked
                                      ? 'border-indigo-500 bg-indigo-500'
                                      : 'border-slate-600 bg-slate-950'
                                  }`}
                                >
                                  {isChecked && !isExisting && (
                                    <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5">
                                      <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                  )}
                                </span>
                              </span>

                              {/* Category name */}
                              <span className={`flex-1 font-medium ${isExisting ? 'text-slate-500' : 'text-slate-200'}`}>
                                {b.category}
                                {isExisting && (
                                  <span className="ml-1.5 text-amber-500/80 text-[10px] font-semibold">already set</span>
                                )}
                              </span>

                              {/* Amount */}
                              <span className={`font-semibold tabular-nums ${isExisting ? 'text-slate-600' : 'text-slate-400'}`}>
                                {formatCurrency(b.budget_amount)}
                              </span>
                            </label>
                          );
                        })}
                      </div>

                      {/* Footer info */}
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-500">
                          {selected.size} of {copyable.length} selected
                        </span>
                        {skipped.length > 0 && (
                          <span className="text-amber-500/80">
                            {skipped.length} already set — skipped
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {sourceMonth && sourceBudgets.length === 0 && (
                    <p className="text-xs text-slate-400 text-center py-3">
                      No budgets found for {formatMonthLabel(sourceMonth)}.
                    </p>
                  )}
                </>
              )}

              {step === 'copying' && (
                <div className="flex flex-col items-center gap-3 py-8">
                  <div className="w-10 h-10 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
                  <p className="text-sm text-slate-300 font-semibold">Copying {toAdd.length} budget{toAdd.length !== 1 ? 's' : ''}…</p>
                </div>
              )}

              {step === 'done' && (
                <div className="flex flex-col items-center gap-3 py-8 text-center">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-100">Done!</p>
                    <p className="text-xs text-slate-400 mt-1">
                      <span className="text-emerald-400 font-semibold">{copiedCount}</span> budget{copiedCount !== 1 ? 's' : ''} copied
                      {skippedCount > 0 && (
                        <>, <span className="text-amber-400 font-semibold">{skippedCount}</span> skipped</>
                      )}.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer buttons */}
            <div className="px-5 pb-5 flex gap-2">
              <button
                onClick={() => setOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 transition"
              >
                {step === 'done' ? 'Close' : 'Cancel'}
              </button>

              {step === 'pick' && (
                <button
                  onClick={handleCopy}
                  disabled={toAdd.length === 0}
                  className="flex-1 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold transition active:scale-95"
                >
                  {toAdd.length > 0
                    ? `Copy ${toAdd.length} Budget${toAdd.length !== 1 ? 's' : ''}`
                    : 'Select budgets'}
                </button>
              )}
            </div>

          </div>
        </div>
      )}
    </>
  );
}
