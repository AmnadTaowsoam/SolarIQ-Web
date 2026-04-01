'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { X, Cookie } from 'lucide-react'
import { updateGA4Consent } from '@/lib/ga4'
import { useTranslations } from 'next-intl'

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */
export interface CookieConsent {
  necessary: boolean
  analytics: boolean
  marketing: boolean
  timestamp: number
}

export interface CookiePreferences {
  consent: CookieConsent
  version: string
}

/* ------------------------------------------------------------------ */
/*  Constants                                                           */
/* ------------------------------------------------------------------ */
const COOKIE_CONSENT_KEY = 'solariq_cookie_consent'
const CONSENT_VERSION = '1.0.0'

const COOKIE_CATEGORIES = [
  {
    key: 'necessary',
    nameKey: 'necessary',
    descriptionKey: 'necessaryDesc',
    required: true,
  },
  {
    key: 'analytics',
    nameKey: 'analytics',
    descriptionKey: 'analyticsDesc',
    required: false,
  },
  {
    key: 'marketing',
    nameKey: 'marketing',
    descriptionKey: 'marketingDesc',
    required: false,
  },
]

/* ------------------------------------------------------------------ */
/*  Helper Functions                                                   */
/* ------------------------------------------------------------------ */
function getCookieConsent(): CookiePreferences | null {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    const stored = localStorage.getItem(COOKIE_CONSENT_KEY)
    if (!stored) {
      return null
    }

    const parsed = JSON.parse(stored) as CookiePreferences
    // Check if version matches
    if (parsed.version !== CONSENT_VERSION) {
      return null
    }
    return parsed
  } catch {
    return null
  }
}

function setCookieConsent(consent: CookieConsent): void {
  if (typeof window === 'undefined') {
    return
  }

  const preferences: CookiePreferences = {
    consent,
    version: CONSENT_VERSION,
  }

  localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(preferences))

  // Dispatch event for other components to listen
  window.dispatchEvent(new CustomEvent('cookieConsentChanged', { detail: consent }))
}

function applyConsent(consent: CookieConsent): void {
  // Update GA4 consent
  try {
    updateGA4Consent({
      analytics: consent.analytics,
      marketing: consent.marketing,
    })
  } catch {
    // Silently fail if GA4 is not available
  }

  // Store consent in a cookie for server-side access
  if (typeof document !== 'undefined') {
    const consentString = JSON.stringify(consent)
    document.cookie = `cookie_consent=${encodeURIComponent(
      consentString
    )}; path=/; max-age=31536000; SameSite=Lax`
  }
}

/* ------------------------------------------------------------------ */
/*  Component                                                           */
/* ------------------------------------------------------------------ */
interface CookieConsentBannerProps {
  onConsentChange?: (consent: CookieConsent) => void
}

export function CookieConsentBanner({ onConsentChange }: CookieConsentBannerProps) {
  const t = useTranslations('cookieConsent')
  const [isVisible, setIsVisible] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [preferences, setPreferences] = useState<Record<string, boolean>>({
    necessary: true,
    analytics: false,
    marketing: false,
  })

  // Check if user has already consented
  useEffect(() => {
    const existingConsent = getCookieConsent()
    if (!existingConsent) {
      setIsVisible(true)
    } else {
      // Apply existing consent
      applyConsent(existingConsent.consent)
    }
  }, [])

  // Listen for consent changes from other components
  useEffect(() => {
    const handleConsentChange = (event: CustomEvent<CookieConsent>) => {
      onConsentChange?.(event.detail)
    }

    window.addEventListener('cookieConsentChanged', handleConsentChange as EventListener)

    return () => {
      window.removeEventListener('cookieConsentChanged', handleConsentChange as EventListener)
    }
  }, [onConsentChange])

  const handleAcceptAll = () => {
    const newConsent: CookieConsent = {
      necessary: true,
      analytics: true,
      marketing: true,
      timestamp: Date.now(),
    }
    setCookieConsent(newConsent)
    applyConsent(newConsent)
    setIsVisible(false)
    onConsentChange?.(newConsent)
  }

  const handleAcceptSelected = () => {
    const newConsent: CookieConsent = {
      necessary: preferences.necessary ?? false,
      analytics: preferences.analytics ?? false,
      marketing: preferences.marketing ?? false,
      timestamp: Date.now(),
    }
    setCookieConsent(newConsent)
    applyConsent(newConsent)
    setIsVisible(false)
    onConsentChange?.(newConsent)
  }

  const handleRejectAll = () => {
    const newConsent: CookieConsent = {
      necessary: true,
      analytics: false,
      marketing: false,
      timestamp: Date.now(),
    }
    setCookieConsent(newConsent)
    applyConsent(newConsent)
    setIsVisible(false)
    onConsentChange?.(newConsent)
  }

  const handleToggle = (key: string, value: boolean) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const handleManageSettings = () => {
    setShowDetails(!showDetails)
  }

  if (!isVisible) {
    return null
  }

  return (
    <div className="fixed inset-x-4 bottom-4 z-50 sm:left-auto sm:right-4 sm:w-full sm:max-w-xl">
      <div className="max-h-[calc(100vh-2rem)] overflow-y-auto rounded-2xl border border-[var(--brand-border)] bg-[var(--brand-surface)] shadow-2xl dark:border-gray-700 dark:bg-gray-900">
        <div className="px-4 sm:px-6">
          {/* Simple View */}
          {!showDetails ? (
            <div className="py-6 sm:py-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className="flex-shrink-0">
                    <Cookie className="h-8 w-8 text-primary-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-[var(--brand-text)] dark:text-white mb-2">
                      {t('title')}
                    </h3>
                    <p className="text-sm text-[var(--brand-text-secondary)] dark:text-[var(--brand-text-secondary)]">
                      {t('description')}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
                  <button
                    onClick={handleManageSettings}
                    className="px-4 py-2 text-sm font-medium text-[var(--brand-text)] dark:text-[var(--brand-text-secondary)] hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                  >
                    {t('customize')}
                  </button>
                  <button
                    onClick={handleRejectAll}
                    className="px-4 py-2 text-sm font-medium text-[var(--brand-text)] dark:text-[var(--brand-text-secondary)] border border-[var(--brand-border)] dark:border-gray-600 rounded-lg hover:bg-[var(--brand-background)] dark:hover:bg-gray-800 transition-colors"
                  >
                    {t('rejectAll')}
                  </button>
                  <button
                    onClick={handleAcceptAll}
                    className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    {t('acceptAll')}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Detailed View */
            <div className="py-6 sm:py-8">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-start gap-4 flex-1">
                  <div className="flex-shrink-0">
                    <Cookie className="h-8 w-8 text-primary-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-[var(--brand-text)] dark:text-white mb-2">
                      {t('title')}
                    </h3>
                    <p className="text-sm text-[var(--brand-text-secondary)] dark:text-[var(--brand-text-secondary)] mb-4">
                      {t('description')}
                    </p>
                    <Link
                      href="/privacy"
                      className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
                    >
                      {t('privacyPolicy')}
                    </Link>
                  </div>
                </div>
                <button
                  onClick={() => setIsVisible(false)}
                  className="flex-shrink-0 p-2 text-[var(--brand-text-secondary)] hover:text-[var(--brand-text)] dark:text-[var(--brand-text-secondary)] dark:hover:text-gray-200 transition-colors"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Cookie Categories */}
              <div className="space-y-4 mb-6">
                {COOKIE_CATEGORIES.map((category) => (
                  <div
                    key={category.key}
                    className="border border-[var(--brand-border)] dark:border-gray-700 rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-[var(--brand-text)] dark:text-white">
                            {t(category.nameKey)}
                          </h4>
                          {category.required && (
                            <span className="text-xs bg-[var(--brand-background)] dark:bg-gray-800 text-[var(--brand-text-secondary)] dark:text-[var(--brand-text-secondary)] px-2 py-0.5 rounded">
                              {t('necessary')}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-[var(--brand-text-secondary)] dark:text-[var(--brand-text-secondary)]">
                          {t(category.descriptionKey)}
                        </p>
                      </div>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={preferences[category.key] ?? false}
                          onChange={(e) => handleToggle(category.key, e.target.checked)}
                          disabled={category.required}
                          className="h-5 w-5 rounded border-[var(--brand-border)] text-primary-600 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                      </label>
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-end">
                <button
                  onClick={handleRejectAll}
                  className="px-4 py-2 text-sm font-medium text-[var(--brand-text)] dark:text-[var(--brand-text-secondary)] border border-[var(--brand-border)] dark:border-gray-600 rounded-lg hover:bg-[var(--brand-background)] dark:hover:bg-gray-800 transition-colors"
                >
                  {t('rejectAll')}
                </button>
                <button
                  onClick={handleAcceptAll}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
                >
                  {t('acceptAll')}
                </button>
                <button
                  onClick={handleAcceptSelected}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                >
                  {t('save')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Export Helpers                                                     */
/* ------------------------------------------------------------------ */
export function getCookieConsentSync(): CookieConsent | null {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    const stored = localStorage.getItem(COOKIE_CONSENT_KEY)
    if (!stored) {
      return null
    }

    const parsed = JSON.parse(stored) as CookiePreferences
    if (parsed.version !== CONSENT_VERSION) {
      return null
    }
    return parsed.consent
  } catch {
    return null
  }
}

export function updateCookieConsent(consent: CookieConsent): void {
  setCookieConsent(consent)
  applyConsent(consent)
}

export function resetCookieConsent(): void {
  if (typeof window === 'undefined') {
    return
  }

  localStorage.removeItem(COOKIE_CONSENT_KEY)
  document.cookie = 'cookie_consent=; path=/; max-age=0; SameSite=Lax'

  window.dispatchEvent(new CustomEvent('cookieConsentChanged', { detail: null }))
}
