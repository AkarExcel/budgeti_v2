'use client';

import React, { useState, useEffect } from 'react';
import { UserSettings, Category } from '@/types';
import { formatCurrency } from '@/lib/utils/formatters';
import { Settings, ShieldCheck, FileSpreadsheet, CheckCircle2, Mail, Link as LinkIcon, Clock, Tag, Plus } from 'lucide-react';
import { GoogleSetupModal } from '@/components/shared/GoogleSetupModal';
import { AddCategoryModal } from '@/components/categories/AddCategoryModal';

interface SettingsOverviewProps {
  settings: UserSettings;
  categories?: Category[];
  isMock: boolean;
  onUpdateSettings?: (data: Partial<UserSettings>) => Promise<void>;
  onRefreshData?: () => void;
}

export function SettingsOverview({ settings, categories = [], isMock, onRefreshData }: SettingsOverviewProps) {
  const [userGmail, setUserGmail] = useState<string | null>(null);
  const [sheetId, setSheetId] = useState<string | null>(null);
  const [setupComplete, setSetupComplete] = useState<boolean>(false);
  const [setupAt, setSetupAt] = useState<string | null>(null);
  const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  const loadLocalStorageConfig = () => {
    setUserGmail(localStorage.getItem('google_user_gmail'));
    setSheetId(localStorage.getItem('google_sheet_id'));
    setSetupComplete(localStorage.getItem('google_sheets_setup_complete') === 'true');
    setSetupAt(localStorage.getItem('google_sheets_setup_at'));
  };

  useEffect(() => {
    loadLocalStorageConfig();
  }, []);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-slate-100">Settings & Google Sheets Integration</h2>
        <p className="text-xs text-slate-400">Application defaults & Google Cloud connection status</p>
      </div>

      {/* Local Storage Connection Details Card */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" /> Stored Google Account & Sheet Config
          </h3>
          <button
            onClick={() => setIsSetupModalOpen(true)}
            className="text-xs font-semibold px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition"
          >
            {setupComplete ? 'Reconfigure Sheet' : 'Connect Sheet'}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-slate-400 flex items-center gap-1">
              <Mail className="w-3.5 h-3.5 text-emerald-400" /> Gmail Address
            </span>
            <span className="font-semibold text-slate-100 block truncate">
              {userGmail || 'Not configured in Local Storage'}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-slate-400 flex items-center gap-1">
              <LinkIcon className="w-3.5 h-3.5 text-emerald-400" /> Target Sheet ID
            </span>
            <span className="font-mono text-slate-100 block truncate">
              {sheetId || 'Not configured in Local Storage'}
            </span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2
              className={`w-4 h-4 ${setupComplete ? 'text-emerald-400' : 'text-amber-400'}`}
            />
            <span className="text-slate-300 font-medium">
              Workbook & Sheets Structure Status:
            </span>
          </div>
          <span
            className={`font-bold px-2.5 py-0.5 rounded-full text-[11px] ${
              setupComplete
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
            }`}
          >
            {setupComplete ? 'Structure Verified (7/7 Sheets)' : 'Pending Setup'}
          </span>
        </div>

        {setupAt && (
          <p className="text-[11px] text-slate-500 flex items-center gap-1 pt-1">
            <Clock className="w-3 h-3 text-slate-500" />
            Last setup completed on {new Date(setupAt).toLocaleString()}
          </p>
        )}
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

      {/* Categories Management Card */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <Tag className="w-4 h-4 text-emerald-400" /> Categories ({categories.length})
          </h3>
          <button
            onClick={() => setIsCategoryModalOpen(true)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-bold shadow-md shadow-emerald-500/20 transition active:scale-95"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" /> Add Category
          </button>
        </div>

        {categories.length === 0 ? (
          <p className="text-xs text-slate-400 italic p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
            No categories defined yet. Click &quot;Add Category&quot; above to create one.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2 pt-1">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs"
              >
                <span className="font-semibold text-slate-200">{cat.name}</span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                    cat.type === 'income'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : cat.type === 'expense'
                      ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                  }`}
                >
                  {cat.type}
                </span>
              </div>
            ))}
          </div>
        )}
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
            <span>Automatic Worksheet Setup: App auto-creates all 7 required worksheets on setup!</span>
          </div>
        </div>
      </div>

      <GoogleSetupModal
        isOpen={isSetupModalOpen}
        onClose={() => setIsSetupModalOpen(false)}
        onSuccess={() => {
          loadLocalStorageConfig();
        }}
      />

      <AddCategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        onSuccess={() => {
          if (onRefreshData) onRefreshData();
        }}
      />
    </div>
  );
}

