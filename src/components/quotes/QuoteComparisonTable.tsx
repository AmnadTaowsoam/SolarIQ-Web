'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { QuoteComparisonData, QuoteComparisonItem } from '@/types/quotes'

interface QuoteComparisonTableProps {
  data: QuoteComparisonData
  onAccept: (quoteId: string) => void
  onDecline: (quoteId: string) => void
  onViewDetail: (quoteId: string) => void
  isAccepting?: string | null
}

type SortKey = 'price' | 'rating' | 'fast'

function formatThb(v: number) {
  return `฿${v.toLocaleString('en-US')}`
}

function StarRating({ rating, count }: { rating: number; count: number }) {
  return (
    <div className="flex items-center gap-1">
      <span className="text-yellow-400 text-sm">★</span>
      <span className="text-sm font-semibold text-[var(--brand-text)]">{rating.toFixed(1)}</span>
      <span className="text-xs text-[var(--brand-text-secondary)]">({count})</span>
    </div>
  )
}

function Badge({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${color}`}
    >
      {children}
    </span>
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

  const sorted = [...data.quotes].sort((a, b) => {
    if (sortKey === 'price') {
      return a.pricing.totalPrice - b.pricing.totalPrice
    }
    if (sortKey === 'rating') {
      return b.contractor.rating - a.contractor.rating
    }
    if (sortKey === 'fast') {
      return a.timeline.totalDays - b.timeline.totalDays
    }
    return 0
  })

  const getBadges = (item: QuoteComparisonItem): Array<{ label: string; color: string }> => {
    const badges: Array<{ label: string; color: string }> = []
    if (data.analysis?.cheapest === item.quoteId) {
      badges.push({ label: t('best'), color: 'bg-green-500/10 text-green-800' })
    }
    if (data.analysis?.highestRated === item.quoteId) {
      badges.push({ label: t('premium'), color: 'bg-yellow-500/10 text-yellow-600' })
    }
    if (data.analysis?.fastest === item.quoteId) {
      badges.push({ label: t('basic'), color: 'bg-blue-500/10 text-blue-800' })
    }
    return badges
  }

  const handleDeclineConfirm = () => {
    if (showDeclineModal) {
      onDecline(showDeclineModal)
      setShowDeclineModal(null)
      setDeclineReason('')
    }
  }

  return (
    <div className="space-y-4">
      {/* Sort tabs */}
      <div className="flex gap-2">
        {[
          { key: 'price' as SortKey, label: t('totalCost') },
          { key: 'rating' as SortKey, label: t('recommended') },
          { key: 'fast' as SortKey, label: t('basic') },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setSortKey(tab.key)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
              sortKey === tab.key
                ? 'bg-orange-500 text-white shadow-sm'
                : 'bg-[var(--brand-surface)] text-[var(--brand-text-secondary)] border border-[var(--brand-border)]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Quote cards */}
      {sorted.map((item, index) => {
        const badges = getBadges(item)
        const isAcceptingThis = isAccepting === item.quoteId
        const _installmentMonth = item.pricing.monthlyInstallment
          ? Object.entries({}).reduce((_, [k]) => k, '36')
          : null

        return (
          <div
            key={item.quoteId}
            className={`bg-[var(--brand-surface)] rounded-2xl border-2 shadow-sm overflow-hidden transition-all ${
              badges.some((b) => b.label === t('best'))
                ? 'border-green-400'
                : index === 0
                  ? 'border-orange-400'
                  : 'border-[var(--brand-border)]'
            }`}
          >
            {/* Top banner for best options */}
            {index === 0 && sortKey === 'price' && (
              <div className="bg-orange-500 text-white text-xs font-bold text-center py-1.5">
                {t('recommended')} —{' '}
                {sortKey === 'price' ? t('best') : sortKey === 'rating' ? t('premium') : t('basic')}
              </div>
            )}

            <div className="p-4 space-y-4">
              {/* Contractor info */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-orange-600 font-bold text-sm">
                      {item.contractor.companyName.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-[var(--brand-text)] text-sm">
                      {item.contractor.companyName}
                    </p>
                    <StarRating
                      rating={item.contractor.rating}
                      count={item.contractor.totalReviews}
                    />
                  </div>
                </div>
                {item.contractor.verified && (
                  <span className="text-xs bg-blue-500/10 text-blue-700 px-2 py-0.5 rounded-full font-medium border border-blue-100">
                    ✓ {t('select')}
                  </span>
                )}
              </div>

              {/* Badges */}
              {badges.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {badges.map((b) => (
                    <Badge key={b.label} color={b.color}>
                      {b.label}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Price */}
              <div className="bg-[var(--brand-background)] rounded-xl p-3">
                <div className="flex items-baseline justify-between mb-1">
                  <span className="text-[var(--brand-text-secondary)] text-xs">
                    {t('totalCost')}
                  </span>
                  {item.pricing.discountPct > 0 && (
                    <span className="text-xs text-green-600 font-medium">
                      {t('saving')} {item.pricing.discountPct.toFixed(1)}%
                    </span>
                  )}
                </div>
                <p className="text-2xl font-bold text-orange-600">
                  {formatThb(item.pricing.totalPrice)}
                </p>
                <p className="text-xs text-[var(--brand-text-secondary)]">
                  {formatThb(item.pricing.pricePerKw)}/kW
                </p>
                {item.pricing.hasFinancing && item.pricing.monthlyInstallment && (
                  <p className="text-xs text-blue-600 mt-1 font-medium">
                    {t('perMonth')}: {formatThb(item.pricing.monthlyInstallment)}
                  </p>
                )}
              </div>

              {/* System specs comparison rows */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[var(--brand-text-secondary)]">{t('panelBrand')}</span>
                  <span className="font-medium text-[var(--brand-text)] text-right">
                    {item.system.panelBrand} {item.system.panelWattage}W × {item.system.panelCount}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--brand-text-secondary)]">{t('systemSize')}</span>
                  <span className="font-medium text-[var(--brand-text)]">
                    {item.system.totalKw.toFixed(2)} kW
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--brand-text-secondary)]">{t('inverterBrand')}</span>
                  <span className="font-medium text-[var(--brand-text)]">
                    {item.system.inverterBrand}
                  </span>
                </div>
                {item.system.hasBattery && (
                  <div className="flex justify-between">
                    <span className="text-[var(--brand-text-secondary)]">{t('equipment')}</span>
                    <span className="font-medium text-green-600">{t('equipment')}</span>
                  </div>
                )}
              </div>

              {/* Timeline */}
              <div className="flex items-center justify-between text-sm bg-blue-500/10 rounded-xl px-3 py-2">
                <div>
                  <p className="text-[var(--brand-text-secondary)] text-xs">{t('installation')}</p>
                  <p className="font-medium text-[var(--brand-text)]">
                    {new Date(item.timeline.installationEnd).toLocaleDateString('th-TH', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-[var(--brand-text-secondary)] text-xs">{t('vs')}</p>
                  <p className="font-medium text-[var(--brand-text)]">
                    {item.timeline.totalDays} {t('years')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[var(--brand-text-secondary)] text-xs">{t('perMonth')}</p>
                  <p className="font-medium text-green-700">
                    {formatThb(item.savings.monthlySavingsThb)}
                  </p>
                </div>
              </div>

              {/* Warranty quick view */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="bg-[var(--brand-background)] rounded-lg py-2">
                  <p className="text-[var(--brand-text-secondary)]">{t('feature')}</p>
                  <p className="font-bold text-[var(--brand-text)]">
                    {item.warranty.panelYears} {t('years')}
                  </p>
                </div>
                <div className="bg-[var(--brand-background)] rounded-lg py-2">
                  <p className="text-[var(--brand-text-secondary)]">{t('inverterBrand')}</p>
                  <p className="font-bold text-[var(--brand-text)]">
                    {item.warranty.inverterYears} {t('years')}
                  </p>
                </div>
                <div className="bg-[var(--brand-background)] rounded-lg py-2">
                  <p className="text-[var(--brand-text-secondary)]">{t('installation')}</p>
                  <p className="font-bold text-[var(--brand-text)]">
                    {item.warranty.installationYears} {t('years')}
                  </p>
                </div>
              </div>

              {/* Payback */}
              <div className="flex justify-between items-center text-sm">
                <span className="text-[var(--brand-text-secondary)]">{t('payback')}</span>
                <span className="font-bold text-orange-700">
                  {item.savings.paybackYears.toFixed(1)} {t('years')}
                </span>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => onViewDetail(item.quoteId)}
                  className="flex-1 py-2.5 border border-[var(--brand-border)] rounded-xl text-sm font-medium text-[var(--brand-text)] hover:bg-[var(--brand-background)] transition-colors"
                >
                  {t('compare')}
                </button>
                <button
                  onClick={() => setShowDeclineModal(item.quoteId)}
                  className="py-2.5 px-3 border border-red-500/20 rounded-xl text-sm font-medium text-red-500 hover:bg-red-500/10 transition-colors"
                >
                  {t('close')}
                </button>
                <button
                  onClick={() => onAccept(item.quoteId)}
                  disabled={!!isAccepting}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-colors ${
                    isAcceptingThis
                      ? 'bg-orange-200 text-orange-400 cursor-wait'
                      : 'bg-orange-500 text-white hover:bg-orange-600'
                  }`}
                >
                  {isAcceptingThis ? '...' : t('select')}
                </button>
              </div>
            </div>
          </div>
        )
      })}

      {/* Decline modal */}
      {showDeclineModal && (
        <div className="fixed inset-0 bg-black/40 flex items-end justify-center z-50">
          <div className="bg-[var(--brand-surface)] rounded-t-2xl w-full max-w-lg p-5 space-y-4">
            <h3 className="font-bold text-[var(--brand-text)]">{t('title')}</h3>
            <p className="text-sm text-[var(--brand-text-secondary)]">{t('noQuotes')}</p>
            <textarea
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
              rows={3}
              placeholder="เช่น ราคาสูงเกินไป, ต้องการยี่ห้ออื่น..."
              className="w-full border border-[var(--brand-border)] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-300"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeclineModal(null)}
                className="flex-1 py-3 border border-[var(--brand-border)] rounded-xl text-sm font-medium text-[var(--brand-text)]"
              >
                {t('close')}
              </button>
              <button
                onClick={handleDeclineConfirm}
                className="flex-1 py-3 bg-red-500 text-white rounded-xl text-sm font-bold hover:bg-red-600"
              >
                {t('export')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
