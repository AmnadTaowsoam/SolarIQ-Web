/**
 * Lead Routing hooks (WK-022)
 * Manages service area settings and lead assignments.
 */

import { useCallback, useEffect, useState } from 'react'
import apiClient from '@/lib/api'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface RoutingSettings {
  mode: 'province' | 'radius' | 'polygon'
  provinces: string[]
  radius_km: number
  radius_center_province: string
  max_leads_per_day: number
  active_from: string
  active_to: string
  paused: boolean
}

export interface LeadAssignment {
  id: string
  lead_id: string
  status: 'pending' | 'accepted' | 'declined' | 'expired'
  expires_at: string
  created_at: string
  lead: {
    district: string
    province: string
    recommended_size_kw: number
    monthly_bill_thb: number
  }
}

interface AssignmentsResponse {
  assignments: LeadAssignment[]
  total: number
}

// ---------------------------------------------------------------------------
// useRoutingSettings — GET /api/v1/lead-routing/settings
// ---------------------------------------------------------------------------

export function useRoutingSettings() {
  const [settings, setSettings] = useState<RoutingSettings | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await apiClient.get<{ data: RoutingSettings }>('/lead-routing/settings')
      setSettings(res.data.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetch()
  }, [fetch])

  return { settings, isLoading, error, refetch: fetch }
}

// ---------------------------------------------------------------------------
// useUpdateRoutingSettings — PATCH /api/v1/lead-routing/settings
// ---------------------------------------------------------------------------

export function useUpdateRoutingSettings() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const update = useCallback(async (payload: Partial<RoutingSettings>) => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await apiClient.patch<{ data: RoutingSettings }>('/lead-routing/settings', payload)
      return res.data.data
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'เกิดข้อผิดพลาด'
      setError(msg)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  return { update, isLoading, error }
}

// ---------------------------------------------------------------------------
// usePendingAssignments — GET /api/v1/lead-routing/assignments/pending
// ---------------------------------------------------------------------------

export function usePendingAssignments() {
  const [assignments, setAssignments] = useState<LeadAssignment[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await apiClient.get<AssignmentsResponse>('/lead-routing/assignments/pending')
      setAssignments(res.data.assignments)
      setTotal(res.data.total)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetch()
  }, [fetch])

  return { assignments, total, isLoading, error, refetch: fetch }
}

// ---------------------------------------------------------------------------
// useAcceptAssignment — POST /api/v1/lead-routing/assignments/{id}/accept
// ---------------------------------------------------------------------------

export function useAcceptAssignment() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const accept = useCallback(async (id: string) => {
    setIsLoading(true)
    setError(null)
    try {
      await apiClient.post(`/lead-routing/assignments/${id}/accept`)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'เกิดข้อผิดพลาด'
      setError(msg)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  return { accept, isLoading, error }
}

// ---------------------------------------------------------------------------
// useDeclineAssignment — POST /api/v1/lead-routing/assignments/{id}/decline
// ---------------------------------------------------------------------------

export function useDeclineAssignment() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const decline = useCallback(async (id: string) => {
    setIsLoading(true)
    setError(null)
    try {
      await apiClient.post(`/lead-routing/assignments/${id}/decline`)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'เกิดข้อผิดพลาด'
      setError(msg)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  return { decline, isLoading, error }
}
