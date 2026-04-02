'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'

export interface Session {
  id: string
  ip_address: string
  user_agent: string
  browser: string
  device: string
  os: string
  login_time: string
  last_active: string
  is_current: boolean
  location?: string
}

export interface LoginHistoryEntry {
  id: string
  timestamp: string
  ip_address: string
  user_agent: string
  browser: string
  device: string
  success: boolean
  failure_reason?: string
}

function formatSessionError(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message
  }
  return 'Session data is unavailable right now.'
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {}
}

function pickString(...values: unknown[]): string {
  for (const value of values) {
    if (typeof value === 'string' && value.length > 0) {
      return value
    }
  }
  return ''
}

function detectBrowser(userAgent: string): string {
  const source = userAgent.toLowerCase()
  if (source.includes('edg/')) {
    return 'Edge'
  }
  if (source.includes('chrome/')) {
    return 'Chrome'
  }
  if (source.includes('firefox/')) {
    return 'Firefox'
  }
  if (source.includes('safari/') && !source.includes('chrome/')) {
    return 'Safari'
  }
  return 'Unknown Browser'
}

function detectOs(userAgent: string): string {
  const source = userAgent.toLowerCase()
  if (source.includes('windows')) {
    return 'Windows'
  }
  if (source.includes('mac os') || source.includes('macintosh')) {
    return 'macOS'
  }
  if (source.includes('android')) {
    return 'Android'
  }
  if (source.includes('iphone') || source.includes('ipad') || source.includes('ios')) {
    return 'iOS'
  }
  if (source.includes('linux')) {
    return 'Linux'
  }
  return 'Unknown OS'
}

function detectDevice(userAgent: string, deviceInfo: Record<string, unknown>): string {
  return pickString(
    deviceInfo.device,
    deviceInfo.deviceName,
    deviceInfo.model,
    deviceInfo.platform,
    userAgent.includes('Mobile') ? 'Mobile Device' : 'Desktop'
  )
}

function mapSession(raw: unknown, index: number): Session {
  const record = asRecord(raw)
  const userAgent = pickString(record.user_agent, record.userAgent)
  const deviceInfo = asRecord(record.device_info ?? record.deviceInfo)
  return {
    id: pickString(record.id),
    ip_address: pickString(record.ip_address, record.ipAddress),
    user_agent: userAgent,
    browser: detectBrowser(userAgent),
    device: detectDevice(userAgent, deviceInfo),
    os: detectOs(userAgent),
    login_time: pickString(record.login_at, record.loginAt),
    last_active: pickString(record.last_active_at, record.lastActiveAt),
    is_current: Boolean(record.is_current ?? record.isCurrent ?? index === 0),
    location: pickString(record.location),
  }
}

function mapLoginHistoryEntry(raw: unknown): LoginHistoryEntry {
  const record = asRecord(raw)
  const userAgent = pickString(record.user_agent, record.userAgent)
  return {
    id: pickString(record.id),
    timestamp: pickString(record.attempted_at, record.attemptedAt, record.timestamp),
    ip_address: pickString(record.ip_address, record.ipAddress),
    user_agent: userAgent,
    browser: detectBrowser(userAgent),
    device: detectDevice(userAgent, {}),
    success: Boolean(record.success),
    failure_reason: pickString(record.failure_reason, record.failureReason) || undefined,
  }
}

export function useActiveSessions() {
  return useQuery<Session[]>({
    queryKey: ['sessions'],
    queryFn: async () => {
      try {
        const res = await apiClient.get('/sessions')
        const items = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data?.sessions)
            ? res.data.sessions
            : []
        return items.map(mapSession)
      } catch (error) {
        throw new Error(formatSessionError(error))
      }
    },
  })
}

export function useTerminateSession() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (sessionId: string) => {
      try {
        await apiClient.delete(`/sessions/${sessionId}`)
      } catch (error) {
        throw new Error(formatSessionError(error))
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] })
    },
  })
}

export function useTerminateOthers() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (currentSessionId?: string) => {
      try {
        await apiClient.post(
          '/sessions/terminate-others',
          currentSessionId ? { current_session_id: currentSessionId } : {}
        )
      } catch (error) {
        throw new Error(formatSessionError(error))
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] })
    },
  })
}

export function useLoginHistory() {
  return useQuery<LoginHistoryEntry[]>({
    queryKey: ['login-history'],
    queryFn: async () => {
      try {
        const res = await apiClient.get('/sessions/login-history')
        const items = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data?.attempts)
            ? res.data.attempts
            : []
        return items.map(mapLoginHistoryEntry)
      } catch (error) {
        throw new Error(formatSessionError(error))
      }
    },
  })
}
