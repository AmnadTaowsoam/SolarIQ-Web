'use client'

import { useCallback, useEffect, useState } from 'react'
import apiClient from '@/lib/api'
import {
  Commission,
  CommissionListResponse,
  CommissionPeriodCompare,
  CommissionInvoice,
  CommissionInvoiceListResponse,
  RevenueForecast,
  RevenueSummary,
  TopContractor,
} from '@/types'

// All paths use apiClient with /api/v1 prefix

const DEMO_COMMISSIONS: Commission[] = [
  {
    id: 'com-1',
    dealId: 'deal-001',
    organizationId: 'org-1',
    dealValue: 350000,
    dealCompletedAt: '2026-02-18T10:00:00Z',
    commissionModel: 'commission',
    commissionRate: 0.03,
    rawCommission: 10500,
    commissionAmount: 10500,
    leadFee: null,
    status: 'invoiced',
    invoiceId: 'inv-1',
    dueDate: '2026-03-31T00:00:00Z',
    paidAt: null,
    originalAmount: 10500,
    adjustmentReason: null,
    adjustedBy: null,
    adjustedAt: null,
    createdAt: '2026-02-18T10:05:00Z',
    updatedAt: '2026-03-01T10:05:00Z',
  },
  {
    id: 'com-2',
    dealId: 'deal-002',
    organizationId: 'org-1',
    dealValue: 180000,
    dealCompletedAt: '2026-02-22T10:00:00Z',
    commissionModel: 'commission',
    commissionRate: 0.03,
    rawCommission: 5400,
    commissionAmount: 5400,
    leadFee: null,
    status: 'paid',
    invoiceId: 'inv-1',
    dueDate: '2026-03-31T00:00:00Z',
    paidAt: '2026-03-12T09:00:00Z',
    originalAmount: 5400,
    adjustmentReason: null,
    adjustedBy: null,
    adjustedAt: null,
    createdAt: '2026-02-22T10:05:00Z',
    updatedAt: '2026-03-12T09:00:00Z',
  },
]

const DEMO_INVOICES: CommissionInvoice[] = [
  {
    id: 'inv-1',
    invoiceNumber: 'INV-2026-03-001',
    organizationId: 'org-1',
    periodStart: '2026-02-01',
    periodEnd: '2026-02-28',
    subtotal: 15900,
    taxRate: 0.07,
    taxAmount: 1113,
    withholdingTax: 0,
    grandTotal: 17013,
    lineItems: [],
    contractorInfo: {
      name: 'Thai Sun Solar Co., Ltd.',
      address: 'Bangkok',
      tax_id: '0105560123456',
    },
    status: 'sent',
    pdfUrl: null,
    sentAt: '2026-03-01T00:00:00Z',
    viewedAt: null,
    paidAt: null,
    paymentMethod: null,
    paymentReference: null,
    createdAt: '2026-03-01T00:00:00Z',
    updatedAt: '2026-03-01T00:00:00Z',
  },
]

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapCommission(raw: Record<string, any>): Commission {
  return {
    id: raw.id,
    dealId: raw.dealId ?? raw.deal_id ?? null,
    organizationId: raw.organizationId ?? raw.organization_id,
    dealValue: Number(raw.dealValue ?? raw.deal_value ?? 0),
    dealCompletedAt: raw.dealCompletedAt ?? raw.deal_completed_at,
    commissionModel: raw.commissionModel ?? raw.commission_model ?? 'commission',
    commissionRate: raw.commissionRate ?? raw.commission_rate ?? null,
    rawCommission: raw.rawCommission ?? raw.raw_commission ?? null,
    commissionAmount: Number(raw.commissionAmount ?? raw.commission_amount ?? 0),
    leadFee: raw.leadFee ?? raw.lead_fee ?? null,
    status: raw.status,
    invoiceId: raw.invoiceId ?? raw.invoice_id ?? null,
    dueDate: raw.dueDate ?? raw.due_date ?? null,
    paidAt: raw.paidAt ?? raw.paid_at ?? null,
    originalAmount: raw.originalAmount ?? raw.original_amount ?? null,
    adjustmentReason: raw.adjustmentReason ?? raw.adjustment_reason ?? null,
    adjustedBy: raw.adjustedBy ?? raw.adjusted_by ?? null,
    adjustedAt: raw.adjustedAt ?? raw.adjusted_at ?? null,
    createdAt: raw.createdAt ?? raw.created_at,
    updatedAt: raw.updatedAt ?? raw.updated_at,
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapSummary(raw: Record<string, any>) {
  return {
    totalAmount: Number(raw.totalAmount ?? raw.total_amount ?? raw.total ?? 0),
    count: Number(raw.count ?? 0),
    avgPerDeal: Number(raw.avgPerDeal ?? raw.avg_per_deal ?? 0),
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapInvoice(raw: Record<string, any>): CommissionInvoice {
  return {
    id: raw.id,
    invoiceNumber: raw.invoiceNumber ?? raw.invoice_number,
    organizationId: raw.organizationId ?? raw.organization_id,
    periodStart: raw.periodStart ?? raw.period_start,
    periodEnd: raw.periodEnd ?? raw.period_end,
    subtotal: Number(raw.subtotal ?? 0),
    taxRate: Number(raw.taxRate ?? raw.tax_rate ?? 0),
    taxAmount: Number(raw.taxAmount ?? raw.tax_amount ?? 0),
    withholdingTax: Number(raw.withholdingTax ?? raw.withholding_tax ?? 0),
    grandTotal: Number(raw.grandTotal ?? raw.grand_total ?? 0),
    lineItems: raw.lineItems ?? raw.line_items ?? [],
    contractorInfo: raw.contractorInfo ?? raw.contractor_info ?? {},
    paymentInfo: raw.paymentInfo ?? raw.payment_info ?? undefined,
    status: raw.status,
    pdfUrl: raw.pdfUrl ?? raw.pdf_url ?? null,
    sentAt: raw.sentAt ?? raw.sent_at ?? null,
    viewedAt: raw.viewedAt ?? raw.viewed_at ?? null,
    paidAt: raw.paidAt ?? raw.paid_at ?? null,
    paymentMethod: raw.paymentMethod ?? raw.payment_method ?? null,
    paymentReference: raw.paymentReference ?? raw.payment_reference ?? null,
    createdAt: raw.createdAt ?? raw.created_at,
    updatedAt: raw.updatedAt ?? raw.updated_at,
  }
}

export function useCommissions() {
  const [data, setData] = useState<CommissionListResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchCommissions = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await apiClient.get(`/api/v1/commissions`)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const payload = response.data as Record<string, any>
      const commissions = (payload.commissions || []).map(mapCommission)
      const summary = mapSummary(payload.summary || {})
      setData({ commissions, total: payload.total ?? commissions.length, summary })
    } catch {
      setData({
        commissions: DEMO_COMMISSIONS,
        total: DEMO_COMMISSIONS.length,
        summary: {
          totalAmount: DEMO_COMMISSIONS.reduce((sum, c) => sum + c.commissionAmount, 0),
          count: DEMO_COMMISSIONS.length,
          avgPerDeal:
            DEMO_COMMISSIONS.reduce((sum, c) => sum + c.commissionAmount, 0) /
            DEMO_COMMISSIONS.length,
        },
      })
      setError('Using demo data')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCommissions()
  }, [fetchCommissions])

  return { data, isLoading, error, refetch: fetchCommissions }
}

export function useCommissionSummary() {
  const [data, setData] = useState<CommissionPeriodCompare | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const fetchSummary = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await apiClient.get(`/api/v1/commissions/summary`)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const payload = response.data as Record<string, any>
      setData({
        currentMonth: mapSummary(payload.currentMonth || payload.current_month || {}),
        previousMonth: mapSummary(payload.previousMonth || payload.previous_month || {}),
        changePercent: Number(payload.changePercent ?? payload.change_percent ?? 0),
      })
    } catch {
      setData({
        currentMonth: { totalAmount: 15900, count: 2, avgPerDeal: 7950 },
        previousMonth: { totalAmount: 9200, count: 1, avgPerDeal: 9200 },
        changePercent: 72.83,
      })
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSummary()
  }, [fetchSummary])

  return { data, isLoading }
}

export function useInvoices() {
  const [data, setData] = useState<CommissionInvoiceListResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const fetchInvoices = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await apiClient.get(`/api/v1/commissions/invoices`)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const payload = response.data as Record<string, any>
      const invoices = (payload.invoices || []).map(mapInvoice)
      setData({ invoices, total: payload.total ?? invoices.length })
    } catch {
      setData({ invoices: DEMO_INVOICES, total: DEMO_INVOICES.length })
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchInvoices()
  }, [fetchInvoices])

  return { data, isLoading, refetch: fetchInvoices }
}

export function useInvoice(invoiceId: string | null) {
  const [data, setData] = useState<CommissionInvoice | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const fetchInvoice = useCallback(async () => {
    if (!invoiceId) {
      return
    }
    setIsLoading(true)
    try {
      const response = await apiClient.get(`/api/v1/commissions/invoices/${invoiceId}`)
      setData(mapInvoice(response.data))
    } catch {
      setData(DEMO_INVOICES[0] ?? null)
    } finally {
      setIsLoading(false)
    }
  }, [invoiceId])

  useEffect(() => {
    fetchInvoice()
  }, [fetchInvoice])

  return { data, isLoading, refetch: fetchInvoice }
}

export function useAdminRevenue() {
  const [data, setData] = useState<RevenueSummary | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const fetchRevenue = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await apiClient.get(`/api/v1/admin/revenue`)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const payload = response.data as Record<string, any>
      setData({
        total: Number(payload.total ?? 0),
        breakdown: payload.breakdown || {
          subscription: 0,
          commission: 0,
          lead_fee: 0,
          addon: 0,
          other: 0,
        },
        mrr: Number(payload.mrr ?? 0),
        arpu: Number(payload.arpu ?? 0),
        ltv: Number(payload.ltv ?? 0),
        churnRate: Number(payload.churnRate ?? payload.churn_rate ?? 0),
        nrr: Number(payload.nrr ?? 0),
      })
    } catch {
      setData({
        total: 220000,
        breakdown: {
          subscription: 98000,
          commission: 102000,
          lead_fee: 12000,
          addon: 8000,
          other: 0,
        },
        mrr: 98000,
        arpu: 9800,
        ltv: 196000,
        churnRate: 0.02,
        nrr: 1.08,
      })
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchRevenue()
  }, [fetchRevenue])

  return { data, isLoading }
}

export function useRevenueForecast() {
  const [data, setData] = useState<RevenueForecast | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const fetchForecast = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await apiClient.get(`/api/v1/admin/revenue/forecast`)
      setData(response.data)
    } catch {
      setData({
        forecast: [
          { month: '2026-04', low: 190000, mid: 210000, high: 235000 },
          { month: '2026-05', low: 200000, mid: 230000, high: 260000 },
          { month: '2026-06', low: 215000, mid: 245000, high: 280000 },
        ],
        assumptions: ['Based on last 6 months trend', 'No major churn shocks assumed'],
      })
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchForecast()
  }, [fetchForecast])

  return { data, isLoading }
}

export function useTopContractors() {
  const [data, setData] = useState<TopContractor[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const fetchTop = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await apiClient.get(`/api/v1/admin/revenue/top-contractors`)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const payload = response.data as Record<string, any>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const contractors = (payload.contractors || []).map((row: Record<string, any>) => ({
        id: row.id,
        name: row.name,
        plan: row.plan,
        totalDeals: Number(row.totalDeals ?? row.total_deals ?? 0),
        totalCommission: Number(row.totalCommission ?? row.total_commission ?? 0),
        trend: row.trend ?? 'up',
      }))
      setData(contractors)
    } catch {
      setData([
        {
          id: 'org-1',
          name: 'Thai Sun Solar',
          plan: 'pro',
          totalDeals: 12,
          totalCommission: 82000,
          trend: 'up',
        },
        {
          id: 'org-2',
          name: 'Bangkok Solar Hub',
          plan: 'starter',
          totalDeals: 7,
          totalCommission: 43000,
          trend: 'up',
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTop()
  }, [fetchTop])

  return { data, isLoading }
}
