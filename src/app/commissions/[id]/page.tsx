'use client'

import { useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { AppLayout } from '@/components/layout'
import { Card, CardBody, CardHeader, Button } from '@/components/ui'
import { useCommissions } from '@/hooks/useCommissions'
import apiClient from '@/lib/api'
import { useTranslations } from 'next-intl'

function formatThb(value: number) {
  return `฿${value.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
}

export default function CommissionDetailPage() {
  const t = useTranslations('commissionDetail')
  const params = useParams()
  const router = useRouter()
  const commissionId = params?.id as string
  const { data } = useCommissions()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const commission = useMemo(
    () => data?.commissions.find((item) => item.id === commissionId),
    [data, commissionId]
  )

  const handleDispute = async () => {
    if (!commission) {
      return
    }
    setIsSubmitting(true)
    try {
      await apiClient.post(`/api/v1/commissions/${commission.id}/dispute`, {
        reason: 'incorrect_deal_value',
        description: 'Please review the deal value and commission amount.',
        evidence_urls: [],
      })
      router.refresh()
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!commission) {
    return (
      <AppLayout>
        <div className="text-center py-20 text-[var(--brand-text-secondary)]">{t('notFound')}</div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--brand-text)]">{t('title')}</h1>
          <p className="text-sm text-[var(--brand-text-secondary)] mt-1">
            {t('dealLabel')} {commission.dealId || commission.id}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="lg:col-span-2">
            <CardHeader title={t('breakdownTitle')} />
            <CardBody className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-[var(--brand-text-secondary)]">{t('dealValue')}</span>
                <span className="text-sm font-semibold text-[var(--brand-text)]">
                  {formatThb(commission.dealValue)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-[var(--brand-text-secondary)]">
                  {t('commissionRate')}
                </span>
                <span className="text-sm font-semibold text-[var(--brand-text)]">
                  {commission.commissionRate
                    ? `${(commission.commissionRate * 100).toFixed(2)}%`
                    : '-'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-[var(--brand-text-secondary)]">
                  {t('rawCommission')}
                </span>
                <span className="text-sm font-semibold text-[var(--brand-text)]">
                  {commission.rawCommission ? formatThb(commission.rawCommission) : '-'}
                </span>
              </div>
              <div className="flex justify-between border-t border-[var(--brand-border)] pt-4">
                <span className="text-sm text-[var(--brand-text-secondary)]">
                  {t('finalCommission')}
                </span>
                <span className="text-lg font-bold text-[var(--brand-text)]">
                  {formatThb(commission.commissionAmount)}
                </span>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title={t('statusTitle')} />
            <CardBody className="space-y-3">
              <div>
                <p className="text-xs text-[var(--brand-text-secondary)]">{t('statusLabel')}</p>
                <p className="text-sm font-semibold text-[var(--brand-text)] mt-1 capitalize">
                  {commission.status}
                </p>
              </div>
              <div>
                <p className="text-xs text-[var(--brand-text-secondary)]">{t('completedAt')}</p>
                <p className="text-sm text-[var(--brand-text)] mt-1">
                  {new Date(commission.dealCompletedAt).toLocaleString('en-GB')}
                </p>
              </div>
              <div>
                <p className="text-xs text-[var(--brand-text-secondary)]">{t('invoice')}</p>
                <p className="text-sm text-[var(--brand-text)] mt-1">
                  {commission.invoiceId || t('notInvoiced')}
                </p>
              </div>
              <Button className="w-full" onClick={handleDispute} disabled={isSubmitting}>
                {t('raiseDispute')}
              </Button>
            </CardBody>
          </Card>
        </div>
      </div>
    </AppLayout>
  )
}
