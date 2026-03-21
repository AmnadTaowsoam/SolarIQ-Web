'use client'

import Link from 'next/link'
import { AppLayout } from '@/components/layout'
import { Card, CardBody, CardHeader } from '@/components/ui'
import { useRevenueForecast } from '@/hooks/useCommissions'
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'

function formatThb(value: number) {
  return `฿${value.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
}

export default function RevenueForecastPage() {
  const { data } = useRevenueForecast()
  const chartData = data?.forecast.map((item) => ({
    month: item.month,
    low: item.low,
    mid: item.mid,
    high: item.high,
  })) || []

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Revenue Forecast</h1>
            <p className="text-sm text-gray-500 mt-1">AI-assisted projection for upcoming months</p>
          </div>
          <Link href="/admin/revenue" className="text-sm font-semibold text-orange-600 hover:text-orange-700">
            Back to Revenue
          </Link>
        </div>

        <Card>
          <CardHeader title="3-Month Forecast" subtitle="Low / Mid / High scenarios" />
          <CardBody className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => `${value / 1000}k`} />
                <Tooltip formatter={(value: number) => formatThb(value)} />
                <Line type="monotone" dataKey="low" stroke="#94a3b8" strokeWidth={2} />
                <Line type="monotone" dataKey="mid" stroke="#f97316" strokeWidth={3} />
                <Line type="monotone" dataKey="high" stroke="#22c55e" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Assumptions" />
          <CardBody>
            <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
              {(data?.assumptions || []).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </CardBody>
        </Card>
      </div>
    </AppLayout>
  )
}
