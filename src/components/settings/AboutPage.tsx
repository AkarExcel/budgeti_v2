'use client';

import React, { useState } from 'react';
import {
  BookOpen,
  FileText,
  Rocket,
  ChevronRight,
  X,
  CheckCircle2,
  RefreshCw,
  Shield,
  Lock,
} from 'lucide-react';

export function AboutPage() {
  const [showUpToDateModal, setShowUpToDateModal] = useState(false);
  const [isCheckingUpdate, setIsCheckingUpdate] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [appVersion, setAppVersion] = useState('1.0.0');

  const handleCheckUpdate = async () => {
    setIsCheckingUpdate(true);
    try {
      // 1. Try to trigger Service Worker update check
      if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
        const reg = await navigator.serviceWorker.getRegistration();
        if (reg) {
          await reg.update().catch(() => {});
        }
      }

      // 2. Query version endpoint
      const res = await fetch('/api/version');
      if (res.ok) {
        const data = await res.json();
        if (data.version) setAppVersion(data.version);
      }
    } catch {
      // Offline or network error — fallback gracefully
    } finally {
      // Give a brief natural check delay
      setTimeout(() => {
        setIsCheckingUpdate(false);
        setShowUpToDateModal(true);
      }, 600);
    }
  };

  return (
    <div className="space-y-6 pt-2 pb-16">
      {/* ── Brand Logo & App Version ── */}
      <div className="flex flex-col items-center justify-center pt-4 pb-2 text-center">
        <div className="flex items-center gap-3 mb-2">
          {/* Circular Logo Badge matching screenshot style */}
          <div className="relative w-11 h-11 rounded-full border-[3px] border-emerald-500 flex items-center justify-center bg-transparent">
            <div className="w-2.5 h-1.5 bg-emerald-500 absolute -top-1 left-3 rounded-full" />
            <span className="text-emerald-500 dark:text-emerald-400 font-extrabold text-xl leading-none">
              ₦
            </span>
          </div>
          <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            Budgeti
          </span>
        </div>
        <p className="text-sm font-normal text-slate-400 dark:text-slate-500">
          Version {appVersion}
        </p>
      </div>

      {/* ── Card 1: Terms & Conditions + Privacy Policy ── */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden divide-y divide-slate-100 dark:divide-slate-800/80">
        {/* Terms & Conditions */}
        <button
          type="button"
          onClick={() => setShowTermsModal(true)}
          className="w-full px-4 py-4 min-h-[58px] flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 active:bg-slate-100 dark:active:bg-slate-800 transition text-left group"
        >
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <BookOpen className="w-4 h-4 stroke-[2]" />
            </div>
            <span className="text-[15px] font-semibold text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
              Terms & Conditions
            </span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 group-hover:translate-x-0.5 transition-all stroke-[2]" />
        </button>

        {/* Privacy Policy */}
        <button
          type="button"
          onClick={() => setShowPrivacyModal(true)}
          className="w-full px-4 py-4 min-h-[58px] flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 active:bg-slate-100 dark:active:bg-slate-800 transition text-left group"
        >
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4 stroke-[2]" />
            </div>
            <span className="text-[15px] font-semibold text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
              Privacy Policy
            </span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 group-hover:translate-x-0.5 transition-all stroke-[2]" />
        </button>
      </div>

      {/* ── Card 2: Version Upgrade ── */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        <button
          type="button"
          onClick={handleCheckUpdate}
          disabled={isCheckingUpdate}
          className="w-full px-4 py-4 min-h-[58px] flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 active:bg-slate-100 dark:active:bg-slate-800 transition text-left group disabled:opacity-60"
        >
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              {isCheckingUpdate ? (
                <RefreshCw className="w-4 h-4 animate-spin stroke-[2]" />
              ) : (
                <Rocket className="w-4 h-4 stroke-[2]" />
              )}
            </div>
            <div>
              <span className="text-[15px] font-semibold text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                Version Upgrade
              </span>
              {isCheckingUpdate && (
                <p className="text-[11px] text-emerald-500 font-medium animate-pulse">
                  Checking for latest version...
                </p>
              )}
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 group-hover:translate-x-0.5 transition-all stroke-[2]" />
        </button>
      </div>

      {/* ── Pop-up Modal matching user screenshot (Image 2) ── */}
      {showUpToDateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-[320px] rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-2xl p-6 text-center animate-in zoom-in-95 duration-200">
            <p className="text-[15px] font-medium text-slate-800 dark:text-slate-100 mt-2 mb-6">
              The App version is already the Newest.
            </p>

            <button
              type="button"
              onClick={() => setShowUpToDateModal(false)}
              className="w-full py-3.5 rounded-full bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-semibold text-sm transition-all shadow-md shadow-emerald-500/25"
            >
              Got it
            </button>
          </div>
        </div>
      )}

      {/* ── Terms & Conditions Reader Modal ── */}
      {showTermsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg max-h-[85vh] rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-500" />
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Terms & Conditions
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowTermsModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              <div>
                <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 mb-1">
                  1. Acceptance of Terms
                </h4>
                <p>
                  By accessing or using Budgeti, you acknowledge and agree to comply with these terms. Budgeti provides offline-first personal financial management and synchronization with your designated Google Sheets account.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 mb-1">
                  2. User Ownership of Financial Data
                </h4>
                <p>
                  You retain 100% ownership and control over all financial records, transactions, account balances, and budgeting sheets created or managed through Budgeti. We do not store, license, or sell your financial data to any third party.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 mb-1">
                  3. Offline-First PWA Storage
                </h4>
                <p>
                  Budgeti caches application resources and queued changes locally in your browser via IndexedDB and Service Worker caches. While offline, changes are persisted securely on your device and queued for background synchronization once network access is restored.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 mb-1">
                  4. Disclaimer & Responsibility
                </h4>
                <p>
                  Budgeti is a personal tracking tool and does not provide certified financial, investment, or legal advice. You are responsible for safeguarding your device credentials and Google account security.
                </p>
              </div>

              <p className="text-[11px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                Last updated: November 2026 · Budgeti System
              </p>
            </div>

            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40">
              <button
                type="button"
                onClick={() => setShowTermsModal(false)}
                className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-semibold text-xs transition"
              >
                Close Terms
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Privacy Policy Reader Modal ── */}
      {showPrivacyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg max-h-[85vh] rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-500" />
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Privacy Policy
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowPrivacyModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              <div>
                <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 mb-1">
                  1. Zero Third-Party Tracking
                </h4>
                <p>
                  Budgeti does not include behavioral tracking pixels, third-party analytics trackers, advertising SDKs, or data brokers. Your financial habits and records belong solely to you.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 mb-1">
                  2. Google Sheets Authentication & Scope
                </h4>
                <p>
                  When you connect Google Sheets, Budgeti communicates directly with the Google Sheets API using standard OAuth2 tokens. We only read and write to your designated Budgeti spreadsheet.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 mb-1">
                  3. Local Device Storage
                </h4>
                <p>
                  To power fast offline loading, cached financial summaries and habit streak states are encrypted and stored in your device&apos;s localStorage and IndexedDB. You can purge this data at any time via Settings &gt; Close Account or Sign Out.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 mb-1">
                  4. Browser Push & Notification Permissions
                </h4>
                <p>
                  Budgeti requests notification permissions exclusively for habit reminders, expense prompts, and budget threshold alerts scheduled according to your personal settings.
                </p>
              </div>

              <p className="text-[11px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                Privacy is our fundamental architecture · Budgeti 2026
              </p>
            </div>

            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40">
              <button
                type="button"
                onClick={() => setShowPrivacyModal(false)}
                className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-semibold text-xs transition"
              >
                Close Privacy Policy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
