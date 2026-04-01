'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context'
import { ROUTES } from '@/lib/constants'
import LandingPage from './landing/page'

export default function HomePage() {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace(ROUTES.DASHBOARD)
    }
  }, [isAuthenticated, isLoading, router])

  // Authenticated users: show spinner while redirecting to dashboard
  if (isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--brand-background)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  // Unauthenticated users & search bots: show landing page
  return <LandingPage />
}
