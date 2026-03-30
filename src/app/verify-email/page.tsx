'use client'

import { useState, useEffect } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { api } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import { defaultLocale } from '@/i18n/config'
import { buildLocalizedPath, extractLocaleFromPath } from '@/lib/locale'
import { ROUTES } from '@/lib/constants'
import { useTranslations } from 'next-intl'

export default function VerifyEmailPage() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { user, logout, firebaseUser } = useAuth()
  const locale = extractLocaleFromPath(pathname).locale ?? defaultLocale
  const t = useTranslations('authPages.verifyEmail')
  const dashboardPath = buildLocalizedPath(ROUTES.DASHBOARD, locale)
  const onboardingPath = buildLocalizedPath('/onboarding', locale)
  const homePath = buildLocalizedPath(ROUTES.HOME, locale)

  // Resolve email: from URL param, or from auth context
  const emailFromParam = searchParams.get('email') || ''
  const emailFromAuth = user?.email || firebaseUser?.email || ''
  const email = emailFromParam || emailFromAuth

  const token = searchParams.get('token') || ''

  type VerificationStatus = 'pending' | 'verifying' | 'success' | 'expired' | 'error'
  const [status, setStatus] = useState<VerificationStatus>('pending')
  const [resendCooldown, setResendCooldown] = useState(0)
  const [resendSuccess, setResendSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Handle direct verification with token in URL
  useEffect(() => {
    if (!token) {
      return
    }
    const doVerify = async () => {
      setStatus('verifying')
      setError(null)
      try {
        const response = await api.post<{
          success: boolean
          message?: string
          requires_onboarding?: boolean
        }>('/api/v1/auth/verify-email', { token })
        if (response.data.success) {
          setStatus('success')
          setTimeout(() => {
            router.push(response.data.requires_onboarding ? onboardingPath : dashboardPath)
          }, 2000)
        } else {
          setStatus('error')
          setError(response.data.message || t('errors.verifyFailed'))
        }
      } catch {
        setStatus('error')
        setError(t('errors.invalidOrExpired'))
      }
    }
    doVerify()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dashboardPath, onboardingPath, router, token])

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) {
      return
    }
    const t = setInterval(() => setResendCooldown((v) => Math.max(0, v - 1)), 1000)
    return () => clearInterval(t)
  }, [resendCooldown])

  const handleResend = async () => {
    if (!email || resendCooldown > 0) {
      return
    }
    setError(null)
    setResendSuccess(false)
    try {
      await api.post('/api/v1/auth/resend-verification', { email })
      setResendCooldown(60)
      setResendSuccess(true)
    } catch {
      setError(t('errors.resendFailed'))
    }
  }

  const handleLogout = async () => {
    await logout()
  }

  // Verifying state
  if (status === 'verifying') {
    return (
      <div className="min-h-screen bg-[var(--brand-background)] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[var(--brand-surface)] rounded-2xl shadow-sm p-8 text-center">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="w-8 h-8 border-4 border-orange-400 border-t-transparent rounded-full animate-spin" />
          </div>
          <h2 className="text-lg font-bold text-[var(--brand-text)]">{t('verifyingTitle')}</h2>
          <p className="text-[var(--brand-text-secondary)] text-sm mt-2">{t('pleaseWait')}</p>
        </div>
      </div>
    )
  }

  // Success state
  if (status === 'success') {
    return (
      <div className="min-h-screen bg-[var(--brand-background)] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[var(--brand-surface)] rounded-2xl shadow-sm p-8 text-center">
          <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-[var(--brand-text)] mb-2">{t('successTitle')}</h2>
          <p className="text-[var(--brand-text-secondary)] text-sm">{t('successRedirect')}</p>
        </div>
      </div>
    )
  }

  // Main pending/error state
  return (
    <div className="min-h-screen bg-[var(--brand-background)] flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-6">
          <Link href={homePath} className="inline-block">
            <span className="text-2xl font-bold text-orange-600">SolarIQ</span>
          </Link>
        </div>

        <div className="bg-[var(--brand-surface)] rounded-2xl shadow-sm p-8 text-center">
          {/* Envelope icon */}
          <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <svg
              className="w-10 h-10 text-orange-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
              />
            </svg>
          </div>

          <h1 className="text-xl font-bold text-[var(--brand-text)] mb-2">{t('title')}</h1>

          {email ? (
            <p className="text-[var(--brand-text-secondary)] text-sm mb-1">{t('sentTo')}</p>
          ) : (
            <p className="text-[var(--brand-text-secondary)] text-sm mb-4">{t('sentGeneric')}</p>
          )}
          {email && <p className="text-orange-600 font-semibold text-sm mb-4 break-all">{email}</p>}

          <p className="text-[var(--brand-text-secondary)] text-xs mb-6">{t('instructions')}</p>

          {/* Error */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-sm text-red-700 mb-4">
              {error}
            </div>
          )}

          {/* Resend success */}
          {resendSuccess && !error && (
            <div className="bg-green-500/10 border border-green-200 rounded-xl p-3 text-sm text-green-700 mb-4">
              {t('resendSuccess')}
            </div>
          )}

          {/* Resend button */}
          <button
            onClick={handleResend}
            disabled={resendCooldown > 0 || !email}
            className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl font-semibold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-3"
          >
            {resendCooldown > 0 ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                {t('resendCountdown', { seconds: resendCooldown })}
              </span>
            ) : (
              t('resendButton')
            )}
          </button>

          {/* Logout button */}
          <button
            onClick={handleLogout}
            className="w-full py-3 border border-[var(--brand-border)] text-[var(--brand-text-secondary)] rounded-2xl font-semibold text-sm transition-colors hover:bg-[var(--brand-background)]"
          >
            {t('logout')}
          </button>
        </div>

        <p className="text-center text-xs text-[var(--brand-text-secondary)] mt-6">
          {t('needHelp')}{' '}
          <a href="mailto:support@solariq.th" className="text-orange-500 hover:underline">
            support@solariq.th
          </a>
        </p>
      </div>
    </div>
  )
}
