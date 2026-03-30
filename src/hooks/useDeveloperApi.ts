'use client'

/**
 * useDeveloperApi hook for SolarIQ Developer Portal (WK-031)
 * Provides API key management, webhook management, and usage statistics
 */

import { useState, useCallback, useEffect } from 'react'
import { apiClient } from '@/lib/api'

// ============== Types ==============

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
  fullKey: string // shown only once
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

// ============== Available webhook events ==============

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

// ============== Demo Data ==============

const DEMO_API_KEYS: ApiKey[] = [
  {
    id: 'key-1',
    name: 'Production Key',
    keyPrefix: 'sk-live',
    keyMasked: 'sk-live-••••••••••••••••••••••••••••••Kx7p',
    environment: 'live',
    permissions: ['leads:read', 'leads:write', 'solar:analyze', 'proposals:read'],
    status: 'active',
    createdAt: new Date('2026-03-15'),
    lastUsedAt: new Date(Date.now() - 3 * 60 * 1000),
    callCount: 1234,
  },
  {
    id: 'key-2',
    name: 'Test Key',
    keyPrefix: 'sk-test',
    keyMasked: 'sk-test-••••••••••••••••••••••••••••••Ab2m',
    environment: 'test',
    permissions: ['leads:read', 'leads:write', 'solar:analyze'],
    status: 'active',
    createdAt: new Date('2026-03-10'),
    lastUsedAt: undefined,
    callCount: 0,
  },
]

const DEMO_WEBHOOKS: Webhook[] = [
  {
    id: 'wh-1',
    url: 'https://yoursite.com/webhooks/solariq',
    events: ['lead.created', 'lead.status_changed', 'quote.created', 'deal.created', 'deal.closed'],
    status: 'active',
    secret: 'whsec_demo_••••••••••••••••••••••••••••••',
    lastTriggeredAt: new Date(Date.now() - 2 * 60 * 1000),
    createdAt: new Date('2026-03-01'),
    failureCount: 0,
  },
]

function generateDailyStats(): ApiUsageStat[] {
  const stats: ApiUsageStat[] = []
  for (let i = 29; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const calls = Math.floor(Math.random() * 2000) + 500
    stats.push({
      date: d.toISOString().split('T')[0] || '',
      calls,
      errors: Math.floor(calls * 0.02),
    })
  }
  return stats
}

const DEMO_USAGE: ApiUsageSummary = {
  totalCallsToday: 1842,
  totalCallsMonth: 45231,
  monthLimit: 100000,
  successRate: 98.7,
  avgLatencyMs: 142,
  dailyStats: generateDailyStats(),
  endpointBreakdown: [
    { endpoint: '/api/v1/leads', calls: 12543, percentage: 27.7 },
    { endpoint: '/api/v1/solar/analyze', calls: 8921, percentage: 19.7 },
    { endpoint: '/api/v1/proposals', calls: 4322, percentage: 9.6 },
    { endpoint: '/api/v1/deals', calls: 3891, percentage: 8.6 },
    { endpoint: '/api/v1/auth/me', calls: 2100, percentage: 4.6 },
  ],
}

// ============== Hooks ==============

export function useApiKeys() {
  const [keys, setKeys] = useState<ApiKey[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDemoMode, setIsDemoMode] = useState(false)

  const fetchKeys = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await apiClient.get('/api/v1/developer/keys')
      if (response.data?.keys) {
        setKeys(response.data.keys)
        setIsDemoMode(false)
      } else {
        setKeys(DEMO_API_KEYS)
        setIsDemoMode(true)
      }
    } catch {
      setKeys(DEMO_API_KEYS)
      setIsDemoMode(true)
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
        const response = await apiClient.post('/api/v1/developer/keys', data)
        const newKey = response.data
        setKeys((prev) => [...prev, newKey])
        return newKey
      } catch {
        // Demo mode: simulate key creation
        const demoKey: ApiKeyCreateResult = {
          id: `key-demo-${Date.now()}`,
          name: data.name,
          keyPrefix: data.environment === 'live' ? 'sk-live' : 'sk-test',
          keyMasked: `${data.environment === 'live' ? 'sk-live' : 'sk-test'}-••••••••••••••••••••••Demo${Math.random().toString(36).slice(2, 6)}`,
          fullKey: `${data.environment === 'live' ? 'sk-live' : 'sk-test'}-${Array.from({ length: 32 }, () => Math.random().toString(36)[2]).join('')}`,
          environment: data.environment,
          permissions: data.permissions,
          status: 'active',
          createdAt: new Date(),
          callCount: 0,
        }
        setKeys((prev) => [...prev, demoKey])
        return demoKey
      }
    },
    []
  )

  const revokeKey = useCallback(async (keyId: string): Promise<void> => {
    try {
      await apiClient.delete(`/api/v1/developer/keys/${keyId}`)
    } catch {
      // Demo mode: allow
    }
    setKeys((prev) => prev.map((k) => (k.id === keyId ? { ...k, status: 'revoked' as const } : k)))
  }, [])

  return { keys, isLoading, isDemoMode, createKey, revokeKey, refetch: fetchKeys }
}

export function useWebhooks() {
  const [webhooks, setWebhooks] = useState<Webhook[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchWebhooks = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await apiClient.get('/api/v1/developer/webhooks')
      if (response.data?.webhooks) {
        setWebhooks(response.data.webhooks)
      } else {
        setWebhooks(DEMO_WEBHOOKS)
      }
    } catch {
      setWebhooks(DEMO_WEBHOOKS)
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
        const response = await apiClient.post('/api/v1/developer/webhooks', data)
        const wh = response.data
        setWebhooks((prev) => [...prev, wh])
        return wh
      } catch {
        const demoWh: Webhook = {
          id: `wh-demo-${Date.now()}`,
          url: data.url,
          events: data.events,
          status: 'active',
          secret: `whsec_demo_${Math.random().toString(36).slice(2, 18)}`,
          createdAt: new Date(),
          failureCount: 0,
        }
        setWebhooks((prev) => [...prev, demoWh])
        return demoWh
      }
    },
    []
  )

  const deleteWebhook = useCallback(async (webhookId: string): Promise<void> => {
    try {
      await apiClient.delete(`/api/v1/developer/webhooks/${webhookId}`)
    } catch {
      // Demo: allow
    }
    setWebhooks((prev) => prev.filter((w) => w.id !== webhookId))
  }, [])

  const testWebhook = useCallback(async (webhookId: string): Promise<boolean> => {
    try {
      await apiClient.post(`/api/v1/developer/webhooks/${webhookId}/test`)
      return true
    } catch {
      return false
    }
  }, [])

  return { webhooks, isLoading, createWebhook, deleteWebhook, testWebhook, refetch: fetchWebhooks }
}

export function useApiUsage() {
  const [usage, setUsage] = useState<ApiUsageSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      setIsLoading(true)
      try {
        const response = await apiClient.get('/api/v1/developer/usage')
        if (response.data) {
          setUsage(response.data)
        } else {
          setUsage(DEMO_USAGE)
        }
      } catch {
        setUsage(DEMO_USAGE)
      } finally {
        setIsLoading(false)
      }
    }
    fetch()
  }, [])

  return { usage, isLoading }
}
