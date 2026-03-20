import { render, screen, fireEvent } from '@testing-library/react'
import { PlanSelector } from '@/components/billing/PlanSelector'
import type { PlanType } from '@/types/billing'

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Check: () => <svg data-testid="check-icon" />,
}))

describe('PlanSelector', () => {
  const mockOnSelectPlan = jest.fn()

  beforeEach(() => jest.clearAllMocks())

  it('renders 3 plan cards', () => {
    render(<PlanSelector onSelectPlan={mockOnSelectPlan} />)

    expect(screen.getByText('Starter')).toBeInTheDocument()
    expect(screen.getByText('Pro')).toBeInTheDocument()
    expect(screen.getByText('Enterprise')).toBeInTheDocument()
  })

  it('displays correct prices in THB', () => {
    render(<PlanSelector onSelectPlan={mockOnSelectPlan} />)

    // formatPrice uses Intl.NumberFormat with THB currency
    expect(screen.getByText(/2,900/)).toBeInTheDocument()
    expect(screen.getByText(/7,900/)).toBeInTheDocument()
    expect(screen.getByText(/15,000/)).toBeInTheDocument()
  })

  it('shows features for each plan', () => {
    render(<PlanSelector onSelectPlan={mockOnSelectPlan} />)

    // Starter plan features
    expect(screen.getAllByText('AI Analysis').length).toBeGreaterThanOrEqual(3)
    expect(screen.getAllByText('PDF Proposal').length).toBeGreaterThanOrEqual(3)

    // Check leads/month info
    expect(screen.getByText('20 leads/month')).toBeInTheDocument()
    expect(screen.getByText('100 leads/month')).toBeInTheDocument()
    expect(screen.getByText('Unlimited leads/month')).toBeInTheDocument()
  })

  it('shows user limits for each plan', () => {
    render(<PlanSelector onSelectPlan={mockOnSelectPlan} />)

    expect(screen.getByText('1 users')).toBeInTheDocument()
    expect(screen.getByText('5 users')).toBeInTheDocument()
    expect(screen.getByText('Unlimited users')).toBeInTheDocument()
  })

  it('highlights current plan', () => {
    render(<PlanSelector currentPlan="pro" onSelectPlan={mockOnSelectPlan} />)

    expect(screen.getByText('Current Plan')).toBeInTheDocument()
  })

  it('shows "Most Popular" badge on Pro plan', () => {
    render(<PlanSelector onSelectPlan={mockOnSelectPlan} />)

    expect(screen.getByText('Most Popular')).toBeInTheDocument()
  })

  it('disables subscribe button for current plan', () => {
    render(<PlanSelector currentPlan="starter" onSelectPlan={mockOnSelectPlan} />)

    const buttons = screen.getAllByRole('button')
    const starterButton = buttons.find((btn) => btn.textContent === 'Current Plan')
    expect(starterButton).toBeDisabled()
  })

  it('subscribe button calls handler with correct plan id', () => {
    render(<PlanSelector onSelectPlan={mockOnSelectPlan} />)

    const selectButtons = screen.getAllByText('Select Plan')
    fireEvent.click(selectButtons[0])

    expect(mockOnSelectPlan).toHaveBeenCalledWith('starter')
  })

  it('disables all buttons when isLoading is true', () => {
    render(<PlanSelector onSelectPlan={mockOnSelectPlan} isLoading />)

    const buttons = screen.getAllByRole('button')
    buttons.forEach((btn) => {
      expect(btn).toBeDisabled()
    })
  })
})
