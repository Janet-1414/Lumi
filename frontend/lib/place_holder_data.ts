/**
 * lib/placeholder-data.ts
 *
 * Realistic African placeholder data for polished UI demo.
 * Used when the backend returns no data or during demo day.
 *
 * All amounts are in UGX. Names are common East/West African names.
 * MTN Mobile Money transactions are included to feel authentic.
 */

import type {
  DashboardStats,
  Transaction,
  CategorySpend,
  AIInsight,
  SavingsGoal,
} from '@/types/dashboard.types'

// ─── Stats ────────────────────────────────────────────────────────────────────

export const PLACEHOLDER_STATS: DashboardStats = {
  total_balance:       2_450_000,
  monthly_income:      1_800_000,
  monthly_expenses:    1_240_000,
  savings_rate:        31.1,
  currency:            'UGX',
  balance_change_pct:  +8.4,
  income_change_pct:   +5.2,
  expense_change_pct:  -3.1,
}

// ─── Recent Transactions ──────────────────────────────────────────────────────

export const PLACEHOLDER_TRANSACTIONS: Transaction[] = [
  {
    id: 't1',
    amount: 12_000,
    type: 'expense',
    category: 'food',
    description: 'Rolex from Wandegeya',
    date: new Date(Date.now() - 2 * 3_600_000).toISOString(),
    source: 'manual',
    currency: 'UGX',
    ai_scanned: false,
    created_at: new Date().toISOString(),
  },
  {
    id: 't2',
    amount: 350_000,
    type: 'income',
    category: 'income',
    description: 'MTN MoMo — Salary from Andela',
    date: new Date(Date.now() - 5 * 3_600_000).toISOString(),
    source: 'sms_scan',
    currency: 'UGX',
    ai_scanned: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 't3',
    amount: 4_500,
    type: 'expense',
    category: 'transport',
    description: 'Boda boda to Ntinda',
    date: new Date(Date.now() - 86_400_000).toISOString(),
    source: 'manual',
    currency: 'UGX',
    ai_scanned: false,
    created_at: new Date().toISOString(),
  },
  {
    id: 't4',
    amount: 89_000,
    type: 'expense',
    category: 'shopping',
    description: 'Game — monthly groceries',
    date: new Date(Date.now() - 86_400_000).toISOString(),
    source: 'receipt_scan',
    currency: 'UGX',
    ai_scanned: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 't5',
    amount: 200_000,
    type: 'expense',
    category: 'savings',
    description: 'MTN MoMo — Transfer to Rent Fund',
    date: new Date(Date.now() - 2 * 86_400_000).toISOString(),
    source: 'sms_scan',
    currency: 'UGX',
    ai_scanned: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 't6',
    amount: 55_000,
    type: 'expense',
    category: 'utilities',
    description: 'Umeme electricity token',
    date: new Date(Date.now() - 3 * 86_400_000).toISOString(),
    source: 'manual',
    currency: 'UGX',
    ai_scanned: false,
    created_at: new Date().toISOString(),
  },
  {
    id: 't7',
    amount: 30_000,
    type: 'expense',
    category: 'mobile_money',
    description: 'MTN MoMo — Sent to Mama',
    date: new Date(Date.now() - 4 * 86_400_000).toISOString(),
    source: 'sms_scan',
    currency: 'UGX',
    ai_scanned: true,
    created_at: new Date().toISOString(),
  },
]

// ─── Spending by category ─────────────────────────────────────────────────────

export const PLACEHOLDER_SPENDING: CategorySpend[] = [
  { category: 'food',         amount: 320_000, percentage: 25.8, color: '#FAC775' },
  { category: 'shopping',     amount: 280_000, percentage: 22.6, color: '#AFA9EC' },
  { category: 'savings',      amount: 200_000, percentage: 16.1, color: '#1D9E75' },
  { category: 'utilities',    amount: 185_000, percentage: 14.9, color: '#EF9F27' },
  { category: 'transport',    amount: 145_000, percentage: 11.7, color: '#5DCAA5' },
  { category: 'mobile_money', amount:  65_000, percentage:  5.2, color: '#85B7EB' },
  { category: 'other',        amount:  45_000, percentage:  3.6, color: '#888780' },
]

// ─── AI Insight ───────────────────────────────────────────────────────────────

export const PLACEHOLDER_INSIGHT: AIInsight = {
  id: 'i1',
  message:
    "You've spent 26% of your budget on food this month — slightly above your usual 20%. Consider cooking at home 2 more days a week to save an extra UGX 48,000.",
  type: 'tip',
  created_at: new Date().toISOString(),
}

// ─── Savings Goals ────────────────────────────────────────────────────────────

export const PLACEHOLDER_GOALS: SavingsGoal[] = [
  {
    id: 'g1',
    name: 'Emergency Fund',
    target_amount: 3_000_000,
    current_amount: 1_840_000,
    deadline: null,
    currency: 'UGX',
    progress_pct: 61.3,
  },
  {
    id: 'g2',
    name: 'Rent Fund',
    target_amount: 800_000,
    current_amount: 600_000,
    deadline: new Date(Date.now() + 15 * 86_400_000).toISOString(),
    currency: 'UGX',
    progress_pct: 75.0,
  },
  {
    id: 'g3',
    name: 'Laptop Upgrade',
    target_amount: 2_500_000,
    current_amount: 450_000,
    deadline: null,
    currency: 'UGX',
    progress_pct: 18.0,
  },
]
