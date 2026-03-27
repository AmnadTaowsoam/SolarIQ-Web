'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'

interface ConsentType {
  id: string
  type: string
  label: string
  description: string
  granted: boolean
  granted_at: string | null
}

interface ConsentData {
  line_user_id: string
  consents: ConsentType[]
}

export default function ConsentPage(): React.ReactElement {
  const t = useTranslations('consentPage')
  const router = useRouter()

  const consentDefinitions = useMemo(
    () => [
      {
        type: 'marketing',
        label: t('types.marketing.label'),
        description: t('types.marketing.description'),
        icon: t('types.marketing.icon'),
      },
      {
        type: 'contact_sharing',
        label: t('types.contactSharing.label'),
        description: t('types.contactSharing.description'),
        icon: t('types.contactSharing.icon'),
      },
      {
        type: 'analysis_results',
        label: t('types.analysisResults.label'),
        description: t('types.analysisResults.description'),
        icon: t('types.analysisResults.icon'),
      },
      {
        type: 'proposal_sharing',
        label: t('types.proposalSharing.label'),
        description: t('types.proposalSharing.description'),
        icon: t('types.proposalSharing.icon'),
      },
    ],
    [t]
  )

  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [consentTypes, setConsentTypes] = useState<ConsentType[]>(
    consentDefinitions.map((def) => ({
      id: def.type,
      type: def.type,
      label: def.label,
      description: def.description,
      granted: false,
      granted_at: null,
    }))
  )

  const fetchConsents = useCallback(async () => {
    try {
      const lineUserId = localStorage.getItem('line_user_id')
      if (!lineUserId) {
        router.push('/liff/login')
        return
      }

      const response = await fetch(`/api/liff/consent/${lineUserId}`)
      if (response.ok) {
        const data: ConsentData = await response.json()

        const mergedConsents = consentDefinitions.map((def) => {
          const existingConsent = data.consents.find((c) => c.type === def.type)
          return {
            id: def.type,
            type: def.type,
            label: def.label,
            description: def.description,
            granted: existingConsent?.granted ?? false,
            granted_at: existingConsent?.granted_at ?? null,
          }
        })

        setConsentTypes(mergedConsents)
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Error fetching consents:', err)
    } finally {
      setIsLoading(false)
    }
  }, [router, consentDefinitions])

  useEffect(() => {
    fetchConsents()
  }, [fetchConsents])

  const handleConsentToggle = (consentType: string) => {
    setConsentTypes((prev) =>
      prev.map((consent) =>
        consent.type === consentType ? { ...consent, granted: !consent.granted } : consent
      )
    )
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setError(null)

    try {
      const lineUserId = localStorage.getItem('line_user_id')
      if (!lineUserId) {
        router.push('/liff/login')
        return
      }

      const grantedConsents = consentTypes.filter((c) => c.granted)

      for (const consent of grantedConsents) {
        const response = await fetch('/api/liff/consent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            line_user_id: lineUserId,
            consent_type: consent.type,
            granted: true,
          }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.detail || t('errors.save'))
        }
      }

      setSuccess(true)

      setTimeout(() => {
        router.push('/liff')
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errors.general'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSkip = () => {
    router.push('/liff')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('loading')}</p>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="mt-4 text-xl font-semibold text-gray-900">{t('success.title')}</h2>
          <p className="mt-2 text-gray-600">{t('success.redirecting')}</p>
        </div>
      </div>
    )
  }

  const grantedCount = consentTypes.filter((c) => c.granted).length

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-green-600 text-white p-4 shadow-md">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">{t('title')}</h1>
        </div>
      </header>

      <main className="p-4 max-w-lg mx-auto">
        <div className="bg-white rounded-xl shadow-sm p-6 mb-4">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">{t('description')}</h2>
            <p className="text-sm text-gray-600">{t('rights.description')}</p>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            {consentTypes.map((consent) => {
              const definition = consentDefinitions.find((d) => d.type === consent.type)
              return (
                <div
                  key={consent.type}
                  className={`p-4 rounded-lg border-2 transition-colors cursor-pointer ${
                    consent.granted
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                  onClick={() => handleConsentToggle(consent.type)}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{definition?.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-gray-900">{consent.label}</h3>
                        <div
                          className={`w-12 h-7 rounded-full transition-colors ${
                            consent.granted ? 'bg-green-500' : 'bg-gray-300'
                          }`}
                        >
                          <div
                            className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform mt-1 ${
                              consent.granted ? 'translate-x-6 ml-1' : 'translate-x-1'
                            }`}
                          />
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{consent.description}</p>
                    {consent.granted_at && (
                      <p className="text-xs text-gray-400 mt-2">
                        {t('consents.grantedAt')}{' '}
                        {new Date(consent.granted_at).toLocaleDateString('th-TH')}
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-start gap-2">
              <svg
                className="w-5 h-5 text-blue-600 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <p className="text-sm text-blue-800 font-medium">{t('rights.title')}</p>
                <p className="text-xs text-blue-600 mt-1">{t('rights.description')}</p>
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || grantedCount === 0}
              className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  {t('actions.submitting')}
                </span>
              ) : (
                `${t('actions.save')} (${grantedCount}/${consentTypes.length})`
              )}
            </button>

            <button
              onClick={handleSkip}
              disabled={isSubmitting}
              className="w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
            >
              {t('actions.skip')}
            </button>
          </div>
        </div>

        <p className="text-xs text-gray-500 text-center">{t('pdpaNotice')}</p>

        {/* WK-021: PDPA data rights link & DPO contact */}
        <div className="mt-4 bg-white rounded-xl shadow-sm p-4 space-y-3">
          <a
            href="/liff/data-rights"
            className="flex items-center justify-between text-sm font-medium text-green-700 hover:text-green-800 transition-colors"
          >
            <span>{t('dataRightsLink')}</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
          <div className="border-t border-gray-100 pt-3 text-xs text-gray-500 space-y-0.5">
            <p className="font-medium text-gray-600">{t('dpoContact.title')}</p>
            <p>
              {t('dpoContact.email')}:{' '}
              <a href="mailto:dpo@solariq.app" className="text-green-600 hover:underline">
                dpo@solariq.app
              </a>
            </p>
            <p>
              {t('dpoContact.phone')}:{' '}
              <a href="tel:085-662-1113" className="text-green-600 hover:underline">
                085-662-1113
              </a>
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
