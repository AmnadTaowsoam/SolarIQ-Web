import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode } from 'react'
import {
  useSolarAnalysis,
  useDashboardStats,
  useLeadsOverTime,
  useTopLocations,
  useRecentLeads,
} from '@/hooks/useSolar'
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

describe('useSolarAnalysis', () => {
  beforeEach(() => jest.clearAllMocks())

  it('sends analysis request', async () => {
    const mockResult = {
      coordinates: { latitude: 13.75, longitude: 100.5 },
      address: 'Bangkok',
      panelConfig: { panelsCount: 10, capacityKw: 5 },
    }
    mockApi.post.mockResolvedValueOnce(mockResult)

    const { result } = renderHook(() => useSolarAnalysis(), { wrapper: createWrapper() })

    result.current.mutate({
      latitude: 13.75,
      longitude: 100.5,
      monthlyBill: 5000,
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mockApi.post).toHaveBeenCalledWith('/api/v1/solar/analyze', {
      latitude: 13.75,
      longitude: 100.5,
      monthlyBill: 5000,
    })
  })

  it('handles analysis error', async () => {
    mockApi.post.mockRejectedValueOnce(new Error('API error'))

    const { result } = renderHook(() => useSolarAnalysis(), { wrapper: createWrapper() })

    result.current.mutate({
      latitude: 13.75,
      longitude: 100.5,
      monthlyBill: 5000,
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})

describe('useDashboardStats', () => {
  beforeEach(() => jest.clearAllMocks())

  it('fetches dashboard stats', async () => {
    const mockStats = { data: { totalLeads: 100, newLeads: 20, conversionRate: 15.5, revenue: 500000 } }
    mockApi.get.mockResolvedValueOnce(mockStats)

    const { result } = renderHook(() => useDashboardStats(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(mockStats)
  })
})

describe('useLeadsOverTime', () => {
  beforeEach(() => jest.clearAllMocks())

  it('fetches leads over time data', async () => {
    const mockData = [{ date: '2024-01-01', count: 5 }]
    mockApi.get.mockResolvedValueOnce(mockData)

    const { result } = renderHook(() => useLeadsOverTime(30), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mockApi.get).toHaveBeenCalledWith('/api/v1/dashboard/leads-over-time', { days: 30 })
  })
})

describe('useTopLocations', () => {
  beforeEach(() => jest.clearAllMocks())

  it('fetches top locations', async () => {
    const mockData = [{ location: 'Bangkok', count: 50 }]
    mockApi.get.mockResolvedValueOnce(mockData)

    const { result } = renderHook(() => useTopLocations(5), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mockApi.get).toHaveBeenCalledWith('/api/v1/dashboard/top-locations', { limit: 5 })
  })
})

describe('useRecentLeads', () => {
  beforeEach(() => jest.clearAllMocks())

  it('fetches recent leads', async () => {
    const mockData = [{ id: '1', name: 'Lead 1' }]
    mockApi.get.mockResolvedValueOnce(mockData)

    const { result } = renderHook(() => useRecentLeads(3), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mockApi.get).toHaveBeenCalledWith('/api/v1/dashboard/recent-leads', { limit: 3 })
  })
})
