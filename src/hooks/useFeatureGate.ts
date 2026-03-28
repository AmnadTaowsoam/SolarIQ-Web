'use client'

import { useBillingStatus } from '@/hooks/useBilling'

// Features available per plan
const PLAN_FEATURES: Record<string, string[]> = {
  starter: ['ai_analysis', 'pdf_proposal', 'basic_dashboard', 'email_support'],
  pro: [
    'ai_analysis',
    'pdf_proposal',
    'full_dashboard',
    'export_csv',
    'api_access',
    'priority_support',
  ],
  enterprise: [
    'ai_analysis',
    'pdf_proposal',
    'full_dashboard',
    'export_csv',
    'api_access',
    'dedicated_support',
    'custom_branding',
  ],
}

export function useFeatureGate() {
  const { data: status, isLoading } = useBillingStatus()

  const planId = status?.subscription?.plan_id || 'starter'
  const subscriptionStatus = status?.subscription?.status || null

  const canAccess = (feature: string): boolean => {
    if (!status?.subscription) {
      return false
    }
    if (subscriptionStatus === 'canceled') {
      return false
    }
    const features = PLAN_FEATURES[planId] || PLAN_FEATURES.starter
    return features.includes(feature)
  }

  const isTrialing = subscriptionStatus === 'trialing'
  const isActive = ['active', 'trialing'].includes(subscriptionStatus || '')
  const isPastDue = subscriptionStatus === 'past_due'
  const isCanceled = subscriptionStatus === 'canceled'

  return {
    canAccess,
    isTrialing,
    isActive,
    isPastDue,
    isCanceled,
    isLoading,
    plan: planId,
    subscriptionStatus,
  }
}
