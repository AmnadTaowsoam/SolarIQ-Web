'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { API_ENDPOINTS } from '@/lib/constants'
import { InstallationCost, ElectricityRate, EquipmentPricing } from '@/types'

// Installation Cost
export function useInstallationCosts() {
  return useQuery({
    queryKey: ['installation-costs'],
    queryFn: async () => {
      const response = await api.get<InstallationCost[]>(API_ENDPOINTS.PRICING.INSTALLATION_COST)
      return response.data
    },
  })
}

export function useCreateInstallationCost() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Partial<InstallationCost>) =>
      api.post<InstallationCost>(API_ENDPOINTS.PRICING.INSTALLATION_COST, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['installation-costs'] })
    },
  })
}

export function useUpdateInstallationCost() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<InstallationCost> }) =>
      api.put<InstallationCost>(`${API_ENDPOINTS.PRICING.INSTALLATION_COST}/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['installation-costs'] })
    },
  })
}

export function useDeleteInstallationCost() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => api.delete(`${API_ENDPOINTS.PRICING.INSTALLATION_COST}/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['installation-costs'] })
    },
  })
}

// Electricity Rates
export function useElectricityRates() {
  return useQuery({
    queryKey: ['electricity-rates'],
    queryFn: async () => {
      const response = await api.get<ElectricityRate[]>(API_ENDPOINTS.PRICING.ELECTRICITY_RATES)
      return response.data
    },
  })
}

export function useCreateElectricityRate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Partial<ElectricityRate>) =>
      api.post<ElectricityRate>(API_ENDPOINTS.PRICING.ELECTRICITY_RATES, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['electricity-rates'] })
    },
  })
}

export function useUpdateElectricityRate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ElectricityRate> }) =>
      api.put<ElectricityRate>(`${API_ENDPOINTS.PRICING.ELECTRICITY_RATES}/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['electricity-rates'] })
    },
  })
}

export function useDeleteElectricityRate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => api.delete(`${API_ENDPOINTS.PRICING.ELECTRICITY_RATES}/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['electricity-rates'] })
    },
  })
}

// Equipment Pricing
export function useEquipmentPricing() {
  return useQuery({
    queryKey: ['equipment-pricing'],
    queryFn: () => api.get<EquipmentPricing[]>(API_ENDPOINTS.PRICING.EQUIPMENT),
  })
}

export function useCreateEquipmentPricing() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Partial<EquipmentPricing>) =>
      api.post<EquipmentPricing>(API_ENDPOINTS.PRICING.EQUIPMENT, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment-pricing'] })
    },
  })
}

export function useUpdateEquipmentPricing() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<EquipmentPricing> }) =>
      api.put<EquipmentPricing>(`${API_ENDPOINTS.PRICING.EQUIPMENT}/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment-pricing'] })
    },
  })
}

export function useDeleteEquipmentPricing() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => api.delete(`${API_ENDPOINTS.PRICING.EQUIPMENT}/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment-pricing'] })
    },
  })
}
