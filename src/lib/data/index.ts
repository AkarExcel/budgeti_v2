import { IFinanceRepository } from './repository';
import { SheetsRepository } from './sheetsRepository';
import { MockRepository } from './mockRepository';

let repositoryInstance: IFinanceRepository | null = null;

export function getFinanceRepository(): IFinanceRepository {
  if (repositoryInstance) {
    return repositoryInstance;
  }

  const spreadsheetId = process.env.GOOGLE_SHEET_ID;
  const clientEmail =
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || process.env.GOOGLE_CLIENT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY;

  const hasCredentials = Boolean(spreadsheetId && clientEmail && privateKey);

  if (hasCredentials) {
    repositoryInstance = new SheetsRepository();
  } else {
    // Fall back seamlessly to Mock repository for development / preview
    repositoryInstance = new MockRepository();
  }

  return repositoryInstance;
}
