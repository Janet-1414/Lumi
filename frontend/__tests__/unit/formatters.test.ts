/**
 * __tests__/unit/formatters.test.ts
 *
 * Comprehensive unit tests for all lib/formatters.ts functions.
 */

import {
  formatUGX,
  formatCurrency,
  formatPercent,
  formatChange,
  formatDate,
  formatRelativeDate,
  formatTime,
  groupByDate,
  clamp,
} from '@/lib/formatters'

// ─── formatUGX ───────────────────────────────────────────────────────────────

describe('formatUGX', () => {
  it('formats whole number with commas',  () => expect(formatUGX(2_450_000)).toBe('UGX 2,450,000'))
  it('formats zero',                      () => expect(formatUGX(0)).toBe('UGX 0'))
  it('formats one',                       () => expect(formatUGX(1)).toBe('UGX 1'))
  it('rounds decimals up',               () => expect(formatUGX(1234.6)).toBe('UGX 1,235'))
  it('rounds decimals down',             () => expect(formatUGX(1234.4)).toBe('UGX 1,234'))

  describe('compact mode', () => {
    it('shows M for millions',        () => expect(formatUGX(2_450_000, true)).toBe('UGX 2.5M'))
    it('shows K for thousands',       () => expect(formatUGX(350_000, true)).toBe('UGX 350K'))
    it('shows raw under 1000',        () => expect(formatUGX(999, true)).toBe('UGX 999'))
    it('shows 1.0M for exactly 1M',   () => expect(formatUGX(1_000_000, true)).toBe('UGX 1.0M'))
    it('shows 1K for exactly 1000',   () => expect(formatUGX(1_000, true)).toBe('UGX 1K'))
  })
})

// ─── formatCurrency ───────────────────────────────────────────────────────────

describe('formatCurrency', () => {
  it('defaults to UGX',            () => expect(formatCurrency(100_000)).toContain('UGX'))
  it('shows correct amount',       () => expect(formatCurrency(100_000)).toBe('UGX 100,000'))
  it('handles KES currency',       () => expect(formatCurrency(5_000, 'KES')).toContain('5,000'))
  it('passes compact flag through',() => expect(formatCurrency(1_000_000, 'UGX', true)).toBe('UGX 1.0M'))
})

// ─── formatPercent ────────────────────────────────────────────────────────────

describe('formatPercent', () => {
  it('formats with 1 decimal by default', () => expect(formatPercent(31.1)).toBe('31.1%'))
  it('formats with 0 decimals',           () => expect(formatPercent(31.7, 0)).toBe('32%'))
  it('formats with 2 decimals',           () => expect(formatPercent(31.15, 2)).toBe('31.15%'))
  it('handles 100%',                      () => expect(formatPercent(100)).toBe('100.0%'))
  it('handles 0%',                        () => expect(formatPercent(0)).toBe('0.0%'))
  it('handles decimal input',             () => expect(formatPercent(0.5)).toBe('0.5%'))
})

// ─── formatChange ─────────────────────────────────────────────────────────────

describe('formatChange', () => {
  it('adds + prefix for positive', () => expect(formatChange(8.4)).toBe('+8.4%'))
  it('keeps - for negative',       () => expect(formatChange(-3.1)).toBe('-3.1%'))
  it('handles zero',               () => expect(formatChange(0)).toBe('+0.0%'))
  it('handles large positive',     () => expect(formatChange(100)).toBe('+100.0%'))
})

// ─── formatDate ───────────────────────────────────────────────────────────────

describe('formatDate', () => {
  it('formats a date string',          () => {
    const result = formatDate('2025-01-15')
    expect(result).toContain('Jan')
    expect(result).toContain('2025')
  })
  it('handles null gracefully',        () => expect(formatDate(null)).toBe('No deadline'))
  it('handles undefined gracefully',   () => expect(formatDate(undefined as any)).toBe('No deadline'))
})

// ─── formatRelativeDate ───────────────────────────────────────────────────────

describe('formatRelativeDate', () => {
  const now       = new Date()
  const today     = now.toISOString()
  const yesterday = new Date(now.getTime() - 86_400_000).toISOString()
  const threeDays = new Date(now.getTime() - 3 * 86_400_000).toISOString()
  const oldDate   = new Date(now.getTime() - 10 * 86_400_000).toISOString()

  it('returns "Today" for current date',       () => expect(formatRelativeDate(today)).toBe('Today'))
  it('returns "Yesterday" for yesterday',      () => expect(formatRelativeDate(yesterday)).toBe('Yesterday'))
  it('returns "3 days ago" for 3 days back',   () => expect(formatRelativeDate(threeDays)).toBe('3 days ago'))
  it('returns formatted date for older dates', () => {
    const result = formatRelativeDate(oldDate)
    expect(result).not.toBe('Today')
    expect(result).not.toBe('Yesterday')
  })
})

// ─── formatTime ───────────────────────────────────────────────────────────────

describe('formatTime', () => {
  it('formats a datetime string to time', () => {
    const result = formatTime('2025-01-15T14:30:00Z')
    // Should contain something that looks like a time — varies by locale
    expect(typeof result).toBe('string')
    expect(result.length).toBeGreaterThan(0)
  })
})

// ─── groupByDate ─────────────────────────────────────────────────────────────

describe('groupByDate', () => {
  it('groups items by relative date label', () => {
    const now       = new Date().toISOString()
    const yesterday = new Date(Date.now() - 86_400_000).toISOString()
    const items = [
      { date: now,       id: '1' },
      { date: now,       id: '2' },
      { date: yesterday, id: '3' },
    ]
    const grouped = groupByDate(items)
    expect(grouped['Today']).toHaveLength(2)
    expect(grouped['Yesterday']).toHaveLength(1)
  })

  it('returns empty object for empty array', () => {
    expect(groupByDate([])).toEqual({})
  })
})

// ─── clamp ────────────────────────────────────────────────────────────────────

describe('clamp', () => {
  it('clamps above max',          () => expect(clamp(150, 0, 100)).toBe(100))
  it('clamps below min',          () => expect(clamp(-10, 0, 100)).toBe(0))
  it('passes through within range',() => expect(clamp(50, 0, 100)).toBe(50))
  it('handles equal min max',     () => expect(clamp(5, 5, 5)).toBe(5))
  it('handles exact min',         () => expect(clamp(0, 0, 100)).toBe(0))
  it('handles exact max',         () => expect(clamp(100, 0, 100)).toBe(100))
})
