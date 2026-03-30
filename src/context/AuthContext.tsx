'use client'

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react'
import { getIdToken, onIdTokenChanged, signOut, User as FirebaseUser } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { User } from '@/types'
import { api, setTokens, clearTokens } from '@/lib/api'
import { clearAuthData } from '@/lib/security'

interface AuthContextType {
  user: User | null
  firebaseUser: FirebaseUser | null
  isLoading: boolean
  isAuthenticated: boolean
  isDevLoginEnabled: boolean
  loginWithDevCredentials: (email: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

/**
 * Set a cookie that middleware can read to check auth state.
 * This is a lightweight session indicator — not a security token.
 */
function setSessionCookie(loggedIn: boolean, role?: string) {
  if (typeof document === 'undefined') {
    return
  }

  // Use Secure flag in production (HTTPS)
  const isSecure = window.location.protocol === 'https:' ? '; Secure' : ''

  if (loggedIn) {
    document.cookie = `__session=1; path=/; max-age=${60 * 30}; SameSite=Lax${isSecure}` // 30 minutes
    if (role) {
      document.cookie = `user-role=${role}; path=/; max-age=${60 * 30}; SameSite=Lax${isSecure}`
    }
  } else {
    document.cookie = '__session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
    document.cookie = 'user-role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
  }
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const isDevLoginEnabled = process.env.NEXT_PUBLIC_ENABLE_DEV_LOGIN === 'true'
  const devLoginEmail = (process.env.NEXT_PUBLIC_DEV_LOGIN_EMAIL || '').trim().toLowerCase()
  const devLoginPassword = process.env.NEXT_PUBLIC_DEV_LOGIN_PASSWORD || ''
  const devLoginRole =
    process.env.NEXT_PUBLIC_DEV_LOGIN_ROLE === 'contractor' ? 'contractor' : 'admin'
  const devAuthStorageKey = 'solariq_dev_auth_user'

  const loginWithDevCredentials = useCallback(
    async (email: string, password: string): Promise<boolean> => {
      if (!isDevLoginEnabled) {
        return false
      }

      const normalizedEmail = email.trim().toLowerCase()
      const normalizedPassword = password.trim()
      if (!devLoginEmail || !devLoginPassword) {
        return false
      }

      if (normalizedEmail !== devLoginEmail || normalizedPassword !== devLoginPassword) {
        return false
      }

      const now = new Date().toISOString()
      const devUser: User = {
        uid: `dev-${devLoginRole}-user`,
        email: normalizedEmail,
        displayName: 'SolarIQ Dev User',
        role: devLoginRole,
        createdAt: now,
        lastLoginAt: now,
      }

      setUser(devUser)
      setFirebaseUser({
        uid: devUser.uid,
        email: devUser.email,
        displayName: devUser.displayName,
      } as FirebaseUser)
      setSessionCookie(true, devUser.role)
      if (typeof window !== 'undefined') {
        localStorage.setItem(devAuthStorageKey, JSON.stringify(devUser))
      }
      return true
    },
    [devLoginEmail, devLoginPassword, devLoginRole, isDevLoginEnabled]
  )

  const logout = useCallback(async () => {
    try {
      await signOut(auth)
    } catch {
      // Firebase signOut failed, but we still clear local state
    } finally {
      // Always clear local state regardless of Firebase result
      setUser(null)
      setFirebaseUser(null)
      setSessionCookie(false)
      clearTokens()
      clearAuthData()
      if (typeof window !== 'undefined') {
        localStorage.removeItem(devAuthStorageKey)
      }
      // Use full page navigation for reliable redirect (router.push can be unreliable during state teardown)
      if (typeof window !== 'undefined') {
        window.location.href = '/login'
      }
    }
  }, [devAuthStorageKey])

  // Inactivity timeout (30 minutes)
  useEffect(() => {
    let timeoutId: NodeJS.Timeout

    const resetTimeout = () => {
      clearTimeout(timeoutId)
      // Only set timeout if user is authenticated
      if (firebaseUser) {
        timeoutId = setTimeout(
          () => {
            logout()
          },
          30 * 60 * 1000
        ) // 30 minutes
      }
    }

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart']
    events.forEach((event) => document.addEventListener(event, resetTimeout))

    resetTimeout()

    return () => {
      clearTimeout(timeoutId)
      events.forEach((event) => document.removeEventListener(event, resetTimeout))
    }
  }, [firebaseUser, logout])

  useEffect(() => {
    if (isDevLoginEnabled) {
      if (typeof window !== 'undefined') {
        const storedUser = localStorage.getItem(devAuthStorageKey)
        if (storedUser) {
          try {
            const parsed = JSON.parse(storedUser) as User
            setUser(parsed)
            setFirebaseUser({
              uid: parsed.uid,
              email: parsed.email,
              displayName: parsed.displayName,
            } as FirebaseUser)
            setSessionCookie(true, parsed.role)
          } catch {
            localStorage.removeItem(devAuthStorageKey)
          }
        }
      }
      setIsLoading(false)
      return
    }

    let isMounted = true
    let unsubscribe: () => void = () => undefined

    // Prevent infinite loading if Firebase listener cannot initialize.
    const loadingTimeout = setTimeout(() => {
      if (!isMounted) {
        return
      }
      setUser(null)
      setFirebaseUser(null)
      setSessionCookie(false)
      setIsLoading(false)
    }, 5000)

    try {
      unsubscribe = onIdTokenChanged(
        auth,
        async (fbUser) => {
          if (!isMounted) {
            return
          }

          setFirebaseUser(fbUser)

          if (fbUser) {
            // Clear loading timeout immediately — Firebase has responded
            clearTimeout(loadingTimeout)

            // Set fallback user right away so isAuthenticated becomes true
            // and login page can redirect without waiting for backend API
            const fallbackUser: User = {
              uid: fbUser.uid,
              email: fbUser.email,
              displayName: fbUser.displayName,
              role: 'contractor',
              createdAt: new Date().toISOString(),
              lastLoginAt: new Date().toISOString(),
            }
            setUser(fallbackUser)
            setSessionCookie(true, fallbackUser.role)
            setIsLoading(false)

            try {
              // Exchange Firebase token for JWT (non-blocking for redirect)
              const firebaseToken = await getIdToken(fbUser, false)
              const loginRaw = await api.post('/auth/login', { firebase_id_token: firebaseToken })
              const loginData = loginRaw?.data ?? loginRaw

              if (!isMounted) {
                return
              }
              if (loginData?.access_token) {
                setTokens(loginData.access_token, loginData.refresh_token)
              }

              // Fetch full user profile using JWT
              const profileRaw = await api.get('/api/v1/auth/me')
              const profileData = profileRaw?.data ?? profileRaw
              if (!isMounted) {
                return
              }
              const userData = profileData?.user ?? profileData
              // eslint-disable-next-line no-console
              console.log('[AuthContext] Login success, role:', userData?.role, 'user:', userData)
              setUser(userData)
              setSessionCookie(true, userData?.role || 'contractor')
            } catch (authError) {
              // Backend API failed — fallback user is already set, just log
              // eslint-disable-next-line no-console
              console.warn('[AuthContext] Backend sync failed, using Firebase fallback:', authError)
            }
          } else {
            setUser(null)
            setSessionCookie(false)
            clearTimeout(loadingTimeout)
            setIsLoading(false)
          }
        },
        () => {
          if (!isMounted) {
            return
          }
          clearTimeout(loadingTimeout)
          setUser(null)
          setFirebaseUser(null)
          setSessionCookie(false)
          setIsLoading(false)
        }
      )
    } catch {
      clearTimeout(loadingTimeout)
      if (isMounted) {
        setUser(null)
        setFirebaseUser(null)
        setSessionCookie(false)
        setIsLoading(false)
      }
    }

    return () => {
      isMounted = false
      clearTimeout(loadingTimeout)
      unsubscribe()
    }
  }, [devAuthStorageKey, isDevLoginEnabled])

  const value: AuthContextType = {
    user,
    firebaseUser,
    isLoading,
    isAuthenticated: !!firebaseUser,
    isDevLoginEnabled,
    loginWithDevCredentials,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
