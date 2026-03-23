/**
 * API Client for SolarIQ-Web
 * Configured axios instance with auth interceptors and402 quota handling (WK-020)
 */

import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios'
import { getIdToken } from 'firebase/auth'
import { auth } from '@/lib/firebase'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

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

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
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
  (error: AxiosError<QuotaErrorResponse>) => {
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

    // Handle 401 Unauthorized - redirect to login
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        // Clear any cached auth state
        localStorage.removeItem('auth_state')
        // Redirect to login
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
