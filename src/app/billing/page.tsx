'use client'

/**
 * Billing Page (WK-017)
 * Main billing management page for subscription, invoices, and usage
 */

import React, { useState } from 'react'
import { CreditCard, FileText, BarChart3, Settings, ExternalLink } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { AppLayout } from '@/components/layout'
import { useAuth } from '@/context'
import { PlanSelector } from '@/components/billing/PlanSelector'
import { UsageBar } from '@/components/billing/UsageBar'
import { InvoiceTable } from '@/components/billing/InvoiceTable'
import { SubscriptionCard } from '@/components/billing/SubscriptionCard'
import {
  useBillingStatus,
  usePlans,
  useInvoices,
  useUsage,
  useSubscribe,
  useUpdateSubscription,
  useCancelSubscription,
} from '@/hooks/useBilling'
import { type PlanType } from '@/types/billing'
import { useGA4 } from '@/hooks/useGA4'

type TabType = 'overview' | 'plans' | 'invoices' | 'usage'

export default function BillingPage() {
  const { user, isLoading: authLoading } = useAuth()
  const t = useTranslations('billingPage')
  const { trackUpgradeClick } = useGA4()
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const [isProcessing, setIsProcessing] = useState(false)
  const [billingNotice, setBillingNotice] = useState<string | null>(null)

  // Queries
  const { data: billingStatus, isLoading: isLoadingStatus, error: statusError } = useBillingStatus()
  usePlans()
  const {
    data: invoicesData,
    isLoading: isLoadingInvoices,
    error: invoicesError,
  } = useInvoices(1, 10)
  const { data: usageData, error: usageError } = useUsage()

  // Mutations
  const subscribeMutation = useSubscribe()
  const updateSubscriptionMutation = useUpdateSubscription()
  const cancelSubscriptionMutation = useCancelSubscription()

  const handleSelectPlan = async (planId: PlanType) => {
    setIsProcessing(true)
    setBillingNotice(null)
    try {
      // Track upgrade click event
      const currentPlan = billingStatus?.subscription?.plan_id
      if (currentPlan && currentPlan !== planId) {
        trackUpgradeClick({
          current_plan: currentPlan,
          target_plan: planId,
        })
      }

      if (billingStatus?.subscription) {
        // Update existing subscription
        await updateSubscriptionMutation.mutateAsync({ plan_id: planId })
      } else {
        // Create new subscription
        await subscribeMutation.mutateAsync({ plan_id: planId })
      }
    } catch (error) {
      void error // handled by mutation state
    } finally {
      setIsProcessing(false)
    }
  }

  const handleCancelSubscription = async () => {
    if (confirm(t('actions.cancelConfirm'))) {
      setIsProcessing(true)
      setBillingNotice(null)
      try {
        await cancelSubscriptionMutation.mutateAsync({})
      } catch (error) {
        void error // handled by mutation state
      } finally {
        setIsProcessing(false)
      }
    }
  }

  const handleOpenPortal = async () => {
    void Promise.resolve()
    setBillingNotice('Payment method self-service is not available in this deployment yet.')
  }

  if (authLoading || isLoadingStatus) {
    return (
      <div className="min-h-screen bg-[var(--brand-background)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const billingError = statusError || invoicesError || usageError

  const tabs = [
    { id: 'overview' as TabType, label: t('tabs.overview'), icon: CreditCard },
    { id: 'plans' as TabType, label: t('tabs.plans'), icon: Settings },
    { id: 'invoices' as TabType, label: t('tabs.invoices'), icon: FileText },
    { id: 'usage' as TabType, label: t('tabs.usage'), icon: BarChart3 },
  ]

  return (
    <AppLayout user={user}>
      <div className="max-w-7xl py-2">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[var(--brand-text)]">{t('title')}</h1>
          <p className="mt-2 text-[var(--brand-text-secondary)]">{t('subtitle')}</p>
        </div>

        {(billingError || billingNotice) && (
          <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {billingNotice ||
              'Some billing endpoints are unavailable. This page now shows live empty/setup states instead of misleading sample data.'}
          </div>
        )}

        {/* Tabs */}
        <div className="border-b border-[var(--brand-border)] mb-8">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-[var(--brand-text-secondary)] hover:text-[var(--brand-text)] hover:border-[var(--brand-border)]'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {!billingStatus && !usageData && (
              <div className="bg-[var(--brand-surface)] rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-[var(--brand-text)] mb-2">
                  Billing setup incomplete
                </h2>
                <p className="text-sm text-[var(--brand-text-secondary)]">
                  Subscription, usage, or organization data is not available yet. You can still
                  review plans below and complete billing setup once the backend endpoints are ready
                  for this account.
                </p>
              </div>
            )}

            {/* Subscription Card */}
            {billingStatus?.subscription && (
              <SubscriptionCard
                subscription={billingStatus.subscription}
                onCancel={handleCancelSubscription}
                onManagePayment={handleOpenPortal}
                isProcessing={isProcessing}
              />
            )}

            {/* Usage Summary */}
            {usageData && (
              <div className="bg-[var(--brand-surface)] rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-[var(--brand-text)] mb-4">
                  {t('usage.title')}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {usageData.usage.map((item, index) => (
                    <UsageBar
                      key={index}
                      label={item.resource_type.replace('_', ' ').toUpperCase()}
                      current={item.total_quantity}
                      limit={item.limit}
                      percentage={item.percentage_used}
                    />
                  ))}
                </div>
              </div>
            )}

            {!usageData && (
              <div className="bg-[var(--brand-surface)] rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-[var(--brand-text)] mb-2">
                  Usage data unavailable
                </h2>
                <p className="text-sm text-[var(--brand-text-secondary)]">
                  Resource usage will appear here after the billing usage endpoint is available for
                  this organization.
                </p>
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-[var(--brand-surface)] rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-[var(--brand-text)] mb-4">
                {t('quickActions.title')}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => {
                    // Track upgrade click when navigating to plans tab
                    const currentPlan = billingStatus?.subscription?.plan_id
                    if (currentPlan) {
                      trackUpgradeClick({
                        current_plan: currentPlan,
                        feature: 'change_plan',
                      })
                    }
                    setActiveTab('plans')
                  }}
                  className="flex items-center gap-3 p-4 border rounded-lg hover:bg-[var(--brand-background)] transition-colors"
                >
                  <Settings className="w-6 h-6 text-blue-600" />
                  <div className="text-left">
                    <div className="font-medium">{t('quickActions.changePlanTitle')}</div>
                    <div className="text-sm text-[var(--brand-text-secondary)]">
                      {t('quickActions.changePlanDescription')}
                    </div>
                  </div>
                </button>
                <button
                  onClick={handleOpenPortal}
                  className="flex items-center gap-3 p-4 border rounded-lg hover:bg-[var(--brand-background)] transition-colors"
                >
                  <CreditCard className="w-6 h-6 text-blue-600" />
                  <div className="text-left">
                    <div className="font-medium">{t('quickActions.managePaymentTitle')}</div>
                    <div className="text-sm text-[var(--brand-text-secondary)]">
                      {t('quickActions.managePaymentDescription')}
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-[var(--brand-text-secondary)] ml-auto" />
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'plans' && (
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-[var(--brand-text)]">{t('plans.title')}</h2>
              <p className="text-[var(--brand-text-secondary)] mt-1">{t('plans.subtitle')}</p>
            </div>
            <PlanSelector
              currentPlan={billingStatus?.subscription?.plan_id}
              onSelectPlan={handleSelectPlan}
              isLoading={isProcessing}
            />
          </div>
        )}

        {activeTab === 'invoices' && (
          <div className="bg-[var(--brand-surface)] rounded-lg shadow">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold text-[var(--brand-text)]">
                {t('invoices.title')}
              </h2>
              <p className="text-[var(--brand-text-secondary)] mt-1">{t('invoices.subtitle')}</p>
            </div>
            {isLoadingInvoices ? (
              <div className="p-6 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : invoicesError ? (
              <div className="p-6 text-sm text-[var(--brand-text-secondary)]">
                Invoice history is not available for this billing account yet.
              </div>
            ) : (
              <InvoiceTable invoices={invoicesData?.invoices ?? []} />
            )}
          </div>
        )}

        {activeTab === 'usage' && usageData && (
          <div className="space-y-6">
            <div className="bg-[var(--brand-surface)] rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-[var(--brand-text)] mb-2">
                {t('usage.detailsTitle')}
              </h2>
              <p className="text-[var(--brand-text-secondary)] mb-6">
                {t('usage.detailsSubtitle', {
                  start: new Date(usageData.period_start).toLocaleDateString(),
                  end: new Date(usageData.period_end).toLocaleDateString(),
                })}
              </p>
              <div className="space-y-6">
                {usageData.usage.map((item, index) => (
                  <div key={index} className="border-b pb-4 last:border-0">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-[var(--brand-text)]">
                        {item.resource_type.replace('_', ' ').toUpperCase()}
                      </span>
                      <span className="text-[var(--brand-text-secondary)]">
                        {item.total_quantity} / {item.limit ?? '∞'}
                      </span>
                    </div>
                    <UsageBar
                      label=""
                      current={item.total_quantity}
                      limit={item.limit}
                      percentage={item.percentage_used}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'usage' && !usageData && (
          <div className="bg-[var(--brand-surface)] rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-[var(--brand-text)] mb-2">
              Usage details unavailable
            </h2>
            <p className="text-sm text-[var(--brand-text-secondary)]">
              This organization does not currently return billing usage data.
            </p>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
