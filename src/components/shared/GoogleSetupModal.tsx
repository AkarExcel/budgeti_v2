'use client';

import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  Mail,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  ExternalLink,
  X,
  ShieldCheck,
  Table,
} from 'lucide-react';

interface GoogleSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const REQUIRED_WORKSHEETS = [
  'Transactions',
  'Budgets',
  'Categories',
  'Accounts',
  'Income Sources',
  'Financial Goals',
  'Settings',
];

export function GoogleSetupModal({
  isOpen,
  onClose,
  onSuccess,
}: GoogleSetupModalProps) {
  const [gmail, setGmail] = useState('');
  const [sheetId, setSheetId] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'form' | 'verifying' | 'success'>('form');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<{
    message: string;
    isMock: boolean;
    worksheets: string[];
  } | null>(null);

  useEffect(() => {
    if (isOpen) {
      const storedGmail = localStorage.getItem('google_user_gmail') || '';
      const storedSheetId = localStorage.getItem('google_sheet_id') || '';
      setGmail(storedGmail);
      setSheetId(storedSheetId);
      setStep('form');
      setErrorMsg(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gmail || !sheetId) {
      setErrorMsg('Please enter both your Gmail address and Google Sheet ID or URL.');
      return;
    }

    setErrorMsg(null);
    setLoading(true);
    setStep('verifying');

    try {
      const res = await fetch('/api/google/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gmail, sheetId }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to verify spreadsheet structure');
      }

      // Store information on localStorage
      localStorage.setItem('google_user_gmail', gmail.trim());
      localStorage.setItem('google_sheet_id', data.sheetId || sheetId.trim());
      localStorage.setItem('google_sheets_setup_complete', 'true');
      localStorage.setItem('google_sheets_setup_at', new Date().toISOString());

      setSuccessInfo({
        message: data.message,
        isMock: data.isMock,
        worksheets: data.worksheets || REQUIRED_WORKSHEETS,
      });

      setStep('success');
    } catch (err: any) {
      setErrorMsg(err?.message || 'An error occurred during verification.');
      setStep('form');
    } finally {
      setLoading(false);
    }
  };

  const handleUseMockMode = () => {
    localStorage.setItem('google_sheets_setup_complete', 'true');
    localStorage.setItem('google_sheets_mode', 'mock');
    localStorage.setItem('google_sheets_setup_at', new Date().toISOString());
    onSuccess();
    onClose();
  };

  const handleFinish = () => {
    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden text-slate-100 p-6 space-y-5">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              Connect Google Sheets
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Setup Wizard
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Link your Gmail and Google Sheet to automatically sync transactions, budgets, and financial targets.
            </p>
          </div>
        </div>

        {/* Form Error Banner */}
        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {step === 'form' && (
          <form onSubmit={handleConnect} className="space-y-4">
            {/* Gmail Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-emerald-400" />
                Gmail Account Address
              </label>
              <input
                type="email"
                required
                placeholder="your.email@gmail.com"
                value={gmail}
                onChange={(e) => setGmail(e.target.value)}
                className="w-full bg-slate-950 text-slate-100 text-xs rounded-xl px-3.5 py-2.5 border border-slate-800 focus:outline-none focus:border-emerald-500 placeholder:text-slate-600 transition"
              />
              <p className="text-[11px] text-slate-500">
                Stored safely in your browser local storage for account reference.
              </p>
            </div>

            {/* Google Sheet ID / Link Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                Google Sheet ID or Full URL
              </label>
              <input
                type="text"
                required
                placeholder="https://docs.google.com/spreadsheets/d/1BxiMVs0X... or Sheet ID"
                value={sheetId}
                onChange={(e) => setSheetId(e.target.value)}
                className="w-full bg-slate-950 text-slate-100 text-xs rounded-xl px-3.5 py-2.5 border border-slate-800 focus:outline-none focus:border-emerald-500 placeholder:text-slate-600 transition font-mono"
              />
              <p className="text-[11px] text-slate-500">
                Paste the full browser URL or ID of your target spreadsheet.
              </p>
            </div>

            {/* Auto Structure Info Box */}
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                <Sparkles className="w-4 h-4" />
                <span>Automatic Worksheet Structure Verification</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                When you click Connect, the system checks if your Google Sheet contains all required sheets (`Transactions`, `Budgets`, `Categories`, `Accounts`, `Income Sources`, `Financial Goals`, `Settings`). Any missing worksheets and column headers will be automatically generated!
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-98 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying & Setting Up...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Connect & Verify Sheet Structure</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleUseMockMode}
                className="w-full sm:w-auto py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs transition border border-slate-700"
              >
                Use Local Preview Mode
              </button>
            </div>
          </form>
        )}

        {step === 'verifying' && (
          <div className="py-8 flex flex-col items-center justify-center space-y-4 text-center">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-4 border-slate-800 border-t-emerald-400 animate-spin" />
              <FileSpreadsheet className="w-6 h-6 text-emerald-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-100">Initializing Google Sheets Structure</h3>
              <p className="text-xs text-slate-400 max-w-xs">
                Verifying spreadsheet permissions, checking required worksheets, and adding missing column headers...
              </p>
            </div>
          </div>
        )}

        {step === 'success' && successInfo && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-3">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5" />
                <span>Connection & Workbook Structure Saved!</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {successInfo.message}
              </p>
            </div>

            {/* List of Verified Worksheets */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5">
              <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                <Table className="w-3.5 h-3.5 text-emerald-400" />
                Verified & Initialized Worksheets (7/7):
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {REQUIRED_WORKSHEETS.map((ws) => (
                  <div key={ws} className="flex items-center gap-1.5 text-slate-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{ws}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={handleFinish}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition shadow-lg shadow-emerald-500/20 active:scale-98"
            >
              Go to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
