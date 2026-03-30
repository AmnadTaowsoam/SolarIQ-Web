/**
 * VAT Invoice API hooks for SolarIQ-Web (WK-103)
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'

// ============== Types ==============

export enum VATDocumentType {
  INVOICE = 'invoice',
  RECEIPT = 'receipt',
  CREDIT_NOTE = 'credit_note',
}

export enum VATDocumentStatus {
  DRAFT = 'draft',
  ISSUED = 'issued',
  SENT = 'sent',
  PAID = 'paid',
  VOID = 'void',
}

export interface VATInvoiceLineItem {
  description: string
  quantity: number
  unit_price: number
  subtotal: number
}

export interface VATSellerInfo {
  name_th?: string
  name_en?: string
  tax_id?: string
  address?: string
  phone?: string
  email?: string
}

export interface VATBuyerInfo {
  name_th?: string
  name_en?: string
  tax_id?: string
  branch_number?: string
  address?: string
  contact_person?: string
  email?: string
  phone?: string
}

export interface TaxProfile {
  company_name_th?: string
  company_name_en?: string
  tax_id?: string
  branch_number: string
  tax_address?: string
  tax_contact_person?: string
  tax_contact_email?: string
  tax_contact_phone?: string
}

export interface VATInvoice {
  id: string
  organization_id: string
  document_type: VATDocumentType
  document_number: string
  reference_invoice_id?: string
  subtotal: number
  vat_rate: number
  vat_amount: number
  total: number
  currency: string
  line_items: VATInvoiceLineItem[]
  seller_info: VATSellerInfo
  buyer_info: VATBuyerInfo
  status: VATDocumentStatus
  pdf_url?: string
  issued_at?: string
  due_date?: string
  paid_at?: string
  sent_at?: string
  email_sent_to?: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface VATInvoiceListResponse {
  items: VATInvoice[]
  total: number
  page: number
  page_size: number
}

export interface VATInvoiceCreate {
  document_type?: VATDocumentType
  line_items: VATInvoiceLineItem[]
  currency?: string
  notes?: string
  issued_at?: string
  due_date?: string
  reference_invoice_id?: string
}

export interface CreditNoteCreate {
  reference_invoice_id: string
  reason: string
  line_items: VATInvoiceLineItem[]
  notes?: string
}

export interface InvoiceEmailRequest {
  to_email?: string
  subject?: string
  message?: string
}

export interface MonthlyStatementRequest {
  month: number
  year: number
}

// ============== Query Keys ==============

export const vatInvoiceKeys = {
  all: ['vat_invoices'] as const,
  taxProfile: () => [...vatInvoiceKeys.all, 'tax_profile'] as const,
  invoices: (filters?: {
    document_type?: VATDocumentType
    status?: VATDocumentStatus
    page?: number
    page_size?: number
  }) => [...vatInvoiceKeys.all, 'invoices', filters] as const,
  invoice: (id: string) => [...vatInvoiceKeys.all, 'invoice', id] as const,
  monthlyStatement: (month: number, year: number) =>
    [...vatInvoiceKeys.all, 'statement', month, year] as const,
}

// ============== Tax Profile Hooks ==============

export function useTaxProfile() {
  return useQuery({
    queryKey: vatInvoiceKeys.taxProfile(),
    queryFn: async (): Promise<TaxProfile> => {
      const response = await apiClient.get<TaxProfile>('/invoices/tax-profile')
      return response.data
    },
  })
}

export function useUpdateTaxProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: Partial<TaxProfile>): Promise<TaxProfile> => {
      const response = await apiClient.patch<TaxProfile>('/invoices/tax-profile', data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vatInvoiceKeys.taxProfile() })
    },
  })
}

// ============== Invoice Hooks ==============

export function useVATInvoices(filters?: {
  document_type?: VATDocumentType
  status?: VATDocumentStatus
  page?: number
  page_size?: number
}) {
  return useQuery({
    queryKey: vatInvoiceKeys.invoices(filters),
    queryFn: async (): Promise<VATInvoiceListResponse> => {
      const response = await apiClient.get<VATInvoiceListResponse>('/invoices', {
        params: filters,
      })
      return response.data
    },
  })
}

export function useVATInvoice(id: string) {
  return useQuery({
    queryKey: vatInvoiceKeys.invoice(id),
    queryFn: async (): Promise<VATInvoice> => {
      const response = await apiClient.get<VATInvoice>(`/invoices/${id}`)
      return response.data
    },
    enabled: !!id,
  })
}

export function useCreateVATInvoice() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: VATInvoiceCreate): Promise<VATInvoice> => {
      const response = await apiClient.post<VATInvoice>('/invoices', data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vatInvoiceKeys.all })
    },
  })
}

export function useVATInvoicePdf() {
  return useMutation({
    mutationFn: async (invoiceId: string): Promise<{ pdf_url: string }> => {
      const response = await apiClient.get<{ pdf_url: string }>(`/invoices/${invoiceId}/pdf`)
      return response.data
    },
  })
}

export function useSendVATInvoiceEmail() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      invoiceId,
      data,
    }: {
      invoiceId: string
      data?: InvoiceEmailRequest
    }): Promise<{ message: string }> => {
      const response = await apiClient.post<{ message: string }>(
        `/invoices/${invoiceId}/send`,
        data || {}
      )
      return response.data
    },
    onSuccess: (_, { invoiceId }) => {
      queryClient.invalidateQueries({ queryKey: vatInvoiceKeys.invoice(invoiceId) })
      queryClient.invalidateQueries({ queryKey: vatInvoiceKeys.all })
    },
  })
}

export function useMarkVATInvoicePaid() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (invoiceId: string): Promise<VATInvoice> => {
      const response = await apiClient.post<VATInvoice>(`/invoices/${invoiceId}/mark-paid`)
      return response.data
    },
    onSuccess: (_, invoiceId) => {
      queryClient.invalidateQueries({ queryKey: vatInvoiceKeys.invoice(invoiceId) })
      queryClient.invalidateQueries({ queryKey: vatInvoiceKeys.all })
    },
  })
}

export function useVoidVATInvoice() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      invoiceId,
      reason,
    }: {
      invoiceId: string
      reason: string
    }): Promise<VATInvoice> => {
      const response = await apiClient.post<VATInvoice>(`/invoices/${invoiceId}/void`, null, {
        params: { reason },
      })
      return response.data
    },
    onSuccess: (_, { invoiceId }) => {
      queryClient.invalidateQueries({ queryKey: vatInvoiceKeys.invoice(invoiceId) })
      queryClient.invalidateQueries({ queryKey: vatInvoiceKeys.all })
    },
  })
}

// ============== Credit Note Hooks ==============

export function useCreateCreditNote() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreditNoteCreate): Promise<VATInvoice> => {
      const response = await apiClient.post<VATInvoice>('/invoices/credit-notes', data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vatInvoiceKeys.all })
    },
  })
}

// ============== Monthly Statement Hooks ==============

export function useGenerateMonthlyStatement() {
  return useMutation({
    mutationFn: async (data: MonthlyStatementRequest): Promise<unknown> => {
      const response = await apiClient.post<unknown>('/invoices/statements/monthly', data)
      return response.data
    },
  })
}
