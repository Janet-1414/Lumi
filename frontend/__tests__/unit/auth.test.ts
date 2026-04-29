/**
 * __tests__/unit/auth.test.ts
 *
 * Unit tests for authentication validation logic.
 * Tests the pure functions in lib/validators.ts and lib/auth.ts
 * that are shared between the frontend UI and form handling.
 */

import {
  isValidEmail,
  isStrongPassword,
  passwordsMatch,
  isValidName,
  isCompleteOtp,
  getPasswordStrength,
} from '@/lib/validators'

import {
  meetsPasswordPolicy,
  setRememberMe,
  getRememberMe,
  clearLocalAuthState,
  setOnboardingComplete,
  isOnboardingComplete,
} from '@/lib/auth'

// ─── Email validation ─────────────────────────────────────────────────────────

describe('isValidEmail', () => {
  it('accepts standard email',       () => expect(isValidEmail('akosua@example.com')).toBe(true))
  it('accepts subdomain email',      () => expect(isValidEmail('a@mail.example.com')).toBe(true))
  it('accepts plus-addressed email', () => expect(isValidEmail('user+tag@example.com')).toBe(true))
  it('rejects missing @',            () => expect(isValidEmail('akosuaexample.com')).toBe(false))
  it('rejects missing TLD',          () => expect(isValidEmail('akosua@example')).toBe(false))
  it('rejects empty string',         () => expect(isValidEmail('')).toBe(false))
  it('rejects spaces',               () => expect(isValidEmail('ako sua@example.com')).toBe(false))
})

// ─── Password strength ────────────────────────────────────────────────────────

describe('isStrongPassword', () => {
  it('accepts password with all requirements', () =>
    expect(isStrongPassword('Str0ng@Pass!')).toBe(true))
  it('rejects no uppercase',   () => expect(isStrongPassword('str0ng@pass!')).toBe(false))
  it('rejects no number',      () => expect(isStrongPassword('Strong@Pass!')).toBe(false))
  it('rejects no symbol',      () => expect(isStrongPassword('Str0ngPass1')).toBe(false))
  it('rejects too short',      () => expect(isStrongPassword('S@1a')).toBe(false))
})

describe('getPasswordStrength', () => {
  it('score 0 for empty',          () => expect(getPasswordStrength('').score).toBe(0))
  it('score 1 for length only',    () => expect(getPasswordStrength('abcdefgh').score).toBe(1))
  it('score 2 for length + case',  () => expect(getPasswordStrength('Abcdefgh').score).toBe(2))
  it('score 3 for + number',       () => expect(getPasswordStrength('Abcdefg1').score).toBe(3))
  it('score 4 for all criteria',   () => expect(getPasswordStrength('Str0ng@Pass!').score).toBe(4))
  it('weak returns red color',     () => expect(getPasswordStrength('abcdefgh').color).toBe('#D85A30'))
  it('strong returns green color', () => expect(getPasswordStrength('Str0ng@Pass!').color).toBe('#1D9E75'))
})

// ─── Password match ───────────────────────────────────────────────────────────

describe('passwordsMatch', () => {
  it('returns true for matching',    () => expect(passwordsMatch('Pass@1', 'Pass@1')).toBe(true))
  it('returns false for mismatch',   () => expect(passwordsMatch('Pass@1', 'Pass@2')).toBe(false))
  it('returns false for empty pair', () => expect(passwordsMatch('Pass@1', '')).toBe(false))
  it('is case sensitive',            () => expect(passwordsMatch('pass@1', 'Pass@1')).toBe(false))
})

// ─── Name validation ──────────────────────────────────────────────────────────

describe('isValidName', () => {
  it('accepts 2+ char name',         () => expect(isValidName('Akosua')).toBe(true))
  it('accepts exactly 2 chars',      () => expect(isValidName('Jo')).toBe(true))
  it('rejects 1 char',               () => expect(isValidName('A')).toBe(false))
  it('rejects empty string',         () => expect(isValidName('')).toBe(false))
  it('trims before checking length', () => expect(isValidName('  A  ')).toBe(false))
})

// ─── OTP validation ───────────────────────────────────────────────────────────

describe('isCompleteOtp', () => {
  it('accepts 6 digits',          () => expect(isCompleteOtp(['1','2','3','4','5','6'])).toBe(true))
  it('rejects fewer than 6',      () => expect(isCompleteOtp(['1','2','3','4','5'])).toBe(false))
  it('rejects empty entry',       () => expect(isCompleteOtp(['1','2','3','4','5',''])).toBe(false))
  it('rejects non-digit entries', () => expect(isCompleteOtp(['1','2','3','4','5','a'])).toBe(false))
})

// ─── Password policy (lib/auth.ts) ───────────────────────────────────────────

describe('meetsPasswordPolicy', () => {
  it('accepts strong password', () => expect(meetsPasswordPolicy('Str0ng@Pass!')).toBe(true))
  it('rejects weak password',   () => expect(meetsPasswordPolicy('password')).toBe(false))
  it('rejects empty string',    () => expect(meetsPasswordPolicy('')).toBe(false))
})

// ─── Remember me (lib/auth.ts) ────────────────────────────────────────────────

describe('rememberMe localStorage helpers', () => {
  beforeEach(() => localStorage.clear())

  it('setRememberMe(true) stores value',   () => { setRememberMe(true);  expect(getRememberMe()).toBe(true)  })
  it('setRememberMe(false) removes value', () => { setRememberMe(false); expect(getRememberMe()).toBe(false) })
  it('clearLocalAuthState removes key',    () => {
    setRememberMe(true)
    clearLocalAuthState()
    expect(getRememberMe()).toBe(false)
  })
})

// ─── Onboarding state (lib/auth.ts) ──────────────────────────────────────────

describe('onboarding state helpers', () => {
  beforeEach(() => localStorage.clear())

  it('isOnboardingComplete returns false by default', () =>
    expect(isOnboardingComplete()).toBe(false))

  it('setOnboardingComplete marks it done', () => {
    setOnboardingComplete()
    expect(isOnboardingComplete()).toBe(true)
  })
})
