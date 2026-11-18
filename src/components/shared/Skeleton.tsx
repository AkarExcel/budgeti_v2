'use client';

import React from 'react';

/**
 * Base shimmering pulse placeholder
 */
export function Skeleton({
  className = '',
}: {
  className?: string;
}) {
  return (
    <div
      className={`animate-pulse bg-slate-800/60 rounded-xl ${className}`}
    />
  );
}

/**
 * Dashboard Skeleton — shown when loading or syncing new data upon coming back online
 */
export function DashboardSkeleton() {
  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Reconnecting banner hint */}
      <div className="flex items-center justify-between px-1 py-1">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-xs font-semibold text-emerald-400">
            Back online · Syncing latest data...
          </span>
        </div>
        <div className="w-16 h-3 bg-slate-800 rounded animate-pulse" />
      </div>

      {/* Balance Overview Hero Card Skeleton */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="w-28 h-3.5 bg-slate-800/80 rounded-md animate-pulse" />
            <div className="w-44 h-8 bg-slate-800 rounded-lg animate-pulse" />
          </div>
          <div className="w-12 h-12 rounded-2xl bg-slate-800/60 animate-pulse" />
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800/80">
          <div className="space-y-1.5 p-3 rounded-xl bg-slate-950/60">
            <div className="w-16 h-3 bg-slate-800/70 rounded animate-pulse" />
            <div className="w-24 h-5 bg-slate-800 rounded animate-pulse" />
          </div>
          <div className="space-y-1.5 p-3 rounded-xl bg-slate-950/60">
            <div className="w-16 h-3 bg-slate-800/70 rounded animate-pulse" />
            <div className="w-24 h-5 bg-slate-800 rounded animate-pulse" />
          </div>
        </div>

        <div className="space-y-2 pt-1">
          <div className="flex justify-between">
            <div className="w-24 h-3 bg-slate-800/70 rounded animate-pulse" />
            <div className="w-12 h-3 bg-slate-800/70 rounded animate-pulse" />
          </div>
          <div className="w-full h-2.5 bg-slate-800/60 rounded-full overflow-hidden" />
        </div>
      </div>

      {/* Recent Transactions Card Skeleton */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="w-36 h-4 bg-slate-800/80 rounded-md animate-pulse" />
          <div className="w-14 h-3 bg-slate-800/60 rounded animate-pulse" />
        </div>

        <div className="divide-y divide-slate-800/70 space-y-2.5 pt-1">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center justify-between pt-2.5">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-slate-800/70 animate-pulse shrink-0" />
                <div className="space-y-1.5">
                  <div className="w-28 h-4 bg-slate-800 rounded animate-pulse" />
                  <div className="w-16 h-3 bg-slate-800/60 rounded animate-pulse" />
                </div>
              </div>
              <div className="space-y-1.5 text-right">
                <div className="w-20 h-4 bg-slate-800 rounded animate-pulse ml-auto" />
                <div className="w-12 h-2.5 bg-slate-800/60 rounded animate-pulse ml-auto" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Budget Widget Skeleton */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-3">
        <div className="flex items-center justify-between">
          <div className="w-32 h-4 bg-slate-800/80 rounded animate-pulse" />
          <div className="w-16 h-3 bg-slate-800/60 rounded animate-pulse" />
        </div>
        <div className="space-y-2 pt-1">
          <div className="w-full h-3 bg-slate-800/60 rounded-full animate-pulse" />
          <div className="flex justify-between">
            <div className="w-20 h-3 bg-slate-800/60 rounded animate-pulse" />
            <div className="w-20 h-3 bg-slate-800/60 rounded animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Transactions Page Skeleton
 */
export function TransactionListSkeleton() {
  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      <div className="flex items-center justify-between px-1 py-1">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-xs font-semibold text-emerald-400">
            Updating transactions...
          </span>
        </div>
      </div>

      {/* Month selector bar */}
      <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex justify-between items-center">
        <div className="w-8 h-8 rounded-lg bg-slate-800 animate-pulse" />
        <div className="w-32 h-4 bg-slate-800 rounded animate-pulse" />
        <div className="w-8 h-8 rounded-lg bg-slate-800 animate-pulse" />
      </div>

      {/* Transaction rows */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 shadow-md overflow-hidden divide-y divide-slate-800/80">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-slate-800/70 animate-pulse shrink-0" />
              <div className="space-y-1.5">
                <div className="w-32 h-4 bg-slate-800 rounded animate-pulse" />
                <div className="w-20 h-3 bg-slate-800/60 rounded animate-pulse" />
              </div>
            </div>
            <div className="space-y-1.5 text-right">
              <div className="w-20 h-4 bg-slate-800 rounded animate-pulse ml-auto" />
              <div className="w-14 h-3 bg-slate-800/60 rounded animate-pulse ml-auto" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Budget Page Skeleton
 */
export function BudgetSkeleton() {
  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      <div className="flex items-center gap-2 px-1">
        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
        <span className="text-xs font-semibold text-emerald-400">
          Updating budgets...
        </span>
      </div>

      {/* Hero Overview */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="w-28 h-3.5 bg-slate-800 rounded animate-pulse" />
        <div className="w-48 h-8 bg-slate-800 rounded animate-pulse" />
        <div className="w-full h-3 bg-slate-800/60 rounded-full animate-pulse" />
      </div>

      {/* Category cards */}
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2.5">
            <div className="flex justify-between items-center">
              <div className="w-32 h-4 bg-slate-800 rounded animate-pulse" />
              <div className="w-16 h-4 bg-slate-800 rounded animate-pulse" />
            </div>
            <div className="w-full h-2.5 bg-slate-800/60 rounded-full animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Goals Page Skeleton
 */
export function GoalsSkeleton() {
  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      <div className="flex items-center gap-2 px-1">
        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
        <span className="text-xs font-semibold text-emerald-400">
          Updating savings goals...
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex justify-between items-start">
              <div className="space-y-1.5">
                <div className="w-32 h-4 bg-slate-800 rounded animate-pulse" />
                <div className="w-20 h-3 bg-slate-800/60 rounded animate-pulse" />
              </div>
              <div className="w-10 h-10 rounded-xl bg-slate-800/70 animate-pulse" />
            </div>
            <div className="w-full h-2.5 bg-slate-800/60 rounded-full animate-pulse" />
            <div className="flex justify-between">
              <div className="w-16 h-3 bg-slate-800/60 rounded animate-pulse" />
              <div className="w-16 h-3 bg-slate-800/60 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Reports Page Skeleton
 */
export function ReportsSkeleton() {
  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      <div className="flex items-center gap-2 px-1">
        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
        <span className="text-xs font-semibold text-emerald-400">
          Generating fresh reports...
        </span>
      </div>

      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="w-36 h-4 bg-slate-800 rounded animate-pulse" />
        <div className="w-full h-44 bg-slate-800/40 rounded-xl animate-pulse" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="w-20 h-3 bg-slate-800/60 rounded animate-pulse" />
          <div className="w-28 h-6 bg-slate-800 rounded animate-pulse" />
        </div>
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="w-20 h-3 bg-slate-800/60 rounded animate-pulse" />
          <div className="w-28 h-6 bg-slate-800 rounded animate-pulse" />
        </div>
      </div>
    </div>
  );
}

/**
 * Settings Page Skeleton
 */
export function SettingsSkeleton() {
  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      <div className="flex items-center gap-2 px-1">
        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
        <span className="text-xs font-semibold text-emerald-400">
          Updating settings...
        </span>
      </div>

      {/* Profile Card Skeleton */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-slate-800 animate-pulse shrink-0" />
        <div className="space-y-2 flex-1">
          <div className="w-36 h-4 bg-slate-800 rounded animate-pulse" />
          <div className="w-48 h-3 bg-slate-800/60 rounded animate-pulse" />
        </div>
      </div>

      {/* Settings Options Group 1 */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden divide-y divide-slate-800/70">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded bg-slate-800 animate-pulse" />
              <div className="w-32 h-3.5 bg-slate-800 rounded animate-pulse" />
            </div>
            <div className="w-4 h-4 rounded bg-slate-800/60 animate-pulse" />
          </div>
        ))}
      </div>

      {/* Settings Options Group 2 */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden divide-y divide-slate-800/70">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded bg-slate-800 animate-pulse" />
              <div className="w-28 h-3.5 bg-slate-800 rounded animate-pulse" />
            </div>
            <div className="w-4 h-4 rounded bg-slate-800/60 animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
