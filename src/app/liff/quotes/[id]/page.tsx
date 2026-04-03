'use client'

import { useMemo, useState } from 'react'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { BadgeCheck, CalendarRange, CircleDollarSign, ShieldCheck, SunMedium } from 'lucide-react'
import {
  LiffHeroCard,
  LiffMetricStrip,
  LiffPageFrame,
  LiffPanel,
  LiffPill,
  LiffPrimaryButton,
} from '@/components/liff/LiffMobileUI'
import {
  useQuoteDetail,
  useAcceptQuote,
  useDeclineQuote,
  useRequestRevision,
} from '@/hooks/useQuotes'
import { formatThb } from '@/lib/utils'
import { QUOTE_STATUS_LABELS, QUOTE_STATUS_COLORS } from '@/types/quotes'

function Section({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle?: string
  children: React.ReactNode
}) {
  return (
    <LiffPanel title={title} subtitle={subtitle}>
      <div className="space-y-2.5">{children}</div>
    </LiffPanel>
  )
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-2xl bg-slate-50/90 px-3 py-3 text-sm">
      <span className="text-slate-500">{label}</span>
      <span
        className={
          highlight
            ? 'text-right font-semibold text-orange-600'
            : 'text-right font-medium text-slate-900'
        }
      >
        {value}
      </span>
    </div>
  )
}

export default function QuoteDetailPage() {
  const t = useTranslations('quoteDetailPage')
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const quoteId = params.id as string
  const requestId = searchParams.get('requestId')

  const { data: quote, isLoading } = useQuoteDetail(quoteId)
  const { accept, isLoading: isAccepting } = useAcceptQuote()
  const { decline, isLoading: isDeclining } = useDeclineQuote()
  const { requestRevision, isLoading: isRevising } = useRequestRevision()

  const [showRevisionModal, setShowRevisionModal] = useState(false)
  const [revisionMessage, setRevisionMessage] = useState('')
  const [acceptedDealId, setAcceptedDealId] = useState<string | null>(null)
  const [declined, setDeclined] = useState(false)

  const overviewMetrics = useMemo(() => {
    if (!quote) {
      return []
    }

    return [
      {
        label: t('overview.systemSize'),
        value: `${quote.specifications.totalPanelKw} kW`,
        hint: `${quote.specifications.panelCount} ${t('specs.panelsUnit')}`,
      },
      {
        label: t('overview.monthlySavings'),
        value: formatThb(quote.specifications.estimatedMonthlySavingsThb),
        hint: t('pricing.perMonth'),
      },
      {
        label: t('overview.payback'),
        value: `${quote.specifications.estimatedPaybackYears} ${t('savings.years')}`,
        hint: t('overview.returnHint'),
      },
    ]
  }, [quote, t])

  const handleAccept = async () => {
    try {
      const result = await accept(quoteId)
      setAcceptedDealId(result.dealId)
    } catch {
      // handled in hook state elsewhere
    }
  }

  const handleDecline = async () => {
    await decline(quoteId)
    setDeclined(true)
  }

  const handleRevision = async () => {
    await requestRevision(quoteId, revisionMessage, ['lower_price'])
    setShowRevisionModal(false)
  }

  if (acceptedDealId) {
    return (
      <LiffPageFrame className="flex items-center justify-center">
        <div className="w-full max-w-sm">
          <LiffHeroCard
            accent="green"
            eyebrow={t('acceptedEyebrow')}
            title={t('accepted')}
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
          <div className="mt-4">
            <LiffPrimaryButton
              accent="green"
              className="w-full"
              onClick={() => router.push(`/liff/quotes/deals/${acceptedDealId}`)}
            >
              {t('trackProgress')}
            </LiffPrimaryButton>
          </div>
        </div>
      </LiffPageFrame>
    )
  }

  if (isLoading) {
    return (
      <LiffPageFrame className="flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-orange-500" />
          <p className="mt-4 text-sm text-slate-500">{t('loading')}</p>
        </div>
      </LiffPageFrame>
    )
  }

  if (!quote) {
    return (
      <LiffPageFrame className="flex items-center justify-center">
        <LiffPanel
          title={t('notFound')}
          subtitle={t('notFoundDescription')}
          className="w-full max-w-sm"
        >
          <button onClick={() => router.back()} className="text-sm font-semibold text-orange-600">
            {t('goBack')}
          </button>
        </LiffPanel>
      </LiffPageFrame>
    )
  }

  return (
    <LiffPageFrame className="pb-36">
      <LiffHeroCard
        title={t('title')}
        description={t('heroDescription')}
        eyebrow={quote.quoteNumber}
        badge={QUOTE_STATUS_LABELS[quote.status]}
        onBack={() => router.back()}
      >
        <div className="rounded-[24px] border border-white/80 bg-white/80 p-4 shadow-sm backdrop-blur-sm">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-base font-bold text-white shadow-sm">
                {quote.contractor?.companyName?.charAt(0) ?? 'S'}
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate font-semibold text-slate-950">
                    {quote.contractor?.companyName ?? t('unknownContractor')}
                  </p>
                  {quote.contractor?.verified ? (
                    <LiffPill tone="info">
                      <BadgeCheck className="mr-1 h-3.5 w-3.5" />
                      {t('verified')}
                    </LiffPill>
                  ) : null}
                </div>
                {quote.contractor ? (
                  <div className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                    <span className="text-amber-400">★</span>
                    <span className="font-medium text-slate-900">
                      {quote.contractor.rating.toFixed(1)}
                    </span>
                    <span>
                      ({quote.contractor.totalReviews} {t('reviews')})
                    </span>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="text-right">
              <p className="text-[11px] uppercase tracking-[0.14em] text-slate-400">
                {t('pricing.grandTotal')}
              </p>
              <p className="mt-1 text-2xl font-bold text-orange-600">
                {formatThb(quote.pricing.totalPrice)}
              </p>
              <p className="text-xs text-slate-500">{formatThb(quote.pricing.pricePerKw)}/kW</p>
            </div>
          </div>
        </div>
        <LiffMetricStrip items={overviewMetrics} />
      </LiffHeroCard>

      <div className="mt-4 space-y-4">
        <div className="grid grid-cols-3 gap-3">
          {[
            {
              label: t('savings.monthlyProduction'),
              value: `${quote.specifications.estimatedMonthlyKwh.toLocaleString()} kWh`,
              icon: <SunMedium className="h-4 w-4" />,
            },
            {
              label: t('overview.monthlySavings'),
              value: formatThb(quote.specifications.estimatedMonthlySavingsThb),
              icon: <CircleDollarSign className="h-4 w-4" />,
            },
            {
              label: t('overview.installWindow'),
              value: `${quote.timeline.estimatedTotalDays} ${t('timeline.days')}`,
              icon: <CalendarRange className="h-4 w-4" />,
            },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-[24px] border border-white/75 bg-white/85 p-3 shadow-sm"
            >
              <div className="text-slate-400">{item.icon}</div>
              <p className="mt-3 text-[11px] uppercase tracking-[0.12em] text-slate-400">
                {item.label}
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-950">{item.value}</p>
            </div>
          ))}
        </div>

        <Section title={t('sections.systemSpecs')} subtitle={t('sectionDescriptions.systemSpecs')}>
          <Row
            label={t('specs.solarPanel')}
            value={`${quote.specifications.panelBrand} ${quote.specifications.panelModel}`}
          />
          <Row
            label={t('specs.panelCount')}
            value={`${quote.specifications.panelCount} ${t('specs.panelsUnit')} (${quote.specifications.panelWattage}W)`}
          />
          <Row
            label={t('specs.totalSystemSize')}
            value={`${quote.specifications.totalPanelKw} kW`}
            highlight
          />
          <Row
            label={t('specs.inverter')}
            value={`${quote.specifications.inverterBrand} ${quote.specifications.inverterModel}`}
          />
          {quote.specifications.batteryBrand ? (
            <Row
              label={t('specs.battery')}
              value={`${quote.specifications.batteryBrand} ${quote.specifications.batteryCapacityKwh} kWh`}
            />
          ) : null}
          <Row
            label={t('specs.mounting')}
            value={
              quote.specifications.mountingType === 'roof_rail'
                ? t('specs.mountingRoofRail')
                : quote.specifications.mountingType === 'ballast'
                  ? 'Ballast'
                  : quote.specifications.mountingType === 'ground'
                    ? t('specs.mountingGround')
                    : 'Carport'
            }
          />
          <Row
            label={t('specs.monitoring')}
            value={
              quote.specifications.monitoringSystem === 'included'
                ? t('specs.monitoringIncluded')
                : t('specs.monitoringOptional')
            }
          />
        </Section>

        <Section title={t('sections.pricing')} subtitle={t('sectionDescriptions.pricing')}>
          <Row label={t('pricing.panelCost')} value={formatThb(quote.pricing.panelCost)} />
          <Row label={t('pricing.inverterCost')} value={formatThb(quote.pricing.inverterCost)} />
          {quote.pricing.batteryCost ? (
            <Row label={t('pricing.batteryCost')} value={formatThb(quote.pricing.batteryCost)} />
          ) : null}
          <Row label={t('pricing.mountingCost')} value={formatThb(quote.pricing.mountingCost)} />
          <Row
            label={t('pricing.cableCost')}
            value={formatThb(quote.pricing.cableAndAccessories)}
          />
          <Row label={t('pricing.laborCost')} value={formatThb(quote.pricing.laborCost)} />
          <Row label={t('pricing.permitCost')} value={formatThb(quote.pricing.permitCost)} />
          {quote.pricing.discountAmount > 0 ? (
            <Row
              label={t('pricing.discount')}
              value={`-${formatThb(quote.pricing.discountAmount)}`}
              highlight
            />
          ) : null}
          <Row label={`VAT ${quote.pricing.vatRate}%`} value={formatThb(quote.pricing.vatAmount)} />
          <div className="rounded-2xl bg-orange-50 px-4 py-3 text-sm ring-1 ring-orange-100">
            <div className="flex items-center justify-between gap-3">
              <span className="font-semibold text-slate-900">{t('pricing.grandTotal')}</span>
              <span className="text-lg font-bold text-orange-600">
                {formatThb(quote.pricing.totalPrice)}
              </span>
            </div>
          </div>
        </Section>

        <Section title={t('sections.timeline')} subtitle={t('sectionDescriptions.timeline')}>
          {quote.timeline.siteSurveyDate ? (
            <Row
              label={t('timeline.siteSurvey')}
              value={new Date(quote.timeline.siteSurveyDate).toLocaleDateString('th-TH', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            />
          ) : null}
          <Row
            label={t('timeline.installStart')}
            value={new Date(quote.timeline.installationStartDate).toLocaleDateString('th-TH', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          />
          <Row
            label={t('timeline.installEnd')}
            value={new Date(quote.timeline.installationEndDate).toLocaleDateString('th-TH', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
            highlight
          />
          <Row
            label={t('timeline.duration')}
            value={`${quote.timeline.estimatedTotalDays} ${t('timeline.days')}`}
          />
        </Section>

        <Section title={t('sections.warranty')} subtitle={t('sectionDescriptions.warranty')}>
          <Row
            label={t('warranty.panelPerformance')}
            value={`${quote.warranty.panelPerformanceYears} ${t('savings.years')}`}
          />
          <Row
            label={t('warranty.panelProduct')}
            value={`${quote.warranty.panelProductYears} ${t('savings.years')}`}
          />
          <Row
            label={t('warranty.inverter')}
            value={`${quote.warranty.inverterYears} ${t('savings.years')}`}
          />
          <Row
            label={t('warranty.installation')}
            value={`${quote.warranty.installationYears} ${t('savings.years')}`}
          />
          {quote.warranty.roofLeakYears ? (
            <Row
              label={t('warranty.roofLeak')}
              value={`${quote.warranty.roofLeakYears} ${t('savings.years')}`}
            />
          ) : null}
        </Section>

        {quote.financing &&
        (quote.financing.installmentAvailable || quote.financing.leasingAvailable) ? (
          <Section title={t('sections.financing')} subtitle={t('sectionDescriptions.financing')}>
            {quote.financing.cashDiscountPct ? (
              <Row
                label={t('financingDetail.cashDiscount')}
                value={`${quote.financing.cashDiscountPct}%`}
              />
            ) : null}
            {quote.financing.installmentAvailable && quote.financing.installmentMonths ? (
              <div className="space-y-3 rounded-2xl bg-sky-50 p-4 ring-1 ring-sky-100">
                <p className="text-sm text-sky-800">
                  {t('financingDetail.installment', {
                    rate: quote.financing.installmentInterestRate || 0,
                  })}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {quote.financing.installmentMonths.map((months) => {
                    const monthly =
                      quote.financing?.installmentMonthlyAmount?.[months] ||
                      Math.round(quote.pricing.totalPrice / months)

                    return (
                      <div
                        key={months}
                        className="rounded-2xl bg-white px-3 py-3 text-center shadow-sm"
                      >
                        <p className="text-[11px] uppercase tracking-[0.12em] text-slate-400">
                          {months} {t('financingDetail.months')}
                        </p>
                        <p className="mt-2 text-sm font-semibold text-slate-950">
                          {formatThb(monthly)}/{t('financingDetail.perMonth')}
                        </p>
                      </div>
                    )
                  })}
                </div>
              </div>
            ) : null}
          </Section>
        ) : null}

        {quote.notes ? (
          <LiffPanel title={t('notes')} subtitle={t('notesDescription')}>
            <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">{quote.notes}</p>
          </LiffPanel>
        ) : null}

        <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-center text-xs text-amber-800">
          {t('validUntil')}{' '}
          {new Date(quote.validUntil).toLocaleDateString('th-TH', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </div>
      </div>

      {!declined && (quote.status === 'submitted' || quote.status === 'viewed') ? (
        <div className="fixed bottom-0 left-0 right-0 border-t border-white/70 bg-white/88 px-4 py-4 backdrop-blur-xl">
          <div className="mx-auto max-w-lg space-y-2">
            <div className="flex items-center justify-between rounded-2xl bg-slate-950 px-4 py-3 text-white">
              <div>
                <p className="text-[11px] uppercase tracking-[0.14em] text-slate-300">
                  {t('actionBar.title')}
                </p>
                <p className="mt-1 text-sm font-semibold">{formatThb(quote.pricing.totalPrice)}</p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${QUOTE_STATUS_COLORS[quote.status]}`}
              >
                {QUOTE_STATUS_LABELS[quote.status]}
              </span>
            </div>
            <LiffPrimaryButton onClick={handleAccept} disabled={isAccepting} className="w-full">
              {isAccepting ? t('processing') : t('acceptQuote')}
            </LiffPrimaryButton>
            <div className="flex gap-2">
              <button
                onClick={() => setShowRevisionModal(true)}
                className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700"
              >
                {t('requestRevision')}
              </button>
              <button
                onClick={handleDecline}
                disabled={isDeclining}
                className="flex-1 rounded-2xl border border-red-200 bg-white px-4 py-3 text-sm font-semibold text-red-600"
              >
                {isDeclining ? '...' : t('decline')}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {declined ? (
        <div className="fixed bottom-0 left-0 right-0 border-t border-white/70 bg-white/92 px-4 py-4 backdrop-blur-xl">
          <div className="mx-auto max-w-lg rounded-2xl bg-slate-950 px-4 py-3 text-center text-sm text-white">
            {t('declined')}
            {requestId ? (
              <button
                onClick={() => router.push(`/liff/quotes/compare/${requestId}`)}
                className="ml-2 font-semibold text-orange-300"
              >
                {t('viewOtherQuotes')}
              </button>
            ) : null}
          </div>
        </div>
      ) : null}

      {showRevisionModal ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/50 px-4 pb-4 pt-10 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-[28px] border border-white/80 bg-white p-5 shadow-2xl">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-orange-500" />
              <h3 className="font-[var(--brand-font-heading)] text-xl font-semibold text-slate-950">
                {t('revisionModal.title')}
              </h3>
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-500">{t('revisionModal.subtitle')}</p>
            <textarea
              value={revisionMessage}
              onChange={(e) => setRevisionMessage(e.target.value)}
              rows={4}
              placeholder={t('revisionModal.placeholder')}
              className="mt-4 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-orange-300 focus:bg-white focus:ring-4 focus:ring-orange-100"
            />
            <div className="mt-4 flex gap-3">
              <button
                onClick={() => setShowRevisionModal(false)}
                className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700"
              >
                {t('revisionModal.cancel')}
              </button>
              <LiffPrimaryButton
                onClick={handleRevision}
                disabled={isRevising || !revisionMessage.trim()}
                className="flex-1"
              >
                {isRevising ? t('processing') : t('revisionModal.submit')}
              </LiffPrimaryButton>
            </div>
          </div>
        </div>
      ) : null}
    </LiffPageFrame>
  )
}
