/**
 * LIFF Results Page
 * Displays the latest solar analysis results for a LIFF user
 */

'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { useLIFF, useLIFFUser } from '../../../context/LIFFContext'
import { sendFlexMessage, closeWindow, getAccessToken } from '../../../lib/liff'
import { SolarAnalysisResult, FinancialAnalysis, SolarPanelConfig } from '../../../types'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

interface AnalysisData {
  id: string
  result: SolarAnalysisResult
  createdAt: string
}

function formatNumber(num: number): string {
  return new Intl.NumberFormat('th-TH').format(Math.round(num))
}

function formatCurrency(num: number): string {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num)
}

function calculateCarbonOffset(yearlyEnergyKwh: number, factorKgPerMwh: number): number {
  return (yearlyEnergyKwh / 1000) * (factorKgPerMwh / 1000)
}

function calculateEquivalentTrees(carbonOffsetTons: number): number {
  // Average tree absorbs ~22kg CO2/year
  return Math.round(carbonOffsetTons * 1000 / 22)
}

export default function ResultsPage(): React.ReactElement {
  const { isInitialized, isLoading: liffLoading, error: liffError } = useLIFF()
  const user = useLIFFUser()
  const searchParams = useSearchParams()

  const [analysis, setAnalysis] = useState<AnalysisData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDownloading, setIsDownloading] = useState(false)
  const [isSharing, setIsSharing] = useState(false)

  const analysisId = searchParams.get('id')

  const fetchResults = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const token = await getAccessToken()
      const url = analysisId
        ? `${API_URL}/api/v1/solar/history/${analysisId}`
        : `${API_URL}/api/v1/solar/history/latest`

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      }
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
      if (user?.userId) {
        headers['X-LINE-User-Id'] = user.userId
      }

      const response = await fetch(url, { headers })
      if (!response.ok) {
        if (response.status === 404) {
          setAnalysis(null)
          return
        }
        throw new Error('Failed to fetch results')
      }

      const data = await response.json()
      setAnalysis(data.data || data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการโหลดข้อมูล')
    } finally {
      setIsLoading(false)
    }
  }, [analysisId, user?.userId])

  useEffect(() => {
    if (isInitialized && !liffLoading) {
      fetchResults()
    }
  }, [isInitialized, liffLoading, fetchResults])

  const handleDownloadPDF = async () => {
    if (!analysis) return
    setIsDownloading(true)

    try {
      const token = await getAccessToken()
      const headers: Record<string, string> = {}
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
      if (user?.userId) {
        headers['X-LINE-User-Id'] = user.userId
      }

      const response = await fetch(
        `${API_URL}/api/v1/solar/proposal/${analysis.id}/pdf`,
        { headers }
      )

      if (!response.ok) throw new Error('Failed to generate PDF')

      const data = await response.json()
      if (data.url) {
        window.open(data.url, '_blank')
      }
    } catch {
      setError('ไม่สามารถสร้าง PDF ได้ กรุณาลองใหม่อีกครั้ง')
    } finally {
      setIsDownloading(false)
    }
  }

  const handleShare = async () => {
    if (!analysis) return
    setIsSharing(true)

    try {
      const { panelConfig, financialAnalysis } = analysis.result
      const carbonTons = calculateCarbonOffset(
        panelConfig.yearlyEnergyDcKwh,
        analysis.result.solarPotential.carbonOffsetFactorKgPerMwh
      )

      await sendFlexMessage('SolarIQ - ผลวิเคราะห์โซลาร์เซลล์', {
        type: 'bubble',
        size: 'mega',
        header: {
          type: 'box',
          layout: 'vertical',
          contents: [
            {
              type: 'text',
              text: 'SolarIQ - ผลวิเคราะห์',
              weight: 'bold',
              size: 'lg',
              color: '#16a34a',
            },
          ],
          backgroundColor: '#f0fdf4',
          paddingAll: '16px',
        },
        body: {
          type: 'box',
          layout: 'vertical',
          spacing: 'md',
          contents: [
            {
              type: 'text',
              text: `ขนาดระบบ: ${panelConfig.capacityKw.toFixed(1)} kW`,
              size: 'md',
            },
            {
              type: 'text',
              text: `จำนวนแผง: ${panelConfig.panelsCount} แผง`,
              size: 'md',
            },
            {
              type: 'text',
              text: `พลังงานต่อปี: ${formatNumber(panelConfig.yearlyEnergyDcKwh)} kWh`,
              size: 'md',
            },
            { type: 'separator' },
            {
              type: 'text',
              text: `คืนทุนใน ${financialAnalysis.paybackYears.toFixed(1)} ปี`,
              size: 'md',
              weight: 'bold',
              color: '#16a34a',
            },
            {
              type: 'text',
              text: `ประหยัดต่อเดือน: ${formatCurrency(financialAnalysis.monthlySavings)}`,
              size: 'sm',
            },
            {
              type: 'text',
              text: `ลดคาร์บอน: ${carbonTons.toFixed(1)} ตัน CO2/ปี`,
              size: 'sm',
              color: '#059669',
            },
          ],
          paddingAll: '16px',
        },
        footer: {
          type: 'box',
          layout: 'vertical',
          contents: [
            {
              type: 'button',
              action: {
                type: 'uri',
                label: 'ดูรายละเอียด',
                uri: `${process.env.NEXT_PUBLIC_LIFF_URL || ''}/liff/results?id=${analysis.id}`,
              },
              style: 'primary',
              color: '#16a34a',
            },
          ],
          paddingAll: '16px',
        },
      })

      closeWindow()
    } catch {
      setError('ไม่สามารถแชร์ได้ กรุณาลองใหม่อีกครั้ง')
    } finally {
      setIsSharing(false)
    }
  }

  // Loading state
  if (liffLoading || !isInitialized || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">กำลังโหลดผลวิเคราะห์...</p>
        </div>
      </div>
    )
  }

  // LIFF error state
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

  // Fetch error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50 p-4">
        <div className="text-center">
          <div className="text-4xl mb-4">&#9888;&#65039;</div>
          <h1 className="text-xl font-bold text-red-600 mb-2">เกิดข้อผิดพลาด</h1>
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={fetchResults}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
          >
            ลองใหม่อีกครั้ง
          </button>
        </div>
      </div>
    )
  }

  // Empty state
  if (!analysis) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center">
          <div className="text-6xl mb-4">&#9728;&#65039;</div>
          <h1 className="text-xl font-bold text-gray-700 mb-2">ยังไม่มีผลวิเคราะห์</h1>
          <p className="text-gray-500 mb-6">เริ่มต้นวิเคราะห์ศักยภาพโซลาร์เซลล์ของคุณ</p>
          <a
            href="/liff/map-picker"
            className="inline-block bg-green-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-green-700 transition-colors"
          >
            เริ่มวิเคราะห์
          </a>
        </div>
      </div>
    )
  }

  const { panelConfig, financialAnalysis, solarPotential } = analysis.result
  const carbonOffsetTons = calculateCarbonOffset(
    panelConfig.yearlyEnergyDcKwh,
    solarPotential.carbonOffsetFactorKgPerMwh
  )
  const equivalentTrees = calculateEquivalentTrees(carbonOffsetTons)
  const savings25Year = financialAnalysis.yearlySavings * 25

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-green-600 text-white p-4 shadow-md">
        <h1 className="text-xl font-bold text-center">ผลวิเคราะห์โซลาร์เซลล์</h1>
        {analysis.result.address && (
          <p className="text-green-100 text-sm text-center mt-1 truncate">
            {analysis.result.address}
          </p>
        )}
      </header>

      <div className="p-4 space-y-4 pb-32">
        {/* System Size Card */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            ระบบที่แนะนำ
          </h2>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-green-600">
                {panelConfig.capacityKw.toFixed(1)}
              </p>
              <p className="text-xs text-gray-500 mt-1">kW</p>
              <p className="text-xs text-gray-400">ขนาดระบบ</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">
                {formatNumber(panelConfig.yearlyEnergyDcKwh)}
              </p>
              <p className="text-xs text-gray-500 mt-1">kWh/ปี</p>
              <p className="text-xs text-gray-400">พลังงานต่อปี</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">
                {panelConfig.panelsCount}
              </p>
              <p className="text-xs text-gray-500 mt-1">แผง</p>
              <p className="text-xs text-gray-400">จำนวนแผง</p>
            </div>
          </div>
        </div>

        {/* ROI Summary Card */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            ผลตอบแทนการลงทุน
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">ระยะเวลาคืนทุน</span>
              <span className="text-lg font-bold text-green-600">
                {financialAnalysis.paybackYears.toFixed(1)} ปี
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">ประหยัดต่อเดือน</span>
              <span className="text-lg font-bold text-green-600">
                {formatCurrency(financialAnalysis.monthlySavings)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">ประหยัดต่อปี</span>
              <span className="font-semibold text-gray-800">
                {formatCurrency(financialAnalysis.yearlySavings)}
              </span>
            </div>
            <div className="border-t pt-3 flex justify-between items-center">
              <span className="text-gray-600">ประหยัดรวม 25 ปี</span>
              <span className="text-xl font-bold text-green-600">
                {formatCurrency(savings25Year)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">ค่าติดตั้งโดยประมาณ</span>
              <span className="font-semibold text-gray-800">
                {formatCurrency(financialAnalysis.installationCost)}
              </span>
            </div>
          </div>
        </div>

        {/* Carbon Offset Card */}
        <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl shadow-sm p-5">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            ลดคาร์บอน
          </h2>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-3xl font-bold text-emerald-600">
                {carbonOffsetTons.toFixed(1)}
              </p>
              <p className="text-sm text-gray-600 mt-1">ตัน CO2/ปี</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-emerald-600">
                {formatNumber(equivalentTrees)}
              </p>
              <p className="text-sm text-gray-600 mt-1">ต้นไม้เทียบเท่า</p>
            </div>
          </div>
          <div className="mt-3 bg-white/60 rounded-lg p-3">
            <p className="text-xs text-gray-500 text-center">
              เทียบเท่ากับการปลูกต้นไม้ {formatNumber(equivalentTrees)} ต้น
              ช่วยลดภาวะโลกร้อนอย่างยั่งยืน
            </p>
          </div>
        </div>
      </div>

      {/* Fixed Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 space-y-2">
        <div className="flex gap-3">
          <button
            onClick={handleDownloadPDF}
            disabled={isDownloading}
            className="flex-1 bg-white border-2 border-green-600 text-green-600 py-3 rounded-xl font-bold transition-all hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDownloading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                กำลังสร้าง PDF...
              </span>
            ) : (
              'ดาวน์โหลด PDF'
            )}
          </button>
          <button
            onClick={handleShare}
            disabled={isSharing}
            className="flex-1 bg-green-600 text-white py-3 rounded-xl font-bold transition-all hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSharing ? (
              <span className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                กำลังแชร์...
              </span>
            ) : (
              'แชร์ผลวิเคราะห์'
            )}
          </button>
        </div>
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
