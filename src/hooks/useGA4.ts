/**
 * React Hook for GA4 Analytics Tracking
 *
 * This hook provides a convenient interface for tracking events
 * with automatic consent checking and user context.
 */

'use client'

import { useEffect, useCallback, useRef } from 'react'
import {
  initGA4,
  updateGA4Consent,
  trackPageView,
  trackSignUp,
  trackTrialStart,
  trackOnboardingComplete,
  trackFirstAnalysis,
  trackFirstProposal,
  trackUpgradeClick,
  trackPurchase,
  trackLineConnect,
  trackEvent,
  trackFeatureUsage,
  trackSearch,
  trackContentEngagement,
  trackBeginCheckout,
  trackAddPaymentInfo,
  setUserId,
  setUserProperties,
  getUTMParams,
  storeUTMParams,
  getStoredUTMParams,
  getMarketingAttribution,
  isGA4Available,
  hasAnalyticsConsent,
  getMeasurementId,
  type GA4EventParams,
  type GA4Item,
} from '@/lib/ga4'

export interface UseGA4Options {
  autoTrackPageViews?: boolean
  userId?: string
  userProperties?: Record<string, string | number | boolean>
}

export function useGA4(options: UseGA4Options = {}) {
  const { autoTrackPageViews = true, userId, userProperties } = options

  const initializedRef = useRef(false)
  const currentPageRef = useRef('')

  // Initialize GA4 on mount
  useEffect(() => {
    if (initializedRef.current) {
      return
    }

    const measurementId = getMeasurementId()
    if (!measurementId) {
      console.warn('GA4 measurement ID not configured')
      return
    }

    initGA4({ measurementId })
    initializedRef.current = true

    // Store UTM parameters on first load
    storeUTMParams()

    // Set user ID if provided
    if (userId) {
      setUserId(userId)
    }

    // Set user properties if provided
    if (userProperties) {
      setUserProperties(userProperties)
    }
  }, [userId, userProperties])

  // Auto-track page views
  useEffect(() => {
    if (!autoTrackPageViews) {
      return
    }

    const trackCurrentPage = () => {
      const currentPath = window.location.pathname
      if (currentPath !== currentPageRef.current) {
        trackPageView(currentPath)
        currentPageRef.current = currentPath
      }
    }

    // Track initial page view
    trackCurrentPage()

    // Listen for route changes (for SPA navigation)
    const handleRouteChange = () => {
      trackCurrentPage()
    }

    // Use popstate event for browser back/forward
    window.addEventListener('popstate', handleRouteChange)

    return () => {
      window.removeEventListener('popstate', handleRouteChange)
    }
  }, [autoTrackPageViews])

  // Update consent
  const updateConsent = useCallback((consent: { analytics: boolean; marketing: boolean }) => {
    updateGA4Consent(consent)
  }, [])

  // Track custom event
  const track = useCallback((eventName: string, params?: GA4EventParams) => {
    if (!hasAnalyticsConsent()) {
      return
    }
    trackEvent(eventName, params)
  }, [])

  // Track sign up
  const trackSignUpEvent = useCallback((params?: { method?: string; plan?: string }) => {
    if (!hasAnalyticsConsent()) {
      return
    }
    trackSignUp(params)
  }, [])

  // Track trial start
  const trackTrialStartEvent = useCallback(
    (params?: { plan_id?: string; plan_name?: string; trial_days?: number }) => {
      if (!hasAnalyticsConsent()) {
        return
      }
      trackTrialStart(params)
    },
    []
  )

  // Track onboarding complete
  const trackOnboardingCompleteEvent = useCallback(
    (params?: { steps_completed?: number; total_steps?: number; duration_seconds?: number }) => {
      if (!hasAnalyticsConsent()) {
        return
      }
      trackOnboardingComplete(params)
    },
    []
  )

  // Track first analysis
  const trackFirstAnalysisEvent = useCallback(
    (params?: { system_size_kw?: number; estimated_savings?: number; location?: string }) => {
      if (!hasAnalyticsConsent()) {
        return
      }
      trackFirstAnalysis(params)
    },
    []
  )

  // Track first proposal
  const trackFirstProposalEvent = useCallback(
    (params?: {
      proposal_id?: string
      system_size_kw?: number
      estimated_cost?: number
      format?: 'pdf' | 'email'
    }) => {
      if (!hasAnalyticsConsent()) {
        return
      }
      trackFirstProposal(params)
    },
    []
  )

  // Track upgrade click
  const trackUpgradeClickEvent = useCallback(
    (params?: { current_plan?: string; target_plan?: string; feature?: string }) => {
      if (!hasAnalyticsConsent()) {
        return
      }
      trackUpgradeClick(params)
    },
    []
  )

  // Track purchase
  const trackPurchaseEvent = useCallback(
    (params: {
      transaction_id: string
      value: number
      currency?: string
      items?: GA4Item[]
      coupon?: string
      plan_id?: string
      plan_name?: string
      plan_type?: 'monthly' | 'annual'
    }) => {
      if (!hasAnalyticsConsent()) {
        return
      }
      trackPurchase(params)
    },
    []
  )

  // Track LINE connect
  const trackLineConnectEvent = useCallback(
    (params?: { line_user_id?: string; liff_id?: string }) => {
      if (!hasAnalyticsConsent()) {
        return
      }
      trackLineConnect(params)
    },
    []
  )

  // Track feature usage
  const trackFeatureUsageEvent = useCallback(
    (params: {
      feature_name: string
      feature_category?: string
      action?: string
      value?: number
    }) => {
      if (!hasAnalyticsConsent()) {
        return
      }
      trackFeatureUsage(params)
    },
    []
  )

  // Track search
  const trackSearchEvent = useCallback(
    (params: { search_term: string; results_count?: number; category?: string }) => {
      if (!hasAnalyticsConsent()) {
        return
      }
      trackSearch(params)
    },
    []
  )

  // Track content engagement
  const trackContentEngagementEvent = useCallback(
    (params: {
      content_type: string
      content_id?: string
      content_name?: string
      duration_seconds?: number
    }) => {
      if (!hasAnalyticsConsent()) {
        return
      }
      trackContentEngagement(params)
    },
    []
  )

  // Track begin checkout
  const trackBeginCheckoutEvent = useCallback(
    (params?: { value?: number; currency?: string; items?: GA4Item[]; coupon?: string }) => {
      if (!hasAnalyticsConsent()) {
        return
      }
      trackBeginCheckout(params)
    },
    []
  )

  // Track add payment info
  const trackAddPaymentInfoEvent = useCallback(
    (params?: { value?: number; currency?: string; payment_type?: string; items?: GA4Item[] }) => {
      if (!hasAnalyticsConsent()) {
        return
      }
      trackAddPaymentInfo(params)
    },
    []
  )

  return {
    // State
    isAvailable: isGA4Available(),
    hasConsent: hasAnalyticsConsent(),
    measurementId: getMeasurementId(),
    utmParams: getUTMParams(),
    storedUTMParams: getStoredUTMParams(),
    marketingAttribution: getMarketingAttribution(),

    // Core methods
    updateConsent,
    track,

    // Conversion events
    trackSignUp: trackSignUpEvent,
    trackTrialStart: trackTrialStartEvent,
    trackOnboardingComplete: trackOnboardingCompleteEvent,
    trackFirstAnalysis: trackFirstAnalysisEvent,
    trackFirstProposal: trackFirstProposalEvent,
    trackUpgradeClick: trackUpgradeClickEvent,
    trackPurchase: trackPurchaseEvent,
    trackLineConnect: trackLineConnectEvent,

    // Feature tracking
    trackFeatureUsage: trackFeatureUsageEvent,
    trackSearch: trackSearchEvent,
    trackContentEngagement: trackContentEngagementEvent,

    // E-commerce events
    trackBeginCheckout: trackBeginCheckoutEvent,
    trackAddPaymentInfo: trackAddPaymentInfoEvent,

    // User methods
    setUserId,
    setUserProperties,
  }
}
