/**
 * Google Analytics 4 Component
 *
 * This component loads the gtag.js script and initializes GA4.
 * It should be included in the root layout.
 */

'use client'

import { useEffect } from 'react'
import Script from 'next/script'

export interface GoogleAnalyticsProps {
  measurementId?: string
}

export function GoogleAnalytics({ measurementId }: GoogleAnalyticsProps) {
  const gaMeasurementId = measurementId || process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID

  useEffect(() => {
    // Only initialize in production or if measurement ID is provided
    if (!gaMeasurementId) {
      return
    }

    // Set default consent to denied (PDPA-compliant)
    // This will be updated when user accepts cookies
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('consent', 'default', {
        analytics_storage: 'denied',
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied',
      })
    }
  }, [gaMeasurementId])

  if (!gaMeasurementId) {
    return null
  }

  return (
    <>
      {/* Load gtag.js */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`}
        strategy="afterInteractive"
        onLoad={() => {
          // Initialize GA4 with default config
          if (typeof window !== 'undefined' && window.gtag) {
            window.gtag('js', new Date())
            window.gtag('config', gaMeasurementId, {
              send_page_view: false, // We'll handle page views manually
              cookie_flags: 'SameSite=Lax;Secure',
              cookie_domain: 'auto',
            })
          }
        }}
      />
    </>
  )
}

// Export as default for convenience
export default GoogleAnalytics
