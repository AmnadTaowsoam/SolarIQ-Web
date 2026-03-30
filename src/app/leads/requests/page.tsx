'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context'
import { AppLayout } from '@/components/layout'
import { Card, CardBody, Button } from '@/components/ui'
import { useAvailableRequests } from '@/hooks/useQuotes'
import { BUDGET_RANGE_LABELS, TIMELINE_LABELS, BudgetRange, Timeline } from '@/types/quotes'
import { ROUTES } from '@/lib/constants'
import { formatDistanceToNow, isPast, parseISO } from 'date-fns'
import { th } from 'date-fns/locale'

function ExpiryCountdown({ expiresAt, t }: { expiresAt: string; t: (key: string) => string }) {
  const expired = isPast(parseISO(expiresAt))
  const label = expired
    ? t('rejected')
    : `${t('status')}: ${formatDistanceToNow(parseISO(expiresAt), { locale: th })}`

  return (
    <span className={`text-xs font-medium ${expired ? 'text-red-600' : 'text-orange-600'}`}>
      {label}
    </span>
  )
}

function SystemSizeLabel({ sizeKw, t }: { sizeKw?: number; t: (key: string) => string }) {
  if (!sizeKw) {
    return <span className="text-[var(--brand-text-secondary)]">{t('noRequests')}</span>
  }
  let label = ''
  if (sizeKw <= 5) {
    label = t('customer')
  } else if (sizeKw <= 15) {
    label = t('address')
  } else {
    label = t('systemSize')
  }
  return (
    <div>
      <span className="font-semibold text-[var(--brand-text)]">{sizeKw} kW</span>
      <span className="ml-2 text-xs text-[var(--brand-text-secondary)]">({label})</span>
    </div>
  )
}

export default function QuoteRequestsPage() {
  const t = useTranslations('quoteRequests')
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const { data: requests, isLoading, refetch } = useAvailableRequests()
  const [filter, setFilter] = useState<'all' | 'new' | 'open'>('all')

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace(ROUTES.LOGIN)
    }
  }, [user, authLoading, router])

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--brand-background)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  const filtered = requests.filter((r) => {
    if (filter === 'new') {
      return (r as unknown as Record<string, boolean>).isNew
    }
    if (filter === 'open') {
      return r.status === 'open'
    }
    return true
  })

  return (
    <AppLayout user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[var(--brand-text)]">{t('title')}</h1>
            <p className="text-[var(--brand-text-secondary)] mt-1">{t('noRequestsDesc')}</p>
          </div>
          <Button variant="outline" onClick={refetch} className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            {t('newRequest')}
          </Button>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2">
          {[
            { key: 'all', label: `${t('actions')} (${requests.length})` },
            {
              key: 'new',
              label: `${t('pending')} (${requests.filter((r) => (r as unknown as Record<string, boolean>).isNew).length})`,
            },
            {
              key: 'open',
              label: `${t('approved')} (${requests.filter((r) => r.status === 'open').length})`,
            },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as typeof filter)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === tab.key
                  ? 'bg-orange-500 text-white'
                  : 'bg-[var(--brand-surface)] text-[var(--brand-text-secondary)] border border-[var(--brand-border)] hover:border-orange-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Cards */}
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-[var(--brand-surface)] rounded-xl shadow-sm border border-[var(--brand-border)] p-5 animate-pulse"
              >
                <div className="h-4 bg-[var(--brand-border)] rounded w-3/4 mb-3" />
                <div className="h-3 bg-[var(--brand-border)] rounded w-1/2 mb-6" />
                <div className="space-y-2">
                  <div className="h-3 bg-[var(--brand-border)] rounded" />
                  <div className="h-3 bg-[var(--brand-border)] rounded" />
                  <div className="h-3 bg-[var(--brand-border)] rounded w-2/3" />
                </div>
                <div className="mt-4 h-9 bg-orange-100 rounded-lg" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <Card>
            <CardBody className="py-16 text-center">
              <svg
                className="w-16 h-16 mx-auto text-[var(--brand-text-secondary)] mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <h3 className="text-lg font-semibold text-[var(--brand-text)] mb-1">
                {t('noRequests')}
              </h3>
              <p className="text-[var(--brand-text-secondary)] text-sm">{t('noRequestsDesc')}</p>
            </CardBody>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((req) => {
              const isNew = (req as unknown as Record<string, boolean>).isNew
              const quotesLeft = req.maxQuotes - req.quotesReceived
              return (
                <Card
                  key={req.id}
                  className="hover:shadow-md transition-shadow duration-200 relative"
                >
                  {isNew && (
                    <div className="absolute top-3 right-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-red-500 text-white animate-pulse">
                        {t('newRequest')}
                      </span>
                    </div>
                  )}
                  <CardBody className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 text-[var(--brand-text-secondary)] text-sm mb-1">
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                          {req.locationDisplay || t('address')}
                        </div>
                        <SystemSizeLabel sizeKw={req.systemSizeKw} t={t} />
                      </div>
                    </div>

                    <div className="space-y-2 text-sm mb-4">
                      <div className="flex justify-between">
                        <span className="text-[var(--brand-text-secondary)]">{t('budget')}</span>
                        <span className="font-medium text-[var(--brand-text)]">
                          {BUDGET_RANGE_LABELS[req.preferences.budgetRange as BudgetRange]}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[var(--brand-text-secondary)]">{t('date')}</span>
                        <span className="font-medium text-[var(--brand-text)]">
                          {TIMELINE_LABELS[req.preferences.preferredTimeline as Timeline]}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[var(--brand-text-secondary)]">{t('status')}</span>
                        <span className="font-medium text-[var(--brand-text)]">
                          {req.quotesReceived}/{req.maxQuotes}
                          {quotesLeft > 0 && (
                            <span className="ml-1 text-green-600 text-xs">({quotesLeft})</span>
                          )}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mb-4">
                      <ExpiryCountdown expiresAt={req.expiresAt} t={t} />
                      {req.preferences.financingPreference !== 'undecided' && (
                        <span className="text-xs text-blue-600 bg-blue-500/10 px-2 py-0.5 rounded-full">
                          {req.preferences.financingPreference === 'cash'
                            ? t('approved')
                            : req.preferences.financingPreference === 'installment'
                              ? t('pending')
                              : t('source')}
                        </span>
                      )}
                    </div>

                    <Button
                      className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                      onClick={() => router.push(`/leads/${req.id}/quote`)}
                      disabled={
                        isPast(parseISO(req.expiresAt)) || req.quotesReceived >= req.maxQuotes
                      }
                    >
                      {t('createLead')}
                    </Button>
                  </CardBody>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </AppLayout>
  )
}
