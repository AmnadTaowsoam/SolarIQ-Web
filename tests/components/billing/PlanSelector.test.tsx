/**
 * PlanSelector Component Tests (WK-102)
 */

import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PlanSelector } from '@/components/billing/PlanSelector'
const mockOnSelectPlan = jest.fn()
const mockOnBillingCycleChange = jest.fn()

describe('PlanSelector', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  const defaultProps = {
    onSelectPlan: mockOnSelectPlan,
    onBillingCycleChange: mockOnBillingCycleChange,
  }

  it('renders all plans', () => {
    render(<PlanSelector {...defaultProps} />)

    expect(screen.getByText('Starter')).toBeInTheDocument()
    expect(screen.getByText('Pro')).toBeInTheDocument()
    expect(screen.getByText('Enterprise')).toBeInTheDocument()
  })

  it('shows billing cycle toggle by default', () => {
    render(<PlanSelector {...defaultProps} />)

    expect(screen.getByText('Monthly')).toBeInTheDocument()
    expect(screen.getByText('Annual')).toBeInTheDocument()
  })

  it('displays monthly prices by default', () => {
    render(<PlanSelector {...defaultProps} />)

    expect(screen.getByText('2,900 THB/month')).toBeInTheDocument() // Starter
    expect(screen.getByText('4,900 THB/month')).toBeInTheDocument() // Pro
    expect(screen.getByText('14,900 THB/month')).toBeInTheDocument() // Enterprise
  })

  it('switches to annual billing cycle', async () => {
    const user = userEvent.setup()
    render(<PlanSelector {...defaultProps} />)

    const annualButton = screen.getByText('Annual')
    await user.click(annualButton)

    expect(mockOnBillingCycleChange).toHaveBeenCalledWith('annual')
    expect(screen.getByText('27,840 THB/year')).toBeInTheDocument() // Starter annual
    expect(screen.getByText('47,040 THB/year')).toBeInTheDocument() // Pro annual
  })

  it('displays annual discount badge', () => {
    render(<PlanSelector {...defaultProps} />)

    const annualButton = screen.getByText('Annual')
    expect(annualButton).toContainHTML('Save 20%')
  })

  it('shows annual billing info when annual is selected', async () => {
    const user = userEvent.setup()
    render(<PlanSelector {...defaultProps} />)

    const annualButton = screen.getByText('Annual')
    await user.click(annualButton)

    expect(screen.getByText('Annual Billing Benefits')).toBeInTheDocument()
    expect(screen.getByText('Save 20% compared to monthly billing')).toBeInTheDocument()
  })

  it('highlights current plan', () => {
    render(<PlanSelector {...defaultProps} currentPlan="pro" />)

    expect(screen.getByText('Current Plan')).toBeInTheDocument()
  })

  it('marks pro plan as most popular', () => {
    render(<PlanSelector {...defaultProps} />)

    expect(screen.getByText('Most Popular')).toBeInTheDocument()
  })

  it('calls onSelectPlan when plan is selected', async () => {
    const user = userEvent.setup()
    render(<PlanSelector {...defaultProps} />)

    const selectButtons = screen.getAllByText('Select Plan')
    await user.click(selectButtons[0]) // Click first plan (Starter)

    expect(mockOnSelectPlan).toHaveBeenCalledWith('starter')
  })

  it('disables button for current plan', () => {
    render(<PlanSelector {...defaultProps} currentPlan="pro" />)

    const proCard = screen.getByText('Pro').closest('.border-blue-600, .border-green-600')
    const selectButton = proCard?.querySelector('button')
    expect(selectButton).toBeDisabled()
    expect(selectButton).toHaveTextContent('Current Plan')
  })

  it('disables all buttons when loading', () => {
    render(<PlanSelector {...defaultProps} isLoading={true} />)

    const selectButtons = screen.getAllByText('Select Plan')
    selectButtons.forEach((button) => {
      expect(button).toBeDisabled()
    })
  })

  it('hides billing cycle toggle when showBillingCycle is false', () => {
    render(<PlanSelector {...defaultProps} showBillingCycle={false} />)

    expect(screen.queryByText('Monthly')).not.toBeInTheDocument()
    expect(screen.queryByText('Annual')).not.toBeInTheDocument()
  })

  it('uses initial billing cycle when provided', () => {
    render(<PlanSelector {...defaultProps} initialBillingCycle="annual" />)

    expect(screen.getByText('47,040 THB/year')).toBeInTheDocument()
  })

  it('displays plan features correctly', () => {
    render(<PlanSelector {...defaultProps} />)

    // Check for some features
    expect(screen.getByText('AI Analysis')).toBeInTheDocument()
    expect(screen.getByText('PDF Proposal')).toBeInTheDocument()
    expect(screen.getByText('leads/month')).toBeInTheDocument()
    expect(screen.getByText('users')).toBeInTheDocument()
  })

  it('shows monthly price per month for annual billing', async () => {
    const user = userEvent.setup()
    render(<PlanSelector {...defaultProps} />)

    const annualButton = screen.getByText('Annual')
    await user.click(annualButton)

    // Pro plan: 47,040 / 12 = 3,920 per month
    expect(screen.getByText('3,920/month (billed annually)')).toBeInTheDocument()
  })
})
