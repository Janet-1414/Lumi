/**
 * __tests__/unit/validators.test.ts
 *
 * Comprehensive unit tests for all lib/validators.ts functions.
 */

import {
  isValidEmail,
  isStrongPassword,
  passwordsMatch,
  isValidName,
  isCompleteOtp,
  getPasswordStrength,
  isValidAmount,
  isValidDescription,
  sanitiseText,
} from '@/lib/validators'

// ─── isValidEmail ─────────────────────────────────────────────────────────────

describe('isValidEmail', () => {
  const valid = [
    'akosua@example.com',
    'a.b+c@mail.example.co.ug',
    'user123@sub.domain.org',
  ]
  const invalid = [
    '', 'not-an-email', '@example.com',
    'akosua@', 'akosua @example.com', 'ak@.com',
  ]

  valid.forEach((email) => {
    it(`accepts: ${email}`, () => expect(isValidEmail(email)).toBe(true))
  })
  invalid.forEach((email) => {
    it(`rejects: "${email}"`, () => expect(isValidEmail(email)).toBe(false))
  })
})

// ─── isStrongPassword ────────────────────────────────────────────────────────

describe('isStrongPassword', () => {
  it('accepts password with all 4 requirements', () =>
    expect(isStrongPassword('Str0ng@Pass!')).toBe(true))
  it('accepts another valid password', () =>
    expect(isStrongPassword('MyP@ssw0rd')).toBe(true))

  it('rejects missing uppercase',  () => expect(isStrongPassword('str0ng@pass!')).toBe(false))
  it('rejects missing number',     () => expect(isStrongPassword('Strong@Pass!')).toBe(false))
  it('rejects missing symbol',     () => expect(isStrongPassword('Str0ngPass1')).toBe(false))
  it('rejects too short (< 8)',    () => expect(isStrongPassword('S@1')).toBe(false))
  it('rejects empty',              () => expect(isStrongPassword('')).toBe(false))
})

// ─── getPasswordStrength ─────────────────────────────────────────────────────

describe('getPasswordStrength', () => {
  it('score 0 — empty password',      () => expect(getPasswordStrength('').score).toBe(0))
  it('score 1 — length only',         () => expect(getPasswordStrength('abcdefgh').score).toBe(1))
  it('score 2 — length + uppercase',  () => expect(getPasswordStrength('Abcdefgh').score).toBe(2))
  it('score 3 — + number',            () => expect(getPasswordStrength('Abcdefg1').score).toBe(3))
  it('score 4 — all criteria',        () => expect(getPasswordStrength('Str0ng@Pass!').score).toBe(4))

  it('label "Very Weak" for score 0', () => expect(getPasswordStrength('').label).toBe('Very Weak'))
  it('label "Strong" for score 4',    () => expect(getPasswordStrength('Str0ng@Pass!').label).toBe('Strong'))

  it('color red for score 0',    () => expect(getPasswordStrength('').color).toBe('#D85A30'))
  it('color green for score 4',  () => expect(getPasswordStrength('Str0ng@Pass!').color).toBe('#1D9E75'))
})

// ─── passwordsMatch ───────────────────────────────────────────────────────────

describe('passwordsMatch', () => {
  it('true when both match',         () => expect(passwordsMatch('Pass@1', 'Pass@1')).toBe(true))
  it('false when different',         () => expect(passwordsMatch('Pass@1', 'Pass@2')).toBe(false))
  it('false when second is empty',   () => expect(passwordsMatch('Pass@1', '')).toBe(false))
  it('false when first is empty',    () => expect(passwordsMatch('', 'Pass@1')).toBe(false))
  it('false when both empty',        () => expect(passwordsMatch('', '')).toBe(false))
  it('is case sensitive',            () => expect(passwordsMatch('Pass@1', 'pass@1')).toBe(false))
})

// ─── isValidName ─────────────────────────────────────────────────────────────

describe('isValidName', () => {
  it('accepts 2-char name',          () => expect(isValidName('Jo')).toBe(true))
  it('accepts long name',            () => expect(isValidName('Oluwafunmilayo')).toBe(true))
  it('rejects 1-char name',          () => expect(isValidName('A')).toBe(false))
  it('rejects empty string',         () => expect(isValidName('')).toBe(false))
  it('trims whitespace before check',() => expect(isValidName('  A  ')).toBe(false))
  it('accepts name with spaces',     () => expect(isValidName('Mary Jane')).toBe(true))
})

// ─── isCompleteOtp ────────────────────────────────────────────────────────────

describe('isCompleteOtp', () => {
  it('accepts exactly 6 digits',      () => expect(isCompleteOtp(['1','2','3','4','5','6'])).toBe(true))
  it('rejects fewer than 6',          () => expect(isCompleteOtp(['1','2','3'])).toBe(false))
  it('rejects more than 6',           () => expect(isCompleteOtp(['1','2','3','4','5','6','7'])).toBe(false))
  it('rejects empty string in array', () => expect(isCompleteOtp(['1','2','3','4','5',''])).toBe(false))
  it('rejects letter in array',       () => expect(isCompleteOtp(['1','2','3','4','5','a'])).toBe(false))
  it('rejects space in array',        () => expect(isCompleteOtp(['1','2','3','4','5',' '])).toBe(false))
})

// ─── isValidAmount ────────────────────────────────────────────────────────────

describe('isValidAmount', () => {
  it('accepts positive number',    () => expect(isValidAmount(10_000)).toBe(true))
  it('accepts large amount',       () => expect(isValidAmount(5_000_000)).toBe(true))
  it('rejects zero',               () => expect(isValidAmount(0)).toBe(false))
  it('rejects negative',           () => expect(isValidAmount(-100)).toBe(false))
  it('rejects NaN',                () => expect(isValidAmount(NaN)).toBe(false))
  it('rejects Infinity',           () => expect(isValidAmount(Infinity)).toBe(false))
})

// ─── isValidDescription ──────────────────────────────────────────────────────

describe('isValidDescription', () => {
  it('accepts normal description',  () => expect(isValidDescription('Rolex from Wandegeya')).toBe(true))
  it('rejects empty string',        () => expect(isValidDescription('')).toBe(false))
  it('rejects whitespace only',     () => expect(isValidDescription('   ')).toBe(false))
  it('rejects too long (>500)',     () => expect(isValidDescription('a'.repeat(501))).toBe(false))
  it('accepts exactly 500 chars',   () => expect(isValidDescription('a'.repeat(500))).toBe(true))
})

// ─── sanitiseText ─────────────────────────────────────────────────────────────

describe('sanitiseText', () => {
  it('trims whitespace',            () => expect(sanitiseText('  Hello  ')).toBe('Hello'))
  it('normalises internal spaces',  () => expect(sanitiseText('Hello   World')).toBe('Hello World'))
  it('handles empty string',        () => expect(sanitiseText('')).toBe(''))
  it('removes zero-width chars',    () => expect(sanitiseText('Hello\u200bWorld')).toBe('HelloWorld'))
})
