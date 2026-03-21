'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useQuoteRequest } from '@/hooks/useQuotes'
import { BUDGET_RANGE_LABELS, TIMELINE_LABELS, FINANCING_LABELS, QuoteRequestStatus } from '@/types/quotes'
import { formatDistanceToNow, isPast, parseISO } from 'date-fns'
import { th } from 'date-fns/locale'

const STATUS_CONFIG: Record<QuoteRequestStatus, { label: string; color: string; description: string }> = {
  open: {
    label: 'รอรับใบเสนอราคา',
    color: 'bg-blue-100 text-blue-800',
    description: 'ผู้รับเหมาที่เหมาะสมได้รับการแจ้งเตือนแล้ว กรุณารอสักครู่',
  },
  quotes_received: {
    label: 'ได้รับใบเสนอราคาแล้ว',
    color: 'bg-green-100 text-green-800',
    description: 'คุณสามารถเปรียบเทียบและเลือกใบเสนอราคาได้เลย',
  },
  closed: {
    label: 'ปิดแล้ว',
    color: 'bg-gray-100 text-gray-600',
    description: 'คำขอนี้ถูกปิดแล้ว (ยอมรับใบเสนอราคาหนึ่งรายแล้ว)',
  },
  expired: {
    label: 'หมดอายุ',
    color: 'bg-red-100 text-red-700',
    description: 'คำขอนี้หมดอายุแล้ว',
  },
  cancelled: {
    label: 'ยกเลิกแล้ว',
    color: 'bg-gray-100 text-gray-600',
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
      <p className="text-xs text-gray-500 mb-0.5">หมดอายุ</p>
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
    if (!request) return
    // Auto-refresh every 30s while open
    if (request.status === 'open' || request.status === 'quotes_received') {
      const interval = setInterval(refetch, 30000)
      return () => clearInterval(interval)
    }
  }, [request, refetch])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">กำลังโหลด...</p>
        </div>
      </div>
    )
  }

  if (!request) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-gray-500">ไม่พบข้อมูลคำขอ</p>
        </div>
      </div>
    )
  }

  const statusInfo = STATUS_CONFIG[request.status]
  const quotesLeft = request.maxQuotes - request.quotesReceived
  const hasQuotes = request.quotesReceived > 0

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-orange-500 text-white px-4 py-6 safe-top">
        <h1 className="text-xl font-bold mb-1">สถานะคำขอใบเสนอราคา</h1>
        <p className="text-orange-100 text-sm">#{requestId.slice(-8).toUpperCase()}</p>
      </div>

      <div className="px-4 py-5 max-w-lg mx-auto space-y-4">
        {/* Status badge */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusInfo.color}`}>
              {statusInfo.label}
            </span>
          </div>
          <p className="text-sm text-gray-600">{statusInfo.description}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl p-4 text-center shadow-sm border border-gray-100">
            <p className="text-3xl font-bold text-blue-600">{request.contractorsNotified}</p>
            <p className="text-xs text-gray-500 mt-1">ผู้รับเหมาที่รับแจ้ง</p>
          </div>
          <div className="bg-white rounded-2xl p-4 text-center shadow-sm border border-gray-100">
            <p className="text-3xl font-bold text-orange-500">{request.quotesReceived}</p>
            <p className="text-xs text-gray-500 mt-1">ใบเสนอราคาที่ได้รับ</p>
          </div>
        </div>

        {/* Progress dots */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-center gap-2 mb-3">
            {Array.from({ length: request.maxQuotes }, (_, i) => (
              <div
                key={i}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  i < request.quotesReceived
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                {i < request.quotesReceived ? '✓' : i + 1}
              </div>
            ))}
          </div>
          <p className="text-center text-sm text-gray-600">
            ได้รับ {request.quotesReceived} จาก {request.maxQuotes} ราคา
          </p>
        </div>

        {/* Countdown */}
        <CountdownTimer expiresAt={request.expiresAt} />

        {/* Request preferences */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-3 text-sm">ความต้องการของคุณ</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">งบประมาณ</span>
              <span className="font-medium text-gray-800">
                {BUDGET_RANGE_LABELS[request.preferences.budgetRange]}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">ไทม์ไลน์</span>
              <span className="font-medium text-gray-800">
                {TIMELINE_LABELS[request.preferences.preferredTimeline].split('(')[0].trim()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">การชำระเงิน</span>
              <span className="font-medium text-gray-800">
                {FINANCING_LABELS[request.preferences.financingPreference]}
              </span>
            </div>
            {request.systemSizeKw && (
              <div className="flex justify-between">
                <span className="text-gray-500">ขนาดระบบ</span>
                <span className="font-medium text-gray-800">{request.systemSizeKw} kW</span>
              </div>
            )}
          </div>
        </div>

        {/* Additional requirements */}
        {request.preferences.additionalRequirements && (
          <div className="bg-yellow-50 rounded-2xl p-4 border border-yellow-200">
            <p className="text-xs font-semibold text-yellow-800 mb-1">ความต้องการพิเศษ</p>
            <p className="text-sm text-gray-700">{request.preferences.additionalRequirements}</p>
          </div>
        )}
      </div>

      {/* Fixed CTA button */}
      {hasQuotes && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-4 safe-bottom">
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
