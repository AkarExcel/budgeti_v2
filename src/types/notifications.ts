export type DayPart = 'morning' | 'afternoon' | 'evening' | 'night';

export type ReminderFrequency = 'gentle' | 'balanced' | 'frequent' | 'custom';

export type ReminderUrgency = 'gentle' | 'standard' | 'important';

export type ReminderCueType =
  | 'morning_kickoff'
  | 'midday_check'
  | 'evening_wrapup'
  | 'nightly_review'
  | 'streak_save'
  | 'goal_nudge'
  | 'budget_alert'
  | 'positive_reinforcement';

export interface ReminderScheduleConfig {
  morningTime: string;   // e.g. "09:00"
  afternoonTime: string; // e.g. "13:30"
  eveningTime: string;   // e.g. "18:30"
  nightTime: string;     // e.g. "21:30"
}

export interface HabitNotificationSettings {
  enabled: boolean;
  frequency: ReminderFrequency;
  customTimes: string[]; // e.g. ["09:00", "13:30", "18:30"]
  schedules: ReminderScheduleConfig;
  browserNotifications: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  goalNudgesEnabled: boolean;
  streakRemindersEnabled: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart: string; // e.g. "22:00"
  quietHoursEnd: string;   // e.g. "07:00"
}

export interface HabitReminder {
  id: string;
  title: string;
  message: string;
  cueType: ReminderCueType;
  daypart: DayPart;
  urgency: ReminderUrgency;
  timestamp: string;
  streakDays: number;
  goalContext?: {
    goalId: string;
    goalName: string;
    progressPercent: number;
    targetAmount: number;
    currentAmount: number;
  };
  suggestedAction: 'add_expense' | 'add_income' | 'view_goals' | 'view_budget';
  read?: boolean;
}

export interface HabitStatus {
  streak: number;
  hasLoggedToday: boolean;
  loggedCountToday: number;
  incomeCountToday: number;
  expenseCountToday: number;
  daypartsLogged: {
    morning: boolean;
    afternoon: boolean;
    evening: boolean;
    night: boolean;
  };
  nextScheduledReminderTime: string | null;
  currentCue: HabitReminder | null;
}

export interface NotificationHistoryRecord {
  id: string;
  reminder: HabitReminder;
  status: 'sent' | 'snoozed' | 'dismissed' | 'clicked';
  createdAt: string;
  snoozedUntil?: string;
}
