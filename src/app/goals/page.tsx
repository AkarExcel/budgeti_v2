'use client';

import React, { useEffect, useState } from 'react';
import { Header } from '@/components/shared/Header';
import { BottomNav } from '@/components/shared/BottomNav';
import { GoalsOverview } from '@/components/goals/GoalsOverview';
import { AddTransactionModal } from '@/components/transactions/AddTransactionModal';
import { getCurrentMonthStr } from '@/lib/utils/formatters';
import { FinancialGoal, Category, Account } from '@/types';
import { Loader2 } from 'lucide-react';

export default function GoalsPage() {
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthStr());
  const [isMock, setIsMock] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);

  const [goals, setGoals] = useState<FinancialGoal[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/dashboard');
      const json = await res.json();
      if (json.success) {
        setIsMock(json.isMock);
        setGoals(json.data.goals || []);
        setCategories(json.data.categories || []);
        setAccounts(json.data.accounts || []);
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

  const handleSaveGoal = async (data: any) => {
    await fetch('/api/goals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    fetchData();
  };

  const handleUpdateGoalAmount = async (id: string, newAmount: number) => {
    await fetch('/api/goals', {
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
      />

      <main className="max-w-md mx-auto sm:max-w-lg md:max-w-2xl lg:max-w-4xl p-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
            <p className="text-xs font-semibold">Loading Financial Goals...</p>
          </div>
        ) : (
          <GoalsOverview
            goals={goals}
            onSaveGoal={handleSaveGoal}
            onUpdateGoalAmount={handleUpdateGoalAmount}
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
