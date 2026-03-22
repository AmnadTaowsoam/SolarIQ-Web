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
    HISTORY: '/api/v1/solar/history',
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
  documents: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
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
  SETTINGS: '/settings',
  DEALS: '/deals',
  MESSAGES: '/messages',
  AUDIT_LOGS: '/admin/audit-logs',
  SESSIONS: '/settings/sessions',
  SERVICE_AREA: '/settings/service-area',
  DEVELOPERS: '/developers',
  ADMIN_REVENUE: '/admin/revenue',
} as const

// Admin-only routes
export const ADMIN_ROUTES = [ROUTES.KNOWLEDGE, ROUTES.PRICING, ROUTES.ADMIN_REVENUE, ROUTES.ANALYTICS_REVENUE, ROUTES.AUDIT_LOGS]
