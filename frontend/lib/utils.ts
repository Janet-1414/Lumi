/**
 * lib/utils.ts — shared pure utility functions
 */

/**
 * Combine class names, filtering out falsy values.
 * Usage: cn('foo', condition && 'bar', 'baz')
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}

/**
 * Sleep for a given number of milliseconds.
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Truncate a string to a max length, adding ellipsis.
 */
export function truncate(str: string, max: number): string {
  if (str.length <= max) return str
  return str.slice(0, max - 3) + '…'
}

/**
 * Generate a random anonymous alias like "SavingsLion_KLA"
 */
const ADJECTIVES = ['Savings', 'Budget', 'Smart', 'Frugal', 'Wise', 'Gold', 'Silver', 'Diamond']
const NOUNS      = ['Lion', 'Queen', 'King', 'Eagle', 'Cheetah', 'Phoenix', 'Titan', 'Ace']
const CITIES     = ['KLA', 'LGS', 'NBO', 'ACC', 'ABJ', 'DAR', 'JHB', 'CPT']

export function generateAlias(): string {
  const adj  = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)]
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)]
  const city = CITIES[Math.floor(Math.random() * CITIES.length)]
  return `${adj}${noun}_${city}`
}

/**
 * Debounce a function call.
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number,
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>
  return (...args: Parameters<T>) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}

/**
 * Check if we are running in the browser.
 */
export const isBrowser = typeof window !== 'undefined'

/**
 * Safely parse JSON, returning null on failure.
 */
export function safeParseJSON<T>(str: string): T | null {
  try { return JSON.parse(str) as T }
  catch { return null }
}
