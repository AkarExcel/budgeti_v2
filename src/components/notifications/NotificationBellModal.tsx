'use client';

import React from 'react';
import Link from 'next/link';
import {
  Bell,
  X,
  Flame,
  CheckCircle2,
  Clock,
  Settings,
  Sparkles,
  Target,
  PlusCircle,
  Play,
  Trash2,
} from 'lucide-react';
import {
  NotificationHistoryRecord,
  HabitStatus,
  HabitNotificationSettings,
} from '@/types';

interface NotificationBellModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: NotificationHistoryRecord[];
  habitStatus: HabitStatus;
  settings: HabitNotificationSettings;
  onTriggerTest: () => void;
  onMarkRead: (id: string) => void;
  onOpenAddModal: () => void;
  onClearHistory?: () => void;
  isMock?: boolean;
}

export function NotificationBellModal({
  isOpen,
  onClose,
  history = [],
  habitStatus,
  settings,
  onTriggerTest,
  onMarkRead,
  onOpenAddModal,
  onClearHistory,
  isMock,
}: NotificationBellModalProps) {
  if (!isOpen) return null;

  // Only display test cues when using mock data and in development mode
  const isDev = process.env.NODE_ENV === 'development';
  const isMockMode = Boolean(
    isMock ||
    (typeof window !== 'undefined' &&
      (localStorage.getItem('google_sheets_mode') === 'mock' ||
        localStorage.getItem('budgeti_mock_active') === 'true'))
  );
  const showTestCue = isDev && isMockMode;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">Financial Habit Center</h3>
              <p className="text-[11px] text-slate-400">Daily tracking reminders & alerts</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Habit Summary Card */}
        <div className="p-4 bg-slate-950/60 border-b border-slate-800/80">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
                <Flame className="w-3.5 h-3.5 fill-amber-400" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-200">
                  {habitStatus.streak > 0 ? `${habitStatus.streak}-Day Active Streak` : 'No Active Streak'}
                </span>
                <p className="text-[10px] text-slate-400">
                  {habitStatus.hasLoggedToday
                    ? `${habitStatus.loggedCountToday} transaction(s) recorded today`
                    : 'No transactions recorded today yet'}
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                onClose();
                onOpenAddModal();
              }}
              className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 flex items-center gap-1 transition"
            >
              <PlusCircle className="w-3 h-3" />
              <span>Log Now</span>
            </button>
          </div>
        </div>

        {/* Notification List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {history.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <Bell className="w-8 h-8 mx-auto mb-2 text-slate-600 opacity-60" />
              <p className="text-xs font-semibold text-slate-300">No habit notifications yet</p>
              <p className="text-[11px] text-slate-400 max-w-[220px] mx-auto mt-1">
                Reminders will appear throughout the day at your scheduled check-in times.
              </p>
              <button
                onClick={onTriggerTest}
                className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
              >
                <Play className="w-3 h-3 text-emerald-400" />
                <span>Test Notification Now</span>
              </button>
            </div>
          ) : (
            history.map((record) => {
              const r = record.reminder;
              const isUrgent = r.urgency === 'important';
              const dateStr = new Date(record.createdAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={record.id}
                  onClick={() => onMarkRead(record.id)}
                  className={`p-3.5 rounded-2xl border transition cursor-pointer ${
                    r.read
                      ? 'bg-slate-950/40 border-slate-800/60 opacity-80'
                      : isUrgent
                      ? 'bg-amber-950/20 border-amber-500/30'
                      : 'bg-slate-950 border-slate-800'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {isUrgent ? (
                        <Flame className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      ) : (
                        <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      )}
                      <h4 className="text-xs font-bold text-slate-100">{r.title}</h4>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" />
                      {dateStr}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                    {r.message}
                  </p>

                  {r.goalContext && (
                    <div className="mt-2 p-2 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between text-[10px]">
                      <span className="text-slate-300 flex items-center gap-1">
                        <Target className="w-3 h-3 text-indigo-400" />
                        {r.goalContext.goalName}
                      </span>
                      <span className="font-semibold text-emerald-400">
                        {r.goalContext.progressPercent}% Target
                      </span>
                    </div>
                  )}

                  <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px]">
                    <span className="text-slate-400 capitalize">
                      Slot: {r.daypart}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onClose();
                        onOpenAddModal();
                      }}
                      className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
                    >
                      <PlusCircle className="w-3 h-3" />
                      Log Finance
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Actions */}
        <div className={`p-3.5 bg-slate-950 border-t border-slate-800 flex items-center gap-2 ${showTestCue ? 'justify-between' : 'justify-end'}`}>
          {showTestCue && (
            <button
              onClick={onTriggerTest}
              className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition"
            >
              <Play className="w-3 h-3 text-emerald-400" />
              <span>Test Cue</span>
            </button>
          )}

          <Link
            href="/settings"
            onClick={onClose}
            className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5 transition"
          >
            <Settings className="w-3 h-3" />
            <span>Customize Times</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
