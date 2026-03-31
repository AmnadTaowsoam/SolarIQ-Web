'use client'

import { useState, useEffect, useCallback } from 'react'
import { DEMO_QUOTES } from '@/hooks/useQuotes'
import {
  DealStage,
  Deal as DealType,
  DealMilestone as DealMilestoneType,
  DEAL_STAGE_ORDER,
} from '@/types/quotes'
import { apiClient } from '@/lib/api'

// ── Demo Data ─────────────────────────────────────────────────────────────────

function buildDemoMilestones(dealId: string): DealMilestoneType[] {
  return DEAL_STAGE_ORDER.map((stage, index) => ({
    id: `ms-${dealId}-${index}`,
    dealId,
    stage,
    plannedDate:
      index === 0
        ? '2026-03-21'
        : index === 1
          ? '2026-03-28'
          : index === 2
            ? '2026-03-28'
            : index === 3
              ? '2026-03-30'
              : index === 4
                ? '2026-04-01'
                : index === 5
                  ? '2026-04-05'
                  : index === 6
                    ? '2026-04-07'
                    : undefined,
    completedAt:
      index === 0
        ? '2026-03-21T10:30:00Z'
        : index === 1
          ? '2026-03-26T09:00:00Z'
          : index === 2
            ? '2026-03-28T15:00:00Z'
            : index === 3
              ? '2026-03-30T11:00:00Z'
              : index === 4
                ? '2026-04-01T14:00:00Z'
                : undefined,
    photos: index === 2 ? ['https://placehold.co/400x300?text=Survey+Photo'] : [],
    documents:
      index === 3
        ? ['https://placehold.co/400x300?text=Contract+PDF']
        : index === 4
          ? ['https://placehold.co/400x300?text=Receipt']
          : [],
    createdAt: '2026-03-21T10:00:00Z',
  }))
}

export const DEMO_DEALS: DealType[] = [
  {
    id: 'deal-demo-1',
    dealNumber: 'D-2569-001',
    quoteId: 'quote-demo-1',
    leadId: 'demo-3',
    contractorId: 'contractor-1',
    b2cUserId: 'user-b2c-1',
    stage: 'installation_started',
    totalValue: 171200,
    commissionRate: 5,
    commissionAmount: 8560,
    paymentStatus: 'partial',
    createdAt: '2026-03-21T10:00:00Z',
    updatedAt: '2026-04-01T14:00:00Z',
    milestones: buildDemoMilestones('deal-demo-1'),
    contractor: {
      id: 'contractor-1',
      companyName: 'โซลาร์พลัส จำกัด',
      rating: 4.5,
      totalReviews: 28,
      verified: true,
      responseTimeHours: 2,
      badges: ['ราคาดีที่สุด'],
      phone: '02-111-2222',
      lineId: '@solarplus',
    },
    quote: DEMO_QUOTES[0],
  },
  {
    id: 'deal-demo-2',
    dealNumber: 'D-2569-002',
    quoteId: 'quote-demo-2',
    leadId: 'demo-4',
    contractorId: 'contractor-1',
    b2cUserId: 'user-b2c-2',
    stage: 'contract_signed',
    totalValue: 185000,
    commissionRate: 5,
    commissionAmount: 9250,
    paymentStatus: 'pending',
    createdAt: '2026-03-18T09:00:00Z',
    updatedAt: '2026-03-20T11:00:00Z',
    milestones: buildDemoMilestones('deal-demo-2').map((m, i) => ({
      ...m,
      completedAt: i <= 2 ? m.completedAt : undefined,
      photos: [],
      documents: [],
    })),
    contractor: {
      id: 'contractor-1',
      companyName: 'โซลาร์พลัส จำกัด',
      rating: 4.5,
      totalReviews: 28,
      verified: true,
      responseTimeHours: 2,
      badges: [],
      phone: '02-111-2222',
    },
    quote: DEMO_QUOTES[1],
  },
]

// ── Transform helper ──────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function transformDeal(raw: any): DealType {
  return {
    ...raw,
    createdAt: raw.createdAt || raw.created_at || new Date().toISOString(),
    updatedAt: raw.updatedAt || raw.updated_at || new Date().toISOString(),
    signedAt: raw.signedAt || raw.signed_at || undefined,
    startedAt: raw.startedAt || raw.started_at || undefined,
    completedAt: raw.completedAt || raw.completed_at || undefined,
    cancelledAt: raw.cancelledAt || raw.cancelled_at || undefined,
    milestones: (raw.milestones || []).map((m: Record<string, unknown>) => ({
      ...m,
      createdAt: m.createdAt || m.created_at || new Date().toISOString(),
      completedAt: m.completedAt || m.completed_at || undefined,
      plannedDate: m.plannedDate || m.planned_date || undefined,
    })),
  }
}

// ── Hooks ─────────────────────────────────────────────────────────────────────

export function useDeals() {
  const [data, setData] = useState<DealType[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await apiClient.get('/api/v1/deals')
      const items = res.data.items || res.data
      setData(Array.isArray(items) ? items.map(transformDeal) : [])
    } catch {
      setData([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetch()
  }, [fetch])

  return { data, isLoading, error, refetch: fetch }
}

export function useDeal(dealId: string | null) {
  const [data, setData] = useState<DealType | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    if (!dealId) {
      return
    }
    setIsLoading(true)
    setError(null)
    try {
      const res = await apiClient.get(`/api/v1/deals/${dealId}`)
      setData(transformDeal(res.data))
    } catch {
      setData(null)
    } finally {
      setIsLoading(false)
    }
  }, [dealId])

  useEffect(() => {
    fetch()
  }, [fetch])

  return { data, isLoading, error, refetch: fetch }
}

export function useUpdateDealStage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const updateStage = useCallback(
    async (dealId: string, stage: DealStage, notes?: string): Promise<DealType> => {
      setIsLoading(true)
      setError(null)
      try {
        const res = await apiClient.patch(`/api/v1/deals/${dealId}/stage`, { stage, notes })
        return res.data
      } catch (err) {
        setError('Failed to update deal stage')
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  return { updateStage, isLoading, error }
}

export function useUploadMilestonePhoto() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const upload = useCallback(
    async (dealId: string, milestoneId: string, file: File): Promise<string> => {
      setIsLoading(true)
      setError(null)
      try {
        const formData = new FormData()
        formData.append('file', file)
        const res = await apiClient.post(
          `/api/v1/deals/${dealId}/milestones/${milestoneId}/photos`,
          formData,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        )
        return res.data.url
      } catch {
        return URL.createObjectURL(file)
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  return { upload, isLoading, error }
}

export function useCompleteMilestone() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const complete = useCallback(
    async (
      dealId: string,
      milestoneId: string,
      notes?: string,
      photoUrls?: string[]
    ): Promise<DealMilestoneType> => {
      setIsLoading(true)
      setError(null)
      try {
        const res = await apiClient.post(
          `/api/v1/deals/${dealId}/milestones/${milestoneId}/complete`,
          { notes, photos: photoUrls }
        )
        return res.data
      } catch (err) {
        setError('Failed to complete milestone')
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  return { complete, isLoading, error }
}
