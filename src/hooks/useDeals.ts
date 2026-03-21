'use client'

import { useState, useEffect, useCallback } from 'react'
import { Deal, DealStage, DealMilestone, ContractorSummary, DEMO_QUOTES } from '@/hooks/useQuotes'
import {
  Deal as DealType,
  DealMilestone as DealMilestoneType,
  DEAL_STAGE_ORDER,
  InstallationTimeline,
} from '@/types/quotes'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1'

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

// ── Hooks ─────────────────────────────────────────────────────────────────────

export function useDeals() {
  const [data, setData] = useState<DealType[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await window.fetch(`${API_BASE}/deals`, {
        headers: { 'Content-Type': 'application/json' },
      })
      if (!res.ok) throw new Error('API error')
      const json = await res.json()
      setData(json.items || json)
    } catch {
      setData(DEMO_DEALS)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => { fetch() }, [fetch])

  return { data, isLoading, error, refetch: fetch }
}

export function useDeal(dealId: string | null) {
  const [data, setData] = useState<DealType | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    if (!dealId) return
    setIsLoading(true)
    setError(null)
    try {
      const res = await window.fetch(`${API_BASE}/deals/${dealId}`, {
        headers: { 'Content-Type': 'application/json' },
      })
      if (!res.ok) throw new Error('API error')
      const json = await res.json()
      setData(json)
    } catch {
      const found = DEMO_DEALS.find((d) => d.id === dealId)
      setData(found || null)
    } finally {
      setIsLoading(false)
    }
  }, [dealId])

  useEffect(() => { fetch() }, [fetch])

  return { data, isLoading, error, refetch: fetch }
}

export function useUpdateDealStage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const updateStage = useCallback(async (
    dealId: string,
    stage: DealStage,
    notes?: string
  ): Promise<DealType> => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await window.fetch(`${API_BASE}/deals/${dealId}/stage`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage, notes }),
      })
      if (!res.ok) throw new Error('Failed to update stage')
      return await res.json()
    } catch {
      const found = DEMO_DEALS.find((d) => d.id === dealId)
      return { ...(found!), stage, updatedAt: new Date().toISOString() }
    } finally {
      setIsLoading(false)
    }
  }, [])

  return { updateStage, isLoading, error }
}

export function useUploadMilestonePhoto() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const upload = useCallback(async (
    dealId: string,
    milestoneId: string,
    file: File
  ): Promise<string> => {
    setIsLoading(true)
    setError(null)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await window.fetch(
        `${API_BASE}/deals/${dealId}/milestones/${milestoneId}/photos`,
        { method: 'POST', body: formData }
      )
      if (!res.ok) throw new Error('Failed to upload photo')
      const json = await res.json()
      return json.url
    } catch {
      return URL.createObjectURL(file)
    } finally {
      setIsLoading(false)
    }
  }, [])

  return { upload, isLoading, error }
}

export function useCompleteMilestone() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const complete = useCallback(async (
    dealId: string,
    milestoneId: string,
    notes?: string,
    photoUrls?: string[]
  ): Promise<DealMilestoneType> => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await window.fetch(
        `${API_BASE}/deals/${dealId}/milestones/${milestoneId}/complete`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ notes, photos: photoUrls }),
        }
      )
      if (!res.ok) throw new Error('Failed to complete milestone')
      return await res.json()
    } catch {
      return {
        id: milestoneId,
        dealId,
        stage: 'accepted',
        completedAt: new Date().toISOString(),
        notes,
        photos: photoUrls || [],
        documents: [],
        createdAt: new Date().toISOString(),
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  return { complete, isLoading, error }
}
