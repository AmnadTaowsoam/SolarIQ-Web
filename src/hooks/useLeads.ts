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

export function useLeads(options: UseLeadsOptions = {}) {
  const { page = 1, pageSize = 10, filters = {} } = options

  return useQuery({
    queryKey: ['leads', page, pageSize, filters],
    queryFn: () =>
      api.get<PaginatedResponse<Lead>>(API_ENDPOINTS.LEADS.LIST, {
        page,
        pageSize,
        ...filters,
      }),
  })
}

export function useLead(id: string) {
  return useQuery({
    queryKey: ['lead', id],
    queryFn: () => api.get<Lead>(API_ENDPOINTS.LEADS.DETAIL(id)),
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
