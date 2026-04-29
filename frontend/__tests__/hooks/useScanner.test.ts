/**
 * __tests__/hooks/useScanner.test.ts
 */

import { renderHook, act, waitFor } from '@testing-library/react'
import { useScanner } from '@/hooks/useScanner'

global.fetch = jest.fn()

describe('useScanner hook', () => {
  beforeEach(() => jest.clearAllMocks())

  it('starts in idle step', () => {
    const { result } = renderHook(() => useScanner())
    expect(result.current.step).toBe('idle')
    expect(result.current.preview).toBeNull()
    expect(result.current.error).toBe('')
  })

  it('shows error when text is too short', async () => {
    const { result } = renderHook(() => useScanner())
    await act(async () => { await result.current.scan('short') })
    expect(result.current.error).toMatch(/paste your SMS/i)
    expect(result.current.step).toBe('idle')
  })

  it('moves to scanning step when valid text provided', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok:   true,
      json: async () => ({
        amount: 350_000, type: 'income', category: 'income',
        description: 'Salary', date: '2025-01-15',
        currency: 'UGX', confidence: 0.97, raw_text: 'You received UGX 350,000',
      }),
    })

    const { result } = renderHook(() => useScanner())
    act(() => { result.current.scan('You have received UGX 350,000 from Andela on 15/01/2025') })
    expect(result.current.step).toBe('scanning')
  })

  it('moves to preview step on successful scan', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok:   true,
      json: async () => ({
        amount: 350_000, type: 'income', category: 'income',
        description: 'Salary', date: '2025-01-15',
        currency: 'UGX', confidence: 0.97, raw_text: 'You received UGX 350,000',
      }),
    })

    const { result } = renderHook(() => useScanner())
    await act(async () => {
      await result.current.scan('You have received UGX 350,000 from Andela on 15/01/2025')
    })

    await waitFor(() => expect(result.current.step).toBe('preview'))
    expect(result.current.preview?.amount).toBe(350_000)
  })

  it('moves to error step on failed scan', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok:   false,
      json: async () => ({ detail: 'Could not parse this message.' }),
    })

    const { result } = renderHook(() => useScanner())
    await act(async () => {
      await result.current.scan('You have received UGX 350,000 from Andela on 15/01/2025')
    })

    await waitFor(() => expect(result.current.step).toBe('error'))
    expect(result.current.error).toBe('Could not parse this message.')
  })

  it('reset returns to idle state', async () => {
    const { result } = renderHook(() => useScanner())
    await act(async () => { result.current.scan('short') })
    act(() => { result.current.reset() })
    expect(result.current.step).toBe('idle')
    expect(result.current.error).toBe('')
  })
})
