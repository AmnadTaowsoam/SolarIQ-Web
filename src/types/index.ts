// User types
export type UserRole = 'admin' | 'contractor'

export interface User {
  uid: string
  email: string | null
  displayName: string | null
  role: UserRole
  createdAt: string
  lastLoginAt: string | null
}

// Lead types
export type LeadStatus = 'new' | 'contacted' | 'quoted' | 'won' | 'lost'

export interface Lead {
  id: string
  name: string
  phone: string
  email: string | null
  address: string
  latitude: number | null
  longitude: number | null
  monthlyBill: number
  status: LeadStatus
  assignedTo: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
  solarAnalysis?: SolarAnalysisResult
}

export interface LeadFilters {
  status?: LeadStatus
  search?: string
  startDate?: string
  endDate?: string
  assignedTo?: string
}

// Solar Analysis types
export interface SolarAnalysisRequest {
  latitude: number
  longitude: number
  monthlyBill: number
  address?: string
}

export interface SolarPanelConfig {
  panelsCount: number
  capacityKw: number
  yearlyEnergyDcKwh: number
}

export interface FinancialAnalysis {
  monthlySavings: number
  yearlySavings: number
  paybackYears: number
  roi25Year: number
  installationCost: number
  netCost: number
}

export interface SolarAnalysisResult {
  coordinates: {
    latitude: number
    longitude: number
  }
  address: string
  solarPotential: {
    maxSunshineHoursPerYear: number
    carbonOffsetFactorKgPerMwh: number
  }
  panelConfig: SolarPanelConfig
  financialAnalysis: FinancialAnalysis
  electricityRate: number
}

// Dashboard types
export interface DashboardStats {
  totalLeads: number
  newLeads: number
  conversionRate: number
  revenue: number
}

export interface LeadsOverTime {
  date: string
  count: number
}

export interface TopLocation {
  location: string
  count: number
}

export interface DashboardData {
  stats: DashboardStats
  leadsOverTime: LeadsOverTime[]
  topLocations: TopLocation[]
  recentLeads: Lead[]
}

// RAG Knowledge Base types
export type DocumentStatus = 'processing' | 'ready' | 'error'

export interface KnowledgeDocument {
  id: string
  filename: string
  fileType: string
  fileSize: number
  status: DocumentStatus
  uploadedAt: string
  processedAt: string | null
  chunkCount: number | null
  errorMessage: string | null
}

// Pricing types
export interface InstallationCost {
  id: string
  costPerKwp: number
  effectiveFrom: string
  effectiveTo: string | null
  updatedAt: string
}

export interface ElectricityRate {
  id: string
  provider: 'PEA' | 'MEA'
  ratePerKwh: number
  ftRate: number
  effectiveFrom: string
  effectiveTo: string | null
  updatedAt: string
}

export interface EquipmentPricing {
  id: string
  equipmentType: 'panel' | 'inverter' | 'battery'
  brand: string
  model: string
  capacity: number
  unit: string
  price: number
  updatedAt: string
}

// API Response types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// Form types
export interface LoginFormData {
  email: string
  password: string
}

export interface LeadFormData {
  name: string
  phone: string
  email?: string
  address: string
  monthlyBill: number
  notes?: string
}

// Toast notification types
export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
  id: string
  type: ToastType
  message: string
  duration?: number
}

// Solar Advanced types
export * from './solar'

// Privacy types (WK-018)
export * from './privacy'

// Commission types (WK-027)
export * from './commission'

// Analytics types (WK-029)
export * from './analytics'

// Permit types (WK-112)
export * from './permit'
