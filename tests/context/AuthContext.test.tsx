import { render, screen, waitFor, act } from '@testing-library/react'
import { AuthProvider, useAuth } from '@/context/AuthContext'
import { auth } from '@/lib/firebase'
import { onAuthStateChanged } from 'firebase/auth'

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({ replace: jest.fn(), push: jest.fn() })),
}))

jest.mock('@/lib/firebase', () => ({
  auth: {
    signOut: jest.fn(),
  },
}))

jest.mock('firebase/auth', () => ({
  onAuthStateChanged: jest.fn(),
  signOut: jest.fn(),
}))

const TestComponent = () => {
  const { user, isLoading, login, logout } = useAuth()
  if (isLoading) return <div>Loading...</div>
  if (!user) return <div>Not logged in</div>
  return (
    <div>
      <div>User: {user.email}</div>
      <button onClick={logout}>Logout</button>
    </div>
  )
}

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders loading state initially', () => {
    ;(onAuthStateChanged as jest.Mock).mockImplementation(() => () => {})
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('provides user context when authenticated', async () => {
    ;(onAuthStateChanged as jest.Mock).mockImplementation((auth, callback) => {
      callback({ uid: '123', email: 'test@example.com' })
      return () => {}
    })

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('User: test@example.com')).toBeInTheDocument()
    })
  })

  it('provides null user when not authenticated', async () => {
    ;(onAuthStateChanged as jest.Mock).mockImplementation((auth, callback) => {
      callback(null)
      return () => {}
    })

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('Not logged in')).toBeInTheDocument()
    })
  })
})
