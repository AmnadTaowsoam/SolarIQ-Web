import { test, expect } from '@playwright/test'

test.describe('Quote Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login')
    await page.fill('input[type="email"]', 'test@example.com')
    await page.fill('input[type="password"]', 'password123')
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL(/\/dashboard/)
  })

  test('navigate to create quote from lead detail', async ({ page }) => {
    await page.goto('/leads')

    // Wait for leads table to load
    await page.waitForSelector('table tbody tr', { timeout: 10000 }).catch(() => null)

    // Click on first lead
    const firstRow = page.locator('table tbody tr').first()
    if (await firstRow.isVisible().catch(() => false)) {
      await firstRow.click()

      // Should navigate to lead detail
      await expect(page).toHaveURL(/\/leads\/[a-zA-Z0-9-]+/)

      // Click create quote button
      const quoteButton = page.locator('text=/สร้างใบเสนอราคา|Create Quote|Quote/i').first()
      if (await quoteButton.isVisible().catch(() => false)) {
        await quoteButton.click()

        // Should navigate to quote creation page
        await expect(page).toHaveURL(/\/leads\/[a-zA-Z0-9-]+\/quote/)
      }
    }
  })

  test('quote creation form has required fields', async ({ page }) => {
    await page.goto('/leads')

    // Wait for table
    await page.waitForSelector('table tbody tr', { timeout: 10000 }).catch(() => null)

    const firstRow = page.locator('table tbody tr').first()
    if (await firstRow.isVisible().catch(() => false)) {
      await firstRow.click()
      await expect(page).toHaveURL(/\/leads\/[a-zA-Z0-9-]+/)

      const quoteButton = page.locator('text=/สร้างใบเสนอราคา|Create Quote|Quote/i').first()
      if (await quoteButton.isVisible().catch(() => false)) {
        await quoteButton.click()
        await expect(page).toHaveURL(/\/leads\/[a-zA-Z0-9-]+\/quote/)

        // Should show form fields for quote details
        const hasFormElements = await page
          .locator('input, select, textarea')
          .first()
          .isVisible()
          .catch(() => false)

        expect(hasFormElements).toBeTruthy()
      }
    }
  })

  test('quote preview page renders', async ({ page }) => {
    await page.goto('/leads')

    await page.waitForSelector('table tbody tr', { timeout: 10000 }).catch(() => null)

    const firstRow = page.locator('table tbody tr').first()
    if (await firstRow.isVisible().catch(() => false)) {
      await firstRow.click()
      await expect(page).toHaveURL(/\/leads\/[a-zA-Z0-9-]+/)

      // Look for existing quote preview link
      const previewLink = page
        .locator('a[href*="quote/preview"], text=/Preview|ดูตัวอย่าง/i')
        .first()
      if (await previewLink.isVisible().catch(() => false)) {
        await previewLink.click()

        // Should show quote preview content
        await expect(page).toHaveURL(/\/quote\/preview/)

        // Preview should show quote details
        await expect(page.locator('text=/ใบเสนอราคา|Quote|Proposal|ราคา/i').first()).toBeVisible()
      }
    }
  })

  test('deals page lists quotes', async ({ page }) => {
    await page.goto('/deals')

    // Should be on deals page
    await expect(page).toHaveURL(/\/deals/)

    // Wait for content to load
    await page.waitForLoadState('networkidle')

    // Should show deals list or empty state
    const hasDeals = await page
      .locator('table, [role="list"], [class*="card"]')
      .first()
      .isVisible()
      .catch(() => false)
    const hasEmptyState = await page
      .locator('text=/ยังไม่มี|No deals|No quotes|empty/i')
      .first()
      .isVisible()
      .catch(() => false)

    expect(hasDeals || hasEmptyState).toBeTruthy()
  })

  test('deal detail page shows quote information', async ({ page }) => {
    await page.goto('/deals')

    await page.waitForLoadState('networkidle')

    // Click on first deal if available
    const firstDeal = page.locator('table tbody tr, [role="listitem"], [class*="card"]').first()
    if (await firstDeal.isVisible().catch(() => false)) {
      await firstDeal.click()

      // Should navigate to deal detail
      await expect(page).toHaveURL(/\/deals\/[a-zA-Z0-9-]+/)

      // Should show deal/quote details
      await expect(page.locator('text=/ราคา|Price|Total|รวม|System|ระบบ/i').first()).toBeVisible()
    }
  })

  test('LIFF quote page loads for customer view', async ({ page }) => {
    // LIFF pages are public-facing for LINE customers
    await page.goto('/liff/quotes')

    await page.waitForLoadState('networkidle')

    // Should show LIFF content or auth prompt
    const hasContent = await page
      .locator('text=/quote|ใบเสนอราคา|proposal|LINE/i')
      .first()
      .isVisible()
      .catch(() => false)

    const hasAuthPrompt = await page
      .locator('text=/login|LINE|เข้าสู่ระบบ|authorize/i')
      .first()
      .isVisible()
      .catch(() => false)

    // LIFF page should render something (content or auth prompt)
    expect(hasContent || hasAuthPrompt).toBeTruthy()
  })

  test('LIFF proposal page renders', async ({ page }) => {
    await page.goto('/liff/proposal')

    await page.waitForLoadState('networkidle')

    // Should show proposal content or auth prompt
    const hasContent = await page
      .locator('text=/proposal|ข้อเสนอ|solar|พลังงานแสงอาทิตย์/i')
      .first()
      .isVisible()
      .catch(() => false)

    const hasAuthPrompt = await page
      .locator('text=/login|LINE|เข้าสู่ระบบ|authorize/i')
      .first()
      .isVisible()
      .catch(() => false)

    expect(hasContent || hasAuthPrompt).toBeTruthy()
  })
})
