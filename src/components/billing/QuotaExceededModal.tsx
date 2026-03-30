'use client'

import React from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { QuotaExceededError } from '@/lib/api'
import { PlanType, PLANS } from '@/types/billing'

interface QuotaExceededModalProps {
  isOpen: boolean
  onClose: () => void
  error: QuotaExceededError | null
  onUpgrade: (planId: PlanType) => void
  isUpgrading?: boolean
}

// Feature display names
const FEATURE_NAMES: Record<string, string> = {
  lead_view: 'Lead Views',
  ai_analysis: 'AI Analyses',
  pdf_download: 'PDF Downloads',
  api_call: 'API Calls',
}

/**
 * QuotaExceededModal Component (WK-020)
 * Displayed when a user exceeds their quota, prompting them to upgrade
 */
export function QuotaExceededModal({
  isOpen,
  onClose,
  error,
  onUpgrade,
  isUpgrading = false,
}: QuotaExceededModalProps) {
  if (!error) {
    return null
  }

  const featureName = FEATURE_NAMES[error.featureKey] || error.featureKey
  const recommendedPlan = error.recommendedPlan as PlanType | undefined
  const recommendedPlanData = recommendedPlan ? PLANS[recommendedPlan] : null

  // Get all plans sorted by price for upgrade options
  const upgradeOptions = Object.entries(PLANS)
    .filter(([id]) => id !== error.planId)
    .sort(([, a], [, b]) => a.price_thb - b.price_thb)

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-6 max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="mx-auto w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-[var(--brand-text)]">Usage Limit Reached</h2>
          <p className="text-[var(--brand-text-secondary)] mt-2">
            You've used all your {featureName} for this billing period.
          </p>
        </div>

        {/* Current usage info */}
        <div className="bg-[var(--brand-background)] rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center">
            <span className="text-sm text-[var(--brand-text-secondary)]">Current Usage</span>
            <span className="font-semibold text-[var(--brand-text)]">
              {error.current} / {error.limit}
            </span>
          </div>
          <div className="mt-2 w-full bg-[var(--brand-border)] rounded-full h-2">
            <div className="bg-red-500 h-2 rounded-full" style={{ width: '100%' }} />
          </div>
        </div>

        {/* Recommended plan */}
        {recommendedPlanData && (
          <div className="bg-blue-500/10 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2 mb-2">
              <svg
                className="w-5 h-5 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              <span className="font-medium text-blue-900">Recommended Upgrade</span>
            </div>
            <div className="flex justify-between items-center">
              <div>
                <p className="font-semibold text-[var(--brand-text)]">{recommendedPlanData.name}</p>
                <p className="text-sm text-[var(--brand-text-secondary)]">
                  ฿{recommendedPlanData.price_thb.toLocaleString()}/month
                </p>
              </div>
              <Button
                onClick={() => {
                  if (recommendedPlan) {
                    onUpgrade(recommendedPlan)
                  }
                }}
                disabled={isUpgrading}
                variant="primary"
              >
                {isUpgrading ? 'Upgrading...' : 'Upgrade Now'}
              </Button>
            </div>
          </div>
        )}

        {/* Other upgrade options */}
        {upgradeOptions.length > 0 && !recommendedPlanData && (
          <div className="space-y-3 mb-6">
            <p className="text-sm font-medium text-[var(--brand-text)]">Available Plans:</p>
            {upgradeOptions.map(([planId, plan]) => (
              <div
                key={planId}
                className="flex justify-between items-center p-3 bg-[var(--brand-background)] rounded-lg"
              >
                <div>
                  <p className="font-medium text-[var(--brand-text)]">{plan.name}</p>
                  <p className="text-sm text-[var(--brand-text-secondary)]">
                    ฿{plan.price_thb.toLocaleString()}/month
                  </p>
                </div>
                <Button
                  onClick={() => onUpgrade(planId as PlanType)}
                  disabled={isUpgrading}
                  variant="outline"
                  size="sm"
                >
                  Select
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end space-x-3">
          <Button onClick={onClose} variant="ghost" disabled={isUpgrading}>
            Maybe Later
          </Button>
        </div>

        {/* Help text */}
        <p className="text-xs text-[var(--brand-text-secondary)] text-center mt-4">
          Need help?{' '}
          <a href="/support" className="text-blue-600 hover:underline">
            Contact support
          </a>
        </p>
      </div>
    </Modal>
  )
}

export default QuotaExceededModal
