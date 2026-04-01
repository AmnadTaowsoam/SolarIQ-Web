'use client'

import { useEffect, useState, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar } from './Sidebar'
import { Navbar } from './Navbar'
import { Breadcrumbs } from './Breadcrumbs'
import { useAuth } from '@/context'
import { User } from '@/types'
import { ROUTES } from '@/lib/constants'

interface AppLayoutProps {
  children: ReactNode
  user?: User | null
  showBreadcrumbs?: boolean
}

export function AppLayout({ children, user, showBreadcrumbs = true }: AppLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const router = useRouter()
  const { user: authUser, isLoading } = useAuth()
  const currentUser = user ?? authUser ?? null

  useEffect(() => {
    if (!isLoading && !currentUser) {
      router.replace(ROUTES.LOGIN)
    }
  }, [currentUser, isLoading, router])

  if (isLoading || !currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--brand-background)]">
        <div className="w-10 h-10 border-3 border-orange-200 border-t-orange-600 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--brand-background)] flex">
      {/* Sidebar — fixed width on desktop */}
      <Sidebar user={currentUser} isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main content area — takes remaining width */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar user={currentUser} onMenuClick={() => setIsSidebarOpen(true)} />

        <main className="flex-1 p-4 lg:p-6 xl:p-8">
          <div className="w-full max-w-[1400px]">
            {showBreadcrumbs && <Breadcrumbs />}
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
