'use client'

/**
 * Invoice Table Component (WK-017)
 * Displays paginated invoice history with status badges and PDF download
 */

import React, { useState } from 'react'
import { Download, FileText, ChevronLeft, ChevronRight } from 'lucide-react'
import { useTranslations } from 'next-intl'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  EmptyState,
  TableSkeleton,
} from '@/components/ui/Table'
import { Badge, type BadgeProps } from '@/components/ui/Badge'
import { type Invoice, type InvoiceStatus, formatPrice } from '@/types/billing'
import { useInvoices } from '@/hooks/useBilling'

// ============== Props ==============

interface InvoiceTableProps {
  /** Pre-fetched invoices (if provided, internal pagination is disabled) */
  invoices?: Invoice[]
  /** Enable internal pagination with useInvoices hook */
  paginated?: boolean
  /** Page size for internal pagination */
  pageSize?: number
}

// ============== Helpers ==============

function getInvoiceStatusBadgeVariant(status: InvoiceStatus): BadgeProps['variant'] {
  switch (status) {
    case 'paid':
      return 'success'
    case 'open':
      return 'info'
    case 'void':
      return 'default'
    case 'draft':
      return 'warning'
    case 'uncollectible':
      return 'danger'
    default:
      return 'default'
  }
}

function getInvoiceStatusText(
  status: InvoiceStatus,
  t: ReturnType<typeof useTranslations>
): string {
  switch (status) {
    case 'paid':
      return t('statusPaid')
    case 'open':
      return t('statusOpen')
    case 'void':
      return t('statusVoid')
    case 'draft':
      return t('statusDraft')
    case 'uncollectible':
      return t('statusUncollectible')
    default:
      return status
  }
}

function formatDateThai(dateString: string): string {
  return new Date(dateString).toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

// ============== Component ==============

export function InvoiceTable({
  invoices: externalInvoices,
  paginated = false,
  pageSize = 10,
}: InvoiceTableProps) {
  const t = useTranslations('invoiceTable')
  const [page, setPage] = useState(1)

  // Use internal hook when paginated mode is enabled
  const { data: invoiceData, isLoading } = useInvoices(page, pageSize)

  // Decide data source
  const invoices = paginated ? (invoiceData?.invoices ?? []) : (externalInvoices ?? [])
  const total = paginated ? (invoiceData?.total ?? 0) : invoices.length
  const totalPages = paginated ? Math.ceil(total / pageSize) : 1

  if (paginated && isLoading) {
    return <TableSkeleton rows={5} columns={5} />
  }

  if (invoices.length === 0) {
    return (
      <EmptyState
        title={t('emptyTitle')}
        description={t('emptyDesc')}
        icon={<FileText className="w-12 h-12" />}
      />
    )
  }

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('invoiceNumber')}</TableHead>
            <TableHead>{t('issueDate')}</TableHead>
            <TableHead>{t('dueDate')}</TableHead>
            <TableHead>{t('amount')}</TableHead>
            <TableHead>{t('status')}</TableHead>
            <TableHead>{t('paymentMethod')}</TableHead>
            <TableHead>{t('download')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.map((invoice) => (
            <InvoiceRow key={invoice.id} invoice={invoice} />
          ))}
        </TableBody>
      </Table>

      {/* Pagination */}
      {paginated && totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-4 border-t border-[var(--brand-border)]">
          <p className="text-sm text-[var(--brand-text-secondary)]">
            {t('showing')} {(page - 1) * pageSize + 1} - {Math.min(page * pageSize, total)}{' '}
            {t('of')} {total} {t('items')}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-[var(--brand-text)] bg-[var(--brand-surface)] border border-[var(--brand-border)] rounded-lg hover:bg-[var(--brand-primary-light)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
              {t('previous')}
            </button>
            <span className="text-sm text-[var(--brand-text-secondary)]">
              {t('page')} {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-[var(--brand-text)] bg-[var(--brand-surface)] border border-[var(--brand-border)] rounded-lg hover:bg-[var(--brand-primary-light)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t('next')}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ============== Invoice Row ==============

interface InvoiceRowProps {
  invoice: Invoice
}

function InvoiceRow({ invoice }: InvoiceRowProps) {
  const t = useTranslations('invoiceTable')

  const getPaymentMethod = () => {
    if (!invoice.provider_invoice_id) {
      return '-'
    }
    // Extract last 4 digits of provider invoice ID
    const last4 = invoice.provider_invoice_id.slice(-4)
    return `Opn Payments (****${last4})`
  }

  const isOverdue =
    invoice.due_date && new Date(invoice.due_date) < new Date() && invoice.status !== 'paid'

  return (
    <TableRow className={isOverdue ? 'bg-red-500/10' : ''}>
      <TableCell>
        <div className="flex flex-col">
          <span className="font-mono text-sm font-medium">{invoice.invoice_number}</span>
          {invoice.description && (
            <span className="text-xs text-[var(--brand-text-secondary)] mt-0.5">
              {invoice.description}
            </span>
          )}
        </div>
      </TableCell>
      <TableCell>
        <div className="text-sm">{formatDateThai(invoice.created_at)}</div>
      </TableCell>
      <TableCell>
        <div className="text-sm">{invoice.due_date ? formatDateThai(invoice.due_date) : '-'}</div>
      </TableCell>
      <TableCell>
        <span className="font-semibold">{formatPrice(invoice.amount_thb)}</span>
      </TableCell>
      <TableCell>
        <Badge variant={getInvoiceStatusBadgeVariant(invoice.status)} size="sm">
          {getInvoiceStatusText(invoice.status, t)}
        </Badge>
        {isOverdue && <span className="text-xs text-red-600 mt-1 block">{t('overdue')}</span>}
      </TableCell>
      <TableCell>
        <div className="text-sm text-[var(--brand-text-secondary)]">{getPaymentMethod()}</div>
      </TableCell>
      <TableCell>
        {invoice.invoice_pdf_url ? (
          <a
            href={invoice.invoice_pdf_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-500 bg-blue-500/10 rounded-lg hover:bg-blue-500/20 transition-colors"
          >
            <Download className="w-4 h-4" />
            PDF
          </a>
        ) : invoice.status === 'paid' ? (
          <span className="text-xs text-[var(--brand-text-secondary)]">{t('processing')}</span>
        ) : (
          <span className="text-sm text-[var(--brand-text-secondary)]">-</span>
        )}
      </TableCell>
    </TableRow>
  )
}

export default InvoiceTable
