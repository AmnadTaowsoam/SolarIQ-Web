import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode } from 'react'
import { useLeads, useUpdateLeadStatus, useCreateLead, useDeleteLead } from '@/hooks/useLeads'
import { api } from '@/lib/api'

jest.mock('@/lib/api', () => ({
  api: {
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

const mockApi = api as jest.Mocked<typeof api>

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

describe('useLeads', () => {
  beforeEach(() => jest.clearAllMocks())

  it('fetches leads with default params', async () => {
    const mockData = { items: [], total: 0, page: 1, pageSize: 10, totalPages: 0 }
    mockApi.get.mockResolvedValueOnce(mockData)

    const { result } = renderHook(() => useLeads(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(mockData)
    expect(mockApi.get).toHaveBeenCalledWith('/api/v1/leads', { page: 1, pageSize: 10 })
  })

  it('fetches leads with custom filters', async () => {
    const mockData = { items: [], total: 0, page: 2, pageSize: 5, totalPages: 0 }
    mockApi.get.mockResolvedValueOnce(mockData)

    const { result } = renderHook(
      () => useLeads({ page: 2, pageSize: 5, filters: { status: 'new' } }),
      { wrapper: createWrapper() }
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mockApi.get).toHaveBeenCalledWith('/api/v1/leads', { page: 2, pageSize: 5, status: 'new' })
  })

  it('handles API error', async () => {
    mockApi.get.mockRejectedValueOnce(new Error('Network error'))

    const { result } = renderHook(() => useLeads(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.error).toBeDefined()
  })
})

describe('useUpdateLeadStatus', () => {
  beforeEach(() => jest.clearAllMocks())

  it('updates lead status', async () => {
    mockApi.patch.mockResolvedValueOnce({ success: true })

    const { result } = renderHook(() => useUpdateLeadStatus(), { wrapper: createWrapper() })

    result.current.mutate({ id: 'lead-1', status: 'contacted' })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mockApi.patch).toHaveBeenCalledWith('/api/v1/leads/lead-1/status', { status: 'contacted' })
  })
})

describe('useCreateLead', () => {
  beforeEach(() => jest.clearAllMocks())

  it('creates a new lead', async () => {
    const newLead = { name: 'Test', phone: '081-123-4567', address: 'Bangkok' }
    mockApi.post.mockResolvedValueOnce({ ...newLead, id: 'new-1' })

    const { result } = renderHook(() => useCreateLead(), { wrapper: createWrapper() })

    result.current.mutate(newLead)

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mockApi.post).toHaveBeenCalledWith('/api/v1/leads', newLead)
  })
})

describe('useDeleteLead', () => {
  beforeEach(() => jest.clearAllMocks())

  it('deletes a lead', async () => {
    mockApi.delete.mockResolvedValueOnce({ success: true })

    const { result } = renderHook(() => useDeleteLead(), { wrapper: createWrapper() })

    result.current.mutate('lead-1')

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mockApi.delete).toHaveBeenCalledWith('/api/v1/leads/lead-1')
  })
})
