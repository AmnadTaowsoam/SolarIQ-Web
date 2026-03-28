'use client'

/**
 * Trial Banner Component (WK-102)
 * Enhanced trial management UI with countdown timer and upgrade prompt
 */

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Clock, AlertTriangle, CheckCircle, X } from 'lucide-react'
import { Card, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useTranslations } from 'next-intl'

interface TrialBannerProps {
  daysRemaining: number
  isTrialActive: boolean
  trialEndDate?: string | null
  planName: string | null
  onUpgrade?: () => void
  onDismiss?: () => void
  showDismiss?: boolean
}

export default function TrialBanner({
  daysRemaining,
  isTrialActive,
  trialEndDate,
  planName,
  onUpgrade,
  onDismiss,
  showDismiss = false,
}: TrialBannerProps) {
  const t = useTranslations('trialBanner')
  const [timeRemaining, setTimeRemaining] = useState<{
    days: number
    hours: number
    minutes: number
    seconds: number
  }>({ days: daysRemaining, hours: 0, minutes: 0, seconds: 0 })

  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if (!isTrialActive || !trialEndDate) {
      return
    }

    const calculateTimeRemaining = () => {
      const now = new Date().getTime()
      const end = new Date(trialEndDate).getTime()
      const distance = end - now

      if (distance < 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0 }
      }

      return {
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000),
      }
    }

    setTimeRemaining(calculateTimeRemaining())

    const timer = setInterval(() => {
      setTimeRemaining(calculateTimeRemaining())
    }, 1000)

    return () => clearInterval(timer)
  }, [isTrialActive, trialEndDate])

  if (!isTrialActive || dismissed) {
    return null
  }

  const urgent = daysRemaining <= 3
  const critical = daysRemaining <= 1

  const handleDismiss = () => {
    setDismissed(true)
    onDismiss?.()
  }

  // Compact version for dashboard
  if (!showDismiss) {
    return (
      <div
        className={`rounded-lg border px-4 py-3 text-sm ${
          critical
            ? 'border-red-300 bg-red-50 text-red-900'
            : urgent
              ? 'border-amber-300 bg-amber-50 text-amber-900'
              : 'border-blue-200 bg-blue-50 text-blue-900'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {critical ? <AlertTriangle className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
            <span>
              {planName === 'free' ? t('freePlan') : t('trialDaysLeft', { days: daysRemaining })}
            </span>
          </div>
          <Link
            href="/billing"
            className={`rounded-md px-3 py-1 text-xs font-medium text-white hover:opacity-90 ${
              critical ? 'bg-red-600' : 'bg-amber-600'
            }`}
          >
            {t('upgrade')}
          </Link>
        </div>
      </div>
    )
  }

  // Full version with countdown
  return (
    <Card
      className={`border-2 ${
        critical ? 'border-red-300' : urgent ? 'border-amber-300' : 'border-blue-200'
      }`}
    >
      <CardBody>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {critical ? (
              <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
            ) : urgent ? (
              <div className="flex-shrink-0 w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
            ) : (
              <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-blue-600" />
              </div>
            )}
            <div>
              <h3
                className={`font-semibold ${
                  critical ? 'text-red-900' : urgent ? 'text-amber-900' : 'text-blue-900'
                }`}
              >
                {critical ? 'Trial Ending Soon!' : urgent ? 'Trial Expiring' : 'Trial Active'}
              </h3>
              <p
                className={`text-sm ${
                  critical ? 'text-red-700' : urgent ? 'text-amber-700' : 'text-blue-700'
                }`}
              >
                {daysRemaining === 0
                  ? 'Your trial has ended. Upgrade now to continue using all features.'
                  : `Your trial will end in ${daysRemaining} day${daysRemaining > 1 ? 's' : ''}.`}
              </p>
            </div>
          </div>
          {showDismiss && (
            <button
              onClick={handleDismiss}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Countdown Timer */}
        {daysRemaining > 0 && (
          <div
            className={`grid grid-cols-4 gap-2 mb-4 ${
              critical ? 'bg-red-50' : urgent ? 'bg-amber-50' : 'bg-blue-50'
            } rounded-lg p-4`}
          >
            <div className="text-center">
              <div
                className={`text-2xl font-bold ${
                  critical ? 'text-red-900' : urgent ? 'text-amber-900' : 'text-blue-900'
                }`}
              >
                {timeRemaining.days}
              </div>
              <div className="text-xs text-gray-600">Days</div>
            </div>
            <div className="text-center">
              <div
                className={`text-2xl font-bold ${
                  critical ? 'text-red-900' : urgent ? 'text-amber-900' : 'text-blue-900'
                }`}
              >
                {timeRemaining.hours}
              </div>
              <div className="text-xs text-gray-600">Hours</div>
            </div>
            <div className="text-center">
              <div
                className={`text-2xl font-bold ${
                  critical ? 'text-red-900' : urgent ? 'text-amber-900' : 'text-blue-900'
                }`}
              >
                {timeRemaining.minutes}
              </div>
              <div className="text-xs text-gray-600">Minutes</div>
            </div>
            <div className="text-center">
              <div
                className={`text-2xl font-bold ${
                  critical ? 'text-red-900' : urgent ? 'text-amber-900' : 'text-blue-900'
                }`}
              >
                {timeRemaining.seconds}
              </div>
              <div className="text-xs text-gray-600">Seconds</div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          {onUpgrade ? (
            <Button
              variant={critical ? 'danger' : 'primary'}
              size="sm"
              className="flex-1"
              onClick={onUpgrade}
            >
              Upgrade Now
            </Button>
          ) : (
            <Link
              href="/billing"
              className={`flex-1 rounded-md px-4 py-2 text-sm font-medium text-white text-center hover:opacity-90 ${
                critical ? 'bg-red-600' : 'bg-amber-600'
              }`}
            >
              Upgrade Now
            </Link>
          )}
          <Link
            href="/pricing-plans"
            className="flex-1 rounded-md border px-4 py-2 text-sm font-medium text-gray-700 text-center hover:bg-gray-50"
          >
            View Plans
          </Link>
        </div>

        {/* Trial Benefits */}
        {daysRemaining > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-600 mb-2">Your trial includes:</p>
            <ul className="text-xs text-gray-600 space-y-1">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-3 h-3 text-green-600" />
                Full access to all features
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-3 h-3 text-green-600" />
                No credit card required
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-3 h-3 text-green-600" />
                Cancel anytime
              </li>
            </ul>
          </div>
        )}
      </CardBody>
    </Card>
  )
}
