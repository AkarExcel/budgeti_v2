import { IFinanceRepository } from './repository';
import {
  SHEET_NAMES,
  SHEET_HEADERS,
  readSheetValues,
  writeSheetValues,
  appendSheetRow,
  ensureSpreadsheetStructure,
} from '../google/sheets';
import {
  Transaction,
  Budget,
  Category,
  Account,
  IncomeSource,
  FinancialGoal,
  UserSettings,
} from '@/types';

export class SheetsRepository implements IFinanceRepository {
  public isMock = false;

  private async initialize() {
    await ensureSpreadsheetStructure();
  }

  // --- Transactions ---
  async getTransactions(): Promise<Transaction[]> {
    await this.initialize();
    const rows = await readSheetValues(SHEET_NAMES.TRANSACTIONS);
    if (rows.length <= 1) return [];

    return rows
      .slice(1)
      .filter((r) => r.length > 0 && r[0])
      .map((r) => ({
        id: r[0] || '',
        date: r[1] || '',
        type: (r[2] as 'income' | 'expense') || 'expense',
        category: r[3] || 'Uncategorized',
        description: r[4] || '',
        amount: parseFloat(r[5]) || 0,
        account: r[6] || 'Cash',
        payment_method: r[7] || '',
        notes: r[8] || '',
        created_at: r[9] || new Date().toISOString(),
        updated_at: r[10] || new Date().toISOString(),
      }))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  async addTransaction(
    data: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>
  ): Promise<Transaction> {
    await this.initialize();
    const now = new Date().toISOString();
    const newTx: Transaction = {
      ...data,
      id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      created_at: now,
      updated_at: now,
    };

    const row = [
      newTx.id,
      newTx.date,
      newTx.type,
      newTx.category,
      newTx.description,
      newTx.amount,
      newTx.account,
      newTx.payment_method || '',
      newTx.notes || '',
      newTx.created_at,
      newTx.updated_at,
    ];

    await appendSheetRow(SHEET_NAMES.TRANSACTIONS, row);
    return newTx;
  }

  async updateTransaction(
    id: string,
    data: Partial<Transaction>
  ): Promise<Transaction> {
    await this.initialize();
    const rows = await readSheetValues(SHEET_NAMES.TRANSACTIONS);
    if (rows.length <= 1) throw new Error('No transactions found');

    const headers = rows[0];
    const index = rows.findIndex((r, idx) => idx > 0 && r[0] === id);

    if (index === -1) throw new Error(`Transaction ${id} not found in Google Sheet`);

    const existingRow = rows[index];
    const existingTx: Transaction = {
      id: existingRow[0],
      date: existingRow[1],
      type: existingRow[2] as any,
      category: existingRow[3],
      description: existingRow[4],
      amount: parseFloat(existingRow[5]) || 0,
      account: existingRow[6],
      payment_method: existingRow[7],
      notes: existingRow[8],
      created_at: existingRow[9],
      updated_at: existingRow[10],
    };

    const now = new Date().toISOString();
    const updatedTx: Transaction = {
      ...existingTx,
      ...data,
      updated_at: now,
    };

    rows[index] = [
      updatedTx.id,
      updatedTx.date,
      updatedTx.type,
      updatedTx.category,
      updatedTx.description,
      String(updatedTx.amount),
      updatedTx.account,
      updatedTx.payment_method || '',
      updatedTx.notes || '',
      updatedTx.created_at,
      updatedTx.updated_at,
    ];

    await writeSheetValues(SHEET_NAMES.TRANSACTIONS, rows);
    return updatedTx;
  }

  async deleteTransaction(id: string): Promise<boolean> {
    await this.initialize();
    const rows = await readSheetValues(SHEET_NAMES.TRANSACTIONS);
    if (rows.length <= 1) return false;

    const filteredRows = [
      rows[0], // header
      ...rows.slice(1).filter((r) => r[0] !== id),
    ];

    if (filteredRows.length === rows.length) return false;

    await writeSheetValues(SHEET_NAMES.TRANSACTIONS, filteredRows);
    return true;
  }

  // --- Budgets ---
  async getBudgets(): Promise<Budget[]> {
    await this.initialize();
    const rows = await readSheetValues(SHEET_NAMES.BUDGETS);
    if (rows.length <= 1) return [];

    return rows
      .slice(1)
      .filter((r) => r.length > 0 && r[0])
      .map((r) => ({
        id: r[0],
        month: r[1],
        category: r[2],
        budget_amount: parseFloat(r[3]) || 0,
        created_at: r[4] || new Date().toISOString(),
        updated_at: r[5] || new Date().toISOString(),
      }));
  }

  async saveBudget(
    data: Omit<Budget, 'id' | 'created_at' | 'updated_at'>
  ): Promise<Budget> {
    await this.initialize();
    const rows = await readSheetValues(SHEET_NAMES.BUDGETS);
    const headers = rows.length > 0 ? rows[0] : SHEET_HEADERS[SHEET_NAMES.BUDGETS];
    const now = new Date().toISOString();

    const existingIndex = rows.findIndex(
      (r, idx) =>
        idx > 0 &&
        r[1] === data.month &&
        (r[2] || '').toLowerCase() === data.category.toLowerCase()
    );

    if (existingIndex >= 1) {
      const existingId = rows[existingIndex][0];
      const createdAt = rows[existingIndex][4] || now;
      const updatedBudget: Budget = {
        id: existingId,
        month: data.month,
        category: data.category,
        budget_amount: data.budget_amount,
        created_at: createdAt,
        updated_at: now,
      };

      rows[existingIndex] = [
        updatedBudget.id,
        updatedBudget.month,
        updatedBudget.category,
        String(updatedBudget.budget_amount),
        updatedBudget.created_at,
        updatedBudget.updated_at,
      ];

      await writeSheetValues(SHEET_NAMES.BUDGETS, rows);
      return updatedBudget;
    }

    const newBudget: Budget = {
      ...data,
      id: `b-${Date.now()}`,
      created_at: now,
      updated_at: now,
    };

    const newRow = [
      newBudget.id,
      newBudget.month,
      newBudget.category,
      String(newBudget.budget_amount),
      newBudget.created_at,
      newBudget.updated_at,
    ];

    await appendSheetRow(SHEET_NAMES.BUDGETS, newRow);
    return newBudget;
  }

  async deleteBudget(id: string): Promise<boolean> {
    await this.initialize();
    const rows = await readSheetValues(SHEET_NAMES.BUDGETS);
    if (rows.length <= 1) return false;

    const filteredRows = [rows[0], ...rows.slice(1).filter((r) => r[0] !== id)];
    await writeSheetValues(SHEET_NAMES.BUDGETS, filteredRows);
    return true;
  }

  // --- Categories ---
  async getCategories(): Promise<Category[]> {
    await this.initialize();
    const rows = await readSheetValues(SHEET_NAMES.CATEGORIES);
    if (rows.length <= 1) return [];

    return rows
      .slice(1)
      .filter((r) => r.length > 0 && r[0])
      .map((r) => ({
        id: r[0],
        name: r[1],
        type: (r[2] as any) || 'expense',
        active: r[3] === 'true' || r[3] === 'TRUE' || r[3] === '1',
        created_at: r[4] || new Date().toISOString(),
      }));
  }

  async addCategory(
    data: Omit<Category, 'id' | 'created_at'>
  ): Promise<Category> {
    await this.initialize();
    const now = new Date().toISOString();
    const newCat: Category = {
      ...data,
      id: `cat-${Date.now()}`,
      created_at: now,
    };

    await appendSheetRow(SHEET_NAMES.CATEGORIES, [
      newCat.id,
      newCat.name,
      newCat.type,
      String(newCat.active),
      newCat.created_at,
    ]);

    return newCat;
  }

  // --- Accounts ---
  async getAccounts(): Promise<Account[]> {
    await this.initialize();
    const rows = await readSheetValues(SHEET_NAMES.ACCOUNTS);
    if (rows.length <= 1) return [];

    return rows
      .slice(1)
      .filter((r) => r.length > 0 && r[0])
      .map((r) => ({
        id: r[0],
        name: r[1],
        type: (r[2] as any) || 'bank',
        opening_balance: parseFloat(r[3]) || 0,
        active: r[4] === 'true' || r[4] === 'TRUE' || r[4] === '1',
        created_at: r[5] || new Date().toISOString(),
        updated_at: r[6] || new Date().toISOString(),
      }));
  }

  async saveAccount(
    data: Omit<Account, 'id' | 'created_at' | 'updated_at'>
  ): Promise<Account> {
    await this.initialize();
    const rows = await readSheetValues(SHEET_NAMES.ACCOUNTS);
    const now = new Date().toISOString();

    const existingIndex = rows.findIndex(
      (r, idx) => idx > 0 && (r[1] || '').toLowerCase() === data.name.toLowerCase()
    );

    if (existingIndex >= 1) {
      const existingId = rows[existingIndex][0];
      const createdAt = rows[existingIndex][5] || now;

      const updatedAccount: Account = {
        id: existingId,
        name: data.name,
        type: data.type,
        opening_balance: data.opening_balance,
        active: data.active,
        created_at: createdAt,
        updated_at: now,
      };

      rows[existingIndex] = [
        updatedAccount.id,
        updatedAccount.name,
        updatedAccount.type,
        String(updatedAccount.opening_balance),
        String(updatedAccount.active),
        updatedAccount.created_at,
        updatedAccount.updated_at,
      ];

      await writeSheetValues(SHEET_NAMES.ACCOUNTS, rows);
      return updatedAccount;
    }

    const newAcc: Account = {
      ...data,
      id: `acc-${Date.now()}`,
      created_at: now,
      updated_at: now,
    };

    await appendSheetRow(SHEET_NAMES.ACCOUNTS, [
      newAcc.id,
      newAcc.name,
      newAcc.type,
      String(newAcc.opening_balance),
      String(newAcc.active),
      newAcc.created_at,
      newAcc.updated_at,
    ]);

    return newAcc;
  }

  // --- Income Sources ---
  async getIncomeSources(): Promise<IncomeSource[]> {
    await this.initialize();
    const rows = await readSheetValues(SHEET_NAMES.INCOME_SOURCES);
    if (rows.length <= 1) return [];

    return rows
      .slice(1)
      .filter((r) => r.length > 0 && r[0])
      .map((r) => ({
        id: r[0],
        name: r[1],
        active: r[2] === 'true' || r[2] === 'TRUE' || r[2] === '1',
        created_at: r[3] || new Date().toISOString(),
      }));
  }

  // --- Financial Goals ---
  async getGoals(): Promise<FinancialGoal[]> {
    await this.initialize();
    const rows = await readSheetValues(SHEET_NAMES.FINANCIAL_GOALS);
    if (rows.length <= 1) return [];

    return rows
      .slice(1)
      .filter((r) => r.length > 0 && r[0])
      .map((r) => ({
        id: r[0],
        name: r[1],
        target_amount: parseFloat(r[2]) || 0,
        current_amount: parseFloat(r[3]) || 0,
        target_date: r[4] || '',
        status: (r[5] as any) || 'in_progress',
        created_at: r[6] || new Date().toISOString(),
        updated_at: r[7] || new Date().toISOString(),
      }));
  }

  async saveGoal(
    data: Omit<FinancialGoal, 'id' | 'created_at' | 'updated_at'>
  ): Promise<FinancialGoal> {
    await this.initialize();
    const now = new Date().toISOString();
    const newGoal: FinancialGoal = {
      ...data,
      id: `g-${Date.now()}`,
      created_at: now,
      updated_at: now,
    };

    await appendSheetRow(SHEET_NAMES.FINANCIAL_GOALS, [
      newGoal.id,
      newGoal.name,
      String(newGoal.target_amount),
      String(newGoal.current_amount),
      newGoal.target_date,
      newGoal.status,
      newGoal.created_at,
      newGoal.updated_at,
    ]);

    return newGoal;
  }

  async updateGoalAmount(id: string, newAmount: number): Promise<FinancialGoal> {
    await this.initialize();
    const rows = await readSheetValues(SHEET_NAMES.FINANCIAL_GOALS);
    const index = rows.findIndex((r, idx) => idx > 0 && r[0] === id);

    if (index === -1) throw new Error(`Goal ${id} not found in Google Sheet`);

    const r = rows[index];
    const targetAmount = parseFloat(r[2]) || 0;
    const status = newAmount >= targetAmount ? 'completed' : 'in_progress';
    const now = new Date().toISOString();

    const updatedGoal: FinancialGoal = {
      id: r[0],
      name: r[1],
      target_amount: targetAmount,
      current_amount: newAmount,
      target_date: r[4],
      status: status,
      created_at: r[6],
      updated_at: now,
    };

    rows[index] = [
      updatedGoal.id,
      updatedGoal.name,
      String(updatedGoal.target_amount),
      String(updatedGoal.current_amount),
      updatedGoal.target_date,
      updatedGoal.status,
      updatedGoal.created_at,
      updatedGoal.updated_at,
    ];

    await writeSheetValues(SHEET_NAMES.FINANCIAL_GOALS, rows);
    return updatedGoal;
  }

  // --- Settings ---
  async getSettings(): Promise<UserSettings> {
    await this.initialize();
    const rows = await readSheetValues(SHEET_NAMES.SETTINGS);
    if (rows.length <= 1) {
      return {
        currency: 'NGN',
        monthly_income_target: 500000,
        monthly_savings_target: 150000,
        default_account: 'GTBank',
        date_format: 'YYYY-MM-DD',
      };
    }

    const r = rows[1];
    return {
      currency: r[0] || 'NGN',
      monthly_income_target: parseFloat(r[1]) || 0,
      monthly_savings_target: parseFloat(r[2]) || 0,
      default_account: r[3] || 'GTBank',
      date_format: r[4] || 'YYYY-MM-DD',
    };
  }

  async updateSettings(data: Partial<UserSettings>): Promise<UserSettings> {
    await this.initialize();
    const current = await this.getSettings();
    const updated = { ...current, ...data };

    const rows = [
      SHEET_HEADERS[SHEET_NAMES.SETTINGS],
      [
        updated.currency,
        String(updated.monthly_income_target),
        String(updated.monthly_savings_target),
        updated.default_account,
        updated.date_format,
      ],
    ];

    await writeSheetValues(SHEET_NAMES.SETTINGS, rows);
    return updated;
  }

  async sync(): Promise<{ lastSyncedAt: string; message: string }> {
    await this.initialize();
    const lastSyncedAt = new Date().toISOString();
    return {
      lastSyncedAt,
      message: 'Google Sheets synchronization completed successfully',
    };
  }
}
