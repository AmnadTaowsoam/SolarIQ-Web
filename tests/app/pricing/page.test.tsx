import { render, screen, fireEvent } from '@testing-library/react'
import PricingPage from '@/app/pricing/page'
import { useAuth } from '@/context'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/Toast'
import { useInstallationCosts, useElectricityRates, useCreateInstallationCost, useCreateElectricityRate } from '@/hooks'

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(() => '/pricing'),
}))

jest.mock('@/context', () => ({
  useAuth: jest.fn(),
}))

jest.mock('@/components/ui/Toast', () => ({
  useToast: jest.fn(),
}))

jest.mock('@/hooks', () => ({
  useInstallationCosts: jest.fn(),
  useElectricityRates: jest.fn(),
  useCreateInstallationCost: jest.fn(),
  useCreateElectricityRate: jest.fn(),
}))

describe('PricingPage', () => {
  const mockRouter = { replace: jest.fn() }
  const mockAddToast = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue(mockRouter)
    ;(useToast as jest.Mock).mockReturnValue({ addToast: mockAddToast })
    ;(useInstallationCosts as jest.Mock).mockReturnValue({ data: [], isLoading: false })
    ;(useElectricityRates as jest.Mock).mockReturnValue({ data: [], isLoading: false })
    ;(useCreateInstallationCost as jest.Mock).mockReturnValue({ mutateAsync: jest.fn() })
    ;(useCreateElectricityRate as jest.Mock).mockReturnValue({ mutateAsync: jest.fn() })
  })

  it('redirects non-admin users', () => {
    ;(useAuth as jest.Mock).mockReturnValue({ user: { id: '1', role: 'user' }, isLoading: false })
    render(<PricingPage />)
    expect(mockAddToast).toHaveBeenCalledWith('error', 'You do not have permission to access this page')
    expect(mockRouter.replace).toHaveBeenCalledWith('/dashboard')
  })

  it('renders correctly for admin users', () => {
    ;(useAuth as jest.Mock).mockReturnValue({ user: { id: '1', role: 'admin' }, isLoading: false })
    render(<PricingPage />)
    expect(screen.getByText('Pricing Management')).toBeInTheDocument()
  })
})
