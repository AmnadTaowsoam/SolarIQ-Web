/**
 * Google Analytics 4 Tracking Library
 *
 * This library provides a type-safe interface for GA4 tracking
 * with PDPA-compliant cookie consent integration.
 *
 * Reference: https://developers.google.com/analytics/devguides/collection/gtagjs
 */

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */

export interface GA4Config {
  measurementId: string
  consent?: {
    analyticsStorage?: 'granted' | 'denied'
    adStorage?: 'granted' | 'denied'
    adUserData?: 'granted' | 'denied'
    adPersonalization?: 'granted' | 'denied'
  }
}

export interface GA4EventParams {
  [key: string]: string | number | boolean | undefined
}

export interface GA4Item {
  item_id?: string
  item_name?: string
  affiliation?: string
  coupon?: string
  currency?: string
  discount?: number
  index?: number
  item_brand?: string
  item_category?: string
  item_category2?: string
  item_category3?: string
  item_category4?: string
  item_category5?: string
  item_list_id?: string
  item_list_name?: string
  item_variant?: string
  location_id?: string
  price?: number
  quantity?: number
}

/* ------------------------------------------------------------------ */
/*  Constants                                                           */
/* ------------------------------------------------------------------ */

export const GA4_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID || ''

export const GA4_EVENTS = {
  // User Acquisition Events
  SIGN_UP: 'sign_up',
  TRIAL_START: 'trial_start',

  // Engagement Events
  ONBOARDING_COMPLETE: 'onboarding_complete',
  FIRST_ANALYSIS: 'first_analysis',
  FIRST_PROPOSAL: 'first_proposal',

  // Conversion Events
  UPGRADE_CLICK: 'upgrade_click',
  PURCHASE: 'purchase',

  // LINE Integration Events
  LINE_CONNECT: 'line_connect',

  // Standard GA4 Events
  PAGE_VIEW: 'page_view',
  SEARCH: 'search',
  BEGIN_CHECKOUT: 'begin_checkout',
  ADD_PAYMENT_INFO: 'add_payment_info',
} as const

export const GA4_EVENT_PARAMETERS = {
  // User Parameters
  USER_ID: 'user_id',
  SESSION_ID: 'session_id',

  // E-commerce Parameters
  CURRENCY: 'currency',
  VALUE: 'value',
  TRANSACTION_ID: 'transaction_id',
  AFFILIATION: 'affiliation',
  COUPON: 'coupon',
  SHIPPING: 'shipping',
  TAX: 'tax',
  ITEMS: 'items',

  // Engagement Parameters
  CONTENT_TYPE: 'content_type',
  CONTENT_ID: 'content_id',
  CONTENT_NAME: 'content_name',
  CONTENT_LIST_ID: 'content_list_id',
  CONTENT_LIST_NAME: 'content_list_name',

  // Custom Parameters
  PLAN_ID: 'plan_id',
  PLAN_NAME: 'plan_name',
  PLAN_TYPE: 'plan_type', // 'monthly' | 'annual'
  TRIAL_DAYS: 'trial_days',
  SOURCE: 'source',
  MEDIUM: 'medium',
  CAMPAIGN: 'campaign',
  UTM_SOURCE: 'utm_source',
  UTM_MEDIUM: 'utm_medium',
  UTM_CAMPAIGN: 'utm_campaign',
  UTM_TERM: 'utm_term',
  UTM_CONTENT: 'utm_content',

  // Feature Parameters
  FEATURE_NAME: 'feature_name',
  FEATURE_CATEGORY: 'feature_category',

  // LINE Parameters
  LINE_USER_ID: 'line_user_id',
  LINE_LIFF_ID: 'line_liff_id',
} as const

/* ------------------------------------------------------------------ */
/*  gtag.js Declaration                                                 */
/* ------------------------------------------------------------------ */

declare global {
  interface Window {
    gtag?: (
      command: 'config' | 'event' | 'consent' | 'set' | 'js',
      targetId: string | Date,
      configOrEventName?: GA4Config | string | GA4EventParams,
      eventParams?: GA4EventParams
    ) => void
    dataLayer?: unknown[]
  }
}

/* ------------------------------------------------------------------ */
/*  Core Functions                                                      */
/* ------------------------------------------------------------------ */

/**
 * Initialize GA4 with default consent settings
 * This should be called once on page load
 */
export function initGA4(config: GA4Config): void {
  if (typeof window === 'undefined' || !window.gtag) {
    return
  }

  // Set default consent to denied (PDPA-compliant)
  window.gtag('consent', 'default', {
    analytics_storage: 'denied',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
  })

  // Configure GA4
  window.gtag('config', config.measurementId, {
    ...config.consent,
    send_page_view: false, // We'll handle page views manually
    cookie_flags: 'SameSite=Lax;Secure',
    cookie_domain: 'auto',
  })
}

/**
 * Update GA4 consent based on user preferences
 * This should be called when user accepts/rejects cookies
 */
export function updateGA4Consent(consent: { analytics: boolean; marketing: boolean }): void {
  if (typeof window === 'undefined' || !window.gtag) {
    return
  }

  window.gtag('consent', 'update', {
    analytics_storage: consent.analytics ? 'granted' : 'denied',
    ad_storage: consent.marketing ? 'granted' : 'denied',
    ad_user_data: consent.marketing ? 'granted' : 'denied',
    ad_personalization: consent.marketing ? 'granted' : 'denied',
  })
}

/**
 * Track a custom event
 */
export function trackEvent(eventName: string, params?: GA4EventParams): void {
  if (typeof window === 'undefined' || !window.gtag) {
    return
  }

  window.gtag('event', eventName, params)
}

/**
 * Track page view
 */
export function trackPageView(pagePath: string, pageTitle?: string): void {
  if (typeof window === 'undefined' || !window.gtag) {
    return
  }

  window.gtag('event', GA4_EVENTS.PAGE_VIEW, {
    page_path: pagePath,
    page_title: pageTitle || document.title,
    page_location: window.location.href,
  })
}

/**
 * Set user ID for cross-session tracking
 */
export function setUserId(userId: string): void {
  if (typeof window === 'undefined' || !window.gtag) {
    return
  }

  window.gtag('set', GA4_EVENT_PARAMETERS.USER_ID, userId)
}

/**
 * Set custom user properties
 */
export function setUserProperties(properties: Record<string, string | number | boolean>): void {
  if (typeof window === 'undefined' || !window.gtag) {
    return
  }

  window.gtag('set', 'user_properties', properties)
}

/* ------------------------------------------------------------------ */
/*  Conversion Events                                                   */
/* ------------------------------------------------------------------ */

/**
 * Track sign up event
 */
export function trackSignUp(params?: { method?: string; plan?: string }): void {
  trackEvent(GA4_EVENTS.SIGN_UP, {
    method: params?.method || 'email',
    ...params,
  })
}

/**
 * Track trial start event
 */
export function trackTrialStart(params?: {
  plan_id?: string
  plan_name?: string
  trial_days?: number
}): void {
  trackEvent(GA4_EVENTS.TRIAL_START, {
    trial_days: params?.trial_days || 14,
    ...params,
  })
}

/**
 * Track onboarding complete event
 */
export function trackOnboardingComplete(params?: {
  steps_completed?: number
  total_steps?: number
  duration_seconds?: number
}): void {
  trackEvent(GA4_EVENTS.ONBOARDING_COMPLETE, params)
}

/**
 * Track first analysis event
 */
export function trackFirstAnalysis(params?: {
  system_size_kw?: number
  estimated_savings?: number
  location?: string
}): void {
  trackEvent(GA4_EVENTS.FIRST_ANALYSIS, params)
}

/**
 * Track first proposal event
 */
export function trackFirstProposal(params?: {
  proposal_id?: string
  system_size_kw?: number
  estimated_cost?: number
  format?: 'pdf' | 'email'
}): void {
  trackEvent(GA4_EVENTS.FIRST_PROPOSAL, params)
}

/**
 * Track upgrade click event
 */
export function trackUpgradeClick(params?: {
  current_plan?: string
  target_plan?: string
  feature?: string
}): void {
  trackEvent(GA4_EVENTS.UPGRADE_CLICK, params)
}

/**
 * Track purchase event
 */
export function trackPurchase(params: {
  transaction_id: string
  value: number
  currency?: string
  items?: GA4Item[]
  coupon?: string
  plan_id?: string
  plan_name?: string
  plan_type?: 'monthly' | 'annual'
}): void {
  trackEvent(GA4_EVENTS.PURCHASE, {
    currency: params.currency || 'THB',
    value: params.value,
    transaction_id: params.transaction_id,
    items: params.items,
    coupon: params.coupon,
    plan_id: params.plan_id,
    plan_name: params.plan_name,
    plan_type: params.plan_type,
  })
}

/**
 * Track LINE connect event
 */
export function trackLineConnect(params?: { line_user_id?: string; liff_id?: string }): void {
  trackEvent(GA4_EVENTS.LINE_CONNECT, params)
}

/* ------------------------------------------------------------------ */
/*  UTM Parameter Tracking                                              */
/* ------------------------------------------------------------------ */

/**
 * Extract UTM parameters from URL
 */
export function getUTMParams(): Record<string, string> {
  if (typeof window === 'undefined') {
    return {}
  }

  const urlParams = new URLSearchParams(window.location.search)

  return {
    utm_source: urlParams.get('utm_source') || '',
    utm_medium: urlParams.get('utm_medium') || '',
    utm_campaign: urlParams.get('utm_campaign') || '',
    utm_term: urlParams.get('utm_term') || '',
    utm_content: urlParams.get('utm_content') || '',
  }
}

/**
 * Store UTM parameters in session storage for cross-page tracking
 */
export function storeUTMParams(): void {
  if (typeof window === 'undefined') {
    return
  }

  const utmParams = getUTMParams()
  const hasParams = Object.values(utmParams).some((value) => value !== '')

  if (hasParams) {
    sessionStorage.setItem('solariq_utm_params', JSON.stringify(utmParams))
  }
}

/**
 * Retrieve stored UTM parameters
 */
export function getStoredUTMParams(): Record<string, string> {
  if (typeof window === 'undefined') {
    return {}
  }

  try {
    const stored = sessionStorage.getItem('solariq_utm_params')
    if (stored) {
      return JSON.parse(stored)
    }
  } catch {
    // Ignore parsing errors
  }

  return {}
}

/**
 * Clear stored UTM parameters
 */
export function clearUTMParams(): void {
  if (typeof window === 'undefined') {
    return
  }

  sessionStorage.removeItem('solariq_utm_params')
}

/**
 * Get marketing attribution data (UTM + referrer)
 */
export function getMarketingAttribution(): {
  source: string
  medium: string
  campaign: string
  term: string
  content: string
  referrer: string
} {
  if (typeof window === 'undefined') {
    return {
      source: '',
      medium: '',
      campaign: '',
      term: '',
      content: '',
      referrer: '',
    }
  }

  const utmParams = getStoredUTMParams()
  const referrer = document.referrer || ''

  // Parse referrer for source/medium
  let source = utmParams.utm_source
  let medium = utmParams.utm_medium

  if (!source && referrer) {
    try {
      const referrerUrl = new URL(referrer)
      source = referrerUrl.hostname
      medium = 'referral'
    } catch {
      source = referrer
      medium = 'referral'
    }
  }

  if (!source) {
    source = 'direct'
  }

  if (!medium) {
    medium = 'none'
  }

  return {
    source,
    medium,
    campaign: utmParams.utm_campaign,
    term: utmParams.utm_term,
    content: utmParams.utm_content,
    referrer,
  }
}

/* ------------------------------------------------------------------ */
/*  Feature Usage Tracking                                              */
/* ------------------------------------------------------------------ */

/**
 * Track feature usage
 */
export function trackFeatureUsage(params: {
  feature_name: string
  feature_category?: string
  action?: string
  value?: number
}): void {
  trackEvent('feature_usage', params)
}

/**
 * Track search
 */
export function trackSearch(params: {
  search_term: string
  results_count?: number
  category?: string
}): void {
  trackEvent(GA4_EVENTS.SEARCH, params)
}

/**
 * Track content engagement
 */
export function trackContentEngagement(params: {
  content_type: string
  content_id?: string
  content_name?: string
  duration_seconds?: number
}): void {
  trackEvent('content_engagement', params)
}

/* ------------------------------------------------------------------ */
/*  E-commerce Events                                                   */
/* ------------------------------------------------------------------ */

/**
 * Track begin checkout
 */
export function trackBeginCheckout(params: {
  value?: number
  currency?: string
  items?: GA4Item[]
  coupon?: string
}): void {
  trackEvent(GA4_EVENTS.BEGIN_CHECKOUT, {
    currency: params.currency || 'THB',
    ...params,
  })
}

/**
 * Track add payment info
 */
export function trackAddPaymentInfo(params: {
  value?: number
  currency?: string
  payment_type?: string
  items?: GA4Item[]
}): void {
  trackEvent(GA4_EVENTS.ADD_PAYMENT_INFO, {
    currency: params.currency || 'THB',
    ...params,
  })
}

/* ------------------------------------------------------------------ */
/*  Utility Functions                                                   */
/* ------------------------------------------------------------------ */

/**
 * Check if GA4 is available and initialized
 */
export function isGA4Available(): boolean {
  return typeof window !== 'undefined' && typeof window.gtag === 'function'
}

/**
 * Check if analytics consent is granted
 */
export function hasAnalyticsConsent(): boolean {
  if (typeof window === 'undefined') {
    return false
  }

  try {
    const stored = localStorage.getItem('solariq_cookie_consent')
    if (stored) {
      const parsed = JSON.parse(stored)
      return parsed.consent?.analytics === true
    }
  } catch {
    // Ignore parsing errors
  }

  return false
}

/**
 * Get the current GA4 measurement ID
 */
export function getMeasurementId(): string {
  return GA4_MEASUREMENT_ID
}
