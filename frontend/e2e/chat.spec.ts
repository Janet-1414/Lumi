/**
 * e2e/chat.spec.ts
 *
 * End-to-end tests for the LangGraph AI Chat feature.
 *
 * Covers:
 *  - Chat page loads with empty state and suggested prompts
 *  - User can send a message via button
 *  - User can send a message via Enter key
 *  - Streaming response appears token by token
 *  - Stop button halts streaming mid-response
 *  - Suggested chips fill input and send
 *  - Clear chat resets the conversation
 *  - Multiple turns in conversation work
 */

import { test, expect, type Page } from '@playwright/test'

async function loginAsTestUser(page: Page) {
  await page.goto('/auth/login')
  await page.fill('input[type="email"]',    'e2e-test@lumifi.app')
  await page.fill('input[type="password"]', 'TestPass@123')
  await page.click('button[type="submit"]')
  await page.waitForURL('/dashboard')
}

async function goToChat(page: Page) {
  await loginAsTestUser(page)
  await page.goto('/chat')
}

// ─── Initial state ────────────────────────────────────────────────────────────

test.describe('Chat — Initial state', () => {
  test.beforeEach(goToChat)

  test('shows Lumi avatar and greeting', async ({ page }) => {
    await expect(page.locator('text=Hey Akosua')).toBeVisible()
    await expect(page.locator('[aria-label="Lumi AI"]')).toBeVisible()
  })

  test('shows suggested prompt chips', async ({ page }) => {
    await expect(page.locator('text=/Where did my money go/i')).toBeVisible()
    await expect(page.locator('text=/savings progress/i')).toBeVisible()
    await expect(page.locator('text=/overspending/i')).toBeVisible()
  })

  test('input field is visible and focusable', async ({ page }) => {
    const input = page.locator('textarea[aria-label="Chat message input"]')
    await expect(input).toBeVisible()
    await input.click()
    await expect(input).toBeFocused()
  })

  test('send button is disabled when input is empty', async ({ page }) => {
    const sendBtn = page.locator('button[aria-label="Send message"]')
    await expect(sendBtn).toBeDisabled()
  })

  test('send button enables when input has text', async ({ page }) => {
    await page.fill('textarea', 'Hello Lumi')
    const sendBtn = page.locator('button[aria-label="Send message"]')
    await expect(sendBtn).toBeEnabled()
  })
})

// ─── Sending messages ─────────────────────────────────────────────────────────

test.describe('Chat — Sending messages', () => {
  test.beforeEach(goToChat)

  test('clicking send button submits the message', async ({ page }) => {
    await page.fill('textarea', 'What is my balance?')
    await page.click('button[aria-label="Send message"]')

    // User message appears in chat
    await expect(page.locator('text=What is my balance?')).toBeVisible()
  })

  test('Enter key submits message', async ({ page }) => {
    await page.fill('textarea', 'How am I doing financially?')
    await page.keyboard.press('Enter')
    await expect(page.locator('text=How am I doing financially?')).toBeVisible()
  })

  test('Shift+Enter adds new line without submitting', async ({ page }) => {
    await page.fill('textarea', 'First line')
    await page.keyboard.press('Shift+Enter')
    await page.keyboard.type('Second line')
    // Message should NOT be submitted yet
    await expect(page.locator('.messages-list')).not.toContainText('First line')
  })

  test('input clears after sending', async ({ page }) => {
    await page.fill('textarea', 'Test message')
    await page.keyboard.press('Enter')
    const textarea = page.locator('textarea')
    await expect(textarea).toHaveValue('')
  })

  test('AI response appears after user message', async ({ page }) => {
    await page.fill('textarea', 'Where did my money go this month?')
    await page.keyboard.press('Enter')

    // Wait for assistant response — LangGraph may take a few seconds
    await expect(
      page.locator('.messages-list').locator('[data-role="assistant"]').first(),
    ).toBeVisible({ timeout: 20_000 })
  })
})

// ─── Streaming ────────────────────────────────────────────────────────────────

test.describe('Chat — Streaming', () => {
  test.beforeEach(goToChat)

  test('stop button appears during streaming', async ({ page }) => {
    await page.fill('textarea', 'Tell me about my savings goals in detail')
    await page.keyboard.press('Enter')

    // Stop button should appear while streaming
    await expect(page.locator('button[aria-label="Stop generating"]')).toBeVisible({
      timeout: 5_000,
    })
  })

  test('stop button halts response', async ({ page }) => {
    await page.fill('textarea', 'Give me a very long detailed analysis of my finances')
    await page.keyboard.press('Enter')

    await page.locator('button[aria-label="Stop generating"]').click({ timeout: 5_000 })

    // After stopping, send button should return
    await expect(page.locator('button[aria-label="Send message"]')).toBeVisible({
      timeout: 3_000,
    })
  })
})

// ─── Suggested chips ──────────────────────────────────────────────────────────

test.describe('Chat — Suggested chips', () => {
  test.beforeEach(goToChat)

  test('clicking a chip sends the message', async ({ page }) => {
    const chip = page.locator('button').filter({ hasText: /Where did my money go/i }).first()
    await chip.click()

    await expect(
      page.locator('.messages-list').locator('text=/Where did my money go/i'),
    ).toBeVisible({ timeout: 5_000 })
  })
})

// ─── Clear chat ───────────────────────────────────────────────────────────────

test.describe('Chat — Clear chat', () => {
  test('clear button resets conversation to empty state', async ({ page }) => {
    await goToChat(page)

    // Send a message first
    await page.fill('textarea', 'Hello')
    await page.keyboard.press('Enter')
    await page.waitForSelector('text=Hello')

    // Clear chat
    await page.click('button:has-text("Clear chat")')

    // Back to empty state
    await expect(page.locator('text=Hey Akosua')).toBeVisible()
    await expect(page.locator('text=Hello')).not.toBeVisible()
  })
})

// ─── Multiple turns ───────────────────────────────────────────────────────────

test.describe('Chat — Multi-turn conversation', () => {
  test('handles two consecutive messages correctly', async ({ page }) => {
    await goToChat(page)

    // First message
    await page.fill('textarea', 'What is my balance?')
    await page.keyboard.press('Enter')
    await page.waitForSelector('.messages-list [data-role="assistant"]', { timeout: 20_000 })

    // Second message
    await page.fill('textarea', 'And how does that compare to last month?')
    await page.keyboard.press('Enter')

    // Both user messages should be visible
    await expect(page.locator('text=What is my balance?')).toBeVisible()
    await expect(page.locator('text=compare to last month')).toBeVisible()
  })
})
