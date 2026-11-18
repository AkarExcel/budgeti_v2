'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Header } from '@/components/shared/Header';
import { BottomNav } from '@/components/shared/BottomNav';
import { ReportsOverview } from '@/components/reports/ReportsOverview';
import { AddTransactionModal } from '@/components/transactions/AddTransactionModal';
import { getCurrentMonthStr } from '@/lib/utils/formatters';
import { Transaction, Account, Category } from '@/types';
import { Loader2 } from 'lucide-react';
import { offlineFetch, getLocalCachedDashboard } from '@/lib/pwa/offlineFetch';
import { useOnlineStatus } from '@/lib/pwa/useOnlineStatus';
import { PullToRefresh } from '@/components/shared/PullToRefresh';
import { ReportsSkeleton } from '@/components/shared/Skeleton';

export default function ReportsPage() {
  const cached = getLocalCachedDashboard();
  const [loading, setLoading] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthStr());
  const [isMock, setIsMock] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);

  const isOnline = useOnlineStatus();
  const prevOnlineRef = useRef(isOnline);

  const [transactions, setTransactions] = useState<Transaction[]>(() => cached?.transactions || []);
  const [accounts, setAccounts] = useState<Account[]>(() => cached?.accounts || []);
  const [categories, setCategories] = useState<Category[]>(() => cached?.categories || []);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const fetchData = async () => {
    try {
      const res = await offlineFetch('/api/dashboard');
      const json = await res.json();
      if (json.success) {
        setIsMock(json.isMock ?? false);
        setTransactions(json.data.transactions || []);
        setAccounts(json.data.accounts || []);
        setCategories(json.data.categories || []);
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
            <ReportsSkeleton />
          ) : (
            <ReportsOverview transactions={transactions} accounts={accounts} />
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
