'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { X, Cookie } from 'lucide-react'
import { updateGA4Consent } from '@/lib/ga4'

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
    name: 'คุกกี้ที่จำเป็น',
    description: 'คุกกี้ที่จำเป็นสำหรับการทำงานของเว็บไซต์ เช่น การยืนยันตัวตน และความปลอดภัย',
    required: true,
  },
  {
    key: 'analytics',
    name: 'คุกกี้วิเคราะห์',
    description: 'คุกกี้ที่ใช้เก็บข้อมูลการใช้งานเพื่อปรับปรุงประสบการณ์ผู้ใช้',
    required: false,
  },
  {
    key: 'marketing',
    name: 'คุกกี้การตลาด',
    description: 'คุกกี้ที่ใช้สำหรับการโฆษณาและการตลาด',
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
      necessary: preferences.necessary,
      analytics: preferences.analytics,
      marketing: preferences.marketing,
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
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 shadow-lg">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Simple View */}
        {!showDetails ? (
          <div className="py-6 sm:py-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-4 flex-1">
                <div className="flex-shrink-0">
                  <Cookie className="h-8 w-8 text-primary-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    การใช้คุกกี้
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    เราใช้คุกกี้เพื่อปรับปรุงประสบการณ์การใช้งานของคุณ
                    คุณสามารถจัดการความยินยอมของคุณได้ตลอดเวลา
                  </p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
                <button
                  onClick={handleManageSettings}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                >
                  จัดการการตั้งค่า
                </button>
                <button
                  onClick={handleRejectAll}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  ปฏิเสธทั้งหมด
                </button>
                <button
                  onClick={handleAcceptAll}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
                >
                  ยอมรับทั้งหมด
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
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    จัดการความยินยอมคุกกี้
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    คุณสามารถเลือกความยินยอมสำหรับแต่ละหมวดหมู่คุกกี้ได้
                  </p>
                  <Link
                    href="/privacy"
                    className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
                  >
                    อ่านนโยบายความเป็นส่วนตัว
                  </Link>
                </div>
              </div>
              <button
                onClick={() => setIsVisible(false)}
                className="flex-shrink-0 p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
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
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {category.name}
                        </h4>
                        {category.required && (
                          <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded">
                            จำเป็น
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {category.description}
                      </p>
                    </div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={preferences[category.key]}
                        onChange={(e) => handleToggle(category.key, e.target.checked)}
                        disabled={category.required}
                        className="h-5 w-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
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
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                ปฏิเสธทั้งหมด
              </button>
              <button
                onClick={handleAcceptAll}
                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
              >
                ยอมรับทั้งหมด
              </button>
              <button
                onClick={handleAcceptSelected}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
              >
                ยอมรับที่เลือก
              </button>
            </div>
          </div>
        )}
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
