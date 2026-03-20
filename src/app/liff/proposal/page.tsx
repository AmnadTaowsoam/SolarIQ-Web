/**
 * LIFF Proposal Page
 * View generated PDF proposal for a solar analysis
 */

'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { useLIFF, useLIFFUser } from '../../../context/LIFFContext'
import { sendFlexMessage, closeWindow, getAccessToken, openWindow } from '../../../lib/liff'
import { SolarAnalysisResult } from '../../../types'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

interface ProposalData {
  id: string
  leadId: string
  pdfUrl: string | null
  status: 'pending' | 'generating' | 'ready' | 'error'
  result: SolarAnalysisResult
  createdAt: string
}

function formatCurrency(num: number): string {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num)
}

export default function ProposalPage(): React.ReactElement {
  const { isInitialized, isLoading: liffLoading, error: liffError } = useLIFF()
  const user = useLIFFUser()
  const searchParams = useSearchParams()

  const [proposal, setProposal] = useState<ProposalData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSharing, setIsSharing] = useState(false)

  const leadId = searchParams.get('lead_id')

  const fetchProposal = useCallback(async () => {
    if (!leadId) {
      setError('ไม่พบรหัสลูกค้า')
      setIsLoading(false)
      return
    }

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
        `${API_URL}/api/v1/solar/proposal?lead_id=${leadId}`,
        { headers }
      )

      if (!response.ok) {
        if (response.status === 404) {
          setError('ไม่พบใบเสนอราคา')
          return
        }
        throw new Error('Failed to fetch proposal')
      }

      const data = await response.json()
      setProposal(data.data || data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการโหลดข้อมูล')
    } finally {
      setIsLoading(false)
    }
  }, [leadId, user?.userId])

  useEffect(() => {
    if (isInitialized && !liffLoading) {
      fetchProposal()
    }
  }, [isInitialized, liffLoading, fetchProposal])

  const handleDownloadPDF = async () => {
    if (!proposal?.pdfUrl) return
    window.open(proposal.pdfUrl, '_blank')
  }

  const handleShareToLINE = async () => {
    if (!proposal) return
    setIsSharing(true)

    try {
      const { panelConfig, financialAnalysis } = proposal.result

      await sendFlexMessage('SolarIQ - ใบเสนอราคา', {
        type: 'bubble',
        size: 'mega',
        header: {
          type: 'box',
          layout: 'vertical',
          contents: [
            {
              type: 'text',
              text: 'SolarIQ - ใบเสนอราคา',
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
              text: `ขนาดระบบ: ${panelConfig.capacityKw.toFixed(1)} kW (${panelConfig.panelsCount} แผง)`,
              size: 'md',
            },
            {
              type: 'text',
              text: `ค่าติดตั้ง: ${formatCurrency(financialAnalysis.installationCost)}`,
              size: 'md',
            },
            {
              type: 'text',
              text: `คืนทุนใน ${financialAnalysis.paybackYears.toFixed(1)} ปี`,
              weight: 'bold',
              color: '#16a34a',
              size: 'md',
            },
            {
              type: 'text',
              text: `ประหยัด ${formatCurrency(financialAnalysis.monthlySavings)}/เดือน`,
              size: 'sm',
            },
          ],
          paddingAll: '16px',
        },
        footer: {
          type: 'box',
          layout: 'vertical',
          spacing: 'sm',
          contents: [
            {
              type: 'button',
              action: {
                type: 'uri',
                label: 'ดูใบเสนอราคา',
                uri: `${process.env.NEXT_PUBLIC_LIFF_URL || ''}/liff/proposal?lead_id=${leadId}`,
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

  const handleContactInstaller = async () => {
    try {
      await openWindow('https://line.me/R/ti/p/@solariq', { external: false })
    } catch {
      window.open('https://line.me/R/ti/p/@solariq', '_blank')
    }
  }

  // Loading state
  if (liffLoading || !isInitialized || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">กำลังโหลดใบเสนอราคา...</p>
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
            onClick={fetchProposal}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
          >
            ลองใหม่อีกครั้ง
          </button>
        </div>
      </div>
    )
  }

  if (!proposal) return <div />

  const { panelConfig, financialAnalysis } = proposal.result
  const isReady = proposal.status === 'ready' && proposal.pdfUrl
  const isGenerating = proposal.status === 'pending' || proposal.status === 'generating'

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-green-600 text-white p-4 shadow-md">
        <h1 className="text-xl font-bold text-center">ใบเสนอราคา</h1>
        <p className="text-green-100 text-sm text-center mt-1">
          Solar Proposal
        </p>
      </header>

      <div className="p-4 space-y-4 pb-40">
        {/* Status Banner */}
        {isGenerating && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 flex items-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-yellow-600 flex-shrink-0"></div>
            <div>
              <p className="font-semibold text-yellow-800">กำลังสร้างใบเสนอราคา</p>
              <p className="text-sm text-yellow-600">กรุณารอสักครู่...</p>
            </div>
          </div>
        )}

        {proposal.status === 'error' && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
            <p className="font-semibold text-red-800">เกิดข้อผิดพลาดในการสร้างใบเสนอราคา</p>
            <p className="text-sm text-red-600 mt-1">กรุณาลองใหม่อีกครั้ง หรือติดต่อเจ้าหน้าที่</p>
          </div>
        )}

        {/* Proposal Summary */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            สรุปข้อเสนอ
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">ขนาดระบบ</span>
              <span className="font-bold text-gray-800">
                {panelConfig.capacityKw.toFixed(1)} kW ({panelConfig.panelsCount} แผง)
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">พลังงานต่อปี</span>
              <span className="font-semibold text-gray-800">
                {new Intl.NumberFormat('th-TH').format(Math.round(panelConfig.yearlyEnergyDcKwh))} kWh
              </span>
            </div>
            <div className="border-t pt-3 flex justify-between items-center">
              <span className="text-gray-600">ราคาประมาณการ</span>
              <span className="text-xl font-bold text-gray-800">
                {formatCurrency(financialAnalysis.installationCost)}
              </span>
            </div>
          </div>
        </div>

        {/* ROI Card */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl shadow-sm p-5">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            ผลตอบแทน
          </h2>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="bg-white/70 rounded-xl p-3">
              <p className="text-2xl font-bold text-green-600">
                {financialAnalysis.paybackYears.toFixed(1)}
              </p>
              <p className="text-xs text-gray-500 mt-1">ปีคืนทุน</p>
            </div>
            <div className="bg-white/70 rounded-xl p-3">
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(financialAnalysis.monthlySavings)}
              </p>
              <p className="text-xs text-gray-500 mt-1">ประหยัด/เดือน</p>
            </div>
          </div>
          <div className="mt-3 text-center bg-white/70 rounded-xl p-3">
            <p className="text-sm text-gray-600">ประหยัดรวม 25 ปี</p>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(financialAnalysis.yearlySavings * 25)}
            </p>
          </div>
        </div>

        {/* PDF Viewer / Download Section */}
        {isReady && proposal.pdfUrl && (
          <div className="bg-white rounded-2xl shadow-sm p-5">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
              เอกสารใบเสนอราคา
            </h2>
            <div className="border rounded-xl overflow-hidden">
              <iframe
                src={`${proposal.pdfUrl}#toolbar=0`}
                className="w-full h-64 bg-gray-100"
                title="Proposal PDF"
              />
            </div>
            <button
              onClick={handleDownloadPDF}
              className="w-full mt-3 bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
            >
              เปิด PDF เต็มจอ
            </button>
          </div>
        )}
      </div>

      {/* Fixed Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 space-y-2">
        <div className="flex gap-3">
          <button
            onClick={handleShareToLINE}
            disabled={isSharing}
            className="flex-1 bg-white border-2 border-green-600 text-green-600 py-3 rounded-xl font-bold transition-all hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSharing ? (
              <span className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                กำลังแชร์...
              </span>
            ) : (
              'แชร์ไปยัง LINE'
            )}
          </button>
          <button
            onClick={handleContactInstaller}
            className="flex-1 bg-green-600 text-white py-3 rounded-xl font-bold transition-all hover:bg-green-700"
          >
            ติดต่อช่างติดตั้ง
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
