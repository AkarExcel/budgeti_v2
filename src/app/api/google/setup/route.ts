import { NextResponse } from 'next/server';
import { ensureSpreadsheetStructure, SHEET_NAMES } from '@/lib/google/sheets';
import { getFinanceRepository } from '@/lib/data';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { gmail, sheetId: rawSheetId } = body;

    // Sanitize Sheet ID if user inputs full URL
    let sheetId = rawSheetId ? String(rawSheetId).trim() : '';
    if (sheetId.includes('/d/')) {
      const match = sheetId.match(/\/d\/([a-zA-Z0-9-_]+)/);
      if (match && match[1]) {
        sheetId = match[1];
      }
    }

    const repo = getFinanceRepository();

    // If environment or client provided sheet ID is available, attempt to initialize Google Sheets structure
    if (sheetId && !process.env.GOOGLE_SHEET_ID) {
      process.env.GOOGLE_SHEET_ID = sheetId;
    }

    const sheetsCreated = await ensureSpreadsheetStructure();

    return NextResponse.json({
      success: true,
      message: sheetsCreated
        ? 'Google Sheets workbook structure verified and missing worksheets created successfully.'
        : 'Running in local preview / mock repository mode. Default financial worksheets prepared.',
      isMock: repo.isMock || !sheetsCreated,
      sheetId,
      gmail,
      worksheets: Object.values(SHEET_NAMES),
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Google Sheets Setup Error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error?.message || 'Failed to verify or initialize Google Sheets structure.',
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const repo = getFinanceRepository();
    const sheetId = process.env.GOOGLE_SHEET_ID || null;

    return NextResponse.json({
      success: true,
      isMock: repo.isMock,
      sheetId,
      worksheets: Object.values(SHEET_NAMES),
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error?.message || 'Failed to check Google Sheets setup status.',
      },
      { status: 500 }
    );
  }
}
