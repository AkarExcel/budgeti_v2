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
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 px-3 py-2 pb-safe max-w-md mx-auto sm:max-w-lg md:max-w-2xl lg:max-w-4xl">
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
                <div className="w-13 h-13 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center shadow-lg shadow-emerald-500/25 border-4 border-slate-950 group-active:scale-95 transition-transform">
                  <Plus className="w-7 h-7 stroke-[2.5]" />
                </div>
                <span className="text-[11px] font-semibold text-emerald-400 mt-0.5">
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
              className={`flex flex-col items-center py-1 px-2 min-w-[56px] rounded-lg transition-colors ${
                isActive
                  ? 'text-emerald-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.75]'}`} />
              <span className="text-[11px] mt-1">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
