/**
 * LIFF Results Page
 * Displays the latest solar analysis results for a LIFF user
 */

'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { useLIFF, useLIFFUser } from '../../../context/LIFFContext'
import { sendFlexMessage, closeWindow, getAccessToken } from '../../../lib/liff'
import { SolarAnalysisResult } from '../../../types'
import { useTranslations } from 'next-intl'

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
  return Math.round((carbonOffsetTons * 1000) / 22)
}

export default function ResultsPage(): React.ReactElement {
  const t = useTranslations('resultsPage')
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
      setError(err instanceof Error ? err.message : t('errors.loadError'))
    } finally {
      setIsLoading(false)
    }
  }, [analysisId, user?.userId, t])

  useEffect(() => {
    if (isInitialized && !liffLoading) {
      fetchResults()
    }
  }, [isInitialized, liffLoading, fetchResults])

  const handleDownloadPDF = async () => {
    if (!analysis) {
      return
    }
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

      const response = await fetch(`${API_URL}/api/v1/solar/proposal/${analysis.id}/pdf`, {
        headers,
      })

      if (!response.ok) {
        throw new Error('Failed to generate PDF')
      }

      const data = await response.json()
      if (data.url) {
        window.open(data.url, '_blank')
      }
    } catch {
      setError(t('errors.pdfError'))
    } finally {
      setIsDownloading(false)
    }
  }

  const handleShare = async () => {
    if (!analysis) {
      return
    }
    setIsSharing(true)

    try {
      const { panelConfig, financialAnalysis } = analysis.result
      const carbonTons = calculateCarbonOffset(
        panelConfig.yearlyEnergyDcKwh,
        analysis.result.solarPotential.carbonOffsetFactorKgPerMwh
      )

      await sendFlexMessage(t('flexMessage.title'), {
        type: 'bubble',
        size: 'mega',
        header: {
          type: 'box',
          layout: 'vertical',
          contents: [
            {
              type: 'text',
              text: t('flexMessage.title'),
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
              text: `${t('flexMessage.systemSize')} ${panelConfig.capacityKw.toFixed(1)} kW`,
              size: 'md',
            },
            {
              type: 'text',
              text: `${t('flexMessage.panelsCount')} ${panelConfig.panelsCount} ${t('system.panels')}`,
              size: 'md',
            },
            {
              type: 'text',
              text: `${t('flexMessage.yearlyEnergy')} ${formatNumber(panelConfig.yearlyEnergyDcKwh)} kWh`,
              size: 'md',
            },
            { type: 'separator' },
            {
              type: 'text',
              text: `${t('flexMessage.payback')} ${financialAnalysis.paybackYears.toFixed(1)} ${t('flexMessage.years')}`,
              size: 'md',
              weight: 'bold',
              color: '#16a34a',
            },
            {
              type: 'text',
              text: `${t('flexMessage.monthlySavings')} ${formatCurrency(financialAnalysis.monthlySavings)}`,
              size: 'sm',
            },
            {
              type: 'text',
              text: `${t('flexMessage.carbonReduction')} ${carbonTons.toFixed(1)} ${t('carbon.tonsPerYear')}`,
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
                label: t('flexMessage.viewDetails'),
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
      setError(t('errors.shareError'))
    } finally {
      setIsSharing(false)
    }
  }

  // Loading state
  if (liffLoading || !isInitialized || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--brand-surface)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-[var(--brand-text-secondary)]">{t('loading')}</p>
        </div>
      </div>
    )
  }

  // LIFF error state
  if (liffError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-500/10 p-4">
        <div className="text-center">
          <div className="text-4xl mb-4">&#9888;&#65039;</div>
          <h1 className="text-xl font-bold text-red-600 mb-2">{t('errors.loadError')}</h1>
          <p className="text-red-500">{liffError.message}</p>
        </div>
      </div>
    )
  }

  // Fetch error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-500/10 p-4">
        <div className="text-center">
          <div className="text-4xl mb-4">&#9888;&#65039;</div>
          <h1 className="text-xl font-bold text-red-600 mb-2">{t('errors.loadError')}</h1>
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={fetchResults}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
          >
            {t('empty.startAnalysis')}
          </button>
        </div>
      </div>
    )
  }

  // Empty state
  if (!analysis) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--brand-background)] p-4">
        <div className="text-center">
          <div className="text-6xl mb-4">&#9728;&#65039;</div>
          <h1 className="text-xl font-bold text-[var(--brand-text)] mb-2">{t('empty.title')}</h1>
          <p className="text-[var(--brand-text-secondary)] mb-6">{t('empty.description')}</p>
          <a
            href="/liff/map-picker"
            className="inline-block bg-green-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-green-700 transition-colors"
          >
            {t('empty.startAnalysis')}
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
    <div className="min-h-screen bg-[var(--brand-background)]">
      {/* Header */}
      <header className="bg-green-600 text-white p-4 shadow-md">
        <h1 className="text-xl font-bold text-center">{t('title')}</h1>
        {analysis.result.address && (
          <p className="text-green-100 text-sm text-center mt-1 truncate">
            {analysis.result.address}
          </p>
        )}
      </header>

      <div className="p-4 space-y-4 pb-32">
        {/* System Size Card */}
        <div className="bg-[var(--brand-surface)] rounded-2xl shadow-sm p-5">
          <h2 className="text-sm font-semibold text-[var(--brand-text-secondary)] uppercase tracking-wide mb-3">
            {t('system.title')}
          </h2>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-green-600">
                {panelConfig.capacityKw.toFixed(1)}
              </p>
              <p className="text-xs text-[var(--brand-text-secondary)] mt-1">kW</p>
              <p className="text-xs text-[var(--brand-text-secondary)]">{t('system.systemSize')}</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">
                {formatNumber(panelConfig.yearlyEnergyDcKwh)}
              </p>
              <p className="text-xs text-[var(--brand-text-secondary)] mt-1">
                {t('system.kwhPerYear')}
              </p>
              <p className="text-xs text-[var(--brand-text-secondary)]">
                {t('system.yearlyEnergy')}
              </p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{panelConfig.panelsCount}</p>
              <p className="text-xs text-[var(--brand-text-secondary)] mt-1">
                {t('system.panels')}
              </p>
              <p className="text-xs text-[var(--brand-text-secondary)]">
                {t('system.panelsCount')}
              </p>
            </div>
          </div>
        </div>

        {/* ROI Summary Card */}
        <div className="bg-[var(--brand-surface)] rounded-2xl shadow-sm p-5">
          <h2 className="text-sm font-semibold text-[var(--brand-text-secondary)] uppercase tracking-wide mb-3">
            {t('roi.title')}
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-[var(--brand-text-secondary)]">{t('roi.paybackPeriod')}</span>
              <span className="text-lg font-bold text-green-600">
                {financialAnalysis.paybackYears.toFixed(1)} {t('roi.years')}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[var(--brand-text-secondary)]">{t('roi.monthlySavings')}</span>
              <span className="text-lg font-bold text-green-600">
                {formatCurrency(financialAnalysis.monthlySavings)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[var(--brand-text-secondary)]">{t('roi.yearlySavings')}</span>
              <span className="font-semibold text-[var(--brand-text)]">
                {formatCurrency(financialAnalysis.yearlySavings)}
              </span>
            </div>
            <div className="border-t pt-3 flex justify-between items-center">
              <span className="text-[var(--brand-text-secondary)]">{t('roi.savings25Years')}</span>
              <span className="text-xl font-bold text-green-600">
                {formatCurrency(savings25Year)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[var(--brand-text-secondary)]">{t('roi.estimatedCost')}</span>
              <span className="font-semibold text-[var(--brand-text)]">
                {formatCurrency(financialAnalysis.installationCost)}
              </span>
            </div>
          </div>
        </div>

        {/* Carbon Offset Card */}
        <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl shadow-sm p-5">
          <h2 className="text-sm font-semibold text-[var(--brand-text-secondary)] uppercase tracking-wide mb-3">
            {t('carbon.title')}
          </h2>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-3xl font-bold text-emerald-600">{carbonOffsetTons.toFixed(1)}</p>
              <p className="text-sm text-[var(--brand-text-secondary)] mt-1">
                {t('carbon.tonsPerYear')}
              </p>
            </div>
            <div>
              <p className="text-3xl font-bold text-emerald-600">{formatNumber(equivalentTrees)}</p>
              <p className="text-sm text-[var(--brand-text-secondary)] mt-1">
                {t('carbon.equivalentTrees')}
              </p>
            </div>
          </div>
          <div className="mt-3 bg-[var(--brand-surface)]/60 rounded-lg p-3">
            <p className="text-xs text-[var(--brand-text-secondary)] text-center">
              {t('carbon.treesDescription').replace('{trees}', formatNumber(equivalentTrees))}
            </p>
          </div>
        </div>
      </div>

      {/* Fixed Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-[var(--brand-surface)] border-t p-4 space-y-2">
        <div className="flex gap-3">
          <button
            onClick={handleDownloadPDF}
            disabled={isDownloading}
            className="flex-1 bg-[var(--brand-surface)] border-2 border-green-600 text-green-600 py-3 rounded-xl font-bold transition-all hover:bg-green-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDownloading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                {t('actions.generatingPdf')}
              </span>
            ) : (
              t('actions.downloadPdf')
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
                {t('actions.sharing')}
              </span>
            ) : (
              t('actions.shareResults')
            )}
          </button>
        </div>
      </div>

      {/* User badge */}
      {user && (
        <div className="fixed top-16 right-2 bg-[var(--brand-surface)]/90 backdrop-blur-sm rounded-full px-3 py-1 shadow text-xs text-[var(--brand-text-secondary)]">
          {user.displayName}
        </div>
      )}
    </div>
  )
}
