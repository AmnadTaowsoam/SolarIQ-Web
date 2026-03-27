'use client'

/**
 * Payment Confirmation Component (WK-102)
 * Displays payment success confirmation and receipt details
 */

import React from 'react'
import { CheckCircle, Download, Calendar, CreditCard, FileText } from 'lucide-react'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { type Invoice, formatPrice } from '@/types/billing'

interface PaymentConfirmationProps {
  invoice: Invoice
  onDownloadReceipt?: () => void
  onReturnToBilling?: () => void
}

export function PaymentConfirmation({
  invoice,
  onDownloadReceipt,
  onReturnToBilling,
}: PaymentConfirmationProps) {
  const formatDateThai = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'paid':
        return 'success'
      case 'pending':
        return 'warning'
      case 'failed':
        return 'danger'
      default:
        return 'default'
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Success Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
        <p className="text-gray-600">
          Your payment has been processed successfully. Thank you for your subscription.
        </p>
      </div>

      {/* Receipt Card */}
      <Card>
        <CardHeader
          title="Payment Receipt"
          subtitle={`Invoice #${invoice.invoice_number}`}
          action={
            <Badge variant={getStatusBadgeVariant(invoice.status)} size="md">
              {invoice.status.toUpperCase()}
            </Badge>
          }
        />

        <CardBody>
          <div className="space-y-6">
            {/* Amount */}
            <div className="bg-gray-50 rounded-lg p-6 text-center">
              <p className="text-sm text-gray-600 mb-1">Total Amount</p>
              <p className="text-4xl font-bold text-gray-900">{formatPrice(invoice.amount_thb)}</p>
              <p className="text-sm text-gray-500 mt-1">THB</p>
            </div>

            {/* Details */}
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500">Invoice Number</p>
                  <p className="font-medium text-gray-900">{invoice.invoice_number}</p>
                </div>
              </div>

              {invoice.paid_at && (
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-500">Payment Date</p>
                    <p className="font-medium text-gray-900">{formatDateThai(invoice.paid_at)}</p>
                  </div>
                </div>
              )}

              {invoice.due_date && (
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-500">Due Date</p>
                    <p className="font-medium text-gray-900">{formatDateThai(invoice.due_date)}</p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-yellow-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500">Payment Method</p>
                  <p className="font-medium text-gray-900">
                    {invoice.provider_invoice_id
                      ? `Opn Payments (${invoice.provider_invoice_id.slice(-4)})`
                      : 'N/A'}
                  </p>
                </div>
              </div>

              {invoice.description && (
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-500">Description</p>
                    <p className="font-medium text-gray-900">{invoice.description}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
              {onDownloadReceipt && (
                <Button variant="outline" size="lg" className="flex-1" onClick={onDownloadReceipt}>
                  <Download className="w-4 h-4 mr-2" />
                  Download Receipt
                </Button>
              )}
              {onReturnToBilling && (
                <Button variant="primary" size="lg" className="flex-1" onClick={onReturnToBilling}>
                  Return to Billing
                </Button>
              )}
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Next Steps */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">What's Next?</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Your subscription is now active and all features are unlocked</li>
          <li>• You'll receive a confirmation email with your receipt</li>
          <li>• Your next billing date will be shown in the billing page</li>
          <li>• You can manage your subscription anytime from the billing page</li>
        </ul>
      </div>
    </div>
  )
}

export default PaymentConfirmation
