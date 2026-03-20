/**
 * LIFF History Page
 * Lists past solar analyses for the user
 */

'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useLIFF, useLIFFUser } from '../../../context/LIFFContext'
import { getAccessToken } from '../../../lib/liff'
import { SolarAnalysisResult } from '../../../types'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

interface HistoryItem {
  id: string
  result: SolarAnalysisResult
  createdAt: string
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatCurrency(num: number): string {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num)
}

export default function HistoryPage(): React.ReactElement {
  const { isInitialized, isLoading: liffLoading, error: liffError } = useLIFF()
  const user = useLIFFUser()
  const router = useRouter()

  const [history, setHistory] = useState<HistoryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchHistory = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const token = await getAccessToken()
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      }
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
      if (user?.userId) {
        headers['X-LINE-User-Id'] = user.userId
      }

      const response = await fetch(
        `${API_URL}/api/v1/solar/history?sort=desc`,
        { headers }
      )

      if (!response.ok) {
        throw new Error('Failed to fetch history')
      }

      const data = await response.json()
      const items = data.data?.items || data.items || data.data || []
      setHistory(Array.isArray(items) ? items : [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการโหลดข้อมูล')
    } finally {
      setIsLoading(false)
    }
  }, [user?.userId])

  useEffect(() => {
    if (isInitialized && !liffLoading) {
      fetchHistory()
    }
  }, [isInitialized, liffLoading, fetchHistory])

  const handleViewResult = (id: string) => {
    router.push(`/liff/results?id=${id}`)
  }

  // Loading state
  if (liffLoading || !isInitialized || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">กำลังโหลดประวัติ...</p>
        </div>
      </div>
    )
  }

  // LIFF error
  if (liffError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50 p-4">
        <div className="text-center">
          <div className="text-4xl mb-4">&#9888;&#65039;</div>
          <h1 className="text-xl font-bold text-red-600 mb-2">เกิดข้อผิดพลาด</h1>
          <p className="text-red-500">{liffError.message}</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50 p-4">
        <div className="text-center">
          <div className="text-4xl mb-4">&#9888;&#65039;</div>
          <h1 className="text-xl font-bold text-red-600 mb-2">เกิดข้อผิดพลาด</h1>
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={fetchHistory}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
          >
            ลองใหม่อีกครั้ง
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-green-600 text-white p-4 shadow-md">
        <h1 className="text-xl font-bold text-center">ประวัติการวิเคราะห์</h1>
        <p className="text-green-100 text-sm text-center mt-1">
          รายการวิเคราะห์โซลาร์เซลล์ทั้งหมดของคุณ
        </p>
      </header>

      <div className="p-4">
        {/* Empty state */}
        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="text-6xl mb-4">&#9728;&#65039;</div>
            <h2 className="text-xl font-bold text-gray-700 mb-2">
              ยังไม่มีประวัติการวิเคราะห์
            </h2>
            <p className="text-gray-500 mb-6 text-center">
              เริ่มต้นวิเคราะห์ศักยภาพโซลาร์เซลล์บ้านคุณ
            </p>
            <a
              href="/liff/map-picker"
              className="inline-block bg-green-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-green-700 transition-colors"
            >
              เริ่มวิเคราะห์
            </a>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((item) => {
              const { panelConfig, financialAnalysis, address } = item.result

              return (
                <button
                  key={item.id}
                  onClick={() => handleViewResult(item.id)}
                  className="w-full bg-white rounded-2xl shadow-sm p-4 text-left hover:shadow-md transition-shadow active:scale-[0.98]"
                >
                  {/* Date */}
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-xs text-gray-400">
                      {formatDate(item.createdAt)}
                    </p>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                      {panelConfig.capacityKw.toFixed(1)} kW
                    </span>
                  </div>

                  {/* Address */}
                  <p className="text-sm font-medium text-gray-800 mb-2 line-clamp-2">
                    {address || 'ไม่ระบุที่อยู่'}
                  </p>

                  {/* Summary Row */}
                  <div className="flex justify-between items-center text-sm">
                    <div className="flex gap-4">
                      <span className="text-gray-500">
                        {panelConfig.panelsCount} แผง
                      </span>
                      <span className="text-gray-500">
                        คืนทุน {financialAnalysis.paybackYears.toFixed(1)} ปี
                      </span>
                    </div>
                    <span className="text-green-600 font-semibold">
                      {formatCurrency(financialAnalysis.monthlySavings)}/ด.
                    </span>
                  </div>

                  {/* Arrow indicator */}
                  <div className="flex justify-end mt-2">
                    <svg
                      className="w-5 h-5 text-gray-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* User badge */}
      {user && (
        <div className="fixed top-16 right-2 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 shadow text-xs text-gray-600">
          {user.displayName}
        </div>
      )}
    </div>
  )
}
