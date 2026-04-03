'use client'

import { useMemo, useState } from 'react'
import { BadgeCheck, CalendarClock, CircleDollarSign, ShieldCheck, Zap } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { LiffPanel, LiffPill, LiffPrimaryButton } from '@/components/liff/LiffMobileUI'
import { cn, formatThb } from '@/lib/utils'
import { QuoteComparisonData, QuoteComparisonItem } from '@/types/quotes'

interface QuoteComparisonTableProps {
  data: QuoteComparisonData
  onAccept: (quoteId: string) => void
  onDecline: (quoteId: string) => void
  onViewDetail: (quoteId: string) => void
  isAccepting?: string | null
}

type SortKey = 'price' | 'rating' | 'fast'

const toneByBadgeLabel = ['success', 'warning', 'info'] as const

function StarRating({ rating, count }: { rating: number; count: number }) {
  return (
    <div className="flex items-center gap-1.5 text-sm">
      <span className="text-base leading-none text-amber-400">★</span>
      <span className="font-semibold text-slate-900">{rating.toFixed(1)}</span>
      <span className="text-slate-500">({count})</span>
    </div>
  )
}

function QuoteQuickMetric({
  icon,
  label,
  value,
  hint,
}: {
  icon: React.ReactNode
  label: string
  value: string
  hint?: string
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-3">
      <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
        <span className="text-slate-500">{icon}</span>
        <span>{label}</span>
      </div>
      <p className="mt-2 text-sm font-semibold text-slate-950">{value}</p>
      {hint ? <p className="mt-1 text-xs text-slate-500">{hint}</p> : null}
    </div>
  )
}

export function QuoteComparisonTable({
  data,
  onAccept,
  onDecline,
  onViewDetail,
  isAccepting,
}: QuoteComparisonTableProps) {
  const t = useTranslations('quoteComparison')
  const [sortKey, setSortKey] = useState<SortKey>('price')
  const [showDeclineModal, setShowDeclineModal] = useState<string | null>(null)
  const [declineReason, setDeclineReason] = useState('')

  const sorted = useMemo(() => {
    return [...data.quotes].sort((a, b) => {
      if (sortKey === 'price') {
        return a.pricing.totalPrice - b.pricing.totalPrice
      }
      if (sortKey === 'rating') {
        return b.contractor.rating - a.contractor.rating
      }
      return a.timeline.totalDays - b.timeline.totalDays
    })
  }, [data.quotes, sortKey])

  const getBadges = (
    item: QuoteComparisonItem
  ): Array<{ label: string; tone: 'success' | 'warning' | 'info' }> => {
    const badges: Array<{ label: string; tone: 'success' | 'warning' | 'info' }> = []
    if (data.analysis?.cheapest === item.quoteId) {
      badges.push({ label: t('best'), tone: 'success' })
    }
    if (data.analysis?.highestRated === item.quoteId) {
      badges.push({ label: t('premium'), tone: 'warning' })
    }
    if (data.analysis?.fastest === item.quoteId) {
      badges.push({ label: t('basic'), tone: 'info' })
    }
    return badges
  }

  const handleDeclineConfirm = () => {
    if (!showDeclineModal) {
      return
    }
    onDecline(showDeclineModal)
    setShowDeclineModal(null)
    setDeclineReason('')
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2">
        {[
          { key: 'price' as const, label: t('sortPrice') },
          { key: 'rating' as const, label: t('sortRating') },
          { key: 'fast' as const, label: t('sortFast') },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setSortKey(tab.key)}
            className={cn(
              'rounded-2xl border px-3 py-3 text-sm font-semibold transition-all',
              sortKey === tab.key
                ? 'border-orange-500 bg-orange-500 text-white shadow-[0_16px_32px_-22px_rgba(249,115,22,0.75)]'
                : 'border-white/70 bg-white/85 text-slate-600 shadow-sm backdrop-blur-sm hover:bg-white'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {sorted.map((item, index) => {
        const badges = getBadges(item)
        const isAcceptingThis = isAccepting === item.quoteId
        const isTopPick = index === 0

        return (
          <LiffPanel
            key={item.quoteId}
            className={cn(
              'overflow-hidden border-2 p-0',
              isTopPick
                ? 'border-orange-300 shadow-[0_26px_70px_-40px_rgba(249,115,22,0.55)]'
                : 'border-white/75'
            )}
          >
            <div
              className={cn(
                'px-4 py-3',
                isTopPick
                  ? 'bg-[linear-gradient(135deg,#fff5eb_0%,#fff_52%,#ffedd5_100%)]'
                  : 'bg-[linear-gradient(135deg,#fff_0%,#f8fafc_100%)]'
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-base font-bold text-white shadow-sm">
                    {item.contractor.companyName.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-base font-semibold text-slate-950">
                        {item.contractor.companyName}
                      </p>
                      {item.contractor.verified ? (
                        <LiffPill tone="info">
                          <BadgeCheck className="mr-1 h-3.5 w-3.5" />
                          {t('verified')}
                        </LiffPill>
                      ) : null}
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <StarRating
                        rating={item.contractor.rating}
                        count={item.contractor.totalReviews}
                      />
                      {typeof item.contractor.responseTimeHours === 'number' ? (
                        <span className="text-xs text-slate-500">
                          {t('responseTime', { hours: item.contractor.responseTimeHours })}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                    {t('totalCost')}
                  </p>
                  <p className="mt-1 text-2xl font-bold text-orange-600">
                    {formatThb(item.pricing.totalPrice)}
                  </p>
                  <p className="text-xs text-slate-500">{formatThb(item.pricing.pricePerKw)}/kW</p>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {isTopPick ? <LiffPill tone="warning">{t('recommendedMatch')}</LiffPill> : null}
                {badges.map((badge, badgeIndex) => (
                  <LiffPill
                    key={`${badge.label}-${badgeIndex}`}
                    tone={badge.tone ?? toneByBadgeLabel[badgeIndex] ?? 'default'}
                  >
                    {badge.label}
                  </LiffPill>
                ))}
                {item.pricing.discountPct > 0 ? (
                  <LiffPill tone="success">
                    {t('saving')} {item.pricing.discountPct.toFixed(1)}%
                  </LiffPill>
                ) : null}
              </div>
            </div>

            <div className="space-y-4 px-4 py-4">
              <div className="grid grid-cols-2 gap-3">
                <QuoteQuickMetric
                  icon={<CircleDollarSign className="h-3.5 w-3.5" />}
                  label={t('monthlySavings')}
                  value={formatThb(item.savings.monthlySavingsThb)}
                  hint={t('perMonth')}
                />
                <QuoteQuickMetric
                  icon={<CalendarClock className="h-3.5 w-3.5" />}
                  label={t('installationWindow')}
                  value={t('daysCount', { count: item.timeline.totalDays })}
                  hint={new Date(item.timeline.installationEnd).toLocaleDateString('th-TH', {
                    day: 'numeric',
                    month: 'short',
                  })}
                />
                <QuoteQuickMetric
                  icon={<Zap className="h-3.5 w-3.5" />}
                  label={t('systemSize')}
                  value={`${item.system.totalKw.toFixed(2)} kW`}
                  hint={`${item.system.panelBrand} ${item.system.panelWattage}W × ${item.system.panelCount}`}
                />
                <QuoteQuickMetric
                  icon={<ShieldCheck className="h-3.5 w-3.5" />}
                  label={t('payback')}
                  value={t('yearsCount', { count: item.savings.paybackYears.toFixed(1) })}
                  hint={`${item.warranty.panelYears}/${item.warranty.inverterYears}/${item.warranty.installationYears} ${t('years')}`}
                />
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-950">{t('systemHighlights')}</p>
                    <p className="mt-1 text-xs text-slate-500">{t('highlightsSubtitle')}</p>
                  </div>
                  {item.system.hasBattery ? (
                    <LiffPill tone="success">{t('batteryIncluded')}</LiffPill>
                  ) : null}
                </div>
                <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs uppercase tracking-[0.14em] text-slate-400">
                      {t('panelBrand')}
                    </p>
                    <p className="mt-1 font-medium text-slate-900">{item.system.panelBrand}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.14em] text-slate-400">
                      {t('inverterBrand')}
                    </p>
                    <p className="mt-1 font-medium text-slate-900">{item.system.inverterBrand}</p>
                  </div>
                </div>
              </div>

              {item.pricing.hasFinancing && item.pricing.monthlyInstallment ? (
                <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800 ring-1 ring-emerald-100">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-medium">{t('financingAvailable')}</span>
                    <span className="font-semibold">
                      {formatThb(item.pricing.monthlyInstallment)} {t('perMonth')}
                    </span>
                  </div>
                </div>
              ) : null}

              <div className="grid grid-cols-3 gap-2 text-center">
                {[
                  {
                    label: t('warrantyPanel'),
                    value: t('yearsCount', { count: item.warranty.panelYears }),
                  },
                  {
                    label: t('warrantyInverter'),
                    value: t('yearsCount', { count: item.warranty.inverterYears }),
                  },
                  {
                    label: t('warrantyInstall'),
                    value: t('yearsCount', { count: item.warranty.installationYears }),
                  },
                ].map((warranty) => (
                  <div
                    key={warranty.label}
                    className="rounded-2xl border border-slate-200 bg-white px-2 py-3"
                  >
                    <p className="text-[11px] uppercase tracking-[0.12em] text-slate-400">
                      {warranty.label}
                    </p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">{warranty.value}</p>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => onViewDetail(item.quoteId)}
                  className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                >
                  {t('reviewQuote')}
                </button>
                <button
                  onClick={() => setShowDeclineModal(item.quoteId)}
                  className="rounded-2xl border border-red-200 px-4 py-3 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50"
                >
                  {t('declineQuote')}
                </button>
                <LiffPrimaryButton
                  onClick={() => onAccept(item.quoteId)}
                  disabled={!!isAccepting}
                  className="flex-1"
                >
                  {isAcceptingThis ? t('processing') : t('select')}
                </LiffPrimaryButton>
              </div>
            </div>
          </LiffPanel>
        )
      })}

      {showDeclineModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/50 px-4 pb-4 pt-10 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-[28px] border border-white/80 bg-white p-5 shadow-2xl">
            <h3 className="font-[var(--brand-font-heading)] text-xl font-semibold text-slate-950">
              {t('declineTitle')}
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-500">{t('declineDescription')}</p>
            <textarea
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
              rows={4}
              placeholder={t('declinePlaceholder')}
              className="mt-4 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-orange-300 focus:bg-white focus:ring-4 focus:ring-orange-100"
            />
            <div className="mt-4 flex gap-3">
              <button
                onClick={() => setShowDeclineModal(null)}
                className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700"
              >
                {t('cancel')}
              </button>
              <button
                onClick={handleDeclineConfirm}
                className="flex-1 rounded-2xl bg-red-500 px-4 py-3 text-sm font-semibold text-white hover:bg-red-600"
              >
                {t('confirmDecline')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
