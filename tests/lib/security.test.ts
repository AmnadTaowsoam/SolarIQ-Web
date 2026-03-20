/**
 * Security Utilities Tests
 * Tests for input sanitization, file validation, and security helpers
 */

import {
  sanitizeHtml,
  sanitizeInput,
  sanitizeSearchQuery,
  sanitizeAddress,
  sanitizeErrorMessage,
  validateFileUpload,
  validateFileMagicBytes,
  isValidEmail,
  validatePasswordStrength,
  ClientRateLimiter,
  isSecureContext,
  clearAuthData,
  ALLOWED_MIME_TYPES,
  MAX_FILE_SIZES,
} from '@/lib/security'

// Mock window for browser-specific tests
const mockWindow = () => {
  Object.defineProperty(global, 'window', {
    value: {
      isSecureContext: true,
      location: {
        protocol: 'https:',
        hostname: 'localhost',
      },
      localStorage: {
        clear: jest.fn(),
      },
      sessionStorage: {
        clear: jest.fn(),
      },
    },
    writable: true,
  })
}

describe('sanitizeHtml', () => {
  it('should encode HTML entities', () => {
    expect(sanitizeHtml('<script>alert("xss")</script>')).toBe(
      '<script>alert("xss")<&#x2F;script>'
    )
  })

  it('should encode ampersand', () => {
    expect(sanitizeHtml('Tom & Jerry')).toBe('Tom & Jerry')
  })

  it('should encode single quotes', () => {
    expect(sanitizeHtml("it's")).toBe('it&#x27;s')
  })

  it('should handle empty string', () => {
    expect(sanitizeHtml('')).toBe('')
  })

  it('should handle non-string input', () => {
    expect(sanitizeHtml(null as unknown as string)).toBe('')
    expect(sanitizeHtml(undefined as unknown as string)).toBe('')
  })

  it('should encode backticks', () => {
    expect(sanitizeHtml('`code`')).toBe('&#x60;code&#x60;')
  })
})

describe('sanitizeInput', () => {
  it('should remove control characters', () => {
    expect(sanitizeInput('hello\x00world')).toBe('helloworld')
    expect(sanitizeInput('test\x1F')).toBe('test')
  })

  it('should trim whitespace', () => {
    expect(sanitizeInput('  hello world  ')).toBe('hello world')
  })

  it('should limit length to 10000 characters', () => {
    const longString = 'a'.repeat(15000)
    expect(sanitizeInput(longString).length).toBe(10000)
  })

  it('should handle empty string', () => {
    expect(sanitizeInput('')).toBe('')
  })

  it('should handle non-string input', () => {
    expect(sanitizeInput(null as unknown as string)).toBe('')
  })
})

describe('sanitizeSearchQuery', () => {
  it('should escape regex special characters', () => {
    expect(sanitizeSearchQuery('test.*')).toBe('test\\.\\*')
    expect(sanitizeSearchQuery('hello?world')).toBe('hello\\?world')
  })

  it('should limit length to 500 characters', () => {
    const longQuery = 'a'.repeat(600)
    expect(sanitizeSearchQuery(longQuery).length).toBe(500)
  })

  it('should remove control characters', () => {
    expect(sanitizeSearchQuery('search\x00term')).toBe('searchterm')
  })

  it('should trim whitespace', () => {
    expect(sanitizeSearchQuery('  query  ')).toBe('query')
  })
})

describe('sanitizeAddress', () => {
  it('should remove dangerous characters', () => {
    expect(sanitizeAddress('123 Main St <script>')).toBe('123 Main St script')
    expect(sanitizeAddress('Test "address"')).toBe('Test address')
  })

  it('should allow common address characters', () => {
    expect(sanitizeAddress('123 Main St., Apt 4B')).toBe('123 Main St., Apt 4B')
  })

  it('should limit length to 500 characters', () => {
    const longAddress = 'a'.repeat(600)
    expect(sanitizeAddress(longAddress).length).toBe(500)
  })

  it('should remove control characters', () => {
    expect(sanitizeAddress('123\x00Street')).toBe('123Street')
  })
})

describe('sanitizeErrorMessage', () => {
  it('should remove file paths', () => {
    const result = sanitizeErrorMessage('Error at /home/user/project/file.ts')
    expect(result).not.toContain('/home/user')
    expect(result).toContain('[path]')
  })

  it('should remove URLs', () => {
    const result = sanitizeErrorMessage('Failed to fetch https://api.example.com/secret')
    expect(result).not.toContain('https://api.example.com')
    expect(result).toContain('[url]')
  })

  it('should remove email addresses', () => {
    const result = sanitizeErrorMessage('Contact admin@example.com for help')
    expect(result).not.toContain('admin@example.com')
    expect(result).toContain('[email]')
  })

  it('should remove IP addresses', () => {
    const result = sanitizeErrorMessage('Connection to 192.168.1.1 failed')
    expect(result).not.toContain('192.168.1.1')
    expect(result).toContain('[ip]')
  })

  it('should remove stack traces', () => {
    const result = sanitizeErrorMessage('Error: at Object.test (file.js:10:5)')
    expect(result).toContain('[stack]')
  })

  it('should remove long tokens', () => {
    const result = sanitizeErrorMessage('Token: abcdefghijklmnopqrstuvwxyz1234567890ABCDEF')
    expect(result).toContain('[token]')
  })

  it('should return generic message for too short results', () => {
    const result = sanitizeErrorMessage('/a/b')
    expect(result).toBe('An error occurred. Please try again.')
  })

  it('should handle non-string input', () => {
    expect(sanitizeErrorMessage(null as unknown as string)).toBe('An unexpected error occurred')
  })

  it('should limit message length', () => {
    const longMessage = 'Error: ' + 'x'.repeat(1000)
    expect(sanitizeErrorMessage(longMessage).length).toBeLessThanOrEqual(500)
  })
})

describe('validateFileMagicBytes', () => {
  it('should validate JPEG files', async () => {
    // JPEG magic bytes: FF D8 FF
    const jpegBuffer = new Uint8Array([0xff, 0xd8, 0xff, 0x00, 0x00, 0x00, 0x00, 0x00])
    const file = new File([jpegBuffer], 'test.jpg', { type: 'image/jpeg' })
    const result = await validateFileMagicBytes(file, ['image/jpeg'])
    expect(result.valid).toBe(true)
  })

  it('should validate PNG files', async () => {
    // PNG magic bytes: 89 50 4E 47
    const pngBuffer = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x00, 0x00, 0x00, 0x00])
    const file = new File([pngBuffer], 'test.png', { type: 'image/png' })
    const result = await validateFileMagicBytes(file, ['image/png'])
    expect(result.valid).toBe(true)
  })

  it('should reject files with wrong magic bytes', async () => {
    // Not a valid image
    const textBuffer = new Uint8Array([0x48, 0x65, 0x6c, 0x6c, 0x6f, 0x00, 0x00, 0x00]) // "Hello"
    const file = new File([textBuffer], 'test.jpg', { type: 'image/jpeg' })
    const result = await validateFileMagicBytes(file, ['image/jpeg'])
    expect(result.valid).toBe(false)
    expect(result.error).toContain('does not match')
  })
})

describe('validateFileUpload', () => {
  it('should reject files with disallowed MIME types', async () => {
    const file = new File(['content'], 'test.exe', { type: 'application/octet-stream' })
    const result = await validateFileUpload(file, { allowedCategories: ['image'], validateMagicBytes: false })
    expect(result.valid).toBe(false)
    expect(result.error).toContain('not allowed')
  })

  it('should reject files that are too large', async () => {
    const largeContent = 'x'.repeat(15 * 1024 * 1024) // 15MB
    const file = new File([largeContent], 'large.jpg', { type: 'image/jpeg' })
    const result = await validateFileUpload(file, { maxSize: 10 * 1024 * 1024, validateMagicBytes: false })
    expect(result.valid).toBe(false)
    expect(result.error).toContain('exceeds maximum')
  })

  it('should reject empty files', async () => {
    const file = new File([], 'empty.jpg', { type: 'image/jpeg' })
    const result = await validateFileUpload(file, { validateMagicBytes: false })
    expect(result.valid).toBe(false)
    expect(result.error).toContain('empty')
  })

  it('should allow custom MIME types', async () => {
    const file = new File(['content'], 'test.pdf', { type: 'application/pdf' })
    const result = await validateFileUpload(file, {
      allowedMimeTypes: ['application/pdf'],
      validateMagicBytes: false,
    })
    expect(result.valid).toBe(true)
  })
})

describe('isValidEmail', () => {
  it('should validate correct email formats', () => {
    expect(isValidEmail('test@example.com')).toBe(true)
    expect(isValidEmail('user.name@domain.co.uk')).toBe(true)
    expect(isValidEmail('user+tag@example.org')).toBe(true)
  })

  it('should reject invalid email formats', () => {
    expect(isValidEmail('notanemail')).toBe(false)
    expect(isValidEmail('missing@domain')).toBe(false)
    expect(isValidEmail('@nodomain.com')).toBe(false)
    expect(isValidEmail('spaces in@email.com')).toBe(false)
  })

  it('should reject emails longer than 255 characters', () => {
    const longEmail = 'a'.repeat(250) + '@x.com'
    expect(isValidEmail(longEmail)).toBe(false)
  })

  it('should handle non-string input', () => {
    expect(isValidEmail(null as unknown as string)).toBe(false)
    expect(isValidEmail(undefined as unknown as string)).toBe(false)
  })
})

describe('validatePasswordStrength', () => {
  it('should score strong passwords highly', () => {
    const result = validatePasswordStrength('StrongP@ss123')
    expect(result.valid).toBe(true)
    expect(result.score).toBeGreaterThanOrEqual(5)
  })

  it('should reject short passwords', () => {
    const result = validatePasswordStrength('abc')
    expect(result.valid).toBe(false)
    expect(result.feedback).toContainEqual(expect.stringContaining('8 characters'))
  })

  it('should provide feedback for weak passwords', () => {
    const result = validatePasswordStrength('password')
    expect(result.feedback.length).toBeGreaterThan(0)
  })

  it('should penalize common patterns', () => {
    const result = validatePasswordStrength('password123')
    expect(result.feedback).toContainEqual(expect.stringContaining('common patterns'))
  })

  it('should handle non-string input', () => {
    const result = validatePasswordStrength(null as unknown as string)
    expect(result.valid).toBe(false)
    expect(result.feedback).toContain('Password is required')
  })
})

describe('ClientRateLimiter', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('should allow requests under the limit', () => {
    const limiter = new ClientRateLimiter(5, 60000)
    for (let i = 0; i < 4; i++) {
      expect(limiter.isRateLimited()).toBe(false)
    }
  })

  it('should block requests over the limit', () => {
    const limiter = new ClientRateLimiter(3, 60000)
    limiter.isRateLimited() // 1
    limiter.isRateLimited() // 2
    limiter.isRateLimited() // 3
    expect(limiter.isRateLimited()).toBe(true) // 4 - blocked
  })

  it('should reset after window expires', () => {
    const limiter = new ClientRateLimiter(2, 60000)
    limiter.isRateLimited() // 1
    limiter.isRateLimited() // 2
    expect(limiter.isRateLimited()).toBe(true) // blocked

    // Advance time past window
    jest.advanceTimersByTime(61000)
    expect(limiter.isRateLimited()).toBe(false) // allowed again
  })

  it('should track remaining attempts', () => {
    const limiter = new ClientRateLimiter(5, 60000)
    expect(limiter.getRemainingAttempts()).toBe(5)
    limiter.isRateLimited()
    expect(limiter.getRemainingAttempts()).toBe(4)
  })

  it('should reset properly', () => {
    const limiter = new ClientRateLimiter(2, 60000)
    limiter.isRateLimited()
    limiter.isRateLimited()
    limiter.reset()
    expect(limiter.getRemainingAttempts()).toBe(2)
  })
})

describe('isSecureContext', () => {
  it('should return true for secure context', () => {
    mockWindow()
    expect(isSecureContext()).toBe(true)
  })

  it('should return false when window is undefined', () => {
    // @ts-expect-error - Testing without window
    delete global.window
    expect(isSecureContext()).toBe(false)
  })
})

describe('clearAuthData', () => {
  it('should clear localStorage and sessionStorage', () => {
    mockWindow()
    clearAuthData()
    expect(window.localStorage.clear).toHaveBeenCalled()
    expect(window.sessionStorage.clear).toHaveBeenCalled()
  })

  it('should clear auth cookies', () => {
    mockWindow()
    const cookieSpy = jest.spyOn(document, 'cookie', 'set')
    clearAuthData()
    // Cookie clearing is attempted (actual clearing depends on browser)
    expect(cookieSpy).toHaveBeenCalled()
  })
})

describe('Constants', () => {
  it('should have correct MIME type categories', () => {
    expect(ALLOWED_MIME_TYPES.image).toContain('image/jpeg')
    expect(ALLOWED_MIME_TYPES.image).toContain('image/png')
    expect(ALLOWED_MIME_TYPES.document).toContain('application/pdf')
  })

  it('should have reasonable max file sizes', () => {
    expect(MAX_FILE_SIZES.image).toBe(10 * 1024 * 1024) // 10MB
    expect(MAX_FILE_SIZES.document).toBe(25 * 1024 * 1024) // 25MB
  })
})
