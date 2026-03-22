// Solar API Advanced Types

/** Panel position on roof — actual lat/lng coordinates from Google Solar API */
export interface SolarPanel {
  centerLat: number
  centerLng: number
  orientation: 'PORTRAIT' | 'LANDSCAPE'
  segmentIndex: number
  yearlyEnergyDcKwh: number
}

/** Per-segment stats within a panel configuration */
export interface PanelConfigSegmentStat {
  pitchDegrees: number
  azimuthDegrees: number
  panelsCount: number
  yearlyEnergyDcKwh: number
  segmentIndex: number
}

/** Panel configuration option — one per possible panel count (1..maxPanels) */
export interface PanelConfigOption {
  panelsCount: number
  yearlyEnergyDcKwh: number
  roofSegmentSummaries: PanelConfigSegmentStat[]
}

/** Roof segment details */
export interface RoofSegment {
  pitchDegrees: number
  azimuthDegrees: number
  areaM2: number
  sunshineHours: number
  centerLat?: number
  centerLng?: number
  panelCount: number
}

/** Shade analysis */
export interface ShadeAnalysis {
  monthlyShadePercent: number[] // 12 months
  annualAverageShadePercent: number
  bestMonth: string
  worstMonth: string
  shadeFreeHoursPerDay: number
}

/** Hourly irradiance */
export interface HourlyIrradiance {
  hour: number
  irradianceWPerM2: number
  isPeak: boolean
}

/** Data layers (GeoTIFF etc) */
export interface DataLayerUrls {
  dsmUrl?: string
  rgbUrl?: string
  maskUrl?: string
  annualFluxUrl?: string
  monthlyFluxUrl?: string
  hourlyShadeUrls: string[]
  imageryQuality?: string
}

/** Local incentives */
export interface LocalIncentive {
  name: string
  description: string
  amountThb?: number
  percentage?: number
  provider: string
  eligibility: string
  validUntil?: string
}

/** Panel specifications for comparison */
export interface PanelSpec {
  brand: string
  model: string
  wattage: number
  efficiencyPercent: number
  pricePerWattThb: number
  warrantyYears: number
  type: string
  dimensionsMm: { width: number; height: number }
  weightKg: number
}

/** 25-year cashflow */
export interface YearlyCashflow {
  year: number
  productionKwh: number
  savingThb: number
  cumulativeSavingThb: number
  netPositionThb: number
}

/** Monthly solar production */
export interface MonthlyProduction {
  month: number
  monthName: string
  productionKwh: number
  sunshineHours: number
  efficiencyFactor: number
}

/** System size option for optimizer */
export interface SystemSizeOption {
  sizeKwp: number
  panelsCount: number
  annualProductionKwh: number
  installationCostThb: number
  monthlySavingsThb: number
  annualSavingsThb: number
  paybackYears: number
  roi25YrPercent: number
  selfConsumptionPercent: number
  isRecommended: boolean
  recommendationReason: string
}

/** Environmental impact data */
export interface EnvironmentalImpactData {
  co2OffsetTonsPerYear: number
  co2OffsetTons25yr: number
  treesEquivalent: number
  carsOffRoad: number
  homesPowered: number
  coalAvoidedKg: number
  waterSavedLiters: number
}

/** Enhanced analysis result */
export interface SolarAnalysisAdvanced {
  // Basic info
  analysisId: string
  coordinates: { latitude: number; longitude: number }
  address: string

  // Solar potential
  solarPotential: {
    maxSunshineHoursPerYear: number
    carbonOffsetFactorKgPerMwh: number
    maxPanels: number
    roofAreaM2: number
    quality: string
    imageryDate: string
  }

  // Panel config
  panelConfig: {
    panelsCount: number
    capacityKw: number
    yearlyEnergyDcKwh: number
  }

  // Financial
  financialAnalysis: {
    installationCost: number
    netCost: number
    monthlySavings: number
    yearlySavings: number
    paybackYears: number
    roi25Year: number
    npvThb: number
    irrPercent: number
  }

  electricityRate: number
  selfConsumptionRate: number
  netBillingRate: number
  annualMaintenanceCost: number

  // Advanced features — all solarPanelConfigs from API (1 panel, 2 panels, ..., max)
  panelConfigs: PanelConfigOption[]
  roofSegments: RoofSegment[]
  solarPanels: SolarPanel[]
  shadeAnalysis?: ShadeAnalysis
  hourlyIrradiance: HourlyIrradiance[]
  dataLayers?: DataLayerUrls
  incentives: LocalIncentive[]
  panelSpecs: PanelSpec[]
  yearlyCashflow: YearlyCashflow[]

  // New advanced features
  monthlyProduction: MonthlyProduction[]
  systemOptions: SystemSizeOption[]
  environmentalImpact: EnvironmentalImpactData
}

/** Advanced analysis request */
export interface SolarAnalysisAdvancedRequest {
  latitude: number
  longitude: number
  monthlyBill: number
  address?: string
  selfConsumptionRate?: number
  netBillingRate?: number
}

// ---- Weather & Forecast Types ----

/** Current weather conditions */
export interface WeatherCurrent {
  temp: number
  clouds: number
  humidity: number
  windSpeed: number
  description: string
  icon: string
}

/** Hourly weather forecast with predicted production */
export interface WeatherHourly {
  time: string
  temp: number
  clouds: number
  rain: number
  predictedKwh: number
}

/** Daily weather forecast with predicted production */
export interface WeatherDaily {
  date: string
  dayName: string
  tempMin: number
  tempMax: number
  clouds: number
  rain: number
  predictedKwh: number
  idealKwh: number
  weatherIcon: string
}

/** Dynamic yield forecast combining weather and production */
export interface DynamicYieldForecast {
  current: WeatherCurrent
  hourly: WeatherHourly[]
  daily: WeatherDaily[]
  totalPredicted7Day: number
  totalIdeal7Day: number
  weatherImpactPercent: number
}

/** Live conditions with real-time predictions */
export interface LiveConditions {
  weather: WeatherCurrent
  predictedOutputNow: number
  predicted24h: number
  tempEfficiency: number
}

// ---- Climate Reliability Types ----

/** Climate reliability score and historical data */
export interface ClimateReliabilityData {
  score: number
  badge: string
  badgeLevel: string
  monthlyRadiation: { month: string; radiation: number; year: number }[]
  riskFactors: { factor: string; severity: string; description: string }[]
  seasonalPattern: { month: number; season: string; reliability: string }[]
  dataSource: string
}

/** Climate risk assessment */
export interface ClimateRiskAssessment {
  overallRisk: string
  monsoonImpact: number
  dustSeasonImpact: number
  floodRisk: string
  recommendations: string[]
}

// ---- Air Quality Types ----

/** Current air quality data */
export interface AirQualityData {
  aqi: number
  pm25: number
  pm10: number
  category: string
  solarEfficiencyLoss: number
  cleaningRecommendation: string
  daysSinceRain: number
}

/** Air quality forecast */
export interface AirQualityForecast {
  daily: { date: string; aqi: number; pm25: number; solarLoss: number }[]
}

/** Dust season analysis */
export interface DustSeasonAnalysis {
  annualLossPercent: number
  worstMonths: string[]
  seasonStart: string
  seasonEnd: string
  region: string
}

// ---- Financing Types ----

/** Financing option comparison */
export interface FinancingOption {
  type: string
  label: string
  upfrontCost: number
  monthlyPayment: number
  totalCost25Year: number
  netSavings25Year: number
  breakEvenYears: number
  recommended: boolean
  details: string
}

/** Financing comparison result */
export interface FinancingComparison {
  options: FinancingOption[]
  bestOption: string
  systemCost: number
  annualSavings: number
}

// ---- Energy Independence Types ----

/** Energy independence score data */
export interface EnergyIndependenceData {
  score: number
  level: string
  solarSelfUsePercent: number
  gridImportPercent: number
  surplusExportPercent: number
  tips: string[]
}

// ---- Smart Alerts Types ----

/** Smart alert item */
export interface SmartAlertItem {
  id: string
  type: string
  severity: string
  title: string
  description: string
  icon: string
  timestamp: string
}
