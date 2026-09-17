'use client';

import React, { useEffect, useState } from 'react';
import { Header } from '@/components/shared/Header';
import { BottomNav } from '@/components/shared/BottomNav';
import { ReportsOverview } from '@/components/reports/ReportsOverview';
import { AddTransactionModal } from '@/components/transactions/AddTransactionModal';
import { getCurrentMonthStr } from '@/lib/utils/formatters';
import { Transaction, Account, Category } from '@/types';
import { Loader2 } from 'lucide-react';

export default function ReportsPage() {
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthStr());
  const [isMock, setIsMock] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/dashboard');
      const json = await res.json();
      if (json.success) {
        setIsMock(json.isMock);
        setTransactions(json.data.transactions || []);
        setAccounts(json.data.accounts || []);
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
            <p className="text-xs font-semibold">Generating Financial Reports...</p>
          </div>
        ) : (
          <ReportsOverview transactions={transactions} accounts={accounts} />
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
