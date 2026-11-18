'use client';

import React, { useEffect, useState, useRef } from 'react';
import { BottomNav } from '@/components/shared/BottomNav';
import { SettingsOverview } from '@/components/settings/SettingsOverview';
import { AddTransactionModal } from '@/components/transactions/AddTransactionModal';
import { NotificationBellModal } from '@/components/notifications/NotificationBellModal';
import { useHabitReminders } from '@/lib/notifications/useHabitReminders';
import { getCurrentMonthStr } from '@/lib/utils/formatters';
import { UserSettings, Category, Account, Transaction } from '@/types';
import { Loader2 } from 'lucide-react';
import { offlineFetch, getLocalCachedDashboard } from '@/lib/pwa/offlineFetch';
import { useSyncQueue } from '@/lib/pwa/useSyncQueue';
import { useOnlineStatus } from '@/lib/pwa/useOnlineStatus';
import { PullToRefresh } from '@/components/shared/PullToRefresh';
import { SettingsSkeleton } from '@/components/shared/Skeleton';

export default function SettingsPage() {
  const cached = getLocalCachedDashboard();
  const [loading, setLoading] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthStr());
  const [isMock, setIsMock] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);

  const isOnline = useOnlineStatus();
  const prevOnlineRef = useRef(isOnline);

  const [settings, setSettings] = useState<UserSettings>(() => cached?.settings || {
    currency: 'NGN',
    monthly_income_target: 500000,
    monthly_savings_target: 150000,
    default_account: 'GTBank',
    date_format: 'YYYY-MM-DD',
  });
  const [categories, setCategories] = useState<Category[]>(() => cached?.categories || []);
  const [accounts, setAccounts] = useState<Account[]>(() => cached?.accounts || []);
  const [transactions, setTransactions] = useState<Transaction[]>(() => cached?.transactions || []);
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
    onOpenAddModal: () => setIsAddModalOpen(true),
  });

  const fetchData = async () => {
    try {
      const res = await offlineFetch('/api/dashboard');
      const json = await res.json();
      if (json.success) {
        setIsMock(json.isMock ?? false);
        if (json.data.settings) setSettings(json.data.settings);
        setCategories(json.data.categories || []);
        setAccounts(json.data.accounts || []);
        setTransactions(json.data.transactions || []);
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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-44 transition-colors">
      <PullToRefresh onRefresh={fetchData}>
        <main className="max-w-md mx-auto sm:max-w-lg md:max-w-2xl lg:max-w-4xl px-4 pt-2">
          {loading || isReconnecting ? (
            <SettingsSkeleton />
          ) : (
            <SettingsOverview
              settings={settings}
              categories={categories}
              accounts={accounts}
              transactions={transactions}
              isMock={isMock}
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
