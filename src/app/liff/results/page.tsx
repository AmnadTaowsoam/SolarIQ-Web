/**
 * LIFF Results Page
 * Displays the latest solar analysis results for a LIFF user
 */

'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Download, Leaf, Send, SunMedium, Wallet } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useLIFF, useLIFFUser } from '../../../context/LIFFContext'
import { sendFlexMessage, closeWindow, getAccessToken } from '../../../lib/liff'
import { SolarAnalysisResult } from '../../../types'
import {
  LiffHeroCard,
  LiffMetricStrip,
  LiffPageFrame,
  LiffPanel,
  LiffPrimaryButton,
} from '@/components/liff/LiffMobileUI'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

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
        headers.Authorization = `Bearer ${token}`
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
        headers.Authorization = `Bearer ${token}`
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

  if (liffLoading || !isInitialized || isLoading) {
    return (
      <LiffPageFrame className="flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-emerald-600" />
          <p className="mt-4 text-sm text-slate-500">{t('loading')}</p>
        </div>
      </LiffPageFrame>
    )
  }

  if (liffError) {
    return (
      <LiffPageFrame className="flex items-center justify-center">
        <LiffPanel
          title={t('errors.loadError')}
          subtitle={liffError.message}
          className="w-full max-w-sm"
        />
      </LiffPageFrame>
    )
  }

  if (error) {
    return (
      <LiffPageFrame className="flex items-center justify-center">
        <LiffPanel title={t('errors.loadError')} subtitle={error} className="w-full max-w-sm">
          <button onClick={fetchResults} className="text-sm font-semibold text-emerald-700">
            {t('retry')}
          </button>
        </LiffPanel>
      </LiffPageFrame>
    )
  }

  if (!analysis) {
    return (
      <LiffPageFrame className="flex items-center justify-center">
        <LiffPanel
          title={t('empty.title')}
          subtitle={t('empty.description')}
          className="w-full max-w-sm"
        >
          <Link
            href="/liff/map-picker"
            className="inline-flex items-center justify-center rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            {t('empty.startAnalysis')}
          </Link>
        </LiffPanel>
      </LiffPageFrame>
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
    <LiffPageFrame className="pb-32">
      <LiffHeroCard
        accent="green"
        title={t('title')}
        description={t('heroDescription')}
        eyebrow={t('heroEyebrow')}
        badge={analysis.result.address ? undefined : t('summaryBadge')}
      >
        {analysis.result.address ? (
          <div className="mb-4 rounded-2xl border border-white/80 bg-white/80 px-4 py-3 text-sm text-slate-600 shadow-sm">
            {analysis.result.address}
          </div>
        ) : null}
        <LiffMetricStrip
          accent="green"
          items={[
            {
              label: t('system.systemSize'),
              value: `${panelConfig.capacityKw.toFixed(1)} kW`,
              hint: `${panelConfig.panelsCount} ${t('system.panels')}`,
            },
            {
              label: t('roi.paybackPeriod'),
              value: `${financialAnalysis.paybackYears.toFixed(1)} ${t('roi.years')}`,
              hint: t('summaryPaybackHint'),
            },
            {
              label: t('roi.monthlySavings'),
              value: formatCurrency(financialAnalysis.monthlySavings),
              hint: t('actions.shareResults'),
            },
          ]}
        />
      </LiffHeroCard>

      <div className="mt-4 space-y-4">
        <div className="grid grid-cols-3 gap-3">
          {[
            {
              label: t('system.yearlyEnergy'),
              value: formatNumber(panelConfig.yearlyEnergyDcKwh),
              hint: t('system.kwhPerYear'),
              icon: <SunMedium className="h-4 w-4" />,
            },
            {
              label: t('roi.estimatedCost'),
              value: formatCurrency(financialAnalysis.installationCost),
              hint: t('summaryInvestmentHint'),
              icon: <Wallet className="h-4 w-4" />,
            },
            {
              label: t('carbon.equivalentTrees'),
              value: formatNumber(equivalentTrees),
              hint: t('carbon.tonsPerYear'),
              icon: <Leaf className="h-4 w-4" />,
            },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-[24px] border border-white/75 bg-white/85 p-3 shadow-sm"
            >
              <div className="text-emerald-600">{item.icon}</div>
              <p className="mt-3 text-[11px] uppercase tracking-[0.12em] text-slate-400">
                {item.label}
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-950">{item.value}</p>
              <p className="mt-1 text-xs text-slate-500">{item.hint}</p>
            </div>
          ))}
        </div>

        <LiffPanel title={t('system.title')} subtitle={t('system.subtitle')}>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="rounded-2xl bg-emerald-50 px-3 py-4 ring-1 ring-emerald-100">
              <p className="text-2xl font-bold text-emerald-600">
                {panelConfig.capacityKw.toFixed(1)}
              </p>
              <p className="mt-1 text-xs text-slate-500">kW</p>
              <p className="mt-1 text-xs text-slate-500">{t('system.systemSize')}</p>
            </div>
            <div className="rounded-2xl bg-white px-3 py-4 ring-1 ring-slate-200">
              <p className="text-2xl font-bold text-slate-950">
                {formatNumber(panelConfig.yearlyEnergyDcKwh)}
              </p>
              <p className="mt-1 text-xs text-slate-500">{t('system.kwhPerYear')}</p>
              <p className="mt-1 text-xs text-slate-500">{t('system.yearlyEnergy')}</p>
            </div>
            <div className="rounded-2xl bg-white px-3 py-4 ring-1 ring-slate-200">
              <p className="text-2xl font-bold text-slate-950">{panelConfig.panelsCount}</p>
              <p className="mt-1 text-xs text-slate-500">{t('system.panels')}</p>
              <p className="mt-1 text-xs text-slate-500">{t('system.panelsCount')}</p>
            </div>
          </div>
        </LiffPanel>

        <LiffPanel title={t('roi.title')} subtitle={t('roi.subtitle')}>
          <div className="space-y-3">
            <div className="flex justify-between gap-3 rounded-2xl bg-emerald-50 px-4 py-3 ring-1 ring-emerald-100">
              <span className="text-slate-600">{t('roi.paybackPeriod')}</span>
              <span className="font-semibold text-emerald-700">
                {financialAnalysis.paybackYears.toFixed(1)} {t('roi.years')}
              </span>
            </div>
            <div className="flex justify-between gap-3 rounded-2xl bg-slate-50 px-4 py-3">
              <span className="text-slate-600">{t('roi.monthlySavings')}</span>
              <span className="font-semibold text-slate-950">
                {formatCurrency(financialAnalysis.monthlySavings)}
              </span>
            </div>
            <div className="flex justify-between gap-3 rounded-2xl bg-slate-50 px-4 py-3">
              <span className="text-slate-600">{t('roi.yearlySavings')}</span>
              <span className="font-semibold text-slate-950">
                {formatCurrency(financialAnalysis.yearlySavings)}
              </span>
            </div>
            <div className="flex justify-between gap-3 rounded-2xl bg-slate-950 px-4 py-3 text-white">
              <span>{t('roi.savings25Years')}</span>
              <span className="font-semibold">{formatCurrency(savings25Year)}</span>
            </div>
          </div>
        </LiffPanel>

        <LiffPanel title={t('carbon.title')} subtitle={t('carbon.subtitle')}>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-emerald-50 px-4 py-4 text-center ring-1 ring-emerald-100">
              <p className="text-3xl font-bold text-emerald-600">{carbonOffsetTons.toFixed(1)}</p>
              <p className="mt-1 text-sm text-slate-500">{t('carbon.tonsPerYear')}</p>
            </div>
            <div className="rounded-2xl bg-white px-4 py-4 text-center ring-1 ring-slate-200">
              <p className="text-3xl font-bold text-slate-950">{formatNumber(equivalentTrees)}</p>
              <p className="mt-1 text-sm text-slate-500">{t('carbon.equivalentTrees')}</p>
            </div>
          </div>
          <div className="mt-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
            {t('carbon.treesDescription').replace('{trees}', formatNumber(equivalentTrees))}
          </div>
        </LiffPanel>

        <LiffPanel title={t('nextStepTitle')} subtitle={t('nextStepDescription')}>
          <Link
            href="/liff/proposal"
            className="inline-flex items-center rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700"
          >
            {t('viewProposal')}
          </Link>
        </LiffPanel>
      </div>

      <div className="fixed bottom-0 left-0 right-0 border-t border-white/70 bg-white/88 px-4 py-4 backdrop-blur-xl">
        <div className="mx-auto flex max-w-lg gap-3">
          <button
            onClick={handleDownloadPDF}
            disabled={isDownloading}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-emerald-200 bg-white px-4 py-3 text-sm font-semibold text-emerald-700 transition-colors hover:bg-emerald-50 disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            {isDownloading ? t('actions.generatingPdf') : t('actions.downloadPdf')}
          </button>
          <LiffPrimaryButton
            accent="green"
            className="flex-1 gap-2"
            onClick={handleShare}
            disabled={isSharing}
          >
            <Send className="h-4 w-4" />
            {isSharing ? t('actions.sharing') : t('actions.shareResults')}
          </LiffPrimaryButton>
        </div>
      </div>

      {user ? (
        <div className="fixed right-4 top-4 rounded-full border border-white/70 bg-white/88 px-3 py-1 text-xs text-slate-500 shadow-sm backdrop-blur-sm">
          {user.displayName}
        </div>
      ) : null}
    </LiffPageFrame>
  )
}
