import { NextResponse } from 'next/server';
import { getFinanceRepository } from '@/lib/data';
import { TransactionSchema } from '@/lib/validation/schemas';

export async function GET() {
  try {
    const repo = getFinanceRepository();
    const transactions = await repo.getTransactions();
    return NextResponse.json({ success: true, isMock: repo.isMock, data: transactions });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validated = TransactionSchema.parse(body);

    const repo = getFinanceRepository();
    const newTx = await repo.addTransaction(validated);

    return NextResponse.json({ success: true, isMock: repo.isMock, data: newTx }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.errors ? error.errors[0]?.message : error?.message || 'Invalid transaction data' },
      { status: 400 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, ...data } = body;
    if (!id) {
      return NextResponse.json({ success: false, message: 'Transaction ID is required' }, { status: 400 });
    }

    const repo = getFinanceRepository();
    const updated = await repo.updateTransaction(id, data);

    return NextResponse.json({ success: true, isMock: repo.isMock, data: updated });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to update transaction' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, message: 'Transaction ID is required' }, { status: 400 });
    }

    const repo = getFinanceRepository();
    const deleted = await repo.deleteTransaction(id);

    return NextResponse.json({ success: deleted, isMock: repo.isMock });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to delete transaction' },
      { status: 500 }
    );
  }
}
