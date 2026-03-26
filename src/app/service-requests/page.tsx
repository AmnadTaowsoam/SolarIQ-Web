'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { AppLayout } from '@/components/layout'
import { useAuth } from '@/context'
import {
  useServiceRequests,
  useServiceRequestStats,
  useCreateServiceRequest,
} from '@/hooks/useServiceRequests'
import Link from 'next/link'

const STATUS_CONFIG: Record<string, { color: string }> = {
  open: { color: 'bg-blue-100 text-blue-700' },
  in_progress: { color: 'bg-amber-100 text-amber-700' },
  resolved: { color: 'bg-green-100 text-green-700' },
  closed: { color: 'bg-gray-100 text-gray-600' },
}

const PRIORITY_COLORS: Record<string, string> = {
  urgent: 'bg-red-100 text-red-700',
  high: 'bg-orange-100 text-orange-700',
  medium: 'bg-amber-100 text-amber-700',
  low: 'bg-gray-100 text-gray-600',
}

export default function ServiceRequestsPage() {
  const { user } = useAuth()
  const t = useTranslations('serviceRequestsPage')
  const tc = useTranslations('common')
  const [statusFilter, setStatusFilter] = useState('')
  const { data: requests, isLoading } = useServiceRequests(statusFilter || undefined)
  const { data: stats } = useServiceRequestStats()
  const createRequest = useCreateServiceRequest()
  const [showForm, setShowForm] = useState(false)

  if (!user) {
    return null
  }

  return (
    <AppLayout user={user}>
      <div className="max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{t('title')}</h1>
            <p className="mt-0.5 text-sm text-gray-500">{t('subtitle')}</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600"
          >
            {t('createRequest')}
          </button>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
            {[
              { label: t('stats.total'), value: stats.total, color: 'text-gray-900' },
              { label: t('stats.open'), value: stats.open, color: 'text-blue-600' },
              { label: t('stats.inProgress'), value: stats.in_progress, color: 'text-amber-600' },
              { label: t('stats.resolved'), value: stats.resolved, color: 'text-green-600' },
              {
                label: t('stats.avgResolutionTime'),
                value: stats.avg_resolution_hours
                  ? `${Math.round(stats.avg_resolution_hours)}${t('stats.hours')}`
                  : '-',
                color: 'text-purple-600',
              },
            ].map((s) => (
              <div key={s.label} className="rounded-xl border bg-white p-4 text-center">
                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-xs text-gray-500">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Create Form */}
        {showForm && (
          <form
            className="rounded-xl border border-amber-200 bg-amber-50 p-5"
            onSubmit={async (e) => {
              e.preventDefault()
              const form = e.target as HTMLFormElement
              const data = new FormData(form)
              await createRequest.mutateAsync({
                customer_name: data.get('customer_name') as string,
                customer_phone: data.get('phone') as string,
                customer_email: data.get('email') as string,
                request_type: data.get('type') as 'repair' | 'complaint' | 'feedback' | 'inquiry',
                priority: data.get('priority') as 'low' | 'medium' | 'high' | 'urgent',
                subject: data.get('subject') as string,
                description: data.get('description') as string,
              })
              setShowForm(false)
              form.reset()
            }}
          >
            <h3 className="mb-3 font-semibold text-gray-900">{t('form.title')}</h3>
            <div className="grid gap-3 md:grid-cols-3">
              <input
                name="customer_name"
                placeholder={t('form.customerName')}
                required
                className="rounded-lg border px-3 py-2 text-sm"
              />
              <input
                name="phone"
                placeholder={t('form.phone')}
                className="rounded-lg border px-3 py-2 text-sm"
              />
              <input
                name="email"
                placeholder={t('form.email')}
                className="rounded-lg border px-3 py-2 text-sm"
              />
            </div>
            <div className="mt-3 grid gap-3 md:grid-cols-3">
              <select name="type" required className="rounded-lg border px-3 py-2 text-sm">
                <option value="repair">{t('types.repair')}</option>
                <option value="complaint">{t('types.complaint')}</option>
                <option value="feedback">{t('types.feedback')}</option>
                <option value="inquiry">{t('types.inquiry')}</option>
              </select>
              <select name="priority" className="rounded-lg border px-3 py-2 text-sm">
                <option value="medium">{t('priority.medium')}</option>
                <option value="low">{t('priority.low')}</option>
                <option value="high">{t('priority.high')}</option>
                <option value="urgent">{t('priority.urgent')}</option>
              </select>
              <input
                name="subject"
                placeholder={t('form.subject')}
                required
                className="rounded-lg border px-3 py-2 text-sm"
              />
            </div>
            <textarea
              name="description"
              placeholder={t('form.description')}
              required
              className="mt-3 w-full rounded-lg border px-3 py-2 text-sm"
              rows={3}
            />
            <div className="mt-3 flex gap-2">
              <button
                type="submit"
                disabled={createRequest.isPending}
                className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600 disabled:opacity-50"
              >
                {createRequest.isPending ? t('form.submitting') : t('form.submit')}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-lg bg-gray-100 px-4 py-2 text-sm text-gray-600 hover:bg-gray-200"
              >
                {tc('cancel')}
              </button>
            </div>
          </form>
        )}

        {/* Filter */}
        <div className="flex gap-2">
          {[
            { value: '', label: t('filters.all') },
            { value: 'open', label: t('filters.open') },
            { value: 'in_progress', label: t('filters.inProgress') },
            { value: 'resolved', label: t('filters.resolved') },
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

        {/* Request List */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 animate-pulse rounded-xl border bg-gray-100" />
            ))}
          </div>
        ) : requests && requests.length > 0 ? (
          <div className="space-y-3">
            {requests.map((req) => (
              <Link
                key={req.id}
                href={`/service-requests/${req.id}`}
                className="block rounded-xl border bg-white p-4 transition-shadow hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-gray-900">{req.subject}</h3>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_CONFIG[req.status]?.color || ''}`}
                      >
                        {t(`statuses.${req.status}`)}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${PRIORITY_COLORS[req.priority] || ''}`}
                      >
                        {t(`priority.${req.priority}`)}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-gray-500 line-clamp-1">{req.description}</p>
                    <div className="mt-2 flex items-center gap-3 text-xs text-gray-400">
                      <span>{req.customer_name}</span>
                      <span>{t(`types.${req.request_type}`)}</span>
                      <span>{new Date(req.created_at).toLocaleDateString('th-TH')}</span>
                    </div>
                  </div>
                  {req.satisfaction_rating && (
                    <div className="flex items-center gap-0.5 text-amber-400">
                      {'★'.repeat(req.satisfaction_rating)}
                      {'☆'.repeat(5 - req.satisfaction_rating)}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border-2 border-dashed border-gray-300 p-12 text-center">
            <h3 className="text-sm font-medium text-gray-900">{t('empty.title')}</h3>
            <p className="mt-1 text-sm text-gray-500">{t('empty.description')}</p>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
