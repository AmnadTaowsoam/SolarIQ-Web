'use client'

import React from 'react'
import { UsageBar } from './UsageBar'
import { useBilling } from '@/hooks/useBilling'
import type { PlanType as _PlanType } from '@/types/billing'

interface UsageMeterProps {
  className?: string
}

// Feature display configuration
const FEATURE_CONFIG: Record<string, { displayName: string; icon: string }> = {
  lead_view: { displayName: 'Leads Viewed', icon: '👥' },
  ai_analysis: { displayName: 'AI Analyses', icon: '🤖' },
  pdf_download: { displayName: 'PDF Downloads', icon: '📄' },
  api_call: { displayName: 'API Calls', icon: '🔌' },
}

/**
 * UsageMeter Component (WK-020)
 * Displays current usage for all tracked features with visual progress bars
 */
export function UsageMeter({ className = '' }: UsageMeterProps) {
  const { useBillingStatus } = useBilling()
  const { data: billingStatus, isLoading, error } = useBillingStatus()

  if (isLoading) {
    return (
      <div className={`bg-[var(--brand-surface)] rounded-lg shadow p-6 ${className}`}>
        <h3 className="text-lg font-semibold text-[var(--brand-text)] mb-4">Usage This Month</h3>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-[var(--brand-border)] rounded w-1/3 mb-2"></div>
              <div className="h-2 bg-[var(--brand-border)] rounded w-full"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`bg-[var(--brand-surface)] rounded-lg shadow p-6 ${className}`}>
        <h3 className="text-lg font-semibold text-[var(--brand-text)] mb-4">Usage This Month</h3>
        <p className="text-red-500">Failed to load usage data</p>
      </div>
    )
  }

  if (!billingStatus?.current_usage) {
    return null
  }

  const { usage, period_start, period_end } = billingStatus.current_usage

  // Format period dates
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })
  }

  const periodText = `${formatDate(period_start)} - ${formatDate(period_end)}`

  return (
    <div className={`bg-[var(--brand-surface)] rounded-lg shadow p-6 ${className}`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-[var(--brand-text)]">Usage This Month</h3>
        <span className="text-sm text-[var(--brand-text-secondary)]">{periodText}</span>
      </div>

      <div className="space-y-4">
        {usage.map((item, index) => {
          const config = FEATURE_CONFIG[item.resource_type] || {
            displayName: item.resource_type,
            icon: '📊',
          }

          const current = item.total_quantity
          const limit = item.limit
          const percentage = item.percentage_used || (limit ? (current / limit) * 100 : 0)

          return (
            <UsageBar
              key={`${item.resource_type}-${index}`}
              label={`${config.icon} ${config.displayName}`}
              current={current}
              limit={limit}
              percentage={percentage}
            />
          )
        })}
      </div>

      {/* Upgrade prompt for high usage */}
      {usage.some((item) => (item.percentage_used || 0) >= 80) && (
        <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
          <p className="text-sm text-yellow-600">
            ⚠️ You're approaching your usage limit. Consider{' '}
            <a href="/billing" className="underline font-medium">
              upgrading your plan
            </a>{' '}
            to avoid service interruption.
          </p>
        </div>
      )}
    </div>
  )
}

export default UsageMeter
