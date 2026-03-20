import { render, screen, fireEvent } from '@testing-library/react'
import { Sidebar } from '@/components/layout/Sidebar'
import { User } from '@/types'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(() => '/dashboard'),
}))

const mockUser: User = {
  uid: '1',
  email: 'test@example.com',
  displayName: 'Test User',
  role: 'admin',
  createdAt: '2024-01-01',
  lastLoginAt: '2024-01-01',
}

const contractorUser: User = {
  ...mockUser,
  role: 'contractor',
}

describe('Sidebar', () => {
  it('renders nav items for admin', () => {
    render(<Sidebar user={mockUser} isOpen={true} onClose={jest.fn()} />)
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Leads')).toBeInTheDocument()
    expect(screen.getByText('Solar Analysis')).toBeInTheDocument()
    expect(screen.getByText('Knowledge Base')).toBeInTheDocument()
    expect(screen.getByText('Pricing')).toBeInTheDocument()
  })

  it('hides admin-only items for contractors', () => {
    render(<Sidebar user={contractorUser} isOpen={true} onClose={jest.fn()} />)
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.queryByText('Knowledge Base')).not.toBeInTheDocument()
    expect(screen.queryByText('Pricing')).not.toBeInTheDocument()
  })

  it('displays user info', () => {
    render(<Sidebar user={mockUser} isOpen={true} onClose={jest.fn()} />)
    expect(screen.getByText('Test User')).toBeInTheDocument()
    expect(screen.getByText('test@example.com')).toBeInTheDocument()
  })

  it('calls onClose when close button is clicked', () => {
    const onClose = jest.fn()
    render(<Sidebar user={mockUser} isOpen={true} onClose={onClose} />)
    fireEvent.click(screen.getByLabelText('Close sidebar'))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when overlay is clicked', () => {
    const onClose = jest.fn()
    const { container } = render(<Sidebar user={mockUser} isOpen={true} onClose={onClose} />)
    const overlay = container.querySelector('.fixed.inset-0.bg-black')
    if (overlay) fireEvent.click(overlay)
    expect(onClose).toHaveBeenCalled()
  })

  it('hides sidebar when closed', () => {
    const { container } = render(<Sidebar user={mockUser} isOpen={false} onClose={jest.fn()} />)
    const sidebar = container.querySelector('aside')
    expect(sidebar).toHaveClass('-translate-x-full')
  })

  it('shows sidebar when open', () => {
    const { container } = render(<Sidebar user={mockUser} isOpen={true} onClose={jest.fn()} />)
    const sidebar = container.querySelector('aside')
    expect(sidebar).toHaveClass('translate-x-0')
  })

  it('renders without user info when user is null', () => {
    render(<Sidebar user={null} isOpen={true} onClose={jest.fn()} />)
    expect(screen.queryByText('Test User')).not.toBeInTheDocument()
  })
})
