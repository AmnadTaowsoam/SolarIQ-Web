import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode } from 'react'
import {
  useInstallationCosts,
  useCreateInstallationCost,
  useDeleteInstallationCost,
  useElectricityRates,
  useCreateElectricityRate,
  useDeleteElectricityRate,
  useEquipmentPricing,
} from '@/hooks/usePricing'
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

describe('useInstallationCosts', () => {
  beforeEach(() => jest.clearAllMocks())

  it('fetches installation costs', async () => {
    const mockData = [{ id: '1', costPerKwp: 35000 }]
    mockApi.get.mockResolvedValueOnce(mockData)

    const { result } = renderHook(() => useInstallationCosts(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(mockData)
  })
})

describe('useCreateInstallationCost', () => {
  beforeEach(() => jest.clearAllMocks())

  it('creates a new installation cost', async () => {
    mockApi.post.mockResolvedValueOnce({ id: 'new-1', costPerKwp: 32000 })

    const { result } = renderHook(() => useCreateInstallationCost(), { wrapper: createWrapper() })

    result.current.mutate({ costPerKwp: 32000 })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mockApi.post).toHaveBeenCalledWith('/api/v1/pricing/installation-cost', { costPerKwp: 32000 })
  })
})

describe('useDeleteInstallationCost', () => {
  beforeEach(() => jest.clearAllMocks())

  it('deletes an installation cost', async () => {
    mockApi.delete.mockResolvedValueOnce({ success: true })

    const { result } = renderHook(() => useDeleteInstallationCost(), { wrapper: createWrapper() })

    result.current.mutate('cost-1')

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mockApi.delete).toHaveBeenCalledWith('/api/v1/pricing/installation-cost/cost-1')
  })
})

describe('useElectricityRates', () => {
  beforeEach(() => jest.clearAllMocks())

  it('fetches electricity rates', async () => {
    const mockData = [{ id: '1', provider: 'PEA', ratePerKwh: 4.15 }]
    mockApi.get.mockResolvedValueOnce(mockData)

    const { result } = renderHook(() => useElectricityRates(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(mockData)
  })
})

describe('useCreateElectricityRate', () => {
  beforeEach(() => jest.clearAllMocks())

  it('creates a new electricity rate', async () => {
    const newRate = { provider: 'MEA' as const, ratePerKwh: 4.2 }
    mockApi.post.mockResolvedValueOnce({ id: 'new-1', ...newRate })

    const { result } = renderHook(() => useCreateElectricityRate(), { wrapper: createWrapper() })

    result.current.mutate(newRate)

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
  })
})

describe('useDeleteElectricityRate', () => {
  beforeEach(() => jest.clearAllMocks())

  it('deletes an electricity rate', async () => {
    mockApi.delete.mockResolvedValueOnce({ success: true })

    const { result } = renderHook(() => useDeleteElectricityRate(), { wrapper: createWrapper() })

    result.current.mutate('rate-1')

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
  })
})

describe('useEquipmentPricing', () => {
  beforeEach(() => jest.clearAllMocks())

  it('fetches equipment pricing', async () => {
    const mockData = [{ id: '1', equipmentType: 'panel', brand: 'JA Solar' }]
    mockApi.get.mockResolvedValueOnce(mockData)

    const { result } = renderHook(() => useEquipmentPricing(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(mockData)
  })
})
