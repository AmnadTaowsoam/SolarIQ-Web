'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, Info, CreditCard, Calendar, Shield } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'

interface UpgradeCTAProps {
  currentPlan?: string
  onUpgradeClick?: () => void
  showBillingInfo?: boolean
  className?: string
}

export function UpgradeCTA({
  currentPlan = 'free',
  onUpgradeClick,
  showBillingInfo = true,
  className = '',
}: UpgradeCTAProps) {
  const t = useTranslations('upgradeCTA')
  const [showDetails, setShowDetails] = useState(false)

  const steps = [
    {
      icon: Calendar,
      title: t('step1Title'),
      description: t('step1Desc'),
    },
    {
      icon: CreditCard,
      title: t('step2Title'),
      description: t('step2Desc'),
    },
    {
      icon: Shield,
      title: t('step3Title'),
      description: t('step3Desc'),
    },
    {
      icon: Info,
      title: t('step4Title'),
      description: t('step4Desc'),
    },
  ]

  return (
    <div className={`rounded-xl border bg-white dark:bg-gray-800 shadow-sm ${className}`}>
      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {currentPlan === 'free' ? t('upgradeTitle') : t('changeTitle')}
            </h3>
            {currentPlan === 'free' && (
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{t('freeDesc')}</p>
            )}
          </div>

          {showBillingInfo && (
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="shrink-0 rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              aria-expanded={showDetails}
            >
              {showDetails ? (
                <>
                  <span>{t('hideDetails')}</span>
                  <ChevronUp className="ml-1 h-4 w-4" />
                </>
              ) : (
                <>
                  <span>{t('showBillingInfo')}</span>
                  <ChevronDown className="ml-1 h-4 w-4" />
                </>
              )}
            </button>
          )}
        </div>

        {showBillingInfo && showDetails && (
          <div className="mt-6 space-y-4 border-t border-gray-200 dark:border-gray-700 pt-6">
            <div className="grid gap-4 md:grid-cols-2">
              {steps.map((step, index) => (
                <div
                  key={index}
                  className="flex gap-3 rounded-lg bg-gray-50 dark:bg-gray-900/50 p-4"
                >
                  <div className="shrink-0">
                    <step.icon className="h-6 w-6 text-primary-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {step.title}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 p-4">
              <h4 className="mb-3 font-semibold text-gray-900 dark:text-white">{t('faqTitle')}</h4>
              <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <p>
                  <strong>Q: {t('faq1Question')}</strong>
                  <br />
                  <span className="text-gray-600 dark:text-gray-400">A: {t('faq1Answer')}</span>
                </p>
                <p>
                  <strong>Q: {t('faq2Question')}</strong>
                  <br />
                  <span className="text-gray-600 dark:text-gray-400">A: {t('faq2Answer')}</span>
                </p>
                <p>
                  <strong>Q: {t('faq3Question')}</strong>
                  <br />
                  <span className="text-gray-600 dark:text-gray-400">A: {t('faq3Answer')}</span>
                </p>
              </div>
            </div>

            <div className="text-center">
              <Link
                href="/pricing-plans"
                className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-6 py-3 text-base font-semibold text-white hover:bg-primary-700 transition-colors"
              >
                {t('viewAllPlans')}
              </Link>
            </div>
          </div>
        )}

        {!showBillingInfo && onUpgradeClick && (
          <div className="mt-4">
            <button
              onClick={onUpgradeClick}
              className="w-full rounded-lg bg-primary-600 px-6 py-3 text-base font-semibold text-white hover:bg-primary-700 transition-colors"
            >
              {t('upgradeCTA')}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
