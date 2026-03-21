'use client'

import Link from 'next/link'
import { AppLayout } from '@/components/layout'
import { Card, CardBody, CardHeader } from '@/components/ui'
import { useAdminRevenue, useTopContractors } from '@/hooks/useCommissions'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'

const COLORS = ['#f97316', '#0ea5e9', '#22c55e', '#a855f7', '#64748b']

function formatThb(value: number) {
  return `฿${value.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
}

export default function AdminRevenuePage() {
  const { data } = useAdminRevenue()
  const { data: topContractors } = useTopContractors()

  const breakdownData = data
    ? [
        { name: 'Subscription', value: data.breakdown.subscription },
        { name: 'Commission', value: data.breakdown.commission },
        { name: 'Lead Fee', value: data.breakdown.lead_fee },
        { name: 'Add-on', value: data.breakdown.addon },
        { name: 'Other', value: data.breakdown.other },
      ]
    : []

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Revenue Dashboard</h1>
            <p className="text-sm text-gray-500 mt-1">Platform-wide revenue and commission insights</p>
          </div>
          <Link href="/admin/revenue/forecast" className="text-sm font-semibold text-orange-600 hover:text-orange-700">
            View Forecast
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardBody>
              <p className="text-xs text-gray-500 uppercase">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{formatThb(data?.total || 0)}</p>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <p className="text-xs text-gray-500 uppercase">MRR</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{formatThb(data?.mrr || 0)}</p>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <p className="text-xs text-gray-500 uppercase">ARPU</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{formatThb(data?.arpu || 0)}</p>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <p className="text-xs text-gray-500 uppercase">Churn</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{((data?.churnRate || 0) * 100).toFixed(1)}%</p>
            </CardBody>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader title="Revenue Breakdown" subtitle="Subscriptions vs commissions" />
            <CardBody className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={breakdownData} dataKey="value" nameKey="name" outerRadius={90}>
                    {breakdownData.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatThb(value)} />
                </PieChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Top Contractors" subtitle="Highest commission generators" />
            <CardBody className="p-0">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-gray-100 text-left text-xs text-gray-500">
                      <th className="px-6 py-3">Contractor</th>
                      <th className="px-6 py-3">Plan</th>
                      <th className="px-6 py-3">Deals</th>
                      <th className="px-6 py-3">Commission</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {topContractors.map((row) => (
                      <tr key={row.id} className="hover:bg-gray-50">
                        <td className="px-6 py-3 text-sm font-medium text-gray-900">{row.name}</td>
                        <td className="px-6 py-3 text-sm text-gray-600 capitalize">{row.plan}</td>
                        <td className="px-6 py-3 text-sm text-gray-600">{row.totalDeals}</td>
                        <td className="px-6 py-3 text-sm font-semibold text-gray-900">{formatThb(row.totalCommission)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </AppLayout>
  )
}
