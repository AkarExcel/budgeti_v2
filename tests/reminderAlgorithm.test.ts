import { describe, it, expect } from 'vitest';
import {
  getDayPart,
  isQuietHours,
  calculateHabitStreak,
  getTodayTransactions,
  getDaypartsLoggedToday,
  getNextReminderTimeString,
  generateContextualReminder,
  evaluateHabitReminder,
  getHabitStatus,
  DEFAULT_NOTIFICATION_SETTINGS,
} from '../src/lib/notifications/reminderAlgorithm';
import { Transaction, FinancialGoal, HabitNotificationSettings } from '../src/types';

describe('Habit Reminder Algorithm', () => {
  describe('getDayPart', () => {
    it('correctly maps hours to dayparts', () => {
      // 08:30 -> morning
      const morningDate = new Date('2026-11-16T08:30:00');
      expect(getDayPart(morningDate)).toBe('morning');

      // 13:00 -> afternoon
      const afternoonDate = new Date('2026-11-16T13:00:00');
      expect(getDayPart(afternoonDate)).toBe('afternoon');

      // 18:30 -> evening
      const eveningDate = new Date('2026-11-16T18:30:00');
      expect(getDayPart(eveningDate)).toBe('evening');

      // 22:30 -> night
      const nightDate = new Date('2026-11-16T22:30:00');
      expect(getDayPart(nightDate)).toBe('night');

      // 02:00 -> night
      const lateNightDate = new Date('2026-11-16T02:00:00');
      expect(getDayPart(lateNightDate)).toBe('night');
    });
  });

  describe('isQuietHours', () => {
    const settings: HabitNotificationSettings = {
      ...DEFAULT_NOTIFICATION_SETTINGS,
      quietHoursEnabled: true,
      quietHoursStart: '22:30',
      quietHoursEnd: '07:30',
    };

    it('identifies overnight quiet hours accurately', () => {
      expect(isQuietHours(new Date('2026-11-16T23:00:00'), settings)).toBe(true);
      expect(isQuietHours(new Date('2026-11-16T05:00:00'), settings)).toBe(true);
      expect(isQuietHours(new Date('2026-11-16T07:29:00'), settings)).toBe(true);
      expect(isQuietHours(new Date('2026-11-16T08:00:00'), settings)).toBe(false);
      expect(isQuietHours(new Date('2026-11-16T14:00:00'), settings)).toBe(false);
      expect(isQuietHours(new Date('2026-11-16T22:00:00'), settings)).toBe(false);
    });

    it('returns false when quiet hours are disabled', () => {
      const disabledSettings = { ...settings, quietHoursEnabled: false };
      expect(isQuietHours(new Date('2026-11-16T23:00:00'), disabledSettings)).toBe(false);
    });
  });

  describe('calculateHabitStreak', () => {
    const refDate = new Date('2026-11-16T14:00:00');

    it('returns 0 when no transactions exist', () => {
      expect(calculateHabitStreak([], refDate)).toBe(0);
    });

    it('returns 1 when transaction was logged today only', () => {
      const txs: Transaction[] = [
        {
          id: '1',
          date: '2026-11-16',
          type: 'expense',
          category: 'Food',
          description: 'Lunch',
          amount: 2500,
          account: 'GTBank',
          created_at: '2026-11-16T13:00:00',
          updated_at: '2026-11-16T13:00:00',
        },
      ];
      expect(calculateHabitStreak(txs, refDate)).toBe(1);
    });

    it('maintains streak from yesterday when today has not yet been logged', () => {
      const txs: Transaction[] = [
        {
          id: '1',
          date: '2026-11-15',
          type: 'expense',
          category: 'Food',
          description: 'Dinner yesterday',
          amount: 3000,
          account: 'GTBank',
          created_at: '2026-11-15T19:00:00',
          updated_at: '2026-11-15T19:00:00',
        },
        {
          id: '2',
          date: '2026-11-14',
          type: 'income',
          category: 'Salary',
          description: 'Payment',
          amount: 50000,
          account: 'GTBank',
          created_at: '2026-11-14T10:00:00',
          updated_at: '2026-11-14T10:00:00',
        },
      ];
      // 2 consecutive days (14th & 15th), today (16th) not logged yet
      expect(calculateHabitStreak(txs, refDate)).toBe(2);
    });

    it('correctly counts multi-day streak including today', () => {
      const txs: Transaction[] = [
        { id: '1', date: '2026-11-16', type: 'expense', category: 'Food', description: 'Lunch', amount: 2000, account: 'GTBank', created_at: '', updated_at: '' },
        { id: '2', date: '2026-11-15', type: 'expense', category: 'Transport', description: 'Bus', amount: 1000, account: 'GTBank', created_at: '', updated_at: '' },
        { id: '3', date: '2026-11-14', type: 'expense', category: 'Utilities', description: 'Bill', amount: 5000, account: 'GTBank', created_at: '', updated_at: '' },
        { id: '4', date: '2026-11-13', type: 'expense', category: 'Groceries', description: 'Food', amount: 8000, account: 'GTBank', created_at: '', updated_at: '' },
      ];
      expect(calculateHabitStreak(txs, refDate)).toBe(4);
    });

    it('breaks streak when a day is missing', () => {
      const txs: Transaction[] = [
        { id: '1', date: '2026-11-16', type: 'expense', category: 'Food', description: 'Lunch', amount: 2000, account: 'GTBank', created_at: '', updated_at: '' },
        // Missed 2026-11-15!
        { id: '2', date: '2026-11-14', type: 'expense', category: 'Transport', description: 'Bus', amount: 1000, account: 'GTBank', created_at: '', updated_at: '' },
      ];
      expect(calculateHabitStreak(txs, refDate)).toBe(1);
    });
  });

  describe('getTodayTransactions & getDaypartsLoggedToday', () => {
    const refDate = new Date('2026-11-16T14:00:00');
    const txs: Transaction[] = [
      { id: '1', date: '2026-11-16', type: 'expense', category: 'Food', description: 'Breakfast', amount: 1500, account: 'GTBank', created_at: '2026-11-16T08:30:00', updated_at: '' },
      { id: '2', date: '2026-11-16', type: 'income', category: 'Freelance', description: 'Client fee', amount: 25000, account: 'GTBank', created_at: '2026-11-16T13:15:00', updated_at: '' },
      { id: '3', date: '2026-11-15', type: 'expense', category: 'Food', description: 'Yesterday lunch', amount: 2000, account: 'GTBank', created_at: '2026-11-15T12:00:00', updated_at: '' },
    ];

    it('filters today transactions correctly', () => {
      const today = getTodayTransactions(txs, refDate);
      expect(today).toHaveLength(2);
      expect(today.map((t) => t.id)).toEqual(['1', '2']);
    });

    it('categorizes dayparts logged today', () => {
      const dayparts = getDaypartsLoggedToday(txs, refDate);
      expect(dayparts.morning).toBe(true);
      expect(dayparts.afternoon).toBe(true);
      expect(dayparts.evening).toBe(false);
      expect(dayparts.night).toBe(false);
    });
  });

  describe('generateContextualReminder & evaluateHabitReminder', () => {
    const goals: FinancialGoal[] = [
      {
        id: 'goal-1',
        name: 'Emergency Fund',
        target_amount: 1000000,
        current_amount: 450000,
        target_date: '2026-12-31',
        status: 'in_progress',
        created_at: '2026-01-01',
        updated_at: '2026-01-01',
      },
    ];

    it('creates streak-saver alert when evening arrives with no transactions logged', () => {
      const eveningDate = new Date('2026-11-16T19:30:00');
      const yesterdayTx: Transaction[] = [
        { id: '1', date: '2026-11-15', type: 'expense', category: 'Food', description: 'Lunch', amount: 2000, account: 'GTBank', created_at: '', updated_at: '' },
      ];

      const res = evaluateHabitReminder({
        currentTime: eveningDate,
        transactions: yesterdayTx,
        goals,
      });

      expect(res.shouldNotify).toBe(true);
      expect(res.reminder?.cueType).toBe('streak_save');
      expect(res.reminder?.urgency).toBe('important');
      expect(res.reminder?.title).toContain('Protect Your 1-Day Streak');
    });

    it('creates encouraging positive reinforcement when user has logged today', () => {
      const afternoonDate = new Date('2026-11-16T14:30:00');
      const todayTx: Transaction[] = [
        { id: '1', date: '2026-11-16', type: 'expense', category: 'Food', description: 'Lunch', amount: 2000, account: 'GTBank', created_at: '2026-11-16T13:00:00', updated_at: '' },
      ];

      const res = evaluateHabitReminder({
        currentTime: afternoonDate,
        transactions: todayTx,
        goals,
      });

      expect(res.reminder?.cueType).toBe('positive_reinforcement');
      expect(res.reminder?.title).toContain('Great Consistency');
      expect(res.reminder?.message).toContain('Emergency Fund');
    });

    it('suppresses reminders during quiet hours', () => {
      const lateNightDate = new Date('2026-11-16T23:30:00');
      const res = evaluateHabitReminder({
        currentTime: lateNightDate,
        transactions: [],
        goals,
      });

      expect(res.shouldNotify).toBe(false);
      expect(res.reason).toContain('quiet hours');
    });

    it('suppresses notifications when disabled in settings', () => {
      const res = evaluateHabitReminder({
        currentTime: new Date('2026-11-16T12:00:00'),
        transactions: [],
        settings: { ...DEFAULT_NOTIFICATION_SETTINGS, enabled: false },
      });

      expect(res.shouldNotify).toBe(false);
      expect(res.reason).toContain('disabled');
    });

    it('computes next reminder time string cleanly', () => {
      const morningTime = new Date('2026-11-16T10:00:00');
      const nextStr = getNextReminderTimeString(morningTime, DEFAULT_NOTIFICATION_SETTINGS);
      expect(nextStr).toBe('Today at 13:30');
    });

    it('computes complete habit status', () => {
      const refDate = new Date('2026-11-16T15:00:00');
      const txs: Transaction[] = [
        { id: '1', date: '2026-11-16', type: 'income', category: 'Salary', description: 'Deposit', amount: 200000, account: 'GTBank', created_at: '2026-11-16T09:00:00', updated_at: '' },
        { id: '2', date: '2026-11-16', type: 'expense', category: 'Food', description: 'Lunch', amount: 3500, account: 'GTBank', created_at: '2026-11-16T13:30:00', updated_at: '' },
      ];

      const status = getHabitStatus({
        currentTime: refDate,
        transactions: txs,
        goals,
      });

      expect(status.streak).toBe(1);
      expect(status.hasLoggedToday).toBe(true);
      expect(status.loggedCountToday).toBe(2);
      expect(status.incomeCountToday).toBe(1);
      expect(status.expenseCountToday).toBe(1);
      expect(status.daypartsLogged.morning).toBe(true);
      expect(status.daypartsLogged.afternoon).toBe(true);
      expect(status.currentCue).not.toBeNull();
    });
  });
});
