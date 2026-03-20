import { render, screen, fireEvent } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode } from 'react'
import { SubscriptionCard } from '@/components/billing/SubscriptionCard'
import type { SubscriptionWithPlan } from '@/types/billing'

// Mock dependencies
jest.mock('lucide-react', () => ({
  CalendarDays: () => <svg data-testid="calendar-icon" />,
  CreditCard: () => <svg data-testid="credit-card-icon" />,
  RefreshCw: ({ className }: { className?: string }) => (
    <svg data-testid="refresh-icon" className={className} />
  ),
  XCircle: () => <svg data-testid="x-circle-icon" />,
  ArrowRightCircle: () => <svg data-testid="arrow-icon" />,
}))

jest.mock('@/hooks/useBilling', () => ({
  useResumeSubscription: () => ({
    mutateAsync: jest.fn().mockResolvedValue({}),
    isPending: false,
  }),
}))

jest.mock('@/lib/firebase', () => ({
  auth: { currentUser: null },
}))

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

const baseSubscription: SubscriptionWithPlan = {
  id: 'sub-1',
  organization_id: 'org-1',
  plan_id: 'pro',
  status: 'active',
  payment_provider: 'stripe',
  current_period_start: '2024-01-01T00:00:00Z',
  current_period_end: '2024-02-01T00:00:00Z',
  cancel_at_period_end: false,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  plan: {
    id: 'pro',
    name: 'Pro',
    price_thb: 7900,
    leads_per_month: 100,
    users: 5,
    features: [],
  },
  days_until_period_end: 15,
}

describe('SubscriptionCard', () => {
  const mockOnCancel = jest.fn()
  const mockOnManagePayment = jest.fn()
  const mockOnChangePlan = jest.fn()

  beforeEach(() => jest.clearAllMocks())

  it('renders subscription details', () => {
    render(
      <SubscriptionCard
        subscription={baseSubscription}
        onCancel={mockOnCancel}
        onManagePayment={mockOnManagePayment}
      />,
      { wrapper: createWrapper() }
    )

    expect(screen.getByText('Pro')).toBeInTheDocument()
    expect(screen.getByText(/7,900/)).toBeInTheDocument()
  })

  it('shows correct status badge for active subscription', () => {
    render(
      <SubscriptionCard
        subscription={baseSubscription}
        onCancel={mockOnCancel}
        onManagePayment={mockOnManagePayment}
      />,
      { wrapper: createWrapper() }
    )

    expect(screen.getByText('Active')).toBeInTheDocument()
  })

  it('shows cancel button for active subscription', () => {
    render(
      <SubscriptionCard
        subscription={baseSubscription}
        onCancel={mockOnCancel}
        onManagePayment={mockOnManagePayment}
      />,
      { wrapper: createWrapper() }
    )

    const cancelButton = screen.getByText(/ยกเลิกการสมัคร/)
    expect(cancelButton).toBeInTheDocument()

    fireEvent.click(cancelButton)
    expect(mockOnCancel).toHaveBeenCalled()
  })

  it('shows resume button for canceled subscription with cancel_at_period_end', () => {
    const canceledSub: SubscriptionWithPlan = {
      ...baseSubscription,
      status: 'canceled',
      cancel_at_period_end: true,
    }

    render(
      <SubscriptionCard
        subscription={canceledSub}
        onCancel={mockOnCancel}
        onManagePayment={mockOnManagePayment}
      />,
      { wrapper: createWrapper() }
    )

    expect(screen.getByText(/กลับมาใช้งานต่อ/)).toBeInTheDocument()
  })

  it('does not show cancel button for canceled subscription', () => {
    const canceledSub: SubscriptionWithPlan = {
      ...baseSubscription,
      status: 'canceled',
      cancel_at_period_end: true,
    }

    render(
      <SubscriptionCard
        subscription={canceledSub}
        onCancel={mockOnCancel}
        onManagePayment={mockOnManagePayment}
      />,
      { wrapper: createWrapper() }
    )

    expect(screen.queryByText(/ยกเลิกการสมัคร/)).not.toBeInTheDocument()
  })

  it('shows manage payment button', () => {
    render(
      <SubscriptionCard
        subscription={baseSubscription}
        onCancel={mockOnCancel}
        onManagePayment={mockOnManagePayment}
      />,
      { wrapper: createWrapper() }
    )

    const paymentButton = screen.getByText(/จัดการการชำระเงิน/)
    fireEvent.click(paymentButton)
    expect(mockOnManagePayment).toHaveBeenCalled()
  })

  it('shows change plan button when onChangePlan is provided and subscription is active', () => {
    render(
      <SubscriptionCard
        subscription={baseSubscription}
        onCancel={mockOnCancel}
        onManagePayment={mockOnManagePayment}
        onChangePlan={mockOnChangePlan}
      />,
      { wrapper: createWrapper() }
    )

    const changePlanButton = screen.getByText(/เปลี่ยนแพ็กเกจ/)
    fireEvent.click(changePlanButton)
    expect(mockOnChangePlan).toHaveBeenCalled()
  })

  it('shows cancellation warning banner when cancel_at_period_end is true', () => {
    const cancelingSub: SubscriptionWithPlan = {
      ...baseSubscription,
      cancel_at_period_end: true,
    }

    render(
      <SubscriptionCard
        subscription={cancelingSub}
        onCancel={mockOnCancel}
        onManagePayment={mockOnManagePayment}
      />,
      { wrapper: createWrapper() }
    )

    expect(screen.getByText(/การสมัครสมาชิกของคุณถูกยกเลิกแล้ว/)).toBeInTheDocument()
  })

  it('shows days until period end', () => {
    render(
      <SubscriptionCard
        subscription={baseSubscription}
        onCancel={mockOnCancel}
        onManagePayment={mockOnManagePayment}
      />,
      { wrapper: createWrapper() }
    )

    expect(screen.getByText(/15 วัน/)).toBeInTheDocument()
  })
})
