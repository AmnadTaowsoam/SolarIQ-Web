'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { AppLayout } from '@/components/layout'
import { Card, CardBody, CardHeader, Badge, Button } from '@/components/ui'
import { useVATInvoices, VATDocumentStatus, VATDocumentType } from '@/hooks/useVATInvoices'
import { formatThb } from '@/lib/utils'

const statusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-600',
  issued: 'bg-blue-100 text-blue-800',
  sent: 'bg-purple-100 text-purple-800',
  paid: 'bg-green-100 text-green-800',
  void: 'bg-gray-100 text-gray-600',
}

const typeLabels: Record<string, string> = {
  invoice: 'Invoice',
  receipt: 'Receipt',
  credit_note: 'Credit Note',
}

const statusLabels: Record<string, string> = {
  draft: 'Draft',
  issued: 'Issued',
  sent: 'Sent',
  paid: 'Paid',
  void: 'Void',
}

export default function InvoicesPage() {
  const t = useTranslations('invoicesPage')
  const [page, setPage] = useState(1)
  const [documentType, setDocumentType] = useState<VATDocumentType | undefined>()
  const [status, setStatus] = useState<VATDocumentStatus | undefined>()

  const { data, isLoading } = useVATInvoices({
    document_type: documentType,
    status,
    page,
    page_size: 20,
  })

  const invoices = data?.items || []
  const total = data?.total || 0

  const handleFilterChange = (newType: VATDocumentType | undefined) => {
    setDocumentType(newType)
    setPage(1)
  }

  const handleStatusChange = (newStatus: VATDocumentStatus | undefined) => {
    setStatus(newStatus)
    setPage(1)
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
            <p className="text-sm text-gray-500 mt-1">{t('subtitle')}</p>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardBody className="p-4">
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">{t('filterStatus')}:</label>
                <select
                  value={documentType || ''}
                  onChange={(e) =>
                    handleFilterChange(e.target.value as VATDocumentType | undefined)
                  }
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">{t('allStatuses')}</option>
                  <option value={VATDocumentType.INVOICE}>{typeLabels.invoice}</option>
                  <option value={VATDocumentType.RECEIPT}>{typeLabels.receipt}</option>
                  <option value={VATDocumentType.CREDIT_NOTE}>{typeLabels.credit_note}</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">{t('status')}:</label>
                <select
                  value={status || ''}
                  onChange={(e) =>
                    handleStatusChange(e.target.value as VATDocumentStatus | undefined)
                  }
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">{t('allStatuses')}</option>
                  <option value={VATDocumentStatus.DRAFT}>{statusLabels.draft}</option>
                  <option value={VATDocumentStatus.ISSUED}>{statusLabels.issued}</option>
                  <option value={VATDocumentStatus.SENT}>{statusLabels.sent}</option>
                  <option value={VATDocumentStatus.PAID}>{statusLabels.paid}</option>
                  <option value={VATDocumentStatus.VOID}>{statusLabels.void}</option>
                </select>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Invoices Table */}
        <Card>
          <CardHeader title={t('history.title')} subtitle={`${t('history.subtitle')} (${total})`} />
          <CardBody className="p-0">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-100 text-left text-xs text-gray-500">
                    <th className="px-6 py-3">{t('table.documentNumber')}</th>
                    <th className="px-6 py-3">{t('table.documentType')}</th>
                    <th className="px-6 py-3">{t('table.issuedDate')}</th>
                    <th className="px-6 py-3">{t('table.total')}</th>
                    <th className="px-6 py-3">{t('table.status')}</th>
                    <th className="px-6 py-3">{t('table.action')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {invoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-gray-50">
                      <td className="px-6 py-3 text-sm font-medium text-gray-900">
                        {invoice.document_number}
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-700">
                        {typeLabels[invoice.document_type] || invoice.document_type}
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-700">
                        {invoice.issued_at
                          ? new Date(invoice.issued_at).toLocaleDateString('th-TH', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })
                          : '-'}
                      </td>
                      <td className="px-6 py-3 text-sm font-semibold text-gray-900">
                        {formatThb(invoice.total)}
                      </td>
                      <td className="px-6 py-3">
                        <Badge
                          className={statusColors[invoice.status] || 'bg-gray-100 text-gray-600'}
                        >
                          {statusLabels[invoice.status] || invoice.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-3 text-sm">
                        <Link
                          href={`/invoices/${invoice.id}`}
                          className="text-orange-600 hover:text-orange-700 font-medium"
                        >
                          {t('view')}
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {invoices.length === 0 && !isLoading && (
              <div className="text-center py-10 text-sm text-gray-500">{t('empty')}</div>
            )}
          </CardBody>

          {/* Pagination */}
          {total > 20 && (
            <div className="px-6 py-4 border-t border-gray-100 flex justify-between items-center">
              <div className="text-sm text-gray-500">
                {t('totalInvoices')}: {total}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  &laquo;
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page * 20 >= total}
                >
                  &raquo;
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </AppLayout>
  )
}
