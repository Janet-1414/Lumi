/**
 * __tests__/lib/validators.test.ts
 */

import {
  isValidEmail,
  isStrongPassword,
  passwordsMatch,
  isValidName,
  isCompleteOtp,
  getPasswordStrength,
} from '@/lib/validators'

describe('isValidEmail', () => {
  it('accepts valid email', ()     => expect(isValidEmail('akosua@example.com')).toBe(true))
  it('rejects missing @', ()       => expect(isValidEmail('akosuaexample.com')).toBe(false))
  it('rejects missing domain', ()  => expect(isValidEmail('akosua@')).toBe(false))
  it('rejects empty string', ()    => expect(isValidEmail('')).toBe(false))
  it('accepts subdomain email', () => expect(isValidEmail('a@mail.example.com')).toBe(true))
})

describe('isStrongPassword', () => {
  it('accepts password with all requirements', () =>
    expect(isStrongPassword('Str0ng@Pass!')).toBe(true))

  it('rejects password without uppercase', () =>
    expect(isStrongPassword('str0ng@pass!')).toBe(false))

  it('rejects password without number', () =>
    expect(isStrongPassword('Str@ngPass!')).toBe(false))

  it('rejects password without symbol', () =>
    expect(isStrongPassword('Str0ngPass1')).toBe(false))

  it('rejects short password', () =>
    expect(isStrongPassword('S@1')).toBe(false))
})

describe('passwordsMatch', () => {
  it('returns true for matching passwords', () =>
    expect(passwordsMatch('Pass@1', 'Pass@1')).toBe(true))

  it('returns false for mismatched passwords', () =>
    expect(passwordsMatch('Pass@1', 'Pass@2')).toBe(false))

  it('returns false when second is empty', () =>
    expect(passwordsMatch('Pass@1', '')).toBe(false))
})

describe('isValidName', () => {
  it('accepts 2+ character name', ()  => expect(isValidName('Akosua')).toBe(true))
  it('accepts 2 character name', ()   => expect(isValidName('Jo')).toBe(true))
  it('rejects 1 character name', ()   => expect(isValidName('A')).toBe(false))
  it('rejects empty string', ()       => expect(isValidName('')).toBe(false))
  it('trims whitespace before check', () => expect(isValidName('  A  ')).toBe(false))
})

describe('isCompleteOtp', () => {
  it('accepts 6 digits', () =>
    expect(isCompleteOtp(['1','2','3','4','5','6'])).toBe(true))

  it('rejects fewer than 6 digits', () =>
    expect(isCompleteOtp(['1','2','3','4','5'])).toBe(false))

  it('rejects non-digit entries', () =>
    expect(isCompleteOtp(['1','2','3','4','5','a'])).toBe(false))

  it('rejects empty strings in array', () =>
    expect(isCompleteOtp(['1','2','3','4','5',''])).toBe(false))
})

describe('getPasswordStrength', () => {
  it('returns score 0 for empty string', () => {
    expect(getPasswordStrength('').score).toBe(0)
  })

  it('returns score 1 for password with only length', () => {
    expect(getPasswordStrength('abcdefgh').score).toBe(1)
  })

  it('returns score 4 for strong password', () => {
    expect(getPasswordStrength('Str0ng@Pass!').score).toBe(4)
  })

  it('returns green color for strong password', () => {
    const result = getPasswordStrength('Str0ng@Pass!')
    expect(result.color).toBe('#1D9E75')
  })

  it('returns red color for weak password', () => {
    const result = getPasswordStrength('abcdefgh')
    expect(result.color).toBe('#D85A30')
  })
})
