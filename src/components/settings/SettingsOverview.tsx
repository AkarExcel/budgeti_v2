'use client';

import React from 'react';
import { UserSettings } from '@/types';
import { formatCurrency } from '@/lib/utils/formatters';
import { Settings, ShieldCheck, FileSpreadsheet, Key, CheckCircle2 } from 'lucide-react';

interface SettingsOverviewProps {
  settings: UserSettings;
  isMock: boolean;
  onUpdateSettings?: (data: Partial<UserSettings>) => Promise<void>;
}

export function SettingsOverview({ settings, isMock }: SettingsOverviewProps) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-slate-100">Settings & Google Sheets Integration</h2>
        <p className="text-xs text-slate-400">Application defaults & Google Cloud connection status</p>
      </div>

      {/* Sync Mode Status Card */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
        <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" /> Storage Engine Status
        </h3>

        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-100">
              {isMock ? 'Local Seed / Development Mock Repository' : 'Live Google Sheets API Integration'}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {isMock
                ? 'Running with local mock store. Configure .env.local to enable live Google Sheets sync.'
                : 'Connected to your primary Google Spreadsheet data store.'}
            </p>
          </div>
          <span
            className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
              isMock
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
            }`}
          >
            {isMock ? 'Mock Mode' : 'Live Google Sheets'}
          </span>
        </div>
      </div>

      {/* User Preferences Card */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
        <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
          <Settings className="w-4 h-4 text-indigo-400" /> User Financial Preferences
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-slate-400 block mb-1">Default Currency</span>
            <span className="text-sm font-bold text-slate-100">{settings.currency} (Nigerian Naira ₦)</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-slate-400 block mb-1">Default Account</span>
            <span className="text-sm font-bold text-slate-100">{settings.default_account}</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-slate-400 block mb-1">Monthly Income Target</span>
            <span className="text-sm font-bold text-emerald-400">
              {formatCurrency(settings.monthly_income_target)}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-slate-400 block mb-1">Monthly Savings Target</span>
            <span className="text-sm font-bold text-indigo-400">
              {formatCurrency(settings.monthly_savings_target)}
            </span>
          </div>
        </div>
      </div>

      {/* Google Sheets Setup Instructions */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
        <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
          <FileSpreadsheet className="w-4 h-4 text-emerald-400" /> Google Sheets Setup Guide
        </h3>

        <div className="text-xs text-slate-300 space-y-2">
          <p>To connect your own Google Sheet for two-way synchronization:</p>
          <ol className="list-decimal pl-4 space-y-1.5 text-slate-400">
            <li>Create a new spreadsheet in Google Sheets.</li>
            <li>
              In Google Cloud Console, enable the <strong>Google Sheets API</strong> and create a Service Account.
            </li>
            <li>Share your Google Sheet with your Service Account email address (Editor permissions).</li>
            <li>
              Add the environment variables in <code className="text-emerald-400 font-mono bg-slate-950 px-1 py-0.5 rounded">.env.local</code>:
            </li>
          </ol>

          <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-emerald-400 overflow-x-auto">
{`GOOGLE_SHEET_ID=your_spreadsheet_id_here
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\n...\\n-----END PRIVATE KEY-----\\n"`}
          </pre>

          <div className="flex items-center gap-2 pt-2 text-emerald-400 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4" />
            <span>Automatic Worksheet Setup: App auto-creates all 7 required worksheets on first sync!</span>
          </div>
        </div>
      </div>
    </div>
  );
}
