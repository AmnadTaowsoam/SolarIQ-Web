'use client'

import { useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { AppLayout } from '@/components/layout'
import { Card, CardBody, CardHeader, Button } from '@/components/ui'
import { useCommissions } from '@/hooks/useCommissions'
import apiClient from '@/lib/api'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1'

function formatThb(value: number) {
  return `฿${value.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
}

export default function CommissionDetailPage() {
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
    if (!commission) return
    setIsSubmitting(true)
    try {
      await apiClient.post(`${API_BASE}/commissions/${commission.id}/dispute`, {
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
        <div className="text-center py-20 text-gray-500">Commission not found</div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Commission Detail</h1>
          <p className="text-sm text-gray-500 mt-1">Deal {commission.dealId || commission.id}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="lg:col-span-2">
            <CardHeader title="Commission Breakdown" />
            <CardBody className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Deal Value</span>
                <span className="text-sm font-semibold text-gray-900">{formatThb(commission.dealValue)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Commission Rate</span>
                <span className="text-sm font-semibold text-gray-900">
                  {commission.commissionRate ? `${(commission.commissionRate * 100).toFixed(2)}%` : '-'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Raw Commission</span>
                <span className="text-sm font-semibold text-gray-900">
                  {commission.rawCommission ? formatThb(commission.rawCommission) : '-'}
                </span>
              </div>
              <div className="flex justify-between border-t border-gray-100 pt-4">
                <span className="text-sm text-gray-500">Final Commission</span>
                <span className="text-lg font-bold text-gray-900">{formatThb(commission.commissionAmount)}</span>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Status" />
            <CardBody className="space-y-3">
              <div>
                <p className="text-xs text-gray-500">Status</p>
                <p className="text-sm font-semibold text-gray-900 mt-1 capitalize">{commission.status}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Completed At</p>
                <p className="text-sm text-gray-700 mt-1">
                  {new Date(commission.dealCompletedAt).toLocaleString('en-GB')}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Invoice</p>
                <p className="text-sm text-gray-700 mt-1">{commission.invoiceId || 'Not invoiced'}</p>
              </div>
              <Button className="w-full" onClick={handleDispute} disabled={isSubmitting}>
                Raise Dispute
              </Button>
            </CardBody>
          </Card>
        </div>
      </div>
    </AppLayout>
  )
}
