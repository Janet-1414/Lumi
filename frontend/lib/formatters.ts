/**
 * lib/formatters.ts
 *
 * All display-formatting helpers used across Lumi's UI.
 * Pure functions — no side effects, fully testable.
 */

// ─── Currency ─────────────────────────────────────────────────────────────────

/**
 * Format a UGX amount for display.
 * e.g. 2450000 → "UGX 2,450,000"
 */
export function formatUGX(amount: number, compact = false): string {
  if (compact) {
    if (amount >= 1_000_000) return `UGX ${(amount / 1_000_000).toFixed(1)}M`
    if (amount >= 1_000)    return `UGX ${(amount / 1_000).toFixed(0)}K`
  }
  return `UGX ${Math.round(amount).toLocaleString('en-UG')}`
}

/**
 * Format any currency amount.
 * Defaults to UGX if no currency provided.
 */
export function formatCurrency(
  amount: number,
  currency = 'UGX',
  compact = false,
): string {
  if (currency === 'UGX') return formatUGX(amount, compact)
  return new Intl.NumberFormat('en', {
    style: 'currency',
    currency,
    notation: compact ? 'compact' : 'standard',
  }).format(amount)
}

// ─── Percentage ───────────────────────────────────────────────────────────────

export function formatPercent(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`
}

export function formatChange(pct: number): string {
  const sign = pct >= 0 ? '+' : ''
  return `${sign}${pct.toFixed(1)}%`
}

// ─── Dates ────────────────────────────────────────────────────────────────────

export function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString('en-UG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function formatTime(isoDate: string): string {
  return new Date(isoDate).toLocaleTimeString('en-UG', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatRelativeDate(isoDate: string): string {
  const date = new Date(isoDate)
  const now  = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / 86_400_000)

  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7)  return `${days} days ago`
  return formatDate(isoDate)
}

export function groupByDate(
  items: Array<{ date: string }>,
): Record<string, typeof items> {
  return items.reduce<Record<string, typeof items>>((acc, item) => {
    const label = formatRelativeDate(item.date)
    if (!acc[label]) acc[label] = []
    acc[label].push(item)
    return acc
  }, {})
}

// ─── Numbers ──────────────────────────────────────────────────────────────────

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}
