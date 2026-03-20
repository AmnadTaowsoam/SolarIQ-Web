import { render, screen, fireEvent } from '@testing-library/react'
import { AppLayout } from '@/components/layout/AppLayout'
import { User } from '@/types'

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(() => '/dashboard'),
  useRouter: () => ({ push: jest.fn() }),
}))

jest.mock('@/lib/firebase', () => ({
  auth: {},
}))

jest.mock('firebase/auth', () => ({
  signOut: jest.fn().mockResolvedValue(undefined),
}))

const mockUser: User = {
  uid: '1',
  email: 'test@test.com',
  displayName: 'Test',
  role: 'admin',
  createdAt: '2024-01-01',
  lastLoginAt: '2024-01-01',
}

describe('AppLayout', () => {
  it('renders children and layout elements', () => {
    render(
      <AppLayout user={mockUser}>
        <div data-testid="content">Page Content</div>
      </AppLayout>
    )
    expect(screen.getByTestId('content')).toBeInTheDocument()
    expect(screen.getByText('Dashboard')).toBeInTheDocument() // From sidebar
  })

  it('toggles sidebar on menu click', () => {
    const { container } = render(
      <AppLayout user={mockUser}>
        <div>Content</div>
      </AppLayout>
    )

    const sidebar = container.querySelector('aside')
    expect(sidebar).toHaveClass('-translate-x-full')

    // Click menu button to open sidebar
    fireEvent.click(screen.getByLabelText('Open menu'))
    expect(sidebar).toHaveClass('translate-x-0')
  })
})
