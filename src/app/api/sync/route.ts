import { NextResponse } from 'next/server';
import { getFinanceRepository } from '@/lib/data';

export async function POST() {
  try {
    const repo = getFinanceRepository();
    const result = await repo.sync();
    return NextResponse.json({
      success: true,
      lastSyncedAt: result.lastSyncedAt,
      isMock: repo.isMock,
      message: result.message,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error?.message || 'Synchronization failed',
      },
      { status: 500 }
    );
  }
}
