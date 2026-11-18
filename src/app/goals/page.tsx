'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Header } from '@/components/shared/Header';
import { BottomNav } from '@/components/shared/BottomNav';
import { GoalsOverview } from '@/components/goals/GoalsOverview';
import { AddTransactionModal } from '@/components/transactions/AddTransactionModal';
import { NotificationBellModal } from '@/components/notifications/NotificationBellModal';
import { useHabitReminders } from '@/lib/notifications/useHabitReminders';
import { getCurrentMonthStr } from '@/lib/utils/formatters';
import { FinancialGoal, Category, Account } from '@/types';
import { Loader2 } from 'lucide-react';
import { offlineFetch, getLocalCachedDashboard } from '@/lib/pwa/offlineFetch';
import { useSyncQueue } from '@/lib/pwa/useSyncQueue';
import { useOnlineStatus } from '@/lib/pwa/useOnlineStatus';
import { PullToRefresh } from '@/components/shared/PullToRefresh';
import { GoalsSkeleton } from '@/components/shared/Skeleton';

export default function GoalsPage() {
  const cached = getLocalCachedDashboard();
  const [loading, setLoading] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthStr());
  const [isMock, setIsMock] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);

  const isOnline = useOnlineStatus();
  const prevOnlineRef = useRef(isOnline);

  const [goals, setGoals] = useState<FinancialGoal[]>(() => cached?.goals || []);
  const [categories, setCategories] = useState<Category[]>(() => cached?.categories || []);
  const [accounts, setAccounts] = useState<Account[]>(() => cached?.accounts || []);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);

  const {
    settings: reminderSettings,
    habitStatus,
    history: notificationHistory,
    unreadCount,
    markReminderRead,
    triggerTestReminder,
  } = useHabitReminders({
    goals,
    onOpenAddModal: () => setIsAddModalOpen(true),
  });

  const fetchData = async () => {
    try {
      const res = await offlineFetch('/api/dashboard');
      const json = await res.json();
      if (json.success) {
        setIsMock(json.isMock ?? false);
        setGoals(json.data.goals || []);
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

  const handleSaveGoal = async (data: Omit<FinancialGoal, 'id' | 'created_at' | 'updated_at'>) => {
    const now = new Date().toISOString();
    const optimisticRecord: FinancialGoal = {
      id: `g-${Date.now()}`,
      ...data,
      created_at: now,
      updated_at: now,
    };
    await offlineFetch('/api/goals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      optimisticRecord,
    });
    fetchData();
  };

  const handleUpdateGoalAmount = async (id: string, newAmount: number) => {
    await offlineFetch('/api/goals', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, current_amount: newAmount }),
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
        unreadNotificationsCount={unreadCount}
        onOpenNotificationModal={() => setIsNotificationModalOpen(true)}
        habitStreak={habitStatus.streak}
      />

      <PullToRefresh onRefresh={fetchData}>
        <main className="max-w-md mx-auto sm:max-w-lg md:max-w-2xl lg:max-w-4xl p-4">
          {loading || isReconnecting ? (
            <GoalsSkeleton />
          ) : (
            <GoalsOverview
              goals={goals}
              onSaveGoal={handleSaveGoal}
              onUpdateGoalAmount={handleUpdateGoalAmount}
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

      <NotificationBellModal
        isOpen={isNotificationModalOpen}
        onClose={() => setIsNotificationModalOpen(false)}
        history={notificationHistory}
        habitStatus={habitStatus}
        settings={reminderSettings}
        onTriggerTest={triggerTestReminder}
        onMarkRead={markReminderRead}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        isMock={isMock}
      />
    </div>
  );
}
