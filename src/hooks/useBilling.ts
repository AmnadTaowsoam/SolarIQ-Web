/**
 * Billing API hooks for SolarIQ-Web (WK-017)
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'

// Types
import type {
  PlanList,
  Subscription,
  SubscriptionWithPlan,
  InvoiceListResponse,
  UsageResponse,
  Organization,
  BillingStatus,
  PaymentSetupResponse,
  PlanType,
  OpnSourceType,
  CheckoutResponse,
} from '@/types/billing'

const BILLING_API_BASE = '/api/v1/billing'

// ============== Query Keys ==============

export const billingKeys = {
  all: ['billing'] as const,
  plans: () => [...billingKeys.all, 'plans'] as const,
  organization: () => [...billingKeys.all, 'organization'] as const,
  subscription: () => [...billingKeys.all, 'subscription'] as const,
  invoices: (page?: number) => [...billingKeys.all, 'invoices', page] as const,
  usage: () => [...billingKeys.all, 'usage'] as const,
  status: () => [...billingKeys.all, 'status'] as const,
}

// ============== Plan Hooks ==============

export function usePlans() {
  return useQuery({
    queryKey: billingKeys.plans(),
    queryFn: async (): Promise<PlanList> => {
      const response = await apiClient.get<PlanList>(`${BILLING_API_BASE}/plans`)
      return response.data
    },
    staleTime: 1000 * 60 * 60, // 1 hour - plans don't change often
  })
}

// ============== Organization Hooks ==============

export function useOrganization() {
  return useQuery({
    queryKey: billingKeys.organization(),
    queryFn: async (): Promise<Organization> => {
      const response = await apiClient.get<Organization>(`${BILLING_API_BASE}/organization`)
      return response.data
    },
  })
}

export function useCreateOrganization() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: {
      name: string
      tax_id?: string
      address?: string
      plan_id?: PlanType
    }): Promise<Organization> => {
      const response = await apiClient.post<Organization>(`${BILLING_API_BASE}/organization`, data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: billingKeys.organization() })
    },
  })
}

export function useUpdateOrganization() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: {
      name?: string
      tax_id?: string
      address?: string
    }): Promise<Organization> => {
      const response = await apiClient.patch<Organization>(`${BILLING_API_BASE}/organization`, data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: billingKeys.organization() })
    },
  })
}

// ============== Subscription Hooks ==============

export function useSubscription() {
  return useQuery({
    queryKey: billingKeys.subscription(),
    queryFn: async (): Promise<SubscriptionWithPlan | null> => {
      const response = await apiClient.get<SubscriptionWithPlan | null>(
        `${BILLING_API_BASE}/subscription`
      )
      return response.data
    },
  })
}

export function useSubscribe() {
  return useMutation({
    mutationFn: async (_data: {
      plan_id: PlanType
      payment_method_id?: string
      trial?: boolean
    }): Promise<Subscription> => {
      throw new Error(
        'Direct subscription creation is not available from this endpoint. Use checkout session flow instead.'
      )
    },
  })
}

export function useUpdateSubscription() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: { plan_id: PlanType }): Promise<Subscription> => {
      const response = await apiClient.patch<Subscription>(`${BILLING_API_BASE}/subscription`, data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: billingKeys.subscription() })
      queryClient.invalidateQueries({ queryKey: billingKeys.organization() })
    },
  })
}

export function useCancelSubscription() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data?: { reason?: string }): Promise<Subscription> => {
      const response = await apiClient.post<Subscription>(
        `${BILLING_API_BASE}/subscription/cancel`,
        data || {}
      )
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: billingKeys.subscription() })
    },
  })
}

export function useResumeSubscription() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (): Promise<Subscription> => {
      const response = await apiClient.post<Subscription>(
        `${BILLING_API_BASE}/subscription/resume`,
        {}
      )
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: billingKeys.subscription() })
    },
  })
}

// ============== Invoice Hooks ==============

export function useInvoices(page: number = 1, pageSize: number = 10) {
  return useQuery({
    queryKey: billingKeys.invoices(page),
    queryFn: async (): Promise<InvoiceListResponse> => {
      const response = await apiClient.get<InvoiceListResponse>(`${BILLING_API_BASE}/invoices`, {
        params: { page, page_size: pageSize },
      })
      return response.data
    },
  })
}

export function useInvoicePdf() {
  return useMutation({
    mutationFn: async (invoiceId: string): Promise<{ pdf_url: string }> => {
      const response = await apiClient.get<{ pdf_url: string }>(
        `${BILLING_API_BASE}/invoices/${invoiceId}/pdf`
      )
      return response.data
    },
  })
}

// ============== Usage Hooks ==============

export function useUsage() {
  return useQuery({
    queryKey: billingKeys.usage(),
    queryFn: async (): Promise<UsageResponse> => {
      const response = await apiClient.get<UsageResponse>(`${BILLING_API_BASE}/usage`)
      return response.data
    },
  })
}

export function useUsageHistory(limit: number = 6) {
  return useQuery({
    queryKey: [...billingKeys.usage(), 'history', limit],
    queryFn: async () => {
      const { data } = await apiClient.get('/api/v1/usage/history', {
        params: { limit },
      })
      return data
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// ============== Billing Status Hook ==============

export function useBillingStatus() {
  return useQuery({
    queryKey: billingKeys.status(),
    queryFn: async (): Promise<BillingStatus> => {
      const response = await apiClient.get<BillingStatus>(`${BILLING_API_BASE}/status`)
      return response.data
    },
  })
}

// ============== Opn Payment Hooks ==============

export function useCreateSetupIntent() {
  return useMutation({
    mutationFn: async (): Promise<PaymentSetupResponse> => {
      const response = await apiClient.post<PaymentSetupResponse>(
        `${BILLING_API_BASE}/setup-payment`,
        {}
      )
      return response.data
    },
  })
}

export function useCreateCheckoutSession() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: {
      plan_id: string
      billing_cycle: 'monthly' | 'annual'
      source_type: OpnSourceType
      return_uri: string
      promo_code?: string
    }): Promise<CheckoutResponse> => {
      const response = await apiClient.post<CheckoutResponse>(
        `${BILLING_API_BASE}/create-checkout-session`,
        data
      )
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: billingKeys.subscription() })
      queryClient.invalidateQueries({ queryKey: billingKeys.status() })
    },
  })
}

export function useCustomerPortal() {
  return useMutation({
    mutationFn: async (): Promise<never> => {
      throw new Error(
        'Customer portal is not available in this deployment. Use support or the billing settings page instead.'
      )
    },
  })
}

export function useConvertTrial() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      planId,
      paymentMethodId,
    }: {
      planId: string
      paymentMethodId: string
    }) => {
      const { data } = await apiClient.post(`${BILLING_API_BASE}/convert-trial`, null, {
        params: { plan_id: planId, payment_method_id: paymentMethodId },
      })
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: billingKeys.all })
    },
  })
}
