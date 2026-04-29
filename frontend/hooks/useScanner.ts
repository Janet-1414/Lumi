'use client'

/**
 * hooks/useScanner.ts
 * Manages the SMS scanner state — scan, preview, confirm flow.
 */

import { useCallback, useState } from 'react'
import type { ScanPreview, ScanStep } from '@/types/ai.types'
import type { TransactionCategory, TransactionType } from '@/types/dashboard.types'

interface UseScannerReturn {
  step:       ScanStep
  preview:    ScanPreview | null
  error:      string
  scan:       (text: string) => Promise<void>
  confirm:    (edited?: Partial<ScanPreview>) => Promise<void>
  reset:      () => void
}

export function useScanner(onSaved?: () => void): UseScannerReturn {
  const [step,    setStep]    = useState<ScanStep>('idle')
  const [preview, setPreview] = useState<ScanPreview | null>(null)
  const [error,   setError]   = useState('')

  const scan = useCallback(async (text: string) => {
    if (!text.trim() || text.length < 10) {
      setError('Please paste your SMS message first.')
      return
    }
    setStep('scanning')
    setError('')

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1'
      const res = await fetch(`${apiUrl}/scanner/sms`, {
        method:      'POST',
        credentials: 'include',
        headers:     { 'Content-Type': 'application/json' },
        body:        JSON.stringify({ text }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.detail ?? 'Could not parse this message.')
      }
      const data: ScanPreview = await res.json()
      setPreview(data)
      setStep('preview')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Scanner failed. Please try again.')
      setStep('error')
    }
  }, [])

  const confirm = useCallback(async (edited?: Partial<ScanPreview>) => {
    if (!preview) return
    const merged = { ...preview, ...edited }
    setStep('saving')

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1'
      const res = await fetch(`${apiUrl}/scanner/sms/confirm`, {
        method:      'POST',
        credentials: 'include',
        headers:     { 'Content-Type': 'application/json' },
        body:        JSON.stringify({
          amount:      merged.amount,
          type:        merged.type,
          category:    merged.category,
          description: merged.description,
          date:        merged.date,
          currency:    merged.currency,
        }),
      })
      if (!res.ok) throw new Error('Could not save transaction.')
      setStep('success')
      onSaved?.()
      setTimeout(() => reset(), 2000)
    } catch {
      setError('Failed to save. Please try again.')
      setStep('error')
    }
  }, [preview, onSaved])

  const reset = useCallback(() => {
    setStep('idle')
    setPreview(null)
    setError('')
  }, [])

  return { step, preview, error, scan, confirm, reset }
}
