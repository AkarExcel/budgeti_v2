import { getGoogleSheetsClient } from './auth';

export const SHEET_NAMES = {
  TRANSACTIONS: 'Transactions',
  BUDGETS: 'Budgets',
  CATEGORIES: 'Categories',
  ACCOUNTS: 'Accounts',
  INCOME_SOURCES: 'Income Sources',
  FINANCIAL_GOALS: 'Financial Goals',
  SETTINGS: 'Settings',
};

export const SHEET_HEADERS = {
  [SHEET_NAMES.TRANSACTIONS]: [
    'id',
    'date',
    'type',
    'category',
    'description',
    'amount',
    'account',
    'payment_method',
    'notes',
    'created_at',
    'updated_at',
  ],
  [SHEET_NAMES.BUDGETS]: [
    'id',
    'month',
    'category',
    'budget_amount',
    'created_at',
    'updated_at',
  ],
  [SHEET_NAMES.CATEGORIES]: ['id', 'name', 'type', 'active', 'created_at'],
  [SHEET_NAMES.ACCOUNTS]: [
    'id',
    'name',
    'type',
    'opening_balance',
    'active',
    'created_at',
    'updated_at',
  ],
  [SHEET_NAMES.INCOME_SOURCES]: ['id', 'name', 'active', 'created_at'],
  [SHEET_NAMES.FINANCIAL_GOALS]: [
    'id',
    'name',
    'target_amount',
    'current_amount',
    'target_date',
    'status',
    'created_at',
    'updated_at',
  ],
  [SHEET_NAMES.SETTINGS]: [
    'currency',
    'monthly_income_target',
    'monthly_savings_target',
    'default_account',
    'date_format',
  ],
};

export async function readSheetValues(sheetName: string): Promise<string[][]> {
  const sheets = getGoogleSheetsClient();
  const spreadsheetId = process.env.GOOGLE_SHEET_ID;

  if (!sheets || !spreadsheetId) {
    throw new Error('Google Sheets API credentials or GOOGLE_SHEET_ID is missing');
  }

  try {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!A:Z`,
    });
    return res.data.values || [];
  } catch (err: any) {
    console.error(`Error reading sheet ${sheetName}:`, err?.message || err);
    return [];
  }
}

export async function writeSheetValues(
  sheetName: string,
  values: string[][]
): Promise<boolean> {
  const sheets = getGoogleSheetsClient();
  const spreadsheetId = process.env.GOOGLE_SHEET_ID;

  if (!sheets || !spreadsheetId) {
    throw new Error('Google Sheets API credentials or GOOGLE_SHEET_ID is missing');
  }

  try {
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${sheetName}!A1`,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values },
    });
    return true;
  } catch (err: any) {
    console.error(`Error writing sheet ${sheetName}:`, err?.message || err);
    throw err;
  }
}

export async function appendSheetRow(
  sheetName: string,
  row: (string | number | boolean)[]
): Promise<boolean> {
  const sheets = getGoogleSheetsClient();
  const spreadsheetId = process.env.GOOGLE_SHEET_ID;

  if (!sheets || !spreadsheetId) {
    throw new Error('Google Sheets API credentials or GOOGLE_SHEET_ID is missing');
  }

  try {
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${sheetName}!A:Z`,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [row.map((v) => String(v ?? ''))] },
    });
    return true;
  } catch (err: any) {
    console.error(`Error appending row to sheet ${sheetName}:`, err?.message || err);
    throw err;
  }
}

export async function ensureSpreadsheetStructure(): Promise<boolean> {
  const sheets = getGoogleSheetsClient();
  const spreadsheetId = process.env.GOOGLE_SHEET_ID;

  if (!sheets || !spreadsheetId) {
    return false;
  }

  try {
    const meta = await sheets.spreadsheets.get({ spreadsheetId });
    const existingSheetNames = meta.data.sheets?.map((s) => s.properties?.title) || [];

    for (const [sheetKey, name] of Object.entries(SHEET_NAMES)) {
      if (!existingSheetNames.includes(name)) {
        await sheets.spreadsheets.batchUpdate({
          spreadsheetId,
          requestBody: {
            requests: [
              {
                addSheet: {
                  properties: { title: name },
                },
              },
            ],
          },
        });
      }
      // Add default headers if sheet is empty
      const values = await readSheetValues(name);
      if (values.length === 0) {
        const headers = SHEET_HEADERS[name];
        await writeSheetValues(name, [headers]);
      }
    }
    return true;
  } catch (err) {
    console.error('Failed to ensure spreadsheet structure:', err);
    return false;
  }
}
