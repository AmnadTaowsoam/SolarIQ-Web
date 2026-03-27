/**
 * Next.js Middleware for Security Headers
 * Adds OWASP-recommended security headers to all responses
 */

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Security headers configuration
 */
const SECURITY_HEADERS = {
  // Content Security Policy - Controls resources the browser is allowed to load
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: https: blob:",
    "font-src 'self' data: https://fonts.gstatic.com",
    "connect-src 'self' https://*.firebaseio.com https://*.googleapis.com https://*.gstatic.com https://www.google-analytics.com",
    "frame-src 'self' https://liff.line.me",
    "media-src 'self' https:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    'upgrade-insecure-requests',
  ].join('; '),

  // Strict-Transport-Security - Force HTTPS connections
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',

  // X-Content-Type-Options - Prevent MIME type sniffing
  'X-Content-Type-Options': 'nosniff',

  // X-Frame-Options - Prevent clickjacking
  'X-Frame-Options': 'DENY',

  // X-XSS-Protection - Enable browser XSS filter
  'X-XSS-Protection': '1; mode=block',

  // Referrer-Policy - Control referrer information
  'Referrer-Policy': 'strict-origin-when-cross-origin',

  // Permissions-Policy - Control browser features
  'Permissions-Policy':
    'geolocation=(), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), gyroscope=()',

  // Cross-Origin-Embedder-Policy - Control COOP/COEP for shared array buffers
  'Cross-Origin-Embedder-Policy': 'require-corp',

  // Cross-Origin-Opener-Policy - Control COOP for window opener
  'Cross-Origin-Opener-Policy': 'same-origin',

  // X-DNS-Prefetch-Control - Control DNS prefetching
  'X-DNS-Prefetch-Control': 'off',

  // Cache-Control for API routes - Prevent caching sensitive data
}

/**
 * Paths that should be excluded from security header enforcement
 */
const EXEMPT_PATHS = ['/_next', '/api/health', '/api/webhook', '/api/analytics/vitals']

/**
 * Check if path should be exempted from security headers
 */
function shouldExemptPath(pathname: string): boolean {
  return EXEMPT_PATHS.some((exempt) => pathname.startsWith(exempt))
}

/**
 * Middleware function to add security headers
 */
export function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // Skip security headers for exempted paths
  if (shouldExemptPath(request.nextUrl.pathname)) {
    return response
  }

  // Add security headers
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value)
  })

  // Add cache control for API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    response.headers.set(
      'Cache-Control',
      'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0'
    )
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
  }

  return response
}

/**
 * Middleware matcher configuration
 * Apply to all paths except static files and images
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
