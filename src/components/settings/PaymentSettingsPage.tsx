'use client';

import React from 'react';
import { UserSettings } from '@/types';
import { Landmark, Wallet, CreditCard, Banknote, ChevronRight } from 'lucide-react';

interface PaymentSettingsPageProps {
  settings: UserSettings;
  onOpenWallet?: () => void;
}

export function PaymentSettingsPage({ settings, onOpenWallet }: PaymentSettingsPageProps) {
  return (
    <div className="space-y-4">
      {/* Defaults Card */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md shadow-black/25 space-y-3.5 text-slate-100">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Payment Defaults
        </h4>

        <div className="space-y-2.5">
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                <Landmark className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs text-slate-400">Default Currency</p>
                <p className="text-sm font-bold text-slate-100">
                  {settings.currency} (Nigerian Naira ₦)
                </p>
              </div>
            </div>
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Active
            </span>
          </div>

          <div
            onClick={onOpenWallet}
            className={`p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between ${
              onOpenWallet ? 'cursor-pointer hover:bg-slate-800/40 active:scale-98 transition' : ''
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                <Wallet className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs text-slate-400">Primary Payment Account</p>
                <p className="text-sm font-bold text-slate-100">
                  {settings.default_account || 'GTBank'}
                </p>
              </div>
            </div>
            {onOpenWallet && (
              <div className="flex items-center gap-1 text-xs text-emerald-400 font-semibold">
                <span>Manage</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Supported Payment Channels */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md shadow-black/25 space-y-3.5 text-slate-100">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Enabled Payment Methods
        </h4>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-2.5">
            <CreditCard className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold text-slate-200">POS / Debit Card</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-2.5">
            <Banknote className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold text-slate-200">Bank Transfer</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-2.5">
            <Wallet className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold text-slate-200">Mobile Wallet</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-2.5">
            <Landmark className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold text-slate-200">Cash</span>
          </div>
        </div>
      </div>
    </div>
  );
}
