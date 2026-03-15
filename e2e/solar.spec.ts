import { test, expect } from '@playwright/test'

test.describe('Solar Analysis', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login')
    await page.fill('input[type="email"]', 'test@example.com')
    await page.fill('input[type="password"]', 'password123')
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL(/\/dashboard/)
  })

  test('analyze location and view report', async ({ page }) => {
    // Navigate to analyze page
    await page.click('text=Solar Analysis')
    
    // Should be on analyze page
    await expect(page).toHaveURL(/\/analyze/)
    
    // Use default location button
    await page.click('text=Use Bangkok')
    
    // Fill in monthly bill
    await page.fill('input[type="number"]', '5000')
    
    // Submit analysis
    await page.click('button:has-text("Analyze")')
    
    // Wait for results
    await page.waitForTimeout(2000)
    
    // Should show solar report
    await expect(page.locator('text=Recommended System')).toBeVisible()
    await expect(page.locator('text=Financial Analysis')).toBeVisible()
  })

  test('validates input before submit', async ({ page }) => {
    await page.goto('/analyze')

    // Try to submit without filling form
    await page.click('button:has-text("Analyze")')
    
    // Should show validation error
    await expect(page.locator('text=/required/i')).toBeVisible()
  })

  test('use current location button', async ({ page }) => {
    await page.goto('/analyze')

    // Click use current location
    await page.click('text=Use My Location')
    
    // Should fill in coordinates (if geolocation works)
    // This may not work in all test environments
  })

  test('handles API error gracefully', async ({ page }) => {
    await page.goto('/analyze')

    // Fill in invalid coordinates
    await page.fill('input[placeholder*="latitude"]', '999')
    await page.fill('input[placeholder*="longitude"]', '999')
    await page.fill('input[type="number"]', '5000')
    
    // Submit
    await page.click('button:has-text("Analyze")')
    
    // Should show error message
    await page.waitForTimeout(2000)
    await expect(page.locator('text=/error|failed/i')).toBeVisible()
  })
})
