'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Quote,
  QuoteRequest,
  QuoteComparisonData,
  QuoteFormData,
  QuoteRequestFormData,
  SystemSpecification,
  PricingBreakdown,
  InstallationTimeline,
  WarrantyTerms,
  FinancingOptions,
} from '@/types/quotes'

import { apiClient } from '@/lib/api'

function formatQuoteError(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message
  }
  return 'Quote service is unavailable right now.'
}

// ── Demo data fallback ─────────────────────────────────────────────────────────

const DEMO_SYSTEM: SystemSpecification = {
  panelBrand: 'JA Solar',
  panelModel: 'JAM72S30-545/MR',
  panelWattage: 545,
  panelCount: 10,
  panelType: 'monocrystalline',
  totalPanelKw: 5.45,
  inverterBrand: 'Huawei',
  inverterModel: 'SUN2000-5KTL-M1',
  inverterCapacityKw: 5,
  inverterType: 'string',
  inverterCount: 1,
  mountingType: 'roof_rail',
  monitoringSystem: 'included',
  estimatedMonthlyKwh: 650,
  estimatedMonthlySavingsThb: 2800,
  estimatedPaybackYears: 5.1,
}

const DEMO_PRICING: PricingBreakdown = {
  equipmentCost: 140000,
  panelCost: 85000,
  inverterCost: 35000,
  mountingCost: 12000,
  cableAndAccessories: 8000,
  installationCost: 25000,
  laborCost: 20000,
  scaffoldingCost: 5000,
  permitCost: 5000,
  discountAmount: 10000,
  discountReason: 'ส่วนลดพิเศษลูกค้าใหม่',
  subtotal: 160000,
  vatRate: 7,
  vatAmount: 11200,
  totalPrice: 171200,
  pricePerKw: 31413,
}

const DEMO_TIMELINE: InstallationTimeline = {
  siteSurveyDate: '2026-03-28',
  installationStartDate: '2026-04-05',
  installationEndDate: '2026-04-07',
  estimatedTotalDays: 3,
}

const DEMO_WARRANTY: WarrantyTerms = {
  panelPerformanceYears: 25,
  panelProductYears: 12,
  inverterYears: 10,
  installationYears: 5,
}

const DEMO_FINANCING: FinancingOptions = {
  cashDiscountPct: 3,
  installmentAvailable: true,
  installmentMonths: [12, 24, 36],
  installmentInterestRate: 0,
  installmentMonthlyAmount: { '12': 14267, '24': 7133, '36': 4756 },
  leasingAvailable: false,
  financingPartners: ['ธนาคารกสิกรไทย', 'ธนาคารไทยพาณิชย์'],
}

export const DEMO_QUOTES: Quote[] = [
  {
    id: 'quote-demo-1',
    requestId: 'req-demo-1',
    contractorId: 'contractor-1',
    version: 1,
    quoteNumber: 'Q-2569-A1B2C3',
    specifications: DEMO_SYSTEM,
    pricing: DEMO_PRICING,
    timeline: DEMO_TIMELINE,
    warranty: DEMO_WARRANTY,
    financing: DEMO_FINANCING,
    additionalServices: [
      { name: 'ระบบ Monitoring', description: 'แอปติดตามการผลิตไฟฟ้า', price: 0, included: true },
    ],
    totalPrice: 171200,
    pricePerKw: 31413,
    validUntil: '2026-04-21',
    status: 'submitted',
    attachments: [],
    createdAt: '2026-03-21T10:00:00Z',
    updatedAt: '2026-03-21T10:00:00Z',
    contractor: {
      id: 'contractor-1',
      companyName: 'โซลาร์พลัส จำกัด',
      rating: 4.5,
      totalReviews: 28,
      verified: true,
      responseTimeHours: 2,
      badges: ['ราคาดีที่สุด', 'ตอบเร็ว'],
    },
  },
  {
    id: 'quote-demo-2',
    requestId: 'req-demo-1',
    contractorId: 'contractor-2',
    version: 1,
    quoteNumber: 'Q-2569-D4E5F6',
    specifications: {
      ...DEMO_SYSTEM,
      panelBrand: 'LONGi',
      panelModel: 'LR5-72HIH-550M',
      panelWattage: 550,
      totalPanelKw: 5.5,
      inverterBrand: 'Growatt',
      inverterModel: 'MIN 5000TL-X',
    },
    pricing: {
      ...DEMO_PRICING,
      panelCost: 90000,
      inverterCost: 28000,
      discountAmount: 5000,
      subtotal: 175000,
      vatAmount: 12250,
      totalPrice: 185000,
      pricePerKw: 33636,
    },
    timeline: {
      ...DEMO_TIMELINE,
      installationEndDate: '2026-04-12',
      estimatedTotalDays: 5,
    },
    warranty: { ...DEMO_WARRANTY, inverterYears: 5, installationYears: 3 },
    financing: {
      ...DEMO_FINANCING,
      installmentMonths: [12, 24],
      installmentMonthlyAmount: { '12': 15417, '24': 7708 },
    },
    additionalServices: [],
    totalPrice: 185000,
    pricePerKw: 33636,
    validUntil: '2026-04-21',
    status: 'submitted',
    attachments: [],
    createdAt: '2026-03-21T11:00:00Z',
    updatedAt: '2026-03-21T11:00:00Z',
    contractor: {
      id: 'contractor-2',
      companyName: 'กรีนเอ็นเนอร์จี ไทย จำกัด',
      rating: 4.2,
      totalReviews: 15,
      verified: true,
      responseTimeHours: 4,
      badges: ['ติดตั้งเร็ว'],
    },
  },
  {
    id: 'quote-demo-3',
    requestId: 'req-demo-1',
    contractorId: 'contractor-3',
    version: 1,
    quoteNumber: 'Q-2569-G7H8I9',
    specifications: {
      ...DEMO_SYSTEM,
      inverterBrand: 'SMA',
      inverterModel: 'Sunny Boy 5.0',
      estimatedPaybackYears: 5.8,
    },
    pricing: {
      ...DEMO_PRICING,
      inverterCost: 45000,
      discountAmount: 0,
      subtotal: 182243,
      vatAmount: 12757,
      totalPrice: 195000,
      pricePerKw: 35770,
    },
    timeline: {
      ...DEMO_TIMELINE,
      installationEndDate: '2026-04-05',
      estimatedTotalDays: 2,
    },
    warranty: { ...DEMO_WARRANTY, inverterYears: 12, installationYears: 7 },
    financing: {
      ...DEMO_FINANCING,
      installmentMonths: [12, 24, 36, 48],
      installmentMonthlyAmount: { '12': 16250, '24': 8125, '36': 5417, '48': 4063 },
    },
    additionalServices: [],
    totalPrice: 195000,
    pricePerKw: 35770,
    validUntil: '2026-04-21',
    status: 'submitted',
    attachments: [],
    createdAt: '2026-03-21T12:00:00Z',
    updatedAt: '2026-03-21T12:00:00Z',
    contractor: {
      id: 'contractor-3',
      companyName: 'ซันเพาเวอร์ โซลูชั่น จำกัด',
      rating: 4.8,
      totalReviews: 42,
      verified: true,
      responseTimeHours: 1,
      badges: ['เรตติ้งสูงสุด', 'ติดตั้งเร็วที่สุด'],
    },
  },
]

export const DEMO_QUOTE_REQUESTS: QuoteRequest[] = [
  {
    id: 'req-demo-1',
    leadId: 'demo-3',
    b2cUserId: 'user-b2c-1',
    preferences: {
      budgetRange: '200k_400k',
      preferredTimeline: 'normal_3months',
      financingPreference: 'installment',
      maxQuotes: 5,
      contactPreference: 'line',
    },
    status: 'quotes_received',
    maxQuotes: 5,
    quotesReceived: 3,
    contractorsNotified: 8,
    createdAt: '2026-03-21T07:45:00Z',
    expiresAt: '2026-03-28T07:45:00Z',
    locationDisplay: 'ลาดพร้าว, กรุงเทพฯ',
    systemSizeKw: 5,
  },
]

// Available requests for contractors (B2B)
export const DEMO_AVAILABLE_REQUESTS: (QuoteRequest & { isNew?: boolean })[] = [
  {
    id: 'req-avail-1',
    leadId: 'lead-open-1',
    b2cUserId: 'user-b2c-2',
    preferences: {
      budgetRange: '200k_400k',
      preferredTimeline: 'normal_3months',
      financingPreference: 'installment',
      maxQuotes: 3,
      contactPreference: 'line',
    },
    status: 'open',
    maxQuotes: 3,
    quotesReceived: 1,
    contractorsNotified: 6,
    createdAt: '2026-03-21T08:00:00Z',
    expiresAt: '2026-03-28T08:00:00Z',
    locationDisplay: 'บางนา, กรุงเทพฯ',
    systemSizeKw: 5,
    isNew: true,
  },
  {
    id: 'req-avail-2',
    leadId: 'lead-open-2',
    b2cUserId: 'user-b2c-3',
    preferences: {
      budgetRange: '400k_600k',
      preferredTimeline: 'urgent_1month',
      financingPreference: 'cash',
      maxQuotes: 5,
      contactPreference: 'phone',
    },
    status: 'open',
    maxQuotes: 5,
    quotesReceived: 0,
    contractorsNotified: 8,
    createdAt: '2026-03-20T14:00:00Z',
    expiresAt: '2026-03-27T14:00:00Z',
    locationDisplay: 'พระราม 9, กรุงเทพฯ',
    systemSizeKw: 15,
    isNew: false,
  },
  {
    id: 'req-avail-3',
    leadId: 'lead-open-3',
    b2cUserId: 'user-b2c-4',
    preferences: {
      budgetRange: 'over_600k',
      preferredTimeline: 'normal_3months',
      financingPreference: 'undecided',
      maxQuotes: 5,
      contactPreference: 'email',
    },
    status: 'open',
    maxQuotes: 5,
    quotesReceived: 2,
    contractorsNotified: 10,
    createdAt: '2026-03-19T10:00:00Z',
    expiresAt: '2026-03-26T10:00:00Z',
    locationDisplay: 'บางแค, กรุงเทพฯ',
    systemSizeKw: 20,
    isNew: false,
  },
]

// ── Hooks ─────────────────────────────────────────────────────────────────────

export function useQuoteRequest(requestId: string | null) {
  const [data, setData] = useState<QuoteRequest | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    if (!requestId) {
      return
    }
    setIsLoading(true)
    setError(null)
    try {
      const res = await apiClient.get('/api/v1/quotes/requests', {
        params: { limit: 100, offset: 0 },
      })
      const items = Array.isArray(res.data?.items)
        ? res.data.items
        : Array.isArray(res.data)
          ? res.data
          : []
      const found = items.find((item: QuoteRequest) => item.id === requestId) ?? null
      setData(found)
      if (!found) {
        setError('Quote request not found.')
      }
    } catch (err) {
      setData(null)
      setError(formatQuoteError(err))
    } finally {
      setIsLoading(false)
    }
  }, [requestId])

  useEffect(() => {
    fetch()
  }, [fetch])

  return { data, isLoading, error, refetch: fetch }
}

export function useAvailableRequests() {
  const [data, setData] = useState<QuoteRequest[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await apiClient.get('/api/v1/quotes/requests/available')
      setData(res.data.items || res.data)
    } catch (err) {
      setData([])
      setError(formatQuoteError(err))
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetch()
  }, [fetch])

  return { data, isLoading, error, refetch: fetch }
}

export function useQuoteComparison(requestId: string | null) {
  const [data, setData] = useState<QuoteComparisonData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    if (!requestId) {
      return
    }
    setIsLoading(true)
    setError(null)
    try {
      const res = await apiClient.get(`/api/v1/quotes/compare/${requestId}`)
      setData(res.data)
    } catch (err) {
      setData(null)
      setError(formatQuoteError(err))
    } finally {
      setIsLoading(false)
    }
  }, [requestId])

  useEffect(() => {
    fetch()
  }, [fetch])

  return { data, isLoading, error, refetch: fetch }
}

export function useQuoteDetail(quoteId: string | null) {
  const [data, setData] = useState<Quote | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    if (!quoteId) {
      return
    }
    setIsLoading(true)
    setError(null)
    try {
      const res = await apiClient.get(`/api/v1/quotes/${quoteId}`)
      setData(res.data)
    } catch (err) {
      setData(null)
      setError(formatQuoteError(err))
    } finally {
      setIsLoading(false)
    }
  }, [quoteId])

  useEffect(() => {
    fetch()
  }, [fetch])

  return { data, isLoading, error, refetch: fetch }
}

export function useMyQuoteRequests() {
  const [data, setData] = useState<QuoteRequest[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await apiClient.get('/api/v1/quotes/requests', {
        params: { limit: 100, offset: 0 },
      })
      setData(res.data.items || res.data)
    } catch (err) {
      setData([])
      setError(formatQuoteError(err))
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetch()
  }, [fetch])

  return { data, isLoading, error, refetch: fetch }
}

export function useSubmitQuoteRequest() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = useCallback(async (data: QuoteRequestFormData): Promise<QuoteRequest> => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await apiClient.post('/api/v1/quotes/request', data)
      return res.data
    } catch (err) {
      const message = formatQuoteError(err)
      setError(message)
      throw new Error(message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  return { submit, isLoading, error }
}

export function useSubmitQuote() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = useCallback(async (data: QuoteFormData): Promise<Quote> => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await apiClient.post('/api/v1/quotes', data)
      return res.data
    } catch (err) {
      const message = formatQuoteError(err)
      setError(message)
      throw new Error(message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  return { submit, isLoading, error }
}

export function useSaveDraftQuote() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const saveDraft = useCallback(
    async (data: Partial<QuoteFormData> & { requestId: string }): Promise<Quote> => {
      setIsLoading(true)
      setError(null)
      try {
        const res = await apiClient.post('/api/v1/quotes/draft', data)
        return res.data
      } catch (err) {
        const message = formatQuoteError(err)
        setError(message)
        throw new Error(message)
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  return { saveDraft, isLoading, error }
}

export function useAcceptQuote() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const accept = useCallback(async (quoteId: string): Promise<{ dealId: string }> => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await apiClient.post(`/api/v1/quotes/${quoteId}/accept`)
      return res.data
    } catch (err) {
      const message = formatQuoteError(err)
      setError(message)
      throw new Error(message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  return { accept, isLoading, error }
}

export function useDeclineQuote() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const decline = useCallback(async (quoteId: string, reason?: string): Promise<void> => {
    setIsLoading(true)
    setError(null)
    try {
      await apiClient.post(`/api/v1/quotes/${quoteId}/decline`, { reason })
    } catch (err) {
      const message = formatQuoteError(err)
      setError(message)
      throw new Error(message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  return { decline, isLoading, error }
}

export function useRequestRevision() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const requestRevision = useCallback(
    async (quoteId: string, message: string, requestedChanges: string[]): Promise<void> => {
      setIsLoading(true)
      setError(null)
      try {
        await apiClient.post(`/api/v1/quotes/${quoteId}/request-revision`, {
          message,
          requestedChanges,
        })
      } catch (err) {
        const errMessage = formatQuoteError(err)
        setError(errMessage)
        throw new Error(errMessage)
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  return { requestRevision, isLoading, error }
}
