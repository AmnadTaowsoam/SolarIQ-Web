import { test, expect } from '@playwright/test'

test.describe('Privacy', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('/login')
    await page.fill('input[type="email"]', 'test@example.com')
    await page.fill('input[type="password"]', 'password123')
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL(/\/dashboard/)
  })

  test('navigate to privacy page', async ({ page }) => {
    await page.goto('/privacy')

    await expect(page).toHaveURL(/\/privacy/)
  })

  test('view privacy policy content', async ({ page }) => {
    await page.goto('/privacy')

    // Should display privacy-related content
    await expect(
      page.locator('text=/นโยบายความเป็นส่วนตัว|Privacy Policy|PDPA/i').first()
    ).toBeVisible()
  })

  test('manage consent settings', async ({ page }) => {
    await page.goto('/privacy')

    // Should show consent-related sections
    const hasConsentSection = await page
      .locator('text=/ความยินยอม|Consent|ข้อมูลที่จำเป็น/i')
      .first()
      .isVisible()
      .catch(() => false)

    expect(hasConsentSection).toBeTruthy()
  })

  test('consent checkboxes are interactive', async ({ page }) => {
    await page.goto('/privacy')

    // Look for consent checkboxes
    const checkboxes = page.locator('input[type="checkbox"]')
    const count = await checkboxes.count()

    if (count > 0) {
      // Toggle first available checkbox
      const firstCheckbox = checkboxes.first()
      const initialState = await firstCheckbox.isChecked()
      await firstCheckbox.click()
      const newState = await firstCheckbox.isChecked()
      expect(newState).not.toBe(initialState)
    }
  })

  test('privacy page shows data management options', async ({ page }) => {
    await page.goto('/privacy')

    // Should show options for data management (export, deletion)
    await expect(
      page.locator('text=/ข้อมูล|Data|Export|ลบข้อมูล|Deletion/i').first()
    ).toBeVisible()
  })
})
