'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UserSettings, Category, Account, Transaction } from '@/types';
import {
  ChevronLeft,
  ChevronRight,
  User,
  Wallet,
  Lock,
  KeyRound,
  PiggyBank,
  CalendarCheck,
  Home,
  HelpCircle,
  MessageSquare,
  Clipboard,
  Compass,
  ShieldCheck,
  MessageSquarePlus,
  UserX,
  LogOut,
  Info,
} from 'lucide-react';
import { GoogleSetupModal } from '@/components/shared/GoogleSetupModal';
import { ProfilePage } from './ProfilePage';
import { WalletSettingsPage } from './WalletSettingsPage';
import { PaymentSettingsPage } from './PaymentSettingsPage';
import { LoginSettingsPage } from './LoginSettingsPage';
import { SavingsSettingsPage } from './SavingsSettingsPage';
import { AutoDebitSettingsPage } from './AutoDebitSettingsPage';
import { HomepageSettingsPage } from './HomepageSettingsPage';
import { SecurityQuestionsPage } from './SecurityQuestionsPage';
import { SmsAlertSettingsPage } from './SmsAlertSettingsPage';
import { ClipboardSettingsPage } from './ClipboardSettingsPage';
import { ThemeSettingsPage } from './ThemeSettingsPage';
import { SecurityCenterPage } from './SecurityCenterPage';
import { FeedbackPage } from './FeedbackPage';
import { SetupGuidePage } from './SetupGuidePage';
import { CloseAccountPage } from './CloseAccountPage';
import { AboutPage } from './AboutPage';

type SettingSection =
  | 'profile'
  | 'wallet'
  | 'payment'
  | 'login'
  | 'savings'
  | 'autodebit'
  | 'homepage'
  | 'security_questions'
  | 'sms_alerts'
  | 'clipboard'
  | 'themes'
  | 'security_center'
  | 'feedback'
  | 'about'
  | 'close_account'
  | 'guide'
  | null;

interface SettingsOverviewProps {
  settings: UserSettings;
  categories?: Category[];
  accounts?: Account[];
  transactions?: Transaction[];
  isMock: boolean;
  onRefreshData?: () => void;
}

export function SettingsOverview({
  settings,
  categories = [],
  accounts = [],
  transactions = [],
  isMock,
  onRefreshData,
}: SettingsOverviewProps) {
  const router = useRouter();

  const [activeSection, setActiveSection] = useState<SettingSection>(null);
  const [userGmail, setUserGmail] = useState<string | null>(null);
  const [sheetId, setSheetId] = useState<string | null>(null);
  const [setupComplete, setSetupComplete] = useState<boolean>(false);
  const [setupAt, setSetupAt] = useState<string | null>(null);
  const [securityStatus, setSecurityStatus] = useState('Not Set');

  const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);
  const [isSignOutModalOpen, setIsSignOutModalOpen] = useState(false);

  const loadLocalStorageConfig = () => {
    if (typeof window === 'undefined') return;
    setUserGmail(localStorage.getItem('google_user_gmail'));
    setSheetId(localStorage.getItem('google_sheet_id'));
    setSetupComplete(localStorage.getItem('google_sheets_setup_complete') === 'true');
    setSetupAt(localStorage.getItem('google_sheets_setup_at'));

    const secQ = localStorage.getItem('budgeti_sec_q');
    if (secQ) setSecurityStatus('Configured');
  };

  useEffect(() => {
    loadLocalStorageConfig();
    if (typeof window !== 'undefined' && window.location.hash) {
      const hash = window.location.hash.replace('#', '') as SettingSection;
      if (hash) {
        setActiveSection(hash);
      }
    }
  }, []);

  // Sync back button navigation with browser history
  const handleOpenSection = (section: SettingSection) => {
    setActiveSection(section);
    if (typeof window !== 'undefined' && section) {
      window.history.pushState({ section }, '', `#${section}`);
    }
  };

  const handleBack = () => {
    if (activeSection !== null) {
      setActiveSection(null);
      if (typeof window !== 'undefined' && window.location.hash) {
        window.history.replaceState(null, '', window.location.pathname);
      }
    } else {
      router.push('/');
    }
  };

  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (event.state && event.state.section) {
        setActiveSection(event.state.section);
      } else {
        setActiveSection(null);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem('google_user_gmail');
    localStorage.removeItem('google_sheet_id');
    localStorage.removeItem('google_sheets_setup_complete');
    localStorage.removeItem('google_sheets_setup_at');
    localStorage.removeItem('budgeti_dashboard_cache');
    loadLocalStorageConfig();
    setIsSignOutModalOpen(false);
    if (onRefreshData) onRefreshData();
    router.push('/');
  };

  const handleDisconnect = () => {
    if (!confirm('Disconnect your Google account from this device?')) return;
    handleSignOut();
  };

  const getSectionTitle = () => {
    switch (activeSection) {
      case 'profile':
        return 'My Profile';
      case 'wallet':
        return 'My Wallet & Accounts';
      case 'payment':
        return 'Payment Settings';
      case 'login':
        return 'Login Settings';
      case 'savings':
        return 'Savings Settings';
      case 'autodebit':
        return 'Auto-Debit Management';
      case 'homepage':
        return 'Homepage Settings';
      case 'security_questions':
        return 'Security Questions';
      case 'sms_alerts':
        return 'Alert Settings';
      case 'clipboard':
        return 'Access to Clipboard';
      case 'themes':
        return 'Themes';
      case 'security_center':
        return 'Security Center';
      case 'feedback':
        return 'Feedback and Suggestions';
      case 'about':
        return 'About';
      case 'close_account':
        return 'Close Account';
      case 'guide':
        return 'Google Sheets Setup Guide';
      default:
        return 'Settings';
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Mobile Bar matching screenshot: < Settings */}
      <div className="flex items-center justify-between py-2 relative">
        <button
          type="button"
          onClick={handleBack}
          className="p-2 -ml-2 rounded-xl text-slate-100 hover:bg-slate-800/60 active:scale-95 transition z-10"
          title={activeSection ? 'Back to Settings' : 'Back to Home'}
        >
          <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
        </button>

        <h1 className="text-base font-bold text-slate-100 absolute left-1/2 -translate-x-1/2 text-center pointer-events-none">
          {getSectionTitle()}
        </h1>
      </div>

      {/* ── Subpage Views ── */}
      {activeSection === 'profile' && (
        <ProfilePage
          userGmail={userGmail}
          sheetId={sheetId}
          setupComplete={setupComplete}
          setupAt={setupAt}
          isMock={isMock}
          onOpenSetupModal={() => setIsSetupModalOpen(true)}
          onDisconnect={handleDisconnect}
        />
      )}

      {activeSection === 'wallet' && (
        <WalletSettingsPage
          accounts={accounts}
          transactions={transactions}
          currency={settings.currency}
          onRefreshData={onRefreshData}
        />
      )}

      {activeSection === 'payment' && (
        <PaymentSettingsPage
          settings={settings}
          onOpenWallet={() => handleOpenSection('wallet')}
        />
      )}

      {activeSection === 'login' && (
        <LoginSettingsPage onOpenSetupGuide={() => handleOpenSection('guide')} />
      )}

      {activeSection === 'savings' && <SavingsSettingsPage settings={settings} />}

      {activeSection === 'autodebit' && <AutoDebitSettingsPage />}

      {activeSection === 'homepage' && <HomepageSettingsPage />}

      {activeSection === 'security_questions' && (
        <SecurityQuestionsPage onStatusChange={(st) => setSecurityStatus(st)} />
      )}

      {activeSection === 'sms_alerts' && <SmsAlertSettingsPage isMock={isMock} />}

      {activeSection === 'clipboard' && <ClipboardSettingsPage />}

      {activeSection === 'themes' && <ThemeSettingsPage />}

      {activeSection === 'security_center' && <SecurityCenterPage isMock={isMock} />}

      {activeSection === 'feedback' && (
        <FeedbackPage onOpenSetupGuide={() => handleOpenSection('guide')} />
      )}

      {activeSection === 'about' && <AboutPage />}

      {activeSection === 'close_account' && (
        <CloseAccountPage
          userGmail={userGmail}
          onAccountClosed={() => {
            loadLocalStorageConfig();
            if (onRefreshData) onRefreshData();
          }}
        />
      )}

      {activeSection === 'guide' && <SetupGuidePage />}

      {/* ── Main Settings Menu matching screenshot ── */}
      {activeSection === null && (
        <div className="space-y-4 pb-12">
          {/* Card 1: 5 items */}
          <div className="rounded-2xl bg-slate-900 border border-slate-800 shadow-md shadow-black/25 overflow-hidden divide-y divide-slate-800/80">
            {/* My Profile */}
            <button
              type="button"
              onClick={() => handleOpenSection('profile')}
              className="w-full px-4 py-4 min-h-[58px] flex items-center justify-between hover:bg-slate-800/60 active:bg-slate-800 transition text-left group"
            >
              <div className="flex items-center gap-5">
                <User className="w-5 h-5 text-emerald-400 stroke-[1.9] shrink-0" />
                <span className="text-[15px] font-semibold text-slate-100 group-hover:text-emerald-400 transition-colors">
                  My Profile
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-200 group-hover:translate-x-0.5 transition-all stroke-[2]" />
            </button>

            {/* My Wallet & Accounts */}
            <button
              type="button"
              onClick={() => handleOpenSection('wallet')}
              className="w-full px-4 py-4 min-h-[58px] flex items-center justify-between hover:bg-slate-800/60 active:bg-slate-800 transition text-left group"
            >
              <div className="flex items-center gap-5">
                <Wallet className="w-5 h-5 text-emerald-400 stroke-[1.9] shrink-0" />
                <span className="text-[15px] font-semibold text-slate-100 group-hover:text-emerald-400 transition-colors">
                  My Wallet & Accounts
                </span>
              </div>
              <div className="flex items-center gap-2">
                {accounts.length > 0 && (
                  <span className="text-xs font-semibold text-slate-400">
                    {accounts.length}
                  </span>
                )}
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-200 group-hover:translate-x-0.5 transition-all stroke-[2]" />
              </div>
            </button>

            {/* Payment Settings */}
            <button
              type="button"
              onClick={() => handleOpenSection('payment')}
              className="w-full px-4 py-4 min-h-[58px] flex items-center justify-between hover:bg-slate-800/60 active:bg-slate-800 transition text-left group"
            >
              <div className="flex items-center gap-5">
                <Lock className="w-5 h-5 text-emerald-400 stroke-[1.9] shrink-0" />
                <span className="text-[15px] font-semibold text-slate-100 group-hover:text-emerald-400 transition-colors">
                  Payment Settings
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-200 group-hover:translate-x-0.5 transition-all stroke-[2]" />
            </button>

            {/* Login Settings */}
            <button
              type="button"
              onClick={() => handleOpenSection('login')}
              className="w-full px-4 py-4 min-h-[58px] flex items-center justify-between hover:bg-slate-800/60 active:bg-slate-800 transition text-left group"
            >
              <div className="flex items-center gap-5">
                <KeyRound className="w-5 h-5 text-emerald-400 stroke-[1.9] shrink-0" />
                <span className="text-[15px] font-semibold text-slate-100 group-hover:text-emerald-400 transition-colors">
                  Login Settings
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-200 group-hover:translate-x-0.5 transition-all stroke-[2]" />
            </button>

            {/* Savings Settings */}
            <button
              type="button"
              onClick={() => handleOpenSection('savings')}
              className="w-full px-4 py-4 min-h-[58px] flex items-center justify-between hover:bg-slate-800/60 active:bg-slate-800 transition text-left group"
            >
              <div className="flex items-center gap-5">
                <PiggyBank className="w-5 h-5 text-emerald-400 stroke-[1.9] shrink-0" />
                <span className="text-[15px] font-semibold text-slate-100 group-hover:text-emerald-400 transition-colors">
                  Savings Settings
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-200 group-hover:translate-x-0.5 transition-all stroke-[2]" />
            </button>

            {/* Auto-Debit Management */}
            <button
              type="button"
              onClick={() => handleOpenSection('autodebit')}
              className="w-full px-4 py-4 min-h-[58px] flex items-center justify-between hover:bg-slate-800/60 active:bg-slate-800 transition text-left group"
            >
              <div className="flex items-center gap-5">
                <CalendarCheck className="w-5 h-5 text-emerald-400 stroke-[1.9] shrink-0" />
                <span className="text-[15px] font-semibold text-slate-100 group-hover:text-emerald-400 transition-colors">
                  Auto-Debit Management
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-200 group-hover:translate-x-0.5 transition-all stroke-[2]" />
            </button>
          </div>

          {/* Card 2: 5 items */}
          <div className="rounded-2xl bg-slate-900 border border-slate-800 shadow-md shadow-black/25 overflow-hidden divide-y divide-slate-800/80">
            {/* Homepage Settings */}
            <button
              type="button"
              onClick={() => handleOpenSection('homepage')}
              className="w-full px-4 py-4 min-h-[58px] flex items-center justify-between hover:bg-slate-800/60 active:bg-slate-800 transition text-left group"
            >
              <div className="flex items-center gap-5">
                <Home className="w-5 h-5 text-emerald-400 stroke-[1.9] shrink-0" />
                <span className="text-[15px] font-semibold text-slate-100 group-hover:text-emerald-400 transition-colors">
                  Homepage Settings
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-rose-500 shadow-sm shadow-rose-500/50" />
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-200 group-hover:translate-x-0.5 transition-all stroke-[2]" />
              </div>
            </button>

            {/* Security Questions */}
            <button
              type="button"
              onClick={() => handleOpenSection('security_questions')}
              className="w-full px-4 py-4 min-h-[58px] flex items-center justify-between hover:bg-slate-800/60 active:bg-slate-800 transition text-left group"
            >
              <div className="flex items-center gap-5">
                <HelpCircle className="w-5 h-5 text-emerald-400 stroke-[1.9] shrink-0" />
                <span className="text-[15px] font-semibold text-slate-100 group-hover:text-emerald-400 transition-colors">
                  Security Questions
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <span
                  className={`text-xs font-semibold ${
                    securityStatus === 'Not Set'
                      ? 'text-amber-400'
                      : 'text-emerald-400'
                  }`}
                >
                  {securityStatus}
                </span>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-200 group-hover:translate-x-0.5 transition-all stroke-[2]" />
              </div>
            </button>

            {/* Alert Settings */}
            <button
              type="button"
              onClick={() => handleOpenSection('sms_alerts')}
              className="w-full px-4 py-4 min-h-[58px] flex items-center justify-between hover:bg-slate-800/60 active:bg-slate-800 transition text-left group"
            >
              <div className="flex items-center gap-5">
                <MessageSquare className="w-5 h-5 text-emerald-400 stroke-[1.9] shrink-0" />
                <span className="text-[15px] font-semibold text-slate-100 group-hover:text-emerald-400 transition-colors">
                  Alert Settings
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-200 group-hover:translate-x-0.5 transition-all stroke-[2]" />
            </button>

            {/* Access to Clipboard */}
            <button
              type="button"
              onClick={() => handleOpenSection('clipboard')}
              className="w-full px-4 py-4 min-h-[58px] flex items-center justify-between hover:bg-slate-800/60 active:bg-slate-800 transition text-left group"
            >
              <div className="flex items-center gap-5">
                <Clipboard className="w-5 h-5 text-emerald-400 stroke-[1.9] shrink-0" />
                <span className="text-[15px] font-semibold text-slate-100 group-hover:text-emerald-400 transition-colors">
                  Access to Clipboard
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-200 group-hover:translate-x-0.5 transition-all stroke-[2]" />
            </button>

            {/* Themes */}
            <button
              type="button"
              onClick={() => handleOpenSection('themes')}
              className="w-full px-4 py-4 min-h-[58px] flex items-center justify-between hover:bg-slate-800/60 active:bg-slate-800 transition text-left group"
            >
              <div className="flex items-center gap-5">
                <Compass className="w-5 h-5 text-emerald-400 stroke-[1.9] shrink-0" />
                <span className="text-[15px] font-semibold text-slate-100 group-hover:text-emerald-400 transition-colors">
                  Themes
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-rose-500 shadow-sm shadow-rose-500/50" />
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-200 group-hover:translate-x-0.5 transition-all stroke-[2]" />
              </div>
            </button>
          </div>

          {/* Card 3: 3 items (Security Center, Feedback, Close Account) */}
          <div className="rounded-2xl bg-slate-900 border border-slate-800 shadow-md shadow-black/25 overflow-hidden divide-y divide-slate-800/80">
            {/* Security Center */}
            <button
              type="button"
              onClick={() => handleOpenSection('security_center')}
              className="w-full px-4 py-4 min-h-[58px] flex items-center justify-between hover:bg-slate-800/60 active:bg-slate-800 transition text-left group"
            >
              <div className="flex items-center gap-5">
                <ShieldCheck className="w-5 h-5 text-emerald-400 stroke-[1.9] shrink-0" />
                <span className="text-[15px] font-semibold text-slate-100 group-hover:text-emerald-400 transition-colors">
                  Security Center
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-200 group-hover:translate-x-0.5 transition-all stroke-[2]" />
            </button>

            {/* Feedback and Suggestions */}
            <button
              type="button"
              onClick={() => handleOpenSection('feedback')}
              className="w-full px-4 py-4 min-h-[58px] flex items-center justify-between hover:bg-slate-800/60 active:bg-slate-800 transition text-left group"
            >
              <div className="flex items-center gap-5">
                <MessageSquarePlus className="w-5 h-5 text-emerald-400 stroke-[1.9] shrink-0" />
                <span className="text-[15px] font-semibold text-slate-100 group-hover:text-emerald-400 transition-colors">
                  Feedback and Suggestions
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-200 group-hover:translate-x-0.5 transition-all stroke-[2]" />
            </button>

            {/* About */}
            <button
              type="button"
              onClick={() => handleOpenSection('about')}
              className="w-full px-4 py-4 min-h-[58px] flex items-center justify-between hover:bg-slate-800/60 active:bg-slate-800 transition text-left group"
            >
              <div className="flex items-center gap-5">
                <Info className="w-5 h-5 text-emerald-400 stroke-[1.9] shrink-0" />
                <span className="text-[15px] font-semibold text-slate-100 group-hover:text-emerald-400 transition-colors">
                  About
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-200 group-hover:translate-x-0.5 transition-all stroke-[2]" />
            </button>

            {/* Close Account (2-layer confirmation) */}
            <button
              type="button"
              onClick={() => handleOpenSection('close_account')}
              className="w-full px-4 py-4 min-h-[58px] flex items-center justify-between hover:bg-rose-950/25 active:bg-rose-950/40 transition text-left group"
            >
              <div className="flex items-center gap-5">
                <UserX className="w-5 h-5 text-rose-500 stroke-[1.9] shrink-0" />
                <span className="text-[15px] font-semibold text-rose-400 group-hover:text-rose-300 transition-colors">
                  Close Account
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-rose-400 group-hover:translate-x-0.5 transition-all stroke-[2]" />
            </button>
          </div>

          {/* ── Sign Out Button at Bottom (Prominent Elevated Card) ── */}
          <div className="pt-3 pb-24">
            <button
              type="button"
              onClick={() => setIsSignOutModalOpen(true)}
              className="w-full py-4 px-5 min-h-[58px] rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 active:bg-rose-500/30 border border-rose-500/30 text-rose-400 hover:text-rose-300 font-bold text-sm shadow-md shadow-rose-950/20 active:scale-98 transition flex items-center justify-center gap-3 cursor-pointer group"
            >
              <LogOut className="w-5 h-5 text-rose-500 group-hover:scale-110 transition-transform stroke-[2.2]" />
              <span className="tracking-wide">Sign Out</span>
            </button>
          </div>
        </div>
      )}

      {/* Sign Out Confirmation Modal */}
      {isSignOutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-2xl bg-slate-900 p-6 border border-slate-800 shadow-2xl space-y-4 text-center text-slate-100">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto border border-rose-500/20">
              <LogOut className="w-6 h-6 stroke-[2]" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-100">
                Sign Out of Budgeti?
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Your credentials on this device will be cleared. You can reconnect your Google Sheet at any time.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setIsSignOutModalOpen(false)}
                className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSignOut}
                className="py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/20 transition"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Setup Modal */}
      <GoogleSetupModal
        isOpen={isSetupModalOpen}
        onClose={() => setIsSetupModalOpen(false)}
        onSuccess={() => {
          loadLocalStorageConfig();
          if (onRefreshData) onRefreshData();
        }}
      />
    </div>
  );
}
