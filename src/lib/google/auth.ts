import { google } from 'googleapis';

export function getGoogleSheetsClient() {
  const clientEmail =
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || process.env.GOOGLE_CLIENT_EMAIL;
  
  // Format private key properly handling newlines and quotes
  let privateKey = process.env.GOOGLE_PRIVATE_KEY;
  if (privateKey) {
    privateKey = privateKey.trim();
    if (
      (privateKey.startsWith('"') && privateKey.endsWith('"')) ||
      (privateKey.startsWith("'") && privateKey.endsWith("'"))
    ) {
      privateKey = privateKey.slice(1, -1);
    }
    privateKey = privateKey
      .replace(/^"+|"+$/g, '')
      .replace(/^'+|'+$/g, '')
      .replace(/\\n/g, '\n')
      .trim();
  }

  if (!clientEmail || !privateKey) {
    return null;
  }

  try {
    const auth = new google.auth.JWT({
      email: clientEmail,
      key: privateKey,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    return google.sheets({ version: 'v4', auth });
  } catch (err) {
    console.error('Failed to initialize Google Sheets Auth client:', err);
    return null;
  }
}
