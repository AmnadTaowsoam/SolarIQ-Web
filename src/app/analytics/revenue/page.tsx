'use client'

import { useAnalyticsRevenue } from '@/hooks/useAnalytics'
import { useAuth } from '@/context'
import { Card, CardBody, CardHeader } from '@/components/ui'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend } from 'recharts'

export default function RevenuePage() {
  const { user } = useAuth()
  const { data } = useAnalyticsRevenue()

  if (user && user.role !== 'admin') {
    return (
      <Card>
        <CardBody>
          <p className="text-sm text-[var(--brand-text-secondary)]">
            Access restricted to admin users.
          </p>
        </CardBody>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardBody>
            <p className="text-xs text-[var(--brand-text-secondary)] uppercase">MRR</p>
            <p className="text-2xl font-bold text-[var(--brand-text)] mt-2">
              ฿{data.mrr.current.toLocaleString('en-US')}
            </p>
            <p
              className={`text-xs mt-1 ${data.mrr.change >= 0 ? 'text-emerald-600' : 'text-red-600'}`}
            >
              {data.mrr.change >= 0 ? '+' : ''}
              {data.mrr.change.toFixed(1)}%
            </p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-xs text-[var(--brand-text-secondary)] uppercase">ARPU</p>
            <p className="text-2xl font-bold text-[var(--brand-text)] mt-2">
              ฿{data.arpu.value.toLocaleString('en-US')}
            </p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-xs text-[var(--brand-text-secondary)] uppercase">Churn Rate</p>
            <p className="text-2xl font-bold text-[var(--brand-text)] mt-2">
              {data.churnRate.value.toFixed(2)}%
            </p>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader title="Revenue Trend" subtitle="Monthly breakdown" />
        <CardBody>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.trend}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="total" stroke="#f97316" strokeWidth={2} />
                <Line type="monotone" dataKey="subscription" stroke="#3b82f6" strokeWidth={2} />
                <Line type="monotone" dataKey="commission" stroke="#22c55e" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
