'use client';

import React, { useState } from 'react';
import { Account, Transaction } from '@/types';
import { calculateAccountBalance } from '@/lib/calculations/finance';
import { formatCurrency } from '@/lib/utils/formatters';
import { Plus, Wallet, Landmark, CreditCard, Banknote } from 'lucide-react';

interface AccountsOverviewProps {
  accounts: Account[];
  transactions: Transaction[];
  onSaveAccount: (account: { name: string; type: any; opening_balance: number; active: boolean }) => Promise<void>;
}

export function AccountsOverview({
  accounts = [],
  transactions = [],
  onSaveAccount,
}: AccountsOverviewProps) {
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState<any>('bank');
  const [openingBalance, setOpeningBalance] = useState<number | ''>('');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    try {
      await onSaveAccount({
        name,
        type,
        opening_balance: Number(openingBalance) || 0,
        active: true,
      });
      setShowModal(false);
      setName('');
      setType('bank');
      setOpeningBalance('');
    } catch (err) {
      console.error(err);
    }
  };

  const getAccountIcon = (t: string) => {
    switch (t) {
      case 'bank':
        return Landmark;
      case 'wallet':
        return CreditCard;
      case 'cash':
        return Banknote;
      default:
        return Wallet;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-100">Financial Accounts</h2>
          <p className="text-xs text-slate-400">Manage bank accounts, mobile wallets & cash</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-bold shadow-lg shadow-emerald-500/20 transition active:scale-95"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" /> Add Account
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {accounts.map((acc) => {
          const liveBalance = calculateAccountBalance(acc, transactions);
          const Icon = getAccountIcon(acc.type);

          return (
            <div
              key={acc.id}
              className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-100">{acc.name}</h3>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">
                      {acc.type}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                  Active
                </span>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-baseline justify-between">
                <div>
                  <p className="text-[10px] text-slate-400">Live Calculated Balance</p>
                  <p className="text-lg font-extrabold text-emerald-400">
                    {formatCurrency(liveBalance)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-400">Opening Balance</p>
                  <p className="text-xs font-semibold text-slate-300">
                    {formatCurrency(acc.opening_balance)}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Account Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-base font-bold text-slate-100">Add Financial Account</h3>
            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Account Name *</label>
                <input
                  type="text"
                  placeholder="e.g. GTBank, OPay, Moniepoint, Cash"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 text-slate-100 text-xs py-2.5 px-3 rounded-xl border border-slate-800 focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Account Type *</label>
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

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Opening Balance (₦)</label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={openingBalance}
                  onChange={(e) => setOpeningBalance(parseFloat(e.target.value) || '')}
                  className="w-full bg-slate-950 text-slate-100 text-xs py-2.5 px-3 rounded-xl border border-slate-800 focus:outline-none focus:border-emerald-500"
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
                  className="flex-1 py-2.5 rounded-xl bg-emerald-500 text-slate-950 text-xs font-bold hover:bg-emerald-600"
                >
                  Save Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
