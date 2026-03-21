'use client'

import Link from 'next/link'
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
  const { data, isLoading } = useInvoices()
  const invoices = data?.invoices || []

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
          <p className="text-sm text-gray-500 mt-1">Monthly commission invoices and payment status</p>
        </div>

        <Card>
          <CardHeader title="Invoice History" subtitle="Latest invoices" />
          <CardBody className="p-0">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-100 text-left text-xs text-gray-500">
                    <th className="px-6 py-3">Invoice #</th>
                    <th className="px-6 py-3">Period</th>
                    <th className="px-6 py-3">Total</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {invoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-gray-50">
                      <td className="px-6 py-3 text-sm font-medium text-gray-900">{invoice.invoiceNumber}</td>
                      <td className="px-6 py-3 text-sm text-gray-700">
                        {invoice.periodStart} - {invoice.periodEnd}
                      </td>
                      <td className="px-6 py-3 text-sm font-semibold text-gray-900">
                        {formatThb(invoice.grandTotal)}
                      </td>
                      <td className="px-6 py-3">
                        <Badge className={statusColors[invoice.status] || 'bg-gray-100 text-gray-600'}>
                          {invoice.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-3 text-sm">
                        <Link href={`/invoices/${invoice.id}`} className="text-orange-600 hover:text-orange-700">
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {invoices.length === 0 && !isLoading && (
              <div className="text-center py-10 text-sm text-gray-500">No invoices yet</div>
            )}
          </CardBody>
        </Card>
      </div>
    </AppLayout>
  )
}
