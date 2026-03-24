'use client'

import Link from 'next/link'

interface TrialBannerProps {
  daysRemaining: number
  isTrialActive: boolean
  planName: string | null
}

export default function TrialBanner({ daysRemaining, isTrialActive, planName }: TrialBannerProps) {
  if (!isTrialActive) {
    return null
  }

  const urgent = daysRemaining <= 3

  return (
    <div
      className={`rounded-lg border px-4 py-3 text-sm ${urgent ? 'border-red-200 bg-red-50 text-red-800' : 'border-amber-200 bg-amber-50 text-amber-800'}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>
            {planName === 'free' ? 'แพลน Free' : `ทดลองใช้งาน — เหลืออีก ${daysRemaining} วัน`}
          </span>
        </div>
        <Link
          href="/pricing-plans"
          className="rounded-md bg-amber-600 px-3 py-1 text-xs font-medium text-white hover:bg-amber-700"
        >
          อัปเกรด
        </Link>
      </div>
    </div>
  )
}
