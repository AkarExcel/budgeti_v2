'use client';

import React from 'react';
import Link from 'next/link';
import { HabitReminder, HabitStatus } from '@/types';
import {
  Flame,
  PlusCircle,
  Clock,
  X,
  Target,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Bell,
  Sun,
  Coffee,
  Sunset,
  Moon,
} from 'lucide-react';

interface HabitReminderBannerProps {
  reminder: HabitReminder | null;
  habitStatus: HabitStatus;
  onOpenAddModal: () => void;
  onSnooze: (reminderId: string) => void;
  onDismiss: (reminderId: string) => void;
}

export function HabitReminderBanner({
  reminder,
  habitStatus,
  onOpenAddModal,
  onSnooze,
  onDismiss,
}: HabitReminderBannerProps) {
  // If no reminder is active, show the minimal Habit Streak & Daily Progress bar
  if (!reminder) {
    return (
      <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800/80 shadow-sm flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Flame className="w-4 h-4 fill-amber-400/20" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-200">
                {habitStatus.streak > 0 ? `${habitStatus.streak}-Day Streak` : 'Start Your Habit'}
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {habitStatus.hasLoggedToday ? `${habitStatus.loggedCountToday} Logged Today` : 'Pending Today'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              {habitStatus.hasLoggedToday
                ? 'Consistency builds wealth. Great job tracking today!'
                : `Next reminder: ${habitStatus.nextScheduledReminderTime || 'Evening'}`}
            </p>
          </div>
        </div>

        <button
          onClick={onOpenAddModal}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-xs font-semibold transition shrink-0"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Quick Log</span>
        </button>
      </div>
    );
  }

  const isUrgent = reminder.urgency === 'important';
  const isPositive = reminder.cueType === 'positive_reinforcement';

  // Daypart icons
  const daypartIcons = {
    morning: <Sun className="w-3 h-3 text-amber-400" />,
    afternoon: <Coffee className="w-3 h-3 text-orange-400" />,
    evening: <Sunset className="w-3 h-3 text-indigo-400" />,
    night: <Moon className="w-3 h-3 text-purple-400" />,
  };

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border p-4 transition-all duration-300 ${
        isUrgent
          ? 'bg-gradient-to-br from-amber-950/40 via-slate-900 to-slate-900 border-amber-500/40 shadow-lg shadow-amber-950/20'
          : isPositive
          ? 'bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-900 border-emerald-500/40 shadow-lg shadow-emerald-950/20'
          : 'bg-gradient-to-br from-indigo-950/30 via-slate-900 to-slate-900 border-indigo-500/30'
      }`}
    >
      {/* Decorative accent pulse */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />

      {/* Header Row */}
      <div className="flex items-start justify-between gap-3 relative z-10">
        <div className="flex items-center gap-2">
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
              isUrgent
                ? 'bg-amber-500/10 border border-amber-500/30 text-amber-400'
                : isPositive
                ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                : 'bg-indigo-500/10 border border-indigo-500/30 text-indigo-400'
            }`}
          >
            {isUrgent ? (
              <Flame className="w-4 h-4 fill-amber-400/20 animate-pulse" />
            ) : isPositive ? (
              <Sparkles className="w-4 h-4" />
            ) : (
              <Bell className="w-4 h-4" />
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                {reminder.title}
              </h3>
              {habitStatus.streak > 0 && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-0.5">
                  <Flame className="w-2.5 h-2.5 fill-amber-400" />
                  {habitStatus.streak}d streak
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 capitalize flex items-center gap-1 mt-0.5">
              {daypartIcons[reminder.daypart]} {reminder.daypart} check-in
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => onSnooze(reminder.id)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
            title="Snooze for 1 hour"
          >
            <Clock className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDismiss(reminder.id)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
            title="Dismiss"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Reminder Message Body */}
      <p className="text-xs text-slate-300 mt-2.5 leading-relaxed relative z-10">
        {reminder.message}
      </p>

      {/* Daily Daypart Habit Tracker Chips */}
      <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-slate-400 font-medium mr-1 hidden sm:inline">
            Today:
          </span>
          {(['morning', 'afternoon', 'evening', 'night'] as const).map((part) => {
            const isLogged = habitStatus.daypartsLogged[part];
            const isCurrent = reminder.daypart === part;
            return (
              <span
                key={part}
                className={`text-[10px] px-2 py-0.5 rounded-md flex items-center gap-1 capitalize transition ${
                  isLogged
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                    : isCurrent
                    ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 font-semibold'
                    : 'bg-slate-950 text-slate-400 border border-slate-800'
                }`}
              >
                {isLogged ? <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" /> : daypartIcons[part]}
                <span>{part.slice(0, 3)}</span>
              </span>
            );
          })}
        </div>

        {/* Direct Action Buttons */}
        <div className="flex items-center gap-1.5">
          {reminder.goalContext && (
            <Link
              href="/goals"
              className="text-[11px] font-semibold text-slate-300 hover:text-emerald-400 px-2 py-1 rounded-lg bg-slate-800 border border-slate-700 flex items-center gap-1 transition"
            >
              <Target className="w-3 h-3 text-indigo-400" />
              <span className="hidden sm:inline">Goal</span>
            </Link>
          )}

          <button
            onClick={onOpenAddModal}
            className={`text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition shadow-sm ${
              isUrgent
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20'
                : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20'
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Log Transaction</span>
          </button>
        </div>
      </div>
    </div>
  );
}
