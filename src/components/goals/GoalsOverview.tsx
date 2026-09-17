'use client';

import React, { useState } from 'react';
import { FinancialGoal } from '@/types';
import { formatCurrency, formatPercentage } from '@/lib/utils/formatters';
import { Plus, Target, CheckCircle2, Edit3, Calendar } from 'lucide-react';

interface GoalsOverviewProps {
  goals: FinancialGoal[];
  onSaveGoal: (goal: { name: string; target_amount: number; current_amount: number; target_date: string; status: any }) => Promise<void>;
  onUpdateGoalAmount: (id: string, newAmount: number) => Promise<void>;
}

export function GoalsOverview({
  goals = [],
  onSaveGoal,
  onUpdateGoalAmount,
}: GoalsOverviewProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<FinancialGoal | null>(null);
  const [newAmount, setNewAmount] = useState<number | ''>('');

  // Add form state
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState<number | ''>('');
  const [currentAmount, setCurrentAmount] = useState<number | ''>('');
  const [targetDate, setTargetDate] = useState('');

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !targetAmount || !targetDate) return;
    try {
      await onSaveGoal({
        name,
        target_amount: Number(targetAmount),
        current_amount: Number(currentAmount) || 0,
        target_date: targetDate,
        status: 'in_progress',
      });
      setShowAddModal(false);
      setName('');
      setTargetAmount('');
      setCurrentAmount('');
      setTargetDate('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGoal || newAmount === '') return;
    try {
      await onUpdateGoalAmount(selectedGoal.id, Number(newAmount));
      setSelectedGoal(null);
      setNewAmount('');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-100">Financial Goals</h2>
          <p className="text-xs text-slate-400">Track targets like Emergency Fund, Laptop, or Land</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-bold shadow-lg shadow-emerald-500/20 transition active:scale-95"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" /> Add Goal
        </button>
      </div>

      {goals.length === 0 ? (
        <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center">
          <Target className="w-10 h-10 text-slate-600 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-200">No financial goals set</h3>
          <p className="text-xs text-slate-400 mt-1">
            Create a goal to start tracking progress towards your financial milestones.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {goals.map((g) => {
            const pct = Math.min(100, Math.round((g.current_amount / (g.target_amount || 1)) * 100));
            const isCompleted = g.status === 'completed' || pct >= 100;

            return (
              <div
                key={g.id}
                className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 relative"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
                    {g.name}
                    {isCompleted && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                  </h3>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {formatPercentage(pct)}
                  </span>
                </div>

                <div className="flex items-baseline justify-between text-xs">
                  <span className="text-slate-400">Current: <strong className="text-emerald-400 font-bold">{formatCurrency(g.current_amount)}</strong></span>
                  <span className="text-slate-400">Target: <strong className="text-slate-200">{formatCurrency(g.target_amount)}</strong></span>
                </div>

                <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      isCompleted ? 'bg-emerald-400' : 'bg-indigo-500'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> Target Date: {g.target_date}
                  </span>
                  <button
                    onClick={() => {
                      setSelectedGoal(g);
                      setNewAmount(g.current_amount);
                    }}
                    className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                  >
                    <Edit3 className="w-3 h-3" /> Update Progress
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Goal Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-base font-bold text-slate-100">Add New Financial Goal</h3>
            <form onSubmit={handleAddSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Goal Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Emergency Fund"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 text-slate-100 text-xs py-2.5 px-3 rounded-xl border border-slate-800 focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Target Amount (₦) *</label>
                  <input
                    type="number"
                    placeholder="1000000"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(parseFloat(e.target.value) || '')}
                    className="w-full bg-slate-950 text-slate-100 text-xs py-2.5 px-3 rounded-xl border border-slate-800 focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Current Savings (₦)</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={currentAmount}
                    onChange={(e) => setCurrentAmount(parseFloat(e.target.value) || '')}
                    className="w-full bg-slate-950 text-slate-100 text-xs py-2.5 px-3 rounded-xl border border-slate-800 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Target Date *</label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full bg-slate-950 text-slate-200 text-xs py-2.5 px-3 rounded-xl border border-slate-800 focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-500 text-slate-950 text-xs font-bold hover:bg-emerald-600"
                >
                  Save Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Update Progress Modal */}
      {selectedGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-base font-bold text-slate-100">Update Goal Savings</h3>
            <p className="text-xs text-slate-400">Updating progress for: <strong>{selectedGoal.name}</strong></p>
            <form onSubmit={handleUpdateSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">New Current Amount (₦)</label>
                <input
                  type="number"
                  value={newAmount}
                  onChange={(e) => setNewAmount(parseFloat(e.target.value) || '')}
                  className="w-full bg-slate-950 text-slate-100 text-sm py-2.5 px-3 rounded-xl border border-slate-800 focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedGoal(null)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-500 text-slate-950 text-xs font-bold hover:bg-emerald-600"
                >
                  Update & Sync
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
