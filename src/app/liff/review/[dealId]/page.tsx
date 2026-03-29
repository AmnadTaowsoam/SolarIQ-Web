'use client'
import Image from 'next/image'

// WK-026: Review LIFF Page — Contractor review submission form

import { useCallback, useEffect, useRef, useState } from 'react'
import { useParams } from 'next/navigation'
import { api } from '@/lib/api'
import type { AxiosRequestConfig } from 'axios'
import { useTranslations } from 'next-intl'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ReviewRequest {
  deal_id: string
  contractor_id: string
  contractor_name: string
  contractor_logo?: string
  deal_summary: string
  already_reviewed: boolean
  existing_review?: ExistingReview
}

interface ExistingReview {
  overall_rating: number
  dimensions: ReviewDimensions
  review_text: string
  created_at: string
  photos?: string[]
}

interface ReviewDimensions {
  quality: number
  communication: number
  timeline: number
  cleanliness: number
  value_for_money: number
}

interface ReviewFormData {
  dimensions: ReviewDimensions
  review_text: string
  photos: File[]
}

// ---------------------------------------------------------------------------
// Dimension labels
// ---------------------------------------------------------------------------

const DIMENSION_LABELS: Record<keyof ReviewDimensions, string> = {
  quality: 'quality',
  communication: 'communication',
  timeline: 'timeline',
  cleanliness: 'cleanliness',
  value_for_money: 'valueForMoney',
}

const DIMENSION_KEYS = Object.keys(DIMENSION_LABELS) as (keyof ReviewDimensions)[]

// ---------------------------------------------------------------------------
// Image compression utility
// ---------------------------------------------------------------------------

async function compressImage(file: File, maxWidthPx = 1200, qualityJpeg = 0.8): Promise<File> {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let { width, height } = img
        if (width > maxWidthPx) {
          height = Math.round((height * maxWidthPx) / width)
          width = maxWidthPx
        }
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          resolve(file)
          return
        }
        ctx.drawImage(img, 0, 0, width, height)
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(file)
              return
            }
            resolve(new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' }))
          },
          'image/jpeg',
          qualityJpeg
        )
      }
      img.src = e.target?.result as string
    }
    reader.readAsDataURL(file)
  })
}

// ---------------------------------------------------------------------------
// Star Rating Component
// ---------------------------------------------------------------------------

function StarRating({
  value,
  onChange,
  size = 'md',
  readonly = false,
}: {
  value: number
  onChange?: (v: number) => void
  size?: 'sm' | 'md' | 'lg'
  readonly?: boolean
}) {
  const [hovered, setHovered] = useState(0)

  const sizeClass = size === 'lg' ? 'w-9 h-9' : size === 'sm' ? 'w-5 h-5' : 'w-7 h-7'
  const display = readonly ? value : hovered || value

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(star)}
          onMouseEnter={() => !readonly && setHovered(star)}
          onMouseLeave={() => !readonly && setHovered(0)}
          className={`transition-transform ${!readonly ? 'hover:scale-110 cursor-pointer' : 'cursor-default'}`}
          aria-label={`${star} stars`}
        >
          <svg
            className={sizeClass}
            viewBox="0 0 24 24"
            fill={star <= display ? '#f59e0b' : 'none'}
            stroke={star <= display ? '#f59e0b' : '#d1d5db'}
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
            />
          </svg>
        </button>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Loading skeleton
// ---------------------------------------------------------------------------

function ReviewSkeleton() {
  return (
    <div className="min-h-screen bg-[var(--brand-background)] pb-24 animate-pulse">
      <div className="bg-orange-500 px-4 py-5 h-20" />
      <div className="px-4 py-6 space-y-4 max-w-lg mx-auto">
        <div className="bg-[var(--brand-surface)] rounded-2xl p-4 h-24" />
        <div className="bg-[var(--brand-surface)] rounded-2xl p-4 h-48" />
        <div className="bg-[var(--brand-surface)] rounded-2xl p-4 h-32" />
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Read-only review display
// ---------------------------------------------------------------------------

function ExistingReviewView({ review, t }: { review: ExistingReview; t: (key: string) => string }) {
  const overallAvg = Math.round(
    Object.values(review.dimensions).reduce((a, b) => a + b, 0) / DIMENSION_KEYS.length
  )

  return (
    <div className="space-y-5">
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-center">
        <p className="text-amber-700 font-semibold text-sm">{t('states.alreadyReviewed.title')}</p>
        <p className="text-amber-600 text-xs mt-1">
          {t('states.alreadyReviewed.submittedOn')}{' '}
          {new Date(review.created_at).toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
      </div>

      <div className="bg-[var(--brand-surface)] rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <span className="font-semibold text-[var(--brand-text)]">
            {t('states.alreadyReviewed.yourReview')}
          </span>
          <div className="flex items-center gap-2">
            <StarRating value={overallAvg} readonly size="md" />
            <span className="text-lg font-bold text-amber-500">{overallAvg}/5</span>
          </div>
        </div>
        <div className="space-y-3">
          {DIMENSION_KEYS.map((key) => (
            <div key={key} className="flex items-center justify-between">
              <span className="text-sm text-[var(--brand-text-secondary)]">
                {t(`dimensions.${DIMENSION_LABELS[key]}`)}
              </span>
              <StarRating value={review.dimensions[key]} readonly size="sm" />
            </div>
          ))}
        </div>
      </div>

      {review.review_text && (
        <div className="bg-[var(--brand-surface)] rounded-2xl p-5 shadow-sm">
          <h3 className="font-semibold text-[var(--brand-text)] mb-2 text-sm">
            {t('states.alreadyReviewed.yourReview')}
          </h3>
          <p className="text-[var(--brand-text-secondary)] text-sm leading-relaxed">
            {review.review_text}
          </p>
        </div>
      )}

      {review.photos && review.photos.length > 0 && (
        <div className="bg-[var(--brand-surface)] rounded-2xl p-5 shadow-sm">
          <h3 className="font-semibold text-[var(--brand-text)] mb-3 text-sm">
            {t('states.alreadyReviewed.attachedPhotos')}
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {review.photos.map((url, idx) => (
              <Image
                width={200}
                height={200}
                key={idx}
                src={url}
                alt={`review photo ${idx + 1}`}
                className="w-full aspect-square object-cover rounded-xl"
                unoptimized
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main Review Page
// ---------------------------------------------------------------------------

export default function ReviewPage() {
  const t = useTranslations('reviewPage')
  const params = useParams()
  const dealId = (params.dealId as string) || ''

  type PageState = 'loading' | 'form' | 'submitting' | 'success' | 'already_reviewed' | 'error'
  const [pageState, setPageState] = useState<PageState>('loading')
  const [reviewRequest, setReviewRequest] = useState<ReviewRequest | null>(null)
  const [loadError, setLoadError] = useState('')
  const [submitError, setSubmitError] = useState('')

  const [formData, setFormData] = useState<ReviewFormData>({
    dimensions: { quality: 0, communication: 0, timeline: 0, cleanliness: 0, value_for_money: 0 },
    review_text: '',
    photos: [],
  })
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([])

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Load review request info
  useEffect(() => {
    if (!dealId) {
      return
    }
    const fetchData = async () => {
      try {
        const data = await api.get<ReviewRequest>(`/api/v1/liff/reviews/request/${dealId}`)
        setReviewRequest(data)
        if (data.already_reviewed) {
          setPageState('already_reviewed')
        } else {
          setPageState('form')
        }
      } catch {
        setLoadError(t('states.error.loadError'))
        setPageState('error')
      }
    }
    fetchData()
  }, [dealId, t])

  // Computed overall rating
  const overallRating = useCallback(() => {
    const vals = Object.values(formData.dimensions).filter((v) => v > 0)
    if (vals.length === 0) {
      return 0
    }
    return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length)
  }, [formData.dimensions])

  const allDimensionsRated = DIMENSION_KEYS.every((k) => formData.dimensions[k] > 0)
  const textValid = formData.review_text.trim().length >= 10

  const canSubmit = allDimensionsRated && textValid

  // Photo handler
  const handlePhotoAdd = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const remaining = 3 - formData.photos.length
    const toAdd = files.slice(0, remaining)
    if (toAdd.length === 0) {
      return
    }

    const compressed = await Promise.all(toAdd.map((f) => compressImage(f)))
    const previews = compressed.map((f) => URL.createObjectURL(f))

    setFormData((prev) => ({ ...prev, photos: [...prev.photos, ...compressed] }))
    setPhotoPreviews((prev) => [...prev, ...previews])

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handlePhotoRemove = (idx: number) => {
    const url = photoPreviews[idx]
    if (url) {
      URL.revokeObjectURL(url)
    }
    setFormData((prev) => ({ ...prev, photos: prev.photos.filter((_, i) => i !== idx) }))
    setPhotoPreviews((prev) => prev.filter((_, i) => i !== idx))
  }

  const handleSubmit = async () => {
    if (!reviewRequest || !canSubmit) {
      return
    }

    setSubmitError('')
    setPageState('submitting')

    try {
      // Upload photos first if any
      let uploadedPhotoUrls: string[] = []
      if (formData.photos.length > 0) {
        const fd = new FormData()
        formData.photos.forEach((photo) => fd.append('photos', photo))
        const uploadConfig: AxiosRequestConfig = {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
        const uploadRes = await api.post('/api/v1/liff/reviews/photos', fd, uploadConfig)
        uploadedPhotoUrls = (uploadRes.data as { urls: string[] }).urls
      }

      // Submit review
      await api.post('/api/v1/liff/reviews', {
        deal_id: dealId,
        contractor_id: reviewRequest.contractor_id,
        overall_rating: overallRating(),
        dimensions: formData.dimensions,
        review_text: formData.review_text.trim(),
        photos: uploadedPhotoUrls,
      })

      setPageState('success')
    } catch {
      setSubmitError(t('states.error.submitError'))
      setPageState('form')
    }
  }

  // Loading state
  if (pageState === 'loading') {
    return <ReviewSkeleton />
  }

  // Error state
  if (pageState === 'error') {
    return (
      <div className="min-h-screen bg-[var(--brand-background)] flex items-center justify-center p-4">
        <div className="bg-[var(--brand-surface)] rounded-2xl shadow-sm p-8 text-center max-w-sm w-full">
          <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-7 h-7 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
              />
            </svg>
          </div>
          <h2 className="font-bold text-[var(--brand-text)] mb-2">{t('states.error.title')}</h2>
          <p className="text-[var(--brand-text-secondary)] text-sm">{loadError}</p>
        </div>
      </div>
    )
  }

  // Success state
  if (pageState === 'success') {
    return (
      <div className="min-h-screen bg-[var(--brand-background)] flex items-center justify-center p-4">
        <div className="bg-[var(--brand-surface)] rounded-2xl shadow-sm p-8 text-center max-w-sm w-full">
          <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-5 animate-bounce">
            <svg
              className="w-10 h-10 text-green-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-[var(--brand-text)] mb-2">
            {t('states.success.title')}
          </h2>
          <p className="text-[var(--brand-text-secondary)] text-sm mb-5">
            {t('states.success.description')}
          </p>
          <div className="flex justify-center mb-6">
            <StarRating value={overallRating()} readonly size="lg" />
          </div>
          <p className="text-[var(--brand-text-secondary)] text-xs">
            {t('states.success.closeNotice')}
          </p>
        </div>
      </div>
    )
  }

  // Already reviewed state
  if (pageState === 'already_reviewed' && reviewRequest?.existing_review) {
    return (
      <div className="min-h-screen bg-[var(--brand-background)] pb-8">
        <div className="bg-orange-500 text-white px-4 py-5">
          <div className="max-w-lg mx-auto">
            <h1 className="text-lg font-bold">{t('states.alreadyReviewed.title')}</h1>
          </div>
        </div>
        <div className="px-4 py-6 max-w-lg mx-auto">
          {/* Contractor info */}
          <div className="bg-[var(--brand-surface)] rounded-2xl p-4 shadow-sm mb-5">
            <div className="flex items-center gap-3">
              {reviewRequest.contractor_logo ? (
                <Image
                  width={48}
                  height={48}
                  src={reviewRequest.contractor_logo}
                  alt={reviewRequest.contractor_name}
                  className="w-12 h-12 rounded-xl object-cover"
                  unoptimized
                />
              ) : (
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-orange-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18"
                    />
                  </svg>
                </div>
              )}
              <div>
                <p className="font-semibold text-[var(--brand-text)]">
                  {reviewRequest.contractor_name}
                </p>
                <p className="text-xs text-[var(--brand-text-secondary)]">
                  {reviewRequest.deal_summary}
                </p>
              </div>
            </div>
          </div>
          <ExistingReviewView review={reviewRequest.existing_review} t={t} />
        </div>
      </div>
    )
  }

  // Submitting overlay
  if (pageState === 'submitting') {
    return (
      <div className="min-h-screen bg-[var(--brand-background)] flex items-center justify-center p-4">
        <div className="bg-[var(--brand-surface)] rounded-2xl shadow-sm p-8 text-center max-w-sm w-full">
          <div className="w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="w-8 h-8 border-4 border-orange-400 border-t-transparent rounded-full animate-spin" />
          </div>
          <h2 className="font-bold text-[var(--brand-text)] mb-2">{t('states.submitting')}</h2>
          <p className="text-[var(--brand-text-secondary)] text-sm">{t('states.pleaseWait')}</p>
        </div>
      </div>
    )
  }

  // Form state
  return (
    <div className="min-h-screen bg-[var(--brand-background)] pb-28">
      {/* Header */}
      <div className="bg-orange-500 text-white px-4 py-5">
        <div className="max-w-lg mx-auto">
          <h1 className="text-lg font-bold">{t('title')}</h1>
          <p className="text-orange-100 text-xs mt-0.5">{t('subtitle')}</p>
        </div>
      </div>

      <div className="px-4 py-5 space-y-4 max-w-lg mx-auto">
        {/* Contractor info card */}
        {reviewRequest && (
          <div className="bg-[var(--brand-surface)] rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              {reviewRequest.contractor_logo ? (
                <Image
                  width={48}
                  height={48}
                  src={reviewRequest.contractor_logo}
                  alt={reviewRequest.contractor_name}
                  className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
                  unoptimized
                />
              ) : (
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-6 h-6 text-orange-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18"
                    />
                  </svg>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-[var(--brand-text)]">
                  {reviewRequest.contractor_name}
                </p>
                <p className="text-xs text-[var(--brand-text-secondary)] truncate">
                  {reviewRequest.deal_summary}
                </p>
              </div>
              <StarRating value={overallRating()} readonly size="sm" />
            </div>
          </div>
        )}

        {/* Dimension ratings */}
        <div className="bg-[var(--brand-surface)] rounded-2xl p-5 shadow-sm">
          <h2 className="font-semibold text-[var(--brand-text)] mb-4">
            {t('form.rateDimensions')}
          </h2>
          <div className="space-y-4">
            {DIMENSION_KEYS.map((key) => (
              <div key={key} className="flex items-center justify-between gap-4">
                <span className="text-sm text-[var(--brand-text)] w-24 flex-shrink-0">
                  {t(`dimensions.${DIMENSION_LABELS[key]}`)}
                </span>
                <div className="flex-1 flex justify-end">
                  <StarRating
                    value={formData.dimensions[key]}
                    onChange={(v) =>
                      setFormData((prev) => ({
                        ...prev,
                        dimensions: { ...prev.dimensions, [key]: v },
                      }))
                    }
                    size="md"
                  />
                </div>
              </div>
            ))}
          </div>
          {!allDimensionsRated && (
            <p className="text-xs text-[var(--brand-text-secondary)] mt-3">
              {t('form.allRequired')}
            </p>
          )}
        </div>

        {/* Review text */}
        <div className="bg-[var(--brand-surface)] rounded-2xl p-5 shadow-sm">
          <h2 className="font-semibold text-[var(--brand-text)] mb-3">
            {t('form.yourReview')}{' '}
            <span className="text-[var(--brand-text-secondary)] font-normal text-sm">
              {t('form.minCharacters')}
            </span>
          </h2>
          <textarea
            value={formData.review_text}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, review_text: e.target.value.slice(0, 500) }))
            }
            rows={4}
            placeholder={t('form.placeholder')}
            className="w-full rounded-xl border border-[var(--brand-border)] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
          />
          <div className="flex justify-between mt-1">
            {formData.review_text.trim().length > 0 && formData.review_text.trim().length < 10 && (
              <p className="text-xs text-red-500">ต้องการอย่างน้อย 10 ตัวอักษร</p>
            )}
            <p className="text-xs text-[var(--brand-text-secondary)] ml-auto">
              {formData.review_text.length}/500
            </p>
          </div>
        </div>

        {/* Photo upload */}
        <div className="bg-[var(--brand-surface)] rounded-2xl p-5 shadow-sm">
          <h2 className="font-semibold text-[var(--brand-text)] mb-1">
            แนบรูปภาพ{' '}
            <span className="text-[var(--brand-text-secondary)] font-normal text-sm">
              (ไม่บังคับ สูงสุด 3 รูป)
            </span>
          </h2>
          <p className="text-xs text-[var(--brand-text-secondary)] mb-3">
            รูปภาพงานติดตั้ง ระบบ หรือผลลัพธ์
          </p>

          <div className="flex gap-3 flex-wrap">
            {photoPreviews.map((preview, idx) => (
              <div key={idx} className="relative w-24 h-24">
                <Image
                  width={96}
                  height={96}
                  src={preview}
                  alt={`photo ${idx + 1}`}
                  className="w-full h-full object-cover rounded-xl"
                  unoptimized
                />
                <button
                  onClick={() => handlePhotoRemove(idx)}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-sm hover:bg-red-600 transition-colors"
                >
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}

            {formData.photos.length < 3 && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-24 h-24 border-2 border-dashed border-[var(--brand-border)] rounded-xl flex flex-col items-center justify-center hover:border-orange-400 hover:bg-orange-50 transition-colors text-[var(--brand-text-secondary)] hover:text-orange-500"
              >
                <svg className="w-6 h-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 4.5v15m7.5-7.5h-15"
                  />
                </svg>
                <span className="text-xs">{t('form.addPhoto')}</span>
              </button>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handlePhotoAdd}
          />
        </div>

        {/* Submit error */}
        {submitError && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-sm text-red-700">
            {submitError}
          </div>
        )}
      </div>

      {/* Fixed bottom submit */}
      <div className="fixed bottom-0 left-0 right-0 bg-[var(--brand-surface)] border-t border-[var(--brand-border)] px-4 py-4">
        <div className="max-w-lg mx-auto">
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl font-bold text-base transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {canSubmit ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
                  />
                </svg>
                {t('form.submit')}
              </span>
            ) : (
              <span>{t('form.incomplete')}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
