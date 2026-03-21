'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Demo Data
// ---------------------------------------------------------------------------

const DEMO_SESSIONS: Session[] = [
  {
    id: 'sess-1',
    ip_address: '203.150.33.12',
    user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    browser: 'Chrome 120',
    device: 'Desktop',
    os: 'Windows 11',
    login_time: new Date(Date.now() - 2 * 3600_000).toISOString(),
    last_active: new Date(Date.now() - 60_000).toISOString(),
    is_current: true,
    location: 'กรุงเทพฯ',
  },
  {
    id: 'sess-2',
    ip_address: '184.22.100.55',
    user_agent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0)',
    browser: 'Safari 17',
    device: 'iPhone 15',
    os: 'iOS 17',
    login_time: new Date(Date.now() - 24 * 3600_000).toISOString(),
    last_active: new Date(Date.now() - 3 * 3600_000).toISOString(),
    is_current: false,
    location: 'เชียงใหม่',
  },
  {
    id: 'sess-3',
    ip_address: '171.97.42.88',
    user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0)',
    browser: 'Firefox 121',
    device: 'MacBook Pro',
    os: 'macOS 14',
    login_time: new Date(Date.now() - 48 * 3600_000).toISOString(),
    last_active: new Date(Date.now() - 12 * 3600_000).toISOString(),
    is_current: false,
    location: 'นครราชสีมา',
  },
]

const DEMO_LOGIN_HISTORY: LoginHistoryEntry[] = [
  {
    id: 'lh-1',
    timestamp: new Date(Date.now() - 2 * 3600_000).toISOString(),
    ip_address: '203.150.33.12',
    user_agent: 'Chrome 120 / Windows 11',
    browser: 'Chrome 120',
    device: 'Desktop',
    success: true,
  },
  {
    id: 'lh-2',
    timestamp: new Date(Date.now() - 5 * 3600_000).toISOString(),
    ip_address: '203.150.33.12',
    user_agent: 'Chrome 120 / Windows 11',
    browser: 'Chrome 120',
    device: 'Desktop',
    success: false,
    failure_reason: 'รหัสผ่านไม่ถูกต้อง',
  },
  {
    id: 'lh-3',
    timestamp: new Date(Date.now() - 24 * 3600_000).toISOString(),
    ip_address: '184.22.100.55',
    user_agent: 'Safari 17 / iOS 17',
    browser: 'Safari 17',
    device: 'iPhone 15',
    success: true,
  },
  {
    id: 'lh-4',
    timestamp: new Date(Date.now() - 26 * 3600_000).toISOString(),
    ip_address: '184.22.100.55',
    user_agent: 'Safari 17 / iOS 17',
    browser: 'Safari 17',
    device: 'iPhone 15',
    success: false,
    failure_reason: 'OTP หมดอายุ',
  },
  {
    id: 'lh-5',
    timestamp: new Date(Date.now() - 48 * 3600_000).toISOString(),
    ip_address: '171.97.42.88',
    user_agent: 'Firefox 121 / macOS 14',
    browser: 'Firefox 121',
    device: 'MacBook Pro',
    success: true,
  },
  {
    id: 'lh-6',
    timestamp: new Date(Date.now() - 72 * 3600_000).toISOString(),
    ip_address: '49.228.15.201',
    user_agent: 'Chrome 120 / Android 14',
    browser: 'Chrome 120',
    device: 'Samsung Galaxy S24',
    success: true,
  },
  {
    id: 'lh-7',
    timestamp: new Date(Date.now() - 96 * 3600_000).toISOString(),
    ip_address: '110.168.0.44',
    user_agent: 'Edge 120 / Windows 11',
    browser: 'Edge 120',
    device: 'Desktop',
    success: false,
    failure_reason: 'บัญชีถูกล็อกชั่วคราว',
  },
  {
    id: 'lh-8',
    timestamp: new Date(Date.now() - 120 * 3600_000).toISOString(),
    ip_address: '203.150.33.12',
    user_agent: 'Chrome 119 / Windows 11',
    browser: 'Chrome 119',
    device: 'Desktop',
    success: true,
  },
  {
    id: 'lh-9',
    timestamp: new Date(Date.now() - 144 * 3600_000).toISOString(),
    ip_address: '203.150.33.12',
    user_agent: 'Chrome 119 / Windows 11',
    browser: 'Chrome 119',
    device: 'Desktop',
    success: true,
  },
  {
    id: 'lh-10',
    timestamp: new Date(Date.now() - 168 * 3600_000).toISOString(),
    ip_address: '171.97.42.88',
    user_agent: 'Firefox 120 / macOS 14',
    browser: 'Firefox 120',
    device: 'MacBook Pro',
    success: true,
  },
]

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

export function useActiveSessions() {
  return useQuery<Session[]>({
    queryKey: ['sessions'],
    queryFn: async () => {
      try {
        const res = await apiClient.get('/sessions')
        return res.data
      } catch {
        return DEMO_SESSIONS
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
      } catch {
        // Demo mode: simulate success
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
    mutationFn: async () => {
      try {
        await apiClient.post('/sessions/terminate-others')
      } catch {
        // Demo mode: simulate success
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
        return res.data
      } catch {
        return DEMO_LOGIN_HISTORY
      }
    },
  })
}
