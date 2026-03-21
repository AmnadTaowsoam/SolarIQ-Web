'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { QuoteComparisonTable } from '@/components/quotes/QuoteComparisonTable'
import { useQuoteComparison, useAcceptQuote, useDeclineQuote } from '@/hooks/useQuotes'

export default function QuoteComparePage() {
  const params = useParams()
  const router = useRouter()
  const requestId = params.requestId as string
  const { data, isLoading, error } = useQuoteComparison(requestId)
  const { accept, isLoading: isAccepting } = useAcceptQuote()
  const { decline } = useDeclineQuote()
  const [acceptingId, setAcceptingId] = useState<string | null>(null)
  const [acceptedDealId, setAcceptedDealId] = useState<string | null>(null)
  const [localDeclined, setLocalDeclined] = useState<Set<string>>(new Set())
  const [errorMsg, setErrorMsg] = useState('')

  const handleAccept = async (quoteId: string) => {
    setAcceptingId(quoteId)
    setErrorMsg('')
    try {
      const result = await accept(quoteId)
      setAcceptedDealId(result.dealId)
    } catch {
      setErrorMsg('ไม่สามารถยอมรับใบเสนอราคาได้ กรุณาลองใหม่')
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">ยอมรับใบเสนอราคาแล้ว!</h2>
          <p className="text-gray-500 mb-6 text-sm">
            ผู้รับเหมาได้รับการแจ้งเตือนแล้ว และจะติดต่อกลับเพื่อนัดสำรวจหน้างาน
          </p>
          <div className="space-y-3">
            <button
              onClick={() => router.push(`/liff/quotes/deals/${acceptedDealId}`)}
              className="w-full py-4 bg-orange-500 text-white rounded-2xl font-bold hover:bg-orange-600"
            >
              ติดตามความคืบหน้า
            </button>
            <button
              onClick={() => router.push('/liff/quotes')}
              className="w-full py-3 border border-gray-200 rounded-2xl text-sm text-gray-600 hover:bg-gray-50"
            >
              กลับหน้าหลัก
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-6">
      {/* Header */}
      <div className="bg-orange-500 text-white px-4 py-5 safe-top">
        <div className="flex items-center gap-3 mb-1">
          <button onClick={() => router.back()} className="w-8 h-8 flex items-center justify-center">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-lg font-bold">เปรียบเทียบใบเสนอราคา</h1>
            {data && (
              <p className="text-orange-100 text-xs">{data.quotes.length} ใบเสนอราคา</p>
            )}
          </div>
        </div>
      </div>

      <div className="px-4 py-5 max-w-lg mx-auto space-y-4">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-5 animate-pulse space-y-3">
                <div className="flex gap-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                    <div className="h-3 bg-gray-200 rounded w-1/3" />
                  </div>
                </div>
                <div className="h-12 bg-gray-200 rounded-xl" />
                <div className="grid grid-cols-3 gap-2">
                  {[1, 2, 3].map((j) => (
                    <div key={j} className="h-8 bg-gray-200 rounded-lg" />
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="h-10 bg-gray-200 rounded-xl" />
                  <div className="h-10 bg-orange-100 rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-red-50 rounded-2xl p-5 text-center">
            <p className="text-red-700 text-sm">ไม่สามารถโหลดข้อมูลได้</p>
            <button onClick={() => window.location.reload()} className="mt-3 text-orange-500 text-sm hover:underline">
              ลองใหม่
            </button>
          </div>
        ) : !data || data.quotes.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
              <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-700 mb-1">ยังไม่มีใบเสนอราคา</h3>
            <p className="text-gray-400 text-sm">กรุณารอผู้รับเหมาส่งใบเสนอราคา</p>
          </div>
        ) : (
          <>
            {errorMsg && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">
                {errorMsg}
              </div>
            )}

            <QuoteComparisonTable
              data={{
                ...data,
                quotes: data.quotes.filter((q) => !localDeclined.has(q.quoteId)),
              }}
              onAccept={handleAccept}
              onDecline={handleDecline}
              onViewDetail={handleViewDetail}
              isAccepting={acceptingId}
            />
          </>
        )}
      </div>
    </div>
  )
}
