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

const EMPTY_DASHBOARD: DashboardResponse = {
  kpis: {
    revenue: { value: 0, previous: 0, change: 0, sparkline: [] },
    dealsWon: { value: 0, previous: 0, change: 0, sparkline: [] },
    conversionRate: { value: 0, previous: 0, change: 0, sparkline: [] },
    avgDealValue: { value: 0, previous: 0, change: 0, sparkline: [] },
    satisfaction: { value: 0, previous: 0, change: 0, sparkline: [] },
    responseTime: { value: 0, previous: 0, change: 0, sparkline: [] },
  },
  topSources: [],
  recentInsights: [],
}

const EMPTY_PIPELINE: PipelineResponse = {
  funnel: [],
  bottlenecks: [],
  forecast: { weighted: 0, best: 0, worst: 0 },
}

const EMPTY_LEADS: LeadAnalyticsResponse = {
  sources: [],
  quality: [],
  responseTime: {
    avg: 0,
    median: 0,
    distribution: {},
  },
  timing: {
    heatmap: [],
  },
}

const EMPTY_REVENUE: RevenueAnalyticsResponse = {
  trend: [],
  mrr: { current: 0, previous: 0, change: 0 },
  mrrWaterfall: {
    starting: 0,
    new: 0,
    expansion: 0,
    contraction: 0,
    churn: 0,
    ending: 0,
  },
  arpu: { value: 0, trend: [] },
  churnRate: { value: 0, trend: [] },
}

const EMPTY_MARKET: MarketResponse = {
  systemSize: { avg: 0, distribution: {}, trend: [] },
  pricePerKwp: { avg: 0, min: 0, max: 0, trend: [] },
  popularBrands: {
    panels: [],
    inverters: [],
  },
  seasonalPattern: [],
  roiBenchmarks: [],
}

const EMPTY_SCORECARD: Scorecard = {
  contractorId: '',
  periodYear: new Date().getFullYear(),
  periodMonth: new Date().getMonth() + 1,
  responseTimeScore: 0,
  conversionRateScore: 0,
  satisfactionScore: 0,
  cycleTimeScore: 0,
  activityScore: 0,
  overallScore: 0,
  grade: '-',
  rawMetrics: {},
  recommendations: [],
}

const EMPTY_REPORTS: CustomReport[] = []

function getErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message
  }
  return 'Analytics data is currently unavailable'
}

function useApi<T>(endpoint: string, fallback: T) {
  const [data, setData] = useState<T>(fallback)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await apiClient.get(`/api/v1${endpoint}`)
      setData(response.data)
    } catch (fetchError) {
      setData(fallback)
      setError(getErrorMessage(fetchError))
    } finally {
      setIsLoading(false)
    }
  }, [endpoint, fallback])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, isLoading, error, refetch: fetchData }
}

export function useAnalyticsDashboard() {
  return useApi<DashboardResponse>('/analytics/dashboard', EMPTY_DASHBOARD)
}

export function useAnalyticsPipeline() {
  return useApi<PipelineResponse>('/analytics/pipeline', EMPTY_PIPELINE)
}

export function useAnalyticsLeads() {
  return useApi<LeadAnalyticsResponse>('/analytics/leads', EMPTY_LEADS)
}

export function useAnalyticsRevenue() {
  return useApi<RevenueAnalyticsResponse>('/analytics/revenue', EMPTY_REVENUE)
}

export function useAnalyticsMarket() {
  return useApi<MarketResponse>('/analytics/market', EMPTY_MARKET)
}

export function useAnalyticsInsights() {
  return useApi<{ insights: Insight[] }>('/analytics/insights', {
    insights: [],
  })
}

export function useAnalyticsScorecard() {
  return useApi<Scorecard>('/analytics/scorecard', EMPTY_SCORECARD)
}

export function useAnalyticsScorecardHistory() {
  return useApi<{ history: Scorecard[] }>('/analytics/scorecard/history', {
    history: [],
  })
}

export function useReports() {
  return useApi<{ reports: CustomReport[]; total: number }>('/reports', {
    reports: EMPTY_REPORTS,
    total: 0,
  })
}

export function useReport(reportId: string | null) {
  const [data, setData] = useState<CustomReport | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    if (!reportId) {
      setData(null)
      return
    }
    setIsLoading(true)
    setError(null)
    try {
      const response = await apiClient.get(`/api/v1/reports/${reportId}`)
      setData(response.data)
    } catch (fetchError) {
      setData(null)
      setError(getErrorMessage(fetchError))
    } finally {
      setIsLoading(false)
    }
  }, [reportId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, isLoading, error, refetch: fetchData }
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
