'use client';

import React, { useEffect, useState } from 'react';
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

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthStr());
  const [isMock, setIsMock] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [goals, setGoals] = useState<FinancialGoal[]>([]);
  const [settings, setSettings] = useState<UserSettings>({
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

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/dashboard');
      const json = await res.json();

      if (json.success) {
        setIsMock(json.isMock);
        setTransactions(json.data.transactions || []);
        setBudgets(json.data.budgets || []);
        setCategories(json.data.categories || []);
        setAccounts(json.data.accounts || []);
        setGoals(json.data.goals || []);
        if (json.data.settings) setSettings(json.data.settings);
        setLastSyncedAt(new Date().toISOString());
      }
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Check if Google Sheets setup has been completed in localStorage
    const setupCompleted = localStorage.getItem('google_sheets_setup_complete');
    if (!setupCompleted || setupCompleted !== 'true') {
      setIsSetupModalOpen(true);
    }
  }, []);

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
        unreadNotificationsCount={unreadCount}
        onOpenNotificationModal={() => setIsNotificationModalOpen(true)}
        habitStreak={habitStatus.streak}
      />

      <main className="max-w-md mx-auto sm:max-w-lg md:max-w-2xl lg:max-w-4xl p-4 space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
            <p className="text-xs font-semibold">Loading Budgeti Dashboard...</p>
          </div>
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
      />

      <GoogleSetupModal
        isOpen={isSetupModalOpen}
        onClose={() => setIsSetupModalOpen(false)}
        onSuccess={fetchData}
      />
    </div>
  );
}

