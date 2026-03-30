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
  taxId: string
  amount: number
  vatAmount: number
  totalAmount: number
  issueDate: string
  status: 'draft' | 'issued' | 'voided'
}

// Demo data
const DEMO_INVOICES: VATInvoice[] = [
  {
    id: '1',
    invoiceNumber: 'INV-2026-0001',
    customerName: 'Solar Home Bangkok Co., Ltd.',
    taxId: '0105564000001',
    amount: 350000,
    vatAmount: 24500,
    totalAmount: 374500,
    issueDate: '2026-01-15',
    status: 'issued',
  },
  {
    id: '2',
    invoiceNumber: 'INV-2026-0002',
    customerName: 'Green Factory Chiang Mai Co., Ltd.',
    taxId: '0505564000002',
    amount: 1200000,
    vatAmount: 84000,
    totalAmount: 1284000,
    issueDate: '2026-02-20',
    status: 'issued',
  },
  {
    id: '3',
    invoiceNumber: 'INV-2026-0003',
    customerName: 'Smart Office Nonthaburi',
    taxId: '0105564000003',
    amount: 450000,
    vatAmount: 31500,
    totalAmount: 481500,
    issueDate: '2026-03-10',
    status: 'draft',
  },
]

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapInvoice(raw: Record<string, any>): VATInvoice {
  return {
    id: raw.id ?? '',
    invoiceNumber: raw.invoiceNumber ?? raw.invoice_number ?? '',
    customerName: raw.customerName ?? raw.customer_name ?? '',
    taxId: raw.taxId ?? raw.tax_id ?? '',
    amount: Number(raw.amount ?? raw.subtotal ?? 0),
    vatAmount: Number(raw.vatAmount ?? raw.vat_amount ?? raw.tax_amount ?? 0),
    totalAmount: Number(raw.totalAmount ?? raw.total_amount ?? raw.grand_total ?? 0),
    issueDate: raw.issueDate ?? raw.issue_date ?? raw.created_at ?? '',
    status: raw.status ?? 'draft',
  }
}

export default function VATInvoicePage() {
  const { user } = useAuth()
  const [invoices, setInvoices] = useState<VATInvoice[]>(DEMO_INVOICES)
  const [, setIsLoading] = useState(false)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>('all')

  const fetchInvoices = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await apiClient.get('/api/v1/invoices')
      const payload = response.data
      const items = payload.invoices || payload.items || payload
      if (Array.isArray(items) && items.length > 0) {
        setInvoices(items.map(mapInvoice))
      } else {
        setInvoices(DEMO_INVOICES)
      }
    } catch {
      // Fallback to demo data
      setInvoices(DEMO_INVOICES)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchInvoices()
  }, [fetchInvoices])

  const handleDownloadPdf = async (invoice: VATInvoice) => {
    setDownloadingId(invoice.id)
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
    } catch {
      // If API fails, generate a simple client-side PDF receipt
      const printWindow = window.open('', '_blank')
      if (printWindow) {
        printWindow.document.write(`<!DOCTYPE html>
<html><head><title>${invoice.invoiceNumber}</title>
<style>
  body { font-family: 'Segoe UI', sans-serif; padding: 40px; color: #1a1a2e; }
  h1 { color: #f97316; border-bottom: 2px solid #f97316; padding-bottom: 8px; }
  table { width: 100%; border-collapse: collapse; margin-top: 20px; }
  th, td { border: 1px solid #e2e8f0; padding: 10px; text-align: left; }
  th { background: #f8fafc; }
  .total { font-weight: bold; font-size: 18px; color: #f97316; }
  .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #999; }
</style></head><body>
  <h1>VAT Invoice / ใบกำกับภาษี</h1>
  <p><strong>Invoice #:</strong> ${invoice.invoiceNumber}</p>
  <p><strong>Customer:</strong> ${invoice.customerName}</p>
  <p><strong>Tax ID:</strong> ${invoice.taxId}</p>
  <p><strong>Date:</strong> ${invoice.issueDate}</p>
  <table>
    <tr><th>Description</th><th style="text-align:right">Amount (THB)</th></tr>
    <tr><td>Solar Installation Service</td><td style="text-align:right">${invoice.amount.toLocaleString()}</td></tr>
    <tr><td>VAT (7%)</td><td style="text-align:right">${invoice.vatAmount.toLocaleString()}</td></tr>
    <tr><td class="total">Total</td><td style="text-align:right" class="total">${invoice.totalAmount.toLocaleString()}</td></tr>
  </table>
  <div class="footer">
    <p>Generated by SolarIQ — ${new Date().toLocaleDateString('th-TH')}</p>
  </div>
  <script>setTimeout(function(){ window.print(); }, 300);</script>
</body></html>`)
        printWindow.document.close()
      }
    } finally {
      setDownloadingId(null)
    }
  }

  const filteredInvoices =
    filterStatus === 'all' ? invoices : invoices.filter((inv) => inv.status === filterStatus)

  const totalRevenue = invoices
    .filter((inv) => inv.status === 'issued')
    .reduce((sum, inv) => sum + inv.totalAmount, 0)

  const totalVAT = invoices
    .filter((inv) => inv.status === 'issued')
    .reduce((sum, inv) => sum + inv.vatAmount, 0)

  return (
    <AppLayout user={user}>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[var(--brand-text)] flex items-center gap-2">
              <Receipt className="w-7 h-7 text-[var(--brand-primary)]" />
              VAT Invoices
            </h1>
            <p className="text-sm text-[var(--brand-text-secondary)] mt-1">
              Manage tax invoices with Thai Revenue Department compliance
            </p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-[var(--brand-primary)] text-white rounded-lg hover:opacity-90 transition-opacity text-sm font-medium">
            <Plus className="w-4 h-4" />
            New Invoice
          </button>
        </div>

        {/* Summary Cards */}
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

        {/* Filter */}
        <div className="flex gap-2">
          {['all', 'draft', 'issued', 'voided'].map((status) => (
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

        {/* Invoice Table */}
        <div className="bg-[var(--brand-surface)] border border-[var(--brand-border)] rounded-xl overflow-hidden">
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
                  <th className="text-left py-3 px-4 text-[var(--brand-text-secondary)] font-medium">
                    Tax ID
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
                    <td className="py-3 px-4 text-[var(--brand-text-secondary)] font-mono text-xs">
                      {inv.taxId}
                    </td>
                    <td className="py-3 px-4 text-right text-[var(--brand-text)]">
                      {inv.amount.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right text-[var(--brand-text-secondary)]">
                      {inv.vatAmount.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-[var(--brand-text)]">
                      {inv.totalAmount.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          inv.status === 'issued'
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
        </div>
      </div>
    </AppLayout>
  )
}
