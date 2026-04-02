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

export function useActiveSessions() {
  return useQuery<Session[]>({
    queryKey: ['sessions'],
    queryFn: async () => {
      try {
        const res = await apiClient.get('/sessions')
        return Array.isArray(res.data) ? res.data : []
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
    mutationFn: async () => {
      try {
        await apiClient.post('/sessions/terminate-others')
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
        return Array.isArray(res.data) ? res.data : []
      } catch (error) {
        throw new Error(formatSessionError(error))
      }
    },
  })
}
