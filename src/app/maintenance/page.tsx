'use client'

import { useState } from 'react'
import { AppLayout } from '@/components/layout'
import { useAuth } from '@/context'
import { useInstallations, useUpcomingMaintenance } from '@/hooks/useMaintenance'
import InstallationCard from '@/components/maintenance/InstallationCard'
import Link from 'next/link'

export default function MaintenancePage() {
  const { user } = useAuth()
  const [statusFilter, setStatusFilter] = useState<string>('active')
  const { data: installations, isLoading } = useInstallations(statusFilter)
  const { data: upcoming } = useUpcomingMaintenance(30)

  if (!user) {
    return null
  }

  return (
    <AppLayout user={user}>
      <div className="max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">บำรุงรักษาและการรับประกัน</h1>
            <p className="mt-0.5 text-sm text-gray-500">ติดตามการรับประกันและกำหนดการบำรุงรักษา</p>
          </div>
          <Link
            href="/maintenance/new"
            className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600"
          >
            + เพิ่มงานติดตั้ง
          </Link>
        </div>

        {/* Upcoming Maintenance Alert */}
        {upcoming && upcoming.length > 0 && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
            <h2 className="mb-2 text-sm font-semibold text-amber-800">
              งานบำรุงรักษาที่กำลังจะถึง ({upcoming.length} รายการ)
            </h2>
            <div className="space-y-2">
              {upcoming.slice(0, 5).map((item, i) => (
                <Link
                  key={i}
                  href={`/maintenance/${item.installation.id}`}
                  className="flex items-center justify-between rounded-lg bg-white p-3 text-sm hover:bg-amber-50"
                >
                  <div>
                    <span className="font-medium text-gray-900">
                      {item.installation.customer_name}
                    </span>
                    <span className="ml-2 text-gray-500">{item.schedule.maintenance_type}</span>
                  </div>
                  <span
                    className={`text-xs font-medium ${item.days_until_due <= 7 ? 'text-red-600' : 'text-amber-600'}`}
                  >
                    {item.days_until_due <= 0 ? 'เลยกำหนด!' : `อีก ${item.days_until_due} วัน`}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Filter */}
        <div className="flex gap-2">
          {[
            { value: 'active', label: 'ใช้งาน' },
            { value: 'inactive', label: 'หยุดใช้' },
            { value: '', label: 'ทั้งหมด' },
          ].map((f) => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                statusFilter === f.value
                  ? 'bg-amber-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Installations Grid */}
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-40 animate-pulse rounded-xl border bg-gray-100" />
            ))}
          </div>
        ) : installations && installations.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {installations.map((inst) => (
              <InstallationCard key={inst.id} installation={inst} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border-2 border-dashed border-gray-300 p-12 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
              />
            </svg>
            <h3 className="mt-3 text-sm font-medium text-gray-900">ยังไม่มีงานติดตั้ง</h3>
            <p className="mt-1 text-sm text-gray-500">
              เพิ่มงานติดตั้งที่เสร็จแล้วเพื่อติดตามการรับประกันและบำรุงรักษา
            </p>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
