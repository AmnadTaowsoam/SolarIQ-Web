import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import AnalyzePage from '@/app/analyze/page'
import { useAuth } from '@/context'
import { useToast } from '@/components/ui/Toast'
import { useSolarAnalysis } from '@/hooks'
import { useRouter } from 'next/navigation'

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(() => '/analyze'),
}))

jest.mock('@/context', () => ({
  useAuth: jest.fn(),
}))

jest.mock('@/components/ui/Toast', () => ({
  useToast: jest.fn(),
}))

jest.mock('@/hooks', () => ({
  useSolarAnalysis: jest.fn(),
}))

describe('AnalyzePage', () => {
  const mockRouter = { replace: jest.fn(), push: jest.fn() }
  const mockAddToast = jest.fn()
  const mockMutateAsync = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue(mockRouter)
    ;(useToast as jest.Mock).mockReturnValue({ addToast: mockAddToast })
    ;(useSolarAnalysis as jest.Mock).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
    })
  })

  it('redirects to login if not authenticated', () => {
    ;(useAuth as jest.Mock).mockReturnValue({ user: null, isLoading: false })
    render(<AnalyzePage />)
    expect(mockRouter.replace).toHaveBeenCalledWith('/login')
  })

  it('shows loading state', () => {
    ;(useAuth as jest.Mock).mockReturnValue({ user: null, isLoading: true })
    const { container } = render(<AnalyzePage />)
    expect(container.querySelector('.animate-spin')).toBeInTheDocument()
  })

  it('renders correctly for authenticated user', () => {
    ;(useAuth as jest.Mock).mockReturnValue({ user: { id: '1', role: 'user' }, isLoading: false })
    render(<AnalyzePage />)
    expect(screen.getAllByText('Solar Analysis')[0]).toBeInTheDocument()
  })

  it('handles analysis submission and validation', async () => {
    ;(useAuth as jest.Mock).mockReturnValue({ user: { id: '1', role: 'user' }, isLoading: false })
    render(<AnalyzePage />)
    
    const analyzeButton = screen.getByRole('button', { name: /Analyze Solar Potential/i })
    
    // Empty submission
    fireEvent.click(analyzeButton)
    expect(mockAddToast).toHaveBeenCalledWith('error', 'Please fill in all required fields')
    
    // Fill fields
    fireEvent.change(screen.getByLabelText(/Latitude/i), { target: { value: '13.7' } })
    fireEvent.change(screen.getByLabelText(/Longitude/i), { target: { value: '100.5' } })
    fireEvent.change(screen.getByLabelText(/Monthly Electricity Bill/i), { target: { value: '5000' } })
    
    mockMutateAsync.mockResolvedValueOnce({
      panelConfig: { capacityKw: 5, panelsCount: 10, yearlyEnergyDcKwh: 6000 },
      financialAnalysis: { paybackYears: 5, roi25Year: 15, installationCost: 150000, netCost: 150000, monthlySavings: 2500, yearlySavings: 30000 },
      solarPotential: { maxSunshineHoursPerYear: 1500, carbonOffsetFactorKgPerMwh: 500 },
      electricityRate: 5,
      coordinates: { latitude: 13.7, longitude: 100.5 },
      address: 'Bangkok'
    })
    
    fireEvent.click(analyzeButton)
    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalled()
      expect(mockAddToast).toHaveBeenCalledWith('success', 'Solar analysis completed successfully!')
    })
    
    expect(screen.getByText('Recommended System')).toBeInTheDocument()
  })
})
