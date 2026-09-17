export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  date: string; // YYYY-MM-DD
  type: TransactionType;
  category: string;
  description: string;
  amount: number;
  account: string;
  payment_method?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Budget {
  id: string;
  month: string; // YYYY-MM
  category: string;
  budget_amount: number;
  created_at: string;
  updated_at: string;
}

export type CategoryType = 'income' | 'expense' | 'both';

export interface Category {
  id: string;
  name: string;
  type: CategoryType;
  active: boolean;
  created_at: string;
}

export type AccountType = 'bank' | 'cash' | 'savings' | 'wallet' | 'other';

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  opening_balance: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface IncomeSource {
  id: string;
  name: string;
  active: boolean;
  created_at: string;
}

export type GoalStatus = 'in_progress' | 'completed' | 'on_hold';

export interface FinancialGoal {
  id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  target_date: string;
  status: GoalStatus;
  created_at: string;
  updated_at: string;
}

export interface UserSettings {
  currency: string;
  monthly_income_target: number;
  monthly_savings_target: number;
  default_account: string;
  date_format: string;
}

export interface SyncStatus {
  lastSyncedAt: string | null;
  status: 'idle' | 'syncing' | 'success' | 'error';
  message?: string;
  isMock: boolean;
}
