'use client';

import React, { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { TransactionSchema, TransactionInput } from '@/lib/validation/schemas';
import { Category, Account, IncomeSource } from '@/types';
import { X, ArrowDownRight, ArrowUpRight, Loader2 } from 'lucide-react';
import { getCurrentDateStr } from '@/lib/utils/formatters';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  accounts: Account[];
  incomeSources: IncomeSource[];
  onSuccess: () => void;
}

export function AddTransactionModal({
  isOpen,
  onClose,
  categories = [],
  accounts = [],
  incomeSources = [],
  onSuccess,
}: AddTransactionModalProps) {
  const [transactionType, setTransactionType] = useState<'income' | 'expense'>('expense');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<TransactionInput>({
    resolver: zodResolver(TransactionSchema),
    defaultValues: {
      type: 'expense',
      date: getCurrentDateStr(),
      description: '',
      category: '',
      account: accounts[0]?.name || 'GTBank',
      payment_method: 'Transfer',
      notes: '',
    },
  });

  const handleTypeToggle = (type: 'income' | 'expense') => {
    setTransactionType(type);
    setValue('type', type);
    if (type === 'income') {
      const defaultIncomeCat = categories.find((c) => c.type === 'income')?.name || incomeSources[0]?.name || 'Salary';
      setValue('category', defaultIncomeCat);
    } else {
      const defaultExpenseCat = categories.find((c) => c.type === 'expense')?.name || 'Food';
      setValue('category', defaultExpenseCat);
    }
  };

  const onSubmit: SubmitHandler<TransactionInput> = async (data) => {
    setIsSubmitting(true);
    setServerError(null);

    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const resData = await response.json();

      if (!response.ok || !resData.success) {
        throw new Error(resData.message || 'Failed to record transaction');
      }

      reset();
      onSuccess();
      onClose();
    } catch (err: any) {
      setServerError(err?.message || 'Failed to submit transaction');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const filteredCategories = categories.filter(
    (c) => c.type === transactionType || c.type === 'both'
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/80 backdrop-blur-sm p-0 sm:p-4">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-900/50">
          <h2 className="text-lg font-bold text-slate-100">Add New Transaction</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-5 overflow-y-auto space-y-4">
          {/* Income vs Expense Toggle */}
          <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-950 border border-slate-800">
            <button
              type="button"
              onClick={() => handleTypeToggle('expense')}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition ${
                transactionType === 'expense'
                  ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ArrowDownRight className="w-4 h-4" />
              Expense
            </button>
            <button
              type="button"
              onClick={() => handleTypeToggle('income')}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition ${
                transactionType === 'income'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ArrowUpRight className="w-4 h-4" />
              Income
            </button>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Amount (₦) *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-base font-bold text-slate-400">₦</span>
              <input
                type="number"
                step="any"
                placeholder="0.00"
                {...register('amount', { valueAsNumber: true })}
                className="w-full bg-slate-950 text-slate-100 text-lg font-bold pl-8 pr-3 py-2 rounded-xl border border-slate-800 focus:outline-none focus:border-emerald-500"
              />
            </div>
            {errors.amount && (
              <p className="text-xs text-rose-400 mt-1">{errors.amount.message}</p>
            )}
          </div>

          {/* Category / Income Source */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              {transactionType === 'income' ? 'Income Source / Category *' : 'Category *'}
            </label>
            <select
              {...register('category')}
              className="w-full bg-slate-950 text-slate-200 text-sm py-2.5 px-3 rounded-xl border border-slate-800 focus:outline-none focus:border-emerald-500"
            >
              <option value="">Select Category</option>
              {filteredCategories.map((cat) => (
                <option key={cat.id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
              {transactionType === 'income' &&
                incomeSources.map((src) => (
                  <option key={src.id} value={src.name}>
                    {src.name}
                  </option>
                ))}
            </select>
            {errors.category && (
              <p className="text-xs text-rose-400 mt-1">{errors.category.message}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Description *
            </label>
            <input
              type="text"
              placeholder={
                transactionType === 'expense'
                  ? 'e.g. Groceries at Shoprite'
                  : 'e.g. Salary pay check'
              }
              {...register('description')}
              className="w-full bg-slate-950 text-slate-100 text-sm py-2.5 px-3 rounded-xl border border-slate-800 focus:outline-none focus:border-emerald-500"
            />
            {errors.description && (
              <p className="text-xs text-rose-400 mt-1">{errors.description.message}</p>
            )}
          </div>

          {/* Grid Date & Account */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Date *</label>
              <input
                type="date"
                {...register('date')}
                className="w-full bg-slate-950 text-slate-200 text-xs py-2.5 px-3 rounded-xl border border-slate-800 focus:outline-none focus:border-emerald-500"
              />
              {errors.date && (
                <p className="text-xs text-rose-400 mt-1">{errors.date.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Account *</label>
              <select
                {...register('account')}
                className="w-full bg-slate-950 text-slate-200 text-xs py-2.5 px-3 rounded-xl border border-slate-800 focus:outline-none focus:border-emerald-500"
              >
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.name}>
                    {acc.name}
                  </option>
                ))}
              </select>
              {errors.account && (
                <p className="text-xs text-rose-400 mt-1">{errors.account.message}</p>
              )}
            </div>
          </div>

          {/* Payment Method (Expense Only) */}
          {transactionType === 'expense' && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Payment Method
              </label>
              <select
                {...register('payment_method')}
                className="w-full bg-slate-950 text-slate-200 text-xs py-2.5 px-3 rounded-xl border border-slate-800 focus:outline-none focus:border-emerald-500"
              >
                <option value="Transfer">Bank Transfer</option>
                <option value="POS Card">POS / Card</option>
                <option value="Cash">Cash</option>
                <option value="Wallet">Mobile Wallet</option>
                <option value="Other">Other</option>
              </select>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Notes</label>
            <textarea
              rows={2}
              placeholder="Optional notes or references"
              {...register('notes')}
              className="w-full bg-slate-950 text-slate-100 text-xs p-3 rounded-xl border border-slate-800 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {serverError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400">
              {serverError}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-3 rounded-xl font-bold text-sm transition flex items-center justify-center gap-2 ${
              transactionType === 'expense'
                ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-500/20'
                : 'bg-emerald-500 hover:bg-emerald-600 text-slate-950 shadow-lg shadow-emerald-500/20'
            } disabled:opacity-50`}
          >
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {isSubmitting
              ? 'Saving to Google Sheets...'
              : `Add ${transactionType === 'expense' ? 'Expense' : 'Income'}`}
          </button>
        </form>
      </div>
    </div>
  );
}
