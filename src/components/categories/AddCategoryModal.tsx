'use client';

import React, { useState } from 'react';
import { X, Tag, Loader2, Plus } from 'lucide-react';

interface AddCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  defaultType?: 'income' | 'expense' | 'both';
}

export function AddCategoryModal({
  isOpen,
  onClose,
  onSuccess,
  defaultType = 'expense',
}: AddCategoryModalProps) {
  const [name, setName] = useState('');
  const [categoryType, setCategoryType] = useState<'income' | 'expense' | 'both'>(defaultType);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      setServerError('Category name is required');
      return;
    }

    setIsSubmitting(true);
    setServerError(null);

    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: trimmedName,
          type: categoryType,
          active: true,
        }),
      });

      const resData = await response.json();

      if (!response.ok || !resData.success) {
        throw new Error(resData.message || 'Failed to create category');
      }

      setName('');
      onSuccess();
      onClose();
    } catch (err: any) {
      setServerError(err?.message || 'Failed to create category');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-emerald-400" />
            <h3 className="text-base font-bold text-slate-100">Add New Category</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Category Type Toggle */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Category Applies To *
            </label>
            <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800">
              <button
                type="button"
                onClick={() => setCategoryType('expense')}
                className={`py-2 rounded-lg text-xs font-semibold transition ${
                  categoryType === 'expense'
                    ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Expense
              </button>
              <button
                type="button"
                onClick={() => setCategoryType('income')}
                className={`py-2 rounded-lg text-xs font-semibold transition ${
                  categoryType === 'income'
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Income
              </button>
              <button
                type="button"
                onClick={() => setCategoryType('both')}
                className={`py-2 rounded-lg text-xs font-semibold transition ${
                  categoryType === 'both'
                    ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/20'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Both
              </button>
            </div>
          </div>

          {/* Category Name Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Category Name *
            </label>
            <input
              type="text"
              placeholder="e.g. Subscriptions, Groceries, Freelance"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-950 text-slate-100 text-sm py-2.5 px-3 rounded-xl border border-slate-800 focus:outline-none focus:border-emerald-500"
              autoFocus
              required
            />
          </div>

          {serverError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400">
              {serverError}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-bold transition flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  Save Category
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
