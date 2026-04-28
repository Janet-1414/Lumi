'use client'
/**
 * hooks/useSavings.ts — Savings goals state management
 */
import { useCallback, useEffect, useState } from 'react'
import { PLACEHOLDER_GOALS } from '@/lib/placeholder-data'

export function useSavings() {
  const [goals,   setGoals]   = useState(PLACEHOLDER_GOALS)
  const [loading, setLoading] = useState(true)
  const [tick,    setTick]    = useState(0)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    const load = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL
        if (!apiUrl) throw new Error('no api')
        const res = await fetch(`${apiUrl}/savings`, { credentials: 'include' })
        if (!res.ok) throw new Error()
        const data = await res.json()
        if (!cancelled) setGoals(data.goals ?? PLACEHOLDER_GOALS)
      } catch {
        if (!cancelled) setGoals(PLACEHOLDER_GOALS)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [tick])

  const refetch = useCallback(() => setTick((t) => t + 1), [])

  const deposit = useCallback(async (goalId: string, amount: number) => {
    setGoals((prev) =>
      prev.map((g) =>
        g.id === goalId
          ? { ...g, current_amount: g.current_amount + amount,
              progress_pct: Math.min((g.current_amount + amount) / g.target_amount * 100, 100) }
          : g,
      ),
    )
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL
      await fetch(`${apiUrl}/savings/${goalId}/deposit`, {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount }),
      })
    } catch { /* optimistic update already applied */ }
  }, [])

  return { goals, loading, refetch, deposit }
}
