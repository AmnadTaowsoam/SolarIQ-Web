'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useAuth } from '@/context'
import { AppLayout } from '@/components/layout'
import { QuoteBuilderData } from '@/components/quotes/QuoteBuilder'

function formatThb(v: number) {
  return `฿${v.toLocaleString('en-US')}`
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div
      className={`flex justify-between py-1.5 border-b border-gray-100 text-sm last:border-0 ${bold ? 'font-bold' : ''}`}
    >
      <span className="text-gray-600">{label}</span>
      <span className="text-gray-900">{value}</span>
    </div>
  )
}

export default function QuotePreviewPage() {
  const t = useTranslations('quotePreviewPage')
  const tLabels = useTranslations('quoteBuilderPage.labels')
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const requestId = params.id as string
  const isSubmitted = searchParams.get('submitted') === 'true'
  const { user, isLoading: authLoading } = useAuth()
  const [data, setData] = useState<QuoteBuilderData | null>(null)

  useEffect(() => {
    const stored = sessionStorage.getItem(`quote_preview_${requestId}`)
    if (stored) {
      try {
        setData(JSON.parse(stored))
      } catch {
        // ignore
      }
    }
  }, [requestId])

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  if (!data && !isSubmitted) {
    return (
      <AppLayout user={user}>
        <div className="max-w-3xl mx-auto text-center py-20">
          <p className="text-gray-500">{t('noDataFound')}</p>
          <button
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg text-sm"
          >
            {t('backToCreate')}
          </button>
        </div>
      </AppLayout>
    )
  }

  if (isSubmitted) {
    return (
      <AppLayout user={user}>
        <div className="max-w-md mx-auto text-center py-20">
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
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('submitted.title')}</h2>
          <p className="text-gray-500 mb-6">{t('submitted.description')}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => router.push('/leads/requests')}
              className="px-5 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              {t('submitted.viewOtherRequests')}
            </button>
            <button
              onClick={() => router.push('/deals')}
              className="px-5 py-2.5 bg-orange-500 text-white rounded-lg text-sm font-bold hover:bg-orange-600"
            >
              {t('submitted.goToDeals')}
            </button>
          </div>
        </div>
      </AppLayout>
    )
  }

  const {
    specifications: spec,
    pricing,
    timeline,
    warranty,
    financing,
    additionalServices,
    notes,
  } = data ?? {}

  return (
    <AppLayout user={user}>
      <div className="max-w-3xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-500 mb-1">
              <button onClick={() => router.back()} className="hover:text-orange-500">
                ← {t('edit')}
              </button>
            </div>
            <h1 className="text-xl font-bold text-gray-900">{t('title')}</h1>
          </div>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
              />
            </svg>
            {t('printSave')}
          </button>
        </div>

        {/* Quote preview card */}
        <div className="bg-white rounded-2xl shadow border border-gray-200 overflow-hidden print:shadow-none">
          {/* Header */}
          <div className="bg-orange-500 text-white px-6 py-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">{t('labels.solarQuote')}</h2>
                <p className="text-orange-100 text-sm mt-1">
                  {t('labels.quoteNumber')}: Q-2569-PREVIEW
                </p>
              </div>
              <div className="text-right text-sm text-orange-100">
                <p>
                  {t('labels.date')}:{' '}
                  {new Date().toLocaleDateString('th-TH', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
                <p>
                  {t('labels.validUntil')}:{' '}
                  {new Date(Date.now() + data?.validDays ?? 30 * 86400000).toLocaleDateString(
                    'th-TH',
                    { year: 'numeric', month: 'long', day: 'numeric' }
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* System Specification */}
            <div>
              <h3 className="font-bold text-gray-800 mb-3 pb-1 border-b border-gray-200">
                {t('sections.systemInfo')}
              </h3>
              <div className="grid grid-cols-2 gap-x-8 gap-y-1">
                <Row label={tLabels('panels')} value={`${spec.panelBrand} ${spec.panelModel}`} />
                <Row
                  label={tLabels('panelCount')}
                  value={`${spec.panelCount} ${t('panels')} (${spec.panelWattage}W)`}
                />
                <Row label={tLabels('totalSystemSize')} value={`${spec.totalPanelKw} kW`} bold />
                <Row
                  label={tLabels('inverter')}
                  value={`${spec.inverterBrand} ${spec.inverterModel}`}
                />
                <Row label={tLabels('inverterCapacity')} value={`${spec.inverterCapacityKw} kW`} />
                <Row
                  label={tLabels('mounting')}
                  value={spec.mountingType === 'roof_rail' ? t('onRoof') : spec.mountingType}
                />
                {spec.batteryBrand && (
                  <Row
                    label={t('labels.battery')}
                    value={`${spec.batteryBrand} ${spec.batteryCapacityKwh} kWh`}
                  />
                )}
                <Row
                  label={t('labels.monitoringSystem')}
                  value={
                    spec.monitoringSystem === 'included'
                      ? t('labels.includedInPackage')
                      : t('labels.optional')
                  }
                />
              </div>
            </div>

            {/* Pricing */}
            <div>
              <h3 className="font-bold text-gray-800 mb-3 pb-1 border-b border-gray-200">
                {tLabels('priceDetails')}
              </h3>
              <div className="space-y-0.5">
                <Row label={t('labels.panelCost')} value={formatThb(pricing.panelCost)} />
                <Row label={t('labels.inverterCost')} value={formatThb(pricing.inverterCost)} />
                {pricing.batteryCost && (
                  <Row label={t('labels.batteryCost')} value={formatThb(pricing.batteryCost)} />
                )}
                <Row label={t('labels.mountingCost')} value={formatThb(pricing.mountingCost)} />
                <Row
                  label={t('labels.cableAndAccessories')}
                  value={formatThb(pricing.cableAndAccessories)}
                />
                <Row label={t('labels.laborCost')} value={formatThb(pricing.laborCost)} />
                {pricing.scaffoldingCost && (
                  <Row
                    label={t('labels.scaffoldingCost')}
                    value={formatThb(pricing.scaffoldingCost)}
                  />
                )}
                <Row label={t('labels.permitCost')} value={formatThb(pricing.permitCost)} />
                {pricing.engineeringCost && (
                  <Row
                    label={t('labels.engineeringCost')}
                    value={formatThb(pricing.engineeringCost)}
                  />
                )}
                {pricing.discountAmount > 0 && (
                  <div className="flex justify-between py-1.5 border-b border-gray-100 text-sm text-red-600">
                    <span>
                      {t('labels.discount')}{' '}
                      {pricing.discountReason && `(${pricing.discountReason})`}
                    </span>
                    <span>-{formatThb(pricing.discountAmount)}</span>
                  </div>
                )}
                <Row label={t('labels.subtotal')} value={formatThb(pricing.subtotal)} />
                <Row label={`VAT ${pricing.vatRate}%`} value={formatThb(pricing.vatAmount)} />
                <div className="flex justify-between py-2 mt-2 border-t-2 border-orange-200 font-bold text-base text-orange-700">
                  <span>{t('labels.total')}</span>
                  <span>{formatThb(pricing.totalPrice)}</span>
                </div>
                <p className="text-xs text-gray-400 text-right">
                  {t('labels.pricePerKw')}: {formatThb(pricing.pricePerKw)}/kW
                </p>
              </div>
            </div>

            {/* Timeline */}
            <div>
              <h3 className="font-bold text-gray-800 mb-3 pb-1 border-b border-gray-200">
                {tLabels('timeline')}
              </h3>
              <div className="space-y-0.5">
                {timeline.siteSurveyDate && (
                  <Row
                    label={tLabels('siteSurvey')}
                    value={new Date(timeline.siteSurveyDate).toLocaleDateString('th-TH', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  />
                )}
                <Row
                  label={tLabels('installationStart')}
                  value={new Date(timeline.installationStartDate).toLocaleDateString('th-TH', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                />
                <Row
                  label={tLabels('installationComplete')}
                  value={new Date(timeline.installationEndDate).toLocaleDateString('th-TH', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                />
                <Row
                  label={tLabels('totalDuration')}
                  value={`${timeline.estimatedTotalDays} ${t('days')}`}
                />
              </div>
            </div>

            {/* Warranty */}
            <div>
              <h3 className="font-bold text-gray-800 mb-3 pb-1 border-b border-gray-200">
                {tLabels('warranty')}
              </h3>
              <div className="grid grid-cols-2 gap-x-8 gap-y-0.5">
                <Row
                  label={tLabels('panelPerformance')}
                  value={`${warranty.panelPerformanceYears} ${t('years')}`}
                />
                <Row
                  label={tLabels('panelProduct')}
                  value={`${warranty.panelProductYears} ${t('years')}`}
                />
                <Row
                  label={tLabels('inverter')}
                  value={`${warranty.inverterYears} ${t('years')}`}
                />
                <Row
                  label={tLabels('installationWarranty')}
                  value={`${warranty.installationYears} ${t('years')}`}
                />
                {warranty.roofLeakYears && (
                  <Row
                    label={tLabels('roofLeak')}
                    value={`${warranty.roofLeakYears} ${t('years')}`}
                  />
                )}
                {warranty.batteryYears && (
                  <Row
                    label={tLabels('battery')}
                    value={`${warranty.batteryYears} ${t('years')}`}
                  />
                )}
              </div>
            </div>

            {/* Performance estimate */}
            <div>
              <h3 className="font-bold text-gray-800 mb-3 pb-1 border-b border-gray-200">
                {tLabels('performance')}
              </h3>
              <div className="grid grid-cols-3 gap-4">
                {[
                  {
                    label: tLabels('monthlyProduction'),
                    value: `${spec.estimatedMonthlyKwh.toLocaleString()} kWh`,
                  },
                  {
                    label: tLabels('monthlySavings'),
                    value: formatThb(spec.estimatedMonthlySavingsThb),
                  },
                  {
                    label: tLabels('paybackPeriod'),
                    value: `${spec.estimatedPaybackYears} ${t('years')}`,
                  },
                ].map((item) => (
                  <div key={item.label} className="text-center bg-orange-50 rounded-xl p-3">
                    <p className="text-xs text-gray-500 mb-1">{item.label}</p>
                    <p className="text-sm font-bold text-orange-700">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Financing */}
            {(financing.installmentAvailable || financing.leasingAvailable) && (
              <div>
                <h3 className="font-bold text-gray-800 mb-3 pb-1 border-b border-gray-200">
                  {tLabels('financing')}
                </h3>
                {financing.cashDiscountPct && (
                  <div className="text-sm text-green-700 bg-green-50 rounded-lg px-3 py-2 mb-2">
                    {tLabels('cashPayment')}: {tLabels('cashDiscount')} {financing.cashDiscountPct}%
                  </div>
                )}
                {financing.installmentAvailable && financing.installmentMonths && (
                  <div className="flex flex-wrap gap-2">
                    {financing.installmentMonths.map((m) => {
                      const monthly =
                        financing.installmentMonthlyAmount?.[m] ||
                        Math.round(pricing.totalPrice / m)
                      return (
                        <div
                          key={m}
                          className="text-sm border border-blue-200 rounded-lg px-3 py-1.5 text-center"
                        >
                          <div className="font-medium text-blue-800">
                            {t('labels.installment')} {m} {t('labels.months')}
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatThb(monthly)}/{t('labels.months')}
                          </div>
                          <div className="text-xs text-green-600">
                            {t('labels.interestRate')} {financing.installmentInterestRate || 0}%
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Additional services */}
            {additionalServices.filter((s) => s.included).length > 0 && (
              <div>
                <h3 className="font-bold text-gray-800 mb-2 pb-1 border-b border-gray-200">
                  {t('sections.additionalServices')}
                </h3>
                <ul className="space-y-1">
                  {additionalServices
                    .filter((s) => s.included)
                    .map((s, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                        <svg
                          className="w-4 h-4 text-green-500 flex-shrink-0"
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
                        {s.name}: {s.description}
                      </li>
                    ))}
                </ul>
              </div>
            )}

            {/* Notes */}
            {notes && (
              <div className="bg-yellow-50 rounded-xl p-4">
                <h3 className="font-bold text-gray-800 mb-2">{t('labels.notes')}</h3>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{notes}</p>
              </div>
            )}

            {/* Signature area */}
            <div className="grid grid-cols-2 gap-8 pt-6 border-t border-gray-200">
              {[t('labels.quoter'), t('labels.receiver')].map((label) => (
                <div key={label} className="text-center">
                  <div className="border-b border-gray-400 h-12 mb-2" />
                  <p className="text-sm text-gray-600">
                    {t('labels.signName')} .............................
                  </p>
                  <p className="text-xs text-gray-400 mt-1">{label}</p>
                  <p className="text-xs text-gray-400">
                    {t('labels.signDate')} .....................
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Submit from preview */}
        <div className="flex gap-3 pb-6">
          <button
            onClick={() => router.back()}
            className="flex-1 py-3 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            ← {t('edit')}
          </button>
          <button
            onClick={() => router.push(`/leads/${requestId}/quote?confirm=1`)}
            className="flex-1 py-3 bg-orange-500 hover:bg-orange-600 rounded-xl text-sm font-bold text-white"
          >
            {t('submit')}
          </button>
        </div>
      </div>
    </AppLayout>
  )
}
