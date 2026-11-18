'use client';

import React from 'react';
import { MessageSquare, Bell, Smartphone, Send, ShieldCheck } from 'lucide-react';
import { NotificationSettingsCard } from '@/components/notifications/NotificationSettingsCard';
import { useHabitReminders } from '@/lib/notifications/useHabitReminders';

export function SmsAlertSettingsPage({ isMock = false }: { isMock?: boolean }) {
  const {
    settings: reminderSettings,
    updateSettings: updateReminderSettings,
    permission: notificationPermission,
    requestPermission: requestNotificationPermission,
    triggerTestReminder,
  } = useHabitReminders();

  return (
    <div className="space-y-4">
      {/* Informative Header Card */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm space-y-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/20">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">Alert & Habit Reminders</h4>
            <p className="text-[10px] text-slate-400">Offline PWA Web Push and habit consistency prompts</p>
          </div>
        </div>
      </div>

      <NotificationSettingsCard
        settings={reminderSettings}
        onUpdateSettings={updateReminderSettings}
        permission={notificationPermission}
        onRequestPermission={requestNotificationPermission}
        onTriggerTest={triggerTestReminder}
        isMock={isMock}
      />
    </div>
  );
}
