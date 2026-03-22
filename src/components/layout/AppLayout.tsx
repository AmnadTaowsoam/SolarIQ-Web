'use client'

import { useState, ReactNode } from 'react'
import { Sidebar } from './Sidebar'
import { Navbar } from './Navbar'
import { Breadcrumbs } from './Breadcrumbs'
import { useAuth } from '@/context'
import { User } from '@/types'

interface AppLayoutProps {
  children: ReactNode
  user?: User | null
  showBreadcrumbs?: boolean
}

export function AppLayout({ children, user, showBreadcrumbs = true }: AppLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const { user: authUser } = useAuth()
  const currentUser = user ?? authUser ?? null

  return (
    <div className="min-h-screen bg-[var(--brand-background)] flex">
      {/* Sidebar — fixed width on desktop */}
      <Sidebar
        user={currentUser}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main content area — takes remaining width */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar
          user={currentUser}
          onMenuClick={() => setIsSidebarOpen(true)}
        />

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
