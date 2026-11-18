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

const EMPTY_TRANSACTIONS: Transaction[] = [];
const EMPTY_GOALS: FinancialGoal[] = [];
const EMPTY_BUDGETS: Budget[] = [];

interface UseHabitRemindersProps {
  transactions?: Transaction[];
  goals?: FinancialGoal[];
  budgets?: Budget[];
  onOpenAddModal?: () => void;
}

export function useHabitReminders({
  transactions = EMPTY_TRANSACTIONS,
  goals = EMPTY_GOALS,
  budgets = EMPTY_BUDGETS,
  onOpenAddModal,
}: UseHabitRemindersProps = {}) {
  const [settings, setSettings] = useState<HabitNotificationSettings>(DEFAULT_NOTIFICATION_SETTINGS);
  const [history, setHistory] = useState<NotificationHistoryRecord[]>([]);
  const [activeReminder, setActiveReminder] = useState<HabitReminder | null>(null);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isClient, setIsClient] = useState(false);

  // Keep refs to avoid infinite loops and stale closures in callbacks
  const transactionsRef = useRef(transactions);
  const goalsRef = useRef(goals);
  const budgetsRef = useRef(budgets);
  const settingsRef = useRef(settings);
  const historyRef = useRef(history);
  const permissionRef = useRef(permission);
  const onOpenAddModalRef = useRef(onOpenAddModal);

  useEffect(() => {
    transactionsRef.current = transactions;
    goalsRef.current = goals;
    budgetsRef.current = budgets;
    settingsRef.current = settings;
    historyRef.current = history;
    permissionRef.current = permission;
    onOpenAddModalRef.current = onOpenAddModal;
  });

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

  // Save history to state and localStorage (supports functional updater)
  const saveHistory = useCallback(
    (updater: NotificationHistoryRecord[] | ((prev: NotificationHistoryRecord[]) => NotificationHistoryRecord[])) => {
      setHistory((prev) => {
        const next = typeof updater === 'function' ? updater(prev) : updater;
        const trimmed = next.slice(0, 50);
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(trimmed));
          } catch {
            // ignore
          }
        }
        return trimmed;
      });
    },
    []
  );

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
    const curSettings = settingsRef.current;
    if (!curSettings.enabled) {
      setActiveReminder((prev) => (prev ? null : prev));
      return;
    }

    const now = new Date();
    const curTransactions = transactionsRef.current;
    const curGoals = goalsRef.current;
    const curBudgets = budgetsRef.current;
    const curHistory = historyRef.current;
    const curPermission = permissionRef.current;

    const evaluation = evaluateHabitReminder({
      currentTime: now,
      transactions: curTransactions,
      goals: curGoals,
      budgets: curBudgets,
      settings: curSettings,
      history: curHistory,
    });

    if (evaluation.shouldNotify && evaluation.reminder) {
      const reminder = evaluation.reminder;
      setActiveReminder((prev) => {
        if (
          prev &&
          prev.id === reminder.id &&
          prev.title === reminder.title &&
          prev.message === reminder.message
        ) {
          return prev;
        }
        return reminder;
      });

      // Check if this reminder was already dispatched as a system notification
      const alreadySent = curHistory.some(
        (h) => h.id === reminder.id && (h.status === 'sent' || h.status === 'snoozed' || h.status === 'dismissed')
      );

      if (!alreadySent) {
        // Play chime if enabled
        if (curSettings.soundEnabled) {
          playNotificationChime();
        }

        // Trigger vibration if enabled
        if (curSettings.vibrationEnabled) {
          triggerVibration();
        }

        // Send browser notification if permission granted
        if (curSettings.browserNotifications && curPermission === 'granted') {
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

        saveHistory((prev) => [newRecord, ...prev]);
      }
    } else {
      // If condition no longer matches (or dismissed), clear active in-app reminder
      if (!evaluation.reminder) {
        setActiveReminder((prev) => (prev ? null : prev));
      }
    }
  }, [saveHistory]);

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

      saveHistory((prev) => {
        const updated = prev.map((h) => {
          if (h.id === reminderId || (activeReminder && h.id === activeReminder.id)) {
            return { ...h, status: 'snoozed' as const, snoozedUntil };
          }
          return h;
        });

        if (!updated.some((h) => h.id === reminderId)) {
          if (activeReminder) {
            updated.unshift({
              id: activeReminder.id,
              reminder: activeReminder,
              status: 'snoozed',
              createdAt: now.toISOString(),
              snoozedUntil,
            });
          }
        }
        return updated;
      });

      setActiveReminder(null);
    },
    [activeReminder, saveHistory]
  );

  // Dismiss reminder
  const dismissReminder = useCallback(
    (reminderId: string) => {
      const now = new Date();
      saveHistory((prev) => {
        const updated = prev.map((h) => {
          if (h.id === reminderId || (activeReminder && h.id === activeReminder.id)) {
            return { ...h, status: 'dismissed' as const };
          }
          return h;
        });

        if (!updated.some((h) => h.id === reminderId)) {
          if (activeReminder) {
            updated.unshift({
              id: activeReminder.id,
              reminder: activeReminder,
              status: 'dismissed',
              createdAt: now.toISOString(),
            });
          }
        }
        return updated;
      });

      setActiveReminder(null);
    },
    [activeReminder, saveHistory]
  );

  // Mark reminder as read
  const markReminderRead = useCallback(
    (reminderId: string) => {
      saveHistory((prev) =>
        prev.map((h) => {
          if (h.id === reminderId) {
            return {
              ...h,
              reminder: { ...h.reminder, read: true },
            };
          }
          return h;
        })
      );
    },
    [saveHistory]
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
    const curTransactions = transactionsRef.current;
    const curGoals = goalsRef.current;
    const curBudgets = budgetsRef.current;
    const curSettings = settingsRef.current;
    const curPermission = permissionRef.current;

    const daypart = getDayPart(now);
    const streak = calculateHabitStreak(curTransactions, now);
    const todayTx = getTodayTransactions(curTransactions, now);

    const testReminder = generateContextualReminder({
      currentTime: now,
      daypart,
      streak,
      todayTransactions: todayTx,
      goals: curGoals,
      budgets: curBudgets,
      settings: curSettings,
    });

    testReminder.title = `🔔 [Test] ${testReminder.title}`;
    setActiveReminder(testReminder);

    if (curSettings.soundEnabled) playNotificationChime();
    if (curSettings.vibrationEnabled) triggerVibration();

    if (curPermission === 'granted' || (typeof Notification !== 'undefined' && Notification.permission === 'granted')) {
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
    saveHistory((prev) => [newRecord, ...prev]);

    return testReminder;
  }, [saveHistory]);

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
