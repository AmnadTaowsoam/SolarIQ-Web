'use client'

import { useState } from 'react'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import {
  useQuoteDetail,
  useAcceptQuote,
  useDeclineQuote,
  useRequestRevision,
} from '@/hooks/useQuotes'
import { QUOTE_STATUS_LABELS, QUOTE_STATUS_COLORS } from '@/types/quotes'

function formatThb(v: number) {
  return `฿${v.toLocaleString('en-US')}`
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
        <h3 className="font-semibold text-gray-800 text-sm">{title}</h3>
      </div>
      <div className="px-4 py-3 space-y-2">{children}</div>
    </div>
  )
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-gray-500">{label}</span>
      <span className={`font-medium ${highlight ? 'text-orange-600 font-bold' : 'text-gray-800'}`}>
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

  const handleAccept = async () => {
    try {
      const result = await accept(quoteId)
      setAcceptedDealId(result.dealId)
    } catch {
      // ignore
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-10 h-10 text-green-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">{t('accepted')}</h2>
          <button
            onClick={() => router.push(`/liff/quotes/deals/${acceptedDealId}`)}
            className="mt-4 w-full py-4 bg-orange-500 text-white rounded-2xl font-bold"
          >
            {t('trackProgress')}
          </button>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500" />
      </div>
    )
  }

  if (!quote) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-gray-500">{t('notFound')}</p>
          <button onClick={() => router.back()} className="mt-3 text-orange-500 text-sm">
            {t('goBack')}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      {/* Header */}
      <div className="bg-orange-500 text-white px-4 py-5 safe-top">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="w-8 h-8 flex items-center justify-center"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold">{t('title')}</h1>
            <p className="text-orange-100 text-xs">{quote.quoteNumber}</p>
          </div>
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-medium ${QUOTE_STATUS_COLORS[quote.status]}`}
          >
            {QUOTE_STATUS_LABELS[quote.status]}
          </span>
        </div>
      </div>

      <div className="px-4 py-5 max-w-lg mx-auto space-y-4">
        {/* Contractor card */}
        {quote.contractor && (
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                <span className="text-orange-600 font-bold">
                  {quote.contractor.companyName.charAt(0)}
                </span>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{quote.contractor.companyName}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-yellow-400 text-sm">★</span>
                  <span className="text-sm font-medium text-gray-700">
                    {quote.contractor.rating.toFixed(1)}
                  </span>
                  <span className="text-xs text-gray-400">
                    ({quote.contractor.totalReviews} {t('reviews')})
                  </span>
                  {quote.contractor.verified && (
                    <span className="text-xs text-blue-600 font-medium">{t('verified')}</span>
                  )}
                </div>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-600">
                  {formatThb(quote.pricing.totalPrice)}
                </p>
                <p className="text-xs text-gray-400">{formatThb(quote.pricing.pricePerKw)}/kW</p>
              </div>
            </div>
          </div>
        )}

        {/* System specs */}
        <Section title={t('sections.systemSpecs')}>
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
          {quote.specifications.batteryBrand && (
            <Row
              label={t('specs.battery')}
              value={`${quote.specifications.batteryBrand} ${quote.specifications.batteryCapacityKwh} kWh`}
            />
          )}
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

        {/* Pricing */}
        <Section title={t('sections.pricing')}>
          <Row label={t('pricing.panelCost')} value={formatThb(quote.pricing.panelCost)} />
          <Row label={t('pricing.inverterCost')} value={formatThb(quote.pricing.inverterCost)} />
          {quote.pricing.batteryCost && (
            <Row label={t('pricing.batteryCost')} value={formatThb(quote.pricing.batteryCost)} />
          )}
          <Row label={t('pricing.mountingCost')} value={formatThb(quote.pricing.mountingCost)} />
          <Row
            label={t('pricing.cableCost')}
            value={formatThb(quote.pricing.cableAndAccessories)}
          />
          <Row label={t('pricing.laborCost')} value={formatThb(quote.pricing.laborCost)} />
          <Row label={t('pricing.permitCost')} value={formatThb(quote.pricing.permitCost)} />
          {quote.pricing.discountAmount > 0 && (
            <div className="flex justify-between text-sm text-green-700">
              <span>{t('pricing.discount')}</span>
              <span className="font-medium">-{formatThb(quote.pricing.discountAmount)}</span>
            </div>
          )}
          <div className="border-t border-gray-100 pt-2 mt-2">
            <Row
              label={`VAT ${quote.pricing.vatRate}%`}
              value={formatThb(quote.pricing.vatAmount)}
            />
            <div className="flex justify-between mt-1">
              <span className="font-bold text-gray-800">{t('pricing.grandTotal')}</span>
              <span className="font-bold text-orange-600 text-base">
                {formatThb(quote.pricing.totalPrice)}
              </span>
            </div>
          </div>
        </Section>

        {/* Savings estimate */}
        <div className="grid grid-cols-3 gap-3">
          {[
            {
              label: t('savings.monthlyProduction'),
              value: `${quote.specifications.estimatedMonthlyKwh.toLocaleString()} kWh`,
            },
            {
              label: t('savings.monthlySavings'),
              value: formatThb(quote.specifications.estimatedMonthlySavingsThb),
            },
            {
              label: t('savings.paybackIn'),
              value: `${quote.specifications.estimatedPaybackYears} ${t('savings.years')}`,
            },
          ].map((item) => (
            <div
              key={item.label}
              className="bg-orange-50 rounded-2xl p-3 text-center border border-orange-100"
            >
              <p className="text-xs text-gray-500 mb-1">{item.label}</p>
              <p className="text-sm font-bold text-orange-700">{item.value}</p>
            </div>
          ))}
        </div>

        {/* Timeline */}
        <Section title={t('sections.timeline')}>
          {quote.timeline.siteSurveyDate && (
            <Row
              label={t('timeline.siteSurvey')}
              value={new Date(quote.timeline.siteSurveyDate).toLocaleDateString('th-TH', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            />
          )}
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

        {/* Warranty */}
        <Section title={t('sections.warranty')}>
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
          {quote.warranty.roofLeakYears && (
            <Row
              label={t('warranty.roofLeak')}
              value={`${quote.warranty.roofLeakYears} ${t('savings.years')}`}
            />
          )}
        </Section>

        {/* Financing */}
        {quote.financing &&
          (quote.financing.installmentAvailable || quote.financing.leasingAvailable) && (
            <Section title={t('sections.financing')}>
              {quote.financing.cashDiscountPct && (
                <Row
                  label={t('financingDetail.cashDiscount')}
                  value={`${quote.financing.cashDiscountPct}%`}
                />
              )}
              {quote.financing.installmentAvailable && quote.financing.installmentMonths && (
                <div>
                  <p className="text-sm text-gray-500 mb-2">
                    {t('financingDetail.installment', {
                      rate: quote.financing.installmentInterestRate || 0,
                    })}
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {quote.financing.installmentMonths.map((m) => {
                      const monthly =
                        quote.financing?.installmentMonthlyAmount?.[m] ||
                        Math.round(quote.pricing.totalPrice / m)
                      return (
                        <div key={m} className="bg-blue-50 rounded-xl p-2 text-center">
                          <p className="text-xs text-gray-500">
                            {m} {t('financingDetail.months')}
                          </p>
                          <p className="text-sm font-bold text-blue-700">
                            {formatThb(monthly)}/{t('financingDetail.perMonth')}
                          </p>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </Section>
          )}

        {/* Notes */}
        {quote.notes && (
          <div className="bg-yellow-50 rounded-2xl p-4 border border-yellow-100">
            <h3 className="font-semibold text-gray-800 text-sm mb-2">{t('notes')}</h3>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{quote.notes}</p>
          </div>
        )}

        {/* Validity */}
        <div className="text-center text-xs text-gray-400">
          {t('validUntil')}{' '}
          {new Date(quote.validUntil).toLocaleDateString('th-TH', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </div>
      </div>

      {/* Fixed action buttons */}
      {!declined && (quote.status === 'submitted' || quote.status === 'viewed') && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-4 safe-bottom">
          <div className="max-w-lg mx-auto space-y-2">
            <button
              onClick={handleAccept}
              disabled={isAccepting}
              className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl font-bold transition-colors disabled:opacity-50"
            >
              {isAccepting ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {t('processing')}
                </span>
              ) : (
                t('acceptQuote')
              )}
            </button>
            <div className="flex gap-2">
              <button
                onClick={() => setShowRevisionModal(true)}
                className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                {t('requestRevision')}
              </button>
              <button
                onClick={handleDecline}
                disabled={isDeclining}
                className="flex-1 py-3 border border-red-200 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 disabled:opacity-50"
              >
                {isDeclining ? '...' : t('decline')}
              </button>
            </div>
          </div>
        </div>
      )}

      {declined && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-4 safe-bottom">
          <div className="max-w-lg mx-auto text-center text-sm text-gray-500">
            {t('declined')}
            {requestId && (
              <button
                onClick={() => router.push(`/liff/quotes/compare/${requestId}`)}
                className="ml-2 text-orange-500 font-medium"
              >
                {t('viewOtherQuotes')}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Revision modal */}
      {showRevisionModal && (
        <div className="fixed inset-0 bg-black/40 flex items-end justify-center z-50">
          <div className="bg-white rounded-t-2xl w-full max-w-lg p-5 space-y-4">
            <h3 className="font-bold text-gray-900">{t('revisionModal.title')}</h3>
            <p className="text-sm text-gray-500">{t('revisionModal.subtitle')}</p>
            <textarea
              value={revisionMessage}
              onChange={(e) => setRevisionMessage(e.target.value)}
              rows={4}
              placeholder={t('revisionModal.placeholder')}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowRevisionModal(false)}
                className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-700"
              >
                {t('revisionModal.cancel')}
              </button>
              <button
                onClick={handleRevision}
                disabled={isRevising || !revisionMessage.trim()}
                className="flex-1 py-3 bg-orange-500 text-white rounded-xl text-sm font-bold hover:bg-orange-600 disabled:opacity-50"
              >
                {isRevising ? '...' : t('revisionModal.submit')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
