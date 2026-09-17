import { z } from 'zod';

export const TransactionSchema = z.object({
  id: z.string().optional(),
  date: z.string().min(1, 'Date is required'),
  type: z.enum(['income', 'expense']),
  category: z.string().min(1, 'Category is required'),
  description: z.string().min(1, 'Description is required'),
  amount: z
    .number()
    .positive('Amount must be greater than zero'),
  account: z.string().min(1, 'Account is required'),
  payment_method: z.string().optional(),
  notes: z.string().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export type TransactionInput = z.infer<typeof TransactionSchema>;

export const BudgetSchema = z.object({
  id: z.string().optional(),
  month: z.string().regex(/^\d{4}-\d{2}$/, 'Month must be in YYYY-MM format'),
  category: z.string().min(1, 'Category is required'),
  budget_amount: z
    .number()
    .min(0, 'Budget amount cannot be negative'),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export type BudgetInput = z.infer<typeof BudgetSchema>;

export const CategorySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Category name is required'),
  type: z.enum(['income', 'expense', 'both']),
  active: z.boolean().default(true),
  created_at: z.string().optional(),
});

export type CategoryInput = z.infer<typeof CategorySchema>;

export const AccountSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Account name is required'),
  type: z.enum(['bank', 'cash', 'savings', 'wallet', 'other']),
  opening_balance: z.number().default(0),
  active: z.boolean().default(true),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export type AccountInput = z.infer<typeof AccountSchema>;

export const GoalSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Goal name is required'),
  target_amount: z
    .number()
    .positive('Target amount must be greater than 0'),
  current_amount: z
    .number()
    .min(0, 'Current amount cannot be negative'),
  target_date: z.string().min(1, 'Target date is required'),
  status: z.enum(['in_progress', 'completed', 'on_hold']).default('in_progress'),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export type GoalInput = z.infer<typeof GoalSchema>;

export const SettingsSchema = z.object({
  currency: z.string().min(1, 'Currency is required').default('NGN'),
  monthly_income_target: z.number().min(0).default(0),
  monthly_savings_target: z.number().min(0).default(0),
  default_account: z.string().default('GTBank'),
  date_format: z.string().default('YYYY-MM-DD'),
});

export type SettingsInput = z.infer<typeof SettingsSchema>;
