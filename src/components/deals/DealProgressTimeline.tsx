'use client'

import { DealMilestone, DealStage, DEAL_STAGE_LABELS, DEAL_STAGE_ORDER } from '@/types/quotes'

interface DealProgressTimelineProps {
  currentStage: DealStage
  milestones: DealMilestone[]
  onCompleteStage?: (milestone: DealMilestone) => void
  isContractor?: boolean
}

export function DealProgressTimeline({
  currentStage,
  milestones,
  onCompleteStage,
  isContractor = false,
}: DealProgressTimelineProps) {
  const currentIndex = DEAL_STAGE_ORDER.indexOf(currentStage)

  const getMilestone = (stage: DealStage) =>
    milestones.find((m) => m.stage === stage)

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return null
    try {
      return new Date(dateStr).toLocaleDateString('th-TH', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    } catch {
      return null
    }
  }

  return (
    <div className="space-y-0">
      {DEAL_STAGE_ORDER.map((stage, index) => {
        const milestone = getMilestone(stage)
        const isCompleted = milestone?.completedAt != null
        const isCurrent = stage === currentStage && !isCompleted
        const isPending = index > currentIndex
        const isNextAction = isContractor && isCurrent

        return (
          <div key={stage} className="flex gap-4">
            {/* Timeline indicator */}
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10 transition-colors ${
                  isCompleted
                    ? 'bg-green-500 text-white'
                    : isCurrent
                    ? 'bg-orange-500 text-white ring-4 ring-orange-100'
                    : 'bg-gray-200 text-gray-400'
                }`}
              >
                {isCompleted ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                ) : isCurrent ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : (
                  <span className="text-xs font-bold">{index + 1}</span>
                )}
              </div>
              {/* Connector line */}
              {index < DEAL_STAGE_ORDER.length - 1 && (
                <div
                  className={`w-0.5 flex-1 min-h-[1.5rem] transition-colors ${
                    isCompleted ? 'bg-green-300' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>

            {/* Content */}
            <div className={`pb-4 flex-1 ${index < DEAL_STAGE_ORDER.length - 1 ? 'mb-0' : ''}`}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <p
                    className={`text-sm font-medium ${
                      isCompleted
                        ? 'text-green-700'
                        : isCurrent
                        ? 'text-orange-700'
                        : 'text-gray-400'
                    }`}
                  >
                    {DEAL_STAGE_LABELS[stage]}
                  </p>

                  {/* Dates */}
                  {isCompleted && milestone?.completedAt && (
                    <p className="text-xs text-gray-500 mt-0.5">
                      เสร็จสิ้น: {formatDate(milestone.completedAt)}
                    </p>
                  )}
                  {isCurrent && milestone?.plannedDate && (
                    <p className="text-xs text-orange-600 mt-0.5">
                      กำหนด: {formatDate(milestone.plannedDate)}
                    </p>
                  )}
                  {isPending && milestone?.plannedDate && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      วางแผน: {formatDate(milestone.plannedDate)}
                    </p>
                  )}

                  {/* Notes */}
                  {isCompleted && milestone?.notes && (
                    <p className="text-xs text-gray-600 mt-1 bg-gray-50 rounded px-2 py-1">
                      {milestone.notes}
                    </p>
                  )}

                  {/* Photos */}
                  {isCompleted && milestone?.photos && milestone.photos.length > 0 && (
                    <div className="mt-2 flex gap-2 flex-wrap">
                      {milestone.photos.map((url, i) => (
                        <a
                          key={i}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 bg-blue-50 px-2 py-1 rounded"
                        >
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          รูปที่ {i + 1}
                        </a>
                      ))}
                    </div>
                  )}

                  {/* Documents */}
                  {isCompleted && milestone?.documents && milestone.documents.length > 0 && (
                    <div className="mt-2 flex gap-2 flex-wrap">
                      {milestone.documents.map((url, i) => (
                        <a
                          key={i}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs text-purple-600 hover:text-purple-800 bg-purple-50 px-2 py-1 rounded"
                        >
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          เอกสาร {i + 1}
                        </a>
                      ))}
                    </div>
                  )}
                </div>

                {/* Contractor action button */}
                {isNextAction && onCompleteStage && milestone && (
                  <button
                    onClick={() => onCompleteStage(milestone)}
                    className="flex-shrink-0 text-xs px-3 py-1.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-medium"
                  >
                    อัพเดต
                  </button>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
