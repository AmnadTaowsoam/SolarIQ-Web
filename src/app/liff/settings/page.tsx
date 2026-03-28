'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'

interface ContactData {
  id: string
  line_user_id: string
  phone: string
  email: string | null
  display_name: string | null
  quality_score: number | null
  quality_tier: string | null
}

interface ConsentType {
  id: string
  type: string
  label: string
  description: string
  granted: boolean
  granted_at: string | null
}

const CONSENT_DEFINITIONS = [
  {
    type: 'marketing',
    labelKey: 'consent.marketing.label',
    descriptionKey: 'consent.marketing.description',
    icon: '📢',
  },
  {
    type: 'contact_sharing',
    labelKey: 'consent.contactSharing.label',
    descriptionKey: 'consent.contactSharing.description',
    icon: '🤝',
  },
  {
    type: 'analysis_results',
    labelKey: 'consent.analysisResults.label',
    descriptionKey: 'consent.analysisResults.description',
    icon: '📊',
  },
  {
    type: 'proposal_sharing',
    labelKey: 'consent.proposalSharing.label',
    descriptionKey: 'consent.proposalSharing.description',
    icon: '📋',
  },
]

export default function SettingsPage(): React.ReactElement {
  const t = useTranslations('settingsPage')
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const [contact, setContact] = useState<ContactData | null>(null)
  const [consents, setConsents] = useState<ConsentType[]>(
    CONSENT_DEFINITIONS.map((def) => ({
      id: def.type,
      type: def.type,
      label: def.labelKey,
      description: def.descriptionKey,
      granted: false,
      granted_at: null,
    }))
  )

  const fetchData = useCallback(async () => {
    try {
      const lineUserId = localStorage.getItem('line_user_id')
      if (!lineUserId) {
        router.push('/liff/login')
        return
      }

      const [contactResponse, consentResponse] = await Promise.all([
        fetch(`/api/liff/contact/${lineUserId}`),
        fetch(`/api/liff/consent/${lineUserId}`),
      ])

      if (contactResponse.ok) {
        const contactData: ContactData = await contactResponse.json()
        setContact(contactData)
      }

      if (consentResponse.ok) {
        const consentData = await consentResponse.json()
        const mergedConsents = CONSENT_DEFINITIONS.map((def) => {
          const existingConsent = consentData.consents?.find(
            (c: ConsentType) => c.type === def.type
          )
          return {
            id: def.type,
            type: def.type,
            label: def.labelKey,
            description: def.descriptionKey,
            granted: existingConsent?.granted ?? false,
            granted_at: existingConsent?.granted_at ?? null,
          }
        })
        setConsents(mergedConsents)
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Error fetching data:', err)
      setError(t('errors.loadError'))
    } finally {
      setIsLoading(false)
    }
  }, [router, t])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleConsentToggle = async (consentType: string, currentlyGranted: boolean) => {
    setIsUpdating(consentType)
    setError(null)
    setSuccessMessage(null)

    try {
      const lineUserId = localStorage.getItem('line_user_id')
      if (!lineUserId) {
        router.push('/liff/login')
        return
      }

      if (currentlyGranted) {
        const response = await fetch(`/api/liff/consent/${lineUserId}/${consentType}`, {
          method: 'DELETE',
        })

        if (!response.ok) {
          throw new Error(t('consent.errors.revoke'))
        }

        setConsents((prev) =>
          prev.map((c) => (c.type === consentType ? { ...c, granted: false, granted_at: null } : c))
        )
        setSuccessMessage(t('consent.success.revoked'))
      } else {
        const response = await fetch('/api/liff/consent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            line_user_id: lineUserId,
            consent_type: consentType,
            granted: true,
          }),
        })

        if (!response.ok) {
          throw new Error(t('consent.errors.grant'))
        }

        setConsents((prev) =>
          prev.map((c) =>
            c.type === consentType
              ? { ...c, granted: true, granted_at: new Date().toISOString() }
              : c
          )
        )
        setSuccessMessage(t('consent.success.granted'))
      }

      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errors.generalError'))
    } finally {
      setIsUpdating(null)
    }
  }

  const handleEditContact = () => {
    router.push('/liff/contact')
  }

  const handleDeleteData = async () => {
    const confirmed = window.confirm(t('dangerZone.deleteConfirm'))

    if (!confirmed) {
      return
    }

    try {
      const lineUserId = localStorage.getItem('line_user_id')
      if (!lineUserId) {
        return
      }

      setError(null)

      const response = await fetch(`/api/liff/contact/${lineUserId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error(t('errors.deleteError'))
      }

      localStorage.removeItem('line_user_id')
      router.push('/liff')
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errors.deleteError'))
    }
  }

  const getQualityBadge = (tier: string | null) => {
    if (!tier) {
      return null
    }

    const badges = {
      hot: { color: 'bg-red-100 text-red-700', label: 'Hot Lead' },
      warm: { color: 'bg-yellow-100 text-yellow-700', label: 'Warm Lead' },
      cold: { color: 'bg-blue-100 text-blue-700', label: 'Cold Lead' },
    }

    const badge = badges[tier as keyof typeof badges]
    if (!badge) {
      return null
    }

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        {badge.label}
      </span>
    )
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

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-green-600 text-white p-4 shadow-md">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">{t('title')}</h1>
          <button onClick={() => router.back()} className="text-white hover:text-green-200">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </header>

      <main className="p-4 max-w-lg mx-auto pb-24">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-600 text-sm">{successMessage}</p>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm p-6 mb-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('account.title')}</h2>

          {contact ? (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">{t('account.name')}</span>
                <span className="font-medium">{contact.display_name || '-'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">{t('account.phone')}</span>
                <span className="font-medium">{contact.phone || '-'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">{t('account.email')}</span>
                <span className="font-medium">{contact.email || '-'}</span>
              </div>
              {contact.quality_tier && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">{t('account.status')}</span>
                  {getQualityBadge(contact.quality_tier)}
                </div>
              )}
              <button
                onClick={handleEditContact}
                className="w-full mt-4 py-2 px-4 border border-green-600 text-green-600 font-medium rounded-lg hover:bg-green-50 transition-colors"
              >
                {t('account.edit')}
              </button>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-500 mb-4">{t('account.noContact')}</p>
              <button
                onClick={() => router.push('/liff/contact')}
                className="py-2 px-4 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
              >
                {t('account.addContact')}
              </button>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 mb-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('consent.title')}</h2>

          <div className="space-y-3">
            {consents.map((consent) => {
              const definition = CONSENT_DEFINITIONS.find((d) => d.type === consent.type)
              const isBeingUpdated = isUpdating === consent.type

              return (
                <div
                  key={consent.type}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{definition?.icon}</span>
                    <div>
                      <p className="font-medium text-gray-900">{t(consent.label)}</p>
                      <p className="text-xs text-gray-500">{t(consent.description)}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleConsentToggle(consent.type, consent.granted)}
                    disabled={isBeingUpdated}
                    className={`relative w-12 h-7 rounded-full transition-colors ${
                      consent.granted ? 'bg-green-500' : 'bg-gray-300'
                    } ${isBeingUpdated ? 'opacity-50' : ''}`}
                  >
                    <div
                      className={`absolute w-5 h-5 bg-white rounded-full shadow top-1 transition-transform ${
                        consent.granted ? 'translate-x-6 right-1' : 'left-1'
                      }`}
                    />
                  </button>
                </div>
              )
            })}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 mb-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('dataPrivacy.title')}</h2>

          <div className="space-y-3">
            <button
              onClick={() => router.push('/liff/history')}
              className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">📜</span>
                <span className="font-medium text-gray-900">{t('dataPrivacy.history')}</span>
              </div>
              <svg
                className="w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>

            <button
              onClick={() => router.push('/liff/proposal')}
              className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">📋</span>
                <span className="font-medium text-gray-900">{t('dataPrivacy.proposals')}</span>
              </div>
              <svg
                className="w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 mb-4">
          <h2 className="text-lg font-semibold text-red-600 mb-4">{t('dangerZone.title')}</h2>

          <button
            onClick={handleDeleteData}
            className="w-full py-3 px-4 border-2 border-red-500 text-red-500 font-medium rounded-lg hover:bg-red-50 transition-colors"
          >
            {t('dangerZone.deleteAll')}
          </button>
          <p className="mt-2 text-xs text-gray-500 text-center">{t('dangerZone.deleteNotice')}</p>
        </div>

        <div className="text-center text-xs text-gray-400 mt-8">
          <p>{t('version')}</p>
          <p className="mt-1">{t('contact')}</p>
        </div>
      </main>
    </div>
  )
}
