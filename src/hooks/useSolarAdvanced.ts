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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapApiResponse(raw: any): SolarAnalysisAdvanced {
  const sp = raw.solar_potential || {}
  const pc = sp.panel_configs?.[0] || {}
  const systemKw = raw.system_size_kw || 0
  const annualSavings = raw.annual_savings || 0
  // Estimate installation cost from system options or default
  const recOpt =
    raw.system_options?.find((o: { is_recommended: boolean }) => o.is_recommended) ||
    raw.system_options?.[0] ||
    {}
  const installCost = recOpt.installation_cost_thb || systemKw * 35000

  return {
    analysisId: raw.analysis_id || '',
    coordinates: { latitude: sp.latitude || 0, longitude: sp.longitude || 0 },
    address: raw.address || '',
    solarPotential: {
      maxSunshineHoursPerYear: sp.sunshine_hours_per_year || 0,
      carbonOffsetFactorKgPerMwh: sp.carbon_offset_kg_per_mwh || 0,
      maxPanels: sp.max_panels || 0,
      roofAreaM2: sp.roof_area_m2 || 0,
      quality: sp.quality || 'LOW',
      imageryDate: sp.imagery_date || '',
    },
    panelConfig: {
      panelsCount: pc.panels_count || 0,
      capacityKw: systemKw,
      yearlyEnergyDcKwh: pc.yearly_energy_dc_kwh || 0,
    },
    financialAnalysis: {
      installationCost: installCost,
      netCost: installCost,
      monthlySavings: annualSavings / 12,
      yearlySavings: annualSavings,
      paybackYears: raw.roi_years || 0,
      roi25Year: recOpt.roi_25yr_percent || 0,
      npvThb: 0,
      irrPercent: 0,
    },
    electricityRate: 4.15,
    selfConsumptionRate: raw.self_consumption_rate || 0.7,
    netBillingRate: raw.net_billing_rate || 2.2,
    annualMaintenanceCost: raw.annual_maintenance_cost || 0,
    panelConfigs: (raw.panel_configs || []).map(
      (c: { panels_count: number; yearly_energy_dc_kwh: number }) => ({
        panelsCount: c.panels_count,
        yearlyEnergyDcKwh: c.yearly_energy_dc_kwh,
      })
    ),
    roofSegments: raw.roof_segments || [],
    solarPanels: raw.solar_panels || [],
    shadeAnalysis: raw.shade_analysis
      ? {
          monthlyShadePercent: raw.shade_analysis.monthly_shade_percent || [],
          annualAverageShadePercent: raw.shade_analysis.annual_average_shade_percent || 0,
          bestMonth: raw.shade_analysis.best_month || '',
          worstMonth: raw.shade_analysis.worst_month || '',
          shadeFreeHoursPerDay: raw.shade_analysis.shade_free_hours_per_day || 0,
        }
      : undefined,
    hourlyIrradiance: (raw.hourly_irradiance || []).map(
      (h: { hour: number; irradiance_w_per_m2: number; is_peak: boolean }) => ({
        hour: h.hour,
        irradianceWPerM2: h.irradiance_w_per_m2,
        isPeak: h.is_peak,
      })
    ),
    dataLayers: raw.data_layers || undefined,
    incentives: (raw.incentives || []).map(
      (i: {
        name: string
        description: string
        amount_thb: number | null
        percentage: number | null
        provider: string
        eligibility: string
        valid_until: string | null
      }) => ({
        name: i.name,
        description: i.description,
        amountThb: i.amount_thb,
        percentage: i.percentage,
        provider: i.provider,
        eligibility: i.eligibility,
        validUntil: i.valid_until,
      })
    ),
    panelSpecs: (raw.panel_specs || []).map(
      (p: {
        brand: string
        model: string
        wattage: number
        efficiency_percent: number
        price_per_watt_thb: number
        warranty_years: number
        type: string
        dimensions_mm: { width: number; height: number }
        weight_kg: number
      }) => ({
        brand: p.brand,
        model: p.model,
        wattage: p.wattage,
        efficiencyPercent: p.efficiency_percent,
        pricePerWattThb: p.price_per_watt_thb,
        warrantyYears: p.warranty_years,
        type: p.type,
        dimensionsMm: p.dimensions_mm,
        weightKg: p.weight_kg,
      })
    ),
    yearlyCashflow: [],
    monthlyProduction: (raw.monthly_production || []).map(
      (m: {
        month: number
        month_name: string
        production_kwh: number
        sunshine_hours: number
        efficiency_factor: number
      }) => ({
        month: m.month,
        monthName: m.month_name,
        productionKwh: m.production_kwh,
        sunshineHours: m.sunshine_hours,
        efficiencyFactor: m.efficiency_factor,
      })
    ),
    systemOptions: (raw.system_options || []).map(
      (s: {
        size_kwp: number
        panels_count: number
        annual_production_kwh: number
        installation_cost_thb: number
        monthly_savings_thb: number
        annual_savings_thb: number
        payback_years: number
        roi_25yr_percent: number
        self_consumption_percent: number
        is_recommended: boolean
        recommendation_reason: string
      }) => ({
        sizeKwp: s.size_kwp,
        panelsCount: s.panels_count,
        annualProductionKwh: s.annual_production_kwh,
        installationCostThb: s.installation_cost_thb,
        monthlySavingsThb: s.monthly_savings_thb,
        annualSavingsThb: s.annual_savings_thb,
        paybackYears: s.payback_years,
        roi25yrPercent: s.roi_25yr_percent,
        selfConsumptionPercent: s.self_consumption_percent,
        isRecommended: s.is_recommended,
        recommendationReason: s.recommendation_reason,
      })
    ),
    environmentalImpact: {
      co2OffsetTonsPerYear: raw.environmental_impact?.co2_offset_tons_per_year || 0,
      co2OffsetTons25yr: raw.environmental_impact?.co2_offset_tons_25yr || 0,
      treesEquivalent: raw.environmental_impact?.trees_equivalent || 0,
      carsOffRoad: raw.environmental_impact?.cars_off_road || 0,
      homesPowered: raw.environmental_impact?.homes_powered || 0,
      coalAvoidedKg: raw.environmental_impact?.coal_avoided_kg || 0,
      waterSavedLiters: raw.environmental_impact?.water_saved_liters || 0,
    },
  }
}

export function useSolarAnalysisAdvanced() {
  return useMutation({
    mutationFn: async (request: SolarAnalysisAdvancedRequest) => {
      const raw = await api.post(API_ENDPOINTS.SOLAR.ANALYZE_ADVANCED, request)
      return mapApiResponse(raw)
    },
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
    queryFn: () => api.get<LocalIncentive[]>(API_ENDPOINTS.SOLAR.INCENTIVES),
  })
}

export function usePanelSpecs() {
  return useQuery({
    queryKey: ['panel-specs'],
    queryFn: () => api.get<PanelSpec[]>(API_ENDPOINTS.SOLAR.PANELS),
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
