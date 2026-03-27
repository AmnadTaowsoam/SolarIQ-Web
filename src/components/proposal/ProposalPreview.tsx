import React, { useState } from 'react'
import { Proposal, SendProposalRequest, UpdateStatusRequest } from '../../hooks/useProposals'
import { Button } from '../ui/Button'
import { Modal } from '../ui/Modal'
import { Badge } from '../ui/Badge'

interface ProposalPreviewProps {
  proposal: Proposal
  onSend?: (proposalId: string, request: SendProposalRequest) => Promise<void>
  onUpdateStatus?: (proposalId: string, request: UpdateStatusRequest) => Promise<void>
  onRegenerate?: (proposalId: string) => void
}

export function ProposalPreview({
  proposal,
  onSend,
  onUpdateStatus,
  onRegenerate,
}: ProposalPreviewProps) {
  const [showSendModal, setShowSendModal] = useState(false)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [sendChannel, setSendChannel] = useState<'line' | 'email'>('line')
  const [sendRecipient, setSendRecipient] = useState('')
  const [sendMessage, setSendMessage] = useState('')
  const [status, setStatus] = useState<'accepted' | 'declined' | 'expired'>('accepted')
  const [responseNotes, setResponseNotes] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'รอดำเนินการ', color: 'bg-yellow-100 text-yellow-800' },
      accepted: { label: 'ยอมรับ', color: 'bg-green-100 text-green-800' },
      declined: { label: 'ปฏิเสธ', color: 'bg-red-100 text-red-800' },
      expired: { label: 'หมดอายุ', color: 'bg-gray-100 text-gray-800' },
    }
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
    return <Badge className={config.color}>{config.label}</Badge>
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) {
      return '-'
    }
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const handleSend = async () => {
    if (!onSend) {
      return
    }

    try {
      setIsSending(true)
      await onSend(proposal.id, {
        channel: sendChannel,
        recipient: sendRecipient || undefined,
        message: sendMessage || undefined,
      })
      setShowSendModal(false)
      setSendChannel('line')
      setSendRecipient('')
      setSendMessage('')
    } catch {
    } finally {
      setIsSending(false)
    }
  }

  const handleUpdateStatus = async () => {
    if (!onUpdateStatus) {
      return
    }

    try {
      setIsUpdating(true)
      await onUpdateStatus(proposal.id, {
        status,
        response_notes: responseNotes || undefined,
      })
      setShowStatusModal(false)
      setStatus('accepted')
      setResponseNotes('')
    } catch {
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-white text-lg font-bold">ใบเสนอราคา</h3>
            <p className="text-amber-100 text-sm">
              เลขที่: {proposal.id.slice(0, 8).toUpperCase()}
            </p>
          </div>
          <div className="flex gap-2">{getStatusBadge(proposal.status)}</div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <div className="text-sm text-gray-600 mb-1">ขนาดระบบ</div>
            <div className="text-2xl font-bold text-blue-900">
              {proposal.system_size_kw.toFixed(2)} <span className="text-sm font-normal">kWp</span>
            </div>
          </div>
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <div className="text-sm text-gray-600 mb-1">ราคาติดตั้ง</div>
            <div className="text-2xl font-bold text-green-900">
              {formatCurrency(proposal.estimated_cost)}
            </div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 text-center">
            <div className="text-sm text-gray-600 mb-1">คืนทุนภายใน</div>
            <div className="text-2xl font-bold text-purple-900">
              {proposal.payback_years.toFixed(1)} <span className="text-sm font-normal">ปี</span>
            </div>
          </div>
          <div className="bg-amber-50 rounded-lg p-4 text-center">
            <div className="text-sm text-gray-600 mb-1">ออมเงิน/เดือน</div>
            <div className="text-2xl font-bold text-amber-900">
              {formatCurrency(proposal.annual_savings / 12)}
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-gray-600">ผลิตไฟฟ้าต่อปี</span>
            <span className="font-semibold">{proposal.annual_production_kwh.toFixed(0)} kWh</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-gray-600">ออมเงินต่อปี</span>
            <span className="font-semibold text-green-600">
              {formatCurrency(proposal.annual_savings)}
            </span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-gray-600">ROI 25 ปี</span>
            <span className="font-semibold text-blue-600">{proposal.roi_percent.toFixed(1)}%</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-gray-600">วันหมดอายุ</span>
            <span className="font-semibold">{formatDate(proposal.valid_until)}</span>
          </div>
        </div>

        {/* Tracking Info */}
        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">จำนวนครั้งที่ดู</span>
            <span className="font-semibold">{proposal.view_count}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">เวลาดูรวม</span>
            <span className="font-semibold">
              {Math.floor(proposal.total_view_duration_seconds / 60)} นาที
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">ส่งผ่าน LINE</span>
            <span className="font-semibold">{proposal.sent_via_line ? '✅' : '❌'}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">ส่งผ่าน Email</span>
            <span className="font-semibold">{proposal.sent_via_email ? '✅' : '❌'}</span>
          </div>
          {proposal.last_viewed_at && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">ดูล่าสุด</span>
              <span className="font-semibold text-sm">{formatDate(proposal.last_viewed_at)}</span>
            </div>
          )}
        </div>

        {/* AI Summary */}
        {proposal.ai_summary && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <h4 className="font-semibold text-amber-900 mb-2">สรุปผลวิเคราะห์โดย AI</h4>
            <p className="text-sm text-amber-800 whitespace-pre-wrap">{proposal.ai_summary}</p>
          </div>
        )}

        {/* Custom Notes */}
        {proposal.custom_notes && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">หมายเหตุเพิ่มเติม</h4>
            <p className="text-sm text-blue-800 whitespace-pre-wrap">{proposal.custom_notes}</p>
          </div>
        )}

        {/* Response Notes */}
        {proposal.response_notes && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-2">หมายเหตุการตอบรับ</h4>
            <p className="text-sm text-gray-800 whitespace-pre-wrap">{proposal.response_notes}</p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
        <div className="flex flex-wrap gap-2 justify-between">
          <div className="flex gap-2">
            {proposal.pdf_url && (
              <Button variant="secondary" onClick={() => window.open(proposal.pdf_url, '_blank')}>
                📄 ดาวน์โหลด PDF
              </Button>
            )}
            {onRegenerate && (
              <Button variant="outline" onClick={() => onRegenerate(proposal.id)}>
                🔄 สร้างใหม่
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            {onSend && proposal.status === 'pending' && (
              <Button variant="primary" onClick={() => setShowSendModal(true)}>
                📤 ส่งใบเสนอราคา
              </Button>
            )}
            {onUpdateStatus && proposal.status === 'pending' && (
              <Button variant="outline" onClick={() => setShowStatusModal(true)}>
                ✏️ อัปเดตสถานะ
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Send Modal */}
      {showSendModal && (
        <Modal onClose={() => setShowSendModal(false)}>
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">ส่งใบเสนอราคา</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ช่องทางการส่ง
                </label>
                <select
                  value={sendChannel}
                  onChange={(e) => setSendChannel(e.target.value as 'line' | 'email')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="line">LINE</option>
                  <option value="email">Email</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ผู้รับ {sendChannel === 'line' ? '(LINE User ID)' : '(อีเมล)'}
                </label>
                <input
                  type="text"
                  value={sendRecipient}
                  onChange={(e) => setSendRecipient(e.target.value)}
                  placeholder={sendChannel === 'line' ? 'U1234567890...' : 'customer@example.com'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ข้อความ (ไม่บังคับ)
                </label>
                <textarea
                  value={sendMessage}
                  onChange={(e) => setSendMessage(e.target.value)}
                  rows={3}
                  placeholder="เพิ่มข้อความส่วนตัว..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button
                  variant="secondary"
                  onClick={() => setShowSendModal(false)}
                  disabled={isSending}
                >
                  ยกเลิก
                </Button>
                <Button variant="primary" onClick={handleSend} disabled={isSending}>
                  {isSending ? 'กำลังส่ง...' : 'ส่ง'}
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Status Modal */}
      {showStatusModal && (
        <Modal onClose={() => setShowStatusModal(false)}>
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">อัปเดตสถานะ</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">สถานะ</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as 'accepted' | 'declined' | 'expired')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="accepted">ยอมรับ</option>
                  <option value="declined">ปฏิเสธ</option>
                  <option value="expired">หมดอายุ</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  หมายเหตุ (ไม่บังคับ)
                </label>
                <textarea
                  value={responseNotes}
                  onChange={(e) => setResponseNotes(e.target.value)}
                  rows={3}
                  placeholder="เพิ่มหมายเหตุ..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button
                  variant="secondary"
                  onClick={() => setShowStatusModal(false)}
                  disabled={isUpdating}
                >
                  ยกเลิก
                </Button>
                <Button variant="primary" onClick={handleUpdateStatus} disabled={isUpdating}>
                  {isUpdating ? 'กำลังอัปเดต...' : 'อัปเดต'}
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
