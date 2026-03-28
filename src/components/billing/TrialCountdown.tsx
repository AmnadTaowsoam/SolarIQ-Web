'use client'

import { useState, useEffect } from 'react'
import { Clock, AlertCircle } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface TrialCountdownProps {
  trialEndDate?: Date | string
  onUpgradeClick?: () => void
  className?: string
}

export function TrialCountdown({
  trialEndDate,
  onUpgradeClick,
  className = '',
}: TrialCountdownProps) {
  const t = useTranslations('trialCountdown')
  const [daysLeft, setDaysLeft] = useState<number>(0)
  const [hoursLeft, setHoursLeft] = useState<number>(0)
  const [minutesLeft, setMinutesLeft] = useState<number>(0)

  useEffect(() => {
    if (!trialEndDate) {
      return
    }

    const endDate = new Date(trialEndDate)

    const calculateTimeLeft = () => {
      const now = new Date()
      const diff = endDate.getTime() - now.getTime()

      if (diff <= 0) {
        setDaysLeft(0)
        setHoursLeft(0)
        setMinutesLeft(0)
        return
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

      setDaysLeft(days)
      setHoursLeft(hours)
      setMinutesLeft(minutes)
    }

    calculateTimeLeft()
    const interval = setInterval(calculateTimeLeft, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [trialEndDate])

  const isTrialExpired = daysLeft === 0 && hoursLeft === 0 && minutesLeft === 0
  const isTrialEndingSoon = daysLeft <= 3 && !isTrialExpired

  return (
    <div
      className={`rounded-xl border p-4 ${className} ${
        isTrialExpired
          ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20'
          : isTrialEndingSoon
            ? 'border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20'
            : 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20'
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`rounded-full p-2 ${
            isTrialExpired
              ? 'bg-red-100 dark:bg-red-900/30'
              : isTrialEndingSoon
                ? 'bg-amber-100 dark:bg-amber-900/30'
                : 'bg-blue-100 dark:bg-blue-900/30'
          }`}
        >
          <Clock
            className={`h-5 w-5 ${
              isTrialExpired
                ? 'text-red-600 dark:text-red-400'
                : isTrialEndingSoon
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-blue-600 dark:text-blue-400'
            }`}
          />
        </div>

        <div className="flex-1">
          {isTrialExpired ? (
            <>
              <p className="font-semibold text-gray-900 dark:text-white">{t('expired')}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('expiredDesc')}</p>
            </>
          ) : (
            <>
              <p className="font-semibold text-gray-900 dark:text-white">
                {t('timeLeft', { days: daysLeft, hours: hoursLeft, minutes: minutesLeft })}
              </p>
              {isTrialEndingSoon && (
                <p className="mt-1 flex items-center gap-1.5 text-sm text-amber-700 dark:text-amber-300">
                  <AlertCircle className="h-4 w-4" />
                  <span>{t('endingSoon')}</span>
                </p>
              )}
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('noCreditCard')} • {t('keepData')}
              </p>
            </>
          )}
        </div>

        {onUpgradeClick && (
          <button
            onClick={onUpgradeClick}
            className={`shrink-0 rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
              isTrialExpired
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-primary-600 text-white hover:bg-primary-700'
            }`}
          >
            {t('upgradeCTA')}
          </button>
        )}
      </div>
    </div>
  )
}
