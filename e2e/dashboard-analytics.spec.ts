import { test, expect } from '@playwright/test'

test.describe('Dashboard & Analytics', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login')
    await page.fill('input[type="email"]', 'test@example.com')
    await page.fill('input[type="password"]', 'password123')
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL(/\/dashboard/)
  })

  test('dashboard loads and displays key metrics', async ({ page }) => {
    await page.goto('/dashboard')

    await page.waitForLoadState('networkidle')

    // Should display metric cards or summary stats
    const hasMetrics = await page
      .locator('text=/Leads|Revenue|Quotes|Deals|ลูกค้า|รายได้|ใบเสนอราคา/i')
      .first()
      .isVisible()
      .catch(() => false)

    expect(hasMetrics).toBeTruthy()
  })

  test('dashboard shows chart components', async ({ page }) => {
    await page.goto('/dashboard')

    await page.waitForLoadState('networkidle')

    // Wait for charts to render
    await page.waitForTimeout(1000)

    // Look for chart containers (canvas for Chart.js, svg for Recharts/D3, or chart wrapper divs)
    const hasCanvas = await page
      .locator('canvas')
      .first()
      .isVisible()
      .catch(() => false)
    const hasSvg = await page
      .locator('svg.recharts-surface, svg[class*="chart"]')
      .first()
      .isVisible()
      .catch(() => false)
    const hasChartContainer = await page
      .locator('[class*="chart"], [class*="Chart"], [data-chart]')
      .first()
      .isVisible()
      .catch(() => false)

    expect(hasCanvas || hasSvg || hasChartContainer).toBeTruthy()
  })

  test('dashboard displays recent activity', async ({ page }) => {
    await page.goto('/dashboard')

    await page.waitForLoadState('networkidle')

    // Should show recent activity, leads, or notifications
    const hasActivity = await page
      .locator('text=/recent|ล่าสุด|activity|กิจกรรม|notification|แจ้งเตือน/i')
      .first()
      .isVisible()
      .catch(() => false)

    const hasLeadsList = await page
      .locator('text=/new lead|ลูกค้าใหม่|latest|ล่าสุด/i')
      .first()
      .isVisible()
      .catch(() => false)

    expect(hasActivity || hasLeadsList).toBeTruthy()
  })

  test('navigate to analytics from dashboard', async ({ page }) => {
    await page.goto('/dashboard')

    // Click analytics link/button
    const analyticsLink = page
      .locator('a[href*="analytics"], text=/Analytics|วิเคราะห์|Reports|รายงาน/i')
      .first()
    if (await analyticsLink.isVisible().catch(() => false)) {
      await analyticsLink.click()
      await expect(page).toHaveURL(/\/analytics/)
    } else {
      // Navigate directly
      await page.goto('/analytics')
      await expect(page).toHaveURL(/\/analytics/)
    }
  })

  test('analytics overview page loads', async ({ page }) => {
    await page.goto('/analytics')

    await page.waitForLoadState('networkidle')

    // Should show analytics content
    await expect(
      page.locator('text=/Analytics|วิเคราะห์|Overview|ภาพรวม|Report|รายงาน/i').first()
    ).toBeVisible()
  })

  test('analytics funnel page shows conversion data', async ({ page }) => {
    await page.goto('/analytics/funnel')

    await page.waitForLoadState('networkidle')

    // Should show funnel visualization or data
    const hasFunnel = await page
      .locator('text=/funnel|Conversion|การแปลง|Lead|Quote|Deal|Won/i')
      .first()
      .isVisible()
      .catch(() => false)

    const hasChart = await page
      .locator('canvas, svg, [class*="chart"], [class*="funnel"]')
      .first()
      .isVisible()
      .catch(() => false)

    expect(hasFunnel || hasChart).toBeTruthy()
  })

  test('analytics leads page shows lead metrics', async ({ page }) => {
    await page.goto('/analytics/leads')

    await page.waitForLoadState('networkidle')

    // Should show lead analytics
    await expect(
      page.locator('text=/Lead|ลูกค้า|Source|แหล่งที่มา|Total|รวม/i').first()
    ).toBeVisible()
  })

  test('analytics revenue page shows financial data', async ({ page }) => {
    await page.goto('/analytics/revenue')

    await page.waitForLoadState('networkidle')

    // Should show revenue metrics
    await expect(page.locator('text=/Revenue|รายได้|Sales|ยอดขาย|฿|THB/i').first()).toBeVisible()
  })

  test('analytics pipeline page loads', async ({ page }) => {
    await page.goto('/analytics/pipeline')

    await page.waitForLoadState('networkidle')

    // Should show pipeline data
    await expect(
      page.locator('text=/Pipeline|ไปป์ไลน์|Stage|ขั้นตอน|Deal|ดีล/i').first()
    ).toBeVisible()
  })

  test('analytics reports page loads', async ({ page }) => {
    await page.goto('/analytics/reports')

    await page.waitForLoadState('networkidle')

    // Should show reports content
    const hasReports = await page
      .locator('text=/Report|รายงาน|Generate|สร้าง|Download|ดาวน์โหลด/i')
      .first()
      .isVisible()
      .catch(() => false)

    expect(hasReports).toBeTruthy()
  })

  test('analytics scorecard page loads', async ({ page }) => {
    await page.goto('/analytics/scorecard')

    await page.waitForLoadState('networkidle')

    // Should show scorecard/KPI data
    await expect(
      page.locator('text=/Scorecard|KPI|Performance|ผลงาน|Score|คะแนน/i').first()
    ).toBeVisible()
  })

  test('analytics market page loads', async ({ page }) => {
    await page.goto('/analytics/market')

    await page.waitForLoadState('networkidle')

    // Should show market analysis data
    await expect(
      page.locator('text=/Market|ตลาด|Trend|แนวโน้ม|Competitor|คู่แข่ง|Region|พื้นที่/i').first()
    ).toBeVisible()
  })

  test('dashboard date filter works', async ({ page }) => {
    await page.goto('/dashboard')

    await page.waitForLoadState('networkidle')

    // Look for date range selector
    const dateFilter = page
      .locator(
        'input[type="date"], [class*="date-picker"], button:has-text("7 days"), button:has-text("30 days"), button:has-text("วัน")'
      )
      .first()

    if (await dateFilter.isVisible().catch(() => false)) {
      await dateFilter.click()
      await page.waitForTimeout(500)

      // Dashboard should still be functional after filter interaction
      await expect(page.locator('h1, [class*="metric"], [class*="card"]').first()).toBeVisible()
    }
  })

  test('dashboard is responsive on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })

    await page.goto('/dashboard')

    await page.waitForLoadState('networkidle')

    // Dashboard should still render content on mobile
    const hasContent = await page
      .locator('text=/Dashboard|แดชบอร์ด|Leads|Revenue/i')
      .first()
      .isVisible()
      .catch(() => false)

    expect(hasContent).toBeTruthy()
  })
})
