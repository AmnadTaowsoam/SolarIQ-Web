'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'

// ── Types ────────────────────────────────────────────────────────────

export interface Installation {
  id: string
  organization_id: string
  deal_id?: string
  customer_name: string
  customer_phone?: string
  customer_email?: string
  address?: string
  latitude?: number
  longitude?: number
  system_size_kw: number
  panel_brand?: string
  panel_model?: string
  panel_count?: number
  inverter_brand?: string
  inverter_model?: string
  installation_date?: string
  grid_connection_date?: string
  warranty_panel_expiry?: string
  warranty_inverter_expiry?: string
  warranty_installation_expiry?: string
  warranty_status?: {
    panel: { status: string; days_remaining: number | null }
    inverter: { status: string; days_remaining: number | null }
    installation: { status: string; days_remaining: number | null }
  }
  status: string
  notes?: string
  created_at: string
}

export interface MaintenanceSchedule {
  id: string
  installation_id: string
  maintenance_type: string
  frequency_months: number
  next_due_date?: string
  last_completed_date?: string
  is_active: boolean
  notes?: string
}

export interface ServiceRecord {
  id: string
  installation_id: string
  schedule_id?: string
  service_date: string
  service_type: string
  description?: string
  findings?: string
  actions_taken?: string
  cost_thb?: number
  technician_name?: string
  photos?: string[]
  next_service_date?: string
  created_at: string
}

export interface UpcomingMaintenance {
  schedule: MaintenanceSchedule
  installation: { id: string; customer_name: string; address?: string; system_size_kw: number }
  days_until_due: number
}

// ── Hooks ────────────────────────────────────────────────────────────

function extractData<T>(resp: unknown): T {
  const r = resp as { data?: T }
  return r?.data !== undefined ? r.data : (resp as T)
}

export function useInstallations(status?: string) {
  return useQuery({
    queryKey: ['installations', status],
    queryFn: async () => {
      const resp = await api.get('/api/v1/installations', { params: status ? { status } : {} })
      return extractData<Installation[]>(resp)
    },
  })
}

export function useInstallation(id: string) {
  return useQuery({
    queryKey: ['installation', id],
    queryFn: async () => {
      const resp = await api.get(`/api/v1/installations/${id}`)
      return extractData<Installation>(resp)
    },
    enabled: !!id,
  })
}

export function useCreateInstallation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: Partial<Installation>) => {
      const resp = await api.post('/api/v1/installations', data)
      return extractData<Installation>(resp)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['installations'] }),
  })
}

export function useMaintenanceSchedules(installationId: string) {
  return useQuery({
    queryKey: ['maintenance-schedules', installationId],
    queryFn: async () => {
      const resp = await api.get(`/api/v1/installations/${installationId}/maintenance`)
      return extractData<MaintenanceSchedule[]>(resp)
    },
    enabled: !!installationId,
  })
}

export function useCreateMaintenanceSchedule(installationId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: Partial<MaintenanceSchedule>) => {
      const resp = await api.post(`/api/v1/installations/${installationId}/maintenance`, data)
      return extractData<MaintenanceSchedule>(resp)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['maintenance-schedules', installationId] })
      qc.invalidateQueries({ queryKey: ['upcoming-maintenance'] })
    },
  })
}

export function useServiceRecords(installationId: string) {
  return useQuery({
    queryKey: ['service-records', installationId],
    queryFn: async () => {
      const resp = await api.get(`/api/v1/installations/${installationId}/service-records`)
      return extractData<ServiceRecord[]>(resp)
    },
    enabled: !!installationId,
  })
}

export function useCreateServiceRecord(installationId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: Partial<ServiceRecord>) => {
      const resp = await api.post(`/api/v1/installations/${installationId}/service-records`, data)
      return extractData<ServiceRecord>(resp)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['service-records', installationId] })
      qc.invalidateQueries({ queryKey: ['maintenance-schedules', installationId] })
      qc.invalidateQueries({ queryKey: ['upcoming-maintenance'] })
    },
  })
}

export interface MaintenanceAlert {
  alert_type: string
  severity: string
  title: string
  message: string
  installation_id: string
  customer_name: string
  due_date?: string
}

export function useMaintenanceAlerts() {
  return useQuery({
    queryKey: ['maintenance-alerts'],
    queryFn: async () => {
      const resp = await api.get('/api/v1/maintenance/alerts')
      return extractData<{ alerts: MaintenanceAlert[]; total: number }>(resp)
    },
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
  })
}

export function useUpcomingMaintenance(days = 30) {
  return useQuery({
    queryKey: ['upcoming-maintenance', days],
    queryFn: async () => {
      const resp = await api.get('/api/v1/maintenance/upcoming', { params: { days } })
      return extractData<UpcomingMaintenance[]>(resp)
    },
  })
}
