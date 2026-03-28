// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: '/api/v1/auth/login',
    LOGOUT: '/api/v1/auth/logout',
    ME: '/api/v1/auth/me',
    REFRESH: '/api/v1/auth/refresh',
  },
  // Leads
  LEADS: {
    LIST: '/api/v1/leads',
    DETAIL: (id: string) => `/api/v1/leads/${id}`,
    UPDATE_STATUS: (id: string) => `/api/v1/leads/${id}/status`,
    ASSIGN: (id: string) => `/api/v1/leads/${id}/assign`,
    STATS: '/api/v1/leads/stats',
  },
  // Solar Analysis
  SOLAR: {
    ANALYZE: '/api/v1/solar/analyze',
    ANALYZE_ADVANCED: '/api/v1/solar/analyze-advanced',
    HISTORY: '/api/v1/solar/history',
    DATA_LAYERS: '/api/v1/solar/data-layers',
    SHADE_ANALYSIS: '/api/v1/solar/shade-analysis',
    HOURLY_IRRADIANCE: '/api/v1/solar/hourly-irradiance',
    INCENTIVES: '/api/v1/solar/incentives',
    PANELS: '/api/v1/solar/panels',
    MONTHLY_PRODUCTION: '/api/v1/solar/monthly-production',
    SYSTEM_OPTIONS: '/api/v1/solar/system-options',
    ENVIRONMENTAL_IMPACT: '/api/v1/solar/environmental-impact',
    // Forecast & Weather
    FORECAST_WEATHER: '/api/v1/solar/forecast/weather',
    FORECAST_DYNAMIC_YIELD: '/api/v1/solar/forecast/dynamic-yield',
    FORECAST_LIVE_CONDITIONS: '/api/v1/solar/forecast/live-conditions',
    FORECAST_CLIMATE_SCORE: '/api/v1/solar/forecast/climate-score',
    FORECAST_CLIMATE_RISK: '/api/v1/solar/forecast/climate-risk',
    FORECAST_AIR_QUALITY: '/api/v1/solar/forecast/air-quality',
    FORECAST_AIR_QUALITY_FORECAST: '/api/v1/solar/forecast/air-quality-forecast',
    FORECAST_DUST_SEASON: '/api/v1/solar/forecast/dust-season',
    FORECAST_FINANCING_OPTIONS: '/api/v1/solar/forecast/financing-options',
    FORECAST_ALERTS: '/api/v1/solar/forecast/alerts',
    FEEDBACK: '/api/v1/solar/feedback',
  },
  // Dashboard
  DASHBOARD: {
    STATS: '/api/v1/dashboard/stats',
    LEADS_OVER_TIME: '/api/v1/dashboard/leads-over-time',
    TOP_LOCATIONS: '/api/v1/dashboard/top-locations',
    RECENT_LEADS: '/api/v1/dashboard/recent-leads',
  },
  // Knowledge Base (RAG)
  KNOWLEDGE: {
    LIST: '/api/v1/knowledge/documents',
    UPLOAD: '/api/v1/knowledge/documents/upload',
    DETAIL: (id: string) => `/api/v1/knowledge/documents/${id}`,
    PREVIEW: (id: string) => `/api/v1/knowledge/documents/${id}/preview`,
  },
  // Pricing
  PRICING: {
    INSTALLATION_COST: '/api/v1/pricing/installation-cost',
    ELECTRICITY_RATES: '/api/v1/pricing/electricity-rates',
    EQUIPMENT: '/api/v1/pricing/equipment',
  },
  // MFA
  MFA: {
    STATUS: '/api/v1/mfa/status',
    ENROLL_START: '/api/v1/mfa/enroll/start',
    ENROLL_VERIFY: '/api/v1/mfa/enroll/verify',
    DISABLE: '/api/v1/mfa/disable',
  },
  // LINE Settings
  LINE_SETTINGS: {
    CONFIG: '/api/v1/settings/line',
    TEST: '/api/v1/settings/line/test',
  },
  // Service Requests
  SERVICE_REQUESTS: {
    LIST: '/api/v1/service-requests',
    DETAIL: (id: string) => `/api/v1/service-requests/${id}`,
  },
  // Maintenance
  MAINTENANCE: {
    LIST: '/api/v1/maintenance',
    DETAIL: (id: string) => `/api/v1/maintenance/${id}`,
  },
  // Installations
  INSTALLATIONS: {
    LIST: '/api/v1/installations',
    DETAIL: (id: string) => `/api/v1/installations/${id}`,
  },
  // Chat
  CHAT: {
    SEND: '/api/v1/chat',
  },
  // Developer API
  DEVELOPER: {
    BASE: '/api/v1/developer',
  },
  // Billing
  BILLING: {
    STATUS: '/api/v1/billing/status',
    PLANS: '/api/v1/billing/plans',
    SUBSCRIBE: '/api/v1/billing/subscribe',
    CANCEL: '/api/v1/billing/cancel',
    INVOICES: '/api/v1/billing/invoices',
    USAGE: '/api/v1/billing/usage',
    CREATE_CHECKOUT_SESSION: '/api/v1/billing/create-checkout-session',
    CHARGE_STATUS: (chargeId: string) => `/api/v1/billing/charges/${chargeId}/status`,
    CUSTOMER_PORTAL: '/api/v1/billing/customer-portal',
  },
} as const

// Lead Status Labels
export const LEAD_STATUS_LABELS = {
  new: 'New',
  contacted: 'Contacted',
  quoted: 'Quoted',
  won: 'Won',
  lost: 'Lost',
} as const

export const LEAD_STATUS_COLORS = {
  new: 'bg-blue-100 text-blue-800',
  contacted: 'bg-yellow-100 text-yellow-800',
  quoted: 'bg-purple-100 text-purple-800',
  won: 'bg-green-100 text-green-800',
  lost: 'bg-red-100 text-red-800',
} as const

// User Role Labels
export const USER_ROLE_LABELS = {
  admin: 'Administrator',
  contractor: 'Contractor',
} as const

// Pagination
export const DEFAULT_PAGE_SIZE = 10
export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100]

// Date Formats
export const DATE_FORMAT = 'yyyy-MM-dd'
export const DATE_TIME_FORMAT = 'yyyy-MM-dd HH:mm'
export const DISPLAY_DATE_FORMAT = 'MMM dd, yyyy'
export const DISPLAY_DATE_TIME_FORMAT = 'MMM dd, yyyy HH:mm'

// Thai Baht formatting
export const CURRENCY_LOCALE = 'th-TH'
export const CURRENCY_CODE = 'THB'

// Chart colors
export const CHART_COLORS = {
  primary: '#f97316',
  secondary: '#22c55e',
  tertiary: '#3b82f6',
  quaternary: '#8b5cf6',
  quinary: '#ec4899',
}

// Toast duration in milliseconds
export const TOAST_DURATION = 5000

// File upload limits
export const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
export const ALLOWED_FILE_TYPES = {
  documents: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],
  images: ['image/jpeg', 'image/png', 'image/gif'],
}

// Google Maps
export const DEFAULT_MAP_CENTER = {
  lat: 13.7563,
  lng: 100.5018,
} // Bangkok, Thailand

export const DEFAULT_MAP_ZOOM = 12

// Routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  FORGOT_PASSWORD: '/forgot-password',
  VERIFY_EMAIL: '/verify-email',
  DASHBOARD: '/dashboard',
  ANALYTICS: '/analytics',
  ANALYTICS_PIPELINE: '/analytics/pipeline',
  ANALYTICS_LEADS: '/analytics/leads',
  ANALYTICS_REVENUE: '/analytics/revenue',
  ANALYTICS_MARKET: '/analytics/market',
  ANALYTICS_REPORTS: '/analytics/reports',
  ANALYTICS_SCORECARD: '/analytics/scorecard',
  LEADS: '/leads',
  LEAD_DETAIL: (id: string) => `/leads/${id}`,
  ANALYZE: '/analyze',
  KNOWLEDGE: '/knowledge',
  PRICING: '/pricing',
  COMMISSIONS: '/commissions',
  INVOICES: '/invoices',
  PROFILE: '/profile',
  SETTINGS: '/settings',
  DEALS: '/deals',
  MESSAGES: '/messages',
  AUDIT_LOGS: '/admin/audit-logs',
  SESSIONS: '/settings/sessions',
  SERVICE_AREA: '/settings/service-area',
  DEVELOPERS: '/developers',
  ADMIN_REVENUE: '/admin/revenue',
  PRICING_PLANS: '/pricing-plans',
  ABOUT: '/about',
  TERMS: '/terms',
  CONTACT: '/contact',
  CHECKOUT: '/checkout',
  CHECKOUT_SUCCESS: '/checkout/success',
  CHECKOUT_CANCEL: '/checkout/cancel',
} as const

// Admin-only routes
export const ADMIN_ROUTES = [
  ROUTES.KNOWLEDGE,
  ROUTES.PRICING,
  ROUTES.ADMIN_REVENUE,
  ROUTES.ANALYTICS_REVENUE,
  ROUTES.AUDIT_LOGS,
]
