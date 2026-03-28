'use client'

import React, { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Modal } from '@/components/ui/Modal'
import { usePrivacy } from '@/hooks/usePrivacy'
import { DeletionRequestStatus, DeletionRequestType } from '@/types/privacy'

interface DataDeletionRequestProps {
  onRequestCreated?: () => void
}

const STATUS_COLORS: Record<DeletionRequestStatus, string> = {
  [DeletionRequestStatus.PENDING]: 'bg-yellow-100 text-yellow-800',
  [DeletionRequestStatus.PROCESSING]: 'bg-blue-100 text-blue-800',
  [DeletionRequestStatus.COMPLETED]: 'bg-green-100 text-green-800',
  [DeletionRequestStatus.REJECTED]: 'bg-red-100 text-red-800',
}

export function DataDeletionRequest({ onRequestCreated }: DataDeletionRequestProps) {
  const t = useTranslations('dataDeletion')
  const {
    deletionRequests,
    fetchDeletionRequests,
    createDeletionRequest,
    cancelDeletionRequest,
    isLoadingDeletion: _isLoadingDeletion,
    deletionError,
  } = usePrivacy()

  const [showModal, setShowModal] = useState(false)
  const [requestType, setRequestType] = useState<DeletionRequestType>(
    DeletionRequestType.FULL_DELETION
  )
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [cancellingId, setCancellingId] = useState<string | null>(null)

  useEffect(() => {
    fetchDeletionRequests()
  }, [fetchDeletionRequests])

  const handleCreateRequest = async () => {
    setIsSubmitting(true)
    try {
      await createDeletionRequest({
        request_type: requestType,
        notes: notes || undefined,
      })
      setShowModal(false)
      setNotes('')
      onRequestCreated?.()
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to create deletion request:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancelRequest = async (requestId: string) => {
    if (!confirm(t('cancel'))) {
      return
    }
    setCancellingId(requestId)
    try {
      await cancelDeletionRequest(requestId)
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to cancel deletion request:', error)
    } finally {
      setCancellingId(null)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const hasPendingRequest = deletionRequests?.requests.some(
    (r) => r.status === DeletionRequestStatus.PENDING
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">{t('title')}</h2>
          <p className="text-sm text-gray-600 mt-1">{t('subtitle')}</p>
        </div>
        <Button variant="outline" onClick={() => setShowModal(true)} disabled={hasPendingRequest}>
          {t('submit')}
        </Button>
      </div>

      {hasPendingRequest && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">{t('warning')}</p>
        </div>
      )}

      {deletionError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {deletionError}
        </div>
      )}

      {/* Request List — no requests empty state */}
      {deletionRequests && deletionRequests.requests.length > 0 ? (
        <div className="space-y-4">
          {deletionRequests.requests.map((request) => (
            <Card key={request.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">
                      {request.request_type === DeletionRequestType.FULL_DELETION
                        ? t('noLongerNeeded')
                        : t('switchingService')}
                    </span>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        STATUS_COLORS[request.status as DeletionRequestStatus]
                      }`}
                    >
                      {request.status === DeletionRequestStatus.PENDING
                        ? t('submit')
                        : request.status === DeletionRequestStatus.COMPLETED
                          ? t('success')
                          : request.status === DeletionRequestStatus.REJECTED
                            ? t('error')
                            : t('submitting')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {t('timeline')}: {formatDate(request.requested_at)}
                  </p>
                  {request.notes && (
                    <p className="text-sm text-gray-600">
                      {t('additionalInfo')}: {request.notes}
                    </p>
                  )}
                  {request.rejection_reason && (
                    <p className="text-sm text-red-600">
                      {t('error')}: {request.rejection_reason}
                    </p>
                  )}
                  {request.completed_at && (
                    <p className="text-sm text-green-600">
                      {t('success')}: {formatDate(request.completed_at)}
                    </p>
                  )}
                </div>
                {request.status === DeletionRequestStatus.PENDING && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCancelRequest(request.id)}
                    disabled={cancellingId === request.id}
                    className="text-red-600 hover:text-red-700"
                  >
                    {cancellingId === request.id ? t('submitting') : t('cancel')}
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-8 text-center">
          <p className="text-gray-500">{t('errorDesc')}</p>
        </Card>
      )}

      {/* Create Request Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={t('title')}>
        <div className="space-y-4">
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">
              <strong>{t('warning')}:</strong> {t('warningDesc')}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('reason')}</label>
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="requestType"
                  value={DeletionRequestType.FULL_DELETION}
                  checked={requestType === DeletionRequestType.FULL_DELETION}
                  onChange={() => setRequestType(DeletionRequestType.FULL_DELETION)}
                  className="h-4 w-4 text-blue-600"
                />
                <span>{t('noLongerNeeded')}</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="requestType"
                  value={DeletionRequestType.PARTIAL_DELETION}
                  checked={requestType === DeletionRequestType.PARTIAL_DELETION}
                  onChange={() => setRequestType(DeletionRequestType.PARTIAL_DELETION)}
                  className="h-4 w-4 text-blue-600"
                />
                <span>{t('switchingService')}</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('additionalInfo')}
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full rounded-md border border-gray-300 p-2 text-sm"
              placeholder={t('additionalInfoPlaceholder')}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={() => setShowModal(false)} className="flex-1">
              {t('cancel')}
            </Button>
            <Button
              variant="primary"
              onClick={handleCreateRequest}
              disabled={isSubmitting}
              className="flex-1 bg-red-600 hover:bg-red-700"
            >
              {isSubmitting ? t('submitting') : t('submit')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default DataDeletionRequest
