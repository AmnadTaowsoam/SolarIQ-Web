'use client'

/**
 * Developer API hooks for SolarIQ Developer Portal (WK-031)
 * Uses live backend endpoints and avoids demo fallbacks in production.
 */

import { useState, useCallback, useEffect } from 'react'
import { apiClient } from '@/lib/api'

export interface ApiKey {
  id: string
  name: string
  keyPrefix: string
  keyMasked: string
  environment: 'live' | 'test'
  permissions: string[]
  status: 'active' | 'revoked'
  createdAt: Date
  lastUsedAt?: Date
  callCount: number
}

export interface ApiKeyCreateResult extends ApiKey {
  fullKey: string
}

export interface Webhook {
  id: string
  url: string
  events: string[]
  status: 'active' | 'disabled'
  secret: string
  lastTriggeredAt?: Date
  createdAt: Date
  failureCount: number
}

export interface WebhookEvent {
  id: string
  name: string
  description: string
}

export interface ApiUsageStat {
  date: string
  calls: number
  errors: number
}

export interface EndpointUsage {
  endpoint: string
  calls: number
  percentage: number
}

export interface ApiUsageSummary {
  totalCallsToday: number
  totalCallsMonth: number
  monthLimit: number
  successRate: number
  avgLatencyMs: number
  dailyStats: ApiUsageStat[]
  endpointBreakdown: EndpointUsage[]
}

export const WEBHOOK_EVENTS: WebhookEvent[] = [
  { id: 'lead.created', name: 'lead.created', description: 'เมื่อมี Lead ใหม่' },
  { id: 'lead.updated', name: 'lead.updated', description: 'เมื่อ Lead อัปเดต' },
  {
    id: 'lead.status_changed',
    name: 'lead.status_changed',
    description: 'เมื่อสถานะ Lead เปลี่ยน',
  },
  { id: 'quote.created', name: 'quote.created', description: 'เมื่อสร้างใบเสนอราคา' },
  { id: 'quote.accepted', name: 'quote.accepted', description: 'เมื่อลูกค้ายอมรับใบเสนอราคา' },
  { id: 'deal.created', name: 'deal.created', description: 'เมื่อสร้าง Deal' },
  { id: 'deal.closed', name: 'deal.closed', description: 'เมื่อ Deal ปิด' },
  {
    id: 'solar.analysis_complete',
    name: 'solar.analysis_complete',
    description: 'เมื่อวิเคราะห์โซลาร์เสร็จ',
  },
]

function formatApiError(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message
  }
  return 'Developer API is unavailable right now.'
}

function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : []
}

function mapApiKey(raw: Record<string, unknown>): ApiKey {
  const createdAt = raw.createdAt ?? raw.created_at
  const lastUsedAt = raw.lastUsedAt ?? raw.last_used_at
  return {
    id: String(raw.id ?? ''),
    name: String(raw.name ?? 'Unnamed key'),
    keyPrefix: String(raw.keyPrefix ?? raw.key_prefix ?? ''),
    keyMasked: String(raw.keyMasked ?? raw.key_masked ?? raw.masked_key ?? ''),
    environment: raw.environment === 'live' ? 'live' : 'test',
    permissions: asArray<string>(raw.permissions).map(String),
    status: raw.status === 'revoked' ? 'revoked' : 'active',
    createdAt: createdAt ? new Date(String(createdAt)) : new Date(),
    lastUsedAt: lastUsedAt ? new Date(String(lastUsedAt)) : undefined,
    callCount: Number(raw.callCount ?? raw.call_count ?? 0),
  }
}

function mapApiKeyCreateResult(raw: Record<string, unknown>): ApiKeyCreateResult {
  return {
    ...mapApiKey(raw),
    fullKey: String(raw.fullKey ?? raw.full_key ?? raw.key ?? ''),
  }
}

function mapWebhook(raw: Record<string, unknown>): Webhook {
  const createdAt = raw.createdAt ?? raw.created_at
  const lastTriggeredAt = raw.lastTriggeredAt ?? raw.last_triggered_at
  return {
    id: String(raw.id ?? ''),
    url: String(raw.url ?? ''),
    events: asArray<string>(raw.events).map(String),
    status: raw.status === 'disabled' ? 'disabled' : 'active',
    secret: String(raw.secret ?? ''),
    lastTriggeredAt: lastTriggeredAt ? new Date(String(lastTriggeredAt)) : undefined,
    createdAt: createdAt ? new Date(String(createdAt)) : new Date(),
    failureCount: Number(raw.failureCount ?? raw.failure_count ?? 0),
  }
}

function mapUsage(raw: Record<string, unknown>): ApiUsageSummary {
  return {
    totalCallsToday: Number(raw.totalCallsToday ?? raw.total_calls_today ?? 0),
    totalCallsMonth: Number(raw.totalCallsMonth ?? raw.total_calls_month ?? 0),
    monthLimit: Number(raw.monthLimit ?? raw.month_limit ?? 0),
    successRate: Number(raw.successRate ?? raw.success_rate ?? 0),
    avgLatencyMs: Number(raw.avgLatencyMs ?? raw.avg_latency_ms ?? 0),
    dailyStats: asArray<Record<string, unknown>>(raw.dailyStats ?? raw.daily_stats).map((item) => ({
      date: String(item.date ?? ''),
      calls: Number(item.calls ?? 0),
      errors: Number(item.errors ?? 0),
    })),
    endpointBreakdown: asArray<Record<string, unknown>>(
      raw.endpointBreakdown ?? raw.endpoint_breakdown
    ).map((item) => ({
      endpoint: String(item.endpoint ?? ''),
      calls: Number(item.calls ?? 0),
      percentage: Number(item.percentage ?? 0),
    })),
  }
}

export function useApiKeys() {
  const [keys, setKeys] = useState<ApiKey[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchKeys = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await apiClient.get('/api/v1/developers/keys')
      const items = asArray<Record<string, unknown>>(
        response.data?.items ?? response.data?.keys ?? response.data
      )
      setKeys(items.map(mapApiKey))
    } catch (err) {
      setKeys([])
      setError(formatApiError(err))
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchKeys()
  }, [fetchKeys])

  const createKey = useCallback(
    async (data: {
      name: string
      environment: 'live' | 'test'
      permissions: string[]
    }): Promise<ApiKeyCreateResult> => {
      try {
        setError(null)
        const response = await apiClient.post('/api/v1/developers/keys', data)
        const newKey = mapApiKeyCreateResult(response.data)
        setKeys((prev) => [...prev, newKey])
        return newKey
      } catch (err) {
        const message = formatApiError(err)
        setError(message)
        throw new Error(message)
      }
    },
    []
  )

  const revokeKey = useCallback(async (keyId: string): Promise<void> => {
    try {
      setError(null)
      await apiClient.delete(`/api/v1/developers/keys/${keyId}`)
      setKeys((prev) =>
        prev.map((key) => (key.id === keyId ? { ...key, status: 'revoked' as const } : key))
      )
    } catch (err) {
      const message = formatApiError(err)
      setError(message)
      throw new Error(message)
    }
  }, [])

  return { keys, isLoading, error, createKey, revokeKey, refetch: fetchKeys }
}

export function useWebhooks() {
  const [webhooks, setWebhooks] = useState<Webhook[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchWebhooks = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await apiClient.get('/api/v1/developers/webhooks')
      const items = asArray<Record<string, unknown>>(
        response.data?.items ?? response.data?.webhooks ?? response.data
      )
      setWebhooks(items.map(mapWebhook))
    } catch (err) {
      setWebhooks([])
      setError(formatApiError(err))
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchWebhooks()
  }, [fetchWebhooks])

  const createWebhook = useCallback(
    async (data: { url: string; events: string[] }): Promise<Webhook> => {
      try {
        setError(null)
        const response = await apiClient.post('/api/v1/developers/webhooks', data)
        const webhook = mapWebhook(response.data)
        setWebhooks((prev) => [...prev, webhook])
        return webhook
      } catch (err) {
        const message = formatApiError(err)
        setError(message)
        throw new Error(message)
      }
    },
    []
  )

  const deleteWebhook = useCallback(async (webhookId: string): Promise<void> => {
    try {
      setError(null)
      await apiClient.delete(`/api/v1/developers/webhooks/${webhookId}`)
      setWebhooks((prev) => prev.filter((webhook) => webhook.id !== webhookId))
    } catch (err) {
      const message = formatApiError(err)
      setError(message)
      throw new Error(message)
    }
  }, [])

  const testWebhook = useCallback(async (webhookId: string): Promise<boolean> => {
    try {
      setError(null)
      await apiClient.post(`/api/v1/developers/webhooks/${webhookId}/test`)
      return true
    } catch (err) {
      setError(formatApiError(err))
      return false
    }
  }, [])

  return {
    webhooks,
    isLoading,
    error,
    createWebhook,
    deleteWebhook,
    testWebhook,
    refetch: fetchWebhooks,
  }
}

export function useApiUsage() {
  const [usage, setUsage] = useState<ApiUsageSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUsage = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const response = await apiClient.get('/api/v1/developers/usage')
        setUsage(response.data ? mapUsage(response.data) : null)
      } catch (err) {
        setUsage(null)
        setError(formatApiError(err))
      } finally {
        setIsLoading(false)
      }
    }

    fetchUsage()
  }, [])

  return { usage, isLoading, error }
}
