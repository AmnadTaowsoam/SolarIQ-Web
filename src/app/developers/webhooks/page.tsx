'use client'

/**
 * Webhook Management page (WK-031)
 * Auth and AppLayout handled by developers/layout.tsx
 */

import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { th } from 'date-fns/locale'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import { useWebhooks, WEBHOOK_EVENTS } from '@/hooks/useDeveloperApi'
import type { Webhook } from '@/hooks/useDeveloperApi'

// ============== Add Endpoint Modal ==============

function AddEndpointModal({
  onClose,
  onAdd,
}: {
  onClose: () => void
  onAdd: (data: { url: string; events: string[] }) => Promise<Webhook>
}) {
  const t = useTranslations('developersExtra')
  const [url, setUrl] = useState('')
  const [selectedEvents, setSelectedEvents] = useState<string[]>(['lead.created'])
  const [isCreating, setIsCreating] = useState(false)
  const [createdWebhook, setCreatedWebhook] = useState<Webhook | null>(null)
  const [urlError, setUrlError] = useState('')

  const validateUrl = (value: string) => {
    try {
      new URL(value)
      setUrlError('')
      return true
    } catch {
      setUrlError(t('webhooks.url'))
      return false
    }
  }

  const handleAdd = async () => {
    if (!validateUrl(url) || selectedEvents.length === 0) {
      return
    }
    setIsCreating(true)
    try {
      const result = await onAdd({ url, events: selectedEvents })
      setCreatedWebhook(result)
    } finally {
      setIsCreating(false)
    }
  }

  const toggleEvent = (id: string) => {
    setSelectedEvents((prev) => (prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h3 className="text-base font-bold text-gray-900">
            {createdWebhook ? t('webhooks.saveWebhook') : t('webhooks.addWebhook')}
          </h3>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-5">
          {createdWebhook ? (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <p className="text-sm font-semibold text-green-800 mb-1">
                  {t('webhooks.testSuccess')}
                </p>
                <p className="text-xs text-green-700">{t('webhooks.secret')}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-600 mb-1.5">{t('webhooks.secret')}</p>
                <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                  <code className="text-xs font-mono text-gray-800 break-all">
                    {createdWebhook.secret}
                  </code>
                </div>
                <p className="text-xs text-gray-500 mt-1.5">{t('webhooks.secret')}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-600 mb-1.5">
                  {t('webhooks.events')} ({createdWebhook.events.length})
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {createdWebhook.events.map((e) => (
                    <code
                      key={e}
                      className="text-xs bg-orange-50 text-orange-700 px-2 py-1 rounded-lg font-mono"
                    >
                      {e}
                    </code>
                  ))}
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-full py-3 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-800 transition-colors"
              >
                {t('webhooks.saveWebhook')}
              </button>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Endpoint URL
                </label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => {
                    setUrl(e.target.value)
                    if (urlError) {
                      setUrlError('')
                    }
                  }}
                  onBlur={() => url && validateUrl(url)}
                  placeholder="https://yoursite.com/webhooks/solariq"
                  className={cn(
                    'w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2',
                    urlError
                      ? 'border-red-300 focus:ring-red-400'
                      : 'border-gray-200 focus:ring-orange-400'
                  )}
                />
                {urlError && <p className="text-xs text-red-600 mt-1">{urlError}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Events ({selectedEvents.length} เลือก)
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {WEBHOOK_EVENTS.map((event) => (
                    <label key={event.id} className="flex items-start gap-3 cursor-pointer group">
                      <div
                        className={cn(
                          'w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors mt-0.5',
                          selectedEvents.includes(event.id)
                            ? 'bg-orange-500 border-orange-500'
                            : 'border-gray-300 group-hover:border-orange-400'
                        )}
                        onClick={() => toggleEvent(event.id)}
                      >
                        {selectedEvents.includes(event.id) && (
                          <svg
                            className="w-3 h-3 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={3}
                              d="M4.5 12.75l6 6 9-13.5"
                            />
                          </svg>
                        )}
                      </div>
                      <div onClick={() => toggleEvent(event.id)}>
                        <code className="text-xs font-mono text-gray-800">{event.name}</code>
                        <p className="text-xs text-gray-500">{event.description}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={onClose}
                  className="flex-1 py-3 border border-gray-200 text-sm font-medium text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={handleAdd}
                  disabled={!url || !!urlError || selectedEvents.length === 0 || isCreating}
                  className="flex-1 py-3 bg-orange-500 text-white text-sm font-semibold rounded-xl hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isCreating ? t('webhooks.saveWebhook') : t('webhooks.addWebhook')}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ============== Main Page ==============

export default function WebhooksPage() {
  const t = useTranslations('developersExtra')
  const { webhooks, isLoading, createWebhook, deleteWebhook, testWebhook } = useWebhooks()
  const [showAddModal, setShowAddModal] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Webhook | null>(null)
  const [testingId, setTestingId] = useState<string | null>(null)
  const [testResult, setTestResult] = useState<Record<string, boolean | null>>({})

  const handleTest = async (webhook: Webhook) => {
    setTestingId(webhook.id)
    const ok = await testWebhook(webhook.id)
    setTestResult((prev) => ({ ...prev, [webhook.id]: ok }))
    setTestingId(null)
    setTimeout(() => setTestResult((prev) => ({ ...prev, [webhook.id]: null })), 3000)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">{t('webhooks.title')}</h2>
          <p className="text-sm text-gray-500 mt-0.5">{t('webhooks.noWebhooksDesc')}</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-orange-500 text-white text-sm font-semibold rounded-xl hover:bg-orange-600 transition-colors shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4.5v15m7.5-7.5h-15"
            />
          </svg>
          {t('webhooks.addWebhook')}
        </button>
      </div>

      {/* Webhooks table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="p-8 space-y-4 animate-pulse">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-100 rounded-xl" />
            ))}
          </div>
        ) : webhooks.length === 0 ? (
          <div className="py-16 text-center">
            <svg
              className="w-12 h-12 text-gray-300 mx-auto mb-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244"
              />
            </svg>
            <p className="text-sm text-gray-500">{t('webhooks.noWebhooks')}</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-3 text-sm text-orange-600 font-medium hover:text-orange-700"
            >
              {t('webhooks.addWebhook')}
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="border-b border-gray-100">
                <tr>
                  {[
                    t('webhooks.url'),
                    t('webhooks.events'),
                    t('webhooks.status'),
                    'Triggered',
                    t('webhooks.test'),
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-5 py-3.5 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {webhooks.map((wh) => (
                  <tr key={wh.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-4">
                      <code className="text-sm font-mono text-gray-800 break-all">{wh.url}</code>
                      {wh.failureCount > 0 && (
                        <p className="text-xs text-red-600 mt-0.5">{wh.failureCount} failures</p>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-medium text-gray-700">
                          {wh.events.length} events
                        </span>
                        <div className="group relative">
                          <button className="p-1 text-gray-400 hover:text-gray-600">
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                          </button>
                          <div className="absolute left-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-xl shadow-lg p-2 hidden group-hover:block z-10">
                            {wh.events.map((e) => (
                              <code key={e} className="block text-xs text-gray-700 py-0.5">
                                {e}
                              </code>
                            ))}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={cn(
                          'inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full',
                          wh.status === 'active'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-600'
                        )}
                      >
                        <span
                          className={cn(
                            'w-1.5 h-1.5 rounded-full',
                            wh.status === 'active' ? 'bg-green-500' : 'bg-gray-400'
                          )}
                        />
                        {wh.status === 'active' ? t('webhooks.active') : t('webhooks.inactive')}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs text-gray-500 whitespace-nowrap">
                      {wh.lastTriggeredAt
                        ? formatDistanceToNow(new Date(wh.lastTriggeredAt), {
                            addSuffix: true,
                            locale: th,
                          })
                        : t('webhooks.noWebhooks')}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleTest(wh)}
                          disabled={testingId === wh.id}
                          className={cn(
                            'text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors',
                            testResult[wh.id] === true
                              ? 'border-green-300 text-green-700 bg-green-50'
                              : testResult[wh.id] === false
                                ? 'border-red-300 text-red-700 bg-red-50'
                                : 'border-blue-200 text-blue-700 hover:bg-blue-50'
                          )}
                        >
                          {testingId === wh.id
                            ? t('webhooks.test')
                            : testResult[wh.id] === true
                              ? t('webhooks.testSuccess')
                              : testResult[wh.id] === false
                                ? t('webhooks.testError')
                                : t('webhooks.test')}
                        </button>
                        <button
                          onClick={() => setDeleteTarget(wh)}
                          className="text-xs font-medium px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
                        >
                          {t('webhooks.delete')}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Docs note */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex items-start gap-3">
        <svg
          className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
          />
        </svg>
        <div>
          <p className="text-sm font-semibold text-gray-700">{t('webhooks.secret')}</p>
          <p className="text-xs text-gray-500 mt-0.5">
            SolarIQ <code className="font-mono bg-gray-100 px-1 rounded">X-SolarIQ-Signature</code>
          </p>
        </div>
      </div>

      {/* Modals */}
      {showAddModal && (
        <AddEndpointModal onClose={() => setShowAddModal(false)} onAdd={createWebhook} />
      )}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <h3 className="text-base font-bold text-gray-900 text-center mb-2">
              {t('webhooks.delete')}
            </h3>
            <p className="text-sm text-gray-600 text-center mb-6">
              {t('webhooks.confirmDelete')}{' '}
              <strong className="break-all">{deleteTarget.url}</strong>
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 py-2.5 border border-gray-200 text-sm font-medium text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
              >
                ยกเลิก
              </button>
              <button
                onClick={async () => {
                  await deleteWebhook(deleteTarget.id)
                  setDeleteTarget(null)
                }}
                className="flex-1 py-2.5 bg-red-500 text-white text-sm font-semibold rounded-xl hover:bg-red-600 transition-colors"
              >
                {t('webhooks.delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
