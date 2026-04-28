/**
 * __tests__/lib/formatters.test.ts
 *
 * Unit tests for all formatting helpers.
 * These run fast with no network or browser required.
 */

import {
  formatUGX,
  formatCurrency,
  formatPercent,
  formatChange,
  formatDate,
  formatRelativeDate,
  groupByDate,
  clamp,
} from '@/lib/formatters'

// ─── formatUGX ───────────────────────────────────────────────────────────────

describe('formatUGX', () => {
  it('formats a whole number with commas', () => {
    expect(formatUGX(2450000)).toBe('UGX 2,450,000')
  })

  it('formats zero correctly', () => {
    expect(formatUGX(0)).toBe('UGX 0')
  })

  it('rounds decimals', () => {
    expect(formatUGX(1234.56)).toBe('UGX 1,235')
  })

  it('compact — shows M for millions', () => {
    expect(formatUGX(2450000, true)).toBe('UGX 2.5M')
  })

  it('compact — shows K for thousands', () => {
    expect(formatUGX(350000, true)).toBe('UGX 350K')
  })

  it('compact — shows raw for under 1000', () => {
    expect(formatUGX(999, true)).toBe('UGX 999')
  })
})

// ─── formatCurrency ───────────────────────────────────────────────────────────

describe('formatCurrency', () => {
  it('defaults to UGX', () => {
    expect(formatCurrency(100000)).toBe('UGX 100,000')
  })

  it('handles KES currency', () => {
    const result = formatCurrency(5000, 'KES')
    expect(result).toContain('5,000')
  })

  it('passes compact flag through to formatUGX', () => {
    expect(formatCurrency(1000000, 'UGX', true)).toBe('UGX 1.0M')
  })
})

// ─── formatPercent ────────────────────────────────────────────────────────────

describe('formatPercent', () => {
  it('formats with 1 decimal by default', () => {
    expect(formatPercent(31.1)).toBe('31.1%')
  })

  it('formats with 0 decimals', () => {
    expect(formatPercent(31.7, 0)).toBe('32%')
  })

  it('handles 100%', () => {
    expect(formatPercent(100)).toBe('100.0%')
  })

  it('handles 0%', () => {
    expect(formatPercent(0)).toBe('0.0%')
  })
})

// ─── formatChange ─────────────────────────────────────────────────────────────

describe('formatChange', () => {
  it('adds + prefix for positive change', () => {
    expect(formatChange(8.4)).toBe('+8.4%')
  })

  it('keeps - prefix for negative change', () => {
    expect(formatChange(-3.1)).toBe('-3.1%')
  })

  it('handles zero', () => {
    expect(formatChange(0)).toBe('+0.0%')
  })
})

// ─── formatRelativeDate ───────────────────────────────────────────────────────

describe('formatRelativeDate', () => {
  const today     = new Date().toISOString()
  const yesterday = new Date(Date.now() - 86_400_000).toISOString()
  const threeDays = new Date(Date.now() - 3 * 86_400_000).toISOString()

  it('returns Today for current date', () => {
    expect(formatRelativeDate(today)).toBe('Today')
  })

  it('returns Yesterday for yesterday', () => {
    expect(formatRelativeDate(yesterday)).toBe('Yesterday')
  })

  it('returns X days ago for recent dates', () => {
    expect(formatRelativeDate(threeDays)).toBe('3 days ago')
  })
})

// ─── groupByDate ─────────────────────────────────────────────────────────────

describe('groupByDate', () => {
  it('groups items by relative date label', () => {
    const today     = new Date().toISOString()
    const yesterday = new Date(Date.now() - 86_400_000).toISOString()

    const items = [
      { date: today,     description: 'First' },
      { date: today,     description: 'Second' },
      { date: yesterday, description: 'Third' },
    ]

    const grouped = groupByDate(items)

    expect(grouped['Today']).toHaveLength(2)
    expect(grouped['Yesterday']).toHaveLength(1)
  })
})

// ─── clamp ────────────────────────────────────────────────────────────────────

describe('clamp', () => {
  it('clamps value above max', () => {
    expect(clamp(150, 0, 100)).toBe(100)
  })

  it('clamps value below min', () => {
    expect(clamp(-10, 0, 100)).toBe(0)
  })

  it('passes through value within range', () => {
    expect(clamp(50, 0, 100)).toBe(50)
  })
})
