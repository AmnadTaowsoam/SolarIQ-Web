'use client'

import { useState, useRef } from 'react'
import { useTranslations } from 'next-intl'
import { DealMilestone, DealStage, DEAL_STAGE_LABELS } from '@/types/quotes'

interface MilestoneCardProps {
  milestone: DealMilestone
  onComplete: (milestoneId: string, notes: string, photos: string[]) => Promise<void>
  onUploadPhoto: (dealId: string, milestoneId: string, file: File) => Promise<string>
  isLoading?: boolean
}

export function MilestoneCard({
  milestone,
  onComplete,
  onUploadPhoto,
  isLoading,
}: MilestoneCardProps) {
  const t = useTranslations('milestoneCard')
  const [notes, setNotes] = useState('')
  const [photos, setPhotos] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const isCompleted = !!milestone.completedAt

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) {
      return
    }
    setUploading(true)
    try {
      const urls = await Promise.all(
        Array.from(files).map((f) => onUploadPhoto(milestone.dealId, milestone.id, f))
      )
      setPhotos((prev) => [...prev, ...urls])
    } catch {
      // ignore upload error
    } finally {
      setUploading(false)
    }
  }

  const handleComplete = async () => {
    await onComplete(milestone.id, notes, photos)
  }

  const formatDate = (dateStr?: string) => {
    if (!dateStr) {
      return '—'
    }
    return new Date(dateStr).toLocaleDateString('th-TH', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  return (
    <div
      className={`border rounded-xl overflow-hidden transition-all ${
        isCompleted ? 'border-green-200 bg-green-50' : 'border-orange-200 bg-orange-50'
      }`}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between p-4 cursor-pointer"
        onClick={() => !isCompleted && setExpanded((p) => !p)}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
              isCompleted ? 'bg-green-500 text-white' : 'bg-orange-500 text-white'
            }`}
          >
            {isCompleted ? (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            )}
          </div>
          <div>
            <p
              className={`font-medium text-sm ${isCompleted ? 'text-green-800' : 'text-orange-800'}`}
            >
              {DEAL_STAGE_LABELS[milestone.stage as DealStage]}
            </p>
            <p className="text-xs text-[var(--brand-text-secondary)]">
              {isCompleted
                ? `${t('completed')}: ${formatDate(milestone.completedAt)}`
                : `${t('dueDate')}: ${formatDate(milestone.plannedDate)}`}
            </p>
          </div>
        </div>

        {!isCompleted && (
          <svg
            className={`w-4 h-4 text-[var(--brand-text-secondary)] transition-transform ${expanded ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </div>

      {/* Completed content */}
      {isCompleted && (
        <div className="px-4 pb-4 space-y-2">
          {milestone.notes && (
            <p className="text-xs text-[var(--brand-text-secondary)] bg-[var(--brand-surface)] rounded-lg px-3 py-2">
              {milestone.notes}
            </p>
          )}
          {milestone.photos.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {milestone.photos.map((url, i) => (
                <a
                  key={i}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 bg-[var(--brand-surface)] px-2 py-1 rounded border border-blue-100 hover:border-blue-300"
                >
                  {i + 1}
                </a>
              ))}
            </div>
          )}
          {milestone.documents.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {milestone.documents.map((url, i) => (
                <a
                  key={i}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-purple-600 bg-[var(--brand-surface)] px-2 py-1 rounded border border-purple-100 hover:border-purple-300"
                >
                  {i + 1}
                </a>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Expandable action form */}
      {!isCompleted && expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-orange-200">
          <div className="pt-3">
            <label className="block text-xs font-medium text-[var(--brand-text)] mb-1">
              {t('name')}
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="..."
              className="w-full text-sm border border-[var(--brand-border)] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--brand-text)] mb-1">
              {t('status')}
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFileChange}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="w-full py-2 border-2 border-dashed border-orange-300 rounded-lg text-sm text-orange-600 hover:bg-orange-50 transition-colors disabled:opacity-50"
            >
              {uploading ? '...' : '+'}
            </button>
            {photos.length > 0 && (
              <div className="mt-2 flex gap-2 flex-wrap">
                {photos.map((url, i) => (
                  <div key={i} className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={url}
                      alt={`Photo ${i + 1}`}
                      className="w-16 h-16 object-cover rounded-lg border border-orange-200"
                    />
                    <button
                      onClick={() => setPhotos((p) => p.filter((_, pi) => pi !== i))}
                      className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-xs flex items-center justify-center"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={handleComplete}
            disabled={isLoading}
            className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-bold transition-colors disabled:opacity-50"
          >
            {isLoading ? '...' : t('save')}
          </button>
        </div>
      )}
    </div>
  )
}
