'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useAuth } from '@/context'
import { AppLayout } from '@/components/layout'
import { Card, CardBody } from '@/components/ui'
import { QuoteBuilder, QuoteBuilderData } from '@/components/quotes/QuoteBuilder'
import { useQuoteRequest, useSubmitQuote, useSaveDraftQuote } from '@/hooks/useQuotes'
import { useQuoteTemplates, useApplyTemplate } from '@/hooks/useQuoteTemplates'
import {
  QuoteTemplate,
  BUDGET_RANGE_LABELS,
  TIMELINE_LABELS,
  BudgetRange,
  Timeline,
} from '@/types/quotes'
import { ROUTES } from '@/lib/constants'

export default function QuotePage() {
  const t = useTranslations('quoteBuilderPage')
  const router = useRouter()
  const params = useParams()
  const requestId = params.id as string
  const { user, isLoading: authLoading } = useAuth()
  const { data: request, isLoading: requestLoading } = useQuoteRequest(requestId)
  const { data: templates, isLoading: templatesLoading } = useQuoteTemplates()
  const { submit, isLoading: isSubmitting } = useSubmitQuote()
  const { saveDraft, isLoading: isSaving } = useSaveDraftQuote()
  const { apply: applyTemplate } = useApplyTemplate()
  const [showTemplateModal, setShowTemplateModal] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<QuoteTemplate | null>(null)
  const [appliedData, setAppliedData] = useState<Partial<QuoteBuilderData> | null>(null)
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace(ROUTES.LOGIN)
    }
  }, [user, authLoading, router])

  if (authLoading || requestLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--brand-background)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  const handleApplyTemplate = (template: QuoteTemplate) => {
    const data = applyTemplate(template)
    setAppliedData(data as Partial<QuoteBuilderData>)
    setSelectedTemplate(template)
    setShowTemplateModal(false)
  }

  const handleSaveDraft = async (data: QuoteBuilderData) => {
    setErrorMsg('')
    try {
      await saveDraft({ requestId, ...data })
      setSuccessMsg(t('draftSaved'))
      setTimeout(() => setSuccessMsg(''), 3000)
    } catch {
      setErrorMsg(t('draftSaveError'))
    }
  }

  const handleSubmit = async (data: QuoteBuilderData) => {
    setErrorMsg('')
    if (!data.specifications.panelBrand || !data.specifications.inverterBrand) {
      setErrorMsg(t('validation.fillSystemInfo'))
      return
    }
    if (!data.timeline.installationStartDate || !data.timeline.installationEndDate) {
      setErrorMsg(t('validation.specifyDates'))
      return
    }
    try {
      await submit({ requestId, ...data, validDays: data.validDays, attachments: [] })
      router.push(`/leads/${requestId}/quote/preview?submitted=true`)
    } catch {
      setErrorMsg(t('submitError'))
    }
  }

  const handlePreview = (data: QuoteBuilderData) => {
    sessionStorage.setItem(`quote_preview_${requestId}`, JSON.stringify(data))
    router.push(`/leads/${requestId}/quote/preview`)
  }

  return (
    <AppLayout user={user}>
      <div className="max-w-3xl space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm text-[var(--brand-text-secondary)] mb-1">
              <button onClick={() => router.back()} className="hover:text-orange-500">
                ← {t('back')}
              </button>
              <span>/</span>
              <span>{t('createQuote')}</span>
            </div>
            <h1 className="text-xl font-bold text-[var(--brand-text)]">{t('createQuote')}</h1>
          </div>
          <button
            onClick={() => setShowTemplateModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-sm border border-orange-300 text-orange-600 rounded-lg hover:bg-orange-50 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414A1 1 0 0120 8.414V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"
              />
            </svg>
            {t('loadTemplate')}
          </button>
        </div>

        {/* Request summary */}
        {request && (
          <div className="bg-blue-500/10 border border-blue-200 rounded-xl p-4 text-sm">
            <div className="flex items-center gap-2 font-semibold text-blue-800 mb-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {t('requestDetails')}
            </div>
            <div className="grid grid-cols-2 gap-2 text-[var(--brand-text)]">
              <div>
                <span className="text-[var(--brand-text-secondary)]">{t('location')}: </span>
                <span className="font-medium">{request.locationDisplay || t('notSpecified')}</span>
              </div>
              <div>
                <span className="text-[var(--brand-text-secondary)]">{t('systemSize')}: </span>
                <span className="font-medium">{request.systemSizeKw || '—'} kW</span>
              </div>
              <div>
                <span className="text-[var(--brand-text-secondary)]">{t('budget')}: </span>
                <span className="font-medium">
                  {BUDGET_RANGE_LABELS[request.preferences.budgetRange as BudgetRange]}
                </span>
              </div>
              <div>
                <span className="text-[var(--brand-text-secondary)]">{t('timeline')}: </span>
                <span className="font-medium">
                  {TIMELINE_LABELS[request.preferences.preferredTimeline as Timeline]}
                </span>
              </div>
            </div>
            {request.preferences.additionalRequirements && (
              <div className="mt-2 p-2 bg-[var(--brand-surface)] rounded-lg text-[var(--brand-text-secondary)] text-xs border border-blue-100">
                {t('additionalRequirements')}: {request.preferences.additionalRequirements}
              </div>
            )}
          </div>
        )}

        {/* Template applied banner */}
        {selectedTemplate && (
          <div className="bg-green-500/10 border border-green-200 rounded-xl p-3 flex items-center justify-between">
            <span className="text-sm text-green-800">
              {t('usingTemplate')}: <strong>{selectedTemplate.name}</strong>
            </span>
            <button
              onClick={() => {
                setSelectedTemplate(null)
                setAppliedData(null)
              }}
              className="text-xs text-green-600 hover:text-green-800"
            >
              {t('clear')}
            </button>
          </div>
        )}

        {/* Messages */}
        {successMsg && (
          <div className="bg-green-500/10 border border-green-200 rounded-lg p-3 text-sm text-green-800">
            {successMsg}
          </div>
        )}
        {errorMsg && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-sm text-red-400">
            {errorMsg}
          </div>
        )}

        {/* Builder */}
        <Card>
          <CardBody>
            <QuoteBuilder
              requestId={requestId}
              systemSizeKw={request?.systemSizeKw}
              locationDisplay={request?.locationDisplay}
              onSaveDraft={handleSaveDraft}
              onSubmit={handleSubmit}
              onPreview={handlePreview}
              isSubmitting={isSubmitting}
              isSaving={isSaving}
              initialData={appliedData || undefined}
            />
          </CardBody>
        </Card>
      </div>

      {/* Template modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-[var(--brand-surface)] rounded-2xl shadow-xl w-full max-w-md max-h-[80vh] overflow-y-auto">
            <div className="p-5 border-b border-[var(--brand-border)] flex items-center justify-between">
              <h3 className="font-semibold text-[var(--brand-text)]">{t('templates.select')}</h3>
              <button
                onClick={() => setShowTemplateModal(false)}
                className="text-[var(--brand-text-secondary)] hover:text-[var(--brand-text-secondary)]"
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
            <div className="p-4 space-y-3">
              {templatesLoading ? (
                <div className="text-center py-8 text-[var(--brand-text-secondary)]">
                  {t('loading')}
                </div>
              ) : templates.length === 0 ? (
                <div className="text-center py-8 text-[var(--brand-text-secondary)]">
                  {t('templates.noTemplates')}
                </div>
              ) : (
                templates.map((tpl) => (
                  <div
                    key={tpl.id}
                    onClick={() => handleApplyTemplate(tpl)}
                    className="p-4 border border-[var(--brand-border)] rounded-xl hover:border-orange-400 hover:bg-orange-50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-[var(--brand-text)] text-sm">
                        {tpl.name}
                      </span>
                      {tpl.isDefault && (
                        <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">
                          Default
                        </span>
                      )}
                    </div>
                    {tpl.description && (
                      <p className="text-xs text-[var(--brand-text-secondary)]">
                        {tpl.description}
                      </p>
                    )}
                    {tpl.pricing?.totalPrice && (
                      <p className="text-xs text-orange-600 mt-1 font-medium">
                        {t('approximatePrice')} ฿{tpl.pricing.totalPrice.toLocaleString('en-US')}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  )
}
