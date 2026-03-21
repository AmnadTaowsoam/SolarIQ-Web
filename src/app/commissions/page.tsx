'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { AppLayout } from '@/components/layout'
import { Card, CardBody, CardHeader, Badge } from '@/components/ui'
import { useCommissions, useCommissionSummary } from '@/hooks/useCommissions'

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  invoiced: 'bg-blue-100 text-blue-800',
  paid: 'bg-green-100 text-green-800',
  disputed: 'bg-red-100 text-red-800',
  voided: 'bg-gray-100 text-gray-600',
  adjusted: 'bg-purple-100 text-purple-800',
}

function formatThb(value: number) {
  return `฿${value.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
}

export default function CommissionsPage() {
  const { data, isLoading } = useCommissions()
  const { data: summary } = useCommissionSummary()

  const rows = data?.commissions || []

  const totals = useMemo(() => {
    if (!summary) return null
    return {
      current: summary.currentMonth.totalAmount,
      previous: summary.previousMonth.totalAmount,
      change: summary.changePercent,
    }
  }, [summary])

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Commissions</h1>
            <p className="text-sm text-gray-500 mt-1">Track commission earnings and invoice status</p>
          </div>
          <Link
            href="/invoices"
            className="px-4 py-2 text-sm font-semibold bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
          >
            View Invoices
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardBody>
              <p className="text-xs text-gray-500 uppercase">Current Month</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{formatThb(totals?.current || 0)}</p>
              <p className="text-xs text-gray-400 mt-1">{summary?.currentMonth.count || 0} deals</p>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <p className="text-xs text-gray-500 uppercase">Previous Month</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{formatThb(totals?.previous || 0)}</p>
              <p className="text-xs text-gray-400 mt-1">{summary?.previousMonth.count || 0} deals</p>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <p className="text-xs text-gray-500 uppercase">Change</p>
              <p className={`text-2xl font-bold mt-2 ${totals && totals.change >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {totals ? `${totals.change.toFixed(1)}%` : '0%'}
              </p>
              <p className="text-xs text-gray-400 mt-1">vs last month</p>
            </CardBody>
          </Card>
        </div>

        <Card>
          <CardHeader title="Commission History" subtitle="Latest commissions across your completed deals" />
          <CardBody className="p-0">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-100 text-left text-xs text-gray-500">
                    <th className="px-6 py-3">Deal</th>
                    <th className="px-6 py-3">Deal Value</th>
                    <th className="px-6 py-3">Rate</th>
                    <th className="px-6 py-3">Commission</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {rows.map((row) => (
                    <tr key={row.id} className="hover:bg-gray-50">
                      <td className="px-6 py-3 text-sm font-medium text-gray-900">
                        <Link href={`/commissions/${row.id}`} className="hover:text-orange-600">
                          {row.dealId || row.id}
                        </Link>
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-700">{formatThb(row.dealValue)}</td>
                      <td className="px-6 py-3 text-sm text-gray-700">
                        {row.commissionRate ? `${(row.commissionRate * 100).toFixed(1)}%` : '-'}
                      </td>
                      <td className="px-6 py-3 text-sm font-semibold text-gray-900">{formatThb(row.commissionAmount)}</td>
                      <td className="px-6 py-3">
                        <Badge className={statusColors[row.status] || 'bg-gray-100 text-gray-600'}>
                          {row.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-3 text-xs text-gray-500">
                        {new Date(row.dealCompletedAt).toLocaleDateString('en-GB')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {rows.length === 0 && !isLoading && (
              <div className="text-center py-10 text-sm text-gray-500">No commissions yet</div>
            )}
          </CardBody>
        </Card>
      </div>
    </AppLayout>
  )
}
