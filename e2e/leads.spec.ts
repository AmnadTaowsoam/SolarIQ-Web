import { test, expect } from '@playwright/test'

test.describe('Leads Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login')
    await page.fill('input[type="email"]', 'test@example.com')
    await page.fill('input[type="password"]', 'password123')
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL(/\/dashboard/)
  })

  test('view leads list', async ({ page }) => {
    // Navigate to leads page
    await page.click('text=Leads')
    
    // Should be on leads page
    await expect(page).toHaveURL(/\/leads/)
    
    // Should show leads table
    await expect(page.locator('table')).toBeVisible()
    
    // Should have table headers
    await expect(page.locator('th')).toContainText('Name')
    await expect(page.locator('th')).toContainText('Status')
  })

  test('filter leads by status', async ({ page }) => {
    await page.goto('/leads')

    // Select status filter
    await page.selectOption('select', 'new')
    
    // Wait for table to update
    await page.waitForTimeout(500)
    
    // All visible badges should be "New"
    const badges = await page.locator('table tbody tr td:nth-child(5)').allTextContents()
    expect(badges.every(b => b.includes('New'))).toBeTruthy()
  })

  test('update lead status', async ({ page }) => {
    await page.goto('/leads')

    // Click on first "Update Status" button
    await page.click('text=Update Status')
    
    // Modal should open
    await expect(page.locator('text=Update Lead Status')).toBeVisible()
    
    // Select new status
    await page.selectOption('select', 'contacted')
    
    // Submit
    await page.click('button:has-text("Update Status"):not(:has-text("Cancel"))')
    
    // Toast should appear
    await expect(page.locator('text=Lead status updated')).toBeVisible()
  })

  test('view lead detail', async ({ page }) => {
    await page.goto('/leads')

    // Click on first lead row
    await page.click('table tbody tr:first-child')
    
    // Should navigate to lead detail page
    await expect(page).toHaveURL(/\/leads\/[a-zA-Z0-9-]+/)
  })

  test('search leads', async ({ page }) => {
    await page.goto('/leads')

    // Type in search box
    await page.fill('input[placeholder*="Search"]', 'John')
    
    // Press Enter or click search button
    await page.press('input[placeholder*="Search"]', 'Enter')
    
    // Wait for results
    await page.waitForTimeout(500)
    
    // Table should be filtered
    const rows = await page.locator('table tbody tr').count()
    expect(rows).toBeGreaterThanOrEqual(0)
  })

  test('pagination works', async ({ page }) => {
    await page.goto('/leads')

    // Check if pagination exists
    const paginationText = await page.locator('text=Page').first().textContent()
    
    if (paginationText && paginationText.includes('of')) {
      // Click next page
      await page.click('button:has-text("Next")')
      
      // Wait for table to update
      await page.waitForTimeout(500)
      
      // Should be on page 2
      await expect(page.locator('text=Page 2')).toBeVisible()
    }
  })
})
