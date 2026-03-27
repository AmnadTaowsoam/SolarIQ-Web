/**
 * TrialBanner Component Tests (WK-102)
 */

import React from 'react'
import { render, screen, fireEvent, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TrialBanner from '@/components/billing/TrialBanner'

const mockOnUpgrade = jest.fn()
const mockOnDismiss = jest.fn()

describe('TrialBanner', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  const defaultProps = {
    daysRemaining: 7,
    isTrialActive: true,
    trialEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    planName: 'pro',
    onUpgrade: mockOnUpgrade,
    onDismiss: mockOnDismiss,
    showDismiss: true,
  }

  it('renders when trial is active', () => {
    render(<TrialBanner {...defaultProps} />)

    expect(screen.getByText('Trial Active')).toBeInTheDocument()
    expect(screen.getByText(/Your trial will end in 7 days/)).toBeInTheDocument()
  })

  it('does not render when trial is not active', () => {
    render(<TrialBanner {...defaultProps} isTrialActive={false} />)

    expect(screen.queryByText('Trial Active')).not.toBeInTheDocument()
  })

  it('does not render when dismissed', () => {
    render(<TrialBanner {...defaultProps} />)

    const dismissButton = screen.getByRole('button', { name: '' })
    fireEvent.click(dismissButton)

    expect(screen.queryByText('Trial Active')).not.toBeInTheDocument()
  })

  it('shows urgent styling when 3 days or less remaining', () => {
    render(<TrialBanner {...defaultProps} daysRemaining={3} />)

    expect(screen.getByText('Trial Expiring')).toBeInTheDocument()
  })

  it('shows critical styling when 1 day or less remaining', () => {
    render(<TrialBanner {...defaultProps} daysRemaining={1} />)

    expect(screen.getByText('Trial Ending Soon!')).toBeInTheDocument()
  })

  it('displays countdown timer', () => {
    render(<TrialBanner {...defaultProps} />)

    expect(screen.getByText('Days')).toBeInTheDocument()
    expect(screen.getByText('Hours')).toBeInTheDocument()
    expect(screen.getByText('Minutes')).toBeInTheDocument()
    expect(screen.getByText('Seconds')).toBeInTheDocument()
  })

  it('updates countdown timer every second', () => {
    render(<TrialBanner {...defaultProps} />)

    const _initialSeconds = screen.getByText(/\d+/)

    act(() => {
      jest.advanceTimersByTime(1000)
    })

    const updatedSeconds = screen.getByText(/\d+/)
    expect(updatedSeconds).toBeInTheDocument()
  })

  it('shows upgrade button', () => {
    render(<TrialBanner {...defaultProps} />)

    expect(screen.getByText('Upgrade Now')).toBeInTheDocument()
  })

  it('calls onUpgrade when upgrade button is clicked', async () => {
    const user = userEvent.setup()
    render(<TrialBanner {...defaultProps} />)

    const upgradeButton = screen.getByText('Upgrade Now')
    await user.click(upgradeButton)

    expect(mockOnUpgrade).toHaveBeenCalled()
  })

  it('shows view plans link', () => {
    render(<TrialBanner {...defaultProps} />)

    expect(screen.getByText('View Plans')).toBeInTheDocument()
    expect(screen.getByText('View Plans').closest('a')).toHaveAttribute('href', '/pricing-plans')
  })

  it('displays trial benefits', () => {
    render(<TrialBanner {...defaultProps} />)

    expect(screen.getByText('Your trial includes:')).toBeInTheDocument()
    expect(screen.getByText('Full access to all features')).toBeInTheDocument()
    expect(screen.getByText('No credit card required')).toBeInTheDocument()
    expect(screen.getByText('Cancel anytime')).toBeInTheDocument()
  })

  it('renders compact version when showDismiss is false', () => {
    render(<TrialBanner {...defaultProps} showDismiss={false} />)

    expect(screen.getByText(/ทดลองใช้งาน — เหลืออีก 7 วัน/)).toBeInTheDocument()
    expect(screen.queryByText('Days')).not.toBeInTheDocument()
  })

  it('shows dismiss button when showDismiss is true', () => {
    render(<TrialBanner {...defaultProps} showDismiss={true} />)

    const dismissButton = screen.getByRole('button')
    expect(dismissButton).toBeInTheDocument()
  })

  it('calls onDismiss when dismiss button is clicked', () => {
    render(<TrialBanner {...defaultProps} showDismiss={true} />)

    const dismissButton = screen.getByRole('button')
    fireEvent.click(dismissButton)

    expect(mockOnDismiss).toHaveBeenCalled()
  })

  it('shows appropriate message for free plan', () => {
    render(<TrialBanner {...defaultProps} planName="free" />)

    expect(screen.getByText('แพลน Free')).toBeInTheDocument()
  })

  it('shows appropriate message when trial has ended', () => {
    render(
      <TrialBanner
        {...defaultProps}
        daysRemaining={0}
        trialEndDate={new Date(Date.now() - 1000).toISOString()}
      />
    )

    expect(
      screen.getByText('Your trial has ended. Upgrade now to continue using all features.')
    ).toBeInTheDocument()
  })

  it('displays countdown with correct values', () => {
    const trialEndDate = new Date(
      Date.now() + 2 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000 + 30 * 60 * 1000 + 45 * 1000
    )
    render(<TrialBanner {...defaultProps} trialEndDate={trialEndDate.toISOString()} />)

    expect(screen.getByText('2')).toBeInTheDocument() // Days
    expect(screen.getByText('3')).toBeInTheDocument() // Hours
    expect(screen.getByText('30')).toBeInTheDocument() // Minutes
  })
})
