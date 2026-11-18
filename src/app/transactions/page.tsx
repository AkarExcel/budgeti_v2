'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Header } from '@/components/shared/Header';
import { BottomNav } from '@/components/shared/BottomNav';
import { TransactionList } from '@/components/transactions/TransactionList';
import { AddTransactionModal } from '@/components/transactions/AddTransactionModal';
import { NotificationBellModal } from '@/components/notifications/NotificationBellModal';
import { useHabitReminders } from '@/lib/notifications/useHabitReminders';
import { getCurrentMonthStr } from '@/lib/utils/formatters';
import { Transaction, Category, Account } from '@/types';
import { Loader2 } from 'lucide-react';
import { offlineFetch, getLocalCachedDashboard } from '@/lib/pwa/offlineFetch';
import { useSyncQueue } from '@/lib/pwa/useSyncQueue';
import { useOnlineStatus } from '@/lib/pwa/useOnlineStatus';
import { PullToRefresh } from '@/components/shared/PullToRefresh';
import { TransactionListSkeleton } from '@/components/shared/Skeleton';

export default function TransactionsPage() {
  const cached = getLocalCachedDashboard();
  const [loading, setLoading] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthStr());
  const [isMock, setIsMock] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);

  const isOnline = useOnlineStatus();
  const prevOnlineRef = useRef(isOnline);

  const [transactions, setTransactions] = useState<Transaction[]>(() => cached?.transactions || []);
  const [categories, setCategories] = useState<Category[]>(() => cached?.categories || []);
  const [accounts, setAccounts] = useState<Account[]>(() => cached?.accounts || []);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const handleOpenAdd = () => {
    setEditingTransaction(null);
    setIsAddModalOpen(true);
  };

  const {
    settings: reminderSettings,
    habitStatus,
    history: notificationHistory,
    unreadCount,
    markReminderRead,
    triggerTestReminder,
  } = useHabitReminders({
    transactions,
    onOpenAddModal: handleOpenAdd,
  });

  const fetchData = async () => {
    try {
      const res = await offlineFetch('/api/dashboard');
      const json = await res.json();
      if (json.success) {
        setIsMock(json.isMock ?? false);
        setTransactions(json.data.transactions || []);
        setCategories(json.data.categories || []);
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

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this transaction?')) return;
    try {
      const res = await offlineFetch(`/api/transactions?id=${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!res.ok || !json.success) {
        alert(json.message || 'Failed to delete transaction');
      }
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenEdit = (tx: Transaction) => {
    setEditingTransaction(tx);
    setIsAddModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-24">
      <Header
        selectedMonth={selectedMonth}
        onMonthChange={setSelectedMonth}
        lastSyncedAt={lastSyncedAt}
        isMock={isMock}
        onSyncComplete={fetchData}
        unreadNotificationsCount={unreadCount}
        onOpenNotificationModal={() => setIsNotificationModalOpen(true)}
        habitStreak={habitStatus.streak}
      />

      <PullToRefresh onRefresh={fetchData}>
        <main className="max-w-md mx-auto sm:max-w-lg md:max-w-2xl lg:max-w-4xl p-4">
          {loading || isReconnecting ? (
            <TransactionListSkeleton />
          ) : (
            <TransactionList
              transactions={transactions}
              categories={categories}
              accounts={accounts}
              onAddTransaction={handleOpenAdd}
              onEditTransaction={handleOpenEdit}
              onDeleteTransaction={handleDelete}
            />
          )}
        </main>
      </PullToRefresh>

      <BottomNav onOpenAddModal={handleOpenAdd} />

      <AddTransactionModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingTransaction(null);
        }}
        categories={categories}
        accounts={accounts}
        incomeSources={[]}
        editingTransaction={editingTransaction}
        onSuccess={fetchData}
      />

      <NotificationBellModal
        isOpen={isNotificationModalOpen}
        onClose={() => setIsNotificationModalOpen(false)}
        history={notificationHistory}
        habitStatus={habitStatus}
        settings={reminderSettings}
        onTriggerTest={triggerTestReminder}
        onMarkRead={markReminderRead}
        onOpenAddModal={handleOpenAdd}
        isMock={isMock}
      />
    </div>
  );
}
