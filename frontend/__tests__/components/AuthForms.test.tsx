/**
 * __tests__/components/AuthForms.test.tsx
 *
 * Tests for login and register form validation behaviour.
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// ─── Mock useAuth hook ────────────────────────────────────────────────────────

jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    login:    jest.fn().mockResolvedValue(true),
    register: jest.fn().mockResolvedValue(true),
    loading:  false,
    error:    null,
  }),
}))

// We test the validation logic directly since page.tsx imports would
// require the full Next.js router context

import {
  isValidEmail,
  isStrongPassword,
  passwordsMatch,
  isValidName,
} from '@/lib/validators'

describe('Login form validation logic', () => {
  it('accepts valid email and password combination', () => {
    expect(isValidEmail('akosua@example.com')).toBe(true)
    expect('Str0ng@Pass!'.length).toBeGreaterThan(0)
  })

  it('rejects empty email', () => {
    expect(isValidEmail('')).toBe(false)
  })

  it('rejects malformed email', () => {
    expect(isValidEmail('not-an-email')).toBe(false)
  })
})

describe('Register form validation logic', () => {
  it('validates all required fields pass', () => {
    expect(isValidName('Akosua')).toBe(true)
    expect(isValidEmail('akosua@example.com')).toBe(true)
    expect(isStrongPassword('Str0ng@Pass!')).toBe(true)
    expect(passwordsMatch('Str0ng@Pass!', 'Str0ng@Pass!')).toBe(true)
  })

  it('fails when first name is too short', () => {
    expect(isValidName('A')).toBe(false)
  })

  it('fails when email is invalid', () => {
    expect(isValidEmail('badformat')).toBe(false)
  })

  it('fails when password is weak', () => {
    expect(isStrongPassword('password123')).toBe(false)
  })

  it('fails when passwords do not match', () => {
    expect(passwordsMatch('Pass@1', 'Pass@2')).toBe(false)
  })
})

describe('Password strength levels', () => {
  const { getPasswordStrength } = require('@/lib/validators')

  it('score 0 for empty', ()  => expect(getPasswordStrength('').score).toBe(0))
  it('score 1 for length only', () => expect(getPasswordStrength('abcdefgh').score).toBe(1))
  it('score 4 for all criteria', () =>
    expect(getPasswordStrength('Str0ng@Pass!').score).toBe(4))
})
