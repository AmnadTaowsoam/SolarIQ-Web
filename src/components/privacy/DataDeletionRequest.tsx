'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { usePrivacy } from '@/hooks/usePrivacy';
import {
  DeletionRequestStatus,
  DeletionRequestType,
  DeletionRequestResponse,
} from '@/types/privacy';

interface DataDeletionRequestProps {
  onRequestCreated?: () => void;
}

const STATUS_LABELS: Record<DeletionRequestStatus, string> = {
  [DeletionRequestStatus.PENDING]: 'รอดำเนินการ',
  [DeletionRequestStatus.PROCESSING]: 'กำลังดำเนินการ',
  [DeletionRequestStatus.COMPLETED]: 'เสร็จสิ้น',
  [DeletionRequestStatus.REJECTED]: 'ถูกปฏิเสธ',
};

const STATUS_COLORS: Record<DeletionRequestStatus, string> = {
  [DeletionRequestStatus.PENDING]: 'bg-yellow-100 text-yellow-800',
  [DeletionRequestStatus.PROCESSING]: 'bg-blue-100 text-blue-800',
  [DeletionRequestStatus.COMPLETED]: 'bg-green-100 text-green-800',
  [DeletionRequestStatus.REJECTED]: 'bg-red-100 text-red-800',
};

const TYPE_LABELS: Record<DeletionRequestType, string> = {
  [DeletionRequestType.FULL_DELETION]: 'ลบข้อมูลทั้งหมด',
  [DeletionRequestType.PARTIAL_DELETION]: 'ลบข้อมูลบางส่วน',
};

export function DataDeletionRequest({ onRequestCreated }: DataDeletionRequestProps) {
  const {
    deletionRequests,
    fetchDeletionRequests,
    createDeletionRequest,
    cancelDeletionRequest,
    isLoadingDeletion,
    deletionError,
  } = usePrivacy();

  const [showModal, setShowModal] = useState(false);
  const [requestType, setRequestType] = useState<DeletionRequestType>(DeletionRequestType.FULL_DELETION);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  useEffect(() => {
    fetchDeletionRequests();
  }, [fetchDeletionRequests]);

  const handleCreateRequest = async () => {
    setIsSubmitting(true);
    try {
      await createDeletionRequest({
        request_type: requestType,
        notes: notes || undefined,
      });
      setShowModal(false);
      setNotes('');
      onRequestCreated?.();
    } catch (error) {
      console.error('Failed to create deletion request:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelRequest = async (requestId: string) => {
    if (!confirm('คุณแน่ใจหรือไม่ที่จะยกเลิกคำขอนี้?')) {
      return;
    }
    setCancellingId(requestId);
    try {
      await cancelDeletionRequest(requestId);
    } catch (error) {
      console.error('Failed to cancel deletion request:', error);
    } finally {
      setCancellingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const hasPendingRequest = deletionRequests?.requests.some(
    (r) => r.status === DeletionRequestStatus.PENDING
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">คำขอลบข้อมูล</h2>
          <p className="text-sm text-gray-600 mt-1">
            ขอให้ลบข้อมูลส่วนบุคคลของคุณตามสิทธิ์ PDPA
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => setShowModal(true)}
          disabled={hasPendingRequest}
        >
          ขอลบข้อมูล
        </Button>
      </div>

      {hasPendingRequest && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            คุณมีคำขอลบข้อมูลที่รอดำเนินการอยู่ กรุณารอให้คำขอนั้นดำเนินการเสร็จก่อน
          </p>
        </div>
      )}

      {deletionError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {deletionError}
        </div>
      )}

      {/* Request List */}
      {deletionRequests && deletionRequests.requests.length > 0 ? (
        <div className="space-y-4">
          {deletionRequests.requests.map((request) => (
            <Card key={request.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">
                      {TYPE_LABELS[request.request_type as DeletionRequestType]}
                    </span>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        STATUS_COLORS[request.status as DeletionRequestStatus]
                      }`}
                    >
                      {STATUS_LABELS[request.status as DeletionRequestStatus]}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    ส่งคำขอเมื่อ: {formatDate(request.requested_at)}
                  </p>
                  {request.notes && (
                    <p className="text-sm text-gray-600">หมายเหตุ: {request.notes}</p>
                  )}
                  {request.rejection_reason && (
                    <p className="text-sm text-red-600">
                      เหตุผลการปฏิเสธ: {request.rejection_reason}
                    </p>
                  )}
                  {request.completed_at && (
                    <p className="text-sm text-green-600">
                      ดำเนินการเสร็จสิ้นเมื่อ: {formatDate(request.completed_at)}
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
                    {cancellingId === request.id ? 'กำลังยกเลิก...' : 'ยกเลิก'}
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-8 text-center">
          <p className="text-gray-500">ไม่มีคำขอลบข้อมูล</p>
        </Card>
      )}

      {/* Create Request Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="ขอลบข้อมูลส่วนบุคคล">
        <div className="space-y-4">
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">
              <strong>คำเตือน:</strong> การลบข้อมูลทั้งหมดจะทำให้คุณไม่สามารถเข้าถึงบริการได้อีก
              และข้อมูลทั้งหมดจะถูกลบอย่างถาวร
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ประเภทการลบ
            </label>
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
                <span>ลบข้อมูลทั้งหมด</span>
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
                <span>ลบข้อมูลบางส่วน</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              หมายเหตุ (ไม่บังคับ)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full rounded-md border border-gray-300 p-2 text-sm"
              placeholder="เช่น เหตุผลที่ต้องการลบข้อมูล..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowModal(false)}
              className="flex-1"
            >
              ยกเลิก
            </Button>
            <Button
              variant="primary"
              onClick={handleCreateRequest}
              disabled={isSubmitting}
              className="flex-1 bg-red-600 hover:bg-red-700"
            >
              {isSubmitting ? 'กำลังส่งคำขอ...' : 'ส่งคำขอ'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default DataDeletionRequest;
