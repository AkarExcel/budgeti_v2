import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency: string = 'NGN'): string {
  const numericAmount = isNaN(amount) || !isFinite(amount) ? 0 : amount;
  
  const symbol = currency === 'NGN' ? '₦' : currency === 'USD' ? '$' : currency === 'EUR' ? '€' : `${currency} `;
  
  const parts = Math.abs(numericAmount).toLocaleString('en-NG', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

  const sign = numericAmount < 0 ? '-' : '';
  return `${sign}${symbol}${parts}`;
}

export function formatPercentage(val: number): string {
  if (isNaN(val) || !isFinite(val)) return '0%';
  return `${Math.round(val)}%`;
}

export function formatDate(dateString: string): string {
  if (!dateString) return '';
  try {
    const [year, month, day] = dateString.split('-');
    if (year && month && day) {
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    }
    return dateString;
  } catch {
    return dateString;
  }
}

export function getMonthYearString(monthStr: string): string {
  // monthStr is YYYY-MM
  if (!monthStr) return '';
  try {
    const [year, month] = monthStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  } catch {
    return monthStr;
  }
}

export function getCurrentMonthStr(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

export function getCurrentDateStr(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
