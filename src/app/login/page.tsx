'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { useAuth } from '@/context'
import { useToast } from '@/components/ui'
import { Button, Input, Card, CardBody } from '@/components/ui'
import { ROUTES } from '@/lib/constants'

export default function LoginPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading, isDevLoginEnabled, loginWithDevCredentials } = useAuth()
  const { addToast } = useToast()
  const devLoginEmail = process.env.NEXT_PUBLIC_DEV_LOGIN_EMAIL || 'admin@solariq.local'
  const devLoginPassword = process.env.NEXT_PUBLIC_DEV_LOGIN_PASSWORD || 'Solariq123'
  const devLoginRole = process.env.NEXT_PUBLIC_DEV_LOGIN_ROLE === 'contractor' ? 'contractor' : 'admin'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})
  const [failedAttempts, setFailedAttempts] = useState(0)
  const [lockoutUntil, setLockoutUntil] = useState<number | null>(null)

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace(ROUTES.DASHBOARD)
    }
  }, [isAuthenticated, isLoading, router])

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {}

    const sanitizedEmail = email.trim()
    const sanitizedPassword = password.trim()

    if (!sanitizedEmail) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sanitizedEmail)) {
      newErrors.email = 'Invalid email format'
    } else if (sanitizedEmail.length > 255) {
      newErrors.email = 'Email is too long'
    }

    if (!sanitizedPassword) {
      newErrors.password = 'Password is required'
    } else if (sanitizedPassword.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    } else if (sanitizedPassword.length > 128) {
      newErrors.password = 'Password is too long'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (lockoutUntil && Date.now() < lockoutUntil) {
      const remainingTime = Math.ceil((lockoutUntil - Date.now()) / 1000)
      addToast('error', `Too many attempts. Please try again in ${remainingTime} seconds.`)
      return
    }

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    const normalizedEmail = email.trim()
    const normalizedPassword = password.trim()

    try {
      if (isDevLoginEnabled) {
        const success = await loginWithDevCredentials(normalizedEmail, normalizedPassword)
        if (!success) {
          throw { code: 'auth/invalid-credential' }
        }

        // Force-set middleware cookies and perform full navigation so redirect is reliable.
        document.cookie = '__session=1; path=/; max-age=1800; SameSite=Lax'
        document.cookie = `user-role=${devLoginRole}; path=/; max-age=1800; SameSite=Lax`
        window.location.assign(ROUTES.DASHBOARD)
        return
      } else {
        await signInWithEmailAndPassword(auth, normalizedEmail, normalizedPassword)
      }

      setFailedAttempts(0)
      setLockoutUntil(null)
      addToast('success', 'Login successful!')
      router.push(ROUTES.DASHBOARD)
    } catch (error: unknown) {
      void error // Acknowledge error for type safety
      let message = 'Failed to login. Please try again.'
      let isRateLimit = false

      if (error && typeof error === 'object' && 'code' in error) {
        const errorCode = (error as { code: string }).code
        switch (errorCode) {
          case 'auth/user-not-found':
            message = 'No account found with this email'
            break
          case 'auth/wrong-password':
            message = 'Incorrect password'
            break
          case 'auth/invalid-credential':
            message = 'Invalid email or password'
            break
          case 'auth/too-many-requests':
            message = 'Too many failed attempts. Please try again later'
            isRateLimit = true
            break
        }
      }

      const newFailedAttempts = failedAttempts + 1
      setFailedAttempts(newFailedAttempts)

      if (isRateLimit || newFailedAttempts >= 5) {
        setLockoutUntil(Date.now() + 60 * 1000) // 60 seconds lockout
        message = 'Too many failed attempts. Please try again in 60 seconds.'
      }

      addToast('error', message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Logo and title */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-primary-600 rounded-xl flex items-center justify-center">
            <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">SolarIQ</h2>
          <p className="mt-2 text-sm text-gray-600">Sign in to your account</p>
        </div>

        {isDevLoginEnabled && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-900">
            Dev login: <strong>{devLoginEmail}</strong> / <strong>{devLoginPassword}</strong>
          </div>
        )}

        {/* Login form */}
        <Card>
          <CardBody className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                label="Email address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={errors.email}
                placeholder="you@example.com"
                autoComplete="email"
                disabled={isSubmitting || (lockoutUntil !== null && Date.now() < lockoutUntil)}
                maxLength={255}
              />

              <Input
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={errors.password}
                placeholder="••••••••"
                autoComplete="current-password"
                disabled={isSubmitting || (lockoutUntil !== null && Date.now() < lockoutUntil)}
                maxLength={128}
              />

              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-600">Remember me</span>
                </label>
                <a href="#" className="text-sm font-medium text-primary-600 hover:text-primary-500">
                  Forgot password?
                </a>
              </div>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                isLoading={isSubmitting}
                disabled={lockoutUntil !== null && Date.now() < lockoutUntil}
              >
                Sign in
              </Button>
            </form>
          </CardBody>
        </Card>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500">
          Don't have an account?{' '}
          <a href="#" className="font-medium text-primary-600 hover:text-primary-500">
            Contact administrator
          </a>
        </p>
      </div>
    </div>
  )
}
