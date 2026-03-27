import { useState, useEffect, useCallback } from 'react'

export interface Proposal {
  id: string
  lead_id: string
  contractor_id: string
  system_size_kw: number
  estimated_cost: number
  annual_production_kwh: number
  annual_savings: number
  payback_years: number
  roi_percent: number
  valid_until: string | null
  status: 'pending' | 'accepted' | 'declined' | 'expired'
  notes: string | null
  response_notes: string | null
  responded_at: string | null
  created_at: string
  updated_at: string
  // PDF fields
  pdf_url: string | null
  pdf_expires_at: string | null
  file_size_bytes: number | null
  generation_time_seconds: number | null
  // Tracking fields
  view_count: number
  last_viewed_at: string | null
  total_view_duration_seconds: number
  // Send tracking
  sent_via_line: boolean
  sent_via_email: boolean
  sent_at: string | null
  // Content fields
  ai_summary: string | null
  custom_notes: string | null
  template_id: string | null
}

export interface ProposalList {
  proposals: Proposal[]
  total_count: number
  page: number
  page_size: number
}

export interface ProposalAnalytics {
  total_proposals: number
  accepted: number
  declined: number
  pending: number
  expired: number
  sent_via_line: number
  sent_via_email: number
  total_views: number
  avg_view_duration_seconds: number
  acceptance_rate_percent: number
}

export interface GenerateProposalRequest {
  lead_id: string
  ai_summary: string
  custom_notes?: string
  valid_until_days?: number
}

export interface SendProposalRequest {
  channel: 'line' | 'email'
  recipient?: string
  message?: string
}

export interface UpdateStatusRequest {
  status: 'accepted' | 'declined' | 'expired'
  response_notes?: string
}

export interface UseProposalsReturn {
  proposals: Proposal[]
  isLoading: boolean
  error: string | null
  total_count: number
  page: number
  page_size: number

  // Actions
  generateProposal: (request: GenerateProposalRequest) => Promise<Proposal>
  listProposals: (filters?: {
    lead_id?: string
    status?: string
    limit?: number
    offset?: number
  }) => Promise<void>
  getProposal: (proposalId: string) => Promise<Proposal | null>
  regenerateProposal: (proposalId: string, request: GenerateProposalRequest) => Promise<Proposal>
  sendProposal: (proposalId: string, request: SendProposalRequest) => Promise<void>
  updateProposalStatus: (proposalId: string, request: UpdateStatusRequest) => Promise<void>
  trackProposalView: (proposalId: string, durationSeconds?: number) => Promise<void>
  getAnalytics: (startDate?: string, endDate?: string) => Promise<ProposalAnalytics>
  refreshProposals: () => Promise<void>
}

export function useProposals(): UseProposalsReturn {
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [total_count, setTotalCount] = useState(0)
  const [page, setPage] = useState(1)
  const [page_size, setPageSize] = useState(50)

  const fetchProposals = useCallback(
    async (filters?: { lead_id?: string; status?: string; limit?: number; offset?: number }) => {
      try {
        setIsLoading(true)
        setError(null)

        const params = new URLSearchParams()
        if (filters?.lead_id) {
          params.append('lead_id', filters.lead_id)
        }
        if (filters?.status) {
          params.append('status', filters.status)
        }
        params.append('limit', String(filters?.limit || 50))
        params.append('offset', String(filters?.offset || 0))

        const response = await fetch(`/api/v1/proposals?${params.toString()}`, {
          headers: {
            'Content-Type': 'application/json',
          },
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.detail || 'Failed to fetch proposals')
        }

        const data = await response.json()
        if (data.success) {
          setProposals(data.data.proposals || [])
          setTotalCount(data.data.total_count || 0)
          setPage(data.data.page || 1)
          setPageSize(data.data.page_size || 50)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch proposals')
        setProposals([])
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  const generateProposal = useCallback(
    async (request: GenerateProposalRequest): Promise<Proposal> => {
      try {
        setError(null)

        const response = await fetch('/api/v1/proposals/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(request),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.detail || 'Failed to generate proposal')
        }

        const data = await response.json()
        if (data.success) {
          // Refresh the list
          await fetchProposals()
          return data.data as Proposal
        }

        throw new Error('Failed to generate proposal')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to generate proposal')
        throw err
      }
    },
    [fetchProposals]
  )

  const getProposal = useCallback(async (proposalId: string): Promise<Proposal | null> => {
    try {
      setError(null)

      const response = await fetch(`/api/v1/proposals/${proposalId}`)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Failed to fetch proposal')
      }

      const data = await response.json()
      if (data.success) {
        return data.data as Proposal
      }

      return null
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch proposal')
      return null
    }
  }, [])

  const regenerateProposal = useCallback(
    async (proposalId: string, request: GenerateProposalRequest): Promise<Proposal> => {
      try {
        setError(null)

        const response = await fetch(`/api/v1/proposals/${proposalId}/regenerate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(request),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.detail || 'Failed to regenerate proposal')
        }

        const data = await response.json()
        if (data.success) {
          // Refresh the list
          await fetchProposals()
          return data.data as Proposal
        }

        throw new Error('Failed to regenerate proposal')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to regenerate proposal')
        throw err
      }
    },
    [fetchProposals]
  )

  const sendProposal = useCallback(
    async (proposalId: string, request: SendProposalRequest): Promise<void> => {
      try {
        setError(null)

        const response = await fetch(`/api/v1/proposals/${proposalId}/send`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(request),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.detail || 'Failed to send proposal')
        }

        const data = await response.json()
        if (data.success) {
          // Refresh the list
          await fetchProposals()
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to send proposal')
        throw err
      }
    },
    [fetchProposals]
  )

  const updateProposalStatus = useCallback(
    async (proposalId: string, request: UpdateStatusRequest): Promise<void> => {
      try {
        setError(null)

        const response = await fetch(`/api/v1/proposals/${proposalId}/status`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(request),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.detail || 'Failed to update proposal status')
        }

        const data = await response.json()
        if (data.success) {
          // Refresh the list
          await fetchProposals()
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update proposal status')
        throw err
      }
    },
    [fetchProposals]
  )

  const trackProposalView = useCallback(
    async (proposalId: string, durationSeconds: number = 0): Promise<void> => {
      try {
        setError(null)

        const response = await fetch(`/api/v1/proposals/${proposalId}/track`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            view_duration_seconds: durationSeconds,
          }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.detail || 'Failed to track proposal view')
        }

        const data = await response.json()
        if (data.success) {
          // Refresh the list
          await fetchProposals()
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to track proposal view')
        throw err
      }
    },
    [fetchProposals]
  )

  const getAnalytics = useCallback(
    async (startDate?: string, endDate?: string): Promise<ProposalAnalytics> => {
      try {
        setError(null)

        const params = new URLSearchParams()
        if (startDate) {
          params.append('start_date', startDate)
        }
        if (endDate) {
          params.append('end_date', endDate)
        }

        const response = await fetch(`/api/v1/proposals/analytics/summary?${params.toString()}`)

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.detail || 'Failed to fetch proposal analytics')
        }

        const data = await response.json()
        if (data.success) {
          return data.data as ProposalAnalytics
        }

        throw new Error('Failed to fetch proposal analytics')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch proposal analytics')
        throw err
      }
    },
    []
  )

  const refreshProposals = useCallback(async () => {
    await fetchProposals()
  }, [fetchProposals])

  // Initial fetch
  useEffect(() => {
    fetchProposals()
  }, [fetchProposals])

  return {
    proposals,
    isLoading,
    error,
    total_count,
    page,
    page_size,
    generateProposal,
    listProposals: fetchProposals,
    getProposal,
    regenerateProposal,
    sendProposal,
    updateProposalStatus,
    trackProposalView,
    getAnalytics,
    refreshProposals,
  }
}
