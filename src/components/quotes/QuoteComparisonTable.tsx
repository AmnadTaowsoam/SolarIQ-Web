'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
      <span className="text-sm font-semibold text-gray-800">{rating.toFixed(1)}</span>
      <span className="text-xs text-gray-400">({count})</span>
    </div>
  )
}

function Badge({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${color}`}>
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
  const [sortKey, setSortKey] = useState<SortKey>('price')
  const [showDeclineModal, setShowDeclineModal] = useState<string | null>(null)
  const [declineReason, setDeclineReason] = useState('')

  const sorted = [...data.quotes].sort((a, b) => {
    if (sortKey === 'price') return a.pricing.totalPrice - b.pricing.totalPrice
    if (sortKey === 'rating') return b.contractor.rating - a.contractor.rating
    if (sortKey === 'fast') return a.timeline.totalDays - b.timeline.totalDays
    return 0
  })

  const getBadges = (item: QuoteComparisonItem): Array<{ label: string; color: string }> => {
    const badges: Array<{ label: string; color: string }> = []
    if (data.analysis?.cheapest === item.quoteId) {
      badges.push({ label: 'ราคาดีที่สุด', color: 'bg-green-100 text-green-800' })
    }
    if (data.analysis?.highestRated === item.quoteId) {
      badges.push({ label: 'เรตติ้งสูงสุด', color: 'bg-yellow-100 text-yellow-800' })
    }
    if (data.analysis?.fastest === item.quoteId) {
      badges.push({ label: 'เร็วที่สุด', color: 'bg-blue-100 text-blue-800' })
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
          { key: 'price' as SortKey, label: 'ราคา' },
          { key: 'rating' as SortKey, label: 'เรตติ้ง' },
          { key: 'fast' as SortKey, label: 'เร็วที่สุด' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setSortKey(tab.key)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
              sortKey === tab.key
                ? 'bg-orange-500 text-white shadow-sm'
                : 'bg-white text-gray-600 border border-gray-200'
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
        const installmentMonth = item.pricing.monthlyInstallment
          ? Object.entries({}).reduce((_, [k]) => k, '36')
          : null

        return (
          <div
            key={item.quoteId}
            className={`bg-white rounded-2xl border-2 shadow-sm overflow-hidden transition-all ${
              badges.some((b) => b.label === 'ราคาดีที่สุด')
                ? 'border-green-400'
                : index === 0
                ? 'border-orange-400'
                : 'border-gray-200'
            }`}
          >
            {/* Top banner for best options */}
            {index === 0 && sortKey === 'price' && (
              <div className="bg-orange-500 text-white text-xs font-bold text-center py-1.5">
                อันดับที่ 1 — {sortKey === 'price' ? 'ราคาถูกที่สุด' : sortKey === 'rating' ? 'เรตติ้งสูงสุด' : 'เร็วที่สุด'}
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
                    <p className="font-semibold text-gray-900 text-sm">{item.contractor.companyName}</p>
                    <StarRating rating={item.contractor.rating} count={item.contractor.totalReviews} />
                  </div>
                </div>
                {item.contractor.verified && (
                  <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium border border-blue-100">
                    ✓ ยืนยันแล้ว
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
              <div className="bg-gray-50 rounded-xl p-3">
                <div className="flex items-baseline justify-between mb-1">
                  <span className="text-gray-500 text-xs">ราคารวมทั้งสิ้น</span>
                  {item.pricing.discountPct > 0 && (
                    <span className="text-xs text-green-600 font-medium">
                      ลด {item.pricing.discountPct.toFixed(1)}%
                    </span>
                  )}
                </div>
                <p className="text-2xl font-bold text-orange-600">{formatThb(item.pricing.totalPrice)}</p>
                <p className="text-xs text-gray-400">{formatThb(item.pricing.pricePerKw)}/kW</p>
                {item.pricing.hasFinancing && item.pricing.monthlyInstallment && (
                  <p className="text-xs text-blue-600 mt-1 font-medium">
                    หรือผ่อน {formatThb(item.pricing.monthlyInstallment)}/เดือน
                  </p>
                )}
              </div>

              {/* System specs comparison rows */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">แผงโซลาร์</span>
                  <span className="font-medium text-gray-800 text-right">
                    {item.system.panelBrand} {item.system.panelWattage}W × {item.system.panelCount}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">ขนาดรวม</span>
                  <span className="font-medium text-gray-800">{item.system.totalKw.toFixed(2)} kW</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">อินเวอร์เตอร์</span>
                  <span className="font-medium text-gray-800">{item.system.inverterBrand}</span>
                </div>
                {item.system.hasBattery && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">แบตเตอรี่</span>
                    <span className="font-medium text-green-600">มีแบตเตอรี่</span>
                  </div>
                )}
              </div>

              {/* Timeline */}
              <div className="flex items-center justify-between text-sm bg-blue-50 rounded-xl px-3 py-2">
                <div>
                  <p className="text-gray-500 text-xs">ติดตั้งเสร็จ</p>
                  <p className="font-medium text-gray-800">
                    {new Date(item.timeline.installationEnd).toLocaleDateString('th-TH', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-gray-500 text-xs">ระยะเวลา</p>
                  <p className="font-medium text-gray-800">{item.timeline.totalDays} วัน</p>
                </div>
                <div className="text-right">
                  <p className="text-gray-500 text-xs">ประหยัด/เดือน</p>
                  <p className="font-medium text-green-700">{formatThb(item.savings.monthlySavingsThb)}</p>
                </div>
              </div>

              {/* Warranty quick view */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="bg-gray-50 rounded-lg py-2">
                  <p className="text-gray-400">แผง</p>
                  <p className="font-bold text-gray-700">{item.warranty.panelYears} ปี</p>
                </div>
                <div className="bg-gray-50 rounded-lg py-2">
                  <p className="text-gray-400">อินเวอร์เตอร์</p>
                  <p className="font-bold text-gray-700">{item.warranty.inverterYears} ปี</p>
                </div>
                <div className="bg-gray-50 rounded-lg py-2">
                  <p className="text-gray-400">ติดตั้ง</p>
                  <p className="font-bold text-gray-700">{item.warranty.installationYears} ปี</p>
                </div>
              </div>

              {/* Payback */}
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">คืนทุนใน</span>
                <span className="font-bold text-orange-700">{item.savings.paybackYears.toFixed(1)} ปี</span>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => onViewDetail(item.quoteId)}
                  className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  ดูรายละเอียด
                </button>
                <button
                  onClick={() => setShowDeclineModal(item.quoteId)}
                  className="py-2.5 px-3 border border-red-200 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
                >
                  ปฏิเสธ
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
                  {isAcceptingThis ? '...' : 'เลือกรายนี้'}
                </button>
              </div>
            </div>
          </div>
        )
      })}

      {/* Decline modal */}
      {showDeclineModal && (
        <div className="fixed inset-0 bg-black/40 flex items-end justify-center z-50">
          <div className="bg-white rounded-t-2xl w-full max-w-lg p-5 space-y-4">
            <h3 className="font-bold text-gray-900">ปฏิเสธใบเสนอราคา</h3>
            <p className="text-sm text-gray-500">กรุณาระบุเหตุผล (ไม่บังคับ)</p>
            <textarea
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
              rows={3}
              placeholder="เช่น ราคาสูงเกินไป, ต้องการยี่ห้ออื่น..."
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-300"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeclineModal(null)}
                className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-700"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleDeclineConfirm}
                className="flex-1 py-3 bg-red-500 text-white rounded-xl text-sm font-bold hover:bg-red-600"
              >
                ยืนยันปฏิเสธ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
