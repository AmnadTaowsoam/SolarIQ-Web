'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { AppLayout } from '@/components/layout'
import { Card, CardBody, CardHeader, Badge } from '@/components/ui'
import { useCommissions, useCommissionSummary } from '@/hooks/useCommissions'
import { useAuth } from '@/context'

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-500/10 text-yellow-600',
  invoiced: 'bg-blue-500/10 text-blue-800',
  paid: 'bg-green-500/10 text-green-800',
  disputed: 'bg-red-100 text-red-400',
  voided: 'bg-[var(--brand-background)] text-[var(--brand-text-secondary)]',
  adjusted: 'bg-purple-500/10 text-purple-800',
}

function formatThb(value: number) {
  return `฿${value.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
}

export default function CommissionsPage() {
  const t = useTranslations('commissionsPage')
  const { user } = useAuth()
  const { data, isLoading } = useCommissions()
  const { data: summary } = useCommissionSummary()

  const rows = data?.commissions || []

  const totals = useMemo(() => {
    if (!summary) {
      return null
    }
    return {
      current: summary.currentMonth.totalAmount,
      previous: summary.previousMonth.totalAmount,
      change: summary.changePercent,
    }
  }, [summary])

  return (
    <AppLayout user={user}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[var(--brand-text)]">{t('title')}</h1>
            <p className="text-sm text-[var(--brand-text-secondary)] mt-1">{t('subtitle')}</p>
          </div>
          <Link
            href="/invoices"
            className="px-4 py-2 text-sm font-semibold bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
          >
            {t('viewInvoices')}
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardBody>
              <p className="text-xs text-[var(--brand-text-secondary)] uppercase">
                {t('currentMonth')}
              </p>
              <p className="text-2xl font-bold text-[var(--brand-text)] mt-2">
                {formatThb(totals?.current || 0)}
              </p>
              <p className="text-xs text-[var(--brand-text-secondary)] mt-1">
                {summary?.currentMonth.count || 0} {t('deals')}
              </p>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <p className="text-xs text-[var(--brand-text-secondary)] uppercase">
                {t('previousMonth')}
              </p>
              <p className="text-2xl font-bold text-[var(--brand-text)] mt-2">
                {formatThb(totals?.previous || 0)}
              </p>
              <p className="text-xs text-[var(--brand-text-secondary)] mt-1">
                {summary?.previousMonth.count || 0} {t('deals')}
              </p>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <p className="text-xs text-[var(--brand-text-secondary)] uppercase">{t('change')}</p>
              <p
                className={`text-2xl font-bold mt-2 ${totals && totals.change >= 0 ? 'text-emerald-600' : 'text-red-600'}`}
              >
                {totals ? `${totals.change.toFixed(1)}%` : '0%'}
              </p>
              <p className="text-xs text-[var(--brand-text-secondary)] mt-1">{t('vsLastMonth')}</p>
            </CardBody>
          </Card>
        </div>

        <Card>
          <CardHeader title={t('history.title')} subtitle={t('history.subtitle')} />
          <CardBody className="p-0">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-[var(--brand-border)] text-left text-xs text-[var(--brand-text-secondary)]">
                    <th className="px-6 py-3">{t('table.deal')}</th>
                    <th className="px-6 py-3">{t('table.dealValue')}</th>
                    <th className="px-6 py-3">{t('table.rate')}</th>
                    <th className="px-6 py-3">{t('table.commission')}</th>
                    <th className="px-6 py-3">{t('table.status')}</th>
                    <th className="px-6 py-3">{t('table.date')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--brand-border)]">
                  {rows.map((row) => (
                    <tr key={row.id} className="hover:bg-[var(--brand-background)]">
                      <td className="px-6 py-3 text-sm font-medium text-[var(--brand-text)]">
                        <Link href={`/commissions/${row.id}`} className="hover:text-orange-600">
                          {row.dealId || row.id}
                        </Link>
                      </td>
                      <td className="px-6 py-3 text-sm text-[var(--brand-text)]">
                        {formatThb(row.dealValue)}
                      </td>
                      <td className="px-6 py-3 text-sm text-[var(--brand-text)]">
                        {row.commissionRate ? `${(row.commissionRate * 100).toFixed(1)}%` : '-'}
                      </td>
                      <td className="px-6 py-3 text-sm font-semibold text-[var(--brand-text)]">
                        {formatThb(row.commissionAmount)}
                      </td>
                      <td className="px-6 py-3">
                        <Badge
                          className={
                            statusColors[row.status] ||
                            'bg-[var(--brand-background)] text-[var(--brand-text-secondary)]'
                          }
                        >
                          {row.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-3 text-xs text-[var(--brand-text-secondary)]">
                        {new Date(row.dealCompletedAt).toLocaleDateString('en-GB')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {rows.length === 0 && !isLoading && (
              <div className="text-center py-10 text-sm text-[var(--brand-text-secondary)]">
                {t('empty')}
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </AppLayout>
  )
}
