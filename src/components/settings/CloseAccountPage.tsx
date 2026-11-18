'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, Trash2, CheckCircle2, ShieldAlert, ArrowRight, X } from 'lucide-react';
import { offlineDB } from '@/lib/pwa/db';

interface CloseAccountPageProps {
  userGmail: string | null;
  onAccountClosed?: () => void;
}

export function CloseAccountPage({ userGmail, onAccountClosed }: CloseAccountPageProps) {
  const router = useRouter();

  // Step 1: Warning & Checklist; Step 2: Final Word Verification; Step 3: Completed
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Layer 1 checkbox acknowledgments
  const [check1, setCheck1] = useState(false);
  const [check2, setCheck2] = useState(false);

  // Layer 2 confirmation text input
  const [confirmInput, setConfirmInput] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const canProceedToLayer2 = check1 && check2;
  const isConfirmInputValid = confirmInput.trim().toUpperCase() === 'CLOSE';

  const handleFinalCloseAccount = async () => {
    if (!isConfirmInputValid || isDeleting) return;

    setIsDeleting(true);
    try {
      // 1. Clear all IndexedDB offline storage & queue
      try {
        await offlineDB.clearQueue();
        const indexedDB = window.indexedDB;
        if (indexedDB) {
          indexedDB.deleteDatabase('budgeti-offline');
        }
      } catch (err) {
        console.warn('Failed clearing offline DB:', err);
      }

      // 2. Clear all local storage keys
      localStorage.clear();

      setStep(3);

      setTimeout(() => {
        if (onAccountClosed) onAccountClosed();
        router.push('/');
      }, 2500);
    } catch (err) {
      console.error('Error closing account:', err);
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* ── STEP 1: Layer 1 Confirmation (Consequences & Checkboxes) ── */}
      {step === 1 && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 space-y-2">
            <div className="flex items-center gap-2.5 text-rose-500">
              <ShieldAlert className="w-5 h-5 shrink-0" />
              <h3 className="text-sm font-bold">Layer 1: Account Closure Notice</h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Closing your account will disconnect Budgeti from your Google account and wipe all locally cached financial records and pending offline sync queues from this device.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md shadow-black/20 space-y-3.5 text-slate-100">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              What will happen:
            </h4>

            <ul className="space-y-2.5 text-xs text-slate-300">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                <span>
                  <strong>Google Connection:</strong> Budgeti will disconnect from your spreadsheet{' '}
                  {userGmail && <span className="text-emerald-400 font-mono">({userGmail})</span>}.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                <span>
                  <strong>Offline Cache & Queue:</strong> All local IndexedDB snapshots and any unsynced offline mutations will be deleted.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                <span>
                  <strong>Preferences & Reminders:</strong> Notification preferences, habit streaks, and security questions will be reset.
                </span>
              </li>
            </ul>

            <div className="pt-2 border-t border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-slate-200">
                Please confirm the following to proceed:
              </h4>

              <label className="flex items-start gap-3 cursor-pointer group text-xs text-slate-300">
                <input
                  type="checkbox"
                  checked={check1}
                  onChange={(e) => setCheck1(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded text-rose-500 accent-rose-500 cursor-pointer"
                />
                <span className="select-none leading-snug">
                  I understand that any unsaved or pending offline changes on this device will be permanently removed.
                </span>
              </label>

              <label className="flex items-start gap-3 cursor-pointer group text-xs text-slate-300">
                <input
                  type="checkbox"
                  checked={check2}
                  onChange={(e) => setCheck2(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded text-rose-500 accent-rose-500 cursor-pointer"
                />
                <span className="select-none leading-snug">
                  I understand that my linked Google credentials will be completely erased from this device.
                </span>
              </label>
            </div>
          </div>

          <button
            type="button"
            disabled={!canProceedToLayer2}
            onClick={() => setStep(2)}
            className="w-full py-3.5 px-4 rounded-xl bg-rose-500 hover:bg-rose-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-sm shadow-md shadow-rose-500/20 transition flex items-center justify-center gap-2 active:scale-98"
          >
            <span>Proceed to Step 2 Verification</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── STEP 2: Layer 2 Confirmation (Keyword Verification) ── */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 space-y-2">
            <div className="flex items-center gap-2.5 text-rose-500">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <h3 className="text-sm font-bold">Layer 2: Final Verification</h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              This action is irreversible. To permanently erase your account credentials and local data, please type <span className="font-mono font-bold text-rose-500 uppercase">CLOSE</span> in the box below.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md shadow-black/20 space-y-3.5 text-slate-100">
            <label className="block text-xs font-bold text-slate-300">
              Type &ldquo;CLOSE&rdquo; to confirm:
            </label>
            <input
              type="text"
              autoFocus
              placeholder="CLOSE"
              value={confirmInput}
              onChange={(e) => setConfirmInput(e.target.value)}
              className="w-full uppercase font-mono tracking-widest text-center text-base font-bold bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-rose-400 focus:outline-none focus:border-rose-500 shadow-inner"
            />
          </div>

          <div className="space-y-2 pt-1">
            <button
              type="button"
              disabled={!isConfirmInputValid || isDeleting}
              onClick={handleFinalCloseAccount}
              className="w-full py-3.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-sm shadow-md shadow-rose-600/30 transition flex items-center justify-center gap-2 active:scale-98"
            >
              <Trash2 className="w-4 h-4" />
              <span>{isDeleting ? 'Erasing Account Data...' : 'Permanently Close Account'}</span>
            </button>

            <button
              type="button"
              disabled={isDeleting}
              onClick={() => setStep(1)}
              className="w-full py-2.5 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 font-semibold text-xs transition"
            >
              Cancel and Return
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 3: Completed ── */}
      {step === 3 && (
        <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 mx-auto">
            <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
          </div>
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
            Account Closed Successfully
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto leading-relaxed">
            All local data and account credentials have been completely wiped. Redirecting you to the home screen...
          </p>
        </div>
      )}
    </div>
  );
}
