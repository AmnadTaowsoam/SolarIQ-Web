'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';
import { PlanType, PLANS } from '@/types/billing';

interface UpgradePromptProps {
  currentPlanId: PlanType;
  featureName?: string;
  onUpgrade?: () => void;
  className?: string;
  variant?: 'inline' | 'card' | 'banner';
}

/**
 * UpgradePrompt Component (WK-020)
 * Displays an inline prompt encouraging users to upgrade their plan
 */
export function UpgradePrompt({
  currentPlanId,
  featureName,
  onUpgrade,
  className = '',
  variant = 'inline',
}: UpgradePromptProps) {
  // Get recommended upgrade plan (next tier up)
  const planOrder: PlanType[] = ['starter', 'pro', 'enterprise'];
  const currentIndex = planOrder.indexOf(currentPlanId);
  const recommendedPlanId = currentIndex < planOrder.length - 1 
    ? planOrder[currentIndex + 1] 
    : null;
  
  const recommendedPlan = recommendedPlanId ? PLANS[recommendedPlanId] : null;

  if (!recommendedPlan) {
    // Already on highest plan
    return null;
  }

  const featureText = featureName 
    ? ` to unlock more ${featureName}` 
    : ' for more features';

  if (variant === 'banner') {
    return (
      <div className={`bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 rounded-lg ${className}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">
              Upgrade to {recommendedPlan.name}{featureText}
            </p>
            <p className="text-sm text-blue-100">
              Starting at ฿{recommendedPlan.price_thb.toLocaleString()}/month
            </p>
          </div>
          <Button
            onClick={onUpgrade}
            variant="secondary"
            size="sm"
            className="bg-white text-blue-600 hover:bg-blue-50"
          >
            Upgrade
          </Button>
        </div>
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className={`bg-white border border-gray-200 rounded-lg p-6 ${className}`}>
        <div className="text-center">
          <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <svg
              className="w-6 h-6 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Upgrade to {recommendedPlan.name}
          </h3>
          <p className="text-gray-600 text-sm mb-4">
            Get more{featureText} and unlock premium features.
          </p>
          <div className="text-2xl font-bold text-gray-900 mb-4">
            ฿{recommendedPlan.price_thb.toLocaleString()}
            <span className="text-sm font-normal text-gray-500">/month</span>
          </div>
          <Button
            onClick={onUpgrade}
            variant="primary"
            className="w-full"
          >
            Upgrade Now
          </Button>
        </div>
      </div>
    );
  }

  // Default: inline variant
  return (
    <div className={`flex items-center justify-between p-4 bg-gray-50 rounded-lg ${className}`}>
      <div className="flex items-center space-x-3">
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
            d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
          />
        </svg>
        <div>
          <p className="text-sm font-medium text-gray-900">
            Need more{featureText}?
          </p>
          <p className="text-xs text-gray-500">
            Upgrade to {recommendedPlan.name} (฿{recommendedPlan.price_thb.toLocaleString()}/mo)
          </p>
        </div>
      </div>
      <Button
        onClick={onUpgrade}
        variant="outline"
        size="sm"
      >
        Upgrade
      </Button>
    </div>
  );
}

export default UpgradePrompt;
