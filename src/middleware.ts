import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { defaultLocale, isSupportedLocale, type Locale } from '@/i18n/config'
import { buildLocalizedPath, extractLocaleFromPath, normalizePathname } from '@/lib/locale'

const LOCALE_COOKIE = 'NEXT_LOCALE'

// Routes that don't require authentication
const publicRoutes = [
  '/',
  '/login',
  '/signup',
  '/forgot-password',
  '/verify-email',
  '/landing',
  '/pricing-plans',
  '/about',
  '/terms',
  '/privacy',
  '/refund-policy',
  '/contact',
  '/checkout',
  '/checkout/success',
  '/checkout/cancel',
]

// Admin-only routes
const adminRoutes = ['/knowledge', '/pricing', '/admin/revenue']

function getLocaleFromHeader(header: string | null): Locale | null {
  if (!header) {
    return null
  }
  const value = header.split(',')[0]?.trim()?.toLowerCase() ?? ''
  const base = value.split('-')[0]
  return isSupportedLocale(base) ? base : null
}

function resolvePreferredLocale(request: NextRequest): Locale {
  const cookieLocale = request.cookies.get(LOCALE_COOKIE)?.value
  if (isSupportedLocale(cookieLocale)) {
    return cookieLocale
  }
  const headerLocale = getLocaleFromHeader(request.headers.get('accept-language'))
  return headerLocale ?? defaultLocale
}

export function middleware(request: NextRequest) {
  const pathname = normalizePathname(request.nextUrl.pathname)
  const { locale: pathLocale, pathname: strippedPath } = extractLocaleFromPath(pathname)
  const preferredLocale = pathLocale ?? resolvePreferredLocale(request)

  // Handle root path first
  if (strippedPath === '/') {
    const hasSession =
      request.cookies.get('__session') ?? request.cookies.get('firebase-auth-token')
    const target = hasSession ? '/dashboard' : '/landing'
    const localizedTarget = buildLocalizedPath(target, preferredLocale)
    const redirectUrl = new URL(localizedTarget, request.url)
    const response = NextResponse.redirect(redirectUrl)
    response.cookies.set(LOCALE_COOKIE, preferredLocale, { path: '/', maxAge: 60 * 60 * 24 * 365 })
    response.headers.set('x-locale', preferredLocale)
    return response
  }

  // Strip default locale prefix from URL (e.g. /th/billing → /billing)
  if (pathLocale === defaultLocale) {
    const redirectUrl = new URL(strippedPath, request.url)
    const response = NextResponse.redirect(redirectUrl)
    response.cookies.set(LOCALE_COOKIE, defaultLocale, { path: '/', maxAge: 60 * 60 * 24 * 365 })
    response.headers.set('x-locale', defaultLocale)
    return response
  }

  // Redirect to locale-prefixed route when user prefers non-default locale
  if (!pathLocale && preferredLocale !== defaultLocale) {
    const redirectUrl = new URL(buildLocalizedPath(pathname, preferredLocale), request.url)
    const response = NextResponse.redirect(redirectUrl)
    response.cookies.set(LOCALE_COOKIE, preferredLocale, { path: '/', maxAge: 60 * 60 * 24 * 365 })
    response.headers.set('x-locale', preferredLocale)
    return response
  }

  const effectivePath = pathLocale ? strippedPath : pathname

  // Check if route is public
  const isPublicRoute = publicRoutes.some(
    (route) => effectivePath === route || effectivePath.startsWith(`${route}/`)
  )

  // Prepare base response (rewrite if locale prefix was present)
  const response = pathLocale
    ? NextResponse.rewrite(new URL(effectivePath, request.url))
    : NextResponse.next()

  response.cookies.set(LOCALE_COOKIE, preferredLocale, { path: '/', maxAge: 60 * 60 * 24 * 365 })
  response.headers.set('x-locale', preferredLocale)

  if (isPublicRoute) {
    return response
  }

  // Check for Firebase auth session cookie/token
  const hasSession = request.cookies.get('__session') ?? request.cookies.get('firebase-auth-token')

  if (!hasSession) {
    const loginUrl = new URL(buildLocalizedPath('/login', preferredLocale), request.url)
    loginUrl.searchParams.set('redirect', effectivePath)
    return NextResponse.redirect(loginUrl)
  }

  const isAdminRoute = adminRoutes.some(
    (route) => effectivePath === route || effectivePath.startsWith(`${route}/`)
  )

  if (isAdminRoute) {
    const userRole = request.cookies.get('user-role')?.value
    if (userRole && userRole !== 'admin') {
      return NextResponse.redirect(
        new URL(buildLocalizedPath('/dashboard', preferredLocale), request.url)
      )
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|llms.txt|sw.js|workbox-.*|site.webmanifest|icons/.*).*)',
  ],
}
