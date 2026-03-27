'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { api } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { defaultLocale } from '@/i18n/config'
import { buildLocalizedPath, extractLocaleFromPath } from '@/lib/locale'
import { ROUTES } from '@/lib/constants'
import { useTranslations } from 'next-intl'
import { THAI_PROVINCES, getProvinceLabel } from '@/lib/provinces'
import { useGA4 } from '@/hooks/useGA4'
import { getStoredUTMParams } from '@/lib/ga4'

// Password strength calculation
function calculatePasswordStrength(password: string): number {
  let strength = 0
  if (password.length >= 8) {
    strength += 1
  }
  if (password.length >= 12) {
    strength += 1
  }
  if (/[a-z]/.test(password)) {
    strength += 1
  }
  if (/[A-Z]/.test(password)) {
    strength += 1
  }
  if (/[0-9]/.test(password)) {
    strength += 1
  }
  if (/[^a-zA-Z0-9]/.test(password)) {
    strength += 1
  }
  return Math.min(strength, 4)
}

function getPasswordStrengthLabel(
  strength: number,
  labels: { weak: string; medium: string; good: string; strong: string }
): string {
  switch (strength) {
    case 0:
    case 1:
      return labels.weak
    case 2:
      return labels.medium
    case 3:
      return labels.good
    case 4:
      return labels.strong
    default:
      return ''
  }
}

function getPasswordStrengthColor(strength: number): string {
  switch (strength) {
    case 0:
    case 1:
      return 'bg-red-500'
    case 2:
      return 'bg-yellow-500'
    case 3:
      return 'bg-blue-500'
    case 4:
      return 'bg-green-500'
    default:
      return 'bg-gray-300'
  }
}

// Form validation
interface FormData {
  email: string
  password: string
  confirmPassword: string
  companyName: string
  province: string
  phone: string
  acceptTerms: boolean
  acceptPdpa: boolean
}

interface FormErrors {
  email?: string
  password?: string
  confirmPassword?: string
  companyName?: string
  province?: string
  phone?: string
  acceptTerms?: string
  acceptPdpa?: string
}

function validateForm(data: FormData, t: (key: string) => string): FormErrors {
  const errors: FormErrors = {}

  if (!data.email) {
    errors.email = t('validation.emailRequired')
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = t('validation.emailInvalid')
  }

  if (!data.password) {
    errors.password = t('validation.passwordRequired')
  } else if (data.password.length < 8) {
    errors.password = t('validation.passwordMin')
  } else if (calculatePasswordStrength(data.password) < 2) {
    errors.password = t('validation.passwordWeak')
  }

  if (!data.confirmPassword) {
    errors.confirmPassword = t('validation.confirmPasswordRequired')
  } else if (data.password !== data.confirmPassword) {
    errors.confirmPassword = t('validation.confirmPasswordMismatch')
  }

  if (!data.companyName) {
    errors.companyName = t('validation.companyRequired')
  } else if (data.companyName.length < 2) {
    errors.companyName = t('validation.companyMin')
  }

  if (!data.province) {
    errors.province = t('validation.provinceRequired')
  }

  if (!data.phone) {
    errors.phone = t('validation.phoneRequired')
  } else if (!/^[0-9]{9,10}$/.test(data.phone.replace(/-/g, ''))) {
    errors.phone = t('validation.phoneInvalid')
  }

  if (!data.acceptTerms) {
    errors.acceptTerms = t('validation.acceptTerms')
  }

  if (!data.acceptPdpa) {
    errors.acceptPdpa = t('validation.acceptPdpa')
  }

  return errors
}

export default function SignupPage() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const isTrial = searchParams.get('trial') === 'true'
  const locale = extractLocaleFromPath(pathname).locale ?? defaultLocale
  const t = useTranslations('authPages.signup')
  const loginPath = buildLocalizedPath(ROUTES.LOGIN, locale)
  const verifyEmailPath = buildLocalizedPath(ROUTES.VERIFY_EMAIL, locale)
  const dashboardPath = buildLocalizedPath(ROUTES.DASHBOARD, locale)
  const homePath = buildLocalizedPath(ROUTES.HOME, locale)
  const privacyPath = buildLocalizedPath('/privacy', locale)
  const [isLoading, setIsLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formErrors, setFormErrors] = useState<FormErrors>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  // Analytics tracking
  const { trackSignUp, trackTrialStart } = useGA4()
  const utmParams = getStoredUTMParams()

  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    confirmPassword: '',
    companyName: '',
    province: '',
    phone: '',
    acceptTerms: false,
    acceptPdpa: false,
  })

  const passwordStrength = calculatePasswordStrength(formData.password)
  const passwordStrengthLabel = getPasswordStrengthLabel(passwordStrength, {
    weak: t('strength.weak'),
    medium: t('strength.medium'),
    good: t('strength.good'),
    strong: t('strength.strong'),
  })
  const provinceOptions = useMemo(
    () =>
      [...THAI_PROVINCES].sort((a, b) =>
        getProvinceLabel(a, locale).localeCompare(getProvinceLabel(b, locale), locale)
      ),
    [locale]
  )

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      router.push(dashboardPath)
    }
  }, [dashboardPath, router, user])

  const handleInputChange = useCallback(
    (field: keyof FormData, value: string | boolean) => {
      setFormData((prev) => ({ ...prev, [field]: value }))
      setTouched((prev) => ({ ...prev, [field]: true }))
      // Clear error when user starts typing
      if (error) {
        setError(null)
      }
    },
    [error]
  )

  const handleBlur = useCallback(
    (field: keyof FormData) => {
      setTouched((prev) => ({ ...prev, [field]: true }))
      const errors = validateForm(formData, t)
      setFormErrors((prev) => ({ ...prev, [field]: errors[field] }))
    },
    [formData, t]
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validate all fields
    const errors = validateForm(formData, t)
    setFormErrors(errors)
    setTouched({
      email: true,
      password: true,
      confirmPassword: true,
      companyName: true,
      province: true,
      phone: true,
      acceptTerms: true,
      acceptPdpa: true,
    })

    if (Object.keys(errors).length > 0) {
      return
    }

    setIsLoading(true)

    try {
      const response = await api.post<{ success: boolean; message?: string; user_id?: string }>(
        '/auth/signup',
        {
          email: formData.email,
          password: formData.password,
          company_name: formData.companyName,
          province: formData.province,
          phone: formData.phone,
          accept_terms: formData.acceptTerms,
          accept_pdpa: formData.acceptPdpa,
          start_trial: isTrial,
          utm_source: utmParams.utm_source,
          utm_medium: utmParams.utm_medium,
          utm_campaign: utmParams.utm_campaign,
          utm_term: utmParams.utm_term,
          utm_content: utmParams.utm_content,
        }
      )

      if (response.success) {
        // Track sign up event
        trackSignUp({
          method: 'email',
          plan: isTrial ? 'trial' : 'free',
        })

        // Track trial start if applicable
        if (isTrial) {
          trackTrialStart({
            plan_id: 'trial',
            plan_name: 'Free Trial',
            trial_days: 14,
          })
        }

        // Redirect to email verification page
        router.push(`${verifyEmailPath}?email=${encodeURIComponent(formData.email)}`)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errors.signupFailed'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignup = async () => {
    setGoogleLoading(true)
    setError(null)

    try {
      // Initialize Google OAuth flow
      // This will be handled by Firebase
      const { GoogleAuthProvider, signInWithPopup } = await import('firebase/auth')
      const { auth } = await import('@/lib/firebase')

      const provider = new GoogleAuthProvider()
      provider.addScope('email')
      provider.addScope('profile')

      const result = await signInWithPopup(auth, provider)
      const idToken = await result.user.getIdToken()

      // Send to backend for verification and account creation
      const response = await api.post<{
        success: boolean
        requires_onboarding?: boolean
        message?: string
        user_id?: string
      }>('/signup/google', {
        id_token: idToken,
        utm_source: utmParams.utm_source,
        utm_medium: utmParams.utm_medium,
        utm_campaign: utmParams.utm_campaign,
        utm_term: utmParams.utm_term,
        utm_content: utmParams.utm_content,
      })

      if (response.success) {
        // Track sign up event
        trackSignUp({
          method: 'google',
          plan: isTrial ? 'trial' : 'free',
        })

        // Track trial start if applicable
        if (isTrial) {
          trackTrialStart({
            plan_id: 'trial',
            plan_name: 'Free Trial',
            trial_days: 14,
          })
        }

        if (response.requires_onboarding) {
          router.push(buildLocalizedPath('/onboarding', locale))
        } else {
          router.push(dashboardPath)
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errors.googleSignupFailed'))
    } finally {
      setGoogleLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href={homePath} className="inline-block">
            <h1 className="text-3xl font-bold text-blue-600">SolarIQ</h1>
          </Link>
          <p className="mt-2 text-gray-600">{t('subtitle')}</p>
          {isTrial && (
            <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-green-50 border border-green-200 px-4 py-2">
              <span className="flex h-2 w-2 rounded-full bg-green-500" />
              <span className="text-sm font-semibold text-green-700">ทดลองฟรี 14 วัน</span>
            </div>
          )}
        </div>

        <Card className="p-8">
          {/* Google Signup Button */}
          <Button
            type="button"
            variant="outline"
            onClick={handleGoogleSignup}
            disabled={googleLoading || isLoading}
            className="w-full mb-6 flex items-center justify-center gap-3"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            {googleLoading ? t('processing') : t('googleSignup')}
          </Button>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">{t('or')}</span>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          {/* Signup Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                {t('emailLabel')} <span className="text-red-500">*</span>
              </label>
              <Input
                id="email"
                type="email"
                placeholder="example@company.com"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                onBlur={() => handleBlur('email')}
                error={touched.email ? formErrors.email : undefined}
                disabled={isLoading || googleLoading}
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                {t('passwordLabel')} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder={t('passwordPlaceholder')}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  onBlur={() => handleBlur('password')}
                  error={touched.password ? formErrors.password : undefined}
                  disabled={isLoading || googleLoading}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                      />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>
              {/* Password Strength Indicator */}
              {formData.password && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[0, 1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded ${
                          i < passwordStrength
                            ? getPasswordStrengthColor(passwordStrength)
                            : 'bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-gray-500">
                    {t('strength.label')}{' '}
                    <span
                      className={`font-medium ${
                        passwordStrength <= 1
                          ? 'text-red-500'
                          : passwordStrength === 2
                            ? 'text-yellow-500'
                            : passwordStrength === 3
                              ? 'text-blue-500'
                              : 'text-green-500'
                      }`}
                    >
                      {passwordStrengthLabel}
                    </span>
                  </p>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                {t('confirmPasswordLabel')} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder={t('confirmPasswordPlaceholder')}
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  onBlur={() => handleBlur('confirmPassword')}
                  error={touched.confirmPassword ? formErrors.confirmPassword : undefined}
                  disabled={isLoading || googleLoading}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                      />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Company Name */}
            <div>
              <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-1">
                {t('companyLabel')} <span className="text-red-500">*</span>
              </label>
              <Input
                id="companyName"
                type="text"
                placeholder={t('companyPlaceholder')}
                value={formData.companyName}
                onChange={(e) => handleInputChange('companyName', e.target.value)}
                onBlur={() => handleBlur('companyName')}
                error={touched.companyName ? formErrors.companyName : undefined}
                disabled={isLoading || googleLoading}
              />
            </div>

            {/* Province */}
            <div>
              <label htmlFor="province" className="block text-sm font-medium text-gray-700 mb-1">
                {t('provinceLabel')} <span className="text-red-500">*</span>
              </label>
              <select
                id="province"
                value={formData.province}
                onChange={(e) => handleInputChange('province', e.target.value)}
                onBlur={() => handleBlur('province')}
                disabled={isLoading || googleLoading}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  touched.province && formErrors.province ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">{t('provincePlaceholder')}</option>
                {provinceOptions.map((province) => (
                  <option key={province.th} value={province.th}>
                    {getProvinceLabel(province, locale)}
                  </option>
                ))}
              </select>
              {touched.province && formErrors.province && (
                <p className="mt-1 text-sm text-red-500">{formErrors.province}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                {t('phoneLabel')} <span className="text-red-500">*</span>
              </label>
              <Input
                id="phone"
                type="tel"
                placeholder="0812345678"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                onBlur={() => handleBlur('phone')}
                error={touched.phone ? formErrors.phone : undefined}
                disabled={isLoading || googleLoading}
              />
            </div>

            {/* Terms and PDPA Checkboxes */}
            <div className="space-y-3">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.acceptTerms}
                  onChange={(e) => handleInputChange('acceptTerms', e.target.checked)}
                  disabled={isLoading || googleLoading}
                  className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-600">
                  {t('acceptPrefix')}{' '}
                  <Link href="/terms" className="text-blue-600 hover:underline" target="_blank">
                    {t('termsLink')}
                  </Link>{' '}
                  <span className="text-red-500">*</span>
                </span>
              </label>
              {touched.acceptTerms && formErrors.acceptTerms && (
                <p className="text-sm text-red-500 ml-7">{formErrors.acceptTerms}</p>
              )}

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.acceptPdpa}
                  onChange={(e) => handleInputChange('acceptPdpa', e.target.checked)}
                  disabled={isLoading || googleLoading}
                  className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-600">
                  {t('acceptPrefix')}{' '}
                  <Link
                    href={privacyPath}
                    className="text-blue-600 hover:underline"
                    target="_blank"
                  >
                    {t('privacyLink')}
                  </Link>{' '}
                  <span className="text-red-500">*</span>
                </span>
              </label>
              {touched.acceptPdpa && formErrors.acceptPdpa && (
                <p className="text-sm text-red-500 ml-7">{formErrors.acceptPdpa}</p>
              )}
            </div>

            {/* Submit Button */}
            <Button type="submit" disabled={isLoading || googleLoading} className="w-full mt-6">
              {isLoading ? t('submitting') : t('submit')}
            </Button>
          </form>

          {/* Login Link */}
          <p className="mt-6 text-center text-sm text-gray-600">
            {t('haveAccount')}{' '}
            <Link href={loginPath} className="text-blue-600 hover:underline">
              {t('loginLink')}
            </Link>
          </p>
        </Card>

        {/* Trial Info */}
        <div className="mt-6 text-center text-sm text-gray-500">
          {isTrial ? (
            <>
              <p className="font-medium text-green-700">
                บัญชีทดลองใช้ฟรี 14 วัน จะเริ่มต้นหลังสมัคร
              </p>
              <p className="mt-1">ไม่ต้องใช้บัตรเครดิต ยกเลิกได้ตลอดเวลา</p>
              <p className="mt-2 text-gray-600">
                <strong>หลังจากทดลองใช้:</strong> ฟรี 5 leads/เดือน
                หรืออัปเกรดเพื่อรับฟีเจอร์เต็มรูปแบบ
              </p>
              <p className="mt-1 text-xs text-gray-400">
                หมายเหตุ: ระบบจะ<strong>ไม่</strong>เรียกเก็บเงินอัตโนมัติ
                คุณต้องเลือกแพ็กเกจด้วยตนเอง
              </p>
            </>
          ) : (
            <>
              <p>{t('trialHeadline')}</p>
              <p className="mt-1">{t('trialDetail')}</p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
