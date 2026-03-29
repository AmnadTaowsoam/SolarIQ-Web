'use client'

/**
 * Subscription Card Component (WK-017)
 * Displays current subscription details with status badge and action buttons
 */

import React from 'react'
import { CalendarDays, CreditCard, RefreshCw, XCircle, ArrowRightCircle } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Card, CardHeader, CardBody, CardFooter } from '@/components/ui/Card'
import { Badge, type BadgeProps } from '@/components/ui/Badge'
import {
  type SubscriptionWithPlan,
  type SubscriptionStatus,
  formatPrice,
  getStatusText,
} from '@/types/billing'
import { useResumeSubscription } from '@/hooks/useBilling'

// ============== Props ==============

interface SubscriptionCardProps {
  subscription: SubscriptionWithPlan
  onCancel: () => void
  onManagePayment: () => void
  onChangePlan?: () => void
  isProcessing?: boolean
}

// ============== Helpers ==============

function getStatusBadgeVariant(status: SubscriptionStatus): BadgeProps['variant'] {
  switch (status) {
    case 'active':
      return 'success'
    case 'trialing':
      return 'info'
    case 'past_due':
      return 'warning'
    case 'canceled':
      return 'danger'
    case 'incomplete':
    case 'unpaid':
      return 'warning'
    default:
      return 'default'
  }
}

function formatDateThai(dateString: string): string {
  return new Date(dateString).toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

// ============== Component ==============

export function SubscriptionCard({
  subscription,
  onCancel,
  onManagePayment,
  onChangePlan,
  isProcessing = false,
}: SubscriptionCardProps) {
  const t = useTranslations('subscriptionCard')
  const resumeMutation = useResumeSubscription()

  const isCanceled = subscription.status === 'canceled' || subscription.cancel_at_period_end
  const isActive = subscription.status === 'active'
  const isTrialing = subscription.status === 'trialing'

  const handleResume = async () => {
    try {
      await resumeMutation.mutateAsync()
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to resume subscription:', error)
    }
  }

  const isResuming = resumeMutation.isPending
  const disabled = isProcessing || isResuming

  return (
    <Card>
      <CardHeader
        title={t('currentPlan')}
        subtitle={t('subtitle')}
        action={
          <Badge variant={getStatusBadgeVariant(subscription.status)} size="md">
            {getStatusText(subscription.status)}
          </Badge>
        }
      />

      <CardBody>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Plan Name */}
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-[var(--brand-text-secondary)]">{t('planName')}</p>
              <p className="text-base font-semibold text-[var(--brand-text)]">
                {subscription.plan.name}
              </p>
              <p className="text-sm text-[var(--brand-text-secondary)]">
                {formatPrice(subscription.plan.price_thb)}/{t('perMonth')}
              </p>
            </div>
          </div>

          {/* Current Period */}
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
              <CalendarDays className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-[var(--brand-text-secondary)]">{t('currentPeriod')}</p>
              <p className="text-sm font-medium text-[var(--brand-text)]">
                {formatDateThai(subscription.current_period_start)}
              </p>
              <p className="text-sm text-[var(--brand-text-secondary)]">
                {t('to')} {formatDateThai(subscription.current_period_end)}
              </p>
            </div>
          </div>

          {/* Next Renewal */}
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
              <RefreshCw className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-[var(--brand-text-secondary)]">{t('renewsOn')}</p>
              {subscription.cancel_at_period_end ? (
                <p className="text-sm font-medium text-red-600">{t('endsAtPeriod')}</p>
              ) : (
                <p className="text-sm font-medium text-[var(--brand-text)]">
                  {formatDateThai(subscription.current_period_end)}
                </p>
              )}
              <p className="text-sm text-[var(--brand-text-secondary)]">
                {t('daysLeft', { days: subscription.days_until_period_end })}
              </p>
            </div>
          </div>

          {/* Trial End (if applicable) */}
          {isTrialing && subscription.trial_end && (
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 bg-yellow-500/10 rounded-lg flex items-center justify-center">
                <CalendarDays className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-[var(--brand-text-secondary)]">{t('trialEndsOn')}</p>
                <p className="text-sm font-medium text-[var(--brand-text)]">
                  {formatDateThai(subscription.trial_end)}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Cancel warning banner */}
        {subscription.cancel_at_period_end && (
          <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <p className="text-sm text-yellow-600">
              {t('cancelledWarning', { date: formatDateThai(subscription.current_period_end) })}
            </p>
          </div>
        )}
      </CardBody>

      <CardFooter>
        <div className="flex flex-wrap gap-3">
          {/* Change Plan button */}
          {onChangePlan && (isActive || isTrialing) && (
            <button
              onClick={onChangePlan}
              disabled={disabled}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowRightCircle className="w-4 h-4" />
              {t('changePlan')}
            </button>
          )}

          {/* Resume button (if canceled but still in period) */}
          {isCanceled && subscription.cancel_at_period_end && (
            <button
              onClick={handleResume}
              disabled={disabled}
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-4 h-4 ${isResuming ? 'animate-spin' : ''}`} />
              {isResuming ? t('resuming') : t('resume')}
            </button>
          )}

          {/* Manage Payment button */}
          <button
            onClick={onManagePayment}
            disabled={disabled}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--brand-surface)] text-[var(--brand-text)] text-sm font-medium rounded-lg border border-[var(--brand-border)] hover:bg-[var(--brand-primary-light)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CreditCard className="w-4 h-4" />
            {t('manage')}
          </button>

          {/* Cancel button (only if active/trialing and not already canceling) */}
          {(isActive || isTrialing) && !subscription.cancel_at_period_end && (
            <button
              onClick={onCancel}
              disabled={disabled}
              className="inline-flex items-center gap-2 px-4 py-2 text-red-600 text-sm font-medium rounded-lg border border-red-500/20 hover:bg-red-500/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <XCircle className="w-4 h-4" />
              {t('cancel')}
            </button>
          )}
        </div>
      </CardFooter>
    </Card>
  )
}

export default SubscriptionCard
