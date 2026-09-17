import { NextResponse } from 'next/server';
import { getFinanceRepository } from '@/lib/data';
import { BudgetSchema } from '@/lib/validation/schemas';

export async function GET() {
  try {
    const repo = getFinanceRepository();
    const budgets = await repo.getBudgets();
    return NextResponse.json({ success: true, isMock: repo.isMock, data: budgets });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to fetch budgets' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validated = BudgetSchema.parse(body);

    const repo = getFinanceRepository();
    const saved = await repo.saveBudget(validated);

    return NextResponse.json({ success: true, isMock: repo.isMock, data: saved }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.errors ? error.errors[0]?.message : error?.message || 'Invalid budget data' },
      { status: 400 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, message: 'Budget ID is required' }, { status: 400 });
    }

    const repo = getFinanceRepository();
    const deleted = await repo.deleteBudget(id);

    return NextResponse.json({ success: deleted, isMock: repo.isMock });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to delete budget' },
      { status: 500 }
    );
  }
}
