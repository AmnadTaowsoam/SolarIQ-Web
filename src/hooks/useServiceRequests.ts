'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'

export interface ServiceRequest {
  id: string
  organization_id: string
  installation_id?: string
  customer_name: string
  customer_phone?: string
  customer_email?: string
  request_type: 'repair' | 'complaint' | 'feedback' | 'inquiry'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
  subject: string
  description: string
  resolution?: string
  resolved_at?: string
  resolved_by?: string
  satisfaction_rating?: number
  satisfaction_comment?: string
  photos?: string[]
  comments?: ServiceRequestComment[]
  created_at: string
  updated_at: string
}

export interface ServiceRequestComment {
  id: string
  service_request_id: string
  author_name: string
  author_role: 'customer' | 'contractor' | 'system'
  content: string
  photos?: string[]
  created_at: string
}

export interface ServiceRequestStats {
  total: number
  open: number
  in_progress: number
  resolved: number
  closed: number
  avg_resolution_hours: number | null
}

function extractData<T>(resp: unknown): T {
  const r = resp as { data?: T }
  return r?.data !== undefined ? r.data : (resp as T)
}

export function useServiceRequests(status?: string, type?: string) {
  return useQuery({
    queryKey: ['service-requests', status, type],
    queryFn: async () => {
      const params: Record<string, string> = {}
      if (status) {
        params.status = status
      }
      if (type) {
        params.type = type
      }
      const resp = await api.get('/api/v1/service-requests', { params })
      return extractData<ServiceRequest[]>(resp)
    },
  })
}

export function useServiceRequest(id: string) {
  return useQuery({
    queryKey: ['service-request', id],
    queryFn: async () => {
      const resp = await api.get(`/api/v1/service-requests/${id}`)
      return extractData<ServiceRequest>(resp)
    },
    enabled: !!id,
  })
}

export function useCreateServiceRequest() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: Partial<ServiceRequest>) => {
      const resp = await api.post('/api/v1/service-requests', data)
      return extractData<ServiceRequest>(resp)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['service-requests'] }),
  })
}

export function useUpdateServiceRequest(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: Partial<ServiceRequest>) => {
      const resp = await api.patch(`/api/v1/service-requests/${id}`, data)
      return extractData<ServiceRequest>(resp)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['service-requests'] })
      qc.invalidateQueries({ queryKey: ['service-request', id] })
    },
  })
}

export function useAddComment(requestId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: { author_name: string; author_role: string; content: string }) => {
      const resp = await api.post(`/api/v1/service-requests/${requestId}/comments`, data)
      return extractData<ServiceRequestComment>(resp)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['service-request', requestId] }),
  })
}

export function useRateServiceRequest(requestId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: { rating: number; comment?: string }) => {
      const resp = await api.post(`/api/v1/service-requests/${requestId}/rate`, data)
      return extractData<ServiceRequest>(resp)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['service-request', requestId] }),
  })
}

export function useServiceRequestStats() {
  return useQuery({
    queryKey: ['service-request-stats'],
    queryFn: async () => {
      const resp = await api.get('/api/v1/service-requests/stats')
      return extractData<ServiceRequestStats>(resp)
    },
  })
}
