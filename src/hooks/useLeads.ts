'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { API_ENDPOINTS } from '@/lib/constants'
import { Lead, LeadFilters, PaginatedResponse, LeadStatus } from '@/types'

interface UseLeadsOptions {
  page?: number
  pageSize?: number
  filters?: LeadFilters
}

/**
 * Transform a backend lead (snake_case) into the frontend Lead interface (camelCase).
 * The backend LeadOut schema uses snake_case fields; the frontend expects camelCase.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function transformLead(raw: any): Lead {
  return {
    id: raw.id,
    name: raw.name || raw.address || '',
    phone: raw.phone || '',
    email: raw.email || null,
    address: raw.address || '',
    latitude: raw.latitude ?? null,
    longitude: raw.longitude ?? null,
    monthlyBill: raw.monthlyBill ?? raw.monthly_bill_thb ?? 0,
    status: raw.status || 'new',
    assignedTo: raw.assignedTo ?? raw.assigned_contractor_id ?? null,
    notes: raw.notes ?? null,
    createdAt: raw.createdAt || raw.created_at || new Date().toISOString(),
    updatedAt: raw.updatedAt || raw.updated_at || new Date().toISOString(),
    solarAnalysis: raw.solarAnalysis ?? undefined,
  }
}

export function useLeads(options: UseLeadsOptions = {}) {
  const { page = 1, pageSize = 10, filters = {} } = options

  return useQuery({
    queryKey: ['leads', page, pageSize, filters],
    queryFn: async () => {
      const response = await api.get<PaginatedResponse<Lead>>(API_ENDPOINTS.LEADS.LIST, {
        params: { page, pageSize, ...filters },
      })
      const data = response?.data ?? response
      return {
        ...data,
        items: (data.items || []).map(transformLead),
        totalPages: Math.ceil((data.total || 0) / pageSize),
      }
    },
  })
}

export function useLead(id: string) {
  return useQuery({
    queryKey: ['lead', id],
    queryFn: async () => {
      const raw = await api.get<Lead>(API_ENDPOINTS.LEADS.DETAIL(id))
      return transformLead(raw)
    },
    enabled: !!id,
  })
}

export function useUpdateLeadStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: LeadStatus }) =>
      api.patch(API_ENDPOINTS.LEADS.UPDATE_STATUS(id), { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] })
    },
  })
}

export function useAssignLead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, contractorId }: { id: string; contractorId: string }) =>
      api.patch(API_ENDPOINTS.LEADS.ASSIGN(id), { contractorId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] })
    },
  })
}

export function useCreateLead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Partial<Lead>) => api.post<Lead>(API_ENDPOINTS.LEADS.LIST, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] })
    },
  })
}

export function useUpdateLead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Lead> }) =>
      api.put<Lead>(API_ENDPOINTS.LEADS.DETAIL(id), data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['leads'] })
      queryClient.invalidateQueries({ queryKey: ['lead', variables.id] })
    },
  })
}

export function useDeleteLead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => api.delete(API_ENDPOINTS.LEADS.DETAIL(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] })
    },
  })
}
