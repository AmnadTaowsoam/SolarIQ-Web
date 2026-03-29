'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'

const STORAGE_KEY = 'solariq_onboarding_progress'
const DISMISSED_KEY = 'solariq_onboarding_dismissed'

interface Step {
  id: string
  title: string
  description: string
  href: string
  icon: string
}

export default function GettingStartedCard() {
  const t = useTranslations('onboardingCard')

  const STEPS: Step[] = [
    {
      id: 'create_lead',
      title: t('createLead'),
      description: t('createLeadDesc'),
      href: '/leads',
      icon: '👤',
    },
    {
      id: 'solar_analysis',
      title: t('setupProfile'),
      description: t('setupProfileDesc'),
      href: '/analyze',
      icon: '☀️',
    },
    {
      id: 'create_proposal',
      title: t('addTeam'),
      description: t('addTeamDesc'),
      href: '/leads',
      icon: '📄',
    },
    {
      id: 'close_deal',
      title: t('viewGuide'),
      description: t('subtitle'),
      href: '/deals',
      icon: '🤝',
    },
    {
      id: 'service_area',
      title: t('skip'),
      description: t('progress'),
      href: '/service-area',
      icon: '📍',
    },
  ]

  const [completedSteps, setCompletedSteps] = useState<string[]>([])
  const [isDismissed, setIsDismissed] = useState(true) // default hidden until loaded

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }
    const dismissed = localStorage.getItem(DISMISSED_KEY)
    if (dismissed === 'true') {
      setIsDismissed(true)
      return
    }
    setIsDismissed(false)
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        setCompletedSteps(JSON.parse(saved))
      } catch {
        // ignore
      }
    }
  }, [])

  const toggleStep = useCallback(
    (stepId: string) => {
      const updated = completedSteps.includes(stepId)
        ? completedSteps.filter((s) => s !== stepId)
        : [...completedSteps, stepId]
      setCompletedSteps(updated)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    },
    [completedSteps]
  )

  const dismiss = useCallback(() => {
    setIsDismissed(true)
    localStorage.setItem(DISMISSED_KEY, 'true')
  }, [])

  if (isDismissed) {
    return null
  }

  const progress = Math.round((completedSteps.length / STEPS.length) * 100)

  return (
    <div className="mb-6 rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-[var(--brand-text)]">{t('title')}</h2>
          <p className="text-sm text-[var(--brand-text-secondary)]">{t('subtitle')}</p>
        </div>
        <button
          onClick={dismiss}
          className="rounded-lg px-3 py-1.5 text-xs font-medium text-[var(--brand-text-secondary)] hover:bg-[var(--brand-surface)]/60 hover:text-[var(--brand-text)]"
        >
          {t('dismiss')}
        </button>
      </div>

      {/* Progress bar */}
      <div className="mb-4">
        <div className="mb-1 flex items-center justify-between text-xs text-[var(--brand-text-secondary)]">
          <span>{t('progress')}</span>
          <span>{progress}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--brand-surface)]/80">
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-2">
        {STEPS.map((step) => {
          const done = completedSteps.includes(step.id)
          return (
            <div
              key={step.id}
              className={`flex items-center gap-3 rounded-lg border p-3 transition-all ${
                done
                  ? 'border-green-200 bg-green-50/50'
                  : 'border-white/60 bg-[var(--brand-surface)]/40 hover:bg-[var(--brand-surface)]/70'
              }`}
            >
              <button
                onClick={() => toggleStep(step.id)}
                className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border-2 transition-all ${
                  done
                    ? 'border-green-500 bg-green-500 text-white'
                    : 'border-[var(--brand-border)] hover:border-amber-400'
                }`}
              >
                {done && (
                  <svg
                    className="h-3.5 w-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </button>

              <span className="text-lg">{step.icon}</span>

              <div className="min-w-0 flex-1">
                <Link
                  href={step.href}
                  className={`text-sm font-medium ${
                    done
                      ? 'text-[var(--brand-text-secondary)] line-through'
                      : 'text-[var(--brand-text)] hover:text-amber-600'
                  }`}
                >
                  {step.title}
                </Link>
                <p className="text-xs text-[var(--brand-text-secondary)]">{step.description}</p>
              </div>

              {!done && (
                <Link
                  href={step.href}
                  className="flex-shrink-0 rounded-md bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-700 hover:bg-amber-200"
                >
                  {t('getStarted')}
                </Link>
              )}
            </div>
          )
        })}
      </div>

      {completedSteps.length === STEPS.length && (
        <div className="mt-4 rounded-lg bg-green-500/10 p-3 text-center text-sm font-medium text-green-800">
          {t('done')}
        </div>
      )}
    </div>
  )
}
