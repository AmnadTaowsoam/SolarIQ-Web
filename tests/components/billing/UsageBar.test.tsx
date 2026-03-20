import { render, screen } from '@testing-library/react'
import { UsageBar } from '@/components/billing/UsageBar'

describe('UsageBar', () => {
  it('renders usage progress bar with label', () => {
    render(<UsageBar label="Leads" current={45} limit={100} />)

    expect(screen.getByText('Leads')).toBeInTheDocument()
    expect(screen.getByText(/45/)).toBeInTheDocument()
    expect(screen.getByText(/100/)).toBeInTheDocument()
  })

  it('shows green bar when usage < 70%', () => {
    const { container } = render(<UsageBar label="Leads" current={30} limit={100} />)

    // The progress bar should have green color class
    const progressBar = container.querySelector('.bg-green-500')
    expect(progressBar).toBeInTheDocument()

    // Background should also be green
    const bgBar = container.querySelector('.bg-green-100')
    expect(bgBar).toBeInTheDocument()
  })

  it('shows yellow bar when usage is 70-90%', () => {
    const { container } = render(<UsageBar label="Leads" current={80} limit={100} />)

    const progressBar = container.querySelector('.bg-yellow-500')
    expect(progressBar).toBeInTheDocument()

    const bgBar = container.querySelector('.bg-yellow-100')
    expect(bgBar).toBeInTheDocument()
  })

  it('shows red bar when usage > 90%', () => {
    const { container } = render(<UsageBar label="Leads" current={95} limit={100} />)

    const progressBar = container.querySelector('.bg-red-500')
    expect(progressBar).toBeInTheDocument()

    const bgBar = container.querySelector('.bg-red-100')
    expect(bgBar).toBeInTheDocument()
  })

  it('shows "Unlimited" text for enterprise (null limit)', () => {
    render(<UsageBar label="Leads" current={500} limit={null} />)

    expect(screen.getByText(/ไม่จำกัด/)).toBeInTheDocument()
  })

  it('renders purple bar for unlimited usage', () => {
    const { container } = render(<UsageBar label="Leads" current={500} limit={null} />)

    const progressBar = container.querySelector('.bg-purple-400')
    expect(progressBar).toBeInTheDocument()
  })

  it('shows percentage text for limited usage', () => {
    render(<UsageBar label="Leads" current={45} limit={100} />)

    expect(screen.getByText('45%')).toBeInTheDocument()
  })

  it('does not show percentage text for unlimited usage', () => {
    render(<UsageBar label="Leads" current={500} limit={null} />)

    expect(screen.queryByText('%')).not.toBeInTheDocument()
  })

  it('caps percentage at 100%', () => {
    render(<UsageBar label="Leads" current={150} limit={100} />)

    expect(screen.getByText('100%')).toBeInTheDocument()
  })

  it('uses pre-calculated percentage when provided', () => {
    render(<UsageBar label="Leads" current={45} limit={100} percentage={75} />)

    expect(screen.getByText('75%')).toBeInTheDocument()
  })

  it('renders with zero usage', () => {
    render(<UsageBar label="Leads" current={0} limit={100} />)

    expect(screen.getByText('0%')).toBeInTheDocument()
  })
})
