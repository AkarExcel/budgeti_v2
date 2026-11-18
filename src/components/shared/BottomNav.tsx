'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ReceiptText, Plus, PieChart, BarChart3 } from 'lucide-react';

interface BottomNavProps {
  onOpenAddModal: () => void;
}

export function BottomNav({ onOpenAddModal }: BottomNavProps) {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'Home', icon: LayoutDashboard },
    { href: '/transactions', label: 'Transactions', icon: ReceiptText },
    { type: 'button', label: 'Add', icon: Plus, action: onOpenAddModal },
    { href: '/budget', label: 'Budget', icon: PieChart },
    { href: '/reports', label: 'Reports', icon: BarChart3 },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 px-3 py-2 pb-safe max-w-md mx-auto sm:max-w-lg md:max-w-2xl lg:max-w-4xl transition-colors shadow-lg shadow-black/5 dark:shadow-none">
      <div className="flex items-center justify-around">
        {navItems.map((item, idx) => {
          if (item.type === 'button') {
            return (
              <button
                key={idx}
                onClick={item.action}
                className="flex flex-col items-center justify-center -mt-5 group focus:outline-none"
                aria-label="Add Transaction"
              >
                <div className="w-13 h-13 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center shadow-lg shadow-emerald-500/30 border-4 border-slate-50 dark:border-slate-950 group-active:scale-95 group-hover:bg-emerald-400 transition-all">
                  <Plus className="w-7 h-7 stroke-[2.75]" />
                </div>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-1 tracking-tight">
                  {item.label}
                </span>
              </button>
            );
          }

          const Icon = item.icon!;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href!}
              className={`flex flex-col items-center py-1 px-2.5 min-w-[60px] rounded-xl transition-all ${
                isActive
                  ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white font-medium'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[2]'}`} />
              <span className={`text-xs mt-1 tracking-tight ${isActive ? 'font-bold' : 'font-semibold'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
