'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Quote,
  QuoteRequest,
  QuoteComparisonData,
  QuoteFormData,
  QuoteRequestFormData,
  QuoteStatus,
  SystemSpecification,
  PricingBreakdown,
  InstallationTimeline,
  WarrantyTerms,
  FinancingOptions,
  ContractorSummary,
} from '@/types/quotes'

import { apiClient } from '@/lib/api'

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
      const res = await apiClient.get(`/api/v1/quotes/requests/${requestId}`)
      setData(res.data)
    } catch {
      const found = DEMO_QUOTE_REQUESTS.find((r) => r.id === requestId)
      setData(found || null)
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
    } catch {
      setData(DEMO_AVAILABLE_REQUESTS)
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
      const res = await apiClient.get(`/api/v1/quotes/requests/${requestId}/compare`)
      setData(res.data)
    } catch {
      if (requestId === 'req-demo-1') {
        const items = DEMO_QUOTES.map((q) => ({
          quoteId: q.id,
          contractor: q.contractor as ContractorSummary,
          system: {
            panelBrand: q.specifications.panelBrand,
            panelWattage: q.specifications.panelWattage,
            panelCount: q.specifications.panelCount,
            totalKw: q.specifications.totalPanelKw,
            inverterBrand: q.specifications.inverterBrand,
            hasBattery: !!q.specifications.batteryBrand,
          },
          pricing: {
            totalPrice: q.pricing.totalPrice,
            pricePerKw: q.pricing.pricePerKw,
            discountPct:
              q.pricing.discountAmount > 0
                ? (q.pricing.discountAmount / (q.pricing.subtotal + q.pricing.discountAmount)) * 100
                : 0,
            hasFinancing: q.financing?.installmentAvailable || false,
            monthlyInstallment: q.financing?.installmentMonthlyAmount?.['36'],
          },
          timeline: {
            installationStart: q.timeline.installationStartDate,
            installationEnd: q.timeline.installationEndDate,
            totalDays: q.timeline.estimatedTotalDays,
          },
          warranty: {
            panelYears: q.warranty.panelPerformanceYears,
            inverterYears: q.warranty.inverterYears,
            installationYears: q.warranty.installationYears,
          },
          savings: {
            monthlyKwh: q.specifications.estimatedMonthlyKwh,
            monthlySavingsThb: q.specifications.estimatedMonthlySavingsThb,
            paybackYears: q.specifications.estimatedPaybackYears,
          },
        }))
        setData({
          requestId,
          quotes: items,
          analysis: {
            cheapest: 'quote-demo-1',
            bestValue: 'quote-demo-1',
            fastest: 'quote-demo-3',
            highestRated: 'quote-demo-3',
          },
        })
      } else {
        setData({ requestId, quotes: [], analysis: null })
      }
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
    } catch {
      const found = DEMO_QUOTES.find((q) => q.id === quoteId)
      setData(found || null)
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
      const res = await apiClient.get('/api/v1/quotes/requests/my')
      setData(res.data.items || res.data)
    } catch {
      setData(DEMO_QUOTE_REQUESTS)
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
      const res = await apiClient.post('/api/v1/quotes/requests', data)
      return res.data
    } catch {
      // Demo fallback
      const newRequest: QuoteRequest = {
        id: `req-${Date.now()}`,
        leadId: data.leadId,
        b2cUserId: 'current-user',
        preferences: {
          budgetRange: data.budgetRange,
          preferredTimeline: data.preferredTimeline,
          financingPreference: data.financingPreference,
          preferredPanelBrand: data.preferredPanelBrand,
          preferredSystemSizeKw: data.preferredSystemSizeKw,
          additionalRequirements: data.additionalRequirements,
          maxQuotes: data.maxQuotes,
          contactPreference: data.contactPreference,
        },
        status: 'open',
        maxQuotes: data.maxQuotes,
        quotesReceived: 0,
        contractorsNotified: 0,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      }
      return newRequest
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
    } catch {
      const mock: Quote = {
        id: `quote-${Date.now()}`,
        requestId: data.requestId,
        contractorId: 'current-contractor',
        version: 1,
        quoteNumber: `Q-2569-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        specifications: data.specifications,
        pricing: data.pricing,
        timeline: data.timeline,
        warranty: data.warranty,
        financing: data.financing,
        additionalServices: data.additionalServices,
        totalPrice: data.pricing.totalPrice,
        pricePerKw: data.pricing.pricePerKw,
        notes: data.notes,
        attachments: data.attachments,
        validUntil: new Date(Date.now() + data.validDays * 24 * 60 * 60 * 1000).toISOString(),
        status: 'submitted' as QuoteStatus,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      return mock
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
      } catch {
        const mock: Quote = {
          id: `draft-${Date.now()}`,
          requestId: data.requestId,
          contractorId: 'current-contractor',
          version: 1,
          quoteNumber: '',
          specifications:
            (data.specifications as SystemSpecification) || ({} as SystemSpecification),
          pricing: (data.pricing as PricingBreakdown) || ({} as PricingBreakdown),
          timeline: (data.timeline as InstallationTimeline) || ({} as InstallationTimeline),
          warranty: (data.warranty as WarrantyTerms) || ({} as WarrantyTerms),
          additionalServices: [],
          totalPrice: data.pricing?.totalPrice || 0,
          pricePerKw: data.pricing?.pricePerKw || 0,
          attachments: [],
          validUntil: '',
          status: 'draft' as QuoteStatus,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        return mock
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
    } catch {
      return { dealId: `deal-${Date.now()}` }
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
    } catch {
      // Demo: just resolve
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
        await apiClient.post(`/api/v1/quotes/${quoteId}/revision`, { message, requestedChanges })
      } catch {
        // Demo: just resolve
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  return { requestRevision, isLoading, error }
}
