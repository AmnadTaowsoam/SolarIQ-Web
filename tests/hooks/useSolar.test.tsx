import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode } from 'react'
import { useSolarAnalysis, useDashboardStats, useRecentLeads } from '@/hooks/useSolar'
import { api } from '@/lib/api'

jest.mock('@/lib/api', () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
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

  it('submits solar analysis request', async () => {
    const mockResult = {
      coordinates: { latitude: 13.7563, longitude: 100.5018 },
      address: 'Bangkok',
      solarPotential: { maxSunshineHoursPerYear: 1800, carbonOffsetFactorKgPerMwh: 500 },
      panelConfig: { panelsCount: 12, capacityKw: 5, yearlyEnergyDcKwh: 7200 },
      financialAnalysis: {
        monthlySavings: 2000,
        yearlySavings: 24000,
        paybackYears: 7,
        roi25Year: 300,
        installationCost: 200000,
        netCost: 180000,
      },
      electricityRate: 4.5,
    }
    mockApi.post.mockResolvedValueOnce(mockResult)

    const { result } = renderHook(() => useSolarAnalysis(), { wrapper: createWrapper() })

    result.current.mutate({ latitude: 13.7563, longitude: 100.5018, monthlyBill: 3000 })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(mockResult)
    expect(mockApi.post).toHaveBeenCalledWith('/api/v1/solar/analyze', {
      latitude: 13.7563,
      longitude: 100.5018,
      monthlyBill: 3000,
    })
  })

  it('handles analysis error', async () => {
    mockApi.post.mockRejectedValueOnce(new Error('API error'))

    const { result } = renderHook(() => useSolarAnalysis(), { wrapper: createWrapper() })

    result.current.mutate({ latitude: 0, longitude: 0, monthlyBill: 0 })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})

describe('useDashboardStats', () => {
  beforeEach(() => jest.clearAllMocks())

  it('fetches dashboard stats', async () => {
    const mockStats = {
      success: true,
      data: { totalLeads: 50, newLeads: 10, conversionRate: 0.3, revenue: 500000 },
    }
    mockApi.get.mockResolvedValueOnce(mockStats)

    const { result } = renderHook(() => useDashboardStats(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(mockStats)
  })
})

describe('useRecentLeads', () => {
  beforeEach(() => jest.clearAllMocks())

  it('fetches recent leads with default limit', async () => {
    const mockLeads = [{ id: '1', name: 'Lead 1' }]
    mockApi.get.mockResolvedValueOnce(mockLeads)

    const { result } = renderHook(() => useRecentLeads(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mockApi.get).toHaveBeenCalledWith('/api/v1/dashboard/recent-leads', { limit: 5 })
  })

  it('fetches recent leads with custom limit', async () => {
    mockApi.get.mockResolvedValueOnce([])

    const { result } = renderHook(() => useRecentLeads(10), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mockApi.get).toHaveBeenCalledWith('/api/v1/dashboard/recent-leads', { limit: 10 })
  })
})
