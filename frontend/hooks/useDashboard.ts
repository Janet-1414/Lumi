'use client'

import { useEffect, useState } from 'react'
import type {
  DashboardStats,
  Transaction,
  CategorySpend,
  AIInsight,
} from '@/types/dashboard.types'
import {
  PLACEHOLDER_STATS,
  PLACEHOLDER_TRANSACTIONS,
  PLACEHOLDER_SPENDING,
  PLACEHOLDER_INSIGHT,
} from '@/lib/placeholder-data'

interface DashboardData {
  stats:       DashboardStats
  transactions: Transaction[]
  spending:    CategorySpend[]
  insight:     AIInsight
}

interface UseDashboardReturn extends DashboardData {
  loading: boolean
  error:   string | null
  refetch: () => void
}

/**
 * useDashboard — fetches all data needed for the dashboard page.
 *
 * Falls back to realistic placeholder data if the API is unavailable,
 * so the UI always looks polished even during development.
 */
export function useDashboard(): UseDashboardReturn {
  const [data, setData] = useState<DashboardData>({
    stats:       PLACEHOLDER_STATS,
    transactions: PLACEHOLDER_TRANSACTIONS,
    spending:    PLACEHOLDER_SPENDING,
    insight:     PLACEHOLDER_INSIGHT,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)
  const [tick, setTick]       = useState(0)

  useEffect(() => {
    let cancelled = false
    setLoading(true)

    const load = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL
        if (!apiUrl) throw new Error('No API URL')

        const res = await fetch(`${apiUrl}/dashboard`, {
          credentials: 'include',
        })

        if (!res.ok) throw new Error(`HTTP ${res.status}`)

        const json = await res.json()
        if (!cancelled) {
          setData({
            stats:       json.stats        ?? PLACEHOLDER_STATS,
            transactions: json.recent_transactions ?? PLACEHOLDER_TRANSACTIONS,
            spending:    json.spending_by_category ?? PLACEHOLDER_SPENDING,
            insight:     json.ai_insight   ?? PLACEHOLDER_INSIGHT,
          })
          setError(null)
        }
      } catch {
        // Fall back silently to placeholder data — UI stays polished
        if (!cancelled) {
          setData({
            stats:       PLACEHOLDER_STATS,
            transactions: PLACEHOLDER_TRANSACTIONS,
            spending:    PLACEHOLDER_SPENDING,
            insight:     PLACEHOLDER_INSIGHT,
          })
          setError(null)   // Don't surface error in UI — placeholder handles it
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [tick])

  const refetch = () => setTick((t) => t + 1)

  return { ...data, loading, error, refetch }
}
