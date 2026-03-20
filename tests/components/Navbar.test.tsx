import { render, screen, fireEvent } from '@testing-library/react'
import { Navbar } from '@/components/layout/Navbar'
import { User } from '@/types'

// Mock next/navigation
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

// Mock firebase
jest.mock('@/lib/firebase', () => ({
  auth: {},
}))

jest.mock('firebase/auth', () => ({
  signOut: jest.fn().mockResolvedValue(undefined),
}))

const mockUser: User = {
  uid: '1',
  email: 'admin@example.com',
  displayName: 'Admin User',
  role: 'admin',
  createdAt: '2024-01-01',
  lastLoginAt: '2024-01-01',
}

describe('Navbar', () => {
  beforeEach(() => jest.clearAllMocks())

  it('renders with user info', () => {
    render(<Navbar user={mockUser} onMenuClick={jest.fn()} />)
    expect(screen.getByText('A')).toBeInTheDocument() // First char of displayName
  })

  it('calls onMenuClick when menu button is clicked', () => {
    const onMenuClick = jest.fn()
    render(<Navbar user={mockUser} onMenuClick={onMenuClick} />)
    fireEvent.click(screen.getByLabelText('Open menu'))
    expect(onMenuClick).toHaveBeenCalledTimes(1)
  })

  it('toggles user dropdown', () => {
    render(<Navbar user={mockUser} onMenuClick={jest.fn()} />)
    expect(screen.queryByText('Profile Settings')).not.toBeInTheDocument()

    // Open dropdown
    fireEvent.click(screen.getByRole('button', { expanded: false }))
    expect(screen.getByText('Profile Settings')).toBeInTheDocument()
    expect(screen.getByText('admin@example.com')).toBeInTheDocument()
  })

  it('handles sign out', async () => {
    const { signOut } = require('firebase/auth')
    render(<Navbar user={mockUser} onMenuClick={jest.fn()} />)

    // Open dropdown
    fireEvent.click(screen.getByRole('button', { expanded: false }))

    // Click sign out
    fireEvent.click(screen.getByText('Sign out'))

    expect(signOut).toHaveBeenCalled()
  })

  it('shows fallback initial when no displayName', () => {
    const userNoName: User = { ...mockUser, displayName: null, email: 'test@test.com' }
    render(<Navbar user={userNoName} onMenuClick={jest.fn()} />)
    expect(screen.getByText('t')).toBeInTheDocument() // First char of email
  })

  it('shows U when no displayName and no email', () => {
    const userNone: User = { ...mockUser, displayName: null, email: null }
    render(<Navbar user={userNone} onMenuClick={jest.fn()} />)
    expect(screen.getAllByText('U').length).toBeGreaterThan(0)
  })

  it('has notifications button', () => {
    render(<Navbar user={mockUser} onMenuClick={jest.fn()} />)
    expect(screen.getByLabelText('Notifications')).toBeInTheDocument()
  })
})
