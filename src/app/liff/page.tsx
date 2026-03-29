'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

/**
 * LIFF Landing Page — redirects to the appropriate LIFF sub-page
 * based on LINE context or defaults to quotes.
 */
export default function LiffIndexPage() {
  const router = useRouter()

  useEffect(() => {
    // Check if LIFF SDK provides a target path
    const params = new URLSearchParams(window.location.search)
    const target = params.get('target')

    if (target) {
      router.replace(`/liff/${target}`)
    } else {
      // Default: show quotes page
      router.replace('/liff/quotes')
    }
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--brand-background)]">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-[var(--brand-text-secondary)] text-sm">กำลังโหลด SolarIQ...</p>
      </div>
    </div>
  )
}
