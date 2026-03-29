'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { AppLayout } from '@/components/layout'
import { Card, CardBody, CardHeader } from '@/components/ui'
import { useAuth } from '@/context'
import { useAdminRevenue, useTopContractors } from '@/hooks/useCommissions'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'

const COLORS = ['#f97316', '#0ea5e9', '#22c55e', '#a855f7', '#64748b']

function formatThb(value: number) {
  return `฿${value.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
}

export default function AdminRevenuePage() {
  const t = useTranslations('admin.revenue')
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const { data } = useAdminRevenue()
  const { data: topContractors } = useTopContractors()

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

  const breakdownData = data
    ? [
        { name: t('subscription'), value: data.breakdown.subscription },
        { name: t('commissionType'), value: data.breakdown.commission },
        { name: t('leadFee'), value: data.breakdown.lead_fee },
        { name: t('addon'), value: data.breakdown.addon },
        { name: t('other'), value: data.breakdown.other },
      ]
    : []

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[var(--brand-text)]">{t('title')}</h1>
            <p className="text-sm text-[var(--brand-text-secondary)] mt-1">
              {t('platformSubtitle')}
            </p>
          </div>
          <Link
            href="/admin/revenue/forecast"
            className="text-sm font-semibold text-orange-600 hover:text-orange-700"
          >
            {t('viewForecast')}
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardBody>
              <p className="text-xs text-[var(--brand-text-secondary)] uppercase">
                {t('totalRevenue')}
              </p>
              <p className="text-2xl font-bold text-[var(--brand-text)] mt-2">
                {formatThb(data?.total || 0)}
              </p>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <p className="text-xs text-[var(--brand-text-secondary)] uppercase">{t('mrr')}</p>
              <p className="text-2xl font-bold text-[var(--brand-text)] mt-2">
                {formatThb(data?.mrr || 0)}
              </p>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <p className="text-xs text-[var(--brand-text-secondary)] uppercase">{t('arpu')}</p>
              <p className="text-2xl font-bold text-[var(--brand-text)] mt-2">
                {formatThb(data?.arpu || 0)}
              </p>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <p className="text-xs text-[var(--brand-text-secondary)] uppercase">{t('churn')}</p>
              <p className="text-2xl font-bold text-[var(--brand-text)] mt-2">
                {((data?.churnRate || 0) * 100).toFixed(1)}%
              </p>
            </CardBody>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader title={t('revenueBreakdown')} subtitle={t('breakdownChartSubtitle')} />
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
            <CardHeader title={t('topContractors')} subtitle={t('contractorsChartSubtitle')} />
            <CardBody className="p-0">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-[var(--brand-border)] text-left text-xs text-[var(--brand-text-secondary)]">
                      <th className="px-6 py-3">{t('contractor')}</th>
                      <th className="px-6 py-3">{t('plan')}</th>
                      <th className="px-6 py-3">{t('deals')}</th>
                      <th className="px-6 py-3">{t('commission')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--brand-border)]">
                    {topContractors.map((row) => (
                      <tr key={row.id} className="hover:bg-[var(--brand-background)]">
                        <td className="px-6 py-3 text-sm font-medium text-[var(--brand-text)]">
                          {row.name}
                        </td>
                        <td className="px-6 py-3 text-sm text-[var(--brand-text-secondary)] capitalize">
                          {row.plan}
                        </td>
                        <td className="px-6 py-3 text-sm text-[var(--brand-text-secondary)]">
                          {row.totalDeals}
                        </td>
                        <td className="px-6 py-3 text-sm font-semibold text-[var(--brand-text)]">
                          {formatThb(row.totalCommission)}
                        </td>
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
