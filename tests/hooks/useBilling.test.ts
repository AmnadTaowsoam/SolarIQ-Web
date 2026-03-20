import { renderHook, waitFor, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode } from 'react'
import {
  usePlans,
  useSubscription,
  useSubscribe,
  useCancelSubscription,
  useInvoices,
  useUsage,
} from '@/hooks/useBilling'
import type {
  PlanList,
  SubscriptionWithPlan,
  Subscription,
  InvoiceListResponse,
  UsageResponse,
} from '@/types/billing'

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

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

// ============== usePlans ==============

describe('usePlans', () => {
  beforeEach(() => jest.clearAllMocks())

  it('returns plan list on success', async () => {
    const mockPlans: PlanList = {
      plans: [
        {
          id: 'starter',
          name: 'Starter',
          price_thb: 2900,
          leads_per_month: 20,
          users: 1,
          features: [{ name: 'AI Analysis', included: true }],
        },
        {
          id: 'pro',
          name: 'Pro',
          price_thb: 7900,
          leads_per_month: 100,
          users: 5,
          features: [{ name: 'AI Analysis', included: true }],
        },
        {
          id: 'enterprise',
          name: 'Enterprise',
          price_thb: 15000,
          leads_per_month: null,
          users: null,
          features: [{ name: 'AI Analysis', included: true }],
        },
      ],
    }

    mockApiClient.get.mockResolvedValueOnce({ data: mockPlans })

    const { result } = renderHook(() => usePlans(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(mockPlans)
    expect(mockApiClient.get).toHaveBeenCalledWith('/billing/plans')
  })

  it('handles API error', async () => {
    mockApiClient.get.mockRejectedValueOnce(new Error('Network error'))

    const { result } = renderHook(() => usePlans(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.error).toBeDefined()
  })
})

// ============== useSubscription ==============

describe('useSubscription', () => {
  beforeEach(() => jest.clearAllMocks())

  it('returns current subscription', async () => {
    const mockSubscription: SubscriptionWithPlan = {
      id: 'sub-1',
      organization_id: 'org-1',
      plan_id: 'pro',
      status: 'active',
      payment_provider: 'stripe',
      current_period_start: '2024-01-01T00:00:00Z',
      current_period_end: '2024-02-01T00:00:00Z',
      cancel_at_period_end: false,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
      plan: {
        id: 'pro',
        name: 'Pro',
        price_thb: 7900,
        leads_per_month: 100,
        users: 5,
        features: [],
      },
      days_until_period_end: 15,
    }

    mockApiClient.get.mockResolvedValueOnce({ data: mockSubscription })

    const { result } = renderHook(() => useSubscription(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(mockSubscription)
    expect(mockApiClient.get).toHaveBeenCalledWith('/billing/subscription')
  })

  it('returns null when no subscription', async () => {
    mockApiClient.get.mockResolvedValueOnce({ data: null })

    const { result } = renderHook(() => useSubscription(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toBeNull()
  })
})

// ============== useSubscribe ==============

describe('useSubscribe', () => {
  beforeEach(() => jest.clearAllMocks())

  it('calls POST /billing/subscribe with plan data', async () => {
    const mockResponse: Subscription = {
      id: 'sub-new',
      organization_id: 'org-1',
      plan_id: 'pro',
      status: 'active',
      payment_provider: 'stripe',
      current_period_start: '2024-01-01T00:00:00Z',
      current_period_end: '2024-02-01T00:00:00Z',
      cancel_at_period_end: false,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    }

    mockApiClient.post.mockResolvedValueOnce({ data: mockResponse })

    const { result } = renderHook(() => useSubscribe(), { wrapper: createWrapper() })

    act(() => {
      result.current.mutate({ plan_id: 'pro', payment_method_id: 'pm_123' })
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mockApiClient.post).toHaveBeenCalledWith('/billing/subscribe', {
      plan_id: 'pro',
      payment_method_id: 'pm_123',
    })
  })

  it('handles subscription error', async () => {
    mockApiClient.post.mockRejectedValueOnce(new Error('Payment failed'))

    const { result } = renderHook(() => useSubscribe(), { wrapper: createWrapper() })

    act(() => {
      result.current.mutate({ plan_id: 'pro' })
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.error).toBeDefined()
  })
})

// ============== useCancelSubscription ==============

describe('useCancelSubscription', () => {
  beforeEach(() => jest.clearAllMocks())

  it('calls cancel endpoint', async () => {
    const mockResponse: Subscription = {
      id: 'sub-1',
      organization_id: 'org-1',
      plan_id: 'pro',
      status: 'canceled',
      payment_provider: 'stripe',
      current_period_start: '2024-01-01T00:00:00Z',
      current_period_end: '2024-02-01T00:00:00Z',
      cancel_at_period_end: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-15T00:00:00Z',
    }

    mockApiClient.post.mockResolvedValueOnce({ data: mockResponse })

    const { result } = renderHook(() => useCancelSubscription(), { wrapper: createWrapper() })

    act(() => {
      result.current.mutate({ reason: 'Too expensive' })
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mockApiClient.post).toHaveBeenCalledWith('/billing/subscription/cancel', {
      reason: 'Too expensive',
    })
  })

  it('calls cancel without reason', async () => {
    mockApiClient.post.mockResolvedValueOnce({ data: {} })

    const { result } = renderHook(() => useCancelSubscription(), { wrapper: createWrapper() })

    act(() => {
      result.current.mutate()
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mockApiClient.post).toHaveBeenCalledWith('/billing/subscription/cancel', {})
  })
})

// ============== useInvoices ==============

describe('useInvoices', () => {
  beforeEach(() => jest.clearAllMocks())

  it('returns invoice list', async () => {
    const mockInvoices: InvoiceListResponse = {
      invoices: [
        {
          id: 'inv-1',
          organization_id: 'org-1',
          amount_thb: 7900,
          status: 'paid',
          invoice_number: 'INV-2024-001',
          invoice_pdf_url: 'https://example.com/inv-1.pdf',
          created_at: '2024-01-01T00:00:00Z',
        },
        {
          id: 'inv-2',
          organization_id: 'org-1',
          amount_thb: 7900,
          status: 'open',
          invoice_number: 'INV-2024-002',
          created_at: '2024-02-01T00:00:00Z',
        },
      ],
      total: 2,
      page: 1,
      page_size: 10,
    }

    mockApiClient.get.mockResolvedValueOnce({ data: mockInvoices })

    const { result } = renderHook(() => useInvoices(1, 10), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(mockInvoices)
    expect(mockApiClient.get).toHaveBeenCalledWith('/billing/invoices', {
      params: { page: 1, page_size: 10 },
    })
  })

  it('handles pagination params', async () => {
    mockApiClient.get.mockResolvedValueOnce({
      data: { invoices: [], total: 0, page: 3, page_size: 5 },
    })

    const { result } = renderHook(() => useInvoices(3, 5), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mockApiClient.get).toHaveBeenCalledWith('/billing/invoices', {
      params: { page: 3, page_size: 5 },
    })
  })
})

// ============== useUsage ==============

describe('useUsage', () => {
  beforeEach(() => jest.clearAllMocks())

  it('returns usage data', async () => {
    const mockUsage: UsageResponse = {
      organization_id: 'org-1',
      plan_id: 'pro',
      period_start: '2024-01-01T00:00:00Z',
      period_end: '2024-02-01T00:00:00Z',
      usage: [
        { resource_type: 'lead_view', total_quantity: 45, limit: 100, percentage_used: 45 },
        { resource_type: 'ai_analysis', total_quantity: 12, limit: 50, percentage_used: 24 },
      ],
    }

    mockApiClient.get.mockResolvedValueOnce({ data: mockUsage })

    const { result } = renderHook(() => useUsage(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(mockUsage)
    expect(mockApiClient.get).toHaveBeenCalledWith('/billing/usage')
  })

  it('handles API error', async () => {
    mockApiClient.get.mockRejectedValueOnce(new Error('Server error'))

    const { result } = renderHook(() => useUsage(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.error).toBeDefined()
  })
})
