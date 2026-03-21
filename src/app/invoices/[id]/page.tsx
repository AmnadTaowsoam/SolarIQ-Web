'use client'

import { useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
import { AppLayout } from '@/components/layout'
import { Card, CardBody, CardHeader, Button } from '@/components/ui'
import { useInvoices } from '@/hooks/useCommissions'
import apiClient from '@/lib/api'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1'

function formatThb(value: number) {
  return `฿${value.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
}

export default function InvoiceDetailPage() {
  const params = useParams()
  const invoiceId = params?.id as string
  const { data, refetch } = useInvoices()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const invoice = useMemo(
    () => data?.invoices.find((item) => item.id === invoiceId),
    [data, invoiceId]
  )

  const confirmPayment = async () => {
    if (!invoice) return
    setIsSubmitting(true)
    try {
      await apiClient.post(`${API_BASE}/commissions/invoices/${invoice.id}/payment`, {
        method: 'bank_transfer',
        reference: `SLIP-${Date.now()}`,
      })
      refetch()
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!invoice) {
    return (
      <AppLayout>
        <div className="text-center py-20 text-gray-500">Invoice not found</div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Invoice {invoice.invoiceNumber}</h1>
          <p className="text-sm text-gray-500 mt-1">Period {invoice.periodStart} - {invoice.periodEnd}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="lg:col-span-2">
            <CardHeader title="Summary" />
            <CardBody className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Subtotal</span>
                <span className="text-sm font-semibold text-gray-900">{formatThb(invoice.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">VAT (7%)</span>
                <span className="text-sm font-semibold text-gray-900">{formatThb(invoice.taxAmount)}</span>
              </div>
              <div className="flex justify-between border-t border-gray-100 pt-4">
                <span className="text-sm text-gray-500">Grand Total</span>
                <span className="text-lg font-bold text-gray-900">{formatThb(invoice.grandTotal)}</span>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Payment" />
            <CardBody className="space-y-3">
              <div>
                <p className="text-xs text-gray-500">Status</p>
                <p className="text-sm font-semibold text-gray-900 mt-1 capitalize">{invoice.status}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Payment Method</p>
                <p className="text-sm text-gray-700 mt-1">{invoice.paymentMethod || 'Bank transfer'}</p>
              </div>
              <Button className="w-full" onClick={confirmPayment} disabled={isSubmitting}>
                Confirm Payment
              </Button>
            </CardBody>
          </Card>
        </div>
      </div>
    </AppLayout>
  )
}
