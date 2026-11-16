'use client';

import React, { useState } from 'react';
import {
  HabitNotificationSettings,
  ReminderFrequency,
} from '@/types';
import {
  Bell,
  Clock,
  Volume2,
  VolumeX,
  Vibrate,
  Shield,
  Target,
  Flame,
  CheckCircle2,
  AlertCircle,
  Play,
  Sparkles,
} from 'lucide-react';

interface NotificationSettingsCardProps {
  settings: HabitNotificationSettings;
  onUpdateSettings: (newSettings: Partial<HabitNotificationSettings>) => void;
  permission: NotificationPermission;
  onRequestPermission: () => Promise<NotificationPermission>;
  onTriggerTest: () => void;
}

export function NotificationSettingsCard({
  settings,
  onUpdateSettings,
  permission,
  onRequestPermission,
  onTriggerTest,
}: NotificationSettingsCardProps) {
  const [testSent, setTestSent] = useState(false);

  const handleTest = () => {
    onTriggerTest();
    setTestSent(true);
    setTimeout(() => setTestSent(false), 3000);
  };

  const frequencies: { id: ReminderFrequency; label: string; desc: string }[] = [
    { id: 'gentle', label: 'Gentle (1x)', desc: 'Evening wrap-up review only' },
    { id: 'balanced', label: 'Balanced (3x)', desc: 'Morning, Midday, & Evening (Recommended)' },
    { id: 'frequent', label: 'Frequent (4x)', desc: 'Morning, Midday, Evening, & Night' },
  ];

  return (
    <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Bell className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100">Habit & Reminder Algorithm</h3>
            <p className="text-[11px] text-slate-400">Daily prompts to build tracking discipline</p>
          </div>
        </div>

        {/* Master Toggle */}
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={settings.enabled}
            onChange={(e) => onUpdateSettings({ enabled: e.target.checked })}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
        </label>
      </div>

      {settings.enabled && (
        <div className="space-y-4 pt-1">
          {/* Browser System Notification Banner */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-slate-200 block">
                Browser & Device Notifications
              </span>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {permission === 'granted'
                  ? 'System notifications enabled on this device'
                  : permission === 'denied'
                  ? 'Notifications are blocked in your browser settings'
                  : 'Receive push alerts even when the tab is backgrounded'}
              </p>
            </div>

            <div>
              {permission === 'granted' ? (
                <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Allowed
                </span>
              ) : (
                <button
                  type="button"
                  onClick={onRequestPermission}
                  className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition shadow-sm"
                >
                  Enable Device Alerts
                </button>
              )}
            </div>
          </div>

          {/* Frequency Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 block">
              Reminder Cadence
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {frequencies.map((f) => {
                const isSelected = settings.frequency === f.id;
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => onUpdateSettings({ frequency: f.id })}
                    className={`p-3 rounded-xl border text-left transition ${
                      isSelected
                        ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="text-xs font-bold text-slate-200 flex items-center justify-between">
                      {f.label}
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                    </div>
                    <p className="text-[10px] mt-1 text-slate-400 leading-tight">
                      {f.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Schedule Times Customization */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              Scheduled Cue Times
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div>
                <label className="text-[10px] text-slate-400 font-medium block mb-1">
                  ☀️ Morning Kickoff
                </label>
                <input
                  type="time"
                  value={settings.schedules.morningTime}
                  onChange={(e) =>
                    onUpdateSettings({
                      schedules: { ...settings.schedules, morningTime: e.target.value },
                    })
                  }
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-100 font-mono focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-medium block mb-1">
                  🥗 Midday Check
                </label>
                <input
                  type="time"
                  value={settings.schedules.afternoonTime}
                  onChange={(e) =>
                    onUpdateSettings({
                      schedules: { ...settings.schedules, afternoonTime: e.target.value },
                    })
                  }
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-100 font-mono focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-medium block mb-1">
                  🌆 Evening Wrap-up
                </label>
                <input
                  type="time"
                  value={settings.schedules.eveningTime}
                  onChange={(e) =>
                    onUpdateSettings({
                      schedules: { ...settings.schedules, eveningTime: e.target.value },
                    })
                  }
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-100 font-mono focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-medium block mb-1">
                  🎯 Night Review
                </label>
                <input
                  type="time"
                  value={settings.schedules.nightTime}
                  onChange={(e) =>
                    onUpdateSettings({
                      schedules: { ...settings.schedules, nightTime: e.target.value },
                    })
                  }
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-100 font-mono focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Intelligence & Feedback Toggles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <label className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between cursor-pointer">
              <span className="flex items-center gap-2 text-slate-300 font-medium">
                <Target className="w-4 h-4 text-indigo-400" />
                Connect to Financial Goals
              </span>
              <input
                type="checkbox"
                checked={settings.goalNudgesEnabled}
                onChange={(e) => onUpdateSettings({ goalNudgesEnabled: e.target.checked })}
                className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500 bg-slate-800 border-slate-700"
              />
            </label>

            <label className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between cursor-pointer">
              <span className="flex items-center gap-2 text-slate-300 font-medium">
                <Flame className="w-4 h-4 text-amber-400" />
                Streak Saver Alerts
              </span>
              <input
                type="checkbox"
                checked={settings.streakRemindersEnabled}
                onChange={(e) => onUpdateSettings({ streakRemindersEnabled: e.target.checked })}
                className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500 bg-slate-800 border-slate-700"
              />
            </label>

            <label className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between cursor-pointer">
              <span className="flex items-center gap-2 text-slate-300 font-medium">
                <Volume2 className="w-4 h-4 text-emerald-400" />
                Audio Chime
              </span>
              <input
                type="checkbox"
                checked={settings.soundEnabled}
                onChange={(e) => onUpdateSettings({ soundEnabled: e.target.checked })}
                className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500 bg-slate-800 border-slate-700"
              />
            </label>

            <label className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between cursor-pointer">
              <span className="flex items-center gap-2 text-slate-300 font-medium">
                <Vibrate className="w-4 h-4 text-emerald-400" />
                Haptic Vibration
              </span>
              <input
                type="checkbox"
                checked={settings.vibrationEnabled}
                onChange={(e) => onUpdateSettings({ vibrationEnabled: e.target.checked })}
                className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500 bg-slate-800 border-slate-700"
              />
            </label>
          </div>

          {/* Quiet Hours */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-slate-400" />
              <div>
                <span className="text-xs font-bold text-slate-200">Quiet Hours (Do Not Disturb)</span>
                <p className="text-[11px] text-slate-400">Silence reminders during your sleep hours</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="time"
                value={settings.quietHoursStart}
                onChange={(e) => onUpdateSettings({ quietHoursStart: e.target.value })}
                className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-100 font-mono focus:border-emerald-500 focus:outline-none"
              />
              <span className="text-xs text-slate-500">to</span>
              <input
                type="time"
                value={settings.quietHoursEnd}
                onChange={(e) => onUpdateSettings({ quietHoursEnd: e.target.value })}
                className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-100 font-mono focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Test Action */}
          <div className="pt-1 flex items-center justify-between">
            <span className="text-xs text-slate-400">
              Verify sound, vibration, and banner on this device
            </span>
            <button
              type="button"
              onClick={handleTest}
              className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition"
            >
              <Play className="w-3.5 h-3.5 text-emerald-400" />
              <span>{testSent ? 'Notification Triggered!' : 'Test Cue Now'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
