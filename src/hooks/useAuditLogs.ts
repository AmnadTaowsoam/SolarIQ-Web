'use client'

import { useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'VIEW' | 'EXPORT' | 'LOGIN' | 'LOGOUT'
export type AuditResourceType = 'lead' | 'deal' | 'quote' | 'user' | 'settings' | 'session' | 'api_key'

export interface AuditLogEntry {
  id: string
  timestamp: string
  user_id: string
  user_email: string
  user_name: string
  action: AuditAction
  resource_type: AuditResourceType
  resource_id?: string
  description: string
  ip_address: string
  user_agent?: string
  changes?: {
    before: Record<string, unknown>
    after: Record<string, unknown>
  }
  metadata?: Record<string, unknown>
}

export interface AuditLogFilters {
  date_from?: string
  date_to?: string
  action?: AuditAction | ''
  resource_type?: AuditResourceType | ''
  user_search?: string
  page?: number
  page_size?: number
}

export interface AuditLogStats {
  total_events_today: number
  unique_users_today: number
  most_common_action: string
  suspicious_events: number
}

export interface PaginatedAuditLogs {
  items: AuditLogEntry[]
  total: number
  page: number
  page_size: number
  total_pages: number
}

// ---------------------------------------------------------------------------
// Demo Data
// ---------------------------------------------------------------------------

const DEMO_USERS = [
  { id: 'u1', email: 'somchai@solariq.co', name: 'สมชาย วงศ์สวัสดิ์' },
  { id: 'u2', email: 'wipa@solariq.co', name: 'วิภา สุขสันต์' },
  { id: 'u3', email: 'admin@solariq.co', name: 'ผู้ดูแลระบบ' },
  { id: 'u4', email: 'narong@solariq.co', name: 'ณรงค์ เจริญชัย' },
]

const DEMO_ACTIONS: AuditAction[] = ['CREATE', 'UPDATE', 'DELETE', 'VIEW', 'EXPORT', 'LOGIN', 'LOGOUT']
const DEMO_RESOURCES: AuditResourceType[] = ['lead', 'deal', 'quote', 'user', 'settings', 'session', 'api_key']
const DEMO_IPS = ['203.150.33.12', '184.22.100.55', '171.97.42.88', '49.228.15.201', '110.168.0.44']

function generateDemoLogs(count: number): AuditLogEntry[] {
  const logs: AuditLogEntry[] = []
  const now = Date.now()
  for (let i = 0; i < count; i++) {
    const user = DEMO_USERS[i % DEMO_USERS.length]
    const action = DEMO_ACTIONS[i % DEMO_ACTIONS.length]
    const resource = DEMO_RESOURCES[i % DEMO_RESOURCES.length]
    const ts = new Date(now - i * 300_000).toISOString()
    const entry: AuditLogEntry = {
      id: `log-${i + 1}`,
      timestamp: ts,
      user_id: user.id,
      user_email: user.email,
      user_name: user.name,
      action,
      resource_type: resource,
      resource_id: `${resource}-${100 + i}`,
      description: descriptionForAction(action, resource),
      ip_address: DEMO_IPS[i % DEMO_IPS.length],
      user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    }
    if (action === 'UPDATE') {
      entry.changes = {
        before: { status: 'new', name: 'เดิม' },
        after: { status: 'contacted', name: 'ใหม่' },
      }
    }
    logs.push(entry)
  }
  return logs
}

function descriptionForAction(action: AuditAction, resource: AuditResourceType): string {
  const map: Record<AuditAction, string> = {
    CREATE: `สร้าง ${resource} ใหม่`,
    UPDATE: `แก้ไข ${resource}`,
    DELETE: `ลบ ${resource}`,
    VIEW: `ดู ${resource}`,
    EXPORT: `ส่งออก ${resource}`,
    LOGIN: 'เข้าสู่ระบบ',
    LOGOUT: 'ออกจากระบบ',
  }
  return map[action]
}

const DEMO_LOGS = generateDemoLogs(120)

const DEMO_STATS: AuditLogStats = {
  total_events_today: 87,
  unique_users_today: 12,
  most_common_action: 'VIEW',
  suspicious_events: 2,
}

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

export function useAuditLogs(filters: AuditLogFilters = {}) {
  const { page = 1, page_size = 50, ...rest } = filters

  return useQuery<PaginatedAuditLogs>({
    queryKey: ['audit-logs', page, page_size, rest],
    queryFn: async () => {
      try {
        const params: Record<string, string | number> = { page, page_size }
        if (rest.date_from) params.date_from = rest.date_from
        if (rest.date_to) params.date_to = rest.date_to
        if (rest.action) params.action = rest.action
        if (rest.resource_type) params.resource_type = rest.resource_type
        if (rest.user_search) params.user_search = rest.user_search

        const res = await apiClient.get('/audit-logs', { params })
        return res.data
      } catch {
        // Fallback to demo data
        let filtered = [...DEMO_LOGS]
        if (rest.action) filtered = filtered.filter((l) => l.action === rest.action)
        if (rest.resource_type) filtered = filtered.filter((l) => l.resource_type === rest.resource_type)
        if (rest.user_search) {
          const q = rest.user_search.toLowerCase()
          filtered = filtered.filter(
            (l) => l.user_email.toLowerCase().includes(q) || l.user_name.toLowerCase().includes(q)
          )
        }
        if (rest.date_from) filtered = filtered.filter((l) => l.timestamp >= rest.date_from!)
        if (rest.date_to) filtered = filtered.filter((l) => l.timestamp <= rest.date_to! + 'T23:59:59')

        const total = filtered.length
        const start = (page - 1) * page_size
        const items = filtered.slice(start, start + page_size)

        return {
          items,
          total,
          page,
          page_size,
          total_pages: Math.ceil(total / page_size),
        }
      }
    },
  })
}

export function useAuditStats() {
  return useQuery<AuditLogStats>({
    queryKey: ['audit-stats'],
    queryFn: async () => {
      try {
        const res = await apiClient.get('/audit-logs/stats')
        return res.data
      } catch {
        return DEMO_STATS
      }
    },
  })
}

export function useExportAuditLogs() {
  const exportLogs = useCallback(async (filters: Omit<AuditLogFilters, 'page' | 'page_size'>) => {
    try {
      const params: Record<string, string> = {}
      if (filters.date_from) params.date_from = filters.date_from
      if (filters.date_to) params.date_to = filters.date_to
      if (filters.action) params.action = filters.action
      if (filters.resource_type) params.resource_type = filters.resource_type
      if (filters.user_search) params.user_search = filters.user_search

      const res = await apiClient.get('/audit-logs/export', {
        params,
        responseType: 'blob',
      })

      const url = window.URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `audit-logs-${new Date().toISOString().slice(0, 10)}.csv`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch {
      // Fallback: generate CSV from demo data
      const headers = ['เวลา', 'ผู้ใช้', 'อีเมล', 'การกระทำ', 'ประเภท', 'รายละเอียด', 'IP']
      const rows = DEMO_LOGS.map((l) => [
        l.timestamp,
        l.user_name,
        l.user_email,
        l.action,
        l.resource_type,
        l.description,
        l.ip_address,
      ])
      const csv = [headers, ...rows].map((r) => r.join(',')).join('\n')
      const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `audit-logs-${new Date().toISOString().slice(0, 10)}.csv`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    }
  }, [])

  return { exportLogs }
}
