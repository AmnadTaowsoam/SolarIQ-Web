'use client'

import React, { useState } from 'react'
import clsx from 'clsx'
import { AppLayout } from '@/components/layout'
import { useAuth } from '@/context'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import {
  useActiveSessions,
  useTerminateSession,
  useTerminateOthers,
  useLoginHistory,
  type Session,
} from '@/hooks/useSessions'
import { defaultLocale } from '@/i18n/config'
import { extractLocaleFromPath } from '@/lib/locale'

// ---------------------------------------------------------------------------
// Helpers
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

function timeAgo(
  iso: string,
  _locale: string,
  t: (key: string, values?: Record<string, string | number>) => string
): string {
  const now = Date.now()
  const then = new Date(iso).getTime()
  const diffMs = now - then
  const mins = Math.floor(diffMs / 60_000)
  if (mins < 1) {
    return t('time.justNow')
  }
  if (mins < 60) {
    return t('time.minutesAgo', { count: mins })
  }
  const hours = Math.floor(mins / 60)
  if (hours < 24) {
    return t('time.hoursAgo', { count: hours })
  }
  const days = Math.floor(hours / 24)
  return t('time.daysAgo', { count: days })
}

function deviceIcon(device: string): React.ReactNode {
  const lower = device.toLowerCase()
  if (
    lower.includes('iphone') ||
    lower.includes('android') ||
    lower.includes('galaxy') ||
    lower.includes('pixel')
  ) {
    return (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3"
        />
      </svg>
    )
  }
  if (lower.includes('macbook') || lower.includes('laptop')) {
    return (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25A2.25 2.25 0 015.25 3h13.5A2.25 2.25 0 0121 5.25z"
        />
      </svg>
    )
  }
  // Default desktop
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25A2.25 2.25 0 015.25 3h13.5A2.25 2.25 0 0121 5.25z"
      />
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Session Card
// ---------------------------------------------------------------------------

function SessionCard({
  session,
  onTerminate,
  terminating,
  locale,
  t,
}: {
  session: Session
  onTerminate: (id: string) => void
  terminating: boolean
  locale: string
  t: (key: string, values?: Record<string, string | number>) => string
}) {
  return (
    <div
      className={clsx(
        'bg-[var(--brand-surface)] rounded-xl border-2 p-5 transition-shadow hover:shadow-md',
        session.is_current
          ? 'border-green-400 ring-1 ring-green-100'
          : 'border-[var(--brand-border)]'
      )}
    >
      <div className="flex items-start gap-4">
        {/* Device icon */}
        <div
          className={clsx(
            'flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center',
            session.is_current
              ? 'bg-green-500/10 text-green-600'
              : 'bg-[var(--brand-background)] text-[var(--brand-text-secondary)]'
          )}
        >
          {deviceIcon(session.device)}
        </div>

        {/* Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-[var(--brand-text)]">
              {session.browser} &middot; {session.os}
            </h3>
            {session.is_current && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-green-500/10 text-green-700">
                {t('currentSessionBadge')}
              </span>
            )}
          </div>
          <p className="text-sm text-[var(--brand-text-secondary)] mt-1">{session.device}</p>

          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-[var(--brand-text-secondary)]">
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418"
                />
              </svg>
              IP: {session.ip_address}
            </span>
            {session.location && (
              <span className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
                  />
                </svg>
                {session.location}
              </span>
            )}
            <span>
              {t('labels.signedIn')}: {formatDateTime(session.login_time, locale)}
            </span>
            <span>
              {t('labels.lastActive')}: {timeAgo(session.last_active, locale, t)}
            </span>
          </div>
        </div>

        {/* Terminate button */}
        {!session.is_current && (
          <button
            onClick={() => onTerminate(session.id)}
            disabled={terminating}
            className="flex-shrink-0 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-500/10 border border-red-500/20 rounded-lg hover:bg-red-100 disabled:opacity-50 transition-colors"
          >
            {terminating ? t('actions.processing') : t('actions.signOut')}
          </button>
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function SessionsPage() {
  const pathname = usePathname()
  const locale = extractLocaleFromPath(pathname).locale ?? defaultLocale
  const t = useTranslations('appPages.sessions')
  const { user, isLoading: authLoading } = useAuth()
  const { data: sessions, isLoading: sessionsLoading, error: sessionsError } = useActiveSessions()
  const { data: loginHistory, isLoading: historyLoading, error: historyError } = useLoginHistory()
  const terminateSession = useTerminateSession()
  const terminateOthers = useTerminateOthers()
  const [terminatingId, setTerminatingId] = useState<string | null>(null)
  const [terminatingAll, setTerminatingAll] = useState(false)

  const handleTerminate = async (sessionId: string) => {
    setTerminatingId(sessionId)
    try {
      await terminateSession.mutateAsync(sessionId)
    } finally {
      setTerminatingId(null)
    }
  }

  const handleTerminateOthers = async () => {
    setTerminatingAll(true)
    try {
      await terminateOthers.mutateAsync()
    } finally {
      setTerminatingAll(false)
    }
  }

  const currentSession = sessions?.find((s) => s.is_current)
  const otherSessions = sessions?.filter((s) => !s.is_current) ?? []

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--brand-background)]">
        <div className="w-10 h-10 border-2 border-orange-200 border-t-orange-600 rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <AppLayout user={user}>
      <div className="space-y-8 max-w-4xl">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-[var(--brand-text)]">{t('title')}</h1>
          <p className="text-sm text-[var(--brand-text-secondary)] mt-1">{t('subtitle')}</p>
        </div>

        {(sessionsError || historyError || terminateSession.error || terminateOthers.error) && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {sessionsError?.message ||
              historyError?.message ||
              terminateSession.error?.message ||
              terminateOthers.error?.message}
          </div>
        )}

        {/* Current Session */}
        <section>
          <h2 className="text-sm font-semibold text-[var(--brand-text)] uppercase tracking-wider mb-3">
            {t('sections.current')}
          </h2>
          {sessionsLoading ? (
            <div className="bg-[var(--brand-surface)] rounded-xl border-2 border-[var(--brand-border)] p-5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-[var(--brand-border)] rounded-lg animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-48 bg-[var(--brand-border)] rounded animate-pulse" />
                  <div className="h-3 w-32 bg-[var(--brand-border)] rounded animate-pulse" />
                  <div className="h-3 w-64 bg-[var(--brand-border)] rounded animate-pulse" />
                </div>
              </div>
            </div>
          ) : currentSession ? (
            <SessionCard
              session={currentSession}
              onTerminate={handleTerminate}
              terminating={false}
              locale={locale}
              t={t}
            />
          ) : (
            <p className="text-sm text-[var(--brand-text-secondary)]">{t('empty.current')}</p>
          )}
        </section>

        {/* Other Sessions */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-[var(--brand-text)] uppercase tracking-wider">
              {t('sections.other')}
            </h2>
            {otherSessions.length > 0 && (
              <button
                onClick={handleTerminateOthers}
                disabled={terminatingAll}
                className="px-4 py-2 text-sm font-medium text-red-600 bg-red-500/10 border border-red-500/20 rounded-lg hover:bg-red-100 disabled:opacity-50 transition-colors"
              >
                {terminatingAll ? t('actions.processing') : t('actions.signOutOtherDevices')}
              </button>
            )}
          </div>

          {sessionsLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 2 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-[var(--brand-surface)] rounded-xl border border-[var(--brand-border)] p-5"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-[var(--brand-border)] rounded-lg animate-pulse" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-48 bg-[var(--brand-border)] rounded animate-pulse" />
                      <div className="h-3 w-32 bg-[var(--brand-border)] rounded animate-pulse" />
                      <div className="h-3 w-64 bg-[var(--brand-border)] rounded animate-pulse" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : otherSessions.length === 0 ? (
            <div className="bg-[var(--brand-surface)] rounded-xl border border-[var(--brand-border)] p-8 text-center">
              <svg
                className="w-10 h-10 text-[var(--brand-text-secondary)] mx-auto mb-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
                />
              </svg>
              <p className="text-sm text-[var(--brand-text-secondary)]">{t('empty.other')}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {otherSessions.map((session) => (
                <SessionCard
                  key={session.id}
                  session={session}
                  onTerminate={handleTerminate}
                  terminating={terminatingId === session.id}
                  locale={locale}
                  t={t}
                />
              ))}
            </div>
          )}
        </section>

        {/* Login History */}
        <section>
          <h2 className="text-sm font-semibold text-[var(--brand-text)] uppercase tracking-wider mb-3">
            {t('sections.history')}
          </h2>
          <div className="bg-[var(--brand-surface)] rounded-xl border border-[var(--brand-border)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--brand-border)] bg-[var(--brand-background)]/60">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--brand-text-secondary)] uppercase tracking-wider">
                      {t('table.time')}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--brand-text-secondary)] uppercase tracking-wider">
                      IP
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--brand-text-secondary)] uppercase tracking-wider">
                      {t('table.device')}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--brand-text-secondary)] uppercase tracking-wider">
                      {t('table.status')}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--brand-text-secondary)] uppercase tracking-wider">
                      {t('table.reason')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--brand-border)]">
                  {historyLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i}>
                        {Array.from({ length: 5 }).map((__, j) => (
                          <td key={j} className="px-4 py-3">
                            <div
                              className="h-4 bg-[var(--brand-border)] rounded animate-pulse"
                              style={{ width: `${50 + Math.random() * 40}%` }}
                            />
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : !loginHistory || loginHistory.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-4 py-8 text-center text-[var(--brand-text-secondary)] text-sm"
                      >
                        {t('empty.history')}
                      </td>
                    </tr>
                  ) : (
                    loginHistory.map((entry) => (
                      <tr
                        key={entry.id}
                        className="hover:bg-[var(--brand-background)]/40 transition-colors"
                      >
                        <td className="px-4 py-3 text-sm text-[var(--brand-text-secondary)] whitespace-nowrap">
                          {formatDateTime(entry.timestamp, locale)}
                        </td>
                        <td className="px-4 py-3 text-sm text-[var(--brand-text-secondary)] font-mono text-xs">
                          {entry.ip_address}
                        </td>
                        <td className="px-4 py-3 text-sm text-[var(--brand-text-secondary)]">
                          <div>{entry.browser}</div>
                          <div className="text-xs text-[var(--brand-text-secondary)]">
                            {entry.device}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={clsx(
                              'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold',
                              entry.success
                                ? 'bg-green-500/10 text-green-700'
                                : 'bg-red-100 text-red-700'
                            )}
                          >
                            {entry.success ? t('status.success') : t('status.failed')}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-[var(--brand-text-secondary)]">
                          {entry.failure_reason || '-'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </AppLayout>
  )
}
