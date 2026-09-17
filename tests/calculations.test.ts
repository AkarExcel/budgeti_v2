import { describe, it, expect } from 'vitest';
import {
  calculateTotalIncome,
  calculateTotalExpenses,
  calculateNetCashFlow,
  calculateSavings,
  calculateSavingsRate,
  calculateAccountBalance,
  calculateBudgetSpent,
  calculateBudgetRemaining,
  calculateBudgetPercentage,
  calculateCategorySpending,
  calculateIncomeBySource,
  calculateMonthlyTotals,
} from '../src/lib/calculations/finance';
import { Transaction, Account, FinancialGoal } from '../src/types';

describe('Financial Calculations Engine', () => {
  const sampleTransactions: Transaction[] = [
    {
      id: '1',
      date: '2026-09-01',
      type: 'income',
      category: 'Salary',
      description: 'Monthly Salary',
      amount: 500000,
      account: 'GTBank',
      created_at: '2026-09-01T00:00:00Z',
      updated_at: '2026-09-01T00:00:00Z',
    },
    {
      id: '2',
      date: '2026-09-05',
      type: 'expense',
      category: 'Food',
      description: 'Groceries',
      amount: 45000,
      account: 'GTBank',
      created_at: '2026-09-05T00:00:00Z',
      updated_at: '2026-09-05T00:00:00Z',
    },
    {
      id: '3',
      date: '2026-09-10',
      type: 'expense',
      category: 'Transport',
      description: 'Fuel',
      amount: 20000,
      account: 'OPay',
      created_at: '2026-09-10T00:00:00Z',
      updated_at: '2026-09-10T00:00:00Z',
    },
    {
      id: '4',
      date: '2026-09-15',
      type: 'income',
      category: 'Freelance',
      description: 'Web Design Project',
      amount: 150000,
      account: 'Moniepoint',
      created_at: '2026-09-15T00:00:00Z',
      updated_at: '2026-09-15T00:00:00Z',
    },
  ];

  it('1. Handles no transactions gracefully', () => {
    expect(calculateTotalIncome([])).toBe(0);
    expect(calculateTotalExpenses([])).toBe(0);
    expect(calculateNetCashFlow([])).toBe(0);
    expect(calculateCategorySpending([])).toEqual([]);
    expect(calculateMonthlyTotals([])).toEqual([]);
  });

  it('2. Calculates zero income scenario', () => {
    const expensesOnly = sampleTransactions.filter((t) => t.type === 'expense');
    expect(calculateTotalIncome(expensesOnly)).toBe(0);
    expect(calculateTotalExpenses(expensesOnly)).toBe(65000);
    expect(calculateNetCashFlow(expensesOnly)).toBe(-65000); // Negative net cash flow
  });

  it('3. Calculates zero expenses scenario', () => {
    const incomeOnly = sampleTransactions.filter((t) => t.type === 'income');
    expect(calculateTotalIncome(incomeOnly)).toBe(650000);
    expect(calculateTotalExpenses(incomeOnly)).toBe(0);
    expect(calculateNetCashFlow(incomeOnly)).toBe(650000); // Positive net cash flow
  });

  it('4. Calculates combined income and expenses', () => {
    expect(calculateTotalIncome(sampleTransactions)).toBe(650000);
    expect(calculateTotalExpenses(sampleTransactions)).toBe(65000);
    expect(calculateNetCashFlow(sampleTransactions)).toBe(585000);
  });

  it('5. Handles budget exceeded and budget unused', () => {
    // Food spent is 45,000 in 2026-09
    const spentFood = calculateBudgetSpent('Food', '2026-09', sampleTransactions);
    expect(spentFood).toBe(45000);

    // Unused budget scenario: Budget = 80,000
    const remainingUnused = calculateBudgetRemaining(80000, spentFood);
    const pctUnused = calculateBudgetPercentage(spentFood, 80000);
    expect(remainingUnused).toBe(35000);
    expect(pctUnused).toBe(56); // ~56%

    // Exceeded budget scenario: Budget = 30,000
    const remainingExceeded = calculateBudgetRemaining(30000, spentFood);
    const pctExceeded = calculateBudgetPercentage(spentFood, 30000);
    expect(remainingExceeded).toBe(-15000);
    expect(pctExceeded).toBe(150); // 150% exceeded
  });

  it('6. Calculates account balances across multiple accounts', () => {
    const gtbankAccount: Account = {
      id: 'acc1',
      name: 'GTBank',
      type: 'bank',
      opening_balance: 100000,
      active: true,
      created_at: '2026-01-01',
      updated_at: '2026-01-01',
    };

    const opayAccount: Account = {
      id: 'acc2',
      name: 'OPay',
      type: 'wallet',
      opening_balance: 15000,
      active: true,
      created_at: '2026-01-01',
      updated_at: '2026-01-01',
    };

    // GTBank: opening (100,000) + income (500,000) - expense (45,000) = 555,000
    expect(calculateAccountBalance(gtbankAccount, sampleTransactions)).toBe(555000);

    // OPay: opening (15,000) + income (0) - expense (20,000) = -5,000
    expect(calculateAccountBalance(opayAccount, sampleTransactions)).toBe(-5000);
  });

  it('7. Aggregates multiple categories and income sources', () => {
    const categorySpending = calculateCategorySpending(sampleTransactions);
    expect(categorySpending).toHaveLength(2);
    expect(categorySpending[0].category).toBe('Food');
    expect(categorySpending[0].amount).toBe(45000);
    expect(categorySpending[1].category).toBe('Transport');
    expect(categorySpending[1].amount).toBe(20000);

    const incomeBySource = calculateIncomeBySource(sampleTransactions);
    expect(incomeBySource).toHaveLength(2);
    expect(incomeBySource[0].source).toBe('Salary');
    expect(incomeBySource[0].amount).toBe(500000);
  });

  it('8. Calculates financial savings and savings rate', () => {
    const goals: FinancialGoal[] = [
      {
        id: 'g1',
        name: 'Emergency Fund',
        target_amount: 1000000,
        current_amount: 250000,
        target_date: '2026-12-31',
        status: 'in_progress',
        created_at: '2026-01-01',
        updated_at: '2026-01-01',
      },
    ];

    const savings = calculateSavings(sampleTransactions, goals);
    expect(savings).toBe(250000);

    const rate = calculateSavingsRate(650000, savings);
    expect(rate).toBeCloseTo(38.46, 1); // ~38.5%
  });
});
