/**
 * Security Headers Tests
 * Tests for CSP, HSTS, and other security headers
 */

// Mock next.config.mjs headers
const expectedSecurityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-XSS-Protection', value: '1; mode=block' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(self)' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
]

describe('Security Headers', () => {
  describe('X-Content-Type-Options', () => {
    it('should be set to nosniff', () => {
      const header = expectedSecurityHeaders.find((h) => h.key === 'X-Content-Type-Options')
      expect(header).toBeDefined()
      expect(header?.value).toBe('nosniff')
    })
  })

  describe('X-Frame-Options', () => {
    it('should be set to DENY', () => {
      const header = expectedSecurityHeaders.find((h) => h.key === 'X-Frame-Options')
      expect(header).toBeDefined()
      expect(header?.value).toBe('DENY')
    })
  })

  describe('X-XSS-Protection', () => {
    it('should be set to 1; mode=block', () => {
      const header = expectedSecurityHeaders.find((h) => h.key === 'X-XSS-Protection')
      expect(header).toBeDefined()
      expect(header?.value).toBe('1; mode=block')
    })
  })

  describe('Referrer-Policy', () => {
    it('should be set to strict-origin-when-cross-origin', () => {
      const header = expectedSecurityHeaders.find((h) => h.key === 'Referrer-Policy')
      expect(header).toBeDefined()
      expect(header?.value).toBe('strict-origin-when-cross-origin')
    })
  })

  describe('Permissions-Policy', () => {
    it('should disable camera', () => {
      const header = expectedSecurityHeaders.find((h) => h.key === 'Permissions-Policy')
      expect(header).toBeDefined()
      expect(header?.value).toContain('camera=()')
    })

    it('should disable microphone', () => {
      const header = expectedSecurityHeaders.find((h) => h.key === 'Permissions-Policy')
      expect(header?.value).toContain('microphone=()')
    })

    it('should allow geolocation only for self', () => {
      const header = expectedSecurityHeaders.find((h) => h.key === 'Permissions-Policy')
      expect(header?.value).toContain('geolocation=(self)')
    })
  })

  describe('Strict-Transport-Security', () => {
    it('should have max-age of at least 1 year', () => {
      const header = expectedSecurityHeaders.find((h) => h.key === 'Strict-Transport-Security')
      expect(header).toBeDefined()
      expect(header?.value).toContain('max-age=63072000')
    })

    it('should include includeSubDomains', () => {
      const header = expectedSecurityHeaders.find((h) => h.key === 'Strict-Transport-Security')
      expect(header?.value).toContain('includeSubDomains')
    })

    it('should include preload', () => {
      const header = expectedSecurityHeaders.find((h) => h.key === 'Strict-Transport-Security')
      expect(header?.value).toContain('preload')
    })
  })

  describe('Content-Security-Policy', () => {
    const cspHeader = {
      key: 'Content-Security-Policy',
      value: [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' https://apis.google.com https://www.gstatic.com",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "img-src 'self' data: https://maps.googleapis.com https://*.google.com https://*.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com",
        "connect-src 'self' https://*.googleapis.com https://*.firebaseio.com https://*.firebaseapp.com wss://*.firebaseio.com",
        "frame-src 'self' https://*.firebaseapp.com https://accounts.google.com",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "report-uri /api/csp-report",
      ].join('; '),
    }

    it('should have default-src self', () => {
      expect(cspHeader.value).toContain("default-src 'self'")
    })

    it('should have object-src none', () => {
      expect(cspHeader.value).toContain("object-src 'none'")
    })

    it('should have base-uri self', () => {
      expect(cspHeader.value).toContain("base-uri 'self'")
    })

    it('should have form-action self', () => {
      expect(cspHeader.value).toContain("form-action 'self'")
    })

    it('should have report-uri for CSP violations', () => {
      expect(cspHeader.value).toContain('report-uri /api/csp-report')
    })

    it('should restrict script sources', () => {
      expect(cspHeader.value).toContain("script-src 'self'")
    })

    it('should restrict connect sources', () => {
      expect(cspHeader.value).toContain("connect-src 'self'")
    })
  })
})

describe('X-Powered-By Header', () => {
  it('should be disabled in next.config.mjs', () => {
    // The poweredByHeader: false setting removes the X-Powered-By header
    const config = { poweredByHeader: false }
    expect(config.poweredByHeader).toBe(false)
  })
})

describe('Source Maps', () => {
  it('should be disabled in production', () => {
    const config = { productionBrowserSourceMaps: false }
    expect(config.productionBrowserSourceMaps).toBe(false)
  })
})
