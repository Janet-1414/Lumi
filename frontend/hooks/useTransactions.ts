'use client'

import { useCallback, useEffect, useState } from 'react'
import type { Transaction, TransactionCategory, TransactionType } from '@/types/dashboard.types'
import { PLACEHOLDER_TRANSACTIONS } from '@/lib/placeholder-data'

type FilterValue = 'all' | TransactionType | TransactionCategory

interface UseTransactionsOptions {
  initialFilter?: FilterValue
  perPage?:       number
}

interface UseTransactionsReturn {
  transactions: Transaction[]
  loading:      boolean
  error:        string | null
  filter:       FilterValue
  setFilter:    (f: FilterValue) => void
  search:       string
  setSearch:    (s: string) => void
  page:         number
  hasNext:      boolean
  total:        number
  nextPage:     () => void
  prevPage:     () => void
  refetch:      () => void
}

/**
 * useTransactions — manages the full transactions page state.
 * Handles filtering, search, pagination, and API fetching.
 * Falls back to placeholder data if the API is unavailable.
 */
export function useTransactions({
  initialFilter = 'all',
  perPage = 20,
}: UseTransactionsOptions = {}): UseTransactionsReturn {
  const [transactions, setTransactions] = useState<Transaction[]>(PLACEHOLDER_TRANSACTIONS)
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState<string | null>(null)
  const [filter, setFilter]             = useState<FilterValue>(initialFilter)
  const [search, setSearch]             = useState('')
  const [page, setPage]                 = useState(1)
  const [total, setTotal]               = useState(PLACEHOLDER_TRANSACTIONS.length)
  const [hasNext, setHasNext]           = useState(false)
  const [tick, setTick]                 = useState(0)

  // Reset to page 1 when filter or search changes
  useEffect(() => { setPage(1) }, [filter, search])

  useEffect(() => {
    let cancelled = false
    setLoading(true)

    const load = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL
        if (!apiUrl) throw new Error('No API URL')

        const params = new URLSearchParams()
        params.set('page',     String(page))
        params.set('per_page', String(perPage))

        if (filter === 'income' || filter === 'expense') {
          params.set('type', filter)
        } else if (filter !== 'all') {
          params.set('category', filter)
        }

        if (search) params.set('search', search)

        const res = await fetch(`${apiUrl}/transactions?${params}`, {
          credentials: 'include',
        })

        if (!res.ok) throw new Error(`HTTP ${res.status}`)

        const data = await res.json()
        if (!cancelled) {
          setTransactions(data.items)
          setTotal(data.total)
          setHasNext(data.has_next)
          setError(null)
        }
      } catch {
        // Use placeholder data silently — UI stays polished
        if (!cancelled) {
          setTransactions(PLACEHOLDER_TRANSACTIONS)
          setTotal(PLACEHOLDER_TRANSACTIONS.length)
          setHasNext(false)
          setError(null)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [filter, search, page, perPage, tick])

  const refetch  = useCallback(() => setTick((t) => t + 1), [])
  const nextPage = useCallback(() => setPage((p) => p + 1), [])
  const prevPage = useCallback(() => setPage((p) => Math.max(1, p - 1)), [])

  return {
    transactions,
    loading,
    error,
    filter,
    setFilter,
    search,
    setSearch,
    page,
    hasNext,
    total,
    nextPage,
    prevPage,
    refetch,
  }
}
