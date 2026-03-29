'use client'

/**
 * Plan Selector Component (WK-017, WK-102)
 * Displays available subscription plans for selection with billing cycle toggle
 */

import React, { useState } from 'react'
import { Check, Info } from 'lucide-react'
import { PLANS, formatPrice, type Plan, type PlanType } from '@/types/billing'

interface PlanSelectorProps {
  currentPlan?: PlanType
  onSelectPlan: (planId: PlanType) => void
  isLoading?: boolean
  showBillingCycle?: boolean
  onBillingCycleChange?: (cycle: 'monthly' | 'annual') => void
  initialBillingCycle?: 'monthly' | 'annual'
}

export function PlanSelector({
  currentPlan,
  onSelectPlan,
  isLoading,
  showBillingCycle = true,
  onBillingCycleChange,
  initialBillingCycle = 'monthly',
}: PlanSelectorProps) {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>(initialBillingCycle)

  const handleBillingCycleChange = (cycle: 'monthly' | 'annual') => {
    setBillingCycle(cycle)
    onBillingCycleChange?.(cycle)
  }

  const plans = Object.values(PLANS)

  return (
    <div>
      {/* Billing Cycle Toggle */}
      {showBillingCycle && (
        <div className="flex justify-center mb-8">
          <div className="bg-[var(--brand-background)] rounded-lg p-1 inline-flex">
            <button
              onClick={() => handleBillingCycleChange('monthly')}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                billingCycle === 'monthly'
                  ? 'bg-[var(--brand-surface)] text-[var(--brand-text)] shadow-sm'
                  : 'text-[var(--brand-text-secondary)] hover:text-[var(--brand-text)]'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => handleBillingCycleChange('annual')}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                billingCycle === 'annual'
                  ? 'bg-[var(--brand-surface)] text-[var(--brand-text)] shadow-sm'
                  : 'text-[var(--brand-text-secondary)] hover:text-[var(--brand-text)]'
              }`}
            >
              Annual
              <span className="ml-1 text-xs bg-green-500/10 text-green-700 px-2 py-0.5 rounded-full">
                Save 20%
              </span>
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            isCurrentPlan={currentPlan === plan.id}
            billingCycle={billingCycle}
            onSelect={() => onSelectPlan(plan.id)}
            isLoading={isLoading}
          />
        ))}
      </div>

      {/* Annual Billing Info */}
      {billingCycle === 'annual' && (
        <div className="mt-6 bg-blue-500/10 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-900">Annual Billing Benefits</p>
            <p className="text-sm text-blue-700 mt-1">
              Save 20% compared to monthly billing. Your subscription will be billed annually and
              you can cancel at any time before the next billing cycle.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

interface PlanCardProps {
  plan: Plan
  isCurrentPlan: boolean
  billingCycle: 'monthly' | 'annual'
  onSelect: () => void
  isLoading?: boolean
}

function PlanCard({ plan, isCurrentPlan, billingCycle, onSelect, isLoading }: PlanCardProps) {
  const isPopular = plan.id === 'pro'

  // Calculate price based on billing cycle
  const monthlyPrice = plan.price_thb
  const annualPrice = Math.floor(plan.price_thb * 12 * 0.8) // 20% discount
  const displayPrice = billingCycle === 'annual' ? annualPrice : monthlyPrice
  const pricePerMonth = billingCycle === 'annual' ? Math.floor(annualPrice / 12) : monthlyPrice

  return (
    <div
      className={`relative rounded-2xl border-2 p-6 ${
        isPopular
          ? 'border-blue-600 shadow-lg'
          : isCurrentPlan
            ? 'border-green-600'
            : 'border-[var(--brand-border)]'
      }`}
    >
      {isPopular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
            Most Popular
          </span>
        </div>
      )}

      {isCurrentPlan && (
        <div className="absolute -top-3 right-4">
          <span className="bg-green-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
            Current Plan
          </span>
        </div>
      )}

      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-[var(--brand-text)]">{plan.name}</h3>
        <div className="mt-4">
          <span className="text-4xl font-bold text-[var(--brand-text)]">
            {formatPrice(displayPrice)}
          </span>
          <span className="text-[var(--brand-text-secondary)]">
            {billingCycle === 'annual' ? '/year' : '/month'}
          </span>
        </div>
        {billingCycle === 'annual' && (
          <p className="text-sm text-green-600 mt-1">
            {formatPrice(pricePerMonth)}/month (billed annually)
          </p>
        )}
      </div>

      <div className="space-y-3 mb-6">
        <FeatureRow text={`${plan.leads_per_month ?? 'Unlimited'} leads/month`} included={true} />
        <FeatureRow text={`${plan.users ?? 'Unlimited'} users`} included={true} />
        {plan.features.map((feature, index) => (
          <FeatureRow key={index} text={feature.name} included={feature.included} />
        ))}
      </div>

      <button
        onClick={onSelect}
        disabled={isLoading || isCurrentPlan}
        className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors ${
          isCurrentPlan
            ? 'bg-[var(--brand-background)] text-[var(--brand-text-secondary)] cursor-not-allowed'
            : isPopular
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-900 text-white hover:bg-gray-800'
        }`}
      >
        {isCurrentPlan ? 'Current Plan' : 'Select Plan'}
      </button>
    </div>
  )
}

interface FeatureRowProps {
  text: string
  included: boolean
}

function FeatureRow({ text, included }: FeatureRowProps) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${
          included
            ? 'bg-green-500/10 text-green-600'
            : 'bg-[var(--brand-background)] text-[var(--brand-text-secondary)]'
        }`}
      >
        {included && <Check className="w-3 h-3" />}
      </div>
      <span
        className={included ? 'text-[var(--brand-text)]' : 'text-[var(--brand-text-secondary)]'}
      >
        {text}
      </span>
    </div>
  )
}

export default PlanSelector
