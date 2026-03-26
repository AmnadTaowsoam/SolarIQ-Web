'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { AppLayout } from '@/components/layout'
import { Card, CardBody, CardHeader, Badge } from '@/components/ui'
import { useInvoices } from '@/hooks/useCommissions'

const statusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-600',
  sent: 'bg-blue-100 text-blue-800',
  viewed: 'bg-purple-100 text-purple-800',
  paid: 'bg-green-100 text-green-800',
  overdue: 'bg-red-100 text-red-800',
  disputed: 'bg-red-100 text-red-800',
  voided: 'bg-gray-100 text-gray-600',
}

function formatThb(value: number) {
  return `฿${value.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
}

export default function InvoicesPage() {
  const t = useTranslations('invoicesPage')
  const { data, isLoading } = useInvoices()
  const invoices = data?.invoices || []

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
          <p className="text-sm text-gray-500 mt-1">{t('subtitle')}</p>
        </div>

        <Card>
          <CardHeader title={t('history.title')} subtitle={t('history.subtitle')} />
          <CardBody className="p-0">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-100 text-left text-xs text-gray-500">
                    <th className="px-6 py-3">{t('table.invoiceNumber')}</th>
                    <th className="px-6 py-3">{t('table.period')}</th>
                    <th className="px-6 py-3">{t('table.total')}</th>
                    <th className="px-6 py-3">{t('table.status')}</th>
                    <th className="px-6 py-3">{t('table.action')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {invoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-gray-50">
                      <td className="px-6 py-3 text-sm font-medium text-gray-900">
                        {invoice.invoiceNumber}
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-700">
                        {invoice.periodStart} - {invoice.periodEnd}
                      </td>
                      <td className="px-6 py-3 text-sm font-semibold text-gray-900">
                        {formatThb(invoice.grandTotal)}
                      </td>
                      <td className="px-6 py-3">
                        <Badge
                          className={statusColors[invoice.status] || 'bg-gray-100 text-gray-600'}
                        >
                          {invoice.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-3 text-sm">
                        <Link
                          href={`/invoices/${invoice.id}`}
                          className="text-orange-600 hover:text-orange-700"
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
        </Card>
      </div>
    </AppLayout>
  )
}
