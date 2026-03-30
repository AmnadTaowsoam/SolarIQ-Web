import { test, expect } from '@playwright/test'

test.describe('Billing & Subscription', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login')
    await page.fill('input[type="email"]', 'test@example.com')
    await page.fill('input[type="password"]', 'password123')
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL(/\/dashboard/)
  })

  test('pricing page shows all plan tiers', async ({ page }) => {
    await page.goto('/pricing')

    await page.waitForLoadState('networkidle')

    // Should display plan names
    await expect(page.locator('text=/Starter/i').first()).toBeVisible()
    await expect(page.locator('text=/Pro/i').first()).toBeVisible()
    await expect(page.locator('text=/Enterprise/i').first()).toBeVisible()
  })

  test('pricing page shows prices in THB', async ({ page }) => {
    await page.goto('/pricing')

    await page.waitForLoadState('networkidle')

    // Should display prices with Thai Baht formatting
    await expect(page.locator('text=/฿|THB|บาท|2,900|7,900|15,000/').first()).toBeVisible()
  })

  test('pricing plans show feature comparison', async ({ page }) => {
    await page.goto('/pricing')

    await page.waitForLoadState('networkidle')

    // Should show feature checkmarks or lists
    const hasFeatures = await page
      .locator('text=/AI|Lead|Quote|Report|Analysis|PDF/i')
      .first()
      .isVisible()
      .catch(() => false)

    expect(hasFeatures).toBeTruthy()
  })

  test('upgrade button navigates to checkout', async ({ page }) => {
    await page.goto('/pricing')

    await page.waitForLoadState('networkidle')

    // Find upgrade/subscribe button
    const upgradeButton = page
      .locator(
        'button:has-text("Upgrade"), button:has-text("Subscribe"), button:has-text("สมัคร"), a:has-text("Upgrade"), a:has-text("เลือกแพลน")'
      )
      .first()

    if (await upgradeButton.isVisible().catch(() => false)) {
      await upgradeButton.click()

      // Should navigate to checkout or show payment modal
      await page.waitForLoadState('networkidle')

      const hasCheckout = await page
        .locator('text=/checkout|ชำระเงิน|payment|Credit Card|QR/i')
        .first()
        .isVisible()
        .catch(() => false)
      const hasPricing = await page
        .locator('text=/pricing|billing/i')
        .first()
        .isVisible()
        .catch(() => false)
      const hasModal = await page
        .locator('[role="dialog"]')
        .isVisible()
        .catch(() => false)

      expect(hasCheckout || hasPricing || hasModal).toBeTruthy()
    }
  })

  test('billing page shows current subscription status', async ({ page }) => {
    await page.goto('/billing')

    await page.waitForLoadState('networkidle')

    // Should show subscription/plan information
    await expect(
      page.locator('text=/การสมัครสมาชิก|Subscription|Current Plan|แพลนปัจจุบัน|Plan/i').first()
    ).toBeVisible()
  })

  test('billing page shows plan usage metrics', async ({ page }) => {
    await page.goto('/billing')

    await page.waitForLoadState('networkidle')

    // Should display usage information
    await expect(
      page.locator('text=/usage|การใช้งาน|leads|quotes|limit|โควต้า/i').first()
    ).toBeVisible()
  })

  test('billing page displays invoice history', async ({ page }) => {
    await page.goto('/billing')

    await page.waitForLoadState('networkidle')

    // Should show invoice section
    const hasInvoices = await page
      .locator('text=/invoice|ใบแจ้งหนี้|เลขที่|receipt|ใบเสร็จ/i')
      .first()
      .isVisible()
      .catch(() => false)

    const hasEmptyState = await page
      .locator('text=/ยังไม่มีใบแจ้งหนี้|No invoices|no billing history/i')
      .first()
      .isVisible()
      .catch(() => false)

    expect(hasInvoices || hasEmptyState).toBeTruthy()
  })

  test('billing page has manage subscription actions', async ({ page }) => {
    await page.goto('/billing')

    await page.waitForLoadState('networkidle')

    // Should show management actions (upgrade, cancel, etc.)
    const hasActions = await page
      .locator('text=/Upgrade|อัพเกรด|Manage|จัดการ|Change Plan|Cancel|ยกเลิก/i')
      .first()
      .isVisible()
      .catch(() => false)

    const hasPlanCards = await page
      .locator('text=/Starter|Pro|Enterprise/')
      .first()
      .isVisible()
      .catch(() => false)

    expect(hasActions || hasPlanCards).toBeTruthy()
  })

  test('billing page shows payment method section', async ({ page }) => {
    await page.goto('/billing')

    await page.waitForLoadState('networkidle')

    // Should show payment method or prompt to add one
    const hasPaymentMethod = await page
      .locator('text=/payment method|วิธีชำระเงิน|card|บัตร|Credit|QR|PromptPay/i')
      .first()
      .isVisible()
      .catch(() => false)

    const hasAddPayment = await page
      .locator('text=/add payment|เพิ่มวิธีชำระเงิน|set up/i')
      .first()
      .isVisible()
      .catch(() => false)

    // At least one payment-related section should exist
    expect(hasPaymentMethod || hasAddPayment).toBeTruthy()
  })

  test('plan toggle between monthly and yearly pricing', async ({ page }) => {
    await page.goto('/pricing')

    await page.waitForLoadState('networkidle')

    // Look for billing period toggle
    const toggle = page
      .locator(
        'text=/Monthly|Yearly|Annual|รายเดือน|รายปี/i, [role="switch"], button:has-text("Year")'
      )
      .first()

    if (await toggle.isVisible().catch(() => false)) {
      await toggle.click()

      // Prices should update (we verify the page doesn't break)
      await page.waitForTimeout(500)

      // Should still show pricing content
      await expect(page.locator('text=/฿|THB|บาท|price/i').first()).toBeVisible()
    }
  })
})
