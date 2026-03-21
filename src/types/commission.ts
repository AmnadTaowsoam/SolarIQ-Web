export type CommissionStatus = 'pending' | 'invoiced' | 'paid' | 'disputed' | 'voided' | 'adjusted'
export type CommissionModel = 'commission' | 'lead_fee'
export type CommissionInvoiceStatus = 'draft' | 'sent' | 'viewed' | 'paid' | 'overdue' | 'disputed' | 'voided'

export interface Commission {
  id: string
  dealId: string | null
  organizationId: string
  dealValue: number
  dealCompletedAt: string
  commissionModel: CommissionModel
  commissionRate: number | null
  rawCommission: number | null
  commissionAmount: number
  leadFee: number | null
  status: CommissionStatus
  invoiceId: string | null
  dueDate: string | null
  paidAt: string | null
  originalAmount: number | null
  adjustmentReason: string | null
  adjustedBy: string | null
  adjustedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface CommissionSummary {
  totalAmount: number
  count: number
  avgPerDeal: number
}

export interface CommissionListResponse {
  commissions: Commission[]
  total: number
  summary: CommissionSummary
}

export interface CommissionPeriodCompare {
  currentMonth: CommissionSummary
  previousMonth: CommissionSummary
  changePercent: number
}

export interface CommissionDispute {
  id: string
  commissionId: string
  organizationId: string
  reason: string
  description: string
  evidenceUrls?: string[]
  status: string
  resolutionNote?: string
  resolvedBy?: string
  resolvedAt?: string
  adjustedAmount?: number
  slaDeadline: string
  escalated: boolean
  escalatedAt?: string
  createdAt: string
  updatedAt: string
}

export interface CommissionInvoice {
  id: string
  invoiceNumber: string
  organizationId: string
  periodStart: string
  periodEnd: string
  subtotal: number
  taxRate: number
  taxAmount: number
  withholdingTax: number
  grandTotal: number
  lineItems: Array<Record<string, string>>
  contractorInfo: Record<string, string | null>
  paymentInfo?: Record<string, string>
  status: CommissionInvoiceStatus
  pdfUrl?: string | null
  sentAt?: string | null
  viewedAt?: string | null
  paidAt?: string | null
  paymentMethod?: string | null
  paymentReference?: string | null
  createdAt: string
  updatedAt: string
}

export interface CommissionInvoiceListResponse {
  invoices: CommissionInvoice[]
  total: number
}

export interface RevenueSummary {
  total: number
  breakdown: {
    subscription: number
    commission: number
    lead_fee: number
    addon: number
    other: number
  }
  mrr: number
  arpu: number
  ltv: number
  churnRate: number
  nrr: number
}

export interface RevenueForecastPoint {
  month: string
  low: number
  mid: number
  high: number
}

export interface RevenueForecast {
  forecast: RevenueForecastPoint[]
  assumptions: string[]
}

export interface TopContractor {
  id: string
  name: string
  plan: string
  totalDeals: number
  totalCommission: number
  trend: string
}
