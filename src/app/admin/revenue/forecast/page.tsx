'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { AppLayout } from '@/components/layout'
import { Card, CardBody, CardHeader } from '@/components/ui'
import { useAuth } from '@/context'
import { useRevenueForecast } from '@/hooks/useCommissions'
import {
  LineChart,
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts'

function formatThb(value: number) {
  return `฿${value.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
}

export default function RevenueForecastPage() {
  const t = useTranslations('admin.revenue.forecast')
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const { data } = useRevenueForecast()

  // Redirect non-admin users
  useEffect(() => {
    if (!authLoading && user && user.role !== 'admin') {
      router.replace('/dashboard')
    }
  }, [authLoading, user, router])

  if (authLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
      </AppLayout>
    )
  }

  if (!user || user.role !== 'admin') {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <p className="text-[var(--brand-text-secondary)]">{t('unauthorized')}</p>
        </div>
      </AppLayout>
    )
  }

  const chartData =
    data?.forecast.map((item) => ({
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
            <h1 className="text-2xl font-bold text-[var(--brand-text)]">{t('title')}</h1>
            <p className="text-sm text-[var(--brand-text-secondary)] mt-1">{t('subtitle')}</p>
          </div>
          <Link
            href="/admin/revenue"
            className="text-sm font-semibold text-orange-600 hover:text-orange-700"
          >
            {t('backToRevenue')}
          </Link>
        </div>

        <Card>
          <CardHeader title={t('threeMonthForecast')} subtitle={t('forecastSubtitle')} />
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
          <CardHeader title={t('assumptions')} />
          <CardBody>
            <ul className="list-disc pl-5 text-sm text-[var(--brand-text-secondary)] space-y-1">
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
