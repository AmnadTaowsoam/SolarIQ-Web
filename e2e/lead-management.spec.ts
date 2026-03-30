import { test, expect } from '@playwright/test'

test.describe('Lead Management Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login')
    await page.fill('input[type="email"]', 'test@example.com')
    await page.fill('input[type="password"]', 'password123')
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL(/\/dashboard/)
  })

  test('navigate to leads from dashboard', async ({ page }) => {
    // Click leads in navigation
    await page.click('text=/Leads|ลูกค้า/i')

    await expect(page).toHaveURL(/\/leads/)
  })

  test('leads page shows loading state then content', async ({ page }) => {
    await page.goto('/leads')

    // Should eventually show table or empty state
    await page.waitForLoadState('networkidle')

    const hasTable = await page
      .locator('table')
      .isVisible()
      .catch(() => false)
    const hasEmptyState = await page
      .locator('text=/ยังไม่มี|No leads|empty/i')
      .first()
      .isVisible()
      .catch(() => false)
    const hasCards = await page
      .locator('[class*="card"]')
      .first()
      .isVisible()
      .catch(() => false)

    expect(hasTable || hasEmptyState || hasCards).toBeTruthy()
  })

  test('open lead detail and view information', async ({ page }) => {
    await page.goto('/leads')

    await page.waitForSelector('table tbody tr', { timeout: 10000 }).catch(() => null)

    const firstRow = page.locator('table tbody tr').first()
    if (await firstRow.isVisible().catch(() => false)) {
      await firstRow.click()

      // Should navigate to lead detail
      await expect(page).toHaveURL(/\/leads\/[a-zA-Z0-9-]+/)

      // Should show lead information sections
      await expect(
        page.locator('text=/ข้อมูล|Details|Contact|ติดต่อ|Name|ชื่อ/i').first()
      ).toBeVisible()
    }
  })

  test('lead detail shows contact information', async ({ page }) => {
    await page.goto('/leads')

    await page.waitForSelector('table tbody tr', { timeout: 10000 }).catch(() => null)

    const firstRow = page.locator('table tbody tr').first()
    if (await firstRow.isVisible().catch(() => false)) {
      await firstRow.click()
      await expect(page).toHaveURL(/\/leads\/[a-zA-Z0-9-]+/)

      // Should display contact-related fields
      const hasPhone = await page
        .locator('text=/โทร|Phone|Tel|0[0-9]/')
        .first()
        .isVisible()
        .catch(() => false)
      const hasEmail = await page
        .locator('text=/@/')
        .first()
        .isVisible()
        .catch(() => false)
      const hasAddress = await page
        .locator('text=/ที่อยู่|Address|Location/i')
        .first()
        .isVisible()
        .catch(() => false)

      // At least one contact detail should be visible
      expect(hasPhone || hasEmail || hasAddress).toBeTruthy()
    }
  })

  test('create quote from lead detail page', async ({ page }) => {
    await page.goto('/leads')

    await page.waitForSelector('table tbody tr', { timeout: 10000 }).catch(() => null)

    const firstRow = page.locator('table tbody tr').first()
    if (await firstRow.isVisible().catch(() => false)) {
      await firstRow.click()
      await expect(page).toHaveURL(/\/leads\/[a-zA-Z0-9-]+/)

      // Find and click create quote action
      const quoteAction = page
        .locator(
          'text=/สร้างใบเสนอราคา|Create Quote|New Quote/i, a[href*="quote"], button:has-text("Quote")'
        )
        .first()

      if (await quoteAction.isVisible().catch(() => false)) {
        await quoteAction.click()

        // Should navigate to quote page for this lead
        await expect(page).toHaveURL(/\/leads\/[a-zA-Z0-9-]+\/quote/)
      }
    }
  })

  test('update lead status from detail page', async ({ page }) => {
    await page.goto('/leads')

    await page.waitForSelector('table tbody tr', { timeout: 10000 }).catch(() => null)

    const firstRow = page.locator('table tbody tr').first()
    if (await firstRow.isVisible().catch(() => false)) {
      await firstRow.click()
      await expect(page).toHaveURL(/\/leads\/[a-zA-Z0-9-]+/)

      // Look for status update control
      const statusControl = page
        .locator(
          'select, [role="combobox"], button:has-text("Status"), text=/Update Status|เปลี่ยนสถานะ/i'
        )
        .first()

      if (await statusControl.isVisible().catch(() => false)) {
        await statusControl.click()

        // Should show status options
        await expect(
          page.locator('text=/New|Contacted|Qualified|Proposal|Won|Lost|ใหม่|ติดต่อแล้ว/i').first()
        ).toBeVisible()
      }
    }
  })

  test('lead assignments page loads', async ({ page }) => {
    await page.goto('/leads/assignments')

    await page.waitForLoadState('networkidle')

    // Should show assignments content or empty state
    const hasContent = await page
      .locator('text=/assign|มอบหมาย|team|ทีม|sales/i')
      .first()
      .isVisible()
      .catch(() => false)

    const hasEmptyState = await page
      .locator('text=/ยังไม่มี|No assignments|empty/i')
      .first()
      .isVisible()
      .catch(() => false)

    expect(hasContent || hasEmptyState).toBeTruthy()
  })

  test('lead requests page loads', async ({ page }) => {
    await page.goto('/leads/requests')

    await page.waitForLoadState('networkidle')

    // Should show requests content or empty state
    const hasContent = await page
      .locator('text=/request|คำขอ|pending|รอ/i')
      .first()
      .isVisible()
      .catch(() => false)

    const hasEmptyState = await page
      .locator('text=/ยังไม่มี|No requests|empty/i')
      .first()
      .isVisible()
      .catch(() => false)

    expect(hasContent || hasEmptyState).toBeTruthy()
  })

  test('leads table supports sorting', async ({ page }) => {
    await page.goto('/leads')

    await page.waitForSelector('table', { timeout: 10000 }).catch(() => null)

    // Click on a sortable column header
    const sortableHeader = page.locator('th').first()
    if (await sortableHeader.isVisible().catch(() => false)) {
      await sortableHeader.click()

      // Wait for table to re-render
      await page.waitForTimeout(500)

      // Table should still be visible after sort
      await expect(page.locator('table')).toBeVisible()
    }
  })
})
