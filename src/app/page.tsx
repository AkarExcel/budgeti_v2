'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Header } from '@/components/shared/Header';
import { BottomNav } from '@/components/shared/BottomNav';
import { BalanceOverviewCard } from '@/components/dashboard/BalanceOverviewCard';
import { RecentTransactions } from '@/components/dashboard/RecentTransactions';
import { BudgetProgressWidget } from '@/components/dashboard/BudgetProgressWidget';
import { GoalsProgressWidget } from '@/components/dashboard/GoalsProgressWidget';
import { AddTransactionModal } from '@/components/transactions/AddTransactionModal';
import { GoogleSetupModal } from '@/components/shared/GoogleSetupModal';
import { HabitReminderBanner } from '@/components/notifications/HabitReminderBanner';
import { NotificationBellModal } from '@/components/notifications/NotificationBellModal';
import { useHabitReminders } from '@/lib/notifications/useHabitReminders';
import { getCurrentMonthStr } from '@/lib/utils/formatters';
import {
  calculateTotalIncome,
  calculateTotalExpenses,
  calculateNetCashFlow,
  calculateSavings,
  calculateSavingsRate,
  calculateAccountBalance,
  calculateBudgetSpent,
} from '@/lib/calculations/finance';
import { Transaction, Budget, Category, Account, IncomeSource, FinancialGoal, UserSettings } from '@/types';
import { Loader2 } from 'lucide-react';
import { offlineFetch, getLocalCachedDashboard } from '@/lib/pwa/offlineFetch';
import { useSyncQueue } from '@/lib/pwa/useSyncQueue';
import { useOnlineStatus } from '@/lib/pwa/useOnlineStatus';
import { PullToRefresh } from '@/components/shared/PullToRefresh';
import { DashboardSkeleton } from '@/components/shared/Skeleton';

export default function DashboardPage() {
  const cached = getLocalCachedDashboard();
  const [loading, setLoading] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthStr());
  const [isMock, setIsMock] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(false);
  const [isGoogleConnected, setIsGoogleConnected] = useState(false);

  const isOnline = useOnlineStatus();
  const prevOnlineRef = useRef(isOnline);

  const [transactions, setTransactions] = useState<Transaction[]>(() => cached?.transactions || []);
  const [budgets, setBudgets] = useState<Budget[]>(() => cached?.budgets || []);
  const [categories, setCategories] = useState<Category[]>(() => cached?.categories || []);
  const [accounts, setAccounts] = useState<Account[]>(() => cached?.accounts || []);
  const [goals, setGoals] = useState<FinancialGoal[]>(() => cached?.goals || []);
  const [settings, setSettings] = useState<UserSettings>(() => cached?.settings || {
    currency: 'NGN',
    monthly_income_target: 500000,
    monthly_savings_target: 150000,
    default_account: 'GTBank',
    date_format: 'YYYY-MM-DD',
  });

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const handleOpenAdd = () => {
    setEditingTransaction(null);
    setIsAddModalOpen(true);
  };

  const checkGoogleConnection = useCallback((mockVal?: boolean) => {
    if (typeof window === 'undefined') return;
    const setupCompleted = localStorage.getItem('google_sheets_setup_complete') === 'true';
    const hasGmail = Boolean(localStorage.getItem('google_user_gmail'));
    const mode = localStorage.getItem('google_sheets_mode');
    const isMockData = mockVal !== undefined ? mockVal : isMock;
    const connected = (setupCompleted && hasGmail && mode !== 'mock') || (!isMockData && setupCompleted);
    setIsGoogleConnected(Boolean(connected));
  }, [isMock]);

  const fetchData = useCallback(async () => {
    try {
      const res = await offlineFetch('/api/dashboard');
      const json = await res.json();

      if (json.success) {
        const mockFlag = json.isMock ?? false;
        setIsMock(mockFlag);
        setIsOffline(json.offline === true);
        setTransactions(json.data.transactions || []);
        setBudgets(json.data.budgets || []);
        setCategories(json.data.categories || []);
        setAccounts(json.data.accounts || []);
        setGoals(json.data.goals || []);
        if (json.data.settings) setSettings(json.data.settings);
        setLastSyncedAt(json.offline ? null : new Date().toISOString());
        checkGoogleConnection(mockFlag);
      }
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    }
  }, [checkGoogleConnection]);

  // Wire up offline sync queue — drains automatically when back online
  useSyncQueue(() => fetchData());

  const {
    settings: reminderSettings,
    habitStatus,
    activeReminder,
    history: notificationHistory,
    unreadCount,
    snoozeReminder,
    dismissReminder,
    markReminderRead,
    triggerTestReminder,
  } = useHabitReminders({
    transactions,
    goals,
    budgets,
    onOpenAddModal: handleOpenAdd,
  });

  useEffect(() => {
    fetchData();

    // Check if Google Sheets setup has been completed in localStorage
    const setupCompleted = localStorage.getItem('google_sheets_setup_complete');
    if (!setupCompleted || setupCompleted !== 'true') {
      setIsSetupModalOpen(true);
    }
    checkGoogleConnection();
  }, [fetchData, checkGoogleConnection]);

  // Detect reconnection: show skeleton while fetching fresh data when coming back online
  useEffect(() => {
    if (prevOnlineRef.current === false && isOnline) {
      setIsReconnecting(true);
      fetchData().finally(() => {
        setTimeout(() => setIsReconnecting(false), 500);
      });
    }
    prevOnlineRef.current = isOnline;
  }, [isOnline, fetchData]);

  // Filter transactions for selected month
  const monthlyTransactions = transactions.filter((t) =>
    t.date.startsWith(selectedMonth)
  );

  const totalIncome = calculateTotalIncome(monthlyTransactions);
  const totalExpenses = calculateTotalExpenses(monthlyTransactions);
  const netCashFlow = calculateNetCashFlow(monthlyTransactions);
  const savings = calculateSavings(monthlyTransactions, goals);
  const savingsRate = calculateSavingsRate(totalIncome, savings);

  const totalBalance = accounts.reduce(
    (sum, acc) => sum + calculateAccountBalance(acc, transactions),
    0
  );

  const currentBudgets = budgets.filter((b) => b.month === selectedMonth);
  const monthlyBudget = currentBudgets.reduce((sum, b) => sum + b.budget_amount, 0);
  const budgetSpent = currentBudgets.reduce(
    (sum, b) => sum + calculateBudgetSpent(b.category, selectedMonth, transactions),
    0
  );
  const budgetRemaining = monthlyBudget - budgetSpent;

  const handleSelectTransaction = (tx: Transaction) => {
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
        onOpenSetupModal={() => setIsSetupModalOpen(true)}
        isGoogleConnected={isGoogleConnected}
        unreadNotificationsCount={unreadCount}
        onOpenNotificationModal={() => setIsNotificationModalOpen(true)}
        habitStreak={habitStatus.streak}
      />

      <PullToRefresh onRefresh={fetchData}>
        <main className="max-w-md mx-auto sm:max-w-lg md:max-w-2xl lg:max-w-4xl p-4 space-y-4">
          {loading || isReconnecting ? (
            <DashboardSkeleton />
          ) : (
            <>
              {/* Habit Reminder & Daily Consistency Prompt */}
              <HabitReminderBanner
                reminder={activeReminder}
                habitStatus={habitStatus}
                onOpenAddModal={handleOpenAdd}
                onSnooze={snoozeReminder}
                onDismiss={dismissReminder}
              />

              {/* Balance Hero Card */}
              <BalanceOverviewCard
                totalBalance={totalBalance}
                totalIncome={totalIncome}
                totalExpenses={totalExpenses}
                netCashFlow={netCashFlow}
                savings={savings}
                savingsRate={savingsRate}
                monthlyBudget={monthlyBudget}
                budgetSpent={budgetSpent}
                budgetRemaining={budgetRemaining}
                currency={settings.currency}
              />

              {/* Recent Transactions */}
              <RecentTransactions
                transactions={transactions}
                onSelectTransaction={handleSelectTransaction}
              />

              {/* Budget Progress */}
              <BudgetProgressWidget
                budgets={budgets}
                transactions={transactions}
                month={selectedMonth}
              />

              {/* Financial Goals */}
              <GoalsProgressWidget goals={goals} />
            </>
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

      <GoogleSetupModal
        isOpen={isSetupModalOpen}
        onClose={() => setIsSetupModalOpen(false)}
        onSuccess={() => {
          checkGoogleConnection();
          fetchData();
        }}
      />
    </div>
  );
}

