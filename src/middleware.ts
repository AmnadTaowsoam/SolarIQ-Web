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
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://static.cloudflareinsights.com https://maps.googleapis.com https://apis.google.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: https: blob:",
    "font-src 'self' data: https://fonts.gstatic.com",
    "connect-src 'self' https://*.firebaseio.com https://*.googleapis.com https://*.gstatic.com https://www.google-analytics.com https://static.cloudflareinsights.com https://cloudflareinsights.com https://solariq-api-269682189177.asia-southeast1.run.app https://*.run.app https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://maps.googleapis.com https://maps.google.com",
    "frame-src 'self' https://liff.line.me https://www.google.com https://apis.google.com https://solariqapp.firebaseapp.com",
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
    'geolocation=(self), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), gyroscope=()',

  // Cross-Origin-Embedder-Policy - use unsafe-none to allow cross-origin resources
  // (Firebase SDK, Google Fonts, Analytics, etc. don't send CORP headers)
  'Cross-Origin-Embedder-Policy': 'unsafe-none',

  // Cross-Origin-Opener-Policy - same-origin-allow-popups for OAuth flows
  'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',

  // X-DNS-Prefetch-Control - Control DNS prefetching
  'X-DNS-Prefetch-Control': 'off',

  // Cache-Control for API routes - Prevent caching sensitive data
}

/**
 * Paths that should be excluded from security header enforcement
 */
const EXEMPT_PATHS = ['/_next', '/api/health', '/api/webhook', '/api/analytics/vitals']
const PUBLIC_PATHS = new Set([
  '/',
  '/about',
  '/blog',
  '/contact',
  '/forgot-password',
  '/help',
  '/landing',
  '/login',
  '/offline',
  '/pdpa',
  '/pdpa/request',
  '/pricing-plans',
  '/privacy',
  '/refund-policy',
  '/robots.txt',
  '/signup',
  '/sitemap.xml',
  '/status',
  '/terms',
  '/verify-email',
  '/llms.txt',
  '/llms-full.txt',
])
const PUBLIC_PREFIXES = ['/blog/', '/checkout', '/liff']
const NOINDEX_PUBLIC_PATHS = new Set([
  '/landing',
  '/login',
  '/signup',
  '/forgot-password',
  '/verify-email',
  '/offline',
  '/status',
])
const NOINDEX_PUBLIC_PREFIXES = ['/checkout', '/liff']

/**
 * Check if path should be exempted from security headers
 */
function shouldExemptPath(pathname: string): boolean {
  return EXEMPT_PATHS.some((exempt) => pathname.startsWith(exempt))
}

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.has(pathname) || PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix))
}

function shouldAddNoindexHeader(pathname: string): boolean {
  if (NOINDEX_PUBLIC_PATHS.has(pathname)) {
    return true
  }

  if (NOINDEX_PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return true
  }

  return !pathname.startsWith('/api') && !isPublicPath(pathname)
}

/**
 * Middleware function to add security headers
 */
export function middleware(request: NextRequest) {
  // Read locale from NEXT_LOCALE cookie and pass as x-locale header
  // so next-intl's getRequestConfig can pick it up
  const localeCookie = request.cookies.get('NEXT_LOCALE')?.value
  const requestHeaders = new Headers(request.headers)
  if (localeCookie && (localeCookie === 'th' || localeCookie === 'en')) {
    requestHeaders.set('x-locale', localeCookie)
  }

  // If URL has /en/ or /th/ prefix, redirect to clean path (cookie-based, no URL locale)
  const pathname = request.nextUrl.pathname
  const localeMatch = pathname.match(/^\/(en|th)(\/.*)$/)
  if (localeMatch) {
    const detectedLocale = localeMatch[1]
    const cleanPath = localeMatch[2] || '/'
    const url = request.nextUrl.clone()
    url.pathname = cleanPath
    const redirectResponse = NextResponse.redirect(url)
    redirectResponse.cookies.set('NEXT_LOCALE', detectedLocale || '', {
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
      sameSite: 'lax',
    })
    return redirectResponse
  }

  const sessionCookie = request.cookies.get('__session')?.value

  if (!pathname.startsWith('/api') && !isPublicPath(pathname) && !sessionCookie) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/login'
    return NextResponse.redirect(loginUrl)
  }

  // Protect /admin routes: redirect non-admin users to /dashboard
  if (pathname.startsWith('/admin')) {
    const roleCookie = request.cookies.get('user-role')?.value

    if (!sessionCookie) {
      const loginUrl = request.nextUrl.clone()
      loginUrl.pathname = '/login'
      return NextResponse.redirect(loginUrl)
    }

    if (roleCookie && roleCookie !== 'admin') {
      const dashboardUrl = request.nextUrl.clone()
      dashboardUrl.pathname = '/dashboard'
      return NextResponse.redirect(dashboardUrl)
    }
  }

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  })

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

  if (shouldAddNoindexHeader(request.nextUrl.pathname)) {
    response.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive')
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
