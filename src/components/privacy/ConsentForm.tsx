'use client'

import React, { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { usePrivacy } from '@/hooks/usePrivacy'
import { ConsentType, REQUIRED_CONSENTS, CONSENT_DESCRIPTIONS } from '@/types/privacy'

interface ConsentFormProps {
  onComplete?: () => void
  showRequiredOnly?: boolean
}

export function ConsentForm({ onComplete, showRequiredOnly = false }: ConsentFormProps) {
  const t = useTranslations('consentForm')
  const { consentTypes, fetchConsentTypes, grantConsents, isLoadingConsent, consentError } =
    usePrivacy()
  const [consentValues, setConsentValues] = useState<Record<string, boolean>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchConsentTypes()
  }, [fetchConsentTypes])

  useEffect(() => {
    if (consentTypes) {
      const initialValues: Record<string, boolean> = {}
      ;[...consentTypes.required, ...consentTypes.optional].forEach((ct) => {
        initialValues[ct.type] = false
      })
      setConsentValues(initialValues)
    }
  }, [consentTypes])

  const handleToggle = (type: string, isRequired: boolean) => {
    if (isRequired && showRequiredOnly) {
      // Required consents must be accepted in required-only mode
      return
    }
    setConsentValues((prev) => ({
      ...prev,
      [type]: !prev[type],
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const consents = Object.entries(consentValues).map(([type, granted]) => ({
        consent_type: type as ConsentType,
        granted,
      }))

      await grantConsents({
        consents,
      })

      onComplete?.()
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to submit consents:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const allRequiredAccepted = REQUIRED_CONSENTS.every((ct) => consentValues[ct] === true)

  if (!consentTypes) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {consentError && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-700">
          {consentError}
        </div>
      )}

      {/* Required Consents */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-[var(--brand-text)]">{t('necessary')}</h3>
        <p className="text-sm text-[var(--brand-text-secondary)]">{t('necessaryDesc')}</p>
        {consentTypes.required.map((ct) => (
          <Card key={ct.type} className="p-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={consentValues[ct.type] || false}
                onChange={() => handleToggle(ct.type, true)}
                className="mt-1 h-5 w-5 rounded border-[var(--brand-border)] text-blue-600 focus:ring-blue-500"
                required
              />
              <div className="flex-1">
                <p className="font-medium text-[var(--brand-text)]">
                  {CONSENT_DESCRIPTIONS[ct.type] || ct.description}
                </p>
                <p className="text-sm text-[var(--brand-text-secondary)] mt-1">{t('accept')}</p>
              </div>
            </label>
          </Card>
        ))}
      </div>

      {/* Optional Consents */}
      {!showRequiredOnly && consentTypes.optional.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-[var(--brand-text)]">{t('analytics')}</h3>
          <p className="text-sm text-[var(--brand-text-secondary)]">{t('analyticsDesc')}</p>
          {consentTypes.optional.map((ct) => (
            <Card key={ct.type} className="p-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consentValues[ct.type] || false}
                  onChange={() => handleToggle(ct.type, false)}
                  className="mt-1 h-5 w-5 rounded border-[var(--brand-border)] text-blue-600 focus:ring-blue-500"
                />
                <div className="flex-1">
                  <p className="font-medium text-[var(--brand-text)]">
                    {CONSENT_DESCRIPTIONS[ct.type] || ct.description}
                  </p>
                  <p className="text-sm text-[var(--brand-text-secondary)] mt-1">{t('save')}</p>
                </div>
              </label>
            </Card>
          ))}
        </div>
      )}

      {/* Submit Button */}
      <div className="pt-4">
        <Button
          type="submit"
          variant="primary"
          disabled={!allRequiredAccepted || isSubmitting || isLoadingConsent}
          className="w-full py-3"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              {t('save')}
            </span>
          ) : (
            t('acceptAll')
          )}
        </Button>

        {!allRequiredAccepted && (
          <p className="text-sm text-red-600 text-center mt-2">{t('subtitle')}</p>
        )}
      </div>

      {/* Privacy Policy Link */}
      <div className="text-center text-sm text-[var(--brand-text-secondary)]">
        <p>
          {t('title')}{' '}
          <a href="/privacy" className="text-blue-600 hover:underline">
            {t('thirdParty')}
          </a>
        </p>
      </div>
    </form>
  )
}

export default ConsentForm
