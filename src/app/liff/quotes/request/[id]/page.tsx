'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useQuoteRequest } from '@/hooks/useQuotes'
import {
  BUDGET_RANGE_LABELS,
  TIMELINE_LABELS,
  FINANCING_LABELS,
  QuoteRequestStatus,
} from '@/types/quotes'
import { formatDistanceToNow, isPast, parseISO } from 'date-fns'
import { th } from 'date-fns/locale'

const STATUS_CONFIG: Record<
  QuoteRequestStatus,
  { label: string; color: string; description: string }
> = {
  open: {
    label: 'รอรับใบเสนอราคา',
    color: 'bg-blue-500/10 text-blue-800',
    description: 'ผู้รับเหมาที่เหมาะสมได้รับการแจ้งเตือนแล้ว กรุณารอสักครู่',
  },
  quotes_received: {
    label: 'ได้รับใบเสนอราคาแล้ว',
    color: 'bg-green-500/10 text-green-800',
    description: 'คุณสามารถเปรียบเทียบและเลือกใบเสนอราคาได้เลย',
  },
  closed: {
    label: 'ปิดแล้ว',
    color: 'bg-[var(--brand-background)] text-[var(--brand-text-secondary)]',
    description: 'คำขอนี้ถูกปิดแล้ว (ยอมรับใบเสนอราคาหนึ่งรายแล้ว)',
  },
  expired: {
    label: 'หมดอายุ',
    color: 'bg-red-100 text-red-700',
    description: 'คำขอนี้หมดอายุแล้ว',
  },
  cancelled: {
    label: 'ยกเลิกแล้ว',
    color: 'bg-[var(--brand-background)] text-[var(--brand-text-secondary)]',
    description: 'คำขอนี้ถูกยกเลิกแล้ว',
  },
}

function CountdownTimer({ expiresAt }: { expiresAt: string }) {
  const [timeLeft, setTimeLeft] = useState('')

  useEffect(() => {
    const update = () => {
      if (isPast(parseISO(expiresAt))) {
        setTimeLeft('หมดอายุแล้ว')
        return
      }
      setTimeLeft(formatDistanceToNow(parseISO(expiresAt), { locale: th, addSuffix: true }))
    }
    update()
    const interval = setInterval(update, 60000)
    return () => clearInterval(interval)
  }, [expiresAt])

  const isExpired = isPast(parseISO(expiresAt))

  return (
    <div className={`text-center py-3 px-4 rounded-xl ${isExpired ? 'bg-red-50' : 'bg-orange-50'}`}>
      <p className="text-xs text-[var(--brand-text-secondary)] mb-0.5">หมดอายุ</p>
      <p className={`text-sm font-semibold ${isExpired ? 'text-red-600' : 'text-orange-600'}`}>
        {timeLeft}
      </p>
    </div>
  )
}

export default function QuoteRequestStatusPage() {
  const params = useParams()
  const router = useRouter()
  const requestId = params.id as string
  const { data: request, isLoading, refetch } = useQuoteRequest(requestId)

  useEffect(() => {
    if (!request) {
      return undefined
    }
    // Auto-refresh every 30s while open
    if (request.status === 'open' || request.status === 'quotes_received') {
      const interval = setInterval(refetch, 30000)
      return () => clearInterval(interval)
    }
    return undefined
  }, [request, refetch])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--brand-background)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-3" />
          <p className="text-[var(--brand-text-secondary)] text-sm">กำลังโหลด...</p>
        </div>
      </div>
    )
  }

  if (!request) {
    return (
      <div className="min-h-screen bg-[var(--brand-background)] flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-[var(--brand-text-secondary)]">ไม่พบข้อมูลคำขอ</p>
        </div>
      </div>
    )
  }

  const statusInfo = STATUS_CONFIG[request.status]
  const hasQuotes = request.quotesReceived > 0

  return (
    <div className="min-h-screen bg-[var(--brand-background)] pb-24">
      {/* Header */}
      <div className="bg-orange-500 text-white px-4 py-6 safe-top">
        <h1 className="text-xl font-bold mb-1">สถานะคำขอใบเสนอราคา</h1>
        <p className="text-orange-100 text-sm">#{requestId.slice(-8).toUpperCase()}</p>
      </div>

      <div className="px-4 py-5 max-w-lg mx-auto space-y-4">
        {/* Status badge */}
        <div className="bg-[var(--brand-surface)] rounded-2xl p-5 shadow-sm border border-[var(--brand-border)]">
          <div className="flex items-center gap-3 mb-3">
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusInfo.color}`}>
              {statusInfo.label}
            </span>
          </div>
          <p className="text-sm text-[var(--brand-text-secondary)]">{statusInfo.description}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[var(--brand-surface)] rounded-2xl p-4 text-center shadow-sm border border-[var(--brand-border)]">
            <p className="text-3xl font-bold text-blue-600">{request.contractorsNotified}</p>
            <p className="text-xs text-[var(--brand-text-secondary)] mt-1">ผู้รับเหมาที่รับแจ้ง</p>
          </div>
          <div className="bg-[var(--brand-surface)] rounded-2xl p-4 text-center shadow-sm border border-[var(--brand-border)]">
            <p className="text-3xl font-bold text-orange-500">{request.quotesReceived}</p>
            <p className="text-xs text-[var(--brand-text-secondary)] mt-1">ใบเสนอราคาที่ได้รับ</p>
          </div>
        </div>

        {/* Progress dots */}
        <div className="bg-[var(--brand-surface)] rounded-2xl p-5 shadow-sm border border-[var(--brand-border)]">
          <div className="flex items-center justify-center gap-2 mb-3">
            {Array.from({ length: request.maxQuotes }, (_, i) => (
              <div
                key={i}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  i < request.quotesReceived
                    ? 'bg-orange-500 text-white'
                    : 'bg-[var(--brand-background)] text-[var(--brand-text-secondary)]'
                }`}
              >
                {i < request.quotesReceived ? '✓' : i + 1}
              </div>
            ))}
          </div>
          <p className="text-center text-sm text-[var(--brand-text-secondary)]">
            ได้รับ {request.quotesReceived} จาก {request.maxQuotes} ราคา
          </p>
        </div>

        {/* Countdown */}
        <CountdownTimer expiresAt={request.expiresAt} />

        {/* Request preferences */}
        <div className="bg-[var(--brand-surface)] rounded-2xl p-4 shadow-sm border border-[var(--brand-border)]">
          <h3 className="font-semibold text-[var(--brand-text)] mb-3 text-sm">ความต้องการของคุณ</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-[var(--brand-text-secondary)]">งบประมาณ</span>
              <span className="font-medium text-[var(--brand-text)]">
                {BUDGET_RANGE_LABELS[request.preferences.budgetRange]}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--brand-text-secondary)]">ไทม์ไลน์</span>
              <span className="font-medium text-[var(--brand-text)]">
                {(TIMELINE_LABELS[request.preferences.preferredTimeline] ?? '')
                  .split('(')[0]
                  ?.trim()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--brand-text-secondary)]">การชำระเงิน</span>
              <span className="font-medium text-[var(--brand-text)]">
                {FINANCING_LABELS[request.preferences.financingPreference]}
              </span>
            </div>
            {request.systemSizeKw && (
              <div className="flex justify-between">
                <span className="text-[var(--brand-text-secondary)]">ขนาดระบบ</span>
                <span className="font-medium text-[var(--brand-text)]">
                  {request.systemSizeKw} kW
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Additional requirements */}
        {request.preferences.additionalRequirements && (
          <div className="bg-yellow-500/10 rounded-2xl p-4 border border-yellow-500/20">
            <p className="text-xs font-semibold text-yellow-600 mb-1">ความต้องการพิเศษ</p>
            <p className="text-sm text-[var(--brand-text)]">
              {request.preferences.additionalRequirements}
            </p>
          </div>
        )}
      </div>

      {/* Fixed CTA button */}
      {hasQuotes && (
        <div className="fixed bottom-0 left-0 right-0 bg-[var(--brand-surface)] border-t border-[var(--brand-border)] px-4 py-4 safe-bottom">
          <div className="max-w-lg mx-auto">
            <button
              onClick={() => router.push(`/liff/quotes/compare/${requestId}`)}
              className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl font-bold text-base transition-colors"
            >
              ดูใบเสนอราคา ({request.quotesReceived} ราย)
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
