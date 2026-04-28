/**
 * __tests__/hooks/useTransactions.test.ts
 */

import { renderHook, act, waitFor } from '@testing-library/react'
import { useTransactions } from '@/hooks/useTransactions'
import { PLACEHOLDER_TRANSACTIONS } from '@/lib/placeholder-data'

// Mock fetch globally
global.fetch = jest.fn()

describe('useTransactions hook', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok:   true,
      json: async () => ({
        items:    PLACEHOLDER_TRANSACTIONS,
        total:    PLACEHOLDER_TRANSACTIONS.length,
        page:     1,
        per_page: 20,
        has_next: false,
      }),
    })
  })

  it('initialises with placeholder data', async () => {
    const { result } = renderHook(() => useTransactions())
    // Initially shows placeholder data
    expect(result.current.transactions.length).toBeGreaterThan(0)
  })

  it('sets loading to false after fetch completes', async () => {
    const { result } = renderHook(() => useTransactions())
    await waitFor(() => expect(result.current.loading).toBe(false))
  })

  it('filter defaults to all', () => {
    const { result } = renderHook(() => useTransactions())
    expect(result.current.filter).toBe('all')
  })

  it('setFilter updates filter state', async () => {
    const { result } = renderHook(() => useTransactions())
    act(() => result.current.setFilter('income'))
    expect(result.current.filter).toBe('income')
  })

  it('search state defaults to empty string', () => {
    const { result } = renderHook(() => useTransactions())
    expect(result.current.search).toBe('')
  })

  it('setSearch updates search state', () => {
    const { result } = renderHook(() => useTransactions())
    act(() => result.current.setSearch('Rolex'))
    expect(result.current.search).toBe('Rolex')
  })

  it('page defaults to 1', () => {
    const { result } = renderHook(() => useTransactions())
    expect(result.current.page).toBe(1)
  })

  it('falls back to placeholder data when API fails', async () => {
    ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))
    const { result } = renderHook(() => useTransactions())
    await waitFor(() => expect(result.current.loading).toBe(false))
    // Should still have data (placeholder)
    expect(result.current.transactions.length).toBeGreaterThan(0)
    expect(result.current.error).toBeNull()
  })
})
