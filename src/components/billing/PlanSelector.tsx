'use client';

/**
 * Plan Selector Component (WK-017)
 * Displays available subscription plans for selection
 */

import React from 'react';
import { Check } from 'lucide-react';
import { PLANS, formatPrice, type Plan, type PlanType } from '@/types/billing';

interface PlanSelectorProps {
  currentPlan?: PlanType;
  onSelectPlan: (planId: PlanType) => void;
  isLoading?: boolean;
}

export function PlanSelector({ currentPlan, onSelectPlan, isLoading }: PlanSelectorProps) {
  const plans = Object.values(PLANS);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {plans.map((plan) => (
        <PlanCard
          key={plan.id}
          plan={plan}
          isCurrentPlan={currentPlan === plan.id}
          onSelect={() => onSelectPlan(plan.id)}
          isLoading={isLoading}
        />
      ))}
    </div>
  );
}

interface PlanCardProps {
  plan: Plan;
  isCurrentPlan: boolean;
  onSelect: () => void;
  isLoading?: boolean;
}

function PlanCard({ plan, isCurrentPlan, onSelect, isLoading }: PlanCardProps) {
  const isPopular = plan.id === 'pro';

  return (
    <div
      className={`relative rounded-2xl border-2 p-6 ${
        isPopular
          ? 'border-blue-600 shadow-lg'
          : isCurrentPlan
          ? 'border-green-600'
          : 'border-gray-200'
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
        <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
        <div className="mt-4">
          <span className="text-4xl font-bold text-gray-900">
            {formatPrice(plan.price_thb)}
          </span>
          <span className="text-gray-500">/month</span>
        </div>
      </div>

      <div className="space-y-3 mb-6">
        <FeatureRow
          text={`${plan.leads_per_month ?? 'Unlimited'} leads/month`}
          included={true}
        />
        <FeatureRow
          text={`${plan.users ?? 'Unlimited'} users`}
          included={true}
        />
        {plan.features.map((feature, index) => (
          <FeatureRow key={index} text={feature.name} included={feature.included} />
        ))}
      </div>

      <button
        onClick={onSelect}
        disabled={isLoading || isCurrentPlan}
        className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors ${
          isCurrentPlan
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : isPopular
            ? 'bg-blue-600 text-white hover:bg-blue-700'
            : 'bg-gray-900 text-white hover:bg-gray-800'
        }`}
      >
        {isCurrentPlan ? 'Current Plan' : 'Select Plan'}
      </button>
    </div>
  );
}

interface FeatureRowProps {
  text: string;
  included: boolean;
}

function FeatureRow({ text, included }: FeatureRowProps) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${
          included ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
        }`}
      >
        {included && <Check className="w-3 h-3" />}
      </div>
      <span className={included ? 'text-gray-700' : 'text-gray-400'}>{text}</span>
    </div>
  );
}

export default PlanSelector;
