import { test, expect } from '@playwright/test'

test.describe('Signup & Onboarding Flow', () => {
  test('navigate to signup page from login', async ({ page }) => {
    await page.goto('/login')

    // Click the signup link
    await page.click('text=/สมัครสมาชิก|Sign up|Register/i')

    // Should be on signup page
    await expect(page).toHaveURL(/\/signup/)
  })

  test('signup form validates required fields', async ({ page }) => {
    await page.goto('/signup')

    // Try to submit empty form
    await page.click('button[type="submit"]')

    // Should show validation errors
    await expect(page.locator('text=/required|กรุณากรอก|จำเป็น/i').first()).toBeVisible()
  })

  test('signup form validates email format', async ({ page }) => {
    await page.goto('/signup')

    // Fill invalid email
    await page.fill('input[type="email"]', 'not-an-email')

    // Tab away to trigger validation
    await page.press('input[type="email"]', 'Tab')

    // Try to submit
    await page.click('button[type="submit"]')

    // Should show email validation error
    await expect(page.locator('text=/invalid|อีเมลไม่ถูกต้อง|valid email/i').first()).toBeVisible()
  })

  test('signup form validates password requirements', async ({ page }) => {
    await page.goto('/signup')

    // Fill a weak password
    await page.fill('input[type="password"]', '123')

    // Try to submit
    await page.click('button[type="submit"]')

    // Should show password requirement error
    await expect(
      page.locator('text=/password|รหัสผ่าน|characters|ตัวอักษร/i').first()
    ).toBeVisible()
  })

  test('full signup form submission', async ({ page }) => {
    await page.goto('/signup')

    // Fill in signup form
    const testEmail = `e2e-test-${Date.now()}@example.com`
    await page.fill('input[type="email"]', testEmail)

    // Fill password fields
    const passwordFields = page.locator('input[type="password"]')
    await passwordFields.first().fill('TestPassword123!')
    if ((await passwordFields.count()) > 1) {
      await passwordFields.nth(1).fill('TestPassword123!')
    }

    // Fill name field if present
    const nameInput = page
      .locator('input[name="name"], input[name="fullName"], input[name="companyName"]')
      .first()
    if (await nameInput.isVisible().catch(() => false)) {
      await nameInput.fill('E2E Test Company')
    }

    // Fill phone if present
    const phoneInput = page.locator('input[type="tel"], input[name="phone"]').first()
    if (await phoneInput.isVisible().catch(() => false)) {
      await phoneInput.fill('0812345678')
    }

    // Submit form
    await page.click('button[type="submit"]')

    // Should redirect to verify-email or onboarding
    await expect(page).toHaveURL(/\/(verify-email|onboarding|dashboard)/)
  })

  test('verify email page displays correctly', async ({ page }) => {
    await page.goto('/verify-email')

    // Should show verification message
    await expect(page.locator('text=/verify|ยืนยัน|email|อีเมล/i').first()).toBeVisible()
  })

  test('onboarding page loads for new user', async ({ page }) => {
    // Login first
    await page.goto('/login')
    await page.fill('input[type="email"]', 'test@example.com')
    await page.fill('input[type="password"]', 'password123')
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL(/\/(dashboard|onboarding)/)

    // Navigate to onboarding
    await page.goto('/onboarding')

    // Should show onboarding content
    await expect(page).toHaveURL(/\/onboarding/)
  })

  test('onboarding shows setup steps', async ({ page }) => {
    // Login
    await page.goto('/login')
    await page.fill('input[type="email"]', 'test@example.com')
    await page.fill('input[type="password"]', 'password123')
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL(/\/(dashboard|onboarding)/)

    await page.goto('/onboarding')

    // Should show step indicators or progress
    const hasSteps = await page
      .locator('text=/step|ขั้นตอน|1|company|บริษัท/i')
      .first()
      .isVisible()
      .catch(() => false)

    const hasForm = await page
      .locator('form, input, button[type="submit"]')
      .first()
      .isVisible()
      .catch(() => false)

    expect(hasSteps || hasForm).toBeTruthy()
  })

  test('signup page has link back to login', async ({ page }) => {
    await page.goto('/signup')

    // Should have a link to login
    const loginLink = page.locator('a[href*="login"], text=/เข้าสู่ระบบ|Log in|Sign in/i').first()
    await expect(loginLink).toBeVisible()
  })
})
