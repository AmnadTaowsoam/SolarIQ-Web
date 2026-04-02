'use client'

/**
 * Sandbox / Testing page (WK-031)
 * Auth and AppLayout handled by developers/layout.tsx
 */

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import { apiClient } from '@/lib/api'

const SANDBOX_KEY = process.env.NEXT_PUBLIC_SANDBOX_API_KEY || ''

interface TestResult {
  status: number
  data: unknown
  latencyMs: number
  error?: string
}

function buildQuickTests(t: ReturnType<typeof useTranslations<'developersPage'>>) {
  return [
    {
      id: 'analyze-bill',
      label: t('sandbox.tests.analyzeBill'),
      description: t('sandbox.tests.analyzeBillDesc'),
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
          />
        </svg>
      ),
      endpoint: 'POST /api/v1/solar/analyze',
      payload: { monthlyBill: 3500, electricityUnit: 'PEA', roofArea: 50, location: 'Bangkok' },
      demoResponse: {
        recommendedSystemSize: 8,
        estimatedSavingsPerYear: 25200,
        paybackPeriodYears: 7.1,
        roi: 14.1,
        co2ReductionTons: 3.2,
      },
    },
    {
      id: 'create-lead',
      label: t('sandbox.tests.createLead'),
      description: t('sandbox.tests.createLeadDesc'),
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z"
          />
        </svg>
      ),
      endpoint: 'POST /api/v1/leads',
      payload: {
        name: 'Test Customer Sandbox',
        phone: '0812345678',
        email: 'sandbox@test.com',
        monthlyBill: 3500,
        address: 'Bangkok',
      },
      demoResponse: {
        id: 'lead-sandbox-12345',
        status: 'new',
        createdAt: new Date().toISOString(),
      },
    },
    {
      id: 'get-quote',
      label: t('sandbox.tests.getQuote'),
      description: t('sandbox.tests.getQuoteDesc'),
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      ),
      endpoint: 'POST /api/v1/proposals',
      payload: {
        leadId: 'lead-sandbox-12345',
        systemSize: 8,
        panelBrand: 'Tier1',
        inverterBrand: 'Standard',
      },
      demoResponse: {
        id: 'proposal-sandbox-67890',
        totalPrice: 180000,
        systemSize: 8,
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      },
    },
  ]
}

type QuickTest = ReturnType<typeof buildQuickTests>[0]

function TestCard({
  test,
  onRun,
  result,
  isRunning,
  t,
}: {
  test: QuickTest
  onRun: (test: QuickTest) => void
  result: TestResult | null
  isRunning: boolean
  t: ReturnType<typeof useTranslations<'developersPage'>>
}) {
  const [showPayload, setShowPayload] = useState(false)

  return (
    <div className="bg-[var(--brand-surface)] rounded-2xl border border-[var(--brand-border)] overflow-hidden">
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600 flex-shrink-0">
              {test.icon}
            </div>
            <div>
              <h3 className="text-sm font-bold text-[var(--brand-text)]">{test.label}</h3>
              <p className="text-xs text-[var(--brand-text-secondary)] mt-0.5">
                {test.description}
              </p>
              <code className="text-[11px] font-mono text-[var(--brand-text-secondary)] mt-1 block">
                {test.endpoint}
              </code>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPayload(!showPayload)}
              className="text-xs font-medium text-[var(--brand-text-secondary)] hover:text-[var(--brand-text)] px-2.5 py-1.5 rounded-lg hover:bg-[var(--brand-background)] transition-colors"
            >
              {showPayload ? t('sandbox.hidePayload') : t('sandbox.showPayload')}
            </button>
            <button
              onClick={() => onRun(test)}
              disabled={isRunning}
              className={cn(
                'flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-xl transition-colors',
                isRunning
                  ? 'bg-[var(--brand-background)] text-[var(--brand-text-secondary)] cursor-not-allowed'
                  : 'bg-orange-500 text-white hover:bg-orange-600'
              )}
            >
              {isRunning ? (
                <>
                  <div className="w-4 h-4 border-2 border-[var(--brand-border)] border-t-gray-600 rounded-full animate-spin" />
                  {t('sandbox.running')}
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z"
                    />
                  </svg>
                  {t('sandbox.run')}
                </>
              )}
            </button>
          </div>
        </div>
        {showPayload && (
          <div className="mt-4 bg-[var(--brand-background)] rounded-xl p-4">
            <p className="text-[11px] font-semibold text-[var(--brand-text-secondary)] uppercase tracking-wider mb-2">
              {t('sandbox.requestPayload')}
            </p>
            <pre className="text-xs font-mono text-[var(--brand-text)] overflow-x-auto">
              {JSON.stringify(test.payload, null, 2)}
            </pre>
          </div>
        )}
      </div>
      {result && (
        <div
          className={cn(
            'border-t px-5 py-4',
            result.error ? 'bg-red-500/10 border-red-100' : 'bg-green-500/10 border-green-100'
          )}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  'text-xs font-bold px-2 py-0.5 rounded-full',
                  result.status >= 200 && result.status < 300
                    ? 'bg-green-200 text-green-800'
                    : 'bg-red-200 text-red-400'
                )}
              >
                {result.status}
              </span>
              <span className="text-xs text-[var(--brand-text-secondary)]">
                {result.latencyMs}ms
              </span>
            </div>
            {result.error && <span className="text-xs text-orange-600">{result.error}</span>}
          </div>
          <pre className="text-xs font-mono text-[var(--brand-text)] overflow-x-auto">
            {JSON.stringify(result.data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}

export default function SandboxPage() {
  const t = useTranslations('developersPage')
  const QUICK_TESTS = buildQuickTests(t)
  const [results, setResults] = useState<Record<string, TestResult | null>>({})
  const [runningId, setRunningId] = useState<string | null>(null)
  const [isResetting, setIsResetting] = useState(false)
  const [error, setError] = useState('')

  const handleRun = async (test: QuickTest) => {
    setRunningId(test.id)
    setError('')
    const start = Date.now()
    try {
      const response = await apiClient.post(test.endpoint.split(' ')[1] || '', test.payload, {
        headers: { Authorization: `Bearer ${SANDBOX_KEY}` },
      })
      setResults((prev) => ({
        ...prev,
        [test.id]: { status: response.status, data: response.data, latencyMs: Date.now() - start },
      }))
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sandbox request failed.'
      setResults((prev) => ({
        ...prev,
        [test.id]: {
          status: 500,
          data: { message },
          latencyMs: Date.now() - start,
          error: message,
        },
      }))
    } finally {
      setRunningId(null)
    }
  }

  const handleReset = async () => {
    setIsResetting(true)
    setError('')
    try {
      await apiClient.post('/api/v1/developers/sandbox/reset')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to reset sandbox right now.')
    }
    setResults({})
    setIsResetting(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-[var(--brand-text)]">{t('sandbox.title')}</h2>
          <p className="text-sm text-[var(--brand-text-secondary)] mt-0.5">
            {t('sandbox.subtitle')}
          </p>
        </div>
        <button
          onClick={handleReset}
          disabled={isResetting}
          className="flex items-center gap-2 px-4 py-2.5 border border-[var(--brand-border)] text-sm font-medium text-[var(--brand-text)] rounded-xl hover:bg-[var(--brand-background)] transition-colors disabled:opacity-50"
        >
          <svg
            className={cn('w-4 h-4', isResetting && 'animate-spin')}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
            />
          </svg>
          {isResetting ? t('sandbox.resetting') : t('sandbox.resetData')}
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {error}
        </div>
      )}

      {/* Sandbox key */}
      <div className="bg-blue-500/10 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
        <svg
          className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z"
          />
        </svg>
        <div className="flex-1">
          <p className="text-sm font-semibold text-blue-800">{t('sandbox.sandboxKey')}</p>
          <div className="flex items-center gap-2 mt-1">
            <code className="text-xs font-mono text-blue-700 bg-blue-500/10 px-2 py-1 rounded-lg">
              {SANDBOX_KEY}
            </code>
          </div>
          <p className="text-xs text-blue-600 mt-1">{t('sandbox.sandboxKeyHint')}</p>
        </div>
      </div>

      {/* Quick tests */}
      <div>
        <h3 className="text-sm font-semibold text-[var(--brand-text)] mb-3">
          {t('sandbox.quickTests')}
        </h3>
        <div className="space-y-4">
          {QUICK_TESTS.map((test) => (
            <TestCard
              key={test.id}
              test={test}
              onRun={handleRun}
              result={results[test.id] ?? null}
              isRunning={runningId === test.id}
              t={t}
            />
          ))}
        </div>
      </div>

      {/* Notes */}
      <div className="bg-[var(--brand-background)] border border-[var(--brand-border)] rounded-xl p-4">
        <p className="text-xs font-semibold text-[var(--brand-text-secondary)] mb-2">
          {t('sandbox.notes.title')}
        </p>
        <ul className="text-xs text-[var(--brand-text-secondary)] space-y-1 list-disc list-inside">
          <li>{t('sandbox.notes.autoReset')}</li>
          <li>{t('sandbox.notes.rateLimit')}</li>
          <li>{t('sandbox.notes.noRealNotifications')}</li>
          <li>{t('sandbox.notes.testWebhooks')}</li>
        </ul>
      </div>
    </div>
  )
}
