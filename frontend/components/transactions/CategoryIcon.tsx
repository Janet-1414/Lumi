'use client'

// components/transactions/CategoryIcon.tsx

import { getCategoryMeta } from '@/lib/categories'
import type { TransactionCategory } from '@/types/dashboard.types'

interface CategoryIconProps {
  category: TransactionCategory
  size?:    number
}

export function CategoryIcon({ category, size = 38 }: CategoryIconProps) {
  const meta = getCategoryMeta(category)
  return (
    <div style={{
      width: size, height: size,
      borderRadius: Math.round(size * 0.28),
      background: meta.bgColor,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: Math.round(size * 0.45),
      flexShrink: 0,
    }}>
      {meta.emoji}
    </div>
  )
}
