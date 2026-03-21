'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { AppLayout } from '@/components/layout'
import { useAuth } from '@/context'
import { ROUTES } from '@/lib/constants'

const tabs = [
  { name: 'Overview', href: ROUTES.ANALYTICS },
  { name: 'Pipeline', href: ROUTES.ANALYTICS_PIPELINE },
  { name: 'Leads', href: ROUTES.ANALYTICS_LEADS },
  { name: 'Revenue', href: ROUTES.ANALYTICS_REVENUE, adminOnly: true },
  { name: 'Market', href: ROUTES.ANALYTICS_MARKET },
  { name: 'Reports', href: ROUTES.ANALYTICS_REPORTS },
  { name: 'Scorecard', href: ROUTES.ANALYTICS_SCORECARD },
]

export default function AnalyticsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace(ROUTES.LOGIN)
    }
  }, [isLoading, user, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-orange-200 border-t-orange-600 rounded-full animate-spin" />
          <p className="text-sm text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <AppLayout user={user}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-sm text-gray-500 mt-1">Business intelligence and performance insights</p>
        </div>
        <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-3">
          {tabs
            .filter((tab) => !tab.adminOnly || user.role === 'admin')
            .map((tab) => {
              const isActive = pathname === tab.href || pathname.startsWith(`${tab.href}/`)
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={
                    `px-3 py-1.5 rounded-lg text-sm font-medium transition ` +
                    (isActive ? 'bg-orange-600 text-white' : 'text-gray-600 hover:bg-gray-100')
                  }
                >
                  {tab.name}
                </Link>
              )
            })}
        </div>
        {children}
      </div>
    </AppLayout>
  )
}
