/**
 * Tests for LIFF Context Provider
 */

import React from 'react'
import { render, screen, waitFor, act } from '@testing-library/react'
import { LIFFProvider, useLIFF, useLIFFUser, useIsInLINE } from '../../src/context/LIFFContext'

// Mock the LIFF library
jest.mock('../../src/lib/liff', () => ({
  initLIFF: jest.fn(),
  getProfile: jest.fn(),
  isLoggedIn: jest.fn(),
  login: jest.fn(),
  logout: jest.fn(),
  getAccessToken: jest.fn(),
  isInLINEApp: jest.fn(),
}))

const mockLiff = jest.requireMock('../../src/lib/liff')

// Test component that uses the context
function TestComponent(): React.ReactElement {
  const { isInitialized, isLoading, isLoggedIn, isInLINE, user, error, login, logout } = useLIFF()
  
  return (
    <div>
      <span data-testid="initialized">{isInitialized.toString()}</span>
      <span data-testid="loading">{isLoading.toString()}</span>
      <span data-testid="loggedIn">{isLoggedIn.toString()}</span>
      <span data-testid="inLine">{isInLINE.toString()}</span>
      <span data-testid="user">{user?.displayName || 'null'}</span>
      <span data-testid="error">{error?.message || 'null'}</span>
      <button onClick={() => login()} data-testid="login-btn">Login</button>
      <button onClick={() => logout()} data-testid="logout-btn">Logout</button>
    </div>
  )
}

function TestUserComponent(): React.ReactElement {
  const user = useLIFFUser()
  return <span data-testid="user-only">{user?.displayName || 'null'}</span>
}

function TestInLineComponent(): React.ReactElement {
  const isInLINE = useIsInLINE()
  return <span data-testid="inline-only">{isInLINE.toString()}</span>
}

describe('LIFFProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render children while loading', async () => {
    mockLiff.initLIFF.mockImplementation(() => new Promise(() => {})) // Never resolves
    
    render(
      <LIFFProvider liffId="test-liff-id">
        <TestComponent />
      </LIFFProvider>
    )
    
    expect(screen.getByTestId('loading')).toHaveTextContent('true')
    expect(screen.getByTestId('initialized')).toHaveTextContent('false')
  })

  it('should initialize LIFF and set initialized state', async () => {
    mockLiff.initLIFF.mockResolvedValue(undefined)
    mockLiff.isInLINEApp.mockResolvedValue(false)
    mockLiff.isLoggedIn.mockResolvedValue(false)
    
    render(
      <LIFFProvider liffId="test-liff-id">
        <TestComponent />
      </LIFFProvider>
    )
    
    await waitFor(() => {
      expect(screen.getByTestId('initialized')).toHaveTextContent('true')
    })
    expect(screen.getByTestId('loading')).toHaveTextContent('false')
    expect(mockLiff.initLIFF).toHaveBeenCalledWith('test-liff-id')
  })

  it('should detect when user is in LINE app', async () => {
    mockLiff.initLIFF.mockResolvedValue(undefined)
    mockLiff.isInLINEApp.mockResolvedValue(true)
    mockLiff.isLoggedIn.mockResolvedValue(false)
    
    render(
      <LIFFProvider liffId="test-liff-id">
        <TestComponent />
      </LIFFProvider>
    )
    
    await waitFor(() => {
      expect(screen.getByTestId('inLine')).toHaveTextContent('true')
    })
  })

  it('should fetch user profile when logged in', async () => {
    mockLiff.initLIFF.mockResolvedValue(undefined)
    mockLiff.isInLINEApp.mockResolvedValue(true)
    mockLiff.isLoggedIn.mockResolvedValue(true)
    mockLiff.getProfile.mockResolvedValue({
      userId: 'U123',
      displayName: 'Test User',
      pictureUrl: 'https://example.com/pic.jpg',
    })
    mockLiff.getAccessToken.mockResolvedValue('test-token')
    
    render(
      <LIFFProvider liffId="test-liff-id">
        <TestComponent />
      </LIFFProvider>
    )
    
    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('Test User')
    })
    expect(screen.getByTestId('loggedIn')).toHaveTextContent('true')
  })

  it('should handle initialization error', async () => {
    mockLiff.initLIFF.mockRejectedValue(new Error('Init failed'))
    
    render(
      <LIFFProvider liffId="test-liff-id">
        <TestComponent />
      </LIFFProvider>
    )
    
    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('Init failed')
    })
    expect(screen.getByTestId('initialized')).toHaveTextContent('false')
  })

  it('should call login function', async () => {
    mockLiff.initLIFF.mockResolvedValue(undefined)
    mockLiff.isInLINEApp.mockResolvedValue(false)
    mockLiff.isLoggedIn.mockResolvedValue(false)
    mockLiff.login.mockResolvedValue(undefined)
    
    render(
      <LIFFProvider liffId="test-liff-id">
        <TestComponent />
      </LIFFProvider>
    )
    
    await waitFor(() => {
      expect(screen.getByTestId('initialized')).toHaveTextContent('true')
    })
    
    await act(async () => {
      screen.getByTestId('login-btn').click()
    })
    
    expect(mockLiff.login).toHaveBeenCalled()
  })

  it('should call logout function', async () => {
    mockLiff.initLIFF.mockResolvedValue(undefined)
    mockLiff.isInLINEApp.mockResolvedValue(false)
    mockLiff.isLoggedIn.mockResolvedValue(true)
    mockLiff.getProfile.mockResolvedValue({
      userId: 'U123',
      displayName: 'Test User',
    })
    mockLiff.getAccessToken.mockResolvedValue('test-token')
    mockLiff.logout.mockResolvedValue(undefined)
    
    render(
      <LIFFProvider liffId="test-liff-id">
        <TestComponent />
      </LIFFProvider>
    )
    
    await waitFor(() => {
      expect(screen.getByTestId('loggedIn')).toHaveTextContent('true')
    })
    
    await act(async () => {
      screen.getByTestId('logout-btn').click()
    })
    
    expect(mockLiff.logout).toHaveBeenCalled()
  })
})

describe('useLIFFUser hook', () => {
  it('should return user from context', async () => {
    mockLiff.initLIFF.mockResolvedValue(undefined)
    mockLiff.isInLINEApp.mockResolvedValue(true)
    mockLiff.isLoggedIn.mockResolvedValue(true)
    mockLiff.getProfile.mockResolvedValue({
      userId: 'U123',
      displayName: 'Hook User',
    })
    mockLiff.getAccessToken.mockResolvedValue('test-token')
    
    render(
      <LIFFProvider liffId="test-liff-id">
        <TestUserComponent />
      </LIFFProvider>
    )
    
    await waitFor(() => {
      expect(screen.getByTestId('user-only')).toHaveTextContent('Hook User')
    })
  })
})

describe('useIsInLINE hook', () => {
  it('should return isInLINE from context', async () => {
    mockLiff.initLIFF.mockResolvedValue(undefined)
    mockLiff.isInLINEApp.mockResolvedValue(true)
    mockLiff.isLoggedIn.mockResolvedValue(false)
    
    render(
      <LIFFProvider liffId="test-liff-id">
        <TestInLineComponent />
      </LIFFProvider>
    )
    
    await waitFor(() => {
      expect(screen.getByTestId('inline-only')).toHaveTextContent('true')
    })
  })
})

describe('useLIFF outside provider', () => {
  it('should throw error when used outside provider', () => {
    // Suppress console.error for this test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    
    expect(() => {
      render(<TestComponent />)
    }).toThrow('useLIFF must be used within a LIFFProvider')
    
    consoleSpy.mockRestore()
  })
})
