'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock3,
  FileText,
  Loader2,
  Mail,
  RefreshCw,
  Sparkles,
  XCircle,
} from 'lucide-react'
import { useGA4 } from '@/hooks/useGA4'
import { useTranslations } from 'next-intl'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
const STATUS_POLL_INTERVAL_MS = 5000

type CheckoutLifecycleStatus =
  | 'loading'
  | 'pending'
  | 'processing'
  | 'successful'
  | 'failed'
  | 'expired'
  | 'error'

interface PublicCheckoutStatus {
  charge_id: string
  status: Exclude<CheckoutLifecycleStatus, 'loading' | 'error'>
  provider_status: string
  is_final: boolean
  invoice_recorded: boolean
  amount_thb: number
  currency: string
  source_type?: string | null
  description?: string | null
  paid_at?: string | null
}

function ConfettiEffect() {
  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden" aria-hidden="true">
      {Array.from({ length: 30 }).map((_, i) => (
        <div
          key={i}
          className="absolute animate-confetti"
          style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 2}s`,
            animationDuration: `${2 + Math.random() * 3}s`,
          }}
        >
          <div
            className="h-2.5 w-2.5 rounded-sm"
            style={{
              backgroundColor: ['#f97316', '#22c55e', '#3b82f6', '#eab308', '#ec4899', '#8b5cf6'][
                Math.floor(Math.random() * 6)
              ],
              transform: `rotate(${Math.random() * 360}deg)`,
            }}
          />
        </div>
      ))}

      <style>{`
        @keyframes confetti-fall {
          0% {
            transform: translateY(-10vh) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(110vh) rotate(720deg);
            opacity: 0;
          }
        }
        .animate-confetti {
          animation: confetti-fall linear forwards;
        }
      `}</style>
    </div>
  )
}

function formatSourceType(
  sourceType: string | null | undefined,
  t: ReturnType<typeof useTranslations>
) {
  switch (sourceType) {
    case 'promptpay':
      return t('sourcePromptPay')
    case 'credit_card':
      return t('sourceCreditCard')
    case 'internet_banking_scb':
      return 'SCB'
    case 'internet_banking_kbank':
      return 'KBANK'
    case 'internet_banking_bbl':
      return 'BBL'
    default:
      return t('sourceUnknown')
  }
}

export default function CheckoutSuccessPage() {
  const t = useTranslations('checkoutSuccess')
  const searchParams = useSearchParams()
  const chargeId = searchParams.get('charge_id') ?? searchParams.get('session_id')
  const { trackPurchase } = useGA4()

  const [statusData, setStatusData] = useState<PublicCheckoutStatus | null>(null)
  const [statusError, setStatusError] = useState('')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const purchaseTrackedRef = useRef(false)

  const currentStatus: CheckoutLifecycleStatus = useMemo(() => {
    if (!chargeId) {
      return 'error'
    }
    if (statusError && !statusData) {
      return 'error'
    }
    return statusData?.status ?? 'loading'
  }, [chargeId, statusData, statusError])

  const refreshStatus = useCallback(async () => {
    if (!chargeId) {
      setStatusError(t('missingReference'))
      return
    }

    setIsRefreshing(true)
    setStatusError('')

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/billing/public-checkout-status?charge_id=${encodeURIComponent(chargeId)}`,
        {
          method: 'GET',
          credentials: 'include',
          headers: {
            Accept: 'application/json',
          },
        }
      )

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data = (await response.json()) as PublicCheckoutStatus
      setStatusData(data)
    } catch (error) {
      setStatusError(error instanceof Error ? error.message : t('statusUnavailable'))
    } finally {
      setIsRefreshing(false)
    }
  }, [chargeId, t])

  useEffect(() => {
    void refreshStatus()
  }, [refreshStatus])

  useEffect(() => {
    if (!chargeId || !['pending', 'processing', 'loading'].includes(currentStatus)) {
      return
    }

    const intervalId = window.setInterval(() => {
      void refreshStatus()
    }, STATUS_POLL_INTERVAL_MS)

    return () => window.clearInterval(intervalId)
  }, [chargeId, currentStatus, refreshStatus])

  useEffect(() => {
    if (!statusData || statusData.status !== 'successful' || purchaseTrackedRef.current) {
      return
    }

    const planId = searchParams.get('plan_id') || localStorage.getItem('checkout_plan_id')
    const planName = searchParams.get('plan_name') || localStorage.getItem('checkout_plan_name')
    const planType = (searchParams.get('plan_type') as 'monthly' | 'annual') || 'monthly'
    const amount = statusData.amount_thb
    const currency = statusData.currency || 'THB'

    if (amount > 0) {
      trackPurchase({
        transaction_id: statusData.charge_id,
        value: amount,
        currency,
        plan_id: planId || undefined,
        plan_name: planName || undefined,
        plan_type: planType,
        items: planId
          ? [
              {
                item_id: planId,
                item_name: planName || 'Subscription Plan',
                item_category: 'subscription',
                price: amount,
                quantity: 1,
              },
            ]
          : undefined,
      })
    }

    purchaseTrackedRef.current = true
    localStorage.removeItem('checkout_plan_id')
    localStorage.removeItem('checkout_plan_name')
    localStorage.removeItem('checkout_amount')
  }, [searchParams, statusData, trackPurchase])

  const viewModel = useMemo(() => {
    switch (currentStatus) {
      case 'successful':
        return {
          title: t('title'),
          subtitle: t('thankYou'),
          description: t('accountReady'),
          icon: CheckCircle2,
          iconClassName: 'text-green-500 dark:text-green-400',
          iconSurfaceClassName: 'bg-green-500/10 dark:bg-green-900/30',
          titleClassName: 'text-[var(--brand-text)] dark:text-white',
        }
      case 'pending':
        return {
          title: t('pendingTitle'),
          subtitle: t('pendingSubtitle'),
          description: t('pendingDesc'),
          icon: Clock3,
          iconClassName: 'text-amber-500 dark:text-amber-300',
          iconSurfaceClassName: 'bg-amber-500/10 dark:bg-amber-900/30',
          titleClassName: 'text-[var(--brand-text)] dark:text-white',
        }
      case 'processing':
        return {
          title: t('processingTitle'),
          subtitle: t('processingSubtitle'),
          description: t('processingDesc'),
          icon: Loader2,
          iconClassName: 'text-sky-500 dark:text-sky-300 animate-spin',
          iconSurfaceClassName: 'bg-sky-500/10 dark:bg-sky-900/30',
          titleClassName: 'text-[var(--brand-text)] dark:text-white',
        }
      case 'failed':
        return {
          title: t('failedTitle'),
          subtitle: t('failedSubtitle'),
          description: t('failedDesc'),
          icon: XCircle,
          iconClassName: 'text-rose-500 dark:text-rose-300',
          iconSurfaceClassName: 'bg-rose-500/10 dark:bg-rose-900/30',
          titleClassName: 'text-[var(--brand-text)] dark:text-white',
        }
      case 'expired':
        return {
          title: t('expiredTitle'),
          subtitle: t('expiredSubtitle'),
          description: t('expiredDesc'),
          icon: AlertTriangle,
          iconClassName: 'text-slate-500 dark:text-slate-300',
          iconSurfaceClassName: 'bg-slate-500/10 dark:bg-slate-900/30',
          titleClassName: 'text-[var(--brand-text)] dark:text-white',
        }
      case 'error':
        return {
          title: t('errorTitle'),
          subtitle: t('errorSubtitle'),
          description: statusError || t('errorDesc'),
          icon: AlertTriangle,
          iconClassName: 'text-rose-500 dark:text-rose-300',
          iconSurfaceClassName: 'bg-rose-500/10 dark:bg-rose-900/30',
          titleClassName: 'text-[var(--brand-text)] dark:text-white',
        }
      default:
        return {
          title: t('loadingTitle'),
          subtitle: t('loadingSubtitle'),
          description: t('loadingDesc'),
          icon: Loader2,
          iconClassName: 'text-sky-500 dark:text-sky-300 animate-spin',
          iconSurfaceClassName: 'bg-sky-500/10 dark:bg-sky-900/30',
          titleClassName: 'text-[var(--brand-text)] dark:text-white',
        }
    }
  }, [currentStatus, statusError, t])

  const StatusIcon = viewModel.icon
  const showConfetti = currentStatus === 'successful'
  const amountLabel = statusData
    ? `${statusData.amount_thb.toLocaleString('th-TH', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })} ${statusData.currency}`
    : '-'
  const syncLabel = statusData?.invoice_recorded ? t('syncComplete') : t('syncPending')

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-green-50 to-white dark:from-gray-900 dark:to-gray-950 flex items-center justify-center px-4 py-16">
      {showConfetti && <ConfettiEffect />}

      <div className="w-full max-w-2xl text-center">
        <div className="relative mx-auto mb-8 flex h-24 w-24 items-center justify-center">
          <div
            className={`absolute inset-0 rounded-full ${viewModel.iconSurfaceClassName} opacity-25`}
          />
          <div
            className={`relative flex h-24 w-24 items-center justify-center rounded-full ${viewModel.iconSurfaceClassName}`}
          >
            <StatusIcon className={`h-14 w-14 ${viewModel.iconClassName}`} />
          </div>
        </div>

        <h1 className={`mb-3 text-3xl font-extrabold sm:text-4xl ${viewModel.titleClassName}`}>
          {viewModel.title}
        </h1>
        <p className="mb-2 text-lg text-[var(--brand-text-secondary)] dark:text-[var(--brand-text-secondary)]">
          {viewModel.subtitle}
        </p>
        <p className="mb-8 text-sm text-[var(--brand-text-secondary)] dark:text-[var(--brand-text-secondary)]">
          {viewModel.description}
        </p>

        <div className="mb-6 grid gap-3 rounded-2xl border border-[var(--brand-border)] bg-[var(--brand-surface)] p-6 text-left shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--brand-text-secondary)] dark:text-[var(--brand-text-secondary)]">
              {t('referenceId')}
            </p>
            <p className="mt-1 break-all text-sm font-medium text-[var(--brand-text)] dark:text-white">
              {statusData?.charge_id || chargeId || '-'}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--brand-text-secondary)] dark:text-[var(--brand-text-secondary)]">
              {t('amountLabel')}
            </p>
            <p className="mt-1 text-sm font-medium text-[var(--brand-text)] dark:text-white">
              {amountLabel}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--brand-text-secondary)] dark:text-[var(--brand-text-secondary)]">
              {t('paymentMethodLabel')}
            </p>
            <p className="mt-1 text-sm font-medium text-[var(--brand-text)] dark:text-white">
              {formatSourceType(statusData?.source_type, t)}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--brand-text-secondary)] dark:text-[var(--brand-text-secondary)]">
              {t('providerStatusLabel')}
            </p>
            <p className="mt-1 text-sm font-medium text-[var(--brand-text)] dark:text-white">
              {statusData?.provider_status || t('statusUnavailable')}
            </p>
          </div>
          <div className="sm:col-span-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--brand-text-secondary)] dark:text-[var(--brand-text-secondary)]">
              {t('syncStatusLabel')}
            </p>
            <p className="mt-1 text-sm font-medium text-[var(--brand-text)] dark:text-white">
              {syncLabel}
            </p>
          </div>
        </div>

        <div className="mb-8 rounded-2xl border border-[var(--brand-border)] bg-[var(--brand-surface)] p-6 text-left shadow-sm dark:border-gray-700 dark:bg-gray-800">
          {currentStatus === 'successful' && (
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Mail className="mt-0.5 h-5 w-5 shrink-0 text-primary-500" />
                <div>
                  <p className="text-sm font-medium text-[var(--brand-text)] dark:text-white">
                    {t('receiptTitle')}
                  </p>
                  <p className="text-sm text-[var(--brand-text-secondary)] dark:text-[var(--brand-text-secondary)]">
                    {t('receiptDesc')}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <FileText className="mt-0.5 h-5 w-5 shrink-0 text-primary-500" />
                <div>
                  <p className="text-sm font-medium text-[var(--brand-text)] dark:text-white">
                    {t('manageTitle')}
                  </p>
                  <p className="text-sm text-[var(--brand-text-secondary)] dark:text-[var(--brand-text-secondary)]">
                    {t('manageDesc')}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-primary-500" />
                <div>
                  <p className="text-sm font-medium text-[var(--brand-text)] dark:text-white">
                    {t('startTitle')}
                  </p>
                  <p className="text-sm text-[var(--brand-text-secondary)] dark:text-[var(--brand-text-secondary)]">
                    {t('startDesc')}
                  </p>
                </div>
              </div>
            </div>
          )}

          {currentStatus === 'pending' && (
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Clock3 className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
                <div>
                  <p className="text-sm font-medium text-[var(--brand-text)] dark:text-white">
                    {t('pendingHintTitle')}
                  </p>
                  <p className="text-sm text-[var(--brand-text-secondary)] dark:text-[var(--brand-text-secondary)]">
                    {t('pendingHintDesc')}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <RefreshCw className="mt-0.5 h-5 w-5 shrink-0 text-primary-500" />
                <div>
                  <p className="text-sm font-medium text-[var(--brand-text)] dark:text-white">
                    {t('autoRefreshTitle')}
                  </p>
                  <p className="text-sm text-[var(--brand-text-secondary)] dark:text-[var(--brand-text-secondary)]">
                    {t('autoRefreshDesc')}
                  </p>
                </div>
              </div>
            </div>
          )}

          {currentStatus === 'processing' && (
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Loader2 className="mt-0.5 h-5 w-5 shrink-0 animate-spin text-sky-500" />
                <div>
                  <p className="text-sm font-medium text-[var(--brand-text)] dark:text-white">
                    {t('processingHintTitle')}
                  </p>
                  <p className="text-sm text-[var(--brand-text-secondary)] dark:text-[var(--brand-text-secondary)]">
                    {t('processingHintDesc')}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <FileText className="mt-0.5 h-5 w-5 shrink-0 text-primary-500" />
                <div>
                  <p className="text-sm font-medium text-[var(--brand-text)] dark:text-white">
                    {t('syncTitle')}
                  </p>
                  <p className="text-sm text-[var(--brand-text-secondary)] dark:text-[var(--brand-text-secondary)]">
                    {t('syncDesc')}
                  </p>
                </div>
              </div>
            </div>
          )}

          {['failed', 'expired', 'error', 'loading'].includes(currentStatus) && (
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
                <div>
                  <p className="text-sm font-medium text-[var(--brand-text)] dark:text-white">
                    {t('manualCheckTitle')}
                  </p>
                  <p className="text-sm text-[var(--brand-text-secondary)] dark:text-[var(--brand-text-secondary)]">
                    {t('manualCheckDesc')}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          {currentStatus === 'successful' && (
            <>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary-600 to-amber-500 px-8 py-4 text-base font-bold text-white shadow-lg transition-all hover:shadow-xl"
              >
                {t('startUsing')}
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="/billing"
                className="inline-flex items-center gap-2 rounded-xl border-2 border-[var(--brand-border)] px-6 py-4 text-sm font-semibold text-[var(--brand-text)] transition-colors hover:bg-[var(--brand-primary-light)] dark:border-gray-700 dark:text-[var(--brand-text-secondary)] dark:hover:bg-gray-800"
              >
                {t('viewDetails')}
              </Link>
            </>
          )}

          {['pending', 'processing', 'loading', 'error'].includes(currentStatus) && (
            <>
              <button
                type="button"
                onClick={() => void refreshStatus()}
                disabled={isRefreshing}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary-600 to-amber-500 px-8 py-4 text-base font-bold text-white shadow-lg transition-all hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isRefreshing ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <RefreshCw className="h-5 w-5" />
                )}
                {t('refreshStatus')}
              </button>
              <Link
                href="/billing"
                className="inline-flex items-center gap-2 rounded-xl border-2 border-[var(--brand-border)] px-6 py-4 text-sm font-semibold text-[var(--brand-text)] transition-colors hover:bg-[var(--brand-primary-light)] dark:border-gray-700 dark:text-[var(--brand-text-secondary)] dark:hover:bg-gray-800"
              >
                {t('viewDetails')}
              </Link>
            </>
          )}

          {['failed', 'expired'].includes(currentStatus) && (
            <>
              <Link
                href="/pricing-plans"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary-600 to-amber-500 px-8 py-4 text-base font-bold text-white shadow-lg transition-all hover:shadow-xl"
              >
                {t('retryCheckout')}
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="/billing"
                className="inline-flex items-center gap-2 rounded-xl border-2 border-[var(--brand-border)] px-6 py-4 text-sm font-semibold text-[var(--brand-text)] transition-colors hover:bg-[var(--brand-primary-light)] dark:border-gray-700 dark:text-[var(--brand-text-secondary)] dark:hover:bg-gray-800"
              >
                {t('viewDetails')}
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
