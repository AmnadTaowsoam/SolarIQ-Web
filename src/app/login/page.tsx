'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { useAuth } from '@/context'
import { useToast } from '@/components/ui'
import { Button, Input, Card, CardBody } from '@/components/ui'
import { ROUTES } from '@/lib/constants'
import { defaultLocale } from '@/i18n/config'
import { buildLocalizedPath, extractLocaleFromPath } from '@/lib/locale'
import { useTranslations } from 'next-intl'

export default function LoginPage() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { isAuthenticated, isLoading, isDevLoginEnabled, loginWithDevCredentials } = useAuth()
  const { addToast } = useToast()
  const devLoginEmail = process.env.NEXT_PUBLIC_DEV_LOGIN_EMAIL || 'admin@solariq.local'
  const devLoginPassword = process.env.NEXT_PUBLIC_DEV_LOGIN_PASSWORD || 'Solariq123'
  const devLoginRole = process.env.NEXT_PUBLIC_DEV_LOGIN_ROLE === 'contractor' ? 'contractor' : 'admin'
  const locale = extractLocaleFromPath(pathname).locale ?? defaultLocale
  const t = useTranslations('authPages.login')
  const requestedRedirect = searchParams.get('redirect')
  const targetPath = requestedRedirect && requestedRedirect.startsWith('/')
    ? requestedRedirect
    : ROUTES.DASHBOARD
  const signupPath = buildLocalizedPath(ROUTES.SIGNUP, locale)
  const forgotPasswordPath = buildLocalizedPath(ROUTES.FORGOT_PASSWORD, locale)
  const redirectAfterAuth = buildLocalizedPath(targetPath, locale)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})
  const [failedAttempts, setFailedAttempts] = useState(0)
  const [lockoutUntil, setLockoutUntil] = useState<number | null>(null)

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace(redirectAfterAuth)
    }
  }, [isAuthenticated, isLoading, redirectAfterAuth, router])

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {}

    const sanitizedEmail = email.trim()
    const sanitizedPassword = password.trim()

    if (!sanitizedEmail) {
      newErrors.email = t('errors.emailRequired')
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sanitizedEmail)) {
      newErrors.email = t('errors.invalidEmail')
    } else if (sanitizedEmail.length > 255) {
      newErrors.email = t('errors.emailTooLong')
    }

    if (!sanitizedPassword) {
      newErrors.password = t('errors.passwordRequired')
    } else if (sanitizedPassword.length < 6) {
      newErrors.password = t('errors.passwordMin')
    } else if (sanitizedPassword.length > 128) {
      newErrors.password = t('errors.passwordTooLong')
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (lockoutUntil && Date.now() < lockoutUntil) {
      const remainingTime = Math.ceil((lockoutUntil - Date.now()) / 1000)
      addToast('error', t('errors.tooManyAttemptsDynamic', { seconds: remainingTime }))
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
        window.location.assign(redirectAfterAuth)
        return
      } else {
        await signInWithEmailAndPassword(auth, normalizedEmail, normalizedPassword)
      }

      setFailedAttempts(0)
      setLockoutUntil(null)
      addToast('success', t('messages.success'))
      router.push(redirectAfterAuth)
    } catch (error: unknown) {
      let message = t('errors.failed')
      let isRateLimit = false

      if (error && typeof error === 'object' && 'code' in error) {
        const errorCode = (error as { code: string }).code
        switch (errorCode) {
          case 'auth/user-not-found':
            message = t('errors.userNotFound')
            break
          case 'auth/wrong-password':
            message = t('errors.wrongPassword')
            break
          case 'auth/invalid-credential':
            message = t('errors.invalidCredential')
            break
          case 'auth/too-many-requests':
            message = t('errors.tooManyAttempts')
            isRateLimit = true
            break
        }
      }

      const newFailedAttempts = failedAttempts + 1
      setFailedAttempts(newFailedAttempts)

      if (isRateLimit || newFailedAttempts >= 5) {
        setLockoutUntil(Date.now() + 60 * 1000) // 60 seconds lockout
        message = t('errors.tooManyAttemptsDynamic', { seconds: 60 })
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
          <p className="mt-2 text-sm text-gray-600">{t('subtitle')}</p>
        </div>

        {isDevLoginEnabled && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-900">
            {t('devLogin')}: <strong>{devLoginEmail}</strong> / <strong>{devLoginPassword}</strong>
          </div>
        )}

        {/* Login form */}
        <Card>
          <CardBody className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                label={t('emailLabel')}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={errors.email}
                placeholder={t('emailPlaceholder')}
                autoComplete="email"
                disabled={isSubmitting || (lockoutUntil !== null && Date.now() < lockoutUntil)}
                maxLength={255}
              />

              <Input
                label={t('passwordLabel')}
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
                  <span className="ml-2 text-sm text-gray-600">{t('rememberMe')}</span>
                </label>
                <Link href={forgotPasswordPath} className="text-sm font-medium text-primary-600 hover:text-primary-500">
                  {t('forgotPassword')}
                </Link>
              </div>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                isLoading={isSubmitting}
                disabled={lockoutUntil !== null && Date.now() < lockoutUntil}
              >
                {t('submit')}
              </Button>
            </form>
          </CardBody>
        </Card>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500">
          {t('noAccount')}{' '}
          <Link href={signupPath} className="font-medium text-primary-600 hover:text-primary-500">
            {t('createAccount')}
          </Link>
        </p>

        <p className="text-center text-xs text-gray-400">
          {t('provisionedAccountsHint')}
        </p>
      </div>
    </div>
  )
}
