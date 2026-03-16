'use client'

import { useQuery, useMutation } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { API_ENDPOINTS } from '@/lib/constants'
import {
  ApiResponse,
  DashboardStats,
  Lead,
  LeadsOverTime,
  SolarAnalysisRequest,
  SolarAnalysisResult,
  TopLocation,
} from '@/types'

export function useSolarAnalysis() {
  return useMutation({
    mutationFn: (request: SolarAnalysisRequest) =>
      api.post<SolarAnalysisResult>(API_ENDPOINTS.SOLAR.ANALYZE, request),
  })
}

export function useSolarHistory(page: number = 1, pageSize: number = 10) {
  return useQuery({
    queryKey: ['solar-history', page, pageSize],
    queryFn: () =>
      api.get(API_ENDPOINTS.SOLAR.HISTORY, { page, pageSize }),
  })
}

export function useDashboardStats() {
  return useQuery<ApiResponse<DashboardStats>>({
    queryKey: ['dashboard-stats'],
    queryFn: () => api.get<ApiResponse<DashboardStats>>(API_ENDPOINTS.DASHBOARD.STATS),
    refetchInterval: 60000, // Refresh every minute
  })
}

export function useLeadsOverTime(days: number = 30) {
  return useQuery<LeadsOverTime[]>({
    queryKey: ['leads-over-time', days],
    queryFn: () =>
      api.get<LeadsOverTime[]>(API_ENDPOINTS.DASHBOARD.LEADS_OVER_TIME, { days }),
  })
}

export function useTopLocations(limit: number = 10) {
  return useQuery<TopLocation[]>({
    queryKey: ['top-locations', limit],
    queryFn: () =>
      api.get<TopLocation[]>(API_ENDPOINTS.DASHBOARD.TOP_LOCATIONS, { limit }),
  })
}

export function useRecentLeads(limit: number = 5) {
  return useQuery<Lead[]>({
    queryKey: ['recent-leads', limit],
    queryFn: () =>
      api.get<Lead[]>(API_ENDPOINTS.DASHBOARD.RECENT_LEADS, { limit }),
  })
}
