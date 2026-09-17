import { IFinanceRepository } from './repository';
import {
  Transaction,
  Budget,
  Category,
  Account,
  IncomeSource,
  FinancialGoal,
  UserSettings,
} from '@/types';

// Pre-seeded initial data matching Google Sheet schema
const initialCategories: Category[] = [
  { id: 'cat-1', name: 'Salary', type: 'income', active: true, created_at: '2026-01-01T00:00:00Z' },
  { id: 'cat-2', name: 'Freelance', type: 'income', active: true, created_at: '2026-01-01T00:00:00Z' },
  { id: 'cat-3', name: 'Investments', type: 'income', active: true, created_at: '2026-01-01T00:00:00Z' },
  { id: 'cat-4', name: 'Food', type: 'expense', active: true, created_at: '2026-01-01T00:00:00Z' },
  { id: 'cat-5', name: 'Transport', type: 'expense', active: true, created_at: '2026-01-01T00:00:00Z' },
  { id: 'cat-6', name: 'Rent', type: 'expense', active: true, created_at: '2026-01-01T00:00:00Z' },
  { id: 'cat-7', name: 'Internet', type: 'expense', active: true, created_at: '2026-01-01T00:00:00Z' },
  { id: 'cat-8', name: 'Utilities', type: 'expense', active: true, created_at: '2026-01-01T00:00:00Z' },
  { id: 'cat-9', name: 'Entertainment', type: 'expense', active: true, created_at: '2026-01-01T00:00:00Z' },
];

const initialAccounts: Account[] = [
  { id: 'acc-1', name: 'GTBank', type: 'bank', opening_balance: 150000, active: true, created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' },
  { id: 'acc-2', name: 'Moniepoint', type: 'bank', opening_balance: 50000, active: true, created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' },
  { id: 'acc-3', name: 'OPay', type: 'wallet', opening_balance: 25000, active: true, created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' },
  { id: 'acc-4', name: 'Cash', type: 'cash', opening_balance: 10000, active: true, created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' },
];

const initialIncomeSources: IncomeSource[] = [
  { id: 'inc-1', name: 'Primary Salary', active: true, created_at: '2026-01-01T00:00:00Z' },
  { id: 'inc-2', name: 'Consulting', active: true, created_at: '2026-01-01T00:00:00Z' },
  { id: 'inc-3', name: 'Dividends', active: true, created_at: '2026-01-01T00:00:00Z' },
];

const initialBudgets: Budget[] = [
  { id: 'b-1', month: '2026-09', category: 'Food', budget_amount: 80000, created_at: '2026-09-01T00:00:00Z', updated_at: '2026-09-01T00:00:00Z' },
  { id: 'b-2', month: '2026-09', category: 'Transport', budget_amount: 40000, created_at: '2026-09-01T00:00:00Z', updated_at: '2026-09-01T00:00:00Z' },
  { id: 'b-3', month: '2026-09', category: 'Rent', budget_amount: 100000, created_at: '2026-09-01T00:00:00Z', updated_at: '2026-09-01T00:00:00Z' },
  { id: 'b-4', month: '2026-09', category: 'Internet', budget_amount: 20000, created_at: '2026-09-01T00:00:00Z', updated_at: '2026-09-01T00:00:00Z' },
  { id: 'b-5', month: '2026-09', category: 'Utilities', budget_amount: 30000, created_at: '2026-09-01T00:00:00Z', updated_at: '2026-09-01T00:00:00Z' },
];

const initialGoals: FinancialGoal[] = [
  { id: 'g-1', name: 'Emergency Fund', target_amount: 1000000, current_amount: 450000, target_date: '2026-12-31', status: 'in_progress', created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' },
  { id: 'g-2', name: 'New Laptop', target_amount: 600000, current_amount: 300000, target_date: '2026-10-31', status: 'in_progress', created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' },
  { id: 'g-3', name: 'Land Investment', target_amount: 5000000, current_amount: 1200000, target_date: '2027-06-30', status: 'in_progress', created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' },
];

const initialSettings: UserSettings = {
  currency: 'NGN',
  monthly_income_target: 750000,
  monthly_savings_target: 200000,
  default_account: 'GTBank',
  date_format: 'YYYY-MM-DD',
};

const initialTransactions: Transaction[] = [
  { id: 'tx-1', date: '2026-09-01', type: 'income', category: 'Salary', description: 'Monthly Salary Paycheck', amount: 650000, account: 'GTBank', payment_method: 'Transfer', notes: 'Primary employment salary', created_at: '2026-09-01T09:00:00Z', updated_at: '2026-09-01T09:00:00Z' },
  { id: 'tx-2', date: '2026-09-02', type: 'expense', category: 'Food', description: 'Supermarket Grocery Shopping', amount: 35000, account: 'GTBank', payment_method: 'POS Card', notes: 'Weekly groceries', created_at: '2026-09-02T12:00:00Z', updated_at: '2026-09-02T12:00:00Z' },
  { id: 'tx-3', date: '2026-09-04', type: 'expense', category: 'Transport', description: 'Car Fuel Refill', amount: 18000, account: 'OPay', payment_method: 'Transfer', notes: 'Total service station', created_at: '2026-09-04T15:30:00Z', updated_at: '2026-09-04T15:30:00Z' },
  { id: 'tx-4', date: '2026-09-05', type: 'expense', category: 'Internet', description: 'Fiber Broadband Subscription', amount: 19500, account: 'GTBank', payment_method: 'Debit Card', notes: 'Unlimited monthly plan', created_at: '2026-09-05T08:20:00Z', updated_at: '2026-09-05T08:20:00Z' },
  { id: 'tx-5', date: '2026-09-08', type: 'income', category: 'Freelance', description: 'Mobile App UI Design', amount: 120000, account: 'Moniepoint', payment_method: 'Transfer', notes: 'Client milestone payment', created_at: '2026-09-08T16:45:00Z', updated_at: '2026-09-08T16:45:00Z' },
  { id: 'tx-6', date: '2026-09-10', type: 'expense', category: 'Utilities', description: 'Electricity Token Top-up', amount: 15000, account: 'OPay', payment_method: 'Wallet', notes: 'IKEDC prepaid meter', created_at: '2026-09-10T10:10:00Z', updated_at: '2026-09-10T10:10:00Z' },
  { id: 'tx-7', date: '2026-09-12', type: 'expense', category: 'Food', description: 'Weekend Restaurant Outing', amount: 22000, account: 'GTBank', payment_method: 'POS Card', notes: 'Family dinner', created_at: '2026-09-12T19:30:00Z', updated_at: '2026-09-12T19:30:00Z' },
];

export class MockRepository implements IFinanceRepository {
  public isMock = true;
  private transactions: Transaction[] = [...initialTransactions];
  private budgets: Budget[] = [...initialBudgets];
  private categories: Category[] = [...initialCategories];
  private accounts: Account[] = [...initialAccounts];
  private incomeSources: IncomeSource[] = [...initialIncomeSources];
  private goals: FinancialGoal[] = [...initialGoals];
  private settings: UserSettings = { ...initialSettings };

  async getTransactions(): Promise<Transaction[]> {
    return [...this.transactions].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }

  async addTransaction(
    data: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>
  ): Promise<Transaction> {
    const now = new Date().toISOString();
    const newTx: Transaction = {
      ...data,
      id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      created_at: now,
      updated_at: now,
    };
    this.transactions.push(newTx);
    return newTx;
  }

  async updateTransaction(
    id: string,
    data: Partial<Transaction>
  ): Promise<Transaction> {
    const index = this.transactions.findIndex((t) => t.id === id);
    if (index === -1) throw new Error(`Transaction ${id} not found`);

    const updated: Transaction = {
      ...this.transactions[index],
      ...data,
      updated_at: new Date().toISOString(),
    };
    this.transactions[index] = updated;
    return updated;
  }

  async deleteTransaction(id: string): Promise<boolean> {
    const lenBefore = this.transactions.length;
    this.transactions = this.transactions.filter((t) => t.id !== id);
    return this.transactions.length < lenBefore;
  }

  async getBudgets(): Promise<Budget[]> {
    return [...this.budgets];
  }

  async saveBudget(
    data: Omit<Budget, 'id' | 'created_at' | 'updated_at'>
  ): Promise<Budget> {
    const now = new Date().toISOString();
    const existingIndex = this.budgets.findIndex(
      (b) => b.month === data.month && b.category.toLowerCase() === data.category.toLowerCase()
    );

    if (existingIndex >= 0) {
      const updated: Budget = {
        ...this.budgets[existingIndex],
        budget_amount: data.budget_amount,
        updated_at: now,
      };
      this.budgets[existingIndex] = updated;
      return updated;
    }

    const newBudget: Budget = {
      ...data,
      id: `b-${Date.now()}`,
      created_at: now,
      updated_at: now,
    };
    this.budgets.push(newBudget);
    return newBudget;
  }

  async deleteBudget(id: string): Promise<boolean> {
    this.budgets = this.budgets.filter((b) => b.id !== id);
    return true;
  }

  async getCategories(): Promise<Category[]> {
    return [...this.categories];
  }

  async addCategory(
    data: Omit<Category, 'id' | 'created_at'>
  ): Promise<Category> {
    const newCat: Category = {
      ...data,
      id: `cat-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    this.categories.push(newCat);
    return newCat;
  }

  async getAccounts(): Promise<Account[]> {
    return [...this.accounts];
  }

  async saveAccount(
    data: Omit<Account, 'id' | 'created_at' | 'updated_at'>
  ): Promise<Account> {
    const now = new Date().toISOString();
    const existingIndex = this.accounts.findIndex(
      (a) => a.name.toLowerCase() === data.name.toLowerCase()
    );

    if (existingIndex >= 0) {
      const updated: Account = {
        ...this.accounts[existingIndex],
        ...data,
        updated_at: now,
      };
      this.accounts[existingIndex] = updated;
      return updated;
    }

    const newAcc: Account = {
      ...data,
      id: `acc-${Date.now()}`,
      created_at: now,
      updated_at: now,
    };
    this.accounts.push(newAcc);
    return newAcc;
  }

  async getIncomeSources(): Promise<IncomeSource[]> {
    return [...this.incomeSources];
  }

  async getGoals(): Promise<FinancialGoal[]> {
    return [...this.goals];
  }

  async saveGoal(
    data: Omit<FinancialGoal, 'id' | 'created_at' | 'updated_at'>
  ): Promise<FinancialGoal> {
    const now = new Date().toISOString();
    const newGoal: FinancialGoal = {
      ...data,
      id: `g-${Date.now()}`,
      created_at: now,
      updated_at: now,
    };
    this.goals.push(newGoal);
    return newGoal;
  }

  async updateGoalAmount(id: string, newAmount: number): Promise<FinancialGoal> {
    const goal = this.goals.find((g) => g.id === id);
    if (!goal) throw new Error(`Goal ${id} not found`);

    goal.current_amount = newAmount;
    if (goal.current_amount >= goal.target_amount) {
      goal.status = 'completed';
    }
    goal.updated_at = new Date().toISOString();
    return { ...goal };
  }

  async getSettings(): Promise<UserSettings> {
    return { ...this.settings };
  }

  async updateSettings(data: Partial<UserSettings>): Promise<UserSettings> {
    this.settings = { ...this.settings, ...data };
    return { ...this.settings };
  }

  async sync(): Promise<{ lastSyncedAt: string; message: string }> {
    const lastSyncedAt = new Date().toISOString();
    return {
      lastSyncedAt,
      message: 'Mock store synchronized successfully',
    };
  }
}
