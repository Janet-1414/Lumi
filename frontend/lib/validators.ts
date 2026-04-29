import type { PasswordStrengthResult } from '@/types/auth.types'

// ─── Email ────────────────────────────────────────────────────────────────────

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
}

// ─── Password Rules ───────────────────────────────────────────────────────────

const PASSWORD_RULES = {
  minLength:    (pw: string) => pw.length >= 8,
  hasUppercase: (pw: string) => /[A-Z]/.test(pw),
  hasNumber:    (pw: string) => /[0-9]/.test(pw),
  hasSymbol:    (pw: string) => /[^A-Za-z0-9]/.test(pw),
}

export function isStrongPassword(pw: string): boolean {
  return Object.values(PASSWORD_RULES).every((rule) => rule(pw))
}

export function getPasswordStrength(pw: string): PasswordStrengthResult {
  const score = Object.values(PASSWORD_RULES).filter((rule) =>
    rule(pw),
  ).length as 0 | 1 | 2 | 3 | 4

  const map: Record<number, { label: string; color: string }> = {
    0: { label: 'Very Weak', color: '#D85A30' },   // ← fixed
    1: { label: 'Weak',      color: '#D85A30' },
    2: { label: 'Fair',      color: '#EF9F27' },
    3: { label: 'Good',      color: '#FAC775' },
    4: { label: 'Strong',    color: '#1D9E75' },
  }

  return { score, ...map[score] }
}

export function passwordsMatch(pw: string, confirm: string): boolean {
  return pw === confirm && pw.length > 0
}

// ─── Phone ───────────────────────────────────────────────────────────────────

export function isValidPhone(phone: string): boolean {
  return /^\+?[\d\s\-()]{7,15}$/.test(phone.trim())
}

// ─── Name ────────────────────────────────────────────────────────────────────

export function isValidName(name: string): boolean {
  return name.trim().length >= 2
}

// ─── OTP ─────────────────────────────────────────────────────────────────────

export function isCompleteOtp(digits: string[]): boolean {
  return digits.length === 6 && digits.every((d) => /^\d$/.test(d))
}

// ─── Amount ───────────────────────────────────────────────────────────────────

export function isValidAmount(n: number): boolean {
  return typeof n === 'number' && isFinite(n) && n > 0
}

// ─── Description ─────────────────────────────────────────────────────────────

export function isValidDescription(s: string): boolean {
  return s.trim().length > 0 && s.length <= 500
}

// ─── Text sanitisation ────────────────────────────────────────────────────────

export function sanitiseText(s: string): string {
  return s
    .replace(/[\u200b\u200c\u200d\ufeff]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}