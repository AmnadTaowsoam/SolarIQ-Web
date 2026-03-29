'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useAuth } from '@/context'
import { AppLayout } from '@/components/layout'
import { Card, CardBody } from '@/components/ui'
import { useDeals } from '@/hooks/useDeals'
import {
  Deal,
  DealStage,
  DEAL_STAGE_LABELS,
  DEAL_STAGE_COLORS,
  DEAL_STAGE_ORDER,
} from '@/types/quotes'
import { ROUTES } from '@/lib/constants'
import { apiClient } from '@/lib/api'

function formatThb(v: number) {
  return `฿${v.toLocaleString('en-US')}`
}

function MilestoneProgress({ deal }: { deal: Deal }) {
  const t = useTranslations('dealsPage')
  const completed = deal.milestones.filter((m) => m.completedAt).length
  const total = DEAL_STAGE_ORDER.length
  const pct = Math.round((completed / total) * 100)

  return (
    <div className="mt-3">
      <div className="flex justify-between text-xs text-gray-500 mb-1">
        <span>{t('progress')}</span>
        <span>{t('steps', { completed, total })}</span>
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
  const t = useTranslations('dealsPage')
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const { data: deals, isLoading } = useDeals()
  const [stageFilter, setStageFilter] = useState<DealStage | 'all'>('all')
  const [showCreateModal, setShowCreateModal] = useState(false)

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

  if (!user) {
    return null
  }

  const activeStages: DealStage[] = [
    'accepted',
    'survey_scheduled',
    'survey_completed',
    'contract_signed',
    'payment_received',
    'installation_started',
    'installation_completed',
    'inspection_passed',
    'grid_connected',
  ]

  const filtered = deals.filter((d) => {
    if (stageFilter === 'all') {
      return true
    }
    return d.stage === stageFilter
  })

  const totalValue = deals.reduce((sum, d) => sum + d.totalValue, 0)
  const activeDeals = deals.filter((d) => activeStages.includes(d.stage)).length
  const completedDeals = deals.filter((d) => d.stage === 'completed').length

  return (
    <AppLayout user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
            <p className="text-gray-500 mt-1">{t('subtitle')}</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600"
          >
            + {t('createDeal')}
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: t('stats.total'), value: deals.length, color: 'text-gray-900' },
            { label: t('stats.inProgress'), value: activeDeals, color: 'text-orange-600' },
            { label: t('stats.completed'), value: completedDeals, color: 'text-green-600' },
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
          <span className="text-sm text-orange-800 font-medium">{t('totalValue')}</span>
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
            {t('all')} ({deals.length})
          </button>
          {(
            [
              'installation_started',
              'survey_scheduled',
              'contract_signed',
              'completed',
            ] as DealStage[]
          ).map((stage) => {
            const count = deals.filter((d) => d.stage === stage).length
            if (count === 0) {
              return null
            }
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
              <div
                key={i}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 animate-pulse"
              >
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
              <svg
                className="w-16 h-16 mx-auto text-gray-300 mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              <h3 className="text-lg font-semibold text-gray-700 mb-1">{t('empty.title')}</h3>
              <p className="text-gray-500 text-sm">{t('empty.description')}</p>
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
        {/* Create Deal Modal */}
        {showCreateModal && <CreateDealModal onClose={() => setShowCreateModal(false)} />}
      </div>
    </AppLayout>
  )
}

function CreateDealModal({ onClose }: { onClose: () => void }) {
  const t = useTranslations('createDealModal')
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    customer_name: '',
    address: '',
    system_size_kw: '',
    total_value: '',
    stage: 'accepted' as DealStage,
    notes: '',
  })

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    try {
      const res = await apiClient.post('/api/v1/deals', {
        customer_name: form.customer_name,
        address: form.address,
        system_size_kw: parseFloat(form.system_size_kw),
        total_value: parseFloat(form.total_value),
        stage: form.stage,
        notes: form.notes || undefined,
      })
      onClose()
      if (res?.id) {
        router.push(`/deals/${res.id}`)
      } else {
        router.refresh()
      }
    } catch {
      setError(t('error'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="text-lg font-bold text-gray-900 mb-4">{t('title')}</h2>
        {error && (
          <div className="mb-3 rounded-lg bg-red-50 border border-red-200 p-2 text-sm text-red-700">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('fields.customerName')} *
            </label>
            <input
              type="text"
              name="customer_name"
              value={form.customer_name}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:ring-orange-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('fields.address')}
            </label>
            <input
              type="text"
              name="address"
              value={form.address}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:ring-orange-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('fields.systemSize')} *
              </label>
              <input
                type="number"
                name="system_size_kw"
                value={form.system_size_kw}
                onChange={handleChange}
                required
                step="any"
                min="0.1"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('fields.totalValue')} *
              </label>
              <input
                type="number"
                name="total_value"
                value={form.total_value}
                onChange={handleChange}
                required
                min="0"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:ring-orange-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('fields.stage')}
            </label>
            <select
              name="stage"
              value={form.stage}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:ring-orange-500"
            >
              {(
                ['accepted', 'survey_scheduled', 'contract_signed', 'installation_started'] as const
              ).map((s) => (
                <option key={s} value={s}>
                  {t(`stages.${s}`)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('fields.notes')}
            </label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              rows={2}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:ring-orange-500 resize-none"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-gray-300 bg-white py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 rounded-lg bg-orange-500 py-2.5 text-sm font-medium text-white hover:bg-orange-600 disabled:opacity-50"
            >
              {isSubmitting ? t('creating') : t('create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
