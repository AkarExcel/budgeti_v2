import { NextResponse } from 'next/server';
import { getFinanceRepository } from '@/lib/data';
import { GoalSchema } from '@/lib/validation/schemas';

export async function GET() {
  try {
    const repo = getFinanceRepository();
    const goals = await repo.getGoals();
    return NextResponse.json({ success: true, isMock: repo.isMock, data: goals });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to fetch goals' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validated = GoalSchema.parse(body);

    const repo = getFinanceRepository();
    const saved = await repo.saveGoal(validated);

    return NextResponse.json({ success: true, isMock: repo.isMock, data: saved }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.errors ? error.errors[0]?.message : error?.message || 'Invalid goal data' },
      { status: 400 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, current_amount } = body;

    if (!id || typeof current_amount !== 'number') {
      return NextResponse.json({ success: false, message: 'Goal ID and current_amount are required' }, { status: 400 });
    }

    const repo = getFinanceRepository();
    const updated = await repo.updateGoalAmount(id, current_amount);

    return NextResponse.json({ success: true, isMock: repo.isMock, data: updated });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to update goal amount' },
      { status: 500 }
    );
  }
}
