'use client';

import React, { useState } from 'react';
import { Account, Transaction } from '@/types';
import { calculateAccountBalance } from '@/lib/calculations/finance';
import { formatCurrency } from '@/lib/utils/formatters';
import { offlineFetch } from '@/lib/pwa/offlineFetch';
import {
  Wallet,
  Landmark,
  CreditCard,
  Banknote,
  Plus,
  PiggyBank,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';

interface WalletSettingsPageProps {
  accounts: Account[];
  transactions: Transaction[];
  currency?: string;
  onRefreshData?: () => void;
}

export function WalletSettingsPage({
  accounts = [],
  transactions = [],
  currency = 'NGN',
  onRefreshData,
}: WalletSettingsPageProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState<'bank' | 'wallet' | 'cash' | 'savings' | 'other'>('wallet');
  const [openingBalance, setOpeningBalance] = useState<number | ''>('');
  const [isSaving, setIsSaving] = useState(false);

  const totalBalance = accounts.reduce((sum, acc) => {
    return sum + calculateAccountBalance(acc, transactions);
  }, 0);

  const getAccountIcon = (t: string) => {
    switch (t) {
      case 'bank':
        return Landmark;
      case 'wallet':
        return Wallet;
      case 'cash':
        return Banknote;
      case 'savings':
        return PiggyBank;
      default:
        return CreditCard;
    }
  };

  const handleSaveAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSaving(true);
    try {
      const now = new Date().toISOString();
      const optimisticRecord: Account = {
        id: `acc-${Date.now()}`,
        name: name.trim(),
        type,
        opening_balance: Number(openingBalance) || 0,
        active: true,
        created_at: now,
        updated_at: now,
      };

      await offlineFetch('/api/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          type,
          opening_balance: Number(openingBalance) || 0,
          active: true,
        }),
        optimisticRecord,
      });

      setShowAddModal(false);
      setName('');
      setType('wallet');
      setOpeningBalance('');

      if (onRefreshData) onRefreshData();
    } catch (err) {
      console.error('Failed to save account:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* ── Total Balance Hero Card ── */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md shadow-black/25 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold">
            <Wallet className="w-4 h-4 text-emerald-400" />
            <span>Total Wallet Balance</span>
          </div>
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            {accounts.length} Account{accounts.length !== 1 ? 's' : ''}
          </span>
        </div>

        <div>
          <p className="text-3xl font-extrabold text-slate-100 tracking-tight">
            {formatCurrency(totalBalance, currency)}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Real-time balance calculated across all linked accounts and wallets
          </p>
        </div>

        <div className="pt-2">
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="w-full py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Account or Mobile Wallet</span>
          </button>
        </div>
      </div>

      {/* ── Linked Accounts & Wallets List ── */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Linked Wallets & Accounts
          </h4>
          <span className="text-[11px] text-slate-400">
            {accounts.filter((a) => a.active).length} Active
          </span>
        </div>

        {accounts.length === 0 ? (
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-2">
            <Wallet className="w-8 h-8 text-slate-500 mx-auto" />
            <p className="text-sm font-semibold text-slate-300">No accounts configured yet</p>
            <p className="text-xs text-slate-400">
              Add your bank account, mobile wallet (OPay/PalmPay), or cash reserve.
            </p>
          </div>
        ) : (
          <div className="rounded-2xl bg-slate-900 border border-slate-800 shadow-md shadow-black/25 overflow-hidden divide-y divide-slate-800/80">
            {accounts.map((acc) => {
              const liveBalance = calculateAccountBalance(acc, transactions);
              const Icon = getAccountIcon(acc.type);

              return (
                <div
                  key={acc.id}
                  className="p-4 flex items-center justify-between hover:bg-slate-800/40 transition"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                      <Icon className="w-5 h-5 stroke-[1.9]" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-100">{acc.name}</h4>
                        {acc.active && (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                            {acc.type.toUpperCase()}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Opening: {formatCurrency(acc.opening_balance, currency)}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-base font-extrabold text-emerald-400">
                      {formatCurrency(liveBalance, currency)}
                    </p>
                    <span className="text-[10px] text-slate-400 flex items-center justify-end gap-1 mt-0.5">
                      <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                      Live
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Add Account / Mobile Wallet Modal ── */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-100">Add Account or Wallet</h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-200 text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveAccount} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Account / Wallet Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. GTBank, OPay, PalmPay, Cash"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 text-slate-100 text-xs py-2.5 px-3 rounded-xl border border-slate-800 focus:outline-none focus:border-emerald-500"
                  required
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Account Type *
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full bg-slate-950 text-slate-200 text-xs py-2.5 px-3 rounded-xl border border-slate-800 focus:outline-none focus:border-emerald-500"
                >
                  <option value="wallet">Mobile Wallet (OPay, PalmPay, Kuda)</option>
                  <option value="bank">Traditional Bank Account</option>
                  <option value="cash">Cash in Hand / Physical</option>
                  <option value="savings">High-Yield Savings</option>
                  <option value="other">Other Account</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Opening Balance ({currency})
                </label>
                <input
                  type="number"
                  step="any"
                  placeholder="0.00"
                  value={openingBalance}
                  onChange={(e) => setOpeningBalance(parseFloat(e.target.value) || '')}
                  className="w-full bg-slate-950 text-slate-100 text-xs py-2.5 px-3 rounded-xl border border-slate-800 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving || !name.trim()}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-slate-950 text-xs font-bold transition shadow-md shadow-emerald-500/20"
                >
                  {isSaving ? 'Saving...' : 'Save Wallet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
