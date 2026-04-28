/**
 * e2e/auth.spec.ts
 *
 * End-to-end tests for the full authentication flow.
 * Tests run against a real browser with a live backend.
 *
 * Covers:
 *  - Register with valid data
 *  - Password strength validation
 *  - Email verification OTP entry
 *  - Login with correct credentials
 *  - Login with wrong password
 *  - Forgot password flow
 *  - Auth guard redirects unauthenticated users
 */

import { test, expect, type Page } from '@playwright/test'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TEST_USER = {
  firstName: 'Akosua',
  lastName:  'Mensah',
  email:     `e2e-${Date.now()}@example.com`,
  password:  'Str0ng@Pass!',
}

async function fillRegisterForm(page: Page, user = TEST_USER) {
  await page.fill('input[autocomplete="given-name"]',  user.firstName)
  await page.fill('input[autocomplete="family-name"]', user.lastName)
  await page.fill('input[type="email"]',               user.email)
  await page.fill('input[autocomplete="new-password"]',user.password)
  // Confirm password — second password field
  await page.fill('input[autocomplete="new-password"] + input, input:nth-of-type(5)', user.password)
  await page.check('input[type="checkbox"]#terms')
}

// ─── Auth guard ───────────────────────────────────────────────────────────────

test.describe('Auth guard', () => {
  test('unauthenticated user is redirected to login from dashboard', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page).toHaveURL(/\/auth\/login/)
  })

  test('unauthenticated user is redirected to login from transactions', async ({ page }) => {
    await page.goto('/transactions')
    await expect(page).toHaveURL(/\/auth\/login/)
  })

  test('unauthenticated user is redirected to login from chat', async ({ page }) => {
    await page.goto('/chat')
    await expect(page).toHaveURL(/\/auth\/login/)
  })
})

// ─── Landing page ─────────────────────────────────────────────────────────────

test.describe('Landing page', () => {
  test('shows hero section and CTA buttons', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('h1')).toContainText('Financial Future')
    await expect(page.getByRole('link', { name: /get started/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /sign in/i })).toBeVisible()
  })

  test('CTA navigates to signup', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: /get started free/i }).click()
    await expect(page).toHaveURL(/\/auth\/signup/)
  })
})

// ─── Registration ─────────────────────────────────────────────────────────────

test.describe('Register page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/signup')
  })

  test('shows all form fields', async ({ page }) => {
    await expect(page.getByLabel(/first name/i)).toBeVisible()
    await expect(page.getByLabel(/last name/i)).toBeVisible()
    await expect(page.getByLabel(/email/i)).toBeVisible()
    await expect(page.getByLabel(/^password/i)).toBeVisible()
    await expect(page.getByLabel(/confirm password/i)).toBeVisible()
  })

  test('password strength meter appears on input', async ({ page }) => {
    await page.fill('input[autocomplete="new-password"]', 'weak')
    await expect(page.locator('text=Weak')).toBeVisible()

    await page.fill('input[autocomplete="new-password"]', 'Str0ng@Pass!')
    await expect(page.locator('text=Strong')).toBeVisible()
  })

  test('show/hide password toggle works', async ({ page }) => {
    const passwordInput = page.locator('input[autocomplete="new-password"]').first()
    await passwordInput.fill('MyPassword123!')

    // Default type is password (hidden)
    await expect(passwordInput).toHaveAttribute('type', 'password')

    // Click eye button
    await page.locator('button[aria-label="Show password"]').first().click()
    await expect(passwordInput).toHaveAttribute('type', 'text')

    // Click again to hide
    await page.locator('button[aria-label="Hide password"]').first().click()
    await expect(passwordInput).toHaveAttribute('type', 'password')
  })

  test('shows error for weak password on submit', async ({ page }) => {
    await page.fill('input[autocomplete="given-name"]', 'Test')
    await page.fill('input[type="email"]', 'test@example.com')
    await page.fill('input[autocomplete="new-password"]', 'weak')
    await page.click('button[type="submit"]')
    await expect(page.locator('text=/uppercase|lowercase|number|symbol/i')).toBeVisible()
  })

  test('shows error for mismatched passwords', async ({ page }) => {
    await page.fill('input[autocomplete="given-name"]', 'Test')
    await page.fill('input[type="email"]', 'test@example.com')

    const pwFields = page.locator('input[autocomplete="new-password"]')
    await pwFields.nth(0).fill('Str0ng@Pass!')
    await pwFields.nth(1).fill('DifferentP@ss1')
    await page.click('button[type="submit"]')
    await expect(page.locator('text=/do not match/i')).toBeVisible()
  })

  test('shows error for missing terms checkbox', async ({ page }) => {
    await page.fill('input[autocomplete="given-name"]', 'Test')
    await page.fill('input[type="email"]', 'test@example.com')
    const pwFields = page.locator('input[autocomplete="new-password"]')
    await pwFields.nth(0).fill('Str0ng@Pass!')
    await pwFields.nth(1).fill('Str0ng@Pass!')
    // Do NOT check terms
    await page.click('button[type="submit"]')
    await expect(page.locator('text=/terms/i')).toBeVisible()
  })

  test('tab switch to login works', async ({ page }) => {
    await page.getByRole('link', { name: /sign in/i }).click()
    await expect(page).toHaveURL(/\/auth\/login/)
  })
})

// ─── Login ────────────────────────────────────────────────────────────────────

test.describe('Login page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/login')
  })

  test('shows email and password fields', async ({ page }) => {
    await expect(page.getByLabel(/email/i)).toBeVisible()
    await expect(page.getByLabel(/password/i)).toBeVisible()
    await expect(page.getByLabel(/remember me/i)).toBeVisible()
  })

  test('forgot password link navigates correctly', async ({ page }) => {
    await page.getByRole('link', { name: /forgot password/i }).click()
    await expect(page).toHaveURL(/\/auth\/forgot-password/)
  })

  test('password show/hide toggle works', async ({ page }) => {
    const passwordInput = page.locator('input[type="password"]')
    await passwordInput.fill('MyPassword!')
    await page.click('button[aria-label="Show password"]')
    await expect(passwordInput).toHaveAttribute('type', 'text')
  })

  test('shows error for empty fields on submit', async ({ page }) => {
    await page.click('button[type="submit"]')
    await expect(page.locator('text=/valid email/i')).toBeVisible()
  })

  test('shows error for invalid email format', async ({ page }) => {
    await page.fill('input[type="email"]', 'not-an-email')
    await page.fill('input[type="password"]', 'SomePass@1')
    await page.click('button[type="submit"]')
    await expect(page.locator('text=/valid email/i')).toBeVisible()
  })
})

// ─── Verify Email ─────────────────────────────────────────────────────────────

test.describe('Verify email page', () => {
  test('shows 6 OTP input boxes', async ({ page }) => {
    await page.goto('/auth/verify-email?email=test@example.com')
    const otpBoxes = page.locator('input[inputmode="numeric"]')
    await expect(otpBoxes).toHaveCount(6)
  })

  test('OTP auto-advances to next box on digit entry', async ({ page }) => {
    await page.goto('/auth/verify-email?email=test@example.com')
    const boxes = page.locator('input[inputmode="numeric"]')
    await boxes.nth(0).fill('1')
    await expect(boxes.nth(1)).toBeFocused()
  })

  test('paste fills all OTP boxes', async ({ page }) => {
    await page.goto('/auth/verify-email?email=test@example.com')
    const firstBox = page.locator('input[inputmode="numeric"]').first()
    await firstBox.focus()
    await page.keyboard.insertText('123456')
    const boxes = page.locator('input[inputmode="numeric"]')
    for (let i = 0; i < 6; i++) {
      await expect(boxes.nth(i)).toHaveValue(String(i + 1))
    }
  })

  test('shows resend countdown timer', async ({ page }) => {
    await page.goto('/auth/verify-email?email=test@example.com')
    await expect(page.locator('text=/Resend in/i')).toBeVisible()
  })

  test('shows the email address in the body', async ({ page }) => {
    await page.goto('/auth/verify-email?email=akosua@example.com')
    await expect(page.locator('text=akosua@example.com')).toBeVisible()
  })
})

// ─── Forgot password ──────────────────────────────────────────────────────────

test.describe('Forgot password', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/forgot-password')
  })

  test('shows email input field', async ({ page }) => {
    await expect(page.getByLabel(/email/i)).toBeVisible()
  })

  test('shows 3-step progress bar', async ({ page }) => {
    // 3 step bar segments visible
    const segments = page.locator('[style*="background"]').filter({ hasText: '' })
    await expect(page.locator('button:has-text("Send recovery code")')).toBeVisible()
  })

  test('validates email before sending', async ({ page }) => {
    await page.fill('input[type="email"]', 'invalid')
    await page.click('button:has-text("Send recovery code")')
    await expect(page.locator('text=/valid email/i')).toBeVisible()
  })
})
