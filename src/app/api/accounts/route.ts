import { NextResponse } from 'next/server';
import { getFinanceRepository } from '@/lib/data';
import { AccountSchema } from '@/lib/validation/schemas';

export async function GET() {
  try {
    const repo = getFinanceRepository();
    const accounts = await repo.getAccounts();
    return NextResponse.json({ success: true, isMock: repo.isMock, data: accounts });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to fetch accounts' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validated = AccountSchema.parse(body);

    const repo = getFinanceRepository();
    const saved = await repo.saveAccount(validated);

    return NextResponse.json({ success: true, isMock: repo.isMock, data: saved }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.errors ? error.errors[0]?.message : error?.message || 'Invalid account data' },
      { status: 400 }
    );
  }
}
