import React, { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Proposal, SendProposalRequest, UpdateStatusRequest } from '../../hooks/useProposals'
import { Button } from '../ui/Button'
import { Modal } from '../ui/Modal'
import { Badge } from '../ui/Badge'

interface ProposalPreviewProps {
  proposal: Proposal
  onSend?: (proposalId: string, request: SendProposalRequest) => Promise<void>
  onUpdateStatus?: (proposalId: string, request: UpdateStatusRequest) => Promise<void>
  onRegenerate?: (proposalId: string) => void
  onGetPdfUrl?: (proposal: Proposal) => Promise<string | null>
}

export function ProposalPreview({
  proposal,
  onSend,
  onUpdateStatus,
  onRegenerate,
  onGetPdfUrl,
}: ProposalPreviewProps) {
  const t = useTranslations('proposalPreview')
  const [showSendModal, setShowSendModal] = useState(false)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [isLoadingPdf, setIsLoadingPdf] = useState(false)
  const [sendChannel, setSendChannel] = useState<'line' | 'email'>('line')
  const [sendRecipient, setSendRecipient] = useState('')
  const [sendMessage, setSendMessage] = useState('')
  const [status, setStatus] = useState<'accepted' | 'declined' | 'expired'>('accepted')
  const [responseNotes, setResponseNotes] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: t('note'), color: 'bg-yellow-500/10 text-yellow-600' },
      accepted: { label: t('accept'), color: 'bg-green-500/10 text-green-800' },
      declined: { label: t('decline'), color: 'bg-red-100 text-red-400' },
      expired: {
        label: t('validUntil'),
        color: 'bg-[var(--brand-background)] text-[var(--brand-text)]',
      },
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
    <div className="bg-[var(--brand-surface)] rounded-lg shadow-sm border border-[var(--brand-border)] overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-white text-lg font-bold">{t('title')}</h3>
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
          <div className="bg-blue-500/10 rounded-lg p-4 text-center">
            <div className="text-sm text-[var(--brand-text-secondary)] mb-1">{t('systemSize')}</div>
            <div className="text-2xl font-bold text-blue-900">
              {proposal.system_size_kw.toFixed(2)} <span className="text-sm font-normal">kWp</span>
            </div>
          </div>
          <div className="bg-green-500/10 rounded-lg p-4 text-center">
            <div className="text-sm text-[var(--brand-text-secondary)] mb-1">
              {t('installationCost')}
            </div>
            <div className="text-2xl font-bold text-green-900">
              {formatCurrency(proposal.estimated_cost)}
            </div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 text-center">
            <div className="text-sm text-[var(--brand-text-secondary)] mb-1">{t('payback')}</div>
            <div className="text-2xl font-bold text-purple-900">
              {proposal.payback_years.toFixed(1)}{' '}
              <span className="text-sm font-normal">{t('years')}</span>
            </div>
          </div>
          <div className="bg-amber-50 rounded-lg p-4 text-center">
            <div className="text-sm text-[var(--brand-text-secondary)] mb-1">
              {t('annualSavings')}
            </div>
            <div className="text-2xl font-bold text-amber-900">
              {formatCurrency(proposal.annual_savings / 12)}
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b border-[var(--brand-border)]">
            <span className="text-[var(--brand-text-secondary)]">{t('annualProduction')}</span>
            <span className="font-semibold">{proposal.annual_production_kwh.toFixed(0)} kWh</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-[var(--brand-border)]">
            <span className="text-[var(--brand-text-secondary)]">{t('annualSavings')}</span>
            <span className="font-semibold text-green-600">
              {formatCurrency(proposal.annual_savings)}
            </span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-[var(--brand-border)]">
            <span className="text-[var(--brand-text-secondary)]">
              {t('roi')} 25 {t('years')}
            </span>
            <span className="font-semibold text-blue-600">{proposal.roi_percent.toFixed(1)}%</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-[var(--brand-border)]">
            <span className="text-[var(--brand-text-secondary)]">{t('validUntil')}</span>
            <span className="font-semibold">{formatDate(proposal.valid_until)}</span>
          </div>
        </div>

        {/* Tracking Info */}
        <div className="bg-[var(--brand-background)] rounded-lg p-4 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-[var(--brand-text-secondary)]">{t('page')}</span>
            <span className="font-semibold">{proposal.view_count}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-[var(--brand-text-secondary)]">{t('of')}</span>
            <span className="font-semibold">
              {Math.floor(proposal.total_view_duration_seconds / 60)} {t('of')}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-[var(--brand-text-secondary)]">{t('share')} LINE</span>
            <span className="font-semibold">{proposal.sent_via_line ? '✅' : '❌'}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-[var(--brand-text-secondary)]">{t('email')}</span>
            <span className="font-semibold">{proposal.sent_via_email ? '✅' : '❌'}</span>
          </div>
          {proposal.last_viewed_at && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-[var(--brand-text-secondary)]">{t('date')}</span>
              <span className="font-semibold text-sm">{formatDate(proposal.last_viewed_at)}</span>
            </div>
          )}
        </div>

        {/* AI Summary */}
        {proposal.ai_summary && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <h4 className="font-semibold text-amber-900 mb-2">{t('executiveSummary')}</h4>
            <p className="text-sm text-amber-800 whitespace-pre-wrap">{proposal.ai_summary}</p>
          </div>
        )}

        {/* Custom Notes */}
        {proposal.custom_notes && (
          <div className="bg-blue-500/10 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">{t('note')}</h4>
            <p className="text-sm text-blue-800 whitespace-pre-wrap">{proposal.custom_notes}</p>
          </div>
        )}

        {/* Response Notes */}
        {proposal.response_notes && (
          <div className="bg-[var(--brand-background)] border border-[var(--brand-border)] rounded-lg p-4">
            <h4 className="font-semibold text-[var(--brand-text)] mb-2">{t('terms')}</h4>
            <p className="text-sm text-[var(--brand-text)] whitespace-pre-wrap">
              {proposal.response_notes}
            </p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="bg-[var(--brand-background)] px-6 py-4 border-t border-[var(--brand-border)]">
        <div className="flex flex-wrap gap-2 justify-between">
          <div className="flex gap-2">
            {proposal.pdf_url && (
              <Button
                variant="secondary"
                disabled={isLoadingPdf}
                onClick={async () => {
                  if (onGetPdfUrl) {
                    setIsLoadingPdf(true)
                    try {
                      const url = await onGetPdfUrl(proposal)
                      if (url) {
                        window.open(url, '_blank')
                      }
                    } finally {
                      setIsLoadingPdf(false)
                    }
                  } else {
                    if (proposal.pdf_url) {
                      window.open(proposal.pdf_url, '_blank')
                    }
                  }
                }}
              >
                {isLoadingPdf ? '⏳' : '📄'} {t('download')}
              </Button>
            )}
            {onRegenerate && (
              <Button variant="outline" onClick={() => onRegenerate(proposal.id)}>
                🔄 {t('print')}
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            {onSend && proposal.status === 'pending' && (
              <Button variant="primary" onClick={() => setShowSendModal(true)}>
                📤 {t('title')}
              </Button>
            )}
            {onUpdateStatus && proposal.status === 'pending' && (
              <Button variant="outline" onClick={() => setShowStatusModal(true)}>
                ✏️ {t('nextSteps')}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Send Modal */}
      {showSendModal && (
        <Modal isOpen={showSendModal} onClose={() => setShowSendModal(false)}>
          <div className="bg-[var(--brand-surface)] rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">{t('title')}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--brand-text)] mb-2">
                  {t('contactUs')}
                </label>
                <select
                  value={sendChannel}
                  onChange={(e) => setSendChannel(e.target.value as 'line' | 'email')}
                  className="w-full px-3 py-2 border border-[var(--brand-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="line">LINE</option>
                  <option value="email">Email</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--brand-text)] mb-2">
                  {t('preparedFor')} {sendChannel === 'line' ? '(LINE User ID)' : `(${t('email')})`}
                </label>
                <input
                  type="text"
                  value={sendRecipient}
                  onChange={(e) => setSendRecipient(e.target.value)}
                  placeholder={sendChannel === 'line' ? 'U1234567890...' : 'customer@example.com'}
                  className="w-full px-3 py-2 border border-[var(--brand-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--brand-text)] mb-2">
                  {t('note')}
                </label>
                <textarea
                  value={sendMessage}
                  onChange={(e) => setSendMessage(e.target.value)}
                  rows={3}
                  placeholder="เพิ่มข้อความส่วนตัว..."
                  className="w-full px-3 py-2 border border-[var(--brand-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button
                  variant="secondary"
                  onClick={() => setShowSendModal(false)}
                  disabled={isSending}
                >
                  {t('decline')}
                </Button>
                <Button variant="primary" onClick={handleSend} disabled={isSending}>
                  {isSending ? `${t('contactUs')}...` : t('share')}
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Status Modal */}
      {showStatusModal && (
        <Modal isOpen={showStatusModal} onClose={() => setShowStatusModal(false)}>
          <div className="bg-[var(--brand-surface)] rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">{t('nextSteps')}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--brand-text)] mb-2">
                  {t('financialAnalysis')}
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as 'accepted' | 'declined' | 'expired')}
                  className="w-full px-3 py-2 border border-[var(--brand-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="accepted">{t('accept')}</option>
                  <option value="declined">{t('decline')}</option>
                  <option value="expired">{t('validUntil')}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--brand-text)] mb-2">
                  {t('note')}
                </label>
                <textarea
                  value={responseNotes}
                  onChange={(e) => setResponseNotes(e.target.value)}
                  rows={3}
                  placeholder="เพิ่มหมายเหตุ..."
                  className="w-full px-3 py-2 border border-[var(--brand-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button
                  variant="secondary"
                  onClick={() => setShowStatusModal(false)}
                  disabled={isUpdating}
                >
                  {t('decline')}
                </Button>
                <Button variant="primary" onClick={handleUpdateStatus} disabled={isUpdating}>
                  {isUpdating ? `${t('nextSteps')}...` : t('accept')}
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
