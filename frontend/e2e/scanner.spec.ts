/**
 * e2e/scanner.spec.ts
 *
 * End-to-end tests for the MTN MoMo SMS Scanner.
 * This is Lumi's most important feature — tests are thorough.
 *
 * Covers:
 *  - Scanner banner renders on transactions page
 *  - Expanding the scanner panel
 *  - Pasting SMS text and triggering scan
 *  - Preview card shows extracted fields
 *  - User can edit fields before confirming
 *  - Confirm saves and refreshes list
 *  - Error handling for unparseable text
 */

import { test, expect, type Page } from '@playwright/test'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const MTN_SMS_RECEIVED =
  'You have received UGX 350,000 from ANDELA KENYA LTD on 15/01/2025. ' +
  'Your new balance is UGX 2,450,000. Transaction ID: TXN123456789.'

const MTN_SMS_SENT =
  'MTN MoMo: You sent UGX 30,000 to NAKATO SARAH (0772123456) on 15/01/2025. ' +
  'Fee: UGX 500. Balance: UGX 2,419,500.'

/**
 * Log in as a test user before scanner tests.
 * Requires a seeded test user in the test database.
 */
async function loginAsTestUser(page: Page) {
  await page.goto('/auth/login')
  await page.fill('input[type="email"]',    'e2e-test@lumifi.app')
  await page.fill('input[type="password"]', 'TestPass@123')
  await page.click('button[type="submit"]')
  await page.waitForURL('/dashboard')
}

// ─── Scanner visibility ───────────────────────────────────────────────────────

test.describe('SMS Scanner — UI', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page)
    await page.goto('/transactions')
  })

  test('scanner banner is visible on transactions page', async ({ page }) => {
    await expect(page.locator('text=MTN MoMo SMS Scanner')).toBeVisible()
  })

  test('clicking banner expands the scanner panel', async ({ page }) => {
    await page.click('text=Try it ✨')
    await expect(page.locator('textarea[aria-label="SMS text input"]')).toBeVisible()
  })

  test('example pills fill the textarea', async ({ page }) => {
    await page.click('text=Try it ✨')
    await page.click('text=Example 1')
    const textarea = page.locator('textarea[aria-label="SMS text input"]')
    const value = await textarea.inputValue()
    expect(value.length).toBeGreaterThan(10)
  })

  test('close button collapses the panel', async ({ page }) => {
    await page.click('text=Try it ✨')
    await page.click('button[aria-label="Close"]')
    await expect(page.locator('textarea')).not.toBeVisible()
  })
})

// ─── Scanner scan flow ────────────────────────────────────────────────────────

test.describe('SMS Scanner — Scan flow', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page)
    await page.goto('/transactions')
    await page.click('text=Try it ✨')
  })

  test('scan button shows loading state while AI processes', async ({ page }) => {
    await page.fill('textarea', MTN_SMS_RECEIVED)
    await page.click('button:has-text("Scan message")')
    // Loading spinner should appear briefly
    await expect(page.locator('text=/thinking|reading/i')).toBeVisible({ timeout: 3000 })
  })

  test('successful scan shows preview card', async ({ page }) => {
    await page.fill('textarea', MTN_SMS_RECEIVED)
    await page.click('button:has-text("Scan message")')

    // Wait for preview to appear (AI call may take a few seconds)
    await expect(page.locator('text=Transaction extracted')).toBeVisible({ timeout: 15_000 })
    await expect(page.locator('text=confidence')).toBeVisible()
  })

  test('preview shows extracted amount', async ({ page }) => {
    await page.fill('textarea', MTN_SMS_RECEIVED)
    await page.click('button:has-text("Scan message")')
    await page.waitForSelector('text=Transaction extracted', { timeout: 15_000 })

    // Amount should be 350,000
    await expect(page.locator('text=/350,000|350000/i')).toBeVisible()
  })

  test('user can edit category in preview', async ({ page }) => {
    await page.fill('textarea', MTN_SMS_RECEIVED)
    await page.click('button:has-text("Scan message")')
    await page.waitForSelector('text=Transaction extracted', { timeout: 15_000 })

    const categorySelect = page.locator('select')
    await categorySelect.selectOption('food')
    await expect(categorySelect).toHaveValue('food')
  })

  test('user can edit description in preview', async ({ page }) => {
    await page.fill('textarea', MTN_SMS_RECEIVED)
    await page.click('button:has-text("Scan message")')
    await page.waitForSelector('text=Transaction extracted', { timeout: 15_000 })

    const descInput = page.locator('input[value]').nth(0)
    await descInput.clear()
    await descInput.fill('Andela salary payment')
    await expect(descInput).toHaveValue('Andela salary payment')
  })

  test('confirm saves transaction and shows success', async ({ page }) => {
    await page.fill('textarea', MTN_SMS_RECEIVED)
    await page.click('button:has-text("Scan message")')
    await page.waitForSelector('text=Transaction extracted', { timeout: 15_000 })

    await page.click('button:has-text("Save transaction")')
    await expect(page.locator('text=Transaction saved')).toBeVisible({ timeout: 10_000 })
  })

  test('rescan button returns to input state', async ({ page }) => {
    await page.fill('textarea', MTN_SMS_RECEIVED)
    await page.click('button:has-text("Scan message")')
    await page.waitForSelector('text=Transaction extracted', { timeout: 15_000 })

    await page.click('button:has-text("← Rescan")')
    await expect(page.locator('textarea')).toBeVisible()
  })
})

// ─── Scanner error handling ───────────────────────────────────────────────────

test.describe('SMS Scanner — Error handling', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page)
    await page.goto('/transactions')
    await page.click('text=Try it ✨')
  })

  test('shows error for empty input', async ({ page }) => {
    await page.click('button:has-text("Scan message")')
    await expect(page.locator('text=/paste your SMS/i')).toBeVisible()
  })

  test('shows error for text that is too short', async ({ page }) => {
    await page.fill('textarea', 'Hi')
    await page.click('button:has-text("Scan message")')
    await expect(page.locator('text=/paste your SMS/i')).toBeVisible()
  })
})
