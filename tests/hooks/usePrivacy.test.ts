import { renderHook, waitFor, act } from '@testing-library/react'
import { usePrivacy } from '@/hooks/usePrivacy'
import { ConsentType, DeletionRequestType, DeletionRequestStatus } from '@/types/privacy'
import type {
  ConsentStatusResponse,
  ConsentTypesResponse,
  DeletionRequestResponse,
  DeletionRequestList,
  DataExportResponse,
} from '@/types/privacy'

jest.mock('@/lib/api', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}))

jest.mock('@/lib/firebase', () => ({
  auth: { currentUser: null },
}))

import { apiClient } from '@/lib/api'

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>

// ============== usePrivacy - Consent ==============

describe('usePrivacy - consent', () => {
  beforeEach(() => jest.clearAllMocks())

  it('fetchConsentStatus returns consent status', async () => {
    const mockStatus: ConsentStatusResponse = {
      user_id: 'user-1',
      consents: [
        {
          id: 'c-1',
          user_id: 'user-1',
          consent_type: ConsentType.DATA_COLLECTION,
          granted: true,
          ip_address: null,
          granted_at: '2024-01-01T00:00:00Z',
          revoked_at: null,
          is_active: true,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
      ],
      has_all_required: true,
      missing_required: [],
      can_use_service: true,
    }

    mockApiClient.get.mockResolvedValueOnce({ data: mockStatus })

    const { result } = renderHook(() => usePrivacy())

    await act(async () => {
      await result.current.fetchConsentStatus()
    })

    expect(result.current.consentStatus).toEqual(mockStatus)
    expect(mockApiClient.get).toHaveBeenCalledWith('/privacy/consent/status')
  })

  it('fetchConsentTypes returns consent types', async () => {
    const mockTypes: ConsentTypesResponse = {
      required: [
        { type: ConsentType.DATA_COLLECTION, description: 'Data collection', is_required: true },
        { type: ConsentType.BILL_ANALYSIS, description: 'Bill analysis', is_required: true },
      ],
      optional: [
        { type: ConsentType.MARKETING, description: 'Marketing', is_required: false },
      ],
    }

    mockApiClient.get.mockResolvedValueOnce({ data: mockTypes })

    const { result } = renderHook(() => usePrivacy())

    await act(async () => {
      await result.current.fetchConsentTypes()
    })

    expect(result.current.consentTypes).toEqual(mockTypes)
    expect(mockApiClient.get).toHaveBeenCalledWith('/privacy/consent-types')
  })

  it('grantConsents calls consent batch endpoint', async () => {
    mockApiClient.post.mockResolvedValueOnce({ data: {} })
    // fetchConsentStatus is called after granting
    mockApiClient.get.mockResolvedValueOnce({
      data: {
        user_id: 'user-1',
        consents: [],
        has_all_required: true,
        missing_required: [],
        can_use_service: true,
      },
    })

    const { result } = renderHook(() => usePrivacy())

    const consentData = {
      consents: [
        { consent_type: ConsentType.DATA_COLLECTION, granted: true },
        { consent_type: ConsentType.MARKETING, granted: false },
      ],
    }

    await act(async () => {
      await result.current.grantConsents(consentData)
    })

    expect(mockApiClient.post).toHaveBeenCalledWith('/privacy/consent/batch', consentData)
  })

  it('updateConsent calls PUT endpoint for single consent', async () => {
    mockApiClient.put.mockResolvedValueOnce({ data: {} })
    mockApiClient.get.mockResolvedValueOnce({
      data: {
        user_id: 'user-1',
        consents: [],
        has_all_required: true,
        missing_required: [],
        can_use_service: true,
      },
    })

    const { result } = renderHook(() => usePrivacy())

    await act(async () => {
      await result.current.updateConsent(ConsentType.MARKETING, false)
    })

    expect(mockApiClient.put).toHaveBeenCalledWith(
      `/privacy/consent/${ConsentType.MARKETING}`,
      { granted: false }
    )
  })

  it('sets consentError on fetch failure', async () => {
    mockApiClient.get.mockRejectedValueOnce(new Error('Network error'))

    const { result } = renderHook(() => usePrivacy())

    await act(async () => {
      await result.current.fetchConsentStatus()
    })

    expect(result.current.consentError).toBe('Network error')
  })
})

// ============== usePrivacy - Deletion Request ==============

describe('usePrivacy - deletion request', () => {
  beforeEach(() => jest.clearAllMocks())

  it('createDeletionRequest calls POST endpoint', async () => {
    const mockResponse: DeletionRequestResponse = {
      id: 'del-1',
      user_id: 'user-1',
      request_type: DeletionRequestType.FULL_DELETION,
      status: DeletionRequestStatus.PENDING,
      requested_at: '2024-01-15T00:00:00Z',
      completed_at: null,
      processed_by: null,
      notes: 'Please delete all data',
      rejection_reason: null,
      resources_deleted: null,
      created_at: '2024-01-15T00:00:00Z',
      updated_at: '2024-01-15T00:00:00Z',
    }

    mockApiClient.post.mockResolvedValueOnce({ data: mockResponse })
    // fetchDeletionRequests is called after creating
    mockApiClient.get.mockResolvedValueOnce({
      data: { requests: [mockResponse], total: 1, page: 1, page_size: 10 },
    })

    const { result } = renderHook(() => usePrivacy())

    let response: DeletionRequestResponse | undefined
    await act(async () => {
      response = await result.current.createDeletionRequest({
        request_type: DeletionRequestType.FULL_DELETION,
        notes: 'Please delete all data',
      })
    })

    expect(response).toEqual(mockResponse)
    expect(mockApiClient.post).toHaveBeenCalledWith('/privacy/deletion-request', {
      request_type: DeletionRequestType.FULL_DELETION,
      notes: 'Please delete all data',
    })
  })

  it('fetchDeletionRequests returns list', async () => {
    const mockList: DeletionRequestList = {
      requests: [],
      total: 0,
      page: 1,
      page_size: 10,
    }

    mockApiClient.get.mockResolvedValueOnce({ data: mockList })

    const { result } = renderHook(() => usePrivacy())

    await act(async () => {
      await result.current.fetchDeletionRequests()
    })

    expect(result.current.deletionRequests).toEqual(mockList)
    expect(mockApiClient.get).toHaveBeenCalledWith('/privacy/deletion-request?page=1&page_size=10')
  })

  it('cancelDeletionRequest calls DELETE endpoint', async () => {
    mockApiClient.delete.mockResolvedValueOnce({ data: {} })
    mockApiClient.get.mockResolvedValueOnce({
      data: { requests: [], total: 0, page: 1, page_size: 10 },
    })

    const { result } = renderHook(() => usePrivacy())

    await act(async () => {
      await result.current.cancelDeletionRequest('del-1')
    })

    expect(mockApiClient.delete).toHaveBeenCalledWith('/privacy/deletion-request/del-1')
  })
})

// ============== usePrivacy - Data Export ==============

describe('usePrivacy - data export', () => {
  beforeEach(() => jest.clearAllMocks())

  it('exportData calls export endpoint', async () => {
    const mockExport: DataExportResponse = {
      user_id: 'user-1',
      exported_at: '2024-01-15T00:00:00Z',
      resources_included: ['leads', 'bills', 'analyses'],
      download_url: 'https://example.com/export/user-1.zip',
      expires_at: '2024-01-16T00:00:00Z',
    }

    mockApiClient.post.mockResolvedValueOnce({ data: mockExport })

    const { result } = renderHook(() => usePrivacy())

    let response: DataExportResponse | null = null
    await act(async () => {
      response = await result.current.exportData()
    })

    expect(response).toEqual(mockExport)
    expect(mockApiClient.post).toHaveBeenCalledWith('/privacy/export', { user_id: '' })
  })

  it('returns null on export error', async () => {
    mockApiClient.post.mockRejectedValueOnce(new Error('Export failed'))

    const { result } = renderHook(() => usePrivacy())

    let response: DataExportResponse | null = null
    await act(async () => {
      response = await result.current.exportData()
    })

    expect(response).toBeNull()
  })
})

// ============== usePrivacy - General ==============

describe('usePrivacy - general', () => {
  beforeEach(() => jest.clearAllMocks())

  it('clearError clears all errors', async () => {
    mockApiClient.get.mockRejectedValueOnce(new Error('Error'))

    const { result } = renderHook(() => usePrivacy())

    await act(async () => {
      await result.current.fetchConsentStatus()
    })

    expect(result.current.error).toBe('Error')

    act(() => {
      result.current.clearError()
    })

    expect(result.current.error).toBeNull()
  })

  it('autoFetchConsentStatus fetches on mount when enabled', async () => {
    mockApiClient.get.mockResolvedValueOnce({
      data: {
        user_id: 'user-1',
        consents: [],
        has_all_required: false,
        missing_required: ['data_collection'],
        can_use_service: false,
      },
    })

    renderHook(() => usePrivacy({ autoFetchConsentStatus: true }))

    await waitFor(() => {
      expect(mockApiClient.get).toHaveBeenCalledWith('/privacy/consent/status')
    })
  })
})
