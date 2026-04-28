/**
 * lib/categories.ts
 *
 * Category display metadata — icons, colors, labels.
 * Single source of truth used by CategoryIcon, DonutChart, FilterPills.
 */

import type { TransactionCategory } from '@/types/dashboard.types'

export interface CategoryMeta {
  label:   string
  emoji:   string
  color:   string      // hex — used in charts and badges
  bgColor: string      // rgba — used for icon backgrounds
}

export const CATEGORY_META: Record<TransactionCategory, CategoryMeta> = {
  food: {
    label:   'Food & Dining',
    emoji:   '🍽️',
    color:   '#FAC775',
    bgColor: 'rgba(250,199,117,0.15)',
  },
  transport: {
    label:   'Transport',
    emoji:   '🚌',
    color:   '#5DCAA5',
    bgColor: 'rgba(93,202,165,0.15)',
  },
  shopping: {
    label:   'Shopping',
    emoji:   '🛍️',
    color:   '#AFA9EC',
    bgColor: 'rgba(175,169,236,0.15)',
  },
  utilities: {
    label:   'Utilities',
    emoji:   '💡',
    color:   '#EF9F27',
    bgColor: 'rgba(239,159,39,0.15)',
  },
  health: {
    label:   'Health',
    emoji:   '❤️',
    color:   '#ED93B1',
    bgColor: 'rgba(237,147,177,0.15)',
  },
  education: {
    label:   'Education',
    emoji:   '📚',
    color:   '#85B7EB',
    bgColor: 'rgba(133,183,235,0.15)',
  },
  savings: {
    label:   'Savings',
    emoji:   '🏦',
    color:   '#1D9E75',
    bgColor: 'rgba(29,158,117,0.15)',
  },
  income: {
    label:   'Income',
    emoji:   '💰',
    color:   '#1D9E75',
    bgColor: 'rgba(29,158,117,0.15)',
  },
  mobile_money: {
    label:   'Mobile Money',
    emoji:   '📱',
    color:   '#FAC775',
    bgColor: 'rgba(250,199,117,0.15)',
  },
  other: {
    label:   'Other',
    emoji:   '📦',
    color:   '#888780',
    bgColor: 'rgba(136,135,128,0.15)',
  },
}

export function getCategoryMeta(category: TransactionCategory): CategoryMeta {
  return CATEGORY_META[category] ?? CATEGORY_META.other
}
