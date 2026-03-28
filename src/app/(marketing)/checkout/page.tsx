'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Check,
  Shield,
  Lock,
  CreditCard,
  Tag,
  Loader2,
  Zap,
  Rocket,
  Building2,
  Gift,
  QrCode,
  RefreshCw,
  X,
  Landmark,
} from 'lucide-react'
import { api } from '@/lib/api'
import { API_ENDPOINTS } from '@/lib/constants'
import type { OpnSourceType, CheckoutResponse } from '@/types/billing'
import { useTranslations } from 'next-intl'

/* ------------------------------------------------------------------ */
/*  Plan Data                                                          */
/* ------------------------------------------------------------------ */
type PlanId = 'trial' | 'starter' | 'professional' | 'enterprise'
type BillingCycle = 'monthly' | 'annual'

interface PlanRaw {
  id: PlanId
  nameKey: string
  subtitleKey: string
  icon: React.ElementType
  monthlyPrice: number
  annualPrice: number
  featureKeys: string[]
}

interface PlanInfo {
  id: PlanId
  name: string
  subtitle: string
  icon: React.ElementType
  monthlyPrice: number
  annualPrice: number
  features: string[]
}

const PLANS: Record<string, PlanRaw> = {
  trial: {
    id: 'trial',
    nameKey: 'trialFree',
    subtitleKey: 'planStarterSubtitle',
    icon: Gift,
    monthlyPrice: 0,
    annualPrice: 0,
    featureKeys: ['trialFeature1', 'trialFeature2', 'trialFeature3', 'trialFeature4'],
  },
  starter: {
    id: 'starter',
    nameKey: 'planStarter',
    subtitleKey: 'planStarterSubtitle',
    icon: Zap,
    monthlyPrice: 2900,
    annualPrice: 2320,
    featureKeys: [
      'starterFeature1',
      'starterFeature2',
      'starterFeature3',
      'starterFeature4',
      'starterFeature5',
      'starterFeature6',
    ],
  },
  professional: {
    id: 'professional',
    nameKey: 'planPro',
    subtitleKey: 'planProfessionalSubtitle',
    icon: Rocket,
    monthlyPrice: 7900,
    annualPrice: 6320,
    featureKeys: [
      'proFeature1',
      'proFeature2',
      'proFeature3',
      'proFeature4',
      'proFeature5',
      'proFeature6',
      'proFeature7',
      'proFeature8',
      'proFeature9',
      'proFeature10',
    ],
  },
  enterprise: {
    id: 'enterprise',
    nameKey: 'planEnterprise',
    subtitleKey: 'planEnterpriseSubtitle',
    icon: Building2,
    monthlyPrice: 15000,
    annualPrice: 12000,
    featureKeys: [
      'entFeature1',
      'entFeature2',
      'entFeature3',
      'entFeature4',
      'entFeature5',
      'entFeature6',
      'entFeature7',
      'entFeature8',
    ],
  },
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
export default function CheckoutPage() {
  const t = useTranslations('checkout')
  const searchParams = useSearchParams()
  const router = useRouter()

  const planId = (searchParams.get('plan') ?? 'starter') as PlanId
  const initialBilling = (searchParams.get('billing') ?? 'monthly') as BillingCycle

  const [billing, setBilling] = useState<BillingCycle>(initialBilling)
  const [paymentMethod, setPaymentMethod] = useState<OpnSourceType>('credit_card')
  const [promoCode, setPromoCode] = useState('')
  const [promoApplied, setPromoApplied] = useState(false)
  const [promoError, setPromoError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [qrCodeUri, setQrCodeUri] = useState<string | null>(null)
  const [chargeId, setChargeId] = useState<string | null>(null)
  const [isPolling, setIsPolling] = useState(false)

  const PAYMENT_METHODS: { id: OpnSourceType; label: string; icon: React.ElementType }[] = [
    { id: 'credit_card', label: t('creditCard'), icon: CreditCard },
    { id: 'promptpay', label: t('promptpay'), icon: QrCode },
    { id: 'internet_banking_scb', label: 'SCB', icon: Landmark },
    { id: 'internet_banking_kbank', label: 'KBANK', icon: Landmark },
    { id: 'internet_banking_bbl', label: 'BBL', icon: Landmark },
  ]

  const rawPlan = PLANS[planId]
  const plan: PlanInfo | undefined = useMemo(
    () =>
      rawPlan
        ? {
            id: rawPlan.id,
            name: t(rawPlan.nameKey as Parameters<typeof t>[0]),
            subtitle: t(rawPlan.subtitleKey as Parameters<typeof t>[0]),
            icon: rawPlan.icon,
            monthlyPrice: rawPlan.monthlyPrice,
            annualPrice: rawPlan.annualPrice,
            features: rawPlan.featureKeys.map((k) => t(k as Parameters<typeof t>[0])),
          }
        : undefined,
    [rawPlan, t]
  )

  // Redirect trial to signup
  useEffect(() => {
    if (planId === 'trial') {
      router.replace('/signup?trial=true')
    }
  }, [planId, router])

  const price = useMemo(() => {
    if (!plan) {
      return 0
    }
    return billing === 'annual' ? plan.annualPrice : plan.monthlyPrice
  }, [plan, billing])

  const savings = useMemo(() => {
    if (!plan || billing !== 'annual') {
      return 0
    }
    return (plan.monthlyPrice - plan.annualPrice) * 12
  }, [plan, billing])

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) {
      return
    }
    setPromoError('')
    // Placeholder: validate promo code via API
    try {
      // await api.post('/api/v1/billing/validate-promo', { code: promoCode })
      setPromoApplied(true)
    } catch {
      setPromoError(t('promoInvalid'))
      setPromoApplied(false)
    }
  }

  const handleCheckPaymentStatus = useCallback(async () => {
    if (!chargeId) {
      return
    }
    setIsPolling(true)
    try {
      const statusResponse = await api.get<{ status: string }>(
        `${API_ENDPOINTS.BILLING?.CREATE_CHECKOUT_SESSION ?? '/api/v1/billing/create-checkout-session'}/${chargeId}/status`
      )
      if ((statusResponse as unknown as { status: string }).status === 'successful') {
        window.location.href = `${window.location.origin}/checkout/success?charge_id=${chargeId}`
      }
    } catch {
      // Silently ignore polling errors
    } finally {
      setIsPolling(false)
    }
  }, [chargeId])

  const handleCheckout = async () => {
    setIsLoading(true)
    setError('')
    setQrCodeUri(null)
    setChargeId(null)

    try {
      const response = await api.post<CheckoutResponse>(
        API_ENDPOINTS.BILLING?.CREATE_CHECKOUT_SESSION ?? '/api/v1/billing/create-checkout-session',
        {
          plan_id: planId,
          billing_cycle: billing,
          source_type: paymentMethod,
          return_uri: `${window.location.origin}/checkout/success`,
          promo_code: promoApplied ? promoCode : undefined,
        }
      )

      const data = response as unknown as Record<string, string>
      if (data.qr_code_uri) {
        // PromptPay: show QR code
        setQrCodeUri(data.qr_code_uri)
        setChargeId(data.charge_id ?? null)
      } else if (data.authorize_uri) {
        // Credit card / Internet banking: redirect
        window.location.href = data.authorize_uri
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('checkoutError'))
    } finally {
      setIsLoading(false)
    }
  }

  if (!plan || planId === 'trial') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
      </div>
    )
  }

  const Icon = plan.icon

  return (
    <div className="bg-gray-50 dark:bg-gray-950 min-h-[calc(100vh-4rem)]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        {/* Back link */}
        <Link
          href="/pricing-plans"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-primary-600 transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('back')}
        </Link>

        <div className="grid gap-8 lg:grid-cols-5">
          {/* -------------------------------------------------------- */}
          {/*  Left: Order Summary                                      */}
          {/* -------------------------------------------------------- */}
          <div className="lg:col-span-2 order-2 lg:order-1">
            <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 lg:p-8 shadow-sm sticky top-24">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
                {t('summary')}
              </h2>

              {/* Plan card */}
              <div className="flex items-start gap-4 mb-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary-50 to-amber-50 dark:from-primary-900/30 dark:to-amber-900/30">
                  <Icon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{plan.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{plan.subtitle}</p>
                </div>
              </div>

              {/* Features */}
              <ul className="space-y-2.5 mb-6">
                {plan.features.map((feature, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-gray-300"
                  >
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary-500" />
                    {feature}
                  </li>
                ))}
              </ul>

              <hr className="border-gray-200 dark:border-gray-700 my-6" />

              {/* Pricing breakdown */}
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    {t('summary')} {plan.name} ({billing === 'annual' ? t('annual') : t('monthly')})
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    ฿{price.toLocaleString('th-TH')}
                  </span>
                </div>

                {billing === 'annual' && savings > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>{t('annualDiscount')}</span>
                    <span className="font-medium">
                      {t('savingsAmount', { amount: savings.toLocaleString('th-TH') })}
                    </span>
                  </div>
                )}

                {promoApplied && (
                  <div className="flex justify-between text-green-600">
                    <span>
                      {t('promoLabel')} ({promoCode})
                    </span>
                    <span className="font-medium">{t('promoApplied')}</span>
                  </div>
                )}

                <hr className="border-gray-200 dark:border-gray-700" />

                <div className="flex justify-between text-base font-bold">
                  <span className="text-gray-900 dark:text-white">{t('total')}</span>
                  <span className="text-gray-900 dark:text-white">
                    {t('pricePerMonth', { price: price.toLocaleString('th-TH') })}
                  </span>
                </div>

                {billing === 'annual' && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t('billedAnnually', { amount: (price * 12).toLocaleString('th-TH') })}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* -------------------------------------------------------- */}
          {/*  Right: Checkout Form                                     */}
          {/* -------------------------------------------------------- */}
          <div className="lg:col-span-3 order-1 lg:order-2">
            <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 lg:p-8 shadow-sm">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t('pay')}</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">{t('paySubtitle')}</p>

              {/* Billing toggle */}
              <div className="mb-8">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">
                  {t('billingCycle')}
                </label>
                <div className="inline-flex rounded-xl bg-gray-100 dark:bg-gray-700 p-1">
                  <button
                    onClick={() => setBilling('monthly')}
                    className={`rounded-lg px-5 py-2.5 text-sm font-semibold transition-all ${
                      billing === 'monthly'
                        ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
                    }`}
                  >
                    {t('monthly')}
                  </button>
                  <button
                    onClick={() => setBilling('annual')}
                    className={`rounded-lg px-5 py-2.5 text-sm font-semibold transition-all ${
                      billing === 'annual'
                        ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
                    }`}
                  >
                    {t('annual')}
                    <span className="ml-2 inline-block rounded-full bg-green-500 px-2 py-0.5 text-xs text-white">
                      -20%
                    </span>
                  </button>
                </div>
              </div>

              {/* Promo code */}
              <div className="mb-8">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">
                  {t('promoCodeLabel')}
                </label>
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(e) => {
                        setPromoCode(e.target.value.toUpperCase())
                        setPromoApplied(false)
                        setPromoError('')
                      }}
                      placeholder={t('promoCodePlaceholder')}
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2.5 pl-10 pr-4 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
                    />
                  </div>
                  <button
                    onClick={handleApplyPromo}
                    disabled={!promoCode.trim() || promoApplied}
                    className="rounded-lg border border-gray-300 dark:border-gray-600 px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {promoApplied ? t('promoApplied') : t('applyCode')}
                  </button>
                </div>
                {promoError && <p className="mt-2 text-sm text-red-500">{promoError}</p>}
                {promoApplied && <p className="mt-2 text-sm text-green-600">{t('promoSuccess')}</p>}
              </div>

              {/* Payment method selector */}
              <div className="mb-8">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">
                  {t('paymentMethod')}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {PAYMENT_METHODS.map((method) => {
                    const MethodIcon = method.icon
                    return (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() => setPaymentMethod(method.id)}
                        className={`flex items-center gap-2.5 rounded-xl border-2 px-4 py-3 text-sm font-medium transition-all ${
                          paymentMethod === method.id
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 shadow-sm'
                            : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                      >
                        <MethodIcon className="h-4 w-4 shrink-0" />
                        <span className="truncate">{method.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Error message */}
              {error && (
                <div className="mb-6 rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800 p-4 text-sm text-red-600 dark:text-red-400">
                  {error}
                </div>
              )}

              {/* PromptPay QR Code Display */}
              {qrCodeUri && (
                <div className="mb-6 rounded-2xl border-2 border-primary-200 dark:border-primary-700 bg-white dark:bg-gray-800 p-6 text-center shadow-md">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <QrCode className="h-5 w-5 text-primary-500" />
                      {t('promptpay')}
                    </h3>
                    <button
                      onClick={() => {
                        setQrCodeUri(null)
                        setChargeId(null)
                      }}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="mx-auto mb-4 inline-block rounded-xl bg-white p-4 shadow-inner">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={qrCodeUri}
                      alt="PromptPay QR Code"
                      className="h-56 w-56 object-contain"
                    />
                  </div>

                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    {t('scanQrPromptpay')}
                  </p>

                  <button
                    onClick={handleCheckPaymentStatus}
                    disabled={isPolling}
                    className="inline-flex items-center gap-2 rounded-lg bg-primary-50 dark:bg-primary-900/20 px-4 py-2.5 text-sm font-medium text-primary-700 dark:text-primary-300 hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className={`h-4 w-4 ${isPolling ? 'animate-spin' : ''}`} />
                    {isPolling ? t('checkingStatus') : t('checkPaymentStatus')}
                  </button>
                </div>
              )}

              {/* Checkout button */}
              <button
                onClick={handleCheckout}
                disabled={isLoading}
                className="w-full rounded-xl bg-gradient-to-r from-primary-600 to-amber-500 py-4 text-base font-bold text-white shadow-lg hover:shadow-xl hover:from-primary-700 hover:to-amber-600 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    {t('processing')}
                  </>
                ) : (
                  <>
                    <CreditCard className="h-5 w-5" />
                    {t('pay')} {t('pricePerMonth', { price: price.toLocaleString('th-TH') })}
                  </>
                )}
              </button>

              <p className="mt-4 text-center text-xs text-gray-500 dark:text-gray-400">
                {t('securePayment')}
              </p>

              {/* Trust badges */}
              <div className="mt-8 grid grid-cols-3 gap-4">
                <div className="flex flex-col items-center gap-2 text-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-50 dark:bg-green-900/20">
                    <Shield className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">SSL Secure</span>
                </div>
                <div className="flex flex-col items-center gap-2 text-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-900/20">
                    <Lock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Secure Payment</span>
                </div>
                <div className="flex flex-col items-center gap-2 text-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-50 dark:bg-purple-900/20">
                    <CreditCard className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Opn Payments</span>
                </div>
              </div>

              {/* Payment method logos */}
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-gray-400">
                <span className="text-xs font-medium">{t('supportedMethods')}</span>
                <span className="text-xs">Visa</span>
                <span className="text-xs">Mastercard</span>
                <span className="text-xs">JCB</span>
                <span className="text-xs">{t('promptpay')}</span>
                <span className="text-xs">SCB</span>
                <span className="text-xs">KBANK</span>
                <span className="text-xs">BBL</span>
              </div>

              {/* Policy info */}
              <div className="mt-8 rounded-lg bg-gray-50 dark:bg-gray-700/50 p-4 text-xs text-gray-500 dark:text-gray-400 space-y-1">
                <p>{t('cancelPolicy')}</p>
                <p>{t('cancelKeepAccess')}</p>
                <p>{t('receiptEmail')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
