import { NextResponse } from 'next/server';
import { getFinanceRepository } from '@/lib/data';
import { CategorySchema } from '@/lib/validation/schemas';

export async function GET() {
  try {
    const repo = getFinanceRepository();
    const categories = await repo.getCategories();
    return NextResponse.json({ success: true, isMock: repo.isMock, data: categories });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validated = CategorySchema.parse(body);

    const repo = getFinanceRepository();
    const saved = await repo.addCategory(validated);

    return NextResponse.json({ success: true, isMock: repo.isMock, data: saved }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.errors ? error.errors[0]?.message : error?.message || 'Invalid category data' },
      { status: 400 }
    );
  }
}
