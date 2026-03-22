'use client'

import { useQuery, useMutation } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { API_ENDPOINTS } from '@/lib/constants'
import type {
  SolarAnalysisAdvanced,
  SolarAnalysisAdvancedRequest,
  ShadeAnalysis,
  HourlyIrradiance,
  DataLayerUrls,
  LocalIncentive,
  PanelSpec,
  MonthlyProduction,
  SystemSizeOption,
  EnvironmentalImpactData,
} from '@/types'

export function useSolarAnalysisAdvanced() {
  return useMutation({
    mutationFn: (request: SolarAnalysisAdvancedRequest) =>
      api.post<SolarAnalysisAdvanced>(API_ENDPOINTS.SOLAR.ANALYZE_ADVANCED, request),
  })
}

export function useShadeAnalysis(lat: number, lng: number, enabled = true) {
  return useQuery({
    queryKey: ['shade-analysis', lat, lng],
    queryFn: () =>
      api.get<ShadeAnalysis>(API_ENDPOINTS.SOLAR.SHADE_ANALYSIS, {
        params: { lat, lng },
      }),
    enabled: enabled && lat !== 0 && lng !== 0,
  })
}

export function useHourlyIrradiance(lat: number, lng: number, enabled = true) {
  return useQuery({
    queryKey: ['hourly-irradiance', lat, lng],
    queryFn: () =>
      api.get<HourlyIrradiance[]>(API_ENDPOINTS.SOLAR.HOURLY_IRRADIANCE, {
        params: { lat, lng },
      }),
    enabled: enabled && lat !== 0 && lng !== 0,
  })
}

export function useDataLayers(lat: number, lng: number, enabled = true) {
  return useQuery({
    queryKey: ['data-layers', lat, lng],
    queryFn: () =>
      api.get<DataLayerUrls>(API_ENDPOINTS.SOLAR.DATA_LAYERS, {
        params: { lat, lng },
      }),
    enabled: enabled && lat !== 0 && lng !== 0,
  })
}

export function useIncentives() {
  return useQuery({
    queryKey: ['incentives'],
    queryFn: () =>
      api.get<LocalIncentive[]>(API_ENDPOINTS.SOLAR.INCENTIVES),
  })
}

export function usePanelSpecs() {
  return useQuery({
    queryKey: ['panel-specs'],
    queryFn: () =>
      api.get<PanelSpec[]>(API_ENDPOINTS.SOLAR.PANELS),
  })
}

export function useMonthlyProduction(lat: number, lng: number, systemSizeKwp: number) {
  return useQuery({
    queryKey: ['monthly-production', lat, lng, systemSizeKwp],
    queryFn: () =>
      api.get<MonthlyProduction[]>(API_ENDPOINTS.SOLAR.MONTHLY_PRODUCTION, {
        params: { lat, lng, systemSizeKwp },
      }),
    enabled: lat !== 0 && lng !== 0 && systemSizeKwp > 0,
  })
}

export function useSystemOptions(lat: number, lng: number, monthlyBill: number) {
  return useQuery({
    queryKey: ['system-options', lat, lng, monthlyBill],
    queryFn: () =>
      api.get<SystemSizeOption[]>(API_ENDPOINTS.SOLAR.SYSTEM_OPTIONS, {
        params: { lat, lng, monthlyBill },
      }),
    enabled: lat !== 0 && lng !== 0 && monthlyBill > 0,
  })
}

export function useEnvironmentalImpact(annualProductionKwh: number) {
  return useQuery({
    queryKey: ['environmental-impact', annualProductionKwh],
    queryFn: () =>
      api.get<EnvironmentalImpactData>(API_ENDPOINTS.SOLAR.ENVIRONMENTAL_IMPACT, {
        params: { annualProductionKwh },
      }),
    enabled: annualProductionKwh > 0,
  })
}
