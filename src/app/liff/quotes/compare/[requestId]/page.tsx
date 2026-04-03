'use client'

import { useMemo, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { QuoteComparisonTable } from '@/components/quotes/QuoteComparisonTable'
import {
  LiffHeroCard,
  LiffMetricStrip,
  LiffPageFrame,
  LiffPanel,
  LiffPrimaryButton,
} from '@/components/liff/LiffMobileUI'
import { formatThb } from '@/lib/utils'
import { useQuoteComparison, useAcceptQuote, useDeclineQuote } from '@/hooks/useQuotes'

export default function QuoteComparePage() {
  const params = useParams()
  const router = useRouter()
  const t = useTranslations('quoteComparison')
  const requestId = params.requestId as string
  const { data, isLoading, error } = useQuoteComparison(requestId)
  const { accept } = useAcceptQuote()
  const { decline } = useDeclineQuote()
  const [acceptingId, setAcceptingId] = useState<string | null>(null)
  const [acceptedDealId, setAcceptedDealId] = useState<string | null>(null)
  const [localDeclined, setLocalDeclined] = useState<Set<string>>(new Set())
  const [errorMsg, setErrorMsg] = useState('')

  const visibleQuotes = useMemo(() => {
    return data?.quotes.filter((quote) => !localDeclined.has(quote.quoteId)) ?? []
  }, [data?.quotes, localDeclined])

  const summary = useMemo(() => {
    if (visibleQuotes.length === 0) {
      return null
    }

    const cheapest = [...visibleQuotes].sort(
      (a, b) => a.pricing.totalPrice - b.pricing.totalPrice
    )[0]
    const fastest = [...visibleQuotes].sort(
      (a, b) => a.timeline.totalDays - b.timeline.totalDays
    )[0]
    if (!cheapest || !fastest) {
      return null
    }
    const avgSavings =
      visibleQuotes.reduce((total, quote) => total + quote.savings.monthlySavingsThb, 0) /
      visibleQuotes.length

    return {
      cheapest,
      fastest,
      avgSavings,
    }
  }, [visibleQuotes])

  const handleAccept = async (quoteId: string) => {
    setAcceptingId(quoteId)
    setErrorMsg('')
    try {
      const result = await accept(quoteId)
      setAcceptedDealId(result.dealId)
    } catch {
      setErrorMsg(t('acceptError'))
      setAcceptingId(null)
    }
  }

  const handleDecline = async (quoteId: string) => {
    await decline(quoteId)
    setLocalDeclined((prev) => new Set([...prev, quoteId]))
  }

  const handleViewDetail = (quoteId: string) => {
    router.push(`/liff/quotes/${quoteId}?requestId=${requestId}`)
  }

  if (acceptedDealId) {
    return (
      <LiffPageFrame className="flex items-center justify-center">
        <div className="w-full max-w-sm">
          <LiffHeroCard
            accent="green"
            eyebrow={t('acceptedEyebrow')}
            title={t('acceptedTitle')}
            description={t('acceptedDescription')}
            className="text-center"
          >
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shadow-sm">
              <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </LiffHeroCard>
          <div className="mt-4 space-y-3">
            <LiffPrimaryButton
              accent="green"
              className="w-full"
              onClick={() => router.push(`/liff/quotes/deals/${acceptedDealId}`)}
            >
              {t('trackProgress')}
            </LiffPrimaryButton>
            <button
              onClick={() => router.push('/liff/quotes')}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700"
            >
              {t('backHome')}
            </button>
          </div>
        </div>
      </LiffPageFrame>
    )
  }

  return (
    <LiffPageFrame className="pb-8">
      <LiffHeroCard
        title={t('title')}
        description={t('heroDescription')}
        eyebrow={t('heroEyebrow')}
        badge={data ? t('quoteCount', { count: visibleQuotes.length }) : undefined}
        onBack={() => router.back()}
      >
        {summary ? (
          <LiffMetricStrip
            items={[
              {
                label: t('cheapestOffer'),
                value: formatThb(summary.cheapest.pricing.totalPrice),
                hint: summary.cheapest.contractor.companyName,
              },
              {
                label: t('fastestInstall'),
                value: t('daysCount', { count: summary.fastest.timeline.totalDays }),
                hint: summary.fastest.contractor.companyName,
              },
              {
                label: t('avgSavings'),
                value: formatThb(summary.avgSavings),
                hint: t('perMonth'),
              },
            ]}
          />
        ) : null}
      </LiffHeroCard>

      <div className="mt-4 space-y-4">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="rounded-[26px] border border-white/80 bg-white/85 p-5 shadow-sm"
              >
                <div className="animate-pulse space-y-4">
                  <div className="flex gap-3">
                    <div className="h-12 w-12 rounded-2xl bg-slate-200" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-1/2 rounded bg-slate-200" />
                      <div className="h-3 w-1/3 rounded bg-slate-200" />
                    </div>
                    <div className="h-10 w-24 rounded-xl bg-slate-200" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {[1, 2, 3, 4].map((j) => (
                      <div key={j} className="h-20 rounded-2xl bg-slate-100" />
                    ))}
                  </div>
                  <div className="h-11 rounded-2xl bg-slate-100" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <LiffPanel title={t('loadErrorTitle')} subtitle={t('loadErrorDescription')}>
            <button
              onClick={() => window.location.reload()}
              className="text-sm font-semibold text-orange-600"
            >
              {t('retry')}
            </button>
          </LiffPanel>
        ) : !data || visibleQuotes.length === 0 ? (
          <LiffPanel title={t('emptyTitle')} subtitle={t('emptyDescription')}>
            <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">
              {t('emptyHint')}
            </div>
          </LiffPanel>
        ) : (
          <>
            {errorMsg ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {errorMsg}
              </div>
            ) : null}

            <QuoteComparisonTable
              data={{
                ...data,
                quotes: visibleQuotes,
              }}
              onAccept={handleAccept}
              onDecline={handleDecline}
              onViewDetail={handleViewDetail}
              isAccepting={acceptingId}
            />
          </>
        )}
      </div>
    </LiffPageFrame>
  )
}
