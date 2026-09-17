'use client';

import React, { useEffect, useState } from 'react';
import { Header } from '@/components/shared/Header';
import { BottomNav } from '@/components/shared/BottomNav';
import { AccountsOverview } from '@/components/accounts/AccountsOverview';
import { AddTransactionModal } from '@/components/transactions/AddTransactionModal';
import { getCurrentMonthStr } from '@/lib/utils/formatters';
import { Account, Transaction, Category } from '@/types';
import { Loader2 } from 'lucide-react';

export default function AccountsPage() {
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthStr());
  const [isMock, setIsMock] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/dashboard');
      const json = await res.json();
      if (json.success) {
        setIsMock(json.isMock);
        setAccounts(json.data.accounts || []);
        setTransactions(json.data.transactions || []);
        setCategories(json.data.categories || []);
        setLastSyncedAt(new Date().toISOString());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSaveAccount = async (data: any) => {
    await fetch('/api/accounts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    fetchData();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-24">
      <Header
        selectedMonth={selectedMonth}
        onMonthChange={setSelectedMonth}
        lastSyncedAt={lastSyncedAt}
        isMock={isMock}
        onSyncComplete={fetchData}
      />

      <main className="max-w-md mx-auto sm:max-w-lg md:max-w-2xl lg:max-w-4xl p-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
            <p className="text-xs font-semibold">Loading Financial Accounts...</p>
          </div>
        ) : (
          <AccountsOverview
            accounts={accounts}
            transactions={transactions}
            onSaveAccount={handleSaveAccount}
          />
        )}
      </main>

      <BottomNav onOpenAddModal={() => setIsAddModalOpen(true)} />

      <AddTransactionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        categories={categories}
        accounts={accounts}
        incomeSources={[]}
        onSuccess={fetchData}
      />
    </div>
  );
}
