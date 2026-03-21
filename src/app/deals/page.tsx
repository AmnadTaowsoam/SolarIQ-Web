'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context'
import { AppLayout } from '@/components/layout'
import { Card, CardBody, Badge } from '@/components/ui'
import { useDeals } from '@/hooks/useDeals'
import {
  Deal,
  DealStage,
  DEAL_STAGE_LABELS,
  DEAL_STAGE_COLORS,
  DEAL_STAGE_ORDER,
} from '@/types/quotes'
import { ROUTES } from '@/lib/constants'

function formatThb(v: number) {
  return `฿${v.toLocaleString('en-US')}`
}

function MilestoneProgress({ deal }: { deal: Deal }) {
  const completed = deal.milestones.filter((m) => m.completedAt).length
  const total = DEAL_STAGE_ORDER.length
  const pct = Math.round((completed / total) * 100)

  return (
    <div className="mt-3">
      <div className="flex justify-between text-xs text-gray-500 mb-1">
        <span>ความคืบหน้า</span>
        <span>{completed}/{total} ขั้นตอน</span>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-orange-400 rounded-full transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

export default function DealsPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const { data: deals, isLoading } = useDeals()
  const [stageFilter, setStageFilter] = useState<DealStage | 'all'>('all')

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace(ROUTES.LOGIN)
    }
  }, [user, authLoading, router])

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500" />
      </div>
    )
  }

  if (!user) return null

  const activeStages: DealStage[] = ['accepted', 'survey_scheduled', 'survey_completed', 'contract_signed', 'payment_received', 'installation_started', 'installation_completed', 'inspection_passed', 'grid_connected']

  const filtered = deals.filter((d) => {
    if (stageFilter === 'all') return true
    return d.stage === stageFilter
  })

  const totalValue = deals.reduce((sum, d) => sum + d.totalValue, 0)
  const activeDeals = deals.filter((d) => activeStages.includes(d.stage)).length
  const completedDeals = deals.filter((d) => d.stage === 'completed').length

  return (
    <AppLayout user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Deals</h1>
          <p className="text-gray-500 mt-1">ติดตามงานติดตั้งทั้งหมดของคุณ</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'งานทั้งหมด', value: deals.length, color: 'text-gray-900' },
            { label: 'กำลังดำเนินการ', value: activeDeals, color: 'text-orange-600' },
            { label: 'เสร็จสิ้นแล้ว', value: completedDeals, color: 'text-green-600' },
          ].map((stat) => (
            <Card key={stat.label}>
              <CardBody className="p-4 text-center">
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
              </CardBody>
            </Card>
          ))}
        </div>

        {/* Total value */}
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-center justify-between">
          <span className="text-sm text-orange-800 font-medium">มูลค่างานรวม</span>
          <span className="text-xl font-bold text-orange-700">{formatThb(totalValue)}</span>
        </div>

        {/* Stage filter */}
        <div className="flex overflow-x-auto gap-2 pb-1">
          <button
            onClick={() => setStageFilter('all')}
            className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              stageFilter === 'all'
                ? 'bg-orange-500 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-orange-300'
            }`}
          >
            ทั้งหมด ({deals.length})
          </button>
          {(['installation_started', 'survey_scheduled', 'contract_signed', 'completed'] as DealStage[]).map((stage) => {
            const count = deals.filter((d) => d.stage === stage).length
            if (count === 0) return null
            return (
              <button
                key={stage}
                onClick={() => setStageFilter(stage)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  stageFilter === stage
                    ? 'bg-orange-500 text-white'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-orange-300'
                }`}
              >
                {DEAL_STAGE_LABELS[stage]} ({count})
              </button>
            )
          })}
        </div>

        {/* Deal cards */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 animate-pulse">
                <div className="flex justify-between mb-3">
                  <div className="h-4 bg-gray-200 rounded w-1/3" />
                  <div className="h-5 bg-gray-200 rounded-full w-24" />
                </div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-4" />
                <div className="h-2 bg-gray-200 rounded-full" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <Card>
            <CardBody className="py-16 text-center">
              <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h3 className="text-lg font-semibold text-gray-700 mb-1">ยังไม่มี Deal</h3>
              <p className="text-gray-500 text-sm">เมื่อลูกค้ายอมรับใบเสนอราคา Deal จะถูกสร้างขึ้นที่นี่</p>
            </CardBody>
          </Card>
        ) : (
          <div className="space-y-4">
            {filtered.map((deal) => (
              <Card
                key={deal.id}
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => router.push(`/deals/${deal.id}`)}
              >
                <CardBody className="p-5">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-gray-900">{deal.dealNumber}</p>
                      {deal.contractor && (
                        <p className="text-sm text-gray-500">{deal.contractor.companyName}</p>
                      )}
                    </div>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${DEAL_STAGE_COLORS[deal.stage]}`}
                    >
                      {DEAL_STAGE_LABELS[deal.stage]}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div>
                      {deal.quote && (
                        <span className="text-gray-600">
                          {deal.quote.specifications.totalPanelKw} kW •{' '}
                          {deal.quote.specifications.panelBrand}
                        </span>
                      )}
                    </div>
                    <span className="font-bold text-orange-600">{formatThb(deal.totalValue)}</span>
                  </div>

                  <MilestoneProgress deal={deal} />
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  )
}
