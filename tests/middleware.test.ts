/**
 * @jest-environment node
 */

import { NextRequest } from 'next/server'
import { middleware } from '@/middleware'

function createRequest(path: string, cookies: Record<string, string> = {}) {
  const url = new URL(path, 'http://localhost:3000')
  const request = new NextRequest(url)
  for (const [key, value] of Object.entries(cookies)) {
    request.cookies.set(key, value)
  }
  return request
}

describe('middleware', () => {
  it('allows public routes without auth', () => {
    const response = middleware(createRequest('/'))
    expect(response.status).not.toBe(307)
  })

  it('allows /login without auth', () => {
    const response = middleware(createRequest('/login'))
    expect(response.status).not.toBe(307)
  })

  it('redirects to login for protected routes without session', () => {
    const response = middleware(createRequest('/dashboard'))
    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toContain('/login')
    expect(response.headers.get('location')).toContain('redirect=%2Fdashboard')
  })

  it('allows protected routes with __session cookie', () => {
    const response = middleware(createRequest('/dashboard', { __session: '1' }))
    expect(response.status).not.toBe(307)
  })

  it('allows protected routes with firebase-auth-token cookie', () => {
    const response = middleware(createRequest('/leads', { 'firebase-auth-token': 'abc' }))
    expect(response.status).not.toBe(307)
  })

  it('redirects non-admin from admin routes', () => {
    const response = middleware(
      createRequest('/knowledge', { __session: '1', 'user-role': 'contractor' })
    )
    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toContain('/dashboard')
  })

  it('allows admin to access admin routes', () => {
    const response = middleware(
      createRequest('/knowledge', { __session: '1', 'user-role': 'admin' })
    )
    expect(response.status).not.toBe(307)
  })

  it('allows admin routes when role cookie is not set (client verifies)', () => {
    const response = middleware(createRequest('/pricing', { __session: '1' }))
    expect(response.status).not.toBe(307)
  })
})
