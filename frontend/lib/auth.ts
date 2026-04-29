/**
 * lib/auth.ts
 *
 * Frontend auth helpers.
 * JWT is stored in HTTP-only cookies managed by the backend.
 * We never touch the token directly — the browser sends it automatically.
 *
 * These helpers manage non-sensitive auth state only.
 */

import { isBrowser } from '@/lib/utils'

// ── Session preference keys (non-sensitive) ───────────────────────────────────

const REMEMBER_ME_KEY = 'lumi_remember'
const ONBOARDING_KEY  = 'lumi_onboarded'

/**
 * Store the "remember me" preference in localStorage.
 * This is not sensitive — it's just a UI preference.
 */
export function setRememberMe(value: boolean): void {
  if (!isBrowser) return
  if (value) {
    localStorage.setItem(REMEMBER_ME_KEY, '1')
  } else {
    localStorage.removeItem(REMEMBER_ME_KEY)
  }
}

export function getRememberMe(): boolean {
  if (!isBrowser) return false
  return localStorage.getItem(REMEMBER_ME_KEY) === '1'
}

/**
 * Track whether the user has completed onboarding (personality quiz).
 */
export function setOnboardingComplete(): void {
  if (!isBrowser) return
  localStorage.setItem(ONBOARDING_KEY, '1')
}

export function isOnboardingComplete(): boolean {
  if (!isBrowser) return false
  return localStorage.getItem(ONBOARDING_KEY) === '1'
}

/**
 * Clear all local auth state on logout.
 * The HTTP-only cookie is cleared by the backend — we just clean up localStorage.
 */
export function clearLocalAuthState(): void {
  if (!isBrowser) return
  localStorage.removeItem(REMEMBER_ME_KEY)
}

/**
 * Check if a password meets Lumi's requirements.
 * Duplicates backend validation for instant UI feedback.
 */
export function meetsPasswordPolicy(password: string): boolean {
  return (
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[^A-Za-z0-9]/.test(password)
  )
}
