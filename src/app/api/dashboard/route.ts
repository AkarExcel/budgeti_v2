import { NextResponse } from 'next/server';
import { getFinanceRepository } from '@/lib/data';

export async function GET() {
  try {
    const repo = getFinanceRepository();
    const [transactions, budgets, categories, accounts, goals, settings] =
      await Promise.all([
        repo.getTransactions(),
        repo.getBudgets(),
        repo.getCategories(),
        repo.getAccounts(),
        repo.getGoals(),
        repo.getSettings(),
      ]);

    return NextResponse.json({
      success: true,
      isMock: repo.isMock,
      data: {
        transactions,
        budgets,
        categories,
        accounts,
        goals,
        settings,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}
