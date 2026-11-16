import {
  Transaction,
  FinancialGoal,
  Budget,
  DayPart,
  HabitNotificationSettings,
  HabitReminder,
  HabitStatus,
  ReminderCueType,
  ReminderUrgency,
  NotificationHistoryRecord,
} from '@/types';

export const DEFAULT_NOTIFICATION_SETTINGS: HabitNotificationSettings = {
  enabled: true,
  frequency: 'balanced',
  customTimes: ['09:00', '13:30', '18:30'],
  schedules: {
    morningTime: '09:00',
    afternoonTime: '13:30',
    eveningTime: '18:30',
    nightTime: '21:30',
  },
  browserNotifications: false,
  soundEnabled: true,
  vibrationEnabled: true,
  goalNudgesEnabled: true,
  streakRemindersEnabled: true,
  quietHoursEnabled: true,
  quietHoursStart: '22:30',
  quietHoursEnd: '07:30',
};

/**
 * Format a Date object to YYYY-MM-DD in local time
 */
export function formatDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Determines current daypart from a given date
 * - Morning: 05:00 - 11:59
 * - Afternoon: 12:00 - 16:59
 * - Evening: 17:00 - 20:59
 * - Night: 21:00 - 04:59
 */
export function getDayPart(date: Date = new Date()): DayPart {
  const hour = date.getHours();
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
}

/**
 * Checks if a given time is within quiet hours
 */
export function isQuietHours(
  date: Date,
  settings: HabitNotificationSettings
): boolean {
  if (!settings.quietHoursEnabled) return false;

  const [startH, startM] = settings.quietHoursStart.split(':').map(Number);
  const [endH, endM] = settings.quietHoursEnd.split(':').map(Number);

  const currentMinutes = date.getHours() * 60 + date.getMinutes();
  const startMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;

  if (startMinutes > endMinutes) {
    // Overnight interval e.g. 22:30 to 07:30
    return currentMinutes >= startMinutes || currentMinutes < endMinutes;
  } else {
    // Same day interval
    return currentMinutes >= startMinutes && currentMinutes < endMinutes;
  }
}

/**
 * Calculates consecutive days of logged transactions (Habit Streak)
 */
export function calculateHabitStreak(
  transactions: Transaction[] = [],
  referenceDate: Date = new Date()
): number {
  if (!transactions.length) return 0;

  // Set of dates with transactions in YYYY-MM-DD
  const activeDates = new Set<string>();
  for (const t of transactions) {
    if (t.date) {
      activeDates.add(t.date.slice(0, 10));
    }
  }

  const todayStr = formatDateKey(referenceDate);
  const yesterday = new Date(referenceDate);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = formatDateKey(yesterday);

  // Check if streak is active (logged today OR yesterday)
  const hasLoggedToday = activeDates.has(todayStr);
  const hasLoggedYesterday = activeDates.has(yesterdayStr);

  if (!hasLoggedToday && !hasLoggedYesterday) {
    return 0;
  }

  let streak = 0;
  const checkDate = new Date(referenceDate);

  // If haven't logged today yet, start counting back from yesterday
  if (!hasLoggedToday) {
    checkDate.setDate(checkDate.getDate() - 1);
  }

  while (true) {
    const key = formatDateKey(checkDate);
    if (activeDates.has(key)) {
      streak += 1;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

/**
 * Filter transactions for today
 */
export function getTodayTransactions(
  transactions: Transaction[] = [],
  referenceDate: Date = new Date()
): Transaction[] {
  const todayStr = formatDateKey(referenceDate);
  return transactions.filter((t) => t.date && t.date.startsWith(todayStr));
}

/**
 * Categorizes which dayparts have logged transactions today
 */
export function getDaypartsLoggedToday(
  transactions: Transaction[] = [],
  referenceDate: Date = new Date()
): { morning: boolean; afternoon: boolean; evening: boolean; night: boolean } {
  const todayTx = getTodayTransactions(transactions, referenceDate);
  const dayparts = {
    morning: false,
    afternoon: false,
    evening: false,
    night: false,
  };

  for (const t of todayTx) {
    // If created_at is available, use its hour
    if (t.created_at) {
      try {
        const d = new Date(t.created_at);
        if (!isNaN(d.getTime())) {
          const part = getDayPart(d);
          dayparts[part] = true;
          continue;
        }
      } catch {
        // Fallback below
      }
    }
    // Fallback: If transaction was logged, associate with current daypart or afternoon
    const currentPart = getDayPart(referenceDate);
    dayparts[currentPart] = true;
  }

  return dayparts;
}

/**
 * Parses "HH:mm" time string into minutes from midnight
 */
export function parseTimeToMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

/**
 * Checks if the current time matches a scheduled reminder slot within a window (e.g., +/- 15 mins)
 * or if a slot hasn't been fired yet today
 */
export function getActiveScheduledSlot(
  currentTime: Date,
  settings: HabitNotificationSettings
): { slot: DayPart; scheduledTime: string } | null {
  const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();

  const slots: { slot: DayPart; timeStr: string }[] = [];

  if (settings.frequency === 'gentle') {
    // 1x per day in evening
    slots.push({ slot: 'evening', timeStr: settings.schedules.eveningTime });
  } else if (settings.frequency === 'balanced') {
    // 3x per day
    slots.push({ slot: 'morning', timeStr: settings.schedules.morningTime });
    slots.push({ slot: 'afternoon', timeStr: settings.schedules.afternoonTime });
    slots.push({ slot: 'evening', timeStr: settings.schedules.eveningTime });
  } else if (settings.frequency === 'frequent') {
    // 4x per day
    slots.push({ slot: 'morning', timeStr: settings.schedules.morningTime });
    slots.push({ slot: 'afternoon', timeStr: settings.schedules.afternoonTime });
    slots.push({ slot: 'evening', timeStr: settings.schedules.eveningTime });
    slots.push({ slot: 'night', timeStr: settings.schedules.nightTime });
  } else if (settings.frequency === 'custom') {
    // Custom list of times mapped to dayparts
    for (const timeStr of settings.customTimes) {
      const mins = parseTimeToMinutes(timeStr);
      const h = Math.floor(mins / 60);
      const fakeDate = new Date(currentTime);
      fakeDate.setHours(h);
      slots.push({ slot: getDayPart(fakeDate), timeStr });
    }
  }

  // Find slot where currentTime has passed the scheduled time, but by less than 180 minutes (3 hours)
  // or matches within a reasonable execution window
  for (const s of slots) {
    const slotMinutes = parseTimeToMinutes(s.timeStr);
    const diff = currentMinutes - slotMinutes;
    // Current time is between slot time and slot + 180 mins
    if (diff >= 0 && diff < 180) {
      return { slot: s.slot, scheduledTime: s.timeStr };
    }
  }

  // Fallback: return current daypart
  const currentPart = getDayPart(currentTime);
  return { slot: currentPart, scheduledTime: settings.schedules[`${currentPart}Time` as keyof typeof settings.schedules] || '12:00' };
}

/**
 * Returns the next upcoming reminder time as a human-friendly string
 */
export function getNextReminderTimeString(
  currentTime: Date,
  settings: HabitNotificationSettings
): string {
  if (!settings.enabled) return 'Disabled';

  const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
  const times: string[] = [];

  if (settings.frequency === 'gentle') {
    times.push(settings.schedules.eveningTime);
  } else if (settings.frequency === 'balanced') {
    times.push(settings.schedules.morningTime, settings.schedules.afternoonTime, settings.schedules.eveningTime);
  } else if (settings.frequency === 'frequent') {
    times.push(
      settings.schedules.morningTime,
      settings.schedules.afternoonTime,
      settings.schedules.eveningTime,
      settings.schedules.nightTime
    );
  } else {
    times.push(...settings.customTimes);
  }

  times.sort((a, b) => parseTimeToMinutes(a) - parseTimeToMinutes(b));

  for (const t of times) {
    if (parseTimeToMinutes(t) > currentMinutes) {
      return `Today at ${t}`;
    }
  }

  return `Tomorrow at ${times[0] || '09:00'}`;
}

/**
 * Creates the habit reminder cue with motivating, habit-building copy
 */
export function generateContextualReminder(params: {
  currentTime: Date;
  daypart: DayPart;
  streak: number;
  todayTransactions: Transaction[];
  goals: FinancialGoal[];
  budgets: Budget[];
  settings: HabitNotificationSettings;
}): HabitReminder {
  const { currentTime, daypart, streak, todayTransactions, goals, settings } = params;
  const todayCount = todayTransactions.length;
  const todayStr = formatDateKey(currentTime);

  // Select an active financial goal if available
  const activeGoal = goals.find((g) => g.status === 'in_progress' || (g.current_amount < g.target_amount && g.status !== 'completed')) || goals[0];
  const goalContext = activeGoal
    ? {
        goalId: activeGoal.id,
        goalName: activeGoal.name,
        progressPercent: Math.min(100, Math.round((activeGoal.current_amount / (activeGoal.target_amount || 1)) * 100)),
        targetAmount: activeGoal.target_amount,
        currentAmount: activeGoal.current_amount,
      }
    : undefined;

  let title = 'Finance Habit Reminder';
  let message = 'Take 15 seconds to log your expenses and income today.';
  let cueType: ReminderCueType = 'midday_check';
  let urgency: ReminderUrgency = 'standard';
  let suggestedAction: HabitReminder['suggestedAction'] = 'add_expense';

  // 1. Streak saver alert (High Priority)
  // If user has streak >= 1, 0 transactions logged today, and it's evening or night
  if (
    settings.streakRemindersEnabled &&
    streak >= 1 &&
    todayCount === 0 &&
    (daypart === 'evening' || daypart === 'night')
  ) {
    cueType = 'streak_save';
    urgency = 'important';
    title = `🔥 Protect Your ${streak}-Day Streak!`;
    message = `You haven't logged any finances yet today. Don't break the chain! Record your daily spend or income before midnight.`;
    suggestedAction = 'add_expense';
  }
  // 2. Already logged today positive reinforcement
  else if (todayCount > 0 && daypart !== 'night') {
    cueType = 'positive_reinforcement';
    urgency = 'gentle';
    title = `🌟 Great Consistency! (${todayCount} logged today)`;
    if (goalContext && settings.goalNudgesEnabled) {
      message = `You're staying disciplined! Keeping receipts up to date brings you closer to your "${goalContext.goalName}" goal (${goalContext.progressPercent}%).`;
    } else {
      message = `You've logged ${todayCount} transaction${todayCount > 1 ? 's' : ''} today. Any new expenses or income to add?`;
    }
    suggestedAction = 'add_expense';
  }
  // 3. Morning Kickoff
  else if (daypart === 'morning') {
    cueType = 'morning_kickoff';
    urgency = 'gentle';
    title = '☀️ Morning Financial Kickoff';
    if (streak > 0) {
      message = `Day ${streak + 1} begins! Set your intention today, check your daily budget, and remember to log morning coffee, commute, or breakfast.`;
    } else {
      message = `Start building your financial discipline today! Plan your day's budget and log expenses as they happen.`;
    }
    suggestedAction = 'add_expense';
  }
  // 4. Midday Lunch & Errands Check
  else if (daypart === 'afternoon') {
    cueType = 'midday_check';
    urgency = 'standard';
    title = '🥗 Midday Expense Check-in';
    if (goalContext && settings.goalNudgesEnabled) {
      message = `Did you grab lunch, pay transit, or make a purchase? Log it now to stop budget leaks and keep your "${goalContext.goalName}" goal on pace!`;
    } else {
      message = `Did you buy lunch, fuel up, or pay a bill? Log it while it's fresh in your mind so no expense is forgotten.`;
    }
    suggestedAction = 'add_expense';
  }
  // 5. Evening Wrap-up
  else if (daypart === 'evening') {
    cueType = 'evening_wrapup';
    urgency = todayCount === 0 ? 'important' : 'standard';
    title = '🌆 Evening Finance Wrap-up';
    if (todayCount === 0) {
      message = `Zero transactions recorded today. Take 30 seconds to log your dinner, transport, groceries, or any income received.`;
    } else {
      message = `Close out your day with zero untracked money. Wrap up dinner, groceries, or subscriptions.`;
    }
    suggestedAction = 'add_expense';
  }
  // 6. Nightly Review & Goal Reflection
  else {
    cueType = 'nightly_review';
    urgency = todayCount === 0 ? 'important' : 'gentle';
    title = '🎯 Nightly Review & Goal Alignment';
    if (goalContext && settings.goalNudgesEnabled) {
      message = `Today's check: You're at ${goalContext.progressPercent}% for "${goalContext.goalName}". Reflect on today's cash flow and set yourself up for tomorrow.`;
      suggestedAction = 'view_goals';
    } else {
      message = todayCount === 0
        ? `A 15-second check-in builds lasting wealth. Log today's transactions before heading to sleep.`
        : `Well done tracking today! You logged ${todayCount} transaction${todayCount > 1 ? 's' : ''}. Rest easy knowing your finances are in order.`;
      suggestedAction = 'add_expense';
    }
  }

  return {
    id: `reminder-${todayStr}-${daypart}-${cueType}`,
    title,
    message,
    cueType,
    daypart,
    urgency,
    timestamp: currentTime.toISOString(),
    streakDays: streak,
    goalContext,
    suggestedAction,
    read: false,
  };
}

/**
 * Evaluates whether a notification or banner prompt should trigger right now
 */
export function evaluateHabitReminder(params: {
  currentTime?: Date;
  transactions: Transaction[];
  goals?: FinancialGoal[];
  budgets?: Budget[];
  settings?: HabitNotificationSettings;
  history?: NotificationHistoryRecord[];
}): {
  shouldNotify: boolean;
  reminder: HabitReminder | null;
  reason: string;
} {
  const currentTime = params.currentTime || new Date();
  const settings = params.settings || DEFAULT_NOTIFICATION_SETTINGS;
  const transactions = params.transactions || [];
  const goals = params.goals || [];
  const budgets = params.budgets || [];
  const history = params.history || [];

  if (!settings.enabled) {
    return { shouldNotify: false, reminder: null, reason: 'Notifications disabled by user' };
  }

  // Check quiet hours
  if (isQuietHours(currentTime, settings)) {
    return { shouldNotify: false, reminder: null, reason: 'Currently within quiet hours' };
  }

  const daypart = getDayPart(currentTime);
  const streak = calculateHabitStreak(transactions, currentTime);
  const todayTransactions = getTodayTransactions(transactions, currentTime);

  // Check if there is an active snooze in history
  const activeSnooze = history.find(
    (h) => h.status === 'snoozed' && h.snoozedUntil && new Date(h.snoozedUntil) > currentTime
  );
  if (activeSnooze) {
    return {
      shouldNotify: false,
      reminder: activeSnooze.reminder,
      reason: `Snoozed until ${new Date(activeSnooze.snoozedUntil!).toLocaleTimeString()}`,
    };
  }

  // Generate current contextual reminder
  const reminder = generateContextualReminder({
    currentTime,
    daypart,
    streak,
    todayTransactions,
    goals,
    budgets,
    settings,
  });

  // Check if this exact reminder or daypart was already dismissed or sent today
  const todayStr = formatDateKey(currentTime);
  const alreadyHandled = history.find(
    (h) =>
      h.createdAt.startsWith(todayStr) &&
      h.reminder.daypart === daypart &&
      (h.status === 'dismissed' || h.status === 'clicked')
  );

  if (alreadyHandled) {
    return {
      shouldNotify: false,
      reminder,
      reason: `Already handled for this daypart (${daypart}) today`,
    };
  }

  return {
    shouldNotify: true,
    reminder,
    reason: `Trigger reminder for ${daypart} habit check`,
  };
}

/**
 * Computes full habit status for widgets and headers
 */
export function getHabitStatus(params: {
  currentTime?: Date;
  transactions: Transaction[];
  goals?: FinancialGoal[];
  budgets?: Budget[];
  settings?: HabitNotificationSettings;
  history?: NotificationHistoryRecord[];
}): HabitStatus {
  const currentTime = params.currentTime || new Date();
  const settings = params.settings || DEFAULT_NOTIFICATION_SETTINGS;
  const transactions = params.transactions || [];
  const goals = params.goals || [];
  const budgets = params.budgets || [];
  const history = params.history || [];

  const streak = calculateHabitStreak(transactions, currentTime);
  const todayTx = getTodayTransactions(transactions, currentTime);
  const daypartsLogged = getDaypartsLoggedToday(transactions, currentTime);
  const incomeCountToday = todayTx.filter((t) => t.type === 'income').length;
  const expenseCountToday = todayTx.filter((t) => t.type === 'expense').length;

  const nextReminder = getNextReminderTimeString(currentTime, settings);
  const evalResult = evaluateHabitReminder({
    currentTime,
    transactions,
    goals,
    budgets,
    settings,
    history,
  });

  return {
    streak,
    hasLoggedToday: todayTx.length > 0,
    loggedCountToday: todayTx.length,
    incomeCountToday,
    expenseCountToday,
    daypartsLogged,
    nextScheduledReminderTime: nextReminder,
    currentCue: evalResult.reminder,
  };
}
