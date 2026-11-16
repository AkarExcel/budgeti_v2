'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Transaction,
  FinancialGoal,
  Budget,
  HabitNotificationSettings,
  HabitReminder,
  HabitStatus,
  NotificationHistoryRecord,
} from '@/types';
import {
  DEFAULT_NOTIFICATION_SETTINGS,
  evaluateHabitReminder,
  getHabitStatus,
  generateContextualReminder,
  getDayPart,
  calculateHabitStreak,
  getTodayTransactions,
} from './reminderAlgorithm';
import {
  isNotificationSupported,
  getNotificationPermission,
  requestNotificationPermission,
  sendBrowserNotification,
  playNotificationChime,
  triggerVibration,
} from './webNotification';

const SETTINGS_STORAGE_KEY = 'budgeti_habit_reminder_settings';
const HISTORY_STORAGE_KEY = 'budgeti_habit_notification_history';

interface UseHabitRemindersProps {
  transactions?: Transaction[];
  goals?: FinancialGoal[];
  budgets?: Budget[];
  onOpenAddModal?: () => void;
}

export function useHabitReminders({
  transactions = [],
  goals = [],
  budgets = [],
  onOpenAddModal,
}: UseHabitRemindersProps = {}) {
  const [settings, setSettings] = useState<HabitNotificationSettings>(DEFAULT_NOTIFICATION_SETTINGS);
  const [history, setHistory] = useState<NotificationHistoryRecord[]>([]);
  const [activeReminder, setActiveReminder] = useState<HabitReminder | null>(null);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isClient, setIsClient] = useState(false);

  // Keep ref to latest onOpenAddModal to avoid stale closures
  const onOpenAddModalRef = useRef(onOpenAddModal);
  useEffect(() => {
    onOpenAddModalRef.current = onOpenAddModal;
  }, [onOpenAddModal]);

  // Load settings and history from localStorage on mount
  useEffect(() => {
    setIsClient(true);
    if (typeof window === 'undefined') return;

    if (isNotificationSupported()) {
      setPermission(getNotificationPermission());
    }

    try {
      const storedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (storedSettings) {
        setSettings((prev) => ({ ...prev, ...JSON.parse(storedSettings) }));
      }
    } catch (e) {
      console.error('Failed to parse reminder settings:', e);
    }

    try {
      const storedHistory = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory));
      }
    } catch (e) {
      console.error('Failed to parse notification history:', e);
    }
  }, []);

  // Update Settings
  const updateSettings = useCallback((newSettings: Partial<HabitNotificationSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      if (typeof window !== 'undefined') {
        localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updated));
      }
      return updated;
    });
  }, []);

  // Save history to localStorage
  const saveHistory = useCallback((newHistory: NotificationHistoryRecord[]) => {
    // Keep at most 50 historical entries
    const trimmed = newHistory.slice(0, 50);
    setHistory(trimmed);
    if (typeof window !== 'undefined') {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(trimmed));
    }
  }, []);

  // Habit status
  const habitStatus: HabitStatus = getHabitStatus({
    transactions,
    goals,
    budgets,
    settings,
    history,
  });

  // Check reminders
  const checkAndTriggerReminders = useCallback(() => {
    if (!settings.enabled) {
      setActiveReminder(null);
      return;
    }

    const now = new Date();
    const evaluation = evaluateHabitReminder({
      currentTime: now,
      transactions,
      goals,
      budgets,
      settings,
      history,
    });

    if (evaluation.shouldNotify && evaluation.reminder) {
      const reminder = evaluation.reminder;
      setActiveReminder(reminder);

      // Check if this reminder was already dispatched as a system notification
      const alreadySent = history.some(
        (h) => h.id === reminder.id && (h.status === 'sent' || h.status === 'snoozed' || h.status === 'dismissed')
      );

      if (!alreadySent) {
        // Play chime if enabled
        if (settings.soundEnabled) {
          playNotificationChime();
        }

        // Trigger vibration if enabled
        if (settings.vibrationEnabled) {
          triggerVibration();
        }

        // Send browser notification if permission granted
        if (settings.browserNotifications && permission === 'granted') {
          sendBrowserNotification(reminder, () => {
            if (onOpenAddModalRef.current) {
              onOpenAddModalRef.current();
            }
          });
        }

        // Record into history
        const newRecord: NotificationHistoryRecord = {
          id: reminder.id,
          reminder,
          status: 'sent',
          createdAt: now.toISOString(),
        };

        saveHistory([newRecord, ...history]);
      }
    } else {
      // If condition no longer matches (or dismissed), clear active in-app reminder
      if (!evaluation.reminder) {
        setActiveReminder(null);
      }
    }
  }, [settings, transactions, goals, budgets, history, permission, saveHistory]);

  // Periodic reminder checking loop (every 60 seconds)
  useEffect(() => {
    if (!isClient) return;

    checkAndTriggerReminders();
    const interval = setInterval(checkAndTriggerReminders, 60000);
    return () => clearInterval(interval);
  }, [isClient, checkAndTriggerReminders]);

  // Snooze active reminder
  const snoozeReminder = useCallback(
    (reminderId: string, minutes = 60) => {
      const now = new Date();
      const snoozedUntil = new Date(now.getTime() + minutes * 60000).toISOString();

      const updatedHistory: NotificationHistoryRecord[] = history.map((h) => {
        if (h.id === reminderId || (activeReminder && h.id === activeReminder.id)) {
          return { ...h, status: 'snoozed', snoozedUntil };
        }
        return h;
      });

      if (!updatedHistory.some((h) => h.id === reminderId)) {
        if (activeReminder) {
          updatedHistory.unshift({
            id: activeReminder.id,
            reminder: activeReminder,
            status: 'snoozed',
            createdAt: now.toISOString(),
            snoozedUntil,
          });
        }
      }

      saveHistory(updatedHistory);
      setActiveReminder(null);
    },
    [history, activeReminder, saveHistory]
  );

  // Dismiss reminder
  const dismissReminder = useCallback(
    (reminderId: string) => {
      const now = new Date();
      const updatedHistory: NotificationHistoryRecord[] = history.map((h) => {
        if (h.id === reminderId || (activeReminder && h.id === activeReminder.id)) {
          return { ...h, status: 'dismissed' };
        }
        return h;
      });

      if (!updatedHistory.some((h) => h.id === reminderId)) {
        if (activeReminder) {
          updatedHistory.unshift({
            id: activeReminder.id,
            reminder: activeReminder,
            status: 'dismissed',
            createdAt: now.toISOString(),
          });
        }
      }

      saveHistory(updatedHistory);
      setActiveReminder(null);
    },
    [history, activeReminder, saveHistory]
  );

  // Mark reminder as read
  const markReminderRead = useCallback(
    (reminderId: string) => {
      const updatedHistory = history.map((h) => {
        if (h.id === reminderId) {
          return {
            ...h,
            reminder: { ...h.reminder, read: true },
          };
        }
        return h;
      });
      saveHistory(updatedHistory);
    },
    [history, saveHistory]
  );

  // Request browser permission
  const requestPermission = useCallback(async () => {
    const perm = await requestNotificationPermission();
    setPermission(perm);
    if (perm === 'granted') {
      updateSettings({ browserNotifications: true });
    } else {
      updateSettings({ browserNotifications: false });
    }
    return perm;
  }, [updateSettings]);

  // Instant test reminder
  const triggerTestReminder = useCallback(() => {
    const now = new Date();
    const daypart = getDayPart(now);
    const streak = calculateHabitStreak(transactions, now);
    const todayTx = getTodayTransactions(transactions, now);

    const testReminder = generateContextualReminder({
      currentTime: now,
      daypart,
      streak,
      todayTransactions: todayTx,
      goals,
      budgets,
      settings,
    });

    testReminder.title = `🔔 [Test] ${testReminder.title}`;
    setActiveReminder(testReminder);

    if (settings.soundEnabled) playNotificationChime();
    if (settings.vibrationEnabled) triggerVibration();

    if (permission === 'granted' || Notification?.permission === 'granted') {
      sendBrowserNotification(testReminder, () => {
        if (onOpenAddModalRef.current) {
          onOpenAddModalRef.current();
        }
      });
    }

    const newRecord: NotificationHistoryRecord = {
      id: `test-${Date.now()}`,
      reminder: testReminder,
      status: 'sent',
      createdAt: now.toISOString(),
    };
    saveHistory([newRecord, ...history]);

    return testReminder;
  }, [transactions, goals, budgets, settings, permission, history, saveHistory]);

  const unreadCount = history.filter((h) => !h.reminder.read && h.status === 'sent').length;

  return {
    settings,
    updateSettings,
    habitStatus,
    activeReminder,
    history,
    unreadCount,
    permission,
    snoozeReminder,
    dismissReminder,
    markReminderRead,
    requestPermission,
    triggerTestReminder,
    checkAndTriggerReminders,
  };
}
