'use client';

import React, { useEffect, useState } from 'react';
import { Header } from '@/components/shared/Header';
import { BottomNav } from '@/components/shared/BottomNav';
import { TransactionList } from '@/components/transactions/TransactionList';
import { AddTransactionModal } from '@/components/transactions/AddTransactionModal';
import { getCurrentMonthStr } from '@/lib/utils/formatters';
import { Transaction, Category, Account } from '@/types';
import { Loader2 } from 'lucide-react';

export default function TransactionsPage() {
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthStr());
  const [isMock, setIsMock] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/dashboard');
      const json = await res.json();
      if (json.success) {
        setIsMock(json.isMock);
        setTransactions(json.data.transactions || []);
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

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this transaction?')) return;
    try {
      const res = await fetch(`/api/transactions?id=${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!res.ok || !json.success) {
        alert(json.message || 'Failed to delete transaction');
      }
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenAdd = () => {
    setEditingTransaction(null);
    setIsAddModalOpen(true);
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
      />

      <main className="max-w-md mx-auto sm:max-w-lg md:max-w-2xl lg:max-w-4xl p-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
            <p className="text-xs font-semibold">Loading Transactions...</p>
          </div>
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
    </div>
  );
}
