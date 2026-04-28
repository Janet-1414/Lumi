// ─── Enums ────────────────────────────────────────────────────────────────────

export type TransactionType     = 'income' | 'expense'
export type TransactionSource   = 'manual' | 'sms_scan' | 'receipt_scan'
export type InsightType         = 'tip' | 'warning' | 'celebration' | 'nudge'

export type TransactionCategory =
  | 'food'
  | 'transport'
  | 'shopping'
  | 'utilities'
  | 'health'
  | 'education'
  | 'savings'
  | 'income'
  | 'mobile_money'
  | 'other'

// ─── Core entities ────────────────────────────────────────────────────────────

export interface Transaction {
  id: string
  amount: number
  type: TransactionType
  category: TransactionCategory
  description: string
  date: string                    // ISO date
  source: TransactionSource
  currency: string                // 'UGX'
  ai_scanned: boolean
  created_at: string
}

export interface DashboardStats {
  total_balance: number
  monthly_income: number
  monthly_expenses: number
  savings_rate: number            // 0–100
  currency: string
  balance_change_pct: number      // vs last month
  income_change_pct: number
  expense_change_pct: number
}

export interface CategorySpend {
  category: TransactionCategory
  amount: number
  percentage: number
  color: string
}

export interface AIInsight {
  id: string
  message: string
  type: InsightType
  created_at: string
}

export interface SavingsGoal {
  id: string
  name: string
  target_amount: number
  current_amount: number
  deadline: string | null
  currency: string
  progress_pct: number
}

// ─── API wrappers ─────────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  per_page: number
  has_next: boolean
}

export interface DashboardResponse {
  stats: DashboardStats
  recent_transactions: Transaction[]
  spending_by_category: CategorySpend[]
  ai_insight: AIInsight
}
