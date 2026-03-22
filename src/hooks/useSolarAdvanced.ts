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
  DynamicYieldForecast,
  LiveConditions,
  ClimateReliabilityData,
  ClimateRiskAssessment,
  AirQualityData,
  AirQualityForecast,
  DustSeasonAnalysis,
  FinancingComparison,
  SmartAlertItem,
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

export function useWeatherForecast(lat: number, lng: number) {
  return useQuery({
    queryKey: ['weather-forecast', lat, lng],
    queryFn: () =>
      api.get<DynamicYieldForecast>(API_ENDPOINTS.SOLAR.FORECAST_WEATHER, {
        params: { lat, lng },
      }),
    enabled: lat !== 0 && lng !== 0,
  })
}

export function useDynamicYield(lat: number, lng: number, yearlyKwh: number) {
  return useQuery({
    queryKey: ['dynamic-yield', lat, lng, yearlyKwh],
    queryFn: () =>
      api.get<DynamicYieldForecast>(API_ENDPOINTS.SOLAR.FORECAST_DYNAMIC_YIELD, {
        params: { lat, lng, yearlyKwh },
      }),
    enabled: lat !== 0 && lng !== 0 && yearlyKwh > 0,
  })
}

export function useLiveConditions(lat: number, lng: number) {
  return useQuery({
    queryKey: ['live-conditions', lat, lng],
    queryFn: () =>
      api.get<LiveConditions>(API_ENDPOINTS.SOLAR.FORECAST_LIVE_CONDITIONS, {
        params: { lat, lng },
      }),
    enabled: lat !== 0 && lng !== 0,
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
  })
}

export function useClimateScore(lat: number, lng: number) {
  return useQuery({
    queryKey: ['climate-score', lat, lng],
    queryFn: () =>
      api.get<ClimateReliabilityData>(API_ENDPOINTS.SOLAR.FORECAST_CLIMATE_SCORE, {
        params: { lat, lng },
      }),
    enabled: lat !== 0 && lng !== 0,
  })
}

export function useClimateRisk(lat: number, lng: number) {
  return useQuery({
    queryKey: ['climate-risk', lat, lng],
    queryFn: () =>
      api.get<ClimateRiskAssessment>(API_ENDPOINTS.SOLAR.FORECAST_CLIMATE_RISK, {
        params: { lat, lng },
      }),
    enabled: lat !== 0 && lng !== 0,
  })
}

export function useAirQuality(lat: number, lng: number) {
  return useQuery({
    queryKey: ['air-quality', lat, lng],
    queryFn: () =>
      api.get<AirQualityData>(API_ENDPOINTS.SOLAR.FORECAST_AIR_QUALITY, {
        params: { lat, lng },
      }),
    enabled: lat !== 0 && lng !== 0,
    refetchInterval: 10 * 60 * 1000, // Refresh every 10 minutes
  })
}

export function useAirQualityForecast(lat: number, lng: number) {
  return useQuery({
    queryKey: ['air-quality-forecast', lat, lng],
    queryFn: () =>
      api.get<AirQualityForecast>(API_ENDPOINTS.SOLAR.FORECAST_AIR_QUALITY_FORECAST, {
        params: { lat, lng },
      }),
    enabled: lat !== 0 && lng !== 0,
  })
}

export function useDustSeason(lat: number, lng: number) {
  return useQuery({
    queryKey: ['dust-season', lat, lng],
    queryFn: () =>
      api.get<DustSeasonAnalysis>(API_ENDPOINTS.SOLAR.FORECAST_DUST_SEASON, {
        params: { lat, lng },
      }),
    enabled: lat !== 0 && lng !== 0,
  })
}

export function useFinancingOptions(systemCost: number, annualSavings: number) {
  return useMutation({
    mutationFn: () =>
      api.post<FinancingComparison>(API_ENDPOINTS.SOLAR.FORECAST_FINANCING_OPTIONS, {
        systemCost,
        annualSavings,
      }),
  })
}

export function useSmartAlerts(lat: number, lng: number) {
  return useQuery({
    queryKey: ['smart-alerts', lat, lng],
    queryFn: () =>
      api.get<SmartAlertItem[]>(API_ENDPOINTS.SOLAR.FORECAST_ALERTS, {
        params: { lat, lng },
      }),
    enabled: lat !== 0 && lng !== 0,
    refetchInterval: 15 * 60 * 1000, // Refresh every 15 minutes
  })
}
