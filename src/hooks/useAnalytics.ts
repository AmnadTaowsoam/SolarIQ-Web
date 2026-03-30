'use client'

import { useCallback, useEffect, useState } from 'react'
import apiClient from '@/lib/api'
import {
  DashboardResponse,
  PipelineResponse,
  LeadAnalyticsResponse,
  RevenueAnalyticsResponse,
  MarketResponse,
  Insight,
  Scorecard,
  CustomReport,
  ReportConfig,
} from '@/types/analytics'

// API_BASE kept for reference; actual calls use apiClient with /api/v1 prefix
// const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1'

// Demo data
const DEMO_DASHBOARD: DashboardResponse = {
  kpis: {
    revenue: {
      value: 2400000,
      previous: 2100000,
      change: 12.5,
      sparkline: [20, 25, 21, 30, 35, 28, 40],
    },
    dealsWon: { value: 47, previous: 42, change: 11.9, sparkline: [2, 4, 3, 5, 6, 4, 7] },
    conversionRate: {
      value: 23.5,
      previous: 24.7,
      change: -1.2,
      sparkline: [22, 24, 25, 23, 22, 24, 23],
    },
    avgDealValue: {
      value: 51000,
      previous: 48000,
      change: 6.3,
      sparkline: [45, 46, 48, 50, 52, 50, 51],
    },
    satisfaction: {
      value: 4.7,
      previous: 4.6,
      change: 0.1,
      sparkline: [4.5, 4.6, 4.7, 4.6, 4.7, 4.7, 4.8],
    },
    responseTime: { value: 32, previous: 40, change: -20, sparkline: [45, 40, 38, 36, 35, 34, 32] },
  },
  topSources: [
    { source: 'LINE', count: 45, percentage: 45 },
    { source: 'Web', count: 30, percentage: 30 },
    { source: 'Referral', count: 25, percentage: 25 },
  ],
  recentInsights: [
    {
      id: 'ins-1',
      type: 'trend',
      title: 'ยอดขายเพิ่ม 15%',
      body: 'แคมเปญ LINE ทำให้ยอดขายเพิ่มขึ้นอย่างต่อเนื่อง',
      severity: 'info',
    },
    {
      id: 'ins-2',
      type: 'anomaly',
      title: 'Lead เชียงใหม่ลดลง',
      body: 'Lead ลดลง 40% เทียบกับสัปดาห์ก่อน',
      severity: 'warning',
    },
  ],
}

const DEMO_PIPELINE: PipelineResponse = {
  funnel: [
    { stage: 'lead', count: 200, conversionRate: null },
    { stage: 'qualified', count: 140, conversionRate: 70 },
    { stage: 'proposal', count: 90, conversionRate: 64 },
    { stage: 'negotiation', count: 60, conversionRate: 67 },
    { stage: 'won', count: 47, conversionRate: 78 },
  ],
  bottlenecks: [
    {
      stage: 'proposal',
      issue: 'Stage proposal ใช้เวลานาน 40%',
      recommendation: 'ปรับ template ใบเสนอราคาให้เร็วขึ้น',
    },
  ],
  forecast: { weighted: 1800000, best: 2400000, worst: 1200000 },
}

const DEMO_LEADS: LeadAnalyticsResponse = {
  sources: [
    { source: 'LINE', count: 120, conversionRate: 28, avgDealValue: 52000 },
    { source: 'Web', count: 80, conversionRate: 18, avgDealValue: 48000 },
    { source: 'Referral', count: 40, conversionRate: 35, avgDealValue: 65000 },
  ],
  quality: [
    { grade: 'A', count: 45, percentage: 30 },
    { grade: 'B', count: 70, percentage: 46.7 },
    { grade: 'C', count: 35, percentage: 23.3 },
  ],
  responseTime: {
    avg: 1.2,
    median: 0.8,
    distribution: { '1h': 45, '2h': 30, '4h': 20, '8h': 10, '24h': 5, '24h+': 2 },
  },
  timing: {
    heatmap: Array.from({ length: 7 }, () =>
      Array.from({ length: 24 }, () => Math.floor(Math.random() * 10))
    ),
  },
}

const DEMO_REVENUE: RevenueAnalyticsResponse = {
  trend: [
    {
      date: '2026-01-01',
      total: 900000,
      subscription: 500000,
      commission: 300000,
      leadFee: 100000,
    },
    {
      date: '2026-02-01',
      total: 1100000,
      subscription: 620000,
      commission: 360000,
      leadFee: 120000,
    },
    {
      date: '2026-03-01',
      total: 1300000,
      subscription: 720000,
      commission: 430000,
      leadFee: 150000,
    },
  ],
  mrr: { current: 720000, previous: 620000, change: 16.1 },
  mrrWaterfall: {
    starting: 620000,
    new: 140000,
    expansion: 60000,
    contraction: 20000,
    churn: 80000,
    ending: 720000,
  },
  arpu: { value: 18000, trend: [16000, 17000, 18000] },
  churnRate: { value: 3.2, trend: [2.8, 3.0, 3.2] },
}

const DEMO_MARKET: MarketResponse = {
  systemSize: {
    avg: 6.2,
    distribution: { '<3': 12, '3-5': 30, '5-10': 45, '10-20': 18, '20+': 5 },
    trend: [5.2, 5.5, 5.8, 6.2],
  },
  pricePerKwp: { avg: 42000, min: 32000, max: 58000, trend: [45000, 43000, 42000, 41000] },
  popularBrands: {
    panels: [
      { name: 'Jinko', count: 32 },
      { name: 'Trina', count: 24 },
    ],
    inverters: [{ name: 'Huawei', count: 20 }],
  },
  seasonalPattern: [30, 25, 28, 35, 40, 38, 36, 34, 30, 28, 26, 24],
  roiBenchmarks: [{ region: 'Thailand', avgRoi: 0.22, avgPayback: 6.2 }],
}

const DEMO_SCORECARD: Scorecard = {
  contractorId: 'demo-org',
  periodYear: 2026,
  periodMonth: 3,
  responseTimeScore: 75,
  conversionRateScore: 85,
  satisfactionScore: 90,
  cycleTimeScore: 80,
  activityScore: 70,
  overallScore: 82,
  grade: 'B',
  rawMetrics: {},
  recommendations: [],
}

const DEMO_REPORTS: CustomReport[] = [
  {
    id: 'rep-1',
    name: 'Leads by Source',
    description: 'Monthly lead sources breakdown',
    category: 'sales',
    config: {
      dataSources: ['leads'],
      fields: [{ source: 'leads', field: 'status', aggregation: 'COUNT', alias: 'count' }],
      visualization: 'table',
    },
    lastRunAt: '2026-03-21T08:00:00Z',
    lastRunStatus: 'success',
  },
  {
    id: 'rep-2',
    name: 'Monthly Revenue',
    description: 'Revenue summary by month',
    category: 'financial',
    config: {
      dataSources: ['deals'],
      fields: [{ source: 'deals', field: 'totalValue', aggregation: 'SUM', alias: 'revenue' }],
      visualization: 'bar',
    },
    lastRunAt: '2026-03-20T10:00:00Z',
    lastRunStatus: 'success',
  },
  {
    id: 'rep-3',
    name: 'Conversion Funnel',
    description: 'Lead to deal conversion rate analysis',
    category: 'sales',
    config: {
      dataSources: ['leads', 'deals'],
      fields: [{ source: 'leads', field: 'id', aggregation: 'COUNT', alias: 'total_leads' }],
      visualization: 'table',
    },
    lastRunAt: '2026-03-19T14:00:00Z',
    lastRunStatus: 'success',
  },
  {
    id: 'rep-4',
    name: 'Installation Summary',
    description: 'Total installations by region and system size',
    category: 'operations',
    config: {
      dataSources: ['deals'],
      fields: [{ source: 'deals', field: 'stage', aggregation: 'COUNT', alias: 'count' }],
      groupBy: ['stage'],
      visualization: 'pie',
    },
    lastRunAt: null,
    lastRunStatus: null,
  },
]

function useApi<T>(endpoint: string, demo: T) {
  const [data, setData] = useState<T>(demo)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await apiClient.get(`/api/v1${endpoint}`)
      setData(response.data)
    } catch {
      // Fallback to demo data when API is unavailable
      setData(demo)
      setError('Using demo data')
    } finally {
      setIsLoading(false)
    }
  }, [endpoint, demo])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, isLoading, error, refetch: fetchData }
}

export function useAnalyticsDashboard() {
  return useApi<DashboardResponse>('/analytics/dashboard', DEMO_DASHBOARD)
}

export function useAnalyticsPipeline() {
  return useApi<PipelineResponse>('/analytics/pipeline', DEMO_PIPELINE)
}

export function useAnalyticsLeads() {
  return useApi<LeadAnalyticsResponse>('/analytics/leads', DEMO_LEADS)
}

export function useAnalyticsRevenue() {
  return useApi<RevenueAnalyticsResponse>('/analytics/revenue', DEMO_REVENUE)
}

export function useAnalyticsMarket() {
  return useApi<MarketResponse>('/analytics/market', DEMO_MARKET)
}

export function useAnalyticsInsights() {
  return useApi<{ insights: Insight[] }>('/analytics/insights', {
    insights: DEMO_DASHBOARD.recentInsights,
  })
}

export function useAnalyticsScorecard() {
  return useApi<Scorecard>('/analytics/scorecard', DEMO_SCORECARD)
}

export function useAnalyticsScorecardHistory() {
  return useApi<{ history: Scorecard[] }>('/analytics/scorecard/history', {
    history: [DEMO_SCORECARD],
  })
}

export function useReports() {
  return useApi<{ reports: CustomReport[]; total: number }>('/reports', {
    reports: DEMO_REPORTS,
    total: DEMO_REPORTS.length,
  })
}

export function useReport(reportId: string | null) {
  const [data, setData] = useState<CustomReport | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const fetchData = useCallback(async () => {
    if (!reportId) {
      return
    }
    setIsLoading(true)
    try {
      const response = await apiClient.get(`/api/v1/reports/${reportId}`)
      setData(response.data)
    } catch {
      const demo = DEMO_REPORTS.find((r) => r.id === reportId) || null
      setData(demo)
    } finally {
      setIsLoading(false)
    }
  }, [reportId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, isLoading, refetch: fetchData }
}

export async function runReport(reportId: string, format: 'json' | 'csv' = 'json') {
  const response = await apiClient.post(`/api/v1/reports/${reportId}/run`, null, {
    params: { format },
  })
  if (format === 'csv') {
    return { format: 'csv', content: response.data }
  }
  return response.data
}

export async function createReport(payload: {
  name: string
  description?: string
  category?: string
  config: ReportConfig
}) {
  const response = await apiClient.post('/api/v1/reports', payload)
  return response.data
}
