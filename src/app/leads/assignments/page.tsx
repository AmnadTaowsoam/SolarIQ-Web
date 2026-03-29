'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { AppLayout } from '@/components/layout/AppLayout'
import { useAuth } from '@/context/AuthContext'
import {
  usePendingAssignments,
  useAcceptAssignment,
  useDeclineAssignment,
  LeadAssignment,
} from '@/hooks/useLeadRouting'

// ---------------------------------------------------------------------------
// Countdown timer component
// ---------------------------------------------------------------------------

function Countdown({ expiresAt }: { expiresAt: string }) {
  const [remaining, setRemaining] = useState(0)

  useEffect(() => {
    const calc = () => {
      const diff = Math.max(0, new Date(expiresAt).getTime() - Date.now())
      setRemaining(Math.floor(diff / 1000))
    }
    calc()
    const interval = setInterval(calc, 1000)
    return () => clearInterval(interval)
  }, [expiresAt])

  const h = Math.floor(remaining / 3600)
  const m = Math.floor((remaining % 3600) / 60)
  const s = remaining % 60

  const formatted = `${h > 0 ? `${h}:` : ''}${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  const isUrgent = remaining < 300 // < 5 min

  return (
    <span
      className={`font-mono font-semibold ${isUrgent ? 'text-red-600 animate-pulse' : 'text-orange-600'}`}
    >
      {formatted}
    </span>
  )
}

// ---------------------------------------------------------------------------
// Assignment card
// ---------------------------------------------------------------------------

function AssignmentCard({
  assignment,
  onAccept,
  onDecline,
  t,
}: {
  assignment: LeadAssignment
  onAccept: (id: string) => Promise<void>
  onDecline: (id: string) => Promise<void>
  t: (key: string) => string
}) {
  const [isActing, setIsActing] = useState(false)
  const [done, setDone] = useState<'accepted' | 'declined' | null>(null)

  const handleAccept = async () => {
    setIsActing(true)
    try {
      await onAccept(assignment.id)
      setDone('accepted')
    } catch {
      // noop
    } finally {
      setIsActing(false)
    }
  }

  const handleDecline = async () => {
    setIsActing(true)
    try {
      await onDecline(assignment.id)
      setDone('declined')
    } catch {
      // noop
    } finally {
      setIsActing(false)
    }
  }

  if (done === 'accepted') {
    return (
      <div className="rounded-2xl border border-green-200 bg-green-500/10 p-5 text-center">
        <p className="text-green-700 font-semibold">{t('assigned')}</p>
        <p className="text-sm text-green-600 mt-1">
          {t('lead')}: {assignment.lead.district}, {assignment.lead.province}
        </p>
      </div>
    )
  }

  if (done === 'declined') {
    return (
      <div className="rounded-2xl border border-[var(--brand-border)] bg-[var(--brand-background)] p-5 text-center">
        <p className="text-[var(--brand-text-secondary)] font-medium">{t('unassigned')}</p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border-2 border-orange-200 bg-[var(--brand-surface)] shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-400 px-5 py-3 flex items-center justify-between">
        <p className="text-white font-semibold text-sm">{t('assignLead')}</p>
        <div className="flex items-center gap-1.5 bg-[var(--brand-surface)]/20 rounded-full px-3 py-1">
          <svg
            className="w-3.5 h-3.5 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span className="text-white text-xs">
            <Countdown expiresAt={assignment.expires_at} />
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="p-5 space-y-3">
        <div className="flex items-center gap-2 text-[var(--brand-text)]">
          <span className="text-lg">📍</span>
          <span className="text-sm font-medium">
            {assignment.lead.district}, {assignment.lead.province}
          </span>
        </div>
        <div className="flex items-center gap-2 text-[var(--brand-text)]">
          <span className="text-lg">⚡</span>
          <span className="text-sm">
            {t('workload')}: <strong>{assignment.lead.recommended_size_kw.toFixed(2)} kW</strong>
          </span>
        </div>
        <div className="flex items-center gap-2 text-[var(--brand-text)]">
          <span className="text-lg">💰</span>
          <span className="text-sm">
            {t('leads')}:{' '}
            <strong>
              ฿{assignment.lead.monthly_bill_thb.toLocaleString('th-TH')}/{t('thisMonth')}
            </strong>
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="px-5 pb-5 flex gap-3">
        <button
          type="button"
          onClick={handleDecline}
          disabled={isActing}
          className="flex-1 py-2.5 rounded-xl border-2 border-[var(--brand-border)] text-[var(--brand-text-secondary)] font-semibold text-sm hover:bg-[var(--brand-primary-light)] transition-colors disabled:opacity-50"
        >
          ❌ {t('unassign')}
        </button>
        <button
          type="button"
          onClick={handleAccept}
          disabled={isActing}
          className="flex-1 py-2.5 rounded-xl bg-green-600 text-white font-semibold text-sm hover:bg-green-700 transition-colors disabled:opacity-50 shadow-sm"
        >
          {isActing ? t('save') : `✅ ${t('assign')}`}
        </button>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function LeadAssignmentsPage() {
  const t = useTranslations('leadAssignments')
  const { user } = useAuth()
  const { assignments, isLoading, error, refetch } = usePendingAssignments()
  const { accept } = useAcceptAssignment()
  const { decline } = useDeclineAssignment()

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(refetch, 30_000)
    return () => clearInterval(interval)
  }, [refetch])

  return (
    <AppLayout user={user}>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-[var(--brand-text)]">{t('title')}</h1>
            <p className="text-sm text-[var(--brand-text-secondary)] mt-1">
              {assignments.length > 0 ? `${assignments.length} ${t('leads')}` : t('noAssignments')}
            </p>
          </div>
          <button
            type="button"
            onClick={refetch}
            className="p-2 text-[var(--brand-text-secondary)] hover:text-[var(--brand-text-secondary)] hover:bg-[var(--brand-primary-light)] rounded-lg transition-colors"
            title={t('note')}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500" />
          </div>
        )}

        {/* Error */}
        {error && !isLoading && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Assignment cards */}
        {!isLoading && assignments.length > 0 && (
          <div className="space-y-4">
            {assignments.map((assignment) => (
              <AssignmentCard
                key={assignment.id}
                assignment={assignment}
                onAccept={accept}
                onDecline={decline}
                t={t}
              />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !error && assignments.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-[var(--brand-background)] rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-[var(--brand-text-secondary)]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <p className="text-[var(--brand-text-secondary)] font-medium">{t('noAssignments')}</p>
            <p className="text-sm text-[var(--brand-text-secondary)] mt-1">
              {t('noAssignmentsDesc')}
            </p>
          </div>
        )}

        {/* Info box */}
        <div className="p-4 bg-blue-500/10 border border-blue-200 rounded-xl text-sm text-blue-700">
          <p className="font-medium mb-1">{t('note')}</p>
          <ul className="space-y-1 text-blue-600 list-disc list-inside">
            <li>{t('date')}</li>
            <li>{t('status')}</li>
            <li>{t('thisMonth')}</li>
          </ul>
        </div>
      </div>
    </AppLayout>
  )
}
