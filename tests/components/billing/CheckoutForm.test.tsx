/**
 * CheckoutForm Component Tests (WK-102)
 */

import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { CheckoutForm } from '@/components/billing/CheckoutForm'
import { PLANS } from '@/types/billing'

// Mock the hooks
jest.mock('@/hooks/useBilling', () => ({
  useCreateCheckoutSession: () => ({
    mutateAsync: jest.fn(),
    isPending: false,
  }),
}))

const mockOnSuccess = jest.fn()
const mockOnError = jest.fn()

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
  Wrapper.displayName = 'TestWrapper'
  return Wrapper
}

describe('CheckoutForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  const defaultProps = {
    plan: PLANS.pro,
    billingCycle: 'monthly' as const,
    onSuccess: mockOnSuccess,
    onError: mockOnError,
  }

  it('renders checkout form with plan details', () => {
    render(<CheckoutForm {...defaultProps} />, { wrapper: createWrapper() })

    expect(screen.getByText('Checkout')).toBeInTheDocument()
    expect(screen.getByText('Pro Plan')).toBeInTheDocument()
    expect(screen.getByText(/4,900/)).toBeInTheDocument()
  })

  it('displays correct price for monthly billing', () => {
    render(<CheckoutForm {...defaultProps} billingCycle="monthly" />, {
      wrapper: createWrapper(),
    })

    expect(screen.getByText('4,900 THB')).toBeInTheDocument()
    expect(screen.queryByText('Save 20%')).not.toBeInTheDocument()
  })

  it('displays correct price with discount for annual billing', () => {
    render(<CheckoutForm {...defaultProps} billingCycle="annual" />, {
      wrapper: createWrapper(),
    })

    // Annual price: 4900 * 12 * 0.8 = 47,040
    expect(screen.getByText('47,040 THB')).toBeInTheDocument()
    expect(screen.getByText('3,920/month (billed annually)')).toBeInTheDocument()
    expect(screen.getByText('Annual Discount (20%)')).toBeInTheDocument()
  })

  it('renders all payment methods', () => {
    render(<CheckoutForm {...defaultProps} />, { wrapper: createWrapper() })

    expect(screen.getByText('Credit Card')).toBeInTheDocument()
    expect(screen.getByText('PromptPay QR')).toBeInTheDocument()
    expect(screen.getByText('Bank Transfer')).toBeInTheDocument()
  })

  it('selects PromptPay as default payment method', () => {
    render(<CheckoutForm {...defaultProps} />, { wrapper: createWrapper() })

    const promptpayButton = screen.getByText('PromptPay QR').closest('button')
    expect(promptpayButton).toHaveClass('border-blue-600')
  })

  it('changes payment method when clicked', async () => {
    const user = userEvent.setup()
    render(<CheckoutForm {...defaultProps} />, { wrapper: createWrapper() })

    const creditCardButton = screen.getByText('Credit Card').closest('button')
    await user.click(creditCardButton!)

    expect(creditCardButton).toHaveClass('border-blue-600')
  })

  it('shows bank options when bank transfer is selected', async () => {
    const user = userEvent.setup()
    render(<CheckoutForm {...defaultProps} />, { wrapper: createWrapper() })

    const bankTransferButton = screen.getByText('Bank Transfer').closest('button')
    await user.click(bankTransferButton!)

    expect(screen.getByText('Select Bank')).toBeInTheDocument()
    expect(screen.getByText('SCB Easy App')).toBeInTheDocument()
    expect(screen.getByText('K PLUS')).toBeInTheDocument()
    expect(screen.getByText('Bualuang mBanking')).toBeInTheDocument()
  })

  it('shows QR code button for PromptPay', () => {
    render(<CheckoutForm {...defaultProps} />, { wrapper: createWrapper() })

    expect(screen.getByText('Generate QR Code')).toBeInTheDocument()
  })

  it('shows pay button for credit card', async () => {
    const user = userEvent.setup()
    render(<CheckoutForm {...defaultProps} />, { wrapper: createWrapper() })

    const creditCardButton = screen.getByText('Credit Card').closest('button')
    await user.click(creditCardButton!)

    expect(screen.getByText('Pay 4,900 THB')).toBeInTheDocument()
  })

  it('displays security notice', () => {
    render(<CheckoutForm {...defaultProps} />, { wrapper: createWrapper() })

    expect(screen.getByText('Secured by Omise/Opn Payments')).toBeInTheDocument()
  })

  it('disables button while processing', () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { useCreateCheckoutSession } = jest.requireMock('@/hooks/useBilling') as {
      useCreateCheckoutSession: jest.Mock
    }
    useCreateCheckoutSession.mockReturnValue({
      mutateAsync: jest.fn(),
      isPending: true,
    })

    render(<CheckoutForm {...defaultProps} />, { wrapper: createWrapper() })

    const submitButton = screen.getByRole('button', { name: /processing/i })
    expect(submitButton).toBeDisabled()
  })

  it('calculates total correctly for annual billing', () => {
    render(<CheckoutForm {...defaultProps} billingCycle="annual" />, {
      wrapper: createWrapper(),
    })

    expect(screen.getByText('Total')).toBeInTheDocument()
    expect(screen.getByText('47,040 THB')).toBeInTheDocument()
  })

  it('shows order summary with billing cycle', () => {
    render(<CheckoutForm {...defaultProps} billingCycle="annual" />, {
      wrapper: createWrapper(),
    })

    expect(screen.getByText('Pro Plan')).toBeInTheDocument()
    expect(screen.getByText('Annual')).toBeInTheDocument()
    expect(screen.getByText('Total')).toBeInTheDocument()
  })
})
