import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Routes that don't require authentication
const publicRoutes = ['/', '/login', '/landing']

// Admin-only routes
const adminRoutes = ['/knowledge', '/pricing']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const response = NextResponse.next()

  // Resolve the root path server-side to avoid client-side loading loops.
  if (pathname === '/') {
    const hasSession = request.cookies.get('__session') ?? request.cookies.get('firebase-auth-token')
    const target = hasSession ? '/dashboard' : '/landing'
    return NextResponse.redirect(new URL(target, request.url))
  }

  // Check if route is public
  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  )

  if (isPublicRoute) {
    return response
  }

  // Check for Firebase auth session cookie/token
  // Firebase Auth uses client-side tokens, so we check for the session indicator
  const hasSession = request.cookies.get('__session') ?? request.cookies.get('firebase-auth-token')

  if (!hasSession) {
    // No session found — redirect to login for protected routes
    // Note: This is a lightweight check. Full token verification happens client-side
    // via Firebase Auth and server-side in the backend API.
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Check admin routes — role enforcement is done client-side via AuthContext
  // This is a defense-in-depth layer; the backend API also enforces roles
  const isAdminRoute = adminRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  )

  if (isAdminRoute) {
    const userRole = request.cookies.get('user-role')?.value
    if (userRole && userRole !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public assets
     */
    '/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)',
  ],
}
