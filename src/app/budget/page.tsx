'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Header } from '@/components/shared/Header';
import { BottomNav } from '@/components/shared/BottomNav';
import { BudgetOverview } from '@/components/budget/BudgetOverview';
import { AddTransactionModal } from '@/components/transactions/AddTransactionModal';
import { getCurrentMonthStr } from '@/lib/utils/formatters';
import { Budget, Category, Transaction, Account } from '@/types';
import { Loader2 } from 'lucide-react';
import { offlineFetch, getLocalCachedDashboard } from '@/lib/pwa/offlineFetch';
import { useSyncQueue } from '@/lib/pwa/useSyncQueue';
import { useOnlineStatus } from '@/lib/pwa/useOnlineStatus';
import { PullToRefresh } from '@/components/shared/PullToRefresh';
import { BudgetSkeleton } from '@/components/shared/Skeleton';

export default function BudgetPage() {
  const cached = getLocalCachedDashboard();
  const [loading, setLoading] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthStr());
  const [isMock, setIsMock] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);

  const isOnline = useOnlineStatus();
  const prevOnlineRef = useRef(isOnline);

  const [budgets, setBudgets] = useState<Budget[]>(() => cached?.budgets || []);
  const [categories, setCategories] = useState<Category[]>(() => cached?.categories || []);
  const [transactions, setTransactions] = useState<Transaction[]>(() => cached?.transactions || []);
  const [accounts, setAccounts] = useState<Account[]>(() => cached?.accounts || []);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const fetchData = async () => {
    try {
      const res = await offlineFetch('/api/dashboard');
      const json = await res.json();
      if (json.success) {
        setIsMock(json.isMock ?? false);
        setBudgets(json.data.budgets || []);
        setCategories(json.data.categories || []);
        setTransactions(json.data.transactions || []);
        setAccounts(json.data.accounts || []);
        setLastSyncedAt(json.offline ? null : new Date().toISOString());
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Detect reconnection: show skeleton while fetching fresh data when coming back online
  useEffect(() => {
    if (prevOnlineRef.current === false && isOnline) {
      setIsReconnecting(true);
      fetchData().finally(() => {
        setTimeout(() => setIsReconnecting(false), 500);
      });
    }
    prevOnlineRef.current = isOnline;
  }, [isOnline]);

  useSyncQueue(() => fetchData());

  const handleSaveBudget = async (data: { month: string; category: string; budget_amount: number }) => {
    const now = new Date().toISOString();
    const optimisticRecord: Budget = {
      id: `b-${Date.now()}`,
      month: data.month,
      category: data.category,
      budget_amount: data.budget_amount,
      created_at: now,
      updated_at: now,
    };
    await offlineFetch('/api/budgets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      optimisticRecord,
    });
    fetchData();
  };

  const handleDeleteBudget = async (id: string) => {
    if (!confirm('Delete this category budget?')) return;
    await offlineFetch(`/api/budgets?id=${id}`, {
      method: 'DELETE',
      optimisticRecord: null,
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

      <PullToRefresh onRefresh={fetchData}>
        <main className="max-w-md mx-auto sm:max-w-lg md:max-w-2xl lg:max-w-4xl p-4">
          {loading || isReconnecting ? (
            <BudgetSkeleton />
          ) : (
            <BudgetOverview
              budgets={budgets}
              categories={categories}
              transactions={transactions}
              selectedMonth={selectedMonth}
              onSaveBudget={handleSaveBudget}
              onDeleteBudget={handleDeleteBudget}
              onRefreshData={fetchData}
            />
          )}
        </main>
      </PullToRefresh>

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
