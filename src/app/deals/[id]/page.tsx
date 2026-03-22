'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/context'
import { AppLayout } from '@/components/layout'
import { Card, CardBody, CardHeader, Badge } from '@/components/ui'
import { DealProgressTimeline } from '@/components/deals/DealProgressTimeline'
import { MilestoneCard } from '@/components/deals/MilestoneCard'
import { useDeal, useUpdateDealStage, useUploadMilestonePhoto, useCompleteMilestone } from '@/hooks/useDeals'
import {
  DealStage,
  DealMilestone,
  DEAL_STAGE_LABELS,
  DEAL_STAGE_COLORS,
  DEAL_STAGE_ORDER,
} from '@/types/quotes'
import { ROUTES } from '@/lib/constants'

function formatThb(v: number) {
  return `฿${v.toLocaleString('en-US')}`
}

function getNextStage(current: DealStage): DealStage | null {
  const idx = DEAL_STAGE_ORDER.indexOf(current)
  if (idx < 0 || idx >= DEAL_STAGE_ORDER.length - 1) return null
  return DEAL_STAGE_ORDER[idx + 1]
}

export default function DealDetailPage() {
  const router = useRouter()
  const params = useParams()
  const dealId = params.id as string
  const { user, isLoading: authLoading } = useAuth()
  const { data: deal, isLoading, refetch } = useDeal(dealId)
  const { updateStage, isLoading: isUpdating } = useUpdateDealStage()
  const { upload } = useUploadMilestonePhoto()
  const { complete, isLoading: isCompleting } = useCompleteMilestone()
  const [showUpdateModal, setShowUpdateModal] = useState(false)
  const [stageNotes, setStageNotes] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace(ROUTES.LOGIN)
    }
  }, [user, authLoading, router])

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500" />
      </div>
    )
  }

  if (!user) return null

  if (!deal) {
    return (
      <AppLayout user={user}>
        <div className="text-center py-20">
          <p className="text-gray-500">ไม่พบข้อมูล Deal</p>
          <button onClick={() => router.push('/deals')} className="mt-4 text-orange-500 hover:underline text-sm">
            ← กลับไปหน้า Deals
          </button>
        </div>
      </AppLayout>
    )
  }

  const nextStage = getNextStage(deal.stage)

  const handleUpdateStage = async () => {
    if (!nextStage) return
    await updateStage(dealId, nextStage, stageNotes)
    setShowUpdateModal(false)
    setStageNotes('')
    setSuccessMsg(`อัพเดตสถานะเป็น "${DEAL_STAGE_LABELS[nextStage]}" เรียบร้อยแล้ว`)
    setTimeout(() => setSuccessMsg(''), 4000)
    refetch()
  }

  const handleCompleteMilestone = async (milestoneId: string, notes: string, photos: string[]) => {
    await complete(dealId, milestoneId, notes, photos)
    refetch()
  }

  const handleUploadPhoto = async (dealIdArg: string, milestoneId: string, file: File) => {
    return await upload(dealIdArg, milestoneId, file)
  }

  const currentMilestone = deal.milestones.find((m) => m.stage === deal.stage)

  return (
    <AppLayout user={user}>
      <div className="max-w-3xl space-y-5">
        {/* Back navigation */}
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <button onClick={() => router.push('/deals')} className="hover:text-orange-500">
            ← Deals
          </button>
          <span>/</span>
          <span>{deal.dealNumber}</span>
        </div>

        {/* Success message */}
        {successMsg && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-800">
            {successMsg}
          </div>
        )}

        {/* Deal header */}
        <Card>
          <CardBody className="p-5">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-xl font-bold text-gray-900">{deal.dealNumber}</h1>
                {deal.contractor && (
                  <p className="text-gray-500 text-sm mt-0.5">{deal.contractor.companyName}</p>
                )}
              </div>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${DEAL_STAGE_COLORS[deal.stage]}`}>
                {DEAL_STAGE_LABELS[deal.stage]}
              </span>
            </div>

            {/* Deal info */}
            {deal.quote && (
              <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-gray-500 text-xs mb-1">ขนาดระบบ</p>
                  <p className="font-semibold text-gray-900">{deal.quote.specifications.totalPanelKw} kW</p>
                  <p className="text-xs text-gray-500">{deal.quote.specifications.panelBrand} {deal.quote.specifications.panelCount} แผง</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-gray-500 text-xs mb-1">มูลค่างาน</p>
                  <p className="font-semibold text-orange-600 text-base">{formatThb(deal.totalValue)}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-gray-500 text-xs mb-1">อินเวอร์เตอร์</p>
                  <p className="font-medium text-gray-800 text-xs">{deal.quote.specifications.inverterBrand} {deal.quote.specifications.inverterCapacityKw} kW</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-gray-500 text-xs mb-1">วันเริ่มติดตั้ง</p>
                  <p className="font-medium text-gray-800 text-xs">
                    {deal.quote.timeline.installationStartDate
                      ? new Date(deal.quote.timeline.installationStartDate).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })
                      : '—'}
                  </p>
                </div>
              </div>
            )}

            {/* Contact contractor */}
            {deal.contractor && (deal.contractor.phone || deal.contractor.lineId) && (
              <div className="flex gap-2">
                {deal.contractor.phone && (
                  <a
                    href={`tel:${deal.contractor.phone}`}
                    className="flex-1 flex items-center justify-center gap-2 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    โทรศัพท์
                  </a>
                )}
                {deal.contractor.lineId && (
                  <a
                    href={`https://line.me/R/ti/p/${deal.contractor.lineId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 py-2 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.02 2 11c0 3.56 2.05 6.68 5.14 8.45.12.06.19.19.19.33v2.21c0 .25.27.41.49.29l2.5-1.45c.1-.06.22-.08.33-.05.76.2 1.56.22 2.35.22 5.52 0 10-4.02 10-9S17.52 2 12 2z" />
                    </svg>
                    LINE
                  </a>
                )}
              </div>
            )}
          </CardBody>
        </Card>

        {/* Update stage button */}
        {nextStage && deal.stage !== 'completed' && deal.stage !== 'cancelled' && (
          <button
            onClick={() => setShowUpdateModal(true)}
            className="w-full py-3.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            อัพเดตเป็น: {DEAL_STAGE_LABELS[nextStage]}
          </button>
        )}

        {/* Milestone timeline */}
        <Card>
          <CardHeader title="ความคืบหน้าการติดตั้ง" />
          <CardBody>
            <DealProgressTimeline
              currentStage={deal.stage}
              milestones={deal.milestones}
              isContractor={true}
              onCompleteStage={(milestone) => {
                // handled inline via MilestoneCard
              }}
            />
          </CardBody>
        </Card>

        {/* Current milestone action card */}
        {currentMilestone && deal.stage !== 'completed' && deal.stage !== 'cancelled' && (
          <div className="space-y-2">
            <h3 className="font-semibold text-gray-700 text-sm px-1">ขั้นตอนปัจจุบัน</h3>
            <MilestoneCard
              milestone={currentMilestone}
              onComplete={handleCompleteMilestone}
              onUploadPhoto={handleUploadPhoto}
              isLoading={isCompleting}
            />
          </div>
        )}

        {/* Deal completed */}
        {deal.stage === 'completed' && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
              <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-bold text-green-800 text-lg mb-1">งานเสร็จสมบูรณ์!</h3>
            <p className="text-green-700 text-sm">การติดตั้งระบบโซลาร์เซลล์เสร็จสิ้นเรียบร้อยแล้ว</p>
          </div>
        )}
      </div>

      {/* Update stage modal */}
      {showUpdateModal && nextStage && (
        <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="p-5 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">อัพเดตสถานะ</h3>
              <p className="text-sm text-gray-500 mt-1">
                เปลี่ยนจาก "{DEAL_STAGE_LABELS[deal.stage]}" เป็น "{DEAL_STAGE_LABELS[nextStage]}"
              </p>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">หมายเหตุ (ไม่บังคับ)</label>
                <textarea
                  value={stageNotes}
                  onChange={(e) => setStageNotes(e.target.value)}
                  rows={3}
                  placeholder="ระบุรายละเอียดเพิ่มเติม..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowUpdateModal(false)}
                  className="flex-1 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={handleUpdateStage}
                  disabled={isUpdating}
                  className="flex-1 py-2.5 bg-orange-500 text-white rounded-lg text-sm font-bold hover:bg-orange-600 disabled:opacity-50"
                >
                  {isUpdating ? 'กำลังอัพเดต...' : 'ยืนยัน'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  )
}
