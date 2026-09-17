import {
  Transaction,
  Budget,
  Category,
  Account,
  IncomeSource,
  FinancialGoal,
  UserSettings,
} from '@/types';

export interface IFinanceRepository {
  isMock: boolean;
  
  // Transactions
  getTransactions(): Promise<Transaction[]>;
  addTransaction(transaction: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>): Promise<Transaction>;
  updateTransaction(id: string, transaction: Partial<Transaction>): Promise<Transaction>;
  deleteTransaction(id: string): Promise<boolean>;

  // Budgets
  getBudgets(): Promise<Budget[]>;
  saveBudget(budget: Omit<Budget, 'id' | 'created_at' | 'updated_at'>): Promise<Budget>;
  deleteBudget(id: string): Promise<boolean>;

  // Categories
  getCategories(): Promise<Category[]>;
  addCategory(category: Omit<Category, 'id' | 'created_at'>): Promise<Category>;

  // Accounts
  getAccounts(): Promise<Account[]>;
  saveAccount(account: Omit<Account, 'id' | 'created_at' | 'updated_at'>): Promise<Account>;

  // Income Sources
  getIncomeSources(): Promise<IncomeSource[]>;

  // Goals
  getGoals(): Promise<FinancialGoal[]>;
  saveGoal(goal: Omit<FinancialGoal, 'id' | 'created_at' | 'updated_at'>): Promise<FinancialGoal>;
  updateGoalAmount(id: string, newAmount: number): Promise<FinancialGoal>;

  // Settings
  getSettings(): Promise<UserSettings>;
  updateSettings(settings: Partial<UserSettings>): Promise<UserSettings>;

  // Two-way sync & bootstrapping
  sync(): Promise<{ lastSyncedAt: string; message: string }>;
}
