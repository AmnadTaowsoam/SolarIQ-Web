'use client'

import { useState, ReactNode } from 'react'
import { Sidebar } from './Sidebar'
import { Navbar } from './Navbar'
import { User } from '@/types'

interface AppLayoutProps {
  children: ReactNode
  user: User | null
}

export function AppLayout({ children, user }: AppLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50/50 flex">
      {/* Sidebar — fixed width on desktop */}
      <Sidebar
        user={user}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main content area — takes remaining width */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar
          user={user}
          onMenuClick={() => setIsSidebarOpen(true)}
        />

        <main className="flex-1 p-4 lg:p-6 xl:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
