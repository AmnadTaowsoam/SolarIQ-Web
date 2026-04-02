'use client'

/**
 * Developer Portal overview page (WK-031)
 * Auth and AppLayout are handled by developers/layout.tsx
 */

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { useApiKeys, useApiUsage } from '@/hooks/useDeveloperApi'

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-[var(--brand-surface)] rounded-xl border border-[var(--brand-border)] p-5 hover:shadow-sm transition-shadow">
      <p className="text-xs font-semibold text-[var(--brand-text-secondary)] uppercase tracking-wider">
        {label}
      </p>
      <p className="text-2xl font-bold text-[var(--brand-text)] mt-2">{value}</p>
      {sub && <p className="text-xs text-[var(--brand-text-secondary)] mt-1">{sub}</p>}
    </div>
  )
}

function StepCard({
  step,
  title,
  description,
  href,
  done,
}: {
  step: number
  title: string
  description: string
  href: string
  done?: boolean
}) {
  return (
    <Link
      href={href}
      className="flex items-start gap-4 p-4 bg-[var(--brand-surface)] rounded-xl border border-[var(--brand-border)] hover:border-orange-200 hover:shadow-sm transition-all group"
    >
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold ${
          done
            ? 'bg-green-500 text-white'
            : 'bg-orange-100 text-orange-600 group-hover:bg-orange-500 group-hover:text-white transition-colors'
        }`}
      >
        {done ? (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M4.5 12.75l6 6 9-13.5"
            />
          </svg>
        ) : (
          step
        )}
      </div>
      <div>
        <p className="text-sm font-semibold text-[var(--brand-text)] group-hover:text-orange-600 transition-colors">
          {title}
        </p>
        <p className="text-xs text-[var(--brand-text-secondary)] mt-0.5">{description}</p>
      </div>
    </Link>
  )
}

function QuickLinkCard({
  href,
  icon,
  label,
  description,
}: {
  href: string
  icon: React.ReactNode
  label: string
  description: string
}) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center text-center p-5 bg-[var(--brand-surface)] rounded-xl border border-[var(--brand-border)] hover:border-orange-200 hover:shadow-sm transition-all group"
    >
      <div className="w-12 h-12 bg-[var(--brand-background)] rounded-xl flex items-center justify-center mb-3 group-hover:bg-orange-50 transition-colors">
        <span className="text-[var(--brand-text-secondary)] group-hover:text-orange-600 transition-colors">
          {icon}
        </span>
      </div>
      <p className="text-sm font-semibold text-[var(--brand-text)]">{label}</p>
      <p className="text-xs text-[var(--brand-text-secondary)] mt-1">{description}</p>
    </Link>
  )
}

export default function DevelopersOverviewPage() {
  const { keys, error: keysError } = useApiKeys()
  const { usage, error: usageError } = useApiUsage()
  const t = useTranslations('developersPage')

  const hasActiveKey = keys.some((k) => k.status === 'active')

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[var(--brand-text-secondary)] text-sm">{t('title')}</p>
            <h2 className="text-2xl font-bold mt-1">{t('welcomeTitle')}</h2>
            <p className="text-[var(--brand-text-secondary)] text-sm mt-2">
              {t('welcomeSubtitle')}
            </p>
          </div>
          <div className="hidden md:block">
            <svg
              className="w-16 h-16 text-[var(--brand-text-secondary)]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Quick stats */}
      <div>
        <h3 className="text-sm font-semibold text-[var(--brand-text)] mb-3">{t('todayUsage')}</h3>
        {(keysError || usageError) && (
          <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {keysError || usageError}
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            label={t('stats.apiCallsToday')}
            value={usage?.totalCallsToday.toLocaleString() ?? '—'}
            sub={t('stats.fromDailyLimit')}
          />
          <StatCard
            label={t('stats.successRate')}
            value={usage ? `${usage.successRate}%` : '—'}
            sub={t('stats.avg30Days')}
          />
          <StatCard
            label={t('stats.avgLatency')}
            value={usage ? `${usage.avgLatencyMs} ms` : '—'}
            sub={t('stats.avgResponseTime')}
          />
        </div>
      </div>

      {/* Getting started */}
      <div>
        <h3 className="text-sm font-semibold text-[var(--brand-text)] mb-3">
          {t('gettingStarted')}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <StepCard
            step={1}
            title={t('steps.createKey')}
            description={t('steps.createKeyDesc')}
            href="/developers/keys"
            done={hasActiveKey}
          />
          <StepCard
            step={2}
            title={t('steps.readDocs')}
            description={t('steps.readDocsDesc')}
            href="/developers/keys"
            done={false}
          />
          <StepCard
            step={3}
            title={t('steps.testSandbox')}
            description={t('steps.testSandboxDesc')}
            href="/developers/sandbox"
            done={false}
          />
        </div>
      </div>

      {/* Quick links */}
      <div>
        <h3 className="text-sm font-semibold text-[var(--brand-text)] mb-3">{t('quickLinks')}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <QuickLinkCard
            href="/developers/keys"
            label={t('links.manageKeys')}
            description={t('links.manageKeysDesc')}
            icon={
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z"
                />
              </svg>
            }
          />
          <QuickLinkCard
            href="/developers/usage"
            label={t('links.viewUsage')}
            description={t('links.viewUsageDesc')}
            icon={
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M3 3v18h18M7.5 15l3-3 3 3 4.5-6"
                />
              </svg>
            }
          />
          <QuickLinkCard
            href="/developers/sandbox"
            label={t('links.openSandbox')}
            description={t('links.openSandboxDesc')}
            icon={
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21a48.25 48.25 0 01-8.135-.687c-1.718-.293-2.3-2.379-1.067-3.61L5 14.5"
                />
              </svg>
            }
          />
        </div>
      </div>
    </div>
  )
}
