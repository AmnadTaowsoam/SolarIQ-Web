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
