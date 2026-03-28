/**
 * API Client for SolarIQ-Web
 * Configured axios instance with auth interceptors and402 quota handling (WK-020)
 */

import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios'
import { getIdToken } from 'firebase/auth'
import { auth } from '@/lib/firebase'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

// ── JWT Token Storage ───────────────────────────────────────────────
let _accessToken: string | null = null
let _refreshToken: string | null = null

export function setTokens(access: string, refresh: string) {
  _accessToken = access
  _refreshToken = refresh
}

export function clearTokens() {
  _accessToken = null
  _refreshToken = null
}

export function getAccessToken() {
  return _accessToken
}

// Custom error class for quota exceeded errors
export class QuotaExceededError extends Error {
  featureKey: string
  current: number
  limit: number
  planId: string
  recommendedPlan?: string

  constructor(
    featureKey: string,
    current: number,
    limit: number,
    planId: string,
    recommendedPlan?: string
  ) {
    super(`Quota exceeded for ${featureKey}: ${current}/${limit}`)
    this.name = 'QuotaExceededError'
    this.featureKey = featureKey
    this.current = current
    this.limit = limit
    this.planId = planId
    this.recommendedPlan = recommendedPlan
  }
}

// Type for quota error response from backend
interface QuotaErrorResponse {
  detail: string
  feature_key: string
  current: number
  limit: number
  plan_id: string
  recommended_plan?: string
}

// Helper to read a cookie by name
function getCookie(name: string): string | undefined {
  if (typeof document === 'undefined') {
    return undefined
  }
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`))
  return match ? match[2] : undefined
}

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  withCredentials: true, // Send cookies cross-origin for CSRF
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token + CSRF token
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // Attach CSRF token for state-changing requests
    const csrfToken = getCookie('csrf_token')
    if (csrfToken && config.method && !['get', 'head', 'options'].includes(config.method)) {
      config.headers['x-csrf-token'] = csrfToken
    }

    // Use JWT access token if available
    if (_accessToken) {
      config.headers.Authorization = `Bearer ${_accessToken}`
      return config
    }
    // Fallback to Firebase ID token (for transition period)
    const user = auth.currentUser
    if (user) {
      try {
        const token = await getIdToken(user, false)
        config.headers.Authorization = `Bearer ${token}`
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Failed to get auth token:', error)
      }
    }
    return config
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors including 402 Quota Exceeded
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<QuotaErrorResponse>) => {
    // Handle 402 Payment Required (Quota Exceeded)
    if (error.response?.status === 402 && error.response?.data) {
      const errorData = error.response.data
      const quotaError = new QuotaExceededError(
        errorData.feature_key,
        errorData.current,
        errorData.limit,
        errorData.plan_id,
        errorData.recommended_plan
      )

      // Dispatch custom event for UI components to listen to
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('quotaExceeded', {
            detail: quotaError,
          })
        )
      }

      return Promise.reject(quotaError)
    }

    // Handle 401 Unauthorized - try refresh token, then redirect
    if (error.response?.status === 401 && _refreshToken) {
      try {
        const refreshResp = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refresh_token: _refreshToken,
        })
        const { access_token, refresh_token } = refreshResp.data
        setTokens(access_token, refresh_token)
        // Retry original request with new token
        if (error.config) {
          error.config.headers.Authorization = `Bearer ${access_token}`
          return apiClient.request(error.config)
        }
      } catch {
        // Refresh failed — clear tokens and redirect
        clearTokens()
      }
    }

    if (error.response?.status === 401) {
      clearTokens()
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_state')
        window.location.href = '/login'
      }
    }

    return Promise.reject(error)
  }
)

export { apiClient }
export default apiClient

// Alias for backward compatibility
export const api = apiClient

// Hook-style accessor for components that import useApi
export function useApi() {
  return apiClient
}
