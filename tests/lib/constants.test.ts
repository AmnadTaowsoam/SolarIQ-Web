import {
  API_ENDPOINTS,
  LEAD_STATUS_LABELS,
  LEAD_STATUS_COLORS,
  USER_ROLE_LABELS,
  ROUTES,
  ADMIN_ROUTES,
  DEFAULT_PAGE_SIZE,
  PAGE_SIZE_OPTIONS,
  MAX_FILE_SIZE,
  ALLOWED_FILE_TYPES,
  CHART_COLORS,
} from '@/lib/constants'

describe('API_ENDPOINTS', () => {
  it('has correct auth endpoints', () => {
    expect(API_ENDPOINTS.AUTH.LOGIN).toBe('/api/v1/auth/login')
    expect(API_ENDPOINTS.AUTH.ME).toBe('/api/v1/auth/me')
  })

  it('has dynamic lead endpoints', () => {
    expect(API_ENDPOINTS.LEADS.DETAIL('123')).toBe('/api/v1/leads/123')
    expect(API_ENDPOINTS.LEADS.UPDATE_STATUS('abc')).toBe('/api/v1/leads/abc/status')
  })

  it('has dynamic knowledge endpoints', () => {
    expect(API_ENDPOINTS.KNOWLEDGE.DETAIL('doc-1')).toBe('/api/v1/knowledge/documents/doc-1')
    expect(API_ENDPOINTS.KNOWLEDGE.PREVIEW('doc-1')).toBe('/api/v1/knowledge/documents/doc-1/preview')
  })
})

describe('LEAD_STATUS_LABELS', () => {
  it('has all status labels', () => {
    expect(LEAD_STATUS_LABELS.new).toBe('New')
    expect(LEAD_STATUS_LABELS.won).toBe('Won')
    expect(LEAD_STATUS_LABELS.lost).toBe('Lost')
  })
})

describe('LEAD_STATUS_COLORS', () => {
  it('has color classes for all statuses', () => {
    expect(LEAD_STATUS_COLORS.new).toContain('text-blue')
    expect(LEAD_STATUS_COLORS.won).toContain('text-green')
  })
})

describe('USER_ROLE_LABELS', () => {
  it('has role labels', () => {
    expect(USER_ROLE_LABELS.admin).toBe('Administrator')
    expect(USER_ROLE_LABELS.contractor).toBe('Contractor')
  })
})

describe('ROUTES', () => {
  it('has correct static routes', () => {
    expect(ROUTES.HOME).toBe('/')
    expect(ROUTES.LOGIN).toBe('/login')
    expect(ROUTES.DASHBOARD).toBe('/dashboard')
  })

  it('has dynamic lead detail route', () => {
    expect(ROUTES.LEAD_DETAIL('lead-1')).toBe('/leads/lead-1')
  })
})

describe('ADMIN_ROUTES', () => {
  it('includes knowledge and pricing', () => {
    expect(ADMIN_ROUTES).toContain('/knowledge')
    expect(ADMIN_ROUTES).toContain('/pricing')
    expect(ADMIN_ROUTES).not.toContain('/dashboard')
  })
})

describe('constants', () => {
  it('has correct defaults', () => {
    expect(DEFAULT_PAGE_SIZE).toBe(10)
    expect(PAGE_SIZE_OPTIONS).toContain(10)
    expect(PAGE_SIZE_OPTIONS).toContain(100)
  })

  it('has file upload limits', () => {
    expect(MAX_FILE_SIZE).toBe(10 * 1024 * 1024)
    expect(ALLOWED_FILE_TYPES.documents).toContain('application/pdf')
  })

  it('has chart colors', () => {
    expect(CHART_COLORS.primary).toBe('#f97316')
  })
})
