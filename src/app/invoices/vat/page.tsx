'use client'

/**
 * VAT Invoice Page (WK-103)
 * Tax invoice management with Thai tax compliance
 */

import { useState, useEffect, useCallback } from 'react'
import { AppLayout } from '@/components/layout'
import { useAuth } from '@/context'
import apiClient from '@/lib/api'
import { FileText, Download, Plus, Building2, Receipt, Loader2 } from 'lucide-react'

interface VATInvoice {
  id: string
  invoiceNumber: string
  customerName: string
  amount: number
  vatAmount: number
  totalAmount: number
  issueDate: string
  status: 'draft' | 'issued' | 'sent' | 'paid' | 'void'
}

function formatError(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message
  }
  return 'Unable to complete the invoice request right now.'
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapInvoice(raw: Record<string, any>): VATInvoice {
  const buyerInfo = raw.buyer_info || {}
  return {
    id: raw.id ?? '',
    invoiceNumber: raw.document_number ?? raw.invoice_number ?? raw.id ?? '',
    customerName:
      buyerInfo.name_th ??
      buyerInfo.name_en ??
      raw.customer_name ??
      raw.customerName ??
      'Unassigned customer',
    amount: Number(raw.subtotal ?? raw.amount ?? 0),
    vatAmount: Number(raw.vat_amount ?? raw.tax_amount ?? 0),
    totalAmount: Number(raw.total ?? raw.total_amount ?? 0),
    issueDate: raw.issued_at ?? raw.issue_date ?? raw.created_at ?? '',
    status: raw.status ?? 'draft',
  }
}

export default function VATInvoicePage() {
  const { user } = useAuth()
  const [invoices, setInvoices] = useState<VATInvoice[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [loadingError, setLoadingError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [showNewForm, setShowNewForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fetchInvoices = useCallback(async () => {
    setIsLoading(true)
    setLoadingError(null)
    try {
      const response = await apiClient.get('/api/v1/invoices', {
        params: { page: 1, page_size: 100 },
      })
      const items = Array.isArray(response.data?.items) ? response.data.items : []
      setInvoices(items.map(mapInvoice))
    } catch (error) {
      setInvoices([])
      setLoadingError(formatError(error))
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchInvoices()
  }, [fetchInvoices])

  const handleDownloadPdf = async (invoice: VATInvoice) => {
    setDownloadingId(invoice.id)
    setActionError(null)
    try {
      const response = await apiClient.get(`/api/v1/invoices/${invoice.id}/pdf`, {
        responseType: 'blob',
      })
      const blob = new Blob([response.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${invoice.invoiceNumber || 'invoice'}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      setActionError(formatError(error))
    } finally {
      setDownloadingId(null)
    }
  }

  const filteredInvoices =
    filterStatus === 'all' ? invoices : invoices.filter((inv) => inv.status === filterStatus)

  const totalRevenue = invoices
    .filter((inv) => inv.status === 'issued' || inv.status === 'paid' || inv.status === 'sent')
    .reduce((sum, inv) => sum + inv.totalAmount, 0)

  const totalVAT = invoices
    .filter((inv) => inv.status === 'issued' || inv.status === 'paid' || inv.status === 'sent')
    .reduce((sum, inv) => sum + inv.vatAmount, 0)

  if (!user) {
    return null
  }

  return (
    <AppLayout user={user}>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[var(--brand-text)] flex items-center gap-2">
              <Receipt className="w-7 h-7 text-[var(--brand-primary)]" />
              VAT Invoices
            </h1>
            <p className="text-sm text-[var(--brand-text-secondary)] mt-1">
              Manage tax invoices using the live `/api/v1/invoices` backend.
            </p>
          </div>
          <button
            onClick={() => {
              setActionError(null)
              setShowNewForm((prev) => !prev)
            }}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--brand-primary)] text-white rounded-lg hover:opacity-90 transition-opacity text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            New Invoice
          </button>
        </div>

        {(loadingError || actionError) && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {loadingError || actionError}
          </div>
        )}

        {showNewForm && (
          <form
            className="rounded-xl border border-orange-200 bg-orange-50 p-5"
            onSubmit={async (e) => {
              e.preventDefault()
              const form = e.target as HTMLFormElement
              const data = new FormData(form)
              const amount = Number(data.get('amount') || 0)
              const description = String(data.get('description') || '').trim()
              const dueDate = String(data.get('due_date') || '').trim()
              const notes = String(data.get('notes') || '').trim()

              if (!description || amount <= 0) {
                setActionError('Please provide a valid description and amount.')
                return
              }

              setIsSubmitting(true)
              setActionError(null)

              try {
                await apiClient.post('/api/v1/invoices', {
                  document_type: 'invoice',
                  due_date: dueDate ? new Date(dueDate).toISOString() : null,
                  notes: notes || null,
                  line_items: [
                    {
                      description,
                      quantity: 1,
                      unit_price: amount,
                      subtotal: amount,
                    },
                  ],
                })

                setShowNewForm(false)
                form.reset()
                await fetchInvoices()
              } catch (error) {
                setActionError(formatError(error))
              } finally {
                setIsSubmitting(false)
              }
            }}
          >
            <h3 className="mb-3 font-semibold text-[var(--brand-text)]">Create New Invoice</h3>
            <div className="grid gap-3 md:grid-cols-2">
              <input
                name="description"
                placeholder="Line item description *"
                required
                className="rounded-lg border px-3 py-2 text-sm"
              />
              <input
                name="amount"
                type="number"
                min="0"
                step="0.01"
                placeholder="Subtotal amount (THB) *"
                required
                className="rounded-lg border px-3 py-2 text-sm"
              />
              <input name="due_date" type="date" className="rounded-lg border px-3 py-2 text-sm" />
              <input
                name="notes"
                placeholder="Optional internal note"
                className="rounded-lg border px-3 py-2 text-sm"
              />
            </div>
            <div className="mt-3 flex gap-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-lg bg-[var(--brand-primary)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60"
              >
                {isSubmitting ? 'Creating...' : 'Create Invoice'}
              </button>
              <button
                type="button"
                onClick={() => setShowNewForm(false)}
                className="rounded-lg bg-gray-100 px-4 py-2 text-sm text-gray-600 hover:bg-gray-200"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-[var(--brand-surface)] border border-[var(--brand-border)] rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <FileText className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-xs text-[var(--brand-text-secondary)]">Total Invoices</p>
                <p className="text-xl font-bold text-[var(--brand-text)]">{invoices.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-[var(--brand-surface)] border border-[var(--brand-border)] rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-xs text-[var(--brand-text-secondary)]">Total Revenue</p>
                <p className="text-xl font-bold text-[var(--brand-text)]">
                  {totalRevenue.toLocaleString()} THB
                </p>
              </div>
            </div>
          </div>
          <div className="bg-[var(--brand-surface)] border border-[var(--brand-border)] rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                <Receipt className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <p className="text-xs text-[var(--brand-text-secondary)]">VAT Collected</p>
                <p className="text-xl font-bold text-[var(--brand-text)]">
                  {totalVAT.toLocaleString()} THB
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          {['all', 'draft', 'issued', 'sent', 'paid', 'void'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filterStatus === status
                  ? 'bg-[var(--brand-primary)] text-white'
                  : 'bg-[var(--brand-surface)] text-[var(--brand-text-secondary)] border border-[var(--brand-border)] hover:bg-[var(--brand-primary-light)]'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        <div className="bg-[var(--brand-surface)] border border-[var(--brand-border)] rounded-xl overflow-hidden">
          {isLoading ? (
            <div className="py-12 flex items-center justify-center">
              <Loader2 className="w-5 h-5 animate-spin text-[var(--brand-primary)]" />
            </div>
          ) : filteredInvoices.length === 0 ? (
            <div className="py-12 text-center text-sm text-[var(--brand-text-secondary)]">
              No VAT invoices are available for this account.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--brand-border)]">
                    <th className="text-left py-3 px-4 text-[var(--brand-text-secondary)] font-medium">
                      Invoice #
                    </th>
                    <th className="text-left py-3 px-4 text-[var(--brand-text-secondary)] font-medium">
                      Customer
                    </th>
                    <th className="text-right py-3 px-4 text-[var(--brand-text-secondary)] font-medium">
                      Amount
                    </th>
                    <th className="text-right py-3 px-4 text-[var(--brand-text-secondary)] font-medium">
                      VAT (7%)
                    </th>
                    <th className="text-right py-3 px-4 text-[var(--brand-text-secondary)] font-medium">
                      Total
                    </th>
                    <th className="text-center py-3 px-4 text-[var(--brand-text-secondary)] font-medium">
                      Issued
                    </th>
                    <th className="text-center py-3 px-4 text-[var(--brand-text-secondary)] font-medium">
                      Status
                    </th>
                    <th className="text-center py-3 px-4 text-[var(--brand-text-secondary)] font-medium">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInvoices.map((inv) => (
                    <tr
                      key={inv.id}
                      className="border-b border-[var(--brand-border)]/50 hover:bg-[var(--brand-primary-light)] transition-colors"
                    >
                      <td className="py-3 px-4 font-medium text-[var(--brand-primary)]">
                        {inv.invoiceNumber}
                      </td>
                      <td className="py-3 px-4 text-[var(--brand-text)]">{inv.customerName}</td>
                      <td className="py-3 px-4 text-right text-[var(--brand-text)]">
                        {inv.amount.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right text-[var(--brand-text-secondary)]">
                        {inv.vatAmount.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-[var(--brand-text)]">
                        {inv.totalAmount.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-center text-[var(--brand-text-secondary)]">
                        {inv.issueDate ? new Date(inv.issueDate).toLocaleDateString('th-TH') : '-'}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            inv.status === 'issued' ||
                            inv.status === 'paid' ||
                            inv.status === 'sent'
                              ? 'bg-green-500/10 text-green-600'
                              : inv.status === 'draft'
                                ? 'bg-gray-500/10 text-[var(--brand-text-secondary)]'
                                : 'bg-red-500/10 text-red-600'
                          }`}
                        >
                          {inv.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          className="p-1 hover:bg-[var(--brand-primary-light)] rounded transition-colors"
                          title="Download PDF"
                          onClick={() => handleDownloadPdf(inv)}
                          disabled={downloadingId === inv.id}
                        >
                          {downloadingId === inv.id ? (
                            <Loader2 className="w-4 h-4 text-[var(--brand-primary)] animate-spin" />
                          ) : (
                            <Download className="w-4 h-4 text-[var(--brand-text-secondary)]" />
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
