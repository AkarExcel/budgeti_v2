'use client';

import React from 'react';
import { useTheme, ThemeMode } from '@/lib/theme/ThemeContext';
import { Sun, Moon, Smartphone, Check, Sparkles } from 'lucide-react';

export function ThemeSettingsPage() {
  const { theme, setTheme, resolvedTheme } = useTheme();

  const isSystem = theme === 'system';
  const isDark = resolvedTheme === 'dark';

  const handleSystemToggle = () => {
    if (isSystem) {
      // Turn off system mode -> pin to current resolved theme
      setTheme(resolvedTheme);
    } else {
      // Turn on system mode
      setTheme('system');
    }
  };

  const handleDarkModeToggle = () => {
    if (isDark) {
      setTheme('light');
    } else {
      setTheme('dark');
    }
  };

  return (
    <div className="space-y-4">
      {/* ── 1. 3-Way Segmented Switch Pill Bar ── */}
      <div className="p-1 rounded-2xl bg-slate-200/80 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 grid grid-cols-3 gap-1 shadow-inner">
        <button
          type="button"
          onClick={() => setTheme('light')}
          className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 active:scale-95 ${
            theme === 'light'
              ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Sun className="w-4 h-4" />
          <span>Light</span>
        </button>

        <button
          type="button"
          onClick={() => setTheme('dark')}
          className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 active:scale-95 ${
            theme === 'dark'
              ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Moon className="w-4 h-4" />
          <span>Dark</span>
        </button>

        <button
          type="button"
          onClick={() => setTheme('system')}
          className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 active:scale-95 ${
            theme === 'system'
              ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Smartphone className="w-4 h-4" />
          <span>System</span>
        </button>
      </div>

      {/* ── 2. iOS / Android Style Switch Settings Card ── */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md shadow-black/20 space-y-4 text-slate-100">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Appearance Switches
        </h4>

        {/* Switch 1: System Mode */}
        <div className="flex items-center justify-between py-1">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20 shrink-0">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-100">
                Match Device System Settings
              </p>
              <p className="text-xs text-slate-400">
                {isSystem
                  ? `Active (Current OS theme: ${resolvedTheme})`
                  : 'Follows iOS, Android, or Windows setting'}
              </p>
            </div>
          </div>

          {/* Toggle Switch */}
          <button
            type="button"
            role="switch"
            aria-checked={isSystem}
            onClick={handleSystemToggle}
            className={`w-12 h-7 rounded-full transition-colors relative flex items-center p-0.5 cursor-pointer shrink-0 ${
              isSystem ? 'bg-emerald-500' : 'bg-slate-700'
            }`}
          >
            <div
              className={`w-6 h-6 rounded-full bg-white shadow-md transition-transform duration-200 ${
                isSystem ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        <div className="h-px bg-slate-800" />

        {/* Switch 2: Dark Mode */}
        <div className="flex items-center justify-between py-1">
          <div className="flex items-center gap-4">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center border transition shrink-0 ${
                isDark
                  ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                  : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
              }`}
            >
              {isDark ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </div>
            <div>
              <p className="text-sm font-bold text-slate-100">
                Dark Mode
              </p>
              <p className="text-xs text-slate-400">
                {isDark ? 'Dark OLED slate appearance active' : 'Light bright appearance active'}
              </p>
            </div>
          </div>

          {/* Toggle Switch */}
          <button
            type="button"
            role="switch"
            aria-checked={isDark}
            onClick={handleDarkModeToggle}
            className={`w-12 h-7 rounded-full transition-colors relative flex items-center p-0.5 cursor-pointer shrink-0 ${
              isDark ? 'bg-emerald-500' : 'bg-slate-700'
            }`}
          >
            <div
              className={`w-6 h-6 rounded-full bg-white shadow-md transition-transform duration-200 ${
                isDark ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* ── 3. Visual Mockup Selection Cards ── */}
      <div className="space-y-2.5">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
          Theme Presets
        </h4>

        {/* Light Option Card */}
        <button
          type="button"
          onClick={() => setTheme('light')}
          className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
            theme === 'light'
              ? 'bg-slate-900 border-emerald-500 ring-2 ring-emerald-500/20 shadow-md'
              : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center gap-5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center shrink-0">
              <Sun className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-slate-100">Light Mode</h4>
                {theme === 'light' && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Active
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Clean, crisp white appearance for daytime use
              </p>
            </div>
          </div>

          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all shrink-0 ${
              theme === 'light'
                ? 'bg-emerald-500 border-emerald-500 text-white scale-105'
                : 'border-slate-700'
            }`}
          >
            {theme === 'light' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
          </div>
        </button>

        {/* Dark Option Card */}
        <button
          type="button"
          onClick={() => setTheme('dark')}
          className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
            theme === 'dark'
              ? 'bg-slate-900 border-emerald-500 ring-2 ring-emerald-500/20 shadow-md'
              : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center gap-5">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center shrink-0">
              <Moon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-slate-100">Dark Mode</h4>
                {theme === 'dark' && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Active
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Deep slate OLED theme, reduced glare and battery saving
              </p>
            </div>
          </div>

          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all shrink-0 ${
              theme === 'dark'
                ? 'bg-emerald-500 border-emerald-500 text-white scale-105'
                : 'border-slate-700'
            }`}
          >
            {theme === 'dark' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
          </div>
        </button>

        {/* System Option Card */}
        <button
          type="button"
          onClick={() => setTheme('system')}
          className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
            theme === 'system'
              ? 'bg-slate-900 border-emerald-500 ring-2 ring-emerald-500/20 shadow-md'
              : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center gap-5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-slate-100">System (Auto)</h4>
                {theme === 'system' && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Active
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Automatically match your device's light or dark mode
              </p>
            </div>
          </div>

          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all shrink-0 ${
              theme === 'system'
                ? 'bg-emerald-500 border-emerald-500 text-white scale-105'
                : 'border-slate-700'
            }`}
          >
            {theme === 'system' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
          </div>
        </button>
      </div>

      {/* ── 4. Live Visual Preview Card ── */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm space-y-2 mt-4">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-emerald-500" /> Live Preview
        </h4>
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between transition-colors">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 font-bold text-xs">
              ₦
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-100">Budgeti Balance</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                Mode: {theme.toUpperCase()} ({resolvedTheme} theme applied)
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
            + ₦250,000
          </span>
        </div>
      </div>
    </div>
  );
}
