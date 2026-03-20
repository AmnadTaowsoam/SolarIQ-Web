/**
 * LIFF Context Provider
 * Manages LIFF SDK initialization and authentication state
 */

'use client'

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react'
import {
  initLIFF,
  getProfile,
  isLoggedIn,
  login,
  logout,
  getAccessToken,
  isInLINEApp,
  type LIFFProfile,
} from '../lib/liff'

export interface LIFFUser {
  userId: string
  displayName: string
  pictureUrl?: string
  email?: string
  accessToken: string | null
}

export interface LIFFState {
  isInitialized: boolean
  isLoading: boolean
  isLoggedIn: boolean
  isInLINE: boolean
  user: LIFFUser | null
  error: Error | null
}

export interface LIFFContextValue extends LIFFState {
  login: (redirectUri?: string) => Promise<void>
  logout: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const LIFFContext = createContext<LIFFContextValue | null>(null)

interface LIFFProviderProps {
  liffId: string
  children: React.ReactNode
}

export function LIFFProvider({ liffId, children }: LIFFProviderProps): React.ReactElement {
  const [state, setState] = useState<LIFFState>({
    isInitialized: false,
    isLoading: true,
    isLoggedIn: false,
    isInLINE: false,
    user: null,
    error: null,
  })

  const fetchUserProfile = useCallback(async (): Promise<LIFFUser | null> => {
    try {
      const profile: LIFFProfile = await getProfile()
      const accessToken = await getAccessToken()
      
      return {
        userId: profile.userId,
        displayName: profile.displayName,
        pictureUrl: profile.pictureUrl,
        email: profile.email,
        accessToken,
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error)
      return null
    }
  }, [])

  const refreshProfile = useCallback(async (): Promise<void> => {
    const loggedIn = await isLoggedIn()
    if (loggedIn) {
      const user = await fetchUserProfile()
      setState(prev => ({ ...prev, isLoggedIn: true, user }))
    } else {
      setState(prev => ({ ...prev, isLoggedIn: false, user: null }))
    }
  }, [fetchUserProfile])

  // Initialize LIFF SDK
  useEffect(() => {
    let mounted = true

    const initialize = async (): Promise<void> => {
      try {
        await initLIFF(liffId)
        
        if (!mounted) return

        const inLINE = await isInLINEApp()
        const loggedIn = await isLoggedIn()

        if (loggedIn) {
          const user = await fetchUserProfile()
          setState({
            isInitialized: true,
            isLoading: false,
            isLoggedIn: true,
            isInLINE: inLINE,
            user,
            error: null,
          })
        } else {
          setState({
            isInitialized: true,
            isLoading: false,
            isLoggedIn: false,
            isInLINE: inLINE,
            user: null,
            error: null,
          })
        }
      } catch (error) {
        if (!mounted) return
        setState(prev => ({
          ...prev,
          isInitialized: false,
          isLoading: false,
          error: error instanceof Error ? error : new Error('LIFF initialization failed'),
        }))
      }
    }

    initialize()

    return () => {
      mounted = false
    }
  }, [liffId, fetchUserProfile])

  const handleLogin = useCallback(async (redirectUri?: string): Promise<void> => {
    setState(prev => ({ ...prev, isLoading: true }))
    await login(redirectUri)
    // After login, page will redirect, so loading state will be reset on new page load
  }, [])

  const handleLogout = useCallback(async (): Promise<void> => {
    await logout()
    setState(prev => ({
      ...prev,
      isLoggedIn: false,
      user: null,
    }))
  }, [])

  const contextValue = useMemo<LIFFContextValue>(() => ({
    ...state,
    login: handleLogin,
    logout: handleLogout,
    refreshProfile,
  }), [state, handleLogin, handleLogout, refreshProfile])

  return (
    <LIFFContext.Provider value={contextValue}>
      {children}
    </LIFFContext.Provider>
  )
}

export function useLIFF(): LIFFContextValue {
  const context = useContext(LIFFContext)
  if (!context) {
    throw new Error('useLIFF must be used within a LIFFProvider')
  }
  return context
}

export function useLIFFUser(): LIFFUser | null {
  const { user } = useLIFF()
  return user
}

export function useIsInLINE(): boolean {
  const { isInLINE } = useLIFF()
  return isInLINE
}
