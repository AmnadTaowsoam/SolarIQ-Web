import { render, screen } from '@testing-library/react'
import DashboardPage from '@/app/dashboard/page'
import { useAuth } from '@/context'
import { useDashboardStats, useRecentLeads, useLeadsOverTime, useTopLocations } from '@/hooks'

// Mock dependencies
jest.mock('@/context', () => ({
  useAuth: jest.fn(),
}))

jest.mock('@/hooks', () => ({
  useDashboardStats: jest.fn(),
  useRecentLeads: jest.fn(),
  useLeadsOverTime: jest.fn(),
  useTopLocations: jest.fn(),
}))

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
  })),
  usePathname: jest.fn(() => '/dashboard'),
}))

jest.mock('@/lib/firebase', () => ({
  auth: {},
}))

jest.mock('uuid', () => ({ v4: () => 'test-uuid' }))

const mockUseAuth = useAuth as jest.Mock
const mockUseDashboardStats = useDashboardStats as jest.Mock
const mockUseRecentLeads = useRecentLeads as jest.Mock
const mockUseLeadsOverTime = useLeadsOverTime as jest.Mock
const mockUseTopLocations = useTopLocations as jest.Mock

describe('DashboardPage', () => {
  const mockUser = {
    uid: 'test-uid',
    email: 'test@example.com',
    displayName: 'Test User',
    role: 'admin' as const,
    createdAt: '2024-01-01T00:00:00Z',
    lastLoginAt: '2024-01-15T00:00:00Z',
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseAuth.mockReturnValue({
      user: mockUser,
      isLoading: false,
      isAuthenticated: true,
    })
    mockUseDashboardStats.mockReturnValue({
      data: {
        data: {
          totalLeads: 100,
          newLeads: 25,
          conversionRate: 15.5,
          revenue: 500000,
        },
        isLoading: false,
      },
    })
    mockUseRecentLeads.mockReturnValue({
      data: [],
      isLoading: false,
    })
    mockUseLeadsOverTime.mockReturnValue({
      data: [],
      isLoading: false,
    })
    mockUseTopLocations.mockReturnValue({
      data: [],
      isLoading: false,
    })
  })

  it('renders summary cards with correct data', () => {
    render(<DashboardPage />)

    expect(screen.getByText('Total Leads')).toBeInTheDocument()
    expect(screen.getByText('New Leads')).toBeInTheDocument()
    expect(screen.getByText('Conversion Rate')).toBeInTheDocument()
    expect(screen.getByText('Revenue')).toBeInTheDocument()
  })

  it('renders charts section', () => {
    render(<DashboardPage />)

    expect(screen.getByText('Leads Over Time (30 Days)')).toBeInTheDocument()
    expect(screen.getByText('Top Locations')).toBeInTheDocument()
  })

  it('renders recent leads section', () => {
    render(<DashboardPage />)

    expect(screen.getByText('Recent Leads')).toBeInTheDocument()
  })

  it('displays welcome message with user name', () => {
    render(<DashboardPage />)

    expect(screen.getByText(/welcome back, test user/i)).toBeInTheDocument()
  })
})
