'use client'

import { FormEvent, useMemo, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { sendPasswordResetEmail } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { Button, Card, CardBody, Input } from '@/components/ui'
import { useToast } from '@/components/ui'
import { ROUTES } from '@/lib/constants'
import { defaultLocale } from '@/i18n/config'
import { buildLocalizedPath, extractLocaleFromPath } from '@/lib/locale'
import { useTranslations } from 'next-intl'

export default function ForgotPasswordPage() {
  const pathname = usePathname()
  const { addToast } = useToast()
  const locale = extractLocaleFromPath(pathname).locale ?? defaultLocale
  const t = useTranslations('authPages.forgotPassword')
  const loginPath = useMemo(() => buildLocalizedPath(ROUTES.LOGIN, locale), [locale])
  const signupPath = useMemo(() => buildLocalizedPath(ROUTES.SIGNUP, locale), [locale])
  const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@solariq.th'
  const isDevLoginEnabled = process.env.NEXT_PUBLIC_ENABLE_DEV_LOGIN === 'true'

  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const validateEmail = (value: string) => {
    const normalized = value.trim()
    if (!normalized) {
      return t('errors.emailRequired')
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
      return t('errors.invalidEmail')
    }
    return ''
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const nextError = validateEmail(email)
    setError(nextError)
    if (nextError) {
      return
    }

    setIsSubmitting(true)

    try {
      if (!isDevLoginEnabled) {
        await sendPasswordResetEmail(auth, email.trim())
      }

      setIsSuccess(true)
      addToast('success', t('successMessage'))
    } catch {
      setError(t('errors.sendFailed'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-primary-600 rounded-xl flex items-center justify-center">
            <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8l8 5 8-5M4 8l8-5 8 5M4 8v8l8 5 8-5V8" />
            </svg>
          </div>
          <h1 className="mt-6 text-3xl font-bold text-gray-900">{t('title')}</h1>
          <p className="mt-2 text-sm text-gray-600">
            {t('subtitle')}
          </p>
        </div>

        <Card>
          <CardBody className="p-8">
            {isSuccess ? (
              <div className="space-y-4 text-sm text-gray-600">
                <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-green-800">
                  {t('successMessage')}
                </div>
                {isDevLoginEnabled && (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-amber-900">
                    {t('devHint')}{' '}
                    <a href={`mailto:${supportEmail}`} className="font-medium underline">
                      {supportEmail}
                    </a>
                    .
                  </div>
                )}
                <Link href={loginPath} className="inline-flex text-sm font-medium text-primary-600 hover:text-primary-500">
                  {t('backToSignIn')}
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <Input
                  label={t('emailLabel')}
                  type="email"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value)
                    if (error) {
                      setError('')
                    }
                  }}
                  error={error || undefined}
                  placeholder={t('emailPlaceholder')}
                  autoComplete="email"
                  disabled={isSubmitting}
                  maxLength={255}
                />

                <Button type="submit" className="w-full" size="lg" isLoading={isSubmitting}>
                  {t('submit')}
                </Button>
              </form>
            )}
          </CardBody>
        </Card>

        <p className="text-center text-sm text-gray-500">
          {t('needAccount')}{' '}
          <Link href={signupPath} className="font-medium text-primary-600 hover:text-primary-500">
            {t('createAccount')}
          </Link>
        </p>
      </div>
    </div>
  )
}
