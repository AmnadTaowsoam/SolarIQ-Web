'use client'

import React, { useState, useCallback } from 'react'
import clsx from 'clsx'
import { AppLayout } from '@/components/layout'
import { useAuth } from '@/context'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import {
  useAuditLogs,
  useAuditStats,
  useExportAuditLogs,
  type AuditAction,
  type AuditResourceType,
  type AuditLogFilters,
  type AuditLogEntry,
} from '@/hooks/useAuditLogs'
import { defaultLocale } from '@/i18n/config'
import { extractLocaleFromPath } from '@/lib/locale'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const ACTION_BADGE_COLORS: Record<AuditAction, string> = {
  CREATE: 'bg-green-100 text-green-800',
  UPDATE: 'bg-blue-100 text-blue-800',
  DELETE: 'bg-red-100 text-red-800',
  VIEW: 'bg-gray-100 text-gray-700',
  EXPORT: 'bg-purple-100 text-purple-800',
  LOGIN: 'bg-orange-100 text-orange-800',
  LOGOUT: 'bg-yellow-100 text-yellow-800',
}

const ACTION_TIMELINE_ICONS: Record<AuditAction, string> = {
  CREATE: 'bg-green-500',
  UPDATE: 'bg-blue-500',
  DELETE: 'bg-red-500',
  VIEW: 'bg-gray-400',
  EXPORT: 'bg-purple-500',
  LOGIN: 'bg-orange-500',
  LOGOUT: 'bg-yellow-500',
}

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

function formatDateTime(iso: string, locale: string): string {
  try {
    const d = new Date(iso)
    return d.toLocaleString(locale === 'en' ? 'en-US' : 'th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return iso
  }
}

function formatTimeShort(iso: string, locale: string): string {
  try {
    const d = new Date(iso)
    return d.toLocaleString(locale === 'en' ? 'en-US' : 'th-TH', { hour: '2-digit', minute: '2-digit' })
  } catch {
    return iso
  }
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function StatCard({ title, value, icon }: { title: string; value: string | number; icon: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">{title}</span>
        <span className="text-orange-500">{icon}</span>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  )
}

function ExpandableRow({
  entry,
  locale,
  t,
  actionLabels,
  resourceLabels,
}: {
  entry: AuditLogEntry
  locale: string
  t: (key: string, values?: Record<string, string | number>) => string
  actionLabels: Record<AuditAction, string>
  resourceLabels: Record<AuditResourceType, string>
}) {
  const [expanded, setExpanded] = useState(false)
  const hasChanges = entry.changes && (Object.keys(entry.changes.before).length > 0 || Object.keys(entry.changes.after).length > 0)

  return (
    <>
      <tr
        className={clsx(
          'hover:bg-orange-50/40 transition-colors cursor-pointer',
          expanded && 'bg-orange-50/30'
        )}
        onClick={() => hasChanges && setExpanded(!expanded)}
      >
        <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{formatDateTime(entry.timestamp, locale)}</td>
        <td className="px-4 py-3">
          <div className="text-sm font-medium text-gray-900">{entry.user_name}</div>
          <div className="text-xs text-gray-500">{entry.user_email}</div>
        </td>
        <td className="px-4 py-3">
          <span
            className={clsx(
              'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold',
              ACTION_BADGE_COLORS[entry.action]
            )}
          >
            {actionLabels[entry.action]}
          </span>
        </td>
        <td className="px-4 py-3 text-sm text-gray-600">{resourceLabels[entry.resource_type]}</td>
        <td className="px-4 py-3 text-sm text-gray-600 max-w-[200px] truncate">{entry.description}</td>
        <td className="px-4 py-3 text-sm text-gray-500 font-mono text-xs">{entry.ip_address}</td>
        <td className="px-4 py-3 text-center">
          {hasChanges && (
            <svg
              className={clsx('w-4 h-4 text-gray-400 transition-transform inline-block', expanded && 'rotate-180')}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          )}
        </td>
      </tr>
      {expanded && hasChanges && entry.changes && (
        <tr className="bg-gray-50">
          <td colSpan={7} className="px-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-xs font-semibold text-red-600 mb-2">{t('details.before')}</h4>
                <pre className="text-xs bg-red-50 border border-red-200 rounded-lg p-3 overflow-x-auto">
                  {JSON.stringify(entry.changes.before, null, 2)}
                </pre>
              </div>
              <div>
                <h4 className="text-xs font-semibold text-green-600 mb-2">{t('details.after')}</h4>
                <pre className="text-xs bg-green-50 border border-green-200 rounded-lg p-3 overflow-x-auto">
                  {JSON.stringify(entry.changes.after, null, 2)}
                </pre>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  )
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function AdminAuditLogsPage() {
  const pathname = usePathname()
  const locale = extractLocaleFromPath(pathname).locale ?? defaultLocale
  const t = useTranslations('appPages.auditLogs')
  const { user, isLoading: authLoading } = useAuth()
  const actionLabels: Record<AuditAction, string> = {
    CREATE: t('actions.create'),
    UPDATE: t('actions.update'),
    DELETE: t('actions.delete'),
    VIEW: t('actions.view'),
    EXPORT: t('actions.export'),
    LOGIN: t('actions.login'),
    LOGOUT: t('actions.logout'),
  }
  const resourceLabels: Record<AuditResourceType, string> = {
    lead: t('resources.lead'),
    deal: t('resources.deal'),
    quote: t('resources.quote'),
    user: t('resources.user'),
    settings: t('resources.settings'),
    session: t('resources.session'),
    api_key: t('resources.apiKey'),
  }
  const actionOptions: { value: AuditAction | ''; label: string }[] = [
    { value: '', label: t('filters.all') },
    { value: 'CREATE', label: actionLabels.CREATE },
    { value: 'UPDATE', label: actionLabels.UPDATE },
    { value: 'DELETE', label: actionLabels.DELETE },
    { value: 'VIEW', label: actionLabels.VIEW },
    { value: 'EXPORT', label: actionLabels.EXPORT },
    { value: 'LOGIN', label: actionLabels.LOGIN },
    { value: 'LOGOUT', label: actionLabels.LOGOUT },
  ]
  const resourceOptions: { value: AuditResourceType | ''; label: string }[] = [
    { value: '', label: t('filters.all') },
    { value: 'lead', label: resourceLabels.lead },
    { value: 'deal', label: resourceLabels.deal },
    { value: 'quote', label: resourceLabels.quote },
    { value: 'user', label: resourceLabels.user },
    { value: 'settings', label: resourceLabels.settings },
    { value: 'session', label: resourceLabels.session },
    { value: 'api_key', label: resourceLabels.api_key },
  ]

  // Filter state
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [action, setAction] = useState<AuditAction | ''>('')
  const [resourceType, setResourceType] = useState<AuditResourceType | ''>('')
  const [userSearch, setUserSearch] = useState('')
  const [page, setPage] = useState(1)

  // Applied filters (only sent to API on "Search" click)
  const [appliedFilters, setAppliedFilters] = useState<AuditLogFilters>({ page: 1, page_size: 50 })

  const { data: logsData, isLoading: logsLoading } = useAuditLogs(appliedFilters)
  const { data: stats, isLoading: statsLoading } = useAuditStats()
  const { exportLogs } = useExportAuditLogs()

  const handleSearch = useCallback(() => {
    const newFilters: AuditLogFilters = {
      page: 1,
      page_size: 50,
      date_from: dateFrom || undefined,
      date_to: dateTo || undefined,
      action: action || undefined,
      resource_type: resourceType || undefined,
      user_search: userSearch || undefined,
    }
    setPage(1)
    setAppliedFilters(newFilters)
  }, [dateFrom, dateTo, action, resourceType, userSearch])

  const handleReset = useCallback(() => {
    setDateFrom('')
    setDateTo('')
    setAction('')
    setResourceType('')
    setUserSearch('')
    setPage(1)
    setAppliedFilters({ page: 1, page_size: 50 })
  }, [])

  const handlePageChange = useCallback(
    (newPage: number) => {
      setPage(newPage)
      setAppliedFilters((prev) => ({ ...prev, page: newPage }))
    },
    []
  )

  const handleExport = useCallback(() => {
    exportLogs({
      date_from: appliedFilters.date_from,
      date_to: appliedFilters.date_to,
      action: appliedFilters.action,
      resource_type: appliedFilters.resource_type,
      user_search: appliedFilters.user_search,
    })
  }, [exportLogs, appliedFilters])

  const logs = logsData?.items ?? []
  const totalPages = logsData?.total_pages ?? 1
  const totalItems = logsData?.total ?? 0

  // Last 20 events for timeline sidebar
  const timelineEvents = logs.slice(0, 20)

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-10 h-10 border-2 border-orange-200 border-t-orange-600 rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) return null

  return (
    <AppLayout user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
            <p className="text-sm text-gray-500 mt-1">{t('subtitle')}</p>
          </div>
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {t('exportCsv')}
          </button>
        </div>

        {/* Filter Bar */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">{t('filters.dateFrom')}</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">{t('filters.dateTo')}</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">{t('filters.action')}</label>
            <select
              value={action}
              onChange={(e) => setAction(e.target.value as AuditAction | '')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none bg-white"
            >
              {actionOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">{t('filters.resourceType')}</label>
            <select
              value={resourceType}
              onChange={(e) => setResourceType(e.target.value as AuditResourceType | '')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none bg-white"
            >
              {resourceOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">{t('filters.userSearch')}</label>
            <input
              type="text"
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              placeholder={t('filters.userSearchPlaceholder')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
            />
          </div>
          <div className="flex items-end gap-2">
            <button
              onClick={handleSearch}
              className="flex-1 px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600 transition-colors"
            >
              {t('filters.search')}
            </button>
            <button
              onClick={handleReset}
              className="px-4 py-2 border border-gray-300 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              {t('filters.reset')}
            </button>
          </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="h-3 w-24 bg-gray-200 rounded animate-pulse mb-3" />
              <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
            </div>
          ))
        ) : (
          <>
            <StatCard
              title={t('stats.eventsToday')}
              value={stats?.total_events_today ?? 0}
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3v18h18M7.5 15l3-3 3 3 4.5-6" />
                </svg>
              }
            />
            <StatCard
              title={t('stats.activeUsersToday')}
              value={stats?.unique_users_today ?? 0}
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                </svg>
              }
            />
            <StatCard
              title={t('stats.mostCommonAction')}
              value={stats?.most_common_action ?? '-'}
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                </svg>
              }
            />
            <StatCard
              title={t('stats.suspiciousEvents')}
              value={stats?.suspicious_events ?? 0}
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              }
            />
          </>
        )}
        </div>

        {/* Main content with timeline sidebar */}
        <div className="flex gap-6">
        {/* Table */}
        <div className="flex-1 min-w-0">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50/60">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">{t('table.time')}</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">{t('table.user')}</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">{t('table.action')}</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">{t('table.type')}</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">{t('table.details')}</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">IP</th>
                    <th className="px-4 py-3 w-8"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {logsLoading ? (
                    Array.from({ length: 10 }).map((_, i) => (
                      <tr key={i}>
                        {Array.from({ length: 7 }).map((__, j) => (
                          <td key={j} className="px-4 py-3">
                            <div className="h-4 bg-gray-200 rounded animate-pulse" style={{ width: `${50 + Math.random() * 50}%` }} />
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : logs.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-12 text-center text-gray-500">
                        {t('empty.logs')}
                      </td>
                    </tr>
                  ) : (
                    logs.map((entry) => (
                      <ExpandableRow
                        key={entry.id}
                        entry={entry}
                        locale={locale}
                        t={t}
                        actionLabels={actionLabels}
                        resourceLabels={resourceLabels}
                      />
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50/40">
                <p className="text-sm text-gray-600">
                  {t('pagination.showing', {
                    start: ((page - 1) * 50) + 1,
                    end: Math.min(page * 50, totalItems),
                    total: totalItems,
                  })}
                </p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page <= 1}
                    className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    {t('pagination.previous')}
                  </button>
                  {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
                    let pageNum: number
                    if (totalPages <= 5) {
                      pageNum = i + 1
                    } else if (page <= 3) {
                      pageNum = i + 1
                    } else if (page >= totalPages - 2) {
                      pageNum = totalPages - 4 + i
                    } else {
                      pageNum = page - 2 + i
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={clsx(
                          'px-3 py-1.5 text-sm rounded-lg transition-colors',
                          pageNum === page
                            ? 'bg-orange-500 text-white'
                            : 'border border-gray-300 hover:bg-gray-100'
                        )}
                      >
                        {pageNum}
                      </button>
                    )
                  })}
                  <button
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page >= totalPages}
                    className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    {t('pagination.next')}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Activity Timeline Sidebar */}
        <div className="hidden xl:block w-80 flex-shrink-0">
          <div className="bg-white rounded-xl border border-gray-200 p-4 sticky top-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">{t('timeline.title')}</h3>
            <div className="space-y-0">
              {logsLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex gap-3 py-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-gray-200 animate-pulse mt-1.5 flex-shrink-0" />
                    <div className="flex-1 space-y-1">
                      <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4" />
                      <div className="h-2.5 bg-gray-200 rounded animate-pulse w-1/2" />
                    </div>
                  </div>
                ))
              ) : (
                timelineEvents.map((entry, idx) => (
                  <div key={entry.id} className="flex gap-3 relative">
                    {/* Vertical line */}
                    {idx < timelineEvents.length - 1 && (
                      <div className="absolute left-[4.5px] top-5 bottom-0 w-px bg-gray-200" />
                    )}
                    {/* Dot */}
                    <div
                      className={clsx(
                        'w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ring-2 ring-white',
                        ACTION_TIMELINE_ICONS[entry.action]
                      )}
                    />
                    {/* Content */}
                    <div className="flex-1 pb-4 min-w-0">
                      <p className="text-xs text-gray-900 truncate">{entry.description}</p>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        {entry.user_name} &middot; {formatTimeShort(entry.timestamp, locale)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
        </div>
      </div>
    </AppLayout>
  )
}
