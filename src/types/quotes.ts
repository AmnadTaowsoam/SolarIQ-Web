/**
 * TypeScript types for Quote & Bidding System (WK-025)
 */

// ── Enums ─────────────────────────────────────────────────────────────────────

export type BudgetRange =
  | 'under_200k'
  | '200k_400k'
  | '400k_600k'
  | 'over_600k'
  | 'flexible'

export type Timeline =
  | 'urgent_1month'
  | 'normal_3months'
  | 'flexible'
  | 'just_exploring'

export type FinancingPreference = 'cash' | 'installment' | 'leasing' | 'undecided'

export type QuoteRequestStatus =
  | 'open'
  | 'quotes_received'
  | 'closed'
  | 'expired'
  | 'cancelled'

export type QuoteStatus =
  | 'draft'
  | 'submitted'
  | 'viewed'
  | 'revision_requested'
  | 'revised'
  | 'accepted'
  | 'declined'
  | 'expired'
  | 'withdrawn'

export type DealStage =
  | 'accepted'
  | 'survey_scheduled'
  | 'survey_completed'
  | 'contract_signed'
  | 'payment_received'
  | 'installation_started'
  | 'installation_completed'
  | 'inspection_passed'
  | 'grid_connected'
  | 'completed'
  | 'cancelled'

export type PanelType = 'monocrystalline' | 'polycrystalline' | 'bifacial'
export type InverterType = 'string' | 'micro' | 'hybrid'
export type MountingType = 'roof_rail' | 'ballast' | 'ground' | 'carport'
export type MonitoringStatus = 'included' | 'optional' | 'none'

// ── Quote Request ──────────────────────────────────────────────────────────────

export interface QuoteRequestPreferences {
  budgetRange: BudgetRange
  preferredTimeline: Timeline
  financingPreference: FinancingPreference
  preferredPanelBrand?: string
  preferredSystemSizeKw?: number
  additionalRequirements?: string
  maxQuotes: number
  contactPreference: 'line' | 'phone' | 'email'
}

export interface QuoteRequest {
  id: string
  leadId: string
  b2cUserId: string
  preferences: QuoteRequestPreferences
  status: QuoteRequestStatus
  maxQuotes: number
  quotesReceived: number
  contractorsNotified: number
  createdAt: string
  expiresAt: string
  closedAt?: string
  // B2C display helpers
  locationDisplay?: string
  systemSizeKw?: number
}

// ── System Specification ──────────────────────────────────────────────────────

export interface SystemSpecification {
  // Panels
  panelBrand: string
  panelModel: string
  panelWattage: number
  panelCount: number
  panelType: PanelType
  totalPanelKw: number

  // Inverter
  inverterBrand: string
  inverterModel: string
  inverterCapacityKw: number
  inverterType: InverterType
  inverterCount: number

  // Battery (optional)
  batteryBrand?: string
  batteryModel?: string
  batteryCapacityKwh?: number

  // Mounting
  mountingType: MountingType
  mountingBrand?: string

  // Monitoring
  monitoringSystem: MonitoringStatus
  monitoringBrand?: string

  // Expected Performance
  estimatedMonthlyKwh: number
  estimatedMonthlySavingsThb: number
  estimatedPaybackYears: number
}

// ── Pricing Breakdown ─────────────────────────────────────────────────────────

export interface PricingBreakdown {
  // Equipment
  equipmentCost: number
  panelCost: number
  inverterCost: number
  batteryCost?: number
  mountingCost: number
  cableAndAccessories: number

  // Installation
  installationCost: number
  laborCost: number
  scaffoldingCost?: number

  // Other
  permitCost: number
  engineeringCost?: number

  // Discount
  discountAmount: number
  discountReason?: string

  // Totals
  subtotal: number
  vatRate: number
  vatAmount: number
  totalPrice: number
  pricePerKw: number
}

// ── Installation Timeline ─────────────────────────────────────────────────────

export interface InstallationTimeline {
  siteSurveyDate?: string
  designCompletionDate?: string
  permitSubmissionDate?: string
  installationStartDate: string
  installationEndDate: string
  gridConnectionDate?: string
  estimatedTotalDays: number
}

// ── Warranty Terms ────────────────────────────────────────────────────────────

export interface WarrantyTerms {
  panelPerformanceYears: number
  panelProductYears: number
  inverterYears: number
  installationYears: number
  roofLeakYears?: number
  batteryYears?: number
  additionalTerms?: string
}

// ── Financing Options ─────────────────────────────────────────────────────────

export interface FinancingOptions {
  cashDiscountPct?: number
  installmentAvailable: boolean
  installmentMonths?: number[]
  installmentInterestRate?: number
  installmentMonthlyAmount?: Record<string, number>
  leasingAvailable: boolean
  leasingMonthly?: number
  leasingTermYears?: number
  financingPartners: string[]
}

// ── Additional Service ────────────────────────────────────────────────────────

export interface AdditionalService {
  name: string
  description: string
  price: number
  included: boolean
}

// ── Quote ─────────────────────────────────────────────────────────────────────

export interface Quote {
  id: string
  requestId: string
  contractorId: string
  version: number
  quoteNumber: string
  specifications: SystemSpecification
  pricing: PricingBreakdown
  timeline: InstallationTimeline
  warranty: WarrantyTerms
  financing?: FinancingOptions
  additionalServices: AdditionalService[]
  totalPrice: number
  pricePerKw: number
  notes?: string
  pdfUrl?: string
  attachments: string[]
  validUntil: string
  status: QuoteStatus
  revisionMessage?: string
  revisionRequestedAt?: string
  declineReason?: string
  submittedAt?: string
  viewedAt?: string
  acceptedAt?: string
  declinedAt?: string
  createdAt: string
  updatedAt: string
  // Populated from join
  contractor?: ContractorSummary
}

// ── Contractor Summary (for quotes) ──────────────────────────────────────────

export interface ContractorSummary {
  id: string
  companyName: string
  logoUrl?: string
  rating: number
  totalReviews: number
  verified: boolean
  responseTimeHours?: number
  badges: string[]
  phone?: string
  lineId?: string
}

// ── Quote Comparison ──────────────────────────────────────────────────────────

export interface QuoteComparisonItem {
  quoteId: string
  contractor: ContractorSummary
  system: {
    panelBrand: string
    panelWattage: number
    panelCount: number
    totalKw: number
    inverterBrand: string
    hasBattery: boolean
  }
  pricing: {
    totalPrice: number
    pricePerKw: number
    discountPct: number
    hasFinancing: boolean
    monthlyInstallment?: number
  }
  timeline: {
    installationStart: string
    installationEnd: string
    totalDays: number
  }
  warranty: {
    panelYears: number
    inverterYears: number
    installationYears: number
  }
  savings: {
    monthlyKwh: number
    monthlySavingsThb: number
    paybackYears: number
  }
}

export interface QuoteComparisonData {
  requestId: string
  quotes: QuoteComparisonItem[]
  analysis: {
    cheapest: string
    bestValue: string
    fastest: string
    highestRated: string
  } | null
}

// ── Quote Template ────────────────────────────────────────────────────────────

export interface QuoteTemplate {
  id: string
  contractorId: string
  name: string
  description?: string
  specifications: Partial<SystemSpecification>
  pricing: Partial<PricingBreakdown>
  warranty: Partial<WarrantyTerms>
  financing?: Partial<FinancingOptions>
  additionalServices: AdditionalService[]
  notes?: string
  isDefault: boolean
  createdAt: string
  updatedAt: string
}

// ── Deal ──────────────────────────────────────────────────────────────────────

export interface DealMilestone {
  id: string
  dealId: string
  stage: DealStage
  plannedDate?: string
  completedAt?: string
  completedBy?: string
  notes?: string
  photos: string[]
  documents: string[]
  createdAt: string
}

export interface Deal {
  id: string
  dealNumber: string
  quoteId: string
  leadId: string
  contractorId: string
  b2cUserId: string
  stage: DealStage
  totalValue: number
  commissionRate: number
  commissionAmount: number
  contractUrl?: string
  paymentStatus: 'pending' | 'partial' | 'paid'
  notes?: string
  signedAt?: string
  startedAt?: string
  completedAt?: string
  cancelledAt?: string
  cancellationReason?: string
  createdAt: string
  updatedAt: string
  // Populated from join
  milestones: DealMilestone[]
  contractor?: ContractorSummary
  quote?: Quote
}

// ── Form Data ─────────────────────────────────────────────────────────────────

export interface QuoteRequestFormData {
  leadId: string
  budgetRange: BudgetRange
  preferredTimeline: Timeline
  financingPreference: FinancingPreference
  preferredPanelBrand?: string
  preferredSystemSizeKw?: number
  additionalRequirements?: string
  maxQuotes: number
  contactPreference: 'line' | 'phone' | 'email'
}

export interface QuoteFormData {
  requestId: string
  specifications: SystemSpecification
  pricing: PricingBreakdown
  timeline: InstallationTimeline
  warranty: WarrantyTerms
  financing?: FinancingOptions
  additionalServices: AdditionalService[]
  notes?: string
  validDays: number
  attachments: string[]
}

// ── Labels / Display helpers ──────────────────────────────────────────────────

export const BUDGET_RANGE_LABELS: Record<BudgetRange, string> = {
  under_200k: 'ต่ำกว่า 200,000 บาท',
  '200k_400k': '200,000 - 400,000 บาท',
  '400k_600k': '400,000 - 600,000 บาท',
  over_600k: 'มากกว่า 600,000 บาท',
  flexible: 'ยืดหยุ่น',
}

export const TIMELINE_LABELS: Record<Timeline, string> = {
  urgent_1month: 'เร่งด่วน (ภายใน 1 เดือน)',
  normal_3months: 'ปกติ (ภายใน 3 เดือน)',
  flexible: 'ยืดหยุ่น',
  just_exploring: 'แค่สำรวจราคา',
}

export const FINANCING_LABELS: Record<FinancingPreference, string> = {
  cash: 'เงินสด',
  installment: 'ผ่อนชำระ',
  leasing: 'ลีสซิ่ง',
  undecided: 'ยังไม่ตัดสินใจ',
}

export const QUOTE_STATUS_LABELS: Record<QuoteStatus, string> = {
  draft: 'ฉบับร่าง',
  submitted: 'ส่งแล้ว',
  viewed: 'เปิดดูแล้ว',
  revision_requested: 'ขอแก้ไข',
  revised: 'แก้ไขแล้ว',
  accepted: 'ยอมรับแล้ว',
  declined: 'ปฏิเสธแล้ว',
  expired: 'หมดอายุ',
  withdrawn: 'ถอนออกแล้ว',
}

export const QUOTE_STATUS_COLORS: Record<QuoteStatus, string> = {
  draft: 'bg-gray-100 text-gray-700',
  submitted: 'bg-blue-100 text-blue-800',
  viewed: 'bg-purple-100 text-purple-800',
  revision_requested: 'bg-yellow-100 text-yellow-800',
  revised: 'bg-indigo-100 text-indigo-800',
  accepted: 'bg-green-100 text-green-800',
  declined: 'bg-red-100 text-red-800',
  expired: 'bg-gray-100 text-gray-600',
  withdrawn: 'bg-gray-100 text-gray-600',
}

export const DEAL_STAGE_LABELS: Record<DealStage, string> = {
  accepted: 'ยอมรับใบเสนอราคา',
  survey_scheduled: 'นัดสำรวจหน้างาน',
  survey_completed: 'สำรวจเสร็จแล้ว',
  contract_signed: 'เซ็นสัญญาแล้ว',
  payment_received: 'รับชำระเงินงวดแรก',
  installation_started: 'เริ่มติดตั้งแล้ว',
  installation_completed: 'ติดตั้งเสร็จแล้ว',
  inspection_passed: 'ตรวจรับงานผ่าน',
  grid_connected: 'เชื่อมต่อการไฟฟ้าแล้ว',
  completed: 'เสร็จสมบูรณ์',
  cancelled: 'ยกเลิกแล้ว',
}

export const DEAL_STAGE_COLORS: Record<DealStage, string> = {
  accepted: 'bg-blue-100 text-blue-800',
  survey_scheduled: 'bg-indigo-100 text-indigo-800',
  survey_completed: 'bg-purple-100 text-purple-800',
  contract_signed: 'bg-yellow-100 text-yellow-800',
  payment_received: 'bg-orange-100 text-orange-800',
  installation_started: 'bg-orange-200 text-orange-900',
  installation_completed: 'bg-teal-100 text-teal-800',
  inspection_passed: 'bg-green-100 text-green-800',
  grid_connected: 'bg-emerald-100 text-emerald-800',
  completed: 'bg-green-200 text-green-900',
  cancelled: 'bg-red-100 text-red-800',
}

export const DEAL_STAGE_ORDER: DealStage[] = [
  'accepted',
  'survey_scheduled',
  'survey_completed',
  'contract_signed',
  'payment_received',
  'installation_started',
  'installation_completed',
  'inspection_passed',
  'grid_connected',
  'completed',
]
