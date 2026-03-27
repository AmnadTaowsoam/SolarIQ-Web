'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { AppLayout } from '@/components/layout'
import { Card, CardBody, CardHeader, Button, Badge } from '@/components/ui'
import {
  useVATInvoice,
  useVATInvoicePdf,
  useSendVATInvoiceEmail,
  useMarkVATInvoicePaid,
  useVoidVATInvoice,
  VATDocumentStatus,
} from '@/hooks/useVATInvoices'
import { formatThb } from '@/lib/utils'

const typeLabels: Record<string, string> = {
  invoice: 'ใบกำกับภาษี',
  receipt: 'ใบเสร็จรับเงิน',
  credit_note: 'ใบลดหนี้',
}

const statusLabels: Record<string, string> = {
  draft: 'ร่าง',
  issued: 'ออกแล้ว',
  sent: 'ส่งแล้ว',
  paid: 'ชำระแล้ว',
  void: 'ยกเลิก',
}

const statusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-600',
  issued: 'bg-blue-100 text-blue-800',
  sent: 'bg-purple-100 text-purple-800',
  paid: 'bg-green-100 text-green-800',
  void: 'bg-gray-100 text-gray-600',
}

export default function InvoiceDetailPage() {
  useTranslations('invoicesPage')
  const params = useParams()
  useRouter()
  const invoiceId = params?.id as string

  const { data: invoice, isLoading, refetch } = useVATInvoice(invoiceId)
  const generatePdf = useVATInvoicePdf()
  const sendEmail = useSendVATInvoiceEmail()
  const markPaid = useMarkVATInvoicePaid()
  const voidInvoice = useVoidVATInvoice()

  const [isDownloading, setIsDownloading] = useState(false)
  const [isSendingEmail, setIsSendingEmail] = useState(false)
  const [showVoidDialog, setShowVoidDialog] = useState(false)
  const [voidReason, setVoidReason] = useState('')

  if (isLoading) {
    return (
      <AppLayout>
        <div className="text-center py-20 text-gray-500">กำลังโหลด...</div>
      </AppLayout>
    )
  }

  if (!invoice) {
    return (
      <AppLayout>
        <div className="text-center py-20 text-gray-500">
          <p className="mb-4">ไม่พบเอกสาร</p>
          <Link href="/invoices">
            <Button variant="outline">กลับไปหน้ารายการ</Button>
          </Link>
        </div>
      </AppLayout>
    )
  }

  const handleDownloadPdf = async () => {
    setIsDownloading(true)
    try {
      const result = await generatePdf.mutateAsync(invoice.id)
      if (result.pdf_url) {
        window.open(result.pdf_url, '_blank')
      }
    } catch (error) {
      void error // handled by UI state
      alert('ไม่สามารถดาวน์โหลด PDF ได้')
    } finally {
      setIsDownloading(false)
    }
  }

  const handleSendEmail = async () => {
    setIsSendingEmail(true)
    try {
      await sendEmail.mutateAsync({ invoiceId: invoice.id })
      alert('ส่งอีเมลสำเร็จ')
      refetch()
    } catch (error) {
      void error // handled by UI state
      alert('ไม่สามารถส่งอีเมลได้')
    } finally {
      setIsSendingEmail(false)
    }
  }

  const handleMarkPaid = async () => {
    try {
      await markPaid.mutateAsync(invoice.id)
      refetch()
    } catch (error) {
      void error // handled by UI state
      alert('ไม่สามารถทำเครื่องหมายว่าชำระแล้วได้')
    }
  }

  const handleVoid = async () => {
    if (!voidReason.trim()) {
      alert('กรุณาระบุเหตุผลในการยกเลิก')
      return
    }
    try {
      await voidInvoice.mutateAsync({ invoiceId: invoice.id, reason: voidReason })
      setShowVoidDialog(false)
      setVoidReason('')
      refetch()
    } catch (error) {
      void error // handled by UI state
      alert('ไม่สามารถยกเลิกเอกสารได้')
    }
  }

  const canVoid =
    invoice.status !== VATDocumentStatus.PAID && invoice.status !== VATDocumentStatus.VOID
  const canMarkPaid =
    invoice.status !== VATDocumentStatus.PAID && invoice.status !== VATDocumentStatus.VOID

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <Link
              href="/invoices"
              className="text-sm text-orange-600 hover:text-orange-700 mb-2 inline-block"
            >
              ← กลับไปหน้ารายการ
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">
              {typeLabels[invoice.document_type]} {invoice.document_number}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              วันที่ออก:{' '}
              {invoice.issued_at
                ? new Date(invoice.issued_at).toLocaleDateString('th-TH', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                  })
                : '-'}
            </p>
          </div>
          <Badge className={statusColors[invoice.status] || 'bg-gray-100 text-gray-600'}>
            {statusLabels[invoice.status] || invoice.status}
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Invoice Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Seller Info */}
            <Card>
              <CardHeader title="ผู้ขาย (SolarIQ)" />
              <CardBody>
                <div className="space-y-2 text-sm">
                  <p className="font-semibold">{invoice.seller_info.name_th}</p>
                  <p className="text-gray-600">{invoice.seller_info.name_en}</p>
                  <p className="text-gray-600">
                    เลขประจำตัวผู้เสียภาษีอากร: {invoice.seller_info.tax_id}
                  </p>
                  <p className="text-gray-600">{invoice.seller_info.address}</p>
                  <p className="text-gray-600">
                    โทร: {invoice.seller_info.phone} | อีเมล: {invoice.seller_info.email}
                  </p>
                </div>
              </CardBody>
            </Card>

            {/* Buyer Info */}
            <Card>
              <CardHeader title="ผู้ซื้อ / ลูกค้า" />
              <CardBody>
                <div className="space-y-2 text-sm">
                  <p className="font-semibold">{invoice.buyer_info.name_th}</p>
                  <p className="text-gray-600">{invoice.buyer_info.name_en}</p>
                  <p className="text-gray-600">
                    เลขประจำตัวผู้เสียภาษีอากร: {invoice.buyer_info.tax_id}
                  </p>
                  <p className="text-gray-600">
                    สาขา:{' '}
                    {invoice.buyer_info.branch_number === '00000'
                      ? 'สำนักงานใหญ่'
                      : `สาขาที่ ${invoice.buyer_info.branch_number}`}
                  </p>
                  <p className="text-gray-600">{invoice.buyer_info.address}</p>
                  {invoice.buyer_info.contact_person && (
                    <p className="text-gray-600">ผู้ติดต่อ: {invoice.buyer_info.contact_person}</p>
                  )}
                  {invoice.buyer_info.email && (
                    <p className="text-gray-600">อีเมล: {invoice.buyer_info.email}</p>
                  )}
                  {invoice.buyer_info.phone && (
                    <p className="text-gray-600">โทร: {invoice.buyer_info.phone}</p>
                  )}
                </div>
              </CardBody>
            </Card>

            {/* Line Items */}
            <Card>
              <CardHeader title="รายการสินค้า/บริการ" />
              <CardBody className="p-0">
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b border-gray-100 text-left text-xs text-gray-500">
                        <th className="px-6 py-3">ลำดับ</th>
                        <th className="px-6 py-3">รายการ</th>
                        <th className="px-6 py-3 text-center">จำนวน</th>
                        <th className="px-6 py-3 text-right">ราคาต่อหน่วย</th>
                        <th className="px-6 py-3 text-right">จำนวนเงิน</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {invoice.line_items.map((item, index) => (
                        <tr key={index}>
                          <td className="px-6 py-3 text-sm text-gray-600 text-center">
                            {index + 1}
                          </td>
                          <td className="px-6 py-3 text-sm text-gray-900">{item.description}</td>
                          <td className="px-6 py-3 text-sm text-gray-600 text-center">
                            {item.quantity}
                          </td>
                          <td className="px-6 py-3 text-sm text-gray-600 text-right">
                            {formatThb(item.unit_price)}
                          </td>
                          <td className="px-6 py-3 text-sm font-medium text-gray-900 text-right">
                            {formatThb(item.subtotal)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardBody>
            </Card>

            {/* Totals */}
            <Card>
              <CardBody className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">ยอดรวมสินค้า/บริการ</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {formatThb(invoice.subtotal)} {invoice.currency}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">
                    ภาษีมูลค่าเพิ่ม (VAT {(invoice.vat_rate * 100).toFixed(0)}%)
                  </span>
                  <span className="text-sm font-semibold text-gray-900">
                    {formatThb(invoice.vat_amount)} {invoice.currency}
                  </span>
                </div>
                <div className="flex justify-between border-t border-gray-100 pt-4">
                  <span className="text-base font-bold text-gray-900">ยอดรวมสุทธิ</span>
                  <span className="text-lg font-bold text-orange-600">
                    {formatThb(invoice.total)} {invoice.currency}
                  </span>
                </div>
              </CardBody>
            </Card>

            {/* Notes */}
            {invoice.notes && (
              <Card>
                <CardHeader title="หมายเหตุ" />
                <CardBody>
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">{invoice.notes}</p>
                </CardBody>
              </Card>
            )}
          </div>

          {/* Actions Sidebar */}
          <div className="space-y-6">
            {/* Actions Card */}
            <Card>
              <CardHeader title="การดำเนินการ" />
              <CardBody className="space-y-3">
                <Button className="w-full" onClick={handleDownloadPdf} disabled={isDownloading}>
                  {isDownloading ? 'กำลังดาวน์โหลด...' : 'ดาวน์โหลด PDF'}
                </Button>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleSendEmail}
                  disabled={isSendingEmail || invoice.status === VATDocumentStatus.SENT}
                >
                  {isSendingEmail ? 'กำลังส่ง...' : 'ส่งทางอีเมล'}
                </Button>

                {canMarkPaid && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleMarkPaid}
                    disabled={markPaid.isPending}
                  >
                    {markPaid.isPending ? 'กำลังบันทึก...' : 'ทำเครื่องหมายว่าชำระแล้ว'}
                  </Button>
                )}

                {canVoid && (
                  <Button
                    variant="outline"
                    className="w-full border-red-300 text-red-600 hover:bg-red-50"
                    onClick={() => setShowVoidDialog(true)}
                  >
                    ยกเลิกเอกสาร
                  </Button>
                )}
              </CardBody>
            </Card>

            {/* Status Info */}
            <Card>
              <CardHeader title="ข้อมูลสถานะ" />
              <CardBody className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-500">สถานะปัจจุบัน</p>
                  <p className="font-semibold mt-1">{statusLabels[invoice.status]}</p>
                </div>
                {invoice.issued_at && (
                  <div>
                    <p className="text-gray-500">วันที่ออกเอกสาร</p>
                    <p className="mt-1">
                      {new Date(invoice.issued_at).toLocaleDateString('th-TH', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                )}
                {invoice.due_date && (
                  <div>
                    <p className="text-gray-500">วันที่ครบกำหนด</p>
                    <p className="mt-1">
                      {new Date(invoice.due_date).toLocaleDateString('th-TH', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                )}
                {invoice.paid_at && (
                  <div>
                    <p className="text-gray-500">วันที่ชำระเงิน</p>
                    <p className="mt-1">
                      {new Date(invoice.paid_at).toLocaleDateString('th-TH', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                )}
                {invoice.sent_at && (
                  <div>
                    <p className="text-gray-500">วันที่ส่งอีเมล</p>
                    <p className="mt-1">
                      {new Date(invoice.sent_at).toLocaleDateString('th-TH', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                    <p className="text-gray-500 mt-1">ถึง: {invoice.email_sent_to}</p>
                  </div>
                )}
              </CardBody>
            </Card>
          </div>
        </div>

        {/* Void Dialog */}
        {showVoidDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md">
              <CardHeader title="ยกเลิกเอกสาร" />
              <CardBody className="space-y-4">
                <p className="text-sm text-gray-600">
                  คุณต้องการยกเลิกเอกสารนี้หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้
                </p>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    เหตุผลในการยกเลิก <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={voidReason}
                    onChange={(e) => setVoidReason(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    rows={4}
                    placeholder="ระบุเหตุผล..."
                  />
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setShowVoidDialog(false)
                      setVoidReason('')
                    }}
                  >
                    ยกเลิก
                  </Button>
                  <Button
                    className="flex-1 bg-red-600 hover:bg-red-700"
                    onClick={handleVoid}
                    disabled={voidInvoice.isPending}
                  >
                    {voidInvoice.isPending ? 'กำลังบันทึก...' : 'ยืนยันการยกเลิก'}
                  </Button>
                </div>
              </CardBody>
            </Card>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
