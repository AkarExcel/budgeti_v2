'use client';

import React, { useState } from 'react';
import { X, Landmark, Loader2, Plus } from 'lucide-react';

interface AddAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (accountName?: string) => void;
}

export function AddAccountModal({
  isOpen,
  onClose,
  onSuccess,
}: AddAccountModalProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState<'bank' | 'wallet' | 'cash' | 'savings' | 'other'>('bank');
  const [openingBalance, setOpeningBalance] = useState<number | ''>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      setServerError('Account name is required');
      return;
    }

    setIsSubmitting(true);
    setServerError(null);

    try {
      const response = await fetch('/api/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: trimmedName,
          type,
          opening_balance: Number(openingBalance) || 0,
          active: true,
        }),
      });

      const resData = await response.json();

      if (!response.ok || !resData.success) {
        throw new Error(resData.message || 'Failed to create account');
      }

      setName('');
      setType('bank');
      setOpeningBalance('');
      onSuccess(trimmedName);
      onClose();
    } catch (err: any) {
      setServerError(err?.message || 'Failed to create account');
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
            <Landmark className="w-4 h-4 text-emerald-400" />
            <h3 className="text-base font-bold text-slate-100">Add Financial Account</h3>
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
          {/* Account Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Account Name *
            </label>
            <input
              type="text"
              placeholder="e.g. GTBank, OPay, Moniepoint, Cash"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-950 text-slate-100 text-sm py-2.5 px-3 rounded-xl border border-slate-800 focus:outline-none focus:border-emerald-500"
              autoFocus
              required
            />
          </div>

          {/* Account Type */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Account Type *
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as any)}
              className="w-full bg-slate-950 text-slate-200 text-xs py-2.5 px-3 rounded-xl border border-slate-800 focus:outline-none focus:border-emerald-500"
            >
              <option value="bank">Bank Account</option>
              <option value="wallet">Mobile Wallet (OPay/PalmPay)</option>
              <option value="cash">Cash</option>
              <option value="savings">Savings Account</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Opening Balance */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Opening Balance (₦)
            </label>
            <input
              type="number"
              min={0}
              placeholder="0.00"
              value={openingBalance}
              onChange={(e) => setOpeningBalance(parseFloat(e.target.value) || '')}
              className="w-full bg-slate-950 text-slate-100 text-xs py-2.5 px-3 rounded-xl border border-slate-800 focus:outline-none focus:border-emerald-500"
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
                  Save Account
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
