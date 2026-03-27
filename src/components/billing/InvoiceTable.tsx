'use client'

/**
 * Invoice Table Component (WK-017)
 * Displays paginated invoice history with status badges and PDF download
 */

import React, { useState } from 'react'
import { Download, FileText, ChevronLeft, ChevronRight } from 'lucide-react'
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

function getInvoiceStatusText(status: InvoiceStatus): string {
  switch (status) {
    case 'paid':
      return 'ชำระแล้ว'
    case 'open':
      return 'รอชำระ'
    case 'void':
      return 'ยกเลิก'
    case 'draft':
      return 'แบบร่าง'
    case 'uncollectible':
      return 'เก็บเงินไม่ได้'
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
        title="ยังไม่มีใบแจ้งหนี้"
        description="ใบแจ้งหนี้จะปรากฏที่นี่เมื่อมีการเรียกเก็บเงิน"
        icon={<FileText className="w-12 h-12" />}
      />
    )
  }

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>เลขที่ใบแจ้งหนี้</TableHead>
            <TableHead>วันที่ออก</TableHead>
            <TableHead>วันครบกำหนด</TableHead>
            <TableHead>จำนวนเงิน (THB)</TableHead>
            <TableHead>สถานะ</TableHead>
            <TableHead>วิธีชำระเงิน</TableHead>
            <TableHead>ดาวน์โหลด</TableHead>
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
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            แสดง {(page - 1) * pageSize + 1} - {Math.min(page * pageSize, total)} จากทั้งหมด {total}{' '}
            รายการ
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
              ก่อนหน้า
            </button>
            <span className="text-sm text-gray-600">
              หน้า {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ถัดไป
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
    <TableRow className={isOverdue ? 'bg-red-50' : ''}>
      <TableCell>
        <div className="flex flex-col">
          <span className="font-mono text-sm font-medium">{invoice.invoice_number}</span>
          {invoice.description && (
            <span className="text-xs text-gray-500 mt-0.5">{invoice.description}</span>
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
          {getInvoiceStatusText(invoice.status)}
        </Badge>
        {isOverdue && <span className="text-xs text-red-600 mt-1 block">Overdue</span>}
      </TableCell>
      <TableCell>
        <div className="text-sm text-gray-600">{getPaymentMethod()}</div>
      </TableCell>
      <TableCell>
        {invoice.invoice_pdf_url ? (
          <a
            href={invoice.invoice_pdf_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <Download className="w-4 h-4" />
            PDF
          </a>
        ) : invoice.status === 'paid' ? (
          <span className="text-xs text-gray-400">Processing...</span>
        ) : (
          <span className="text-sm text-gray-400">-</span>
        )}
      </TableCell>
    </TableRow>
  )
}

export default InvoiceTable
