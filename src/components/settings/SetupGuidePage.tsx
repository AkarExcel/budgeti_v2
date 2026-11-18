'use client';

import React from 'react';
import { FileSpreadsheet, CheckCircle2, ShieldCheck, Copy, Check } from 'lucide-react';

export function SetupGuidePage() {
  const [copied, setCopied] = React.useState(false);

  const envTemplate = `GOOGLE_SHEET_ID=your_spreadsheet_id_here
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\n...\\n-----END PRIVATE KEY-----\\n"`;

  const handleCopy = () => {
    navigator.clipboard?.writeText(envTemplate);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs text-slate-400">
          Complete guide to connecting Google Sheets with service account credentials.
        </p>
      </div>

      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3.5 text-xs text-slate-300">
        <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
          <FileSpreadsheet className="w-4 h-4 text-emerald-400" /> 4-Step Google Cloud Configuration
        </h4>

        <ol className="list-decimal pl-4 space-y-2 text-slate-300">
          <li>
            <strong className="text-slate-100">Create a Google Spreadsheet</strong>: Go to{' '}
            <a
              href="https://sheets.new"
              target="_blank"
              rel="noreferrer"
              className="text-emerald-400 underline font-semibold"
            >
              sheets.new
            </a>{' '}
            and create an empty spreadsheet.
          </li>
          <li>
            <strong className="text-slate-100">Enable Google Sheets API</strong>: In{' '}
            <a
              href="https://console.cloud.google.com/"
              target="_blank"
              rel="noreferrer"
              className="text-emerald-400 underline font-semibold"
            >
              Google Cloud Console
            </a>
            , enable the <em>Google Sheets API</em> for your project.
          </li>
          <li>
            <strong className="text-slate-100">Create a Service Account</strong>: Under Credentials,
            create a Service Account and download a JSON key.
          </li>
          <li>
            <strong className="text-slate-100">Share Sheet with Service Account</strong>: Open your
            sheet and share it with the service account email with <strong>Editor</strong>{' '}
            permissions.
          </li>
        </ol>

        <div className="pt-2">
          <div className="flex items-center justify-between mb-1">
            <span className="text-slate-400 font-semibold text-[11px]">
              Environment Variables (.env.local)
            </span>
            <button
              onClick={handleCopy}
              className="text-emerald-400 hover:text-emerald-300 text-[11px] font-semibold flex items-center gap-1 transition"
            >
              {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
          <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-emerald-400 overflow-x-auto">
            {envTemplate}
          </pre>
        </div>

        <div className="flex items-start gap-2 pt-2 text-emerald-400 text-xs font-semibold bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20">
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
          <span>
            Automatic Worksheet Generator: Budgeti automatically validates and sets up all 7
            required worksheets (Transactions, Budgets, Categories, Accounts, Income Sources,
            Goals, Settings) on your first sync!
          </span>
        </div>
      </div>
    </div>
  );
}
