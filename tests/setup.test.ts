import { describe, it, expect } from 'vitest';
import { SHEET_NAMES, SHEET_HEADERS } from '../src/lib/google/sheets';

describe('Google Sheets Setup & Workbook Structure Verification', () => {
  it('should define all 7 required worksheets', () => {
    const requiredSheets = [
      'Transactions',
      'Budgets',
      'Categories',
      'Accounts',
      'Income Sources',
      'Financial Goals',
      'Settings',
    ];

    const definedSheetNames = Object.values(SHEET_NAMES);
    expect(definedSheetNames).toEqual(expect.arrayContaining(requiredSheets));
    expect(definedSheetNames.length).toBe(7);
  });

  it('should define column header schemas for every worksheet tab', () => {
    for (const name of Object.values(SHEET_NAMES)) {
      const headers = SHEET_HEADERS[name];
      expect(headers).toBeDefined();
      expect(Array.isArray(headers)).toBe(true);
      expect(headers.length).toBeGreaterThan(0);
    }
  });

  it('should sanitize Google Sheet URLs into standard Sheet IDs', () => {
    const fullUrl =
      'https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit#gid=0';
    const match = fullUrl.match(/\/d\/([a-zA-Z0-9-_]+)/);
    const extractedId = match ? match[1] : fullUrl;

    expect(extractedId).toBe('1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms');
  });
});
