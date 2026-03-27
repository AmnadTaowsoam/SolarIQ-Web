/**
 * B2B SaaS Funnel Dashboard
 *
 * This page displays the conversion funnel metrics for the B2B SaaS product.
 * It shows the journey from visit → signup → trial → activation → paid → retention.
 *
 * Funnel Stages:
 * 1. Landing Page Views
 * 2. Sign Ups (account creation)
 * 3. Trial Starts (activated trial)
 * 4. Onboarding Complete
 * 5. First Analysis (first solar analysis run)
 * 6. First Proposal (first proposal generated)
 * 7. Upgrade Clicks (clicked upgrade button)
 * 8. Purchase (subscription payment)
 * 9. LINE Connect (connected LINE OA)
 *
 * Reference: WK-110 Analytics & Conversion Tracking
 */

'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { AppLayout } from '@/components/layout'
import { Card, CardHeader, CardBody } from '@/components/ui'
import { Button } from '@/components/ui/Button'
import {
  Users,
  UserPlus,
  Play,
  CheckCircle,
  Zap,
  FileText,
  ArrowUpRight,
  TrendingUp,
  TrendingDown,
  Calendar,
  Download,
  RefreshCw,
  MessageSquare,
  DollarSign,
} from 'lucide-react'

interface FunnelStage {
  id: string
  name: string
  icon: React.ReactNode
  count: number
  previousCount?: number
  conversionRate?: number
  dropOffRate?: number
  color: string
}

interface FunnelData {
  period: '7d' | '30d' | '90d'
  stages: FunnelStage[]
  overallConversionRate: number
  totalRevenue: number
  avgTimeToPurchase: number
}

// Demo data for development
const DEMO_FUNNEL_DATA: Record<string, FunnelData> = {
  '7d': {
    period: '7d',
    stages: [
      {
        id: 'landing',
        name: 'Landing Page Views',
        icon: <Users className="w-5 h-5" />,
        count: 1250,
        previousCount: 1100,
        conversionRate: 100,
        color: 'bg-blue-500',
      },
      {
        id: 'signup',
        name: 'Sign Ups',
        icon: <UserPlus className="w-5 h-5" />,
        count: 180,
        previousCount: 150,
        conversionRate: 14.4,
        dropOffRate: 85.6,
        color: 'bg-green-500',
      },
      {
        id: 'trial',
        name: 'Trial Starts',
        icon: <Play className="w-5 h-5" />,
        count: 165,
        previousCount: 140,
        conversionRate: 91.7,
        dropOffRate: 8.3,
        color: 'bg-purple-500',
      },
      {
        id: 'onboarding',
        name: 'Onboarding Complete',
        icon: <CheckCircle className="w-5 h-5" />,
        count: 140,
        previousCount: 120,
        conversionRate: 84.8,
        dropOffRate: 15.2,
        color: 'bg-yellow-500',
      },
      {
        id: 'first_analysis',
        name: 'First Analysis',
        icon: <Zap className="w-5 h-5" />,
        count: 120,
        previousCount: 100,
        conversionRate: 85.7,
        dropOffRate: 14.3,
        color: 'bg-orange-500',
      },
      {
        id: 'first_proposal',
        name: 'First Proposal',
        icon: <FileText className="w-5 h-5" />,
        count: 95,
        previousCount: 80,
        conversionRate: 79.2,
        dropOffRate: 20.8,
        color: 'bg-pink-500',
      },
      {
        id: 'upgrade_click',
        name: 'Upgrade Clicks',
        icon: <ArrowUpRight className="w-5 h-5" />,
        count: 45,
        previousCount: 35,
        conversionRate: 47.4,
        dropOffRate: 52.6,
        color: 'bg-indigo-500',
      },
      {
        id: 'purchase',
        name: 'Purchases',
        icon: <DollarSign className="w-5 h-5" />,
        count: 25,
        previousCount: 20,
        conversionRate: 55.6,
        dropOffRate: 44.4,
        color: 'bg-emerald-500',
      },
      {
        id: 'line_connect',
        name: 'LINE Connect',
        icon: <MessageSquare className="w-5 h-5" />,
        count: 85,
        previousCount: 70,
        conversionRate: 47.2,
        dropOffRate: 52.8,
        color: 'bg-cyan-500',
      },
    ],
    overallConversionRate: 2.0,
    totalRevenue: 125000,
    avgTimeToPurchase: 5.2,
  },
  '30d': {
    period: '30d',
    stages: [
      {
        id: 'landing',
        name: 'Landing Page Views',
        icon: <Users className="w-5 h-5" />,
        count: 5400,
        previousCount: 4800,
        conversionRate: 100,
        color: 'bg-blue-500',
      },
      {
        id: 'signup',
        name: 'Sign Ups',
        icon: <UserPlus className="w-5 h-5" />,
        count: 720,
        previousCount: 600,
        conversionRate: 13.3,
        dropOffRate: 86.7,
        color: 'bg-green-500',
      },
      {
        id: 'trial',
        name: 'Trial Starts',
        icon: <Play className="w-5 h-5" />,
        count: 660,
        previousCount: 550,
        conversionRate: 91.7,
        dropOffRate: 8.3,
        color: 'bg-purple-500',
      },
      {
        id: 'onboarding',
        name: 'Onboarding Complete',
        icon: <CheckCircle className="w-5 h-5" />,
        count: 580,
        previousCount: 480,
        conversionRate: 87.9,
        dropOffRate: 12.1,
        color: 'bg-yellow-500',
      },
      {
        id: 'first_analysis',
        name: 'First Analysis',
        icon: <Zap className="w-5 h-5" />,
        count: 500,
        previousCount: 400,
        conversionRate: 86.2,
        dropOffRate: 13.8,
        color: 'bg-orange-500',
      },
      {
        id: 'first_proposal',
        name: 'First Proposal',
        icon: <FileText className="w-5 h-5" />,
        count: 400,
        previousCount: 320,
        conversionRate: 80.0,
        dropOffRate: 20.0,
        color: 'bg-pink-500',
      },
      {
        id: 'upgrade_click',
        name: 'Upgrade Clicks',
        icon: <ArrowUpRight className="w-5 h-5" />,
        count: 180,
        previousCount: 140,
        conversionRate: 45.0,
        dropOffRate: 55.0,
        color: 'bg-indigo-500',
      },
      {
        id: 'purchase',
        name: 'Purchases',
        icon: <DollarSign className="w-5 h-5" />,
        count: 95,
        previousCount: 75,
        conversionRate: 52.8,
        dropOffRate: 47.2,
        color: 'bg-emerald-500',
      },
      {
        id: 'line_connect',
        name: 'LINE Connect',
        icon: <MessageSquare className="w-5 h-5" />,
        count: 350,
        previousCount: 280,
        conversionRate: 48.6,
        dropOffRate: 51.4,
        color: 'bg-cyan-500',
      },
    ],
    overallConversionRate: 1.8,
    totalRevenue: 475000,
    avgTimeToPurchase: 4.8,
  },
  '90d': {
    period: '90d',
    stages: [
      {
        id: 'landing',
        name: 'Landing Page Views',
        icon: <Users className="w-5 h-5" />,
        count: 16200,
        previousCount: 14400,
        conversionRate: 100,
        color: 'bg-blue-500',
      },
      {
        id: 'signup',
        name: 'Sign Ups',
        icon: <UserPlus className="w-5 h-5" />,
        count: 2100,
        previousCount: 1800,
        conversionRate: 13.0,
        dropOffRate: 87.0,
        color: 'bg-green-500',
      },
      {
        id: 'trial',
        name: 'Trial Starts',
        icon: <Play className="w-5 h-5" />,
        count: 1920,
        previousCount: 1650,
        conversionRate: 91.4,
        dropOffRate: 8.6,
        color: 'bg-purple-500',
      },
      {
        id: 'onboarding',
        name: 'Onboarding Complete',
        icon: <CheckCircle className="w-5 h-5" />,
        count: 1680,
        previousCount: 1440,
        conversionRate: 87.5,
        dropOffRate: 12.5,
        color: 'bg-yellow-500',
      },
      {
        id: 'first_analysis',
        name: 'First Analysis',
        icon: <Zap className="w-5 h-5" />,
        count: 1450,
        previousCount: 1200,
        conversionRate: 86.3,
        dropOffRate: 13.7,
        color: 'bg-orange-500',
      },
      {
        id: 'first_proposal',
        name: 'First Proposal',
        icon: <FileText className="w-5 h-5" />,
        count: 1150,
        previousCount: 960,
        conversionRate: 79.3,
        dropOffRate: 20.7,
        color: 'bg-pink-500',
      },
      {
        id: 'upgrade_click',
        name: 'Upgrade Clicks',
        icon: <ArrowUpRight className="w-5 h-5" />,
        count: 520,
        previousCount: 420,
        conversionRate: 45.2,
        dropOffRate: 54.8,
        color: 'bg-indigo-500',
      },
      {
        id: 'purchase',
        name: 'Purchases',
        icon: <DollarSign className="w-5 h-5" />,
        count: 275,
        previousCount: 220,
        conversionRate: 52.9,
        dropOffRate: 47.1,
        color: 'bg-emerald-500',
      },
      {
        id: 'line_connect',
        name: 'LINE Connect',
        icon: <MessageSquare className="w-5 h-5" />,
        count: 1000,
        previousCount: 840,
        conversionRate: 47.6,
        dropOffRate: 52.4,
        color: 'bg-cyan-500',
      },
    ],
    overallConversionRate: 1.7,
    totalRevenue: 1375000,
    avgTimeToPurchase: 5.1,
  },
}

export default function FunnelDashboardPage() {
  const t = useTranslations('analytics.funnel')
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d'>('30d')
  const [isLoading, setIsLoading] = useState(false)
  const [funnelData, setFunnelData] = useState<FunnelData>(DEMO_FUNNEL_DATA['30d'])

  const handleRefresh = async () => {
    setIsLoading(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setFunnelData(DEMO_FUNNEL_DATA[selectedPeriod])
    setIsLoading(false)
  }

  const handleExport = () => {
    // Export funnel data as CSV
    const headers = ['Stage', 'Count', 'Conversion Rate (%)', 'Drop-off Rate (%)']
    const rows = funnelData.stages.map((stage) => [
      stage.name,
      stage.count.toString(),
      stage.conversionRate?.toFixed(1) || '-',
      stage.dropOffRate?.toFixed(1) || '-',
    ])

    const csvContent = [headers, ...rows].map((row) => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `funnel-data-${selectedPeriod}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const calculateChange = (current: number, previous?: number) => {
    if (previous === undefined || previous === 0) {
      return null
    }
    const change = ((current - previous) / previous) * 100
    return change
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {t('title') || 'B2B SaaS Funnel Dashboard'}
            </h1>
            <p className="text-gray-600 mt-1">
              {t('subtitle') || 'Track conversion metrics from visit to purchase'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              {t('refresh') || 'Refresh'}
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              {t('export') || 'Export'}
            </Button>
          </div>
        </div>

        {/* Period Selector */}
        <div className="flex items-center gap-2">
          {(['7d', '30d', '90d'] as const).map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                selectedPeriod === period
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              {period === '7d' ? '7 Days' : period === '30d' ? '30 Days' : '90 Days'}
            </button>
          ))}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardBody className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">
                    {t('overallConversion') || 'Overall Conversion Rate'}
                  </p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {funnelData.overallConversionRate.toFixed(1)}%
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-blue-100">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{t('totalRevenue') || 'Total Revenue'}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {formatCurrency(funnelData.totalRevenue)}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-green-100">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">
                    {t('avgTimeToPurchase') || 'Avg Time to Purchase'}
                  </p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {funnelData.avgTimeToPurchase.toFixed(1)}d
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-purple-100">
                  <Calendar className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Funnel Visualization */}
        <Card>
          <CardHeader title={t('funnelTitle') || 'Conversion Funnel'} />
          <CardBody>
            <div className="space-y-3">
              {funnelData.stages.map((stage, index) => {
                const change = calculateChange(stage.count, stage.previousCount)
                const maxCount = funnelData.stages[0].count
                const widthPercent = (stage.count / maxCount) * 100

                return (
                  <div key={stage.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${stage.color} bg-opacity-10`}>
                          <div className={stage.color.replace('bg-', 'text-')}>{stage.icon}</div>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{stage.name}</p>
                          <p className="text-sm text-gray-600">
                            {stage.count.toLocaleString()} users
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {stage.conversionRate !== undefined && (
                          <div className="text-right">
                            <p className="text-sm text-gray-600">
                              {t('conversion') || 'Conversion'}
                            </p>
                            <p className="font-semibold text-green-600">
                              {stage.conversionRate.toFixed(1)}%
                            </p>
                          </div>
                        )}
                        {stage.dropOffRate !== undefined && index > 0 && (
                          <div className="text-right">
                            <p className="text-sm text-gray-600">{t('dropOff') || 'Drop-off'}</p>
                            <p className="font-semibold text-red-600">
                              {stage.dropOffRate.toFixed(1)}%
                            </p>
                          </div>
                        )}
                        {change !== null && (
                          <div
                            className={`flex items-center gap-1 text-sm font-medium ${
                              change >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}
                          >
                            {change >= 0 ? (
                              <TrendingUp className="w-4 h-4" />
                            ) : (
                              <TrendingDown className="w-4 h-4" />
                            )}
                            {Math.abs(change).toFixed(1)}%
                          </div>
                        )}
                      </div>
                    </div>
                    {/* Funnel bar */}
                    <div className="h-8 bg-gray-100 rounded-lg overflow-hidden">
                      <div
                        className={`h-full ${stage.color} rounded-lg transition-all duration-500`}
                        style={{ width: `${widthPercent}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </CardBody>
        </Card>

        {/* Insights */}
        <Card>
          <CardHeader title={t('insights') || 'Key Insights'} />
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-blue-900 mb-2">
                  {t('insight1Title') || 'Highest Drop-off Stage'}
                </h3>
                <p className="text-sm text-blue-700">
                  {t('insight1Desc') ||
                    'Sign Up to Trial Start has the highest drop-off rate. Consider improving the trial activation flow.'}
                </p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <h3 className="font-semibold text-green-900 mb-2">
                  {t('insight2Title') || 'Strong Onboarding Completion'}
                </h3>
                <p className="text-sm text-green-700">
                  {t('insight2Desc') ||
                    '87.5% of users complete onboarding, indicating a smooth onboarding experience.'}
                </p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <h3 className="font-semibold text-purple-900 mb-2">
                  {t('insight3Title') || 'High LINE Integration Rate'}
                </h3>
                <p className="text-sm text-purple-700">
                  {t('insight3Desc') ||
                    '47.6% of trial users connect LINE OA, showing strong interest in multi-channel engagement.'}
                </p>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                <h3 className="font-semibold text-orange-900 mb-2">
                  {t('insight4Title') || 'Purchase Conversion Opportunity'}
                </h3>
                <p className="text-sm text-orange-700">
                  {t('insight4Desc') ||
                    '52.9% of upgrade clicks convert to purchases. Focus on improving upgrade button visibility and placement.'}
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </AppLayout>
  )
}
