# Akar Finance - Mobile-First Personal Finance Web Application

Akar Finance is a production-ready, mobile-first personal finance tracking, budgeting, income, expense, savings, and financial goals management system built with Next.js (App Router), TypeScript, Tailwind CSS, Zod, React Hook Form, and Recharts.

It uses Google Sheets as its primary data store with two-way data synchronization and features a clean repository abstraction layer (`IFinanceRepository`) to enable seamless future migration to PostgreSQL without UI rebuilds.

---

## Features

- **Mobile-First Smartphone UX**: Bottom navigation bar (Home, Transactions, Quick Add, Budget, Reports), sticky touch targets, clean restrained dark/light blue-green financial theme.
- **Two-Way Google Sheets Sync**:
  - Web App → Google Sheets: Instantly writes transaction edits, additions, budgets, goals, and settings to Google Sheets.
  - Google Sheets → Web App: Synchronizes directly modified rows in Google Sheets back into the web app via the "Sync Now" button or page load auto-refresh.
  - Conflict Handling: Manages record conflicts using `updated_at` timestamps (last-write-wins strategy with conflict notification).
- **Comprehensive Financial Calculation Engine**:
  - Total Income, Total Expenses, Net Cash Flow
  - Account Balances (calculated from Opening Balance + Income - Expenses)
  - Savings & Savings Rate (%)
  - Monthly Category Budget spent, remaining, and percentage used with progress indicators and exceeded alerts.
- **7 Worksheets Structure**:
  1. `Transactions`: `id`, `date`, `type`, `category`, `description`, `amount`, `account`, `payment_method`, `notes`, `created_at`, `updated_at`
  2. `Budgets`: `id`, `month`, `category`, `budget_amount`, `created_at`, `updated_at`
  3. `Categories`: `id`, `name`, `type`, `active`, `created_at`
  4. `Accounts`: `id`, `name`, `type`, `opening_balance`, `active`, `created_at`, `updated_at`
  5. `Income Sources`: `id`, `name`, `active`, `created_at`
  6. `Financial Goals`: `id`, `name`, `target_amount`, `current_amount`, `target_date`, `status`, `created_at`, `updated_at`
  7. `Settings`: `currency`, `monthly_income_target`, `monthly_savings_target`, `default_account`, `date_format`
- **Fast Transaction Entry**: Quick tab toggle between Income and Expense with dynamic field rendering and Zod schema validation.
- **Visual Reports & Analytics**: Interactive mobile-friendly Recharts (Income vs Expenses trend bar chart, Category spending pie chart, Income sources breakdown, Account balances overview).
- **Financial Goals Tracker**: Create & track progress towards Emergency Fund, Laptop, Land Investment, Business Capital, or Vacation.
- **Progressive Web App (PWA)**: Web app manifest and metadata configured for native installation on Android/iOS.
- **Automatic Fallback Development Mode**: Built-in mock repository pre-seeded with realistic Nigerian financial data when Google API keys are unconfigured.

---

## Tech Stack

- **Framework**: Next.js 15+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Data Validation**: Zod
- **Form Management**: React Hook Form with `@hookform/resolvers/zod`
- **Charts**: Recharts
- **Icons**: Lucide React
- **Google Integration**: `googleapis` (Google Sheets API v4 server-side)
- **Unit Testing**: Vitest

---

## Local Development Setup

### 1. Prerequisites
- Node.js 18+ installed on your system.

### 2. Running Locally

If Node.js is located at `C:\Program Files\nodejs` (on Windows), run commands using the node path or adding node to environment PATH:

```powershell
# Add Node.js to your current PowerShell session PATH:
$env:PATH = "C:\Program Files\nodejs;" + $env:PATH

# Install dependencies:
npm install

# Run unit tests for financial calculations:
npx vitest run tests/calculations.test.ts

# Start local development server:
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Google Cloud & Google Sheets API Setup

1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new Google Cloud project (e.g. `akar-finance`).
3. Enable the **Google Sheets API**:
   - Navigate to **APIs & Services > Library**.
   - Search for **Google Sheets API** and click **Enable**.
4. Create a Service Account:
   - Go to **APIs & Services > Credentials**.
   - Click **Create Credentials > Service Account**.
   - Enter a name (e.g., `akar-sheets-sync`) and click **Create and Continue**.
   - Under **Keys**, click **Add Key > Create new key** select **JSON**, and download the key file.
5. Create a Google Spreadsheet:
   - Create a new blank Google Spreadsheet at [https://sheets.new](https://sheets.new).
   - Copy the **Spreadsheet ID** from the URL:
     `https://docs.google.com/spreadsheets/d/YOUR_SPREADSHEET_ID_HERE/edit`
   - Share the Google Spreadsheet with your Service Account email (e.g., `akar-sheets-sync@project-id.iam.gserviceaccount.com`) as **Editor**.

---

## Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Fill in the environment variables:

```env
GOOGLE_SHEET_ID=your_spreadsheet_id_here
GOOGLE_SERVICE_ACCOUNT_EMAIL=akar-sheets-sync@your-project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYourKeyHere\n-----END PRIVATE KEY-----\n"
```

*Note: On first synchronization, Akar Finance automatically bootstraps all 7 worksheets with standard headers if they are missing or empty.*

---

## Step-by-Step Core Acceptance Test Walkthrough

Verify the complete core application flow:

1. **Open the Mobile Web App**: Open [http://localhost:3000](http://localhost:3000) in a mobile viewport (e.g. Chrome DevTools mobile device mode).
2. **Dashboard Overview**: Check that Total Balance, Total Income, Total Expenses, Net Cash Flow, Savings Rate, and Budget summaries display calculated totals.
3. **Add Transaction**: Tap the floating green **+** button in the bottom navigation.
   - Select **Expense**.
   - Category: `Food`
   - Amount: `5000`
   - Description: `Lunch at Restaurant`
   - Date: Today
   - Account: `GTBank`
   - Tap **Add Expense**.
4. **App & Sheets Update**: The transaction appears in the list and dashboard totals immediately update by -₦5,000.
5. **Google Sheets Sync**: Open your connected Google Sheet's `Transactions` tab. The row with ₦5,000 appears.
6. **External Sheets Edit**: In Google Sheets, edit the amount from `5000` to `6000`.
7. **Two-Way Sync**: Return to Akar Finance and tap **Sync Now** in the header.
8. **Data Verification**: The transaction updates to ₦6,000, and dashboard calculations update automatically.
9. **Budget Management**: Go to the **Budget** tab. Set a monthly budget for Food (e.g., ₦80,000). Spent, remaining, and percentage bars update live.
10. **Financial Goals**: Go to **Goals**. Create a goal for `Emergency Fund` (Target: ₦1,000,000, Current: ₦450,000). Tap **Update Progress** to increment savings.

---

## Deploying to Vercel

1. Push your repository to GitHub / GitLab / Bitbucket.
2. Import your repository into [Vercel](https://vercel.com).
3. Add your Environment Variables under **Project Settings > Environment Variables**:
   - `GOOGLE_SHEET_ID`
   - `GOOGLE_SERVICE_ACCOUNT_EMAIL`
   - `GOOGLE_PRIVATE_KEY`
4. Click **Deploy**. Next.js App Router API route handlers and server-side Sheets integration will deploy smoothly.

---

## Future PostgreSQL Migration Plan

Akar Finance uses a repository pattern (`IFinanceRepository` in `src/lib/data/repository.ts`).

To migrate from Google Sheets to PostgreSQL:
1. Create a `PgRepository` implementing `IFinanceRepository` using Prisma / Drizzle ORM.
2. Replace `getFinanceRepository()` factory in `src/lib/data/index.ts` to return `PgRepository`.
3. No changes are required in the Next.js UI components or calculation layers.
