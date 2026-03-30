/**
 * Privacy and PDPA compliance hooks (WK-018)
 */

import { useState, useCallback, useEffect } from 'react'
import { apiClient } from '@/lib/api'
import {
  ConsentType,
  ConsentStatusResponse,
  ConsentBatchCreate,
  DeletionRequestResponse,
  DeletionRequestCreate,
  DeletionRequestList,
  DataAccessLogList,
  AccessSummary,
  DataExportResponse,
  ConsentTypesResponse,
} from '@/types/privacy'

interface UsePrivacyOptions {
  autoFetchConsentStatus?: boolean
}

interface UsePrivacyReturn {
  // Consent management
  consentTypes: ConsentTypesResponse | null
  consentStatus: ConsentStatusResponse | null
  isLoadingConsent: boolean
  consentError: string | null
  fetchConsentTypes: () => Promise<void>
  fetchConsentStatus: () => Promise<void>
  grantConsents: (data: ConsentBatchCreate) => Promise<void>
  updateConsent: (consentType: ConsentType, granted: boolean) => Promise<void>

  // Deletion requests
  deletionRequests: DeletionRequestList | null
  isLoadingDeletion: boolean
  deletionError: string | null
  fetchDeletionRequests: (page?: number) => Promise<void>
  createDeletionRequest: (data: DeletionRequestCreate) => Promise<DeletionRequestResponse>
  cancelDeletionRequest: (requestId: string) => Promise<void>

  // Access logs
  accessLogs: DataAccessLogList | null
  accessSummary: AccessSummary | null
  isLoadingLogs: boolean
  logsError: string | null
  fetchAccessLogs: (page?: number) => Promise<void>
  fetchAccessSummary: () => Promise<void>

  // Data export
  exportData: () => Promise<DataExportResponse | null>
  isExporting: boolean

  // General
  isLoading: boolean
  error: string | null
  clearError: () => void
}

export function usePrivacy(options: UsePrivacyOptions = {}): UsePrivacyReturn {
  const { autoFetchConsentStatus = false } = options

  // Consent state
  const [consentTypes, setConsentTypes] = useState<ConsentTypesResponse | null>(null)
  const [consentStatus, setConsentStatus] = useState<ConsentStatusResponse | null>(null)
  const [isLoadingConsent, setIsLoadingConsent] = useState(false)
  const [consentError, setConsentError] = useState<string | null>(null)

  // Deletion state
  const [deletionRequests, setDeletionRequests] = useState<DeletionRequestList | null>(null)
  const [isLoadingDeletion, setIsLoadingDeletion] = useState(false)
  const [deletionError, setDeletionError] = useState<string | null>(null)

  // Access logs state
  const [accessLogs, setAccessLogs] = useState<DataAccessLogList | null>(null)
  const [accessSummary, setAccessSummary] = useState<AccessSummary | null>(null)
  const [isLoadingLogs, setIsLoadingLogs] = useState(false)
  const [logsError, setLogsError] = useState<string | null>(null)

  // Export state
  const [isExporting, setIsExporting] = useState(false)

  // Fetch consent types
  const fetchConsentTypes = useCallback(async () => {
    setIsLoadingConsent(true)
    setConsentError(null)
    try {
      const response = await apiClient.get<ConsentTypesResponse>('/privacy/consent-types')
      setConsentTypes(response.data)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch consent types'
      setConsentError(errorMessage)
    } finally {
      setIsLoadingConsent(false)
    }
  }, [])

  // Fetch consent status
  const fetchConsentStatus = useCallback(async () => {
    setIsLoadingConsent(true)
    setConsentError(null)
    try {
      const response = await apiClient.get<ConsentStatusResponse>('/privacy/consent/status')
      setConsentStatus(response.data)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch consent status'
      setConsentError(errorMessage)
    } finally {
      setIsLoadingConsent(false)
    }
  }, [])

  // Auto-fetch consent status on mount
  useEffect(() => {
    if (autoFetchConsentStatus) {
      fetchConsentStatus()
    }
  }, [autoFetchConsentStatus, fetchConsentStatus])

  // Grant consents (batch)
  const grantConsents = useCallback(
    async (data: ConsentBatchCreate) => {
      setIsLoadingConsent(true)
      setConsentError(null)
      try {
        await apiClient.post('/privacy/consent/batch', data)
        // Refresh consent status after granting
        await fetchConsentStatus()
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to grant consents'
        setConsentError(errorMessage)
        throw err
      } finally {
        setIsLoadingConsent(false)
      }
    },
    [fetchConsentStatus]
  )

  // Update single consent
  const updateConsent = useCallback(
    async (consentType: ConsentType, granted: boolean) => {
      setIsLoadingConsent(true)
      setConsentError(null)
      try {
        await apiClient.put(`/privacy/consent/${consentType}`, { granted })
        // Refresh consent status after update
        await fetchConsentStatus()
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to update consent'
        setConsentError(errorMessage)
        throw err
      } finally {
        setIsLoadingConsent(false)
      }
    },
    [fetchConsentStatus]
  )

  // Fetch deletion requests
  const fetchDeletionRequests = useCallback(async (page = 1) => {
    setIsLoadingDeletion(true)
    setDeletionError(null)
    try {
      const response = await apiClient.get<DeletionRequestList>(
        `/privacy/deletion-request?page=${page}&page_size=10`
      )
      setDeletionRequests(response.data)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch deletion requests'
      setDeletionError(errorMessage)
    } finally {
      setIsLoadingDeletion(false)
    }
  }, [])

  // Create deletion request
  const createDeletionRequest = useCallback(
    async (data: DeletionRequestCreate): Promise<DeletionRequestResponse> => {
      setIsLoadingDeletion(true)
      setDeletionError(null)
      try {
        const response = await apiClient.post<DeletionRequestResponse>(
          '/privacy/deletion-request',
          data
        )
        // Refresh deletion requests
        await fetchDeletionRequests()
        return response.data
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to create deletion request'
        setDeletionError(errorMessage)
        throw err
      } finally {
        setIsLoadingDeletion(false)
      }
    },
    [fetchDeletionRequests]
  )

  // Cancel deletion request
  const cancelDeletionRequest = useCallback(
    async (requestId: string) => {
      setIsLoadingDeletion(true)
      setDeletionError(null)
      try {
        await apiClient.delete(`/privacy/deletion-request/${requestId}`)
        // Refresh deletion requests
        await fetchDeletionRequests()
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to cancel deletion request'
        setDeletionError(errorMessage)
        throw err
      } finally {
        setIsLoadingDeletion(false)
      }
    },
    [fetchDeletionRequests]
  )

  // Fetch access logs
  const fetchAccessLogs = useCallback(async (page = 1) => {
    setIsLoadingLogs(true)
    setLogsError(null)
    try {
      const response = await apiClient.get<DataAccessLogList>(
        `/privacy/access-logs?page=${page}&page_size=20`
      )
      setAccessLogs(response.data)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch access logs'
      setLogsError(errorMessage)
    } finally {
      setIsLoadingLogs(false)
    }
  }, [])

  // Fetch access summary
  const fetchAccessSummary = useCallback(async () => {
    setIsLoadingLogs(true)
    setLogsError(null)
    try {
      const response = await apiClient.get<AccessSummary>('/privacy/access-logs/summary')
      setAccessSummary(response.data)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch access summary'
      setLogsError(errorMessage)
    } finally {
      setIsLoadingLogs(false)
    }
  }, [])

  // Export data
  const exportData = useCallback(async (): Promise<DataExportResponse | null> => {
    setIsExporting(true)
    try {
      const response = await apiClient.post<DataExportResponse>('/privacy/export', {
        user_id: '', // Will be filled by backend from auth
      })
      return response.data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to export data'
      setConsentError(errorMessage)
      return null
    } finally {
      setIsExporting(false)
    }
  }, [])

  // Clear errors
  const clearError = useCallback(() => {
    setConsentError(null)
    setDeletionError(null)
    setLogsError(null)
  }, [])

  // Combined loading state
  const isLoading = isLoadingConsent || isLoadingDeletion || isLoadingLogs

  // Combined error state (returns first error found)
  const error = consentError || deletionError || logsError

  return {
    // Consent management
    consentTypes,
    consentStatus,
    isLoadingConsent,
    consentError,
    fetchConsentTypes,
    fetchConsentStatus,
    grantConsents,
    updateConsent,

    // Deletion requests
    deletionRequests,
    isLoadingDeletion,
    deletionError,
    fetchDeletionRequests,
    createDeletionRequest,
    cancelDeletionRequest,

    // Access logs
    accessLogs,
    accessSummary,
    isLoadingLogs,
    logsError,
    fetchAccessLogs,
    fetchAccessSummary,

    // Data export
    exportData,
    isExporting,

    // General
    isLoading,
    error,
    clearError,
  }
}

export default usePrivacy
