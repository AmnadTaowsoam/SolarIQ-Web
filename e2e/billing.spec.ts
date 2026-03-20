import { test, expect } from '@playwright/test'

test.describe('Billing', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('/login')
    await page.fill('input[type="email"]', 'test@example.com')
    await page.fill('input[type="password"]', 'password123')
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL(/\/dashboard/)
  })

  test('navigate to billing page', async ({ page }) => {
    await page.goto('/billing')

    await expect(page).toHaveURL(/\/billing/)
  })

  test('view available plans', async ({ page }) => {
    await page.goto('/billing')

    // Should display plan names
    await expect(page.locator('text=Starter')).toBeVisible()
    await expect(page.locator('text=Pro')).toBeVisible()
    await expect(page.locator('text=Enterprise')).toBeVisible()

    // Should display prices in THB
    await expect(page.locator('text=/2,900/')).toBeVisible()
    await expect(page.locator('text=/7,900/')).toBeVisible()
    await expect(page.locator('text=/15,000/')).toBeVisible()
  })

  test('view subscription status', async ({ page }) => {
    await page.goto('/billing')

    // Should show subscription section
    await expect(
      page.locator('text=/การสมัครสมาชิก|Subscription|Current Plan/')
    ).toBeVisible()
  })

  test('view invoice history', async ({ page }) => {
    await page.goto('/billing')

    // Should show invoice table headers or empty state
    const hasInvoices = await page.locator('text=เลขที่ใบแจ้งหนี้').isVisible().catch(() => false)
    const hasEmptyState = await page.locator('text=ยังไม่มีใบแจ้งหนี้').isVisible().catch(() => false)

    expect(hasInvoices || hasEmptyState).toBeTruthy()
  })

  test('plan cards show features', async ({ page }) => {
    await page.goto('/billing')

    // Check that plan features are displayed
    await expect(page.locator('text=AI Analysis').first()).toBeVisible()
    await expect(page.locator('text=PDF Proposal').first()).toBeVisible()
  })

  test('billing page shows usage information', async ({ page }) => {
    await page.goto('/billing')

    // Should show some usage-related content
    await expect(
      page.locator('text=/leads|usage|การใช้งาน/i').first()
    ).toBeVisible()
  })
})
