'use client'

import { useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'

export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'VIEW' | 'EXPORT' | 'LOGIN' | 'LOGOUT'
export type AuditResourceType =
  | 'lead'
  | 'deal'
  | 'quote'
  | 'user'
  | 'settings'
  | 'session'
  | 'api_key'

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

function formatAuditError(error: unknown): string {
  if (typeof error === 'object' && error !== null) {
    const maybe = error as {
      response?: { data?: { detail?: string; message?: string } }
      message?: string
    }
    return (
      maybe.response?.data?.detail ||
      maybe.response?.data?.message ||
      maybe.message ||
      'Audit logs are currently unavailable.'
    )
  }

  return 'Audit logs are currently unavailable.'
}

function normalizeAuditEntry(raw: Record<string, unknown>): AuditLogEntry {
  const changes = raw.changes
  const normalizedChanges =
    changes && typeof changes === 'object'
      ? {
          before:
            typeof (changes as { before?: unknown }).before === 'object' &&
            (changes as { before?: unknown }).before !== null
              ? ((changes as { before: Record<string, unknown> }).before ?? {})
              : {},
          after:
            typeof (changes as { after?: unknown }).after === 'object' &&
            (changes as { after?: unknown }).after !== null
              ? ((changes as { after: Record<string, unknown> }).after ?? {})
              : {},
        }
      : undefined

  return {
    id: String(raw.id ?? ''),
    timestamp: String(raw.timestamp ?? raw.created_at ?? new Date().toISOString()),
    user_id: String(raw.user_id ?? raw.userId ?? ''),
    user_email: String(raw.user_email ?? raw.userEmail ?? ''),
    user_name: String(raw.user_name ?? raw.userName ?? raw.email ?? 'Unknown user'),
    action: String(raw.action ?? 'VIEW') as AuditAction,
    resource_type: String(raw.resource_type ?? raw.resourceType ?? 'settings') as AuditResourceType,
    resource_id:
      raw.resource_id !== undefined || raw.resourceId !== undefined
        ? String(raw.resource_id ?? raw.resourceId ?? '')
        : undefined,
    description: String(raw.description ?? raw.message ?? ''),
    ip_address: String(raw.ip_address ?? raw.ipAddress ?? '-'),
    user_agent:
      raw.user_agent !== undefined || raw.userAgent !== undefined
        ? String(raw.user_agent ?? raw.userAgent ?? '')
        : undefined,
    changes: normalizedChanges,
    metadata:
      raw.metadata && typeof raw.metadata === 'object'
        ? (raw.metadata as Record<string, unknown>)
        : undefined,
  }
}

function normalizePaginatedAuditLogs(
  payload: unknown,
  page: number,
  pageSize: number
): PaginatedAuditLogs {
  const source = payload && typeof payload === 'object' ? (payload as Record<string, unknown>) : {}
  const itemsSource = Array.isArray(source.items)
    ? source.items
    : Array.isArray(source.logs)
      ? source.logs
      : Array.isArray(payload)
        ? payload
        : []
  const items = itemsSource
    .filter((item): item is Record<string, unknown> => typeof item === 'object' && item !== null)
    .map(normalizeAuditEntry)
  const total = Number(source.total ?? items.length)
  const currentPage = Number(source.page ?? page)
  const currentPageSize = Number(source.page_size ?? source.pageSize ?? pageSize)
  const totalPages = Number(
    source.total_pages ??
      source.totalPages ??
      Math.max(1, Math.ceil(total / Math.max(currentPageSize, 1)))
  )

  return {
    items,
    total,
    page: currentPage,
    page_size: currentPageSize,
    total_pages: totalPages,
  }
}

function normalizeAuditStats(payload: unknown): AuditLogStats {
  const source = payload && typeof payload === 'object' ? (payload as Record<string, unknown>) : {}

  return {
    total_events_today: Number(source.total_events_today ?? source.totalEventsToday ?? 0),
    unique_users_today: Number(source.unique_users_today ?? source.uniqueUsersToday ?? 0),
    most_common_action: String(source.most_common_action ?? source.mostCommonAction ?? '-'),
    suspicious_events: Number(source.suspicious_events ?? source.suspiciousEvents ?? 0),
  }
}

export function useAuditLogs(filters: AuditLogFilters = {}) {
  const { page = 1, page_size = 50, ...rest } = filters

  return useQuery<PaginatedAuditLogs>({
    queryKey: ['audit-logs', page, page_size, rest],
    queryFn: async () => {
      const params: Record<string, string | number> = { page, page_size }
      if (rest.date_from) {
        params.date_from = rest.date_from
      }
      if (rest.date_to) {
        params.date_to = rest.date_to
      }
      if (rest.action) {
        params.action = rest.action
      }
      if (rest.resource_type) {
        params.resource_type = rest.resource_type
      }
      if (rest.user_search) {
        params.user_search = rest.user_search
      }

      try {
        const res = await apiClient.get('/api/v1/audit-logs', { params })
        return normalizePaginatedAuditLogs(res.data, page, page_size)
      } catch (error) {
        throw new Error(formatAuditError(error))
      }
    },
  })
}

export function useAuditStats() {
  return useQuery<AuditLogStats>({
    queryKey: ['audit-stats'],
    queryFn: async () => {
      try {
        const res = await apiClient.get('/api/v1/audit-logs/stats')
        return normalizeAuditStats(res.data)
      } catch (error) {
        throw new Error(formatAuditError(error))
      }
    },
  })
}

export function useExportAuditLogs() {
  const exportLogs = useCallback(async (filters: Omit<AuditLogFilters, 'page' | 'page_size'>) => {
    const params: Record<string, string> = {}
    if (filters.date_from) {
      params.date_from = filters.date_from
    }
    if (filters.date_to) {
      params.date_to = filters.date_to
    }
    if (filters.action) {
      params.action = filters.action
    }
    if (filters.resource_type) {
      params.resource_type = filters.resource_type
    }
    if (filters.user_search) {
      params.user_search = filters.user_search
    }

    try {
      const res = await apiClient.get('/api/v1/audit-logs/export', {
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
    } catch (error) {
      throw new Error(formatAuditError(error))
    }
  }, [])

  return { exportLogs }
}
