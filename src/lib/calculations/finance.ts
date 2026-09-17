import { Transaction, Budget, FinancialGoal, Account } from '@/types';

/**
 * Calculates total income from a list of transactions.
 */
export function calculateTotalIncome(transactions: Transaction[] = []): number {
  return transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
}

/**
 * Calculates total expenses from a list of transactions.
 */
export function calculateTotalExpenses(transactions: Transaction[] = []): number {
  return transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
}

/**
 * Calculates net cash flow (Total Income - Total Expenses).
 */
export function calculateNetCashFlow(transactions: Transaction[] = []): number {
  const income = calculateTotalIncome(transactions);
  const expenses = calculateTotalExpenses(transactions);
  return income - expenses;
}

/**
 * Calculates total savings from financial goals or savings category income.
 */
export function calculateSavings(
  transactions: Transaction[] = [],
  goals: FinancialGoal[] = []
): number {
  const goalSavings = goals.reduce((sum, g) => sum + (Number(g.current_amount) || 0), 0);
  if (goalSavings > 0) return goalSavings;

  // Fallback to transactions categorized under Savings or Investments
  return transactions
    .filter(
      (t) =>
        t.type === 'income' &&
        ['savings', 'investment', 'emergency fund'].includes(t.category.toLowerCase())
    )
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
}

/**
 * Calculates savings rate percentage (Savings / Total Income * 100).
 */
export function calculateSavingsRate(totalIncome: number, totalSavings: number): number {
  if (!totalIncome || totalIncome <= 0) return 0;
  const rate = (totalSavings / totalIncome) * 100;
  return isNaN(rate) || !isFinite(rate) ? 0 : Math.min(100, Math.max(0, rate));
}

/**
 * Calculates current account balance based on opening balance + income - expenses.
 */
export function calculateAccountBalance(
  account: Account,
  transactions: Transaction[] = []
): number {
  const accountTransactions = transactions.filter(
    (t) => t.account.toLowerCase().trim() === account.name.toLowerCase().trim()
  );

  const accountIncome = accountTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const accountExpenses = accountTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  return (Number(account.opening_balance) || 0) + accountIncome - accountExpenses;
}

/**
 * Calculates spending for a specific category in a given month (YYYY-MM).
 */
export function calculateBudgetSpent(
  categoryName: string,
  month: string,
  transactions: Transaction[] = []
): number {
  return transactions
    .filter(
      (t) =>
        t.type === 'expense' &&
        t.category.toLowerCase().trim() === categoryName.toLowerCase().trim() &&
        t.date.startsWith(month)
    )
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
}

/**
 * Calculates remaining budget (Budget Amount - Spent).
 */
export function calculateBudgetRemaining(budgetAmount: number, spent: number): number {
  return (Number(budgetAmount) || 0) - (Number(spent) || 0);
}

/**
 * Calculates percentage of budget spent.
 */
export function calculateBudgetPercentage(spent: number, budgetAmount: number): number {
  if (!budgetAmount || budgetAmount <= 0) {
    return spent > 0 ? 100 : 0;
  }
  const pct = (spent / budgetAmount) * 100;
  return isNaN(pct) || !isFinite(pct) ? 0 : Math.round(pct);
}

/**
 * Aggregates expense spending grouped by category.
 */
export function calculateCategorySpending(
  transactions: Transaction[] = []
): Array<{ category: string; amount: number; percentage: number }> {
  const expenses = transactions.filter((t) => t.type === 'expense');
  const totalExpense = expenses.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const totals: Record<string, number> = {};
  expenses.forEach((t) => {
    totals[t.category] = (totals[t.category] || 0) + (Number(t.amount) || 0);
  });

  return Object.entries(totals)
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: totalExpense > 0 ? Math.round((amount / totalExpense) * 100) : 0,
    }))
    .sort((a, b) => b.amount - a.amount);
}

/**
 * Aggregates income grouped by source/category.
 */
export function calculateIncomeBySource(
  transactions: Transaction[] = []
): Array<{ source: string; amount: number; percentage: number }> {
  const incomes = transactions.filter((t) => t.type === 'income');
  const totalIncome = incomes.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const totals: Record<string, number> = {};
  incomes.forEach((t) => {
    const key = t.category || t.description || 'Other Income';
    totals[key] = (totals[key] || 0) + (Number(t.amount) || 0);
  });

  return Object.entries(totals)
    .map(([source, amount]) => ({
      source,
      amount,
      percentage: totalIncome > 0 ? Math.round((amount / totalIncome) * 100) : 0,
    }))
    .sort((a, b) => b.amount - a.amount);
}

/**
 * Calculates monthly totals for charts.
 */
export function calculateMonthlyTotals(
  transactions: Transaction[] = []
): Array<{ month: string; income: number; expense: number; net: number }> {
  const monthlyData: Record<string, { income: number; expense: number }> = {};

  transactions.forEach((t) => {
    if (!t.date) return;
    const monthKey = t.date.substring(0, 7); // YYYY-MM
    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = { income: 0, expense: 0 };
    }
    if (t.type === 'income') {
      monthlyData[monthKey].income += Number(t.amount) || 0;
    } else if (t.type === 'expense') {
      monthlyData[monthKey].expense += Number(t.amount) || 0;
    }
  });

  return Object.keys(monthlyData)
    .sort()
    .map((month) => {
      const income = monthlyData[month].income;
      const expense = monthlyData[month].expense;
      return {
        month,
        income,
        expense,
        net: income - expense,
      };
    });
}
