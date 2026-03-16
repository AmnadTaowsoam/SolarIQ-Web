import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LoginPage from '@/app/login/page'
import { useAuth } from '@/context'
import { useRouter } from 'next/navigation'

// Mock dependencies
jest.mock('@/context', () => ({
  useAuth: jest.fn(),
}))

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

jest.mock('@/lib/firebase', () => ({
  auth: {},
}))

jest.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: jest.fn(),
}))

jest.mock('@/components/ui/Toast', () => ({
  useToast: () => ({
    addToast: jest.fn(),
  }),
}))

const mockUseAuth = useAuth as jest.Mock
const mockUseRouter = useRouter as jest.Mock

describe('LoginPage', () => {
  const mockPush = jest.fn()
  const mockReplace = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseRouter.mockReturnValue({
      push: mockPush,
      replace: mockReplace,
    })
  })

  it('renders email and password fields', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
    })

    render(<LoginPage />)

    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
  })

  it('shows validation error on invalid form input', async () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
    })

    render(<LoginPage />)

    const emailInput = screen.getByLabelText(/email address/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i })

    await userEvent.type(emailInput, 'test@example.com')
    await userEvent.type(passwordInput, 'short')
    await userEvent.click(submitButton)

    // Check for validation errors
    await waitFor(() => {
      expect(screen.getByText(/password must be at least 6 characters/i)).toBeInTheDocument()
    })
  })

  it('redirects on successful login', async () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
    })

    // Mock successful login
    const { signInWithEmailAndPassword } = require('firebase/auth')
    signInWithEmailAndPassword.mockResolvedValueOnce({
      user: { uid: 'test-uid', email: 'test@example.com' },
    })

    render(<LoginPage />)

    const emailInput = screen.getByLabelText(/email address/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i })

    await userEvent.type(emailInput, 'test@example.com')
    await userEvent.type(passwordInput, 'password123')
    await userEvent.click(submitButton)

    await waitFor(() => {
      expect(signInWithEmailAndPassword).toHaveBeenCalled()
    })
  })

  it('shows loading state while submitting', async () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
    })

    // Mock pending login
    const { signInWithEmailAndPassword } = require('firebase/auth')
    signInWithEmailAndPassword.mockImplementation(() => new Promise(() => {}))

    render(<LoginPage />)

    const emailInput = screen.getByLabelText(/email address/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i })

    await userEvent.type(emailInput, 'test@example.com')
    await userEvent.type(passwordInput, 'password123')
    await userEvent.click(submitButton)

    // Check for loading spinner
    expect(screen.getByRole('button', { name: /sign in/i })).toBeDisabled()
  })
})
