'use client'

import { useState, useEffect, useCallback } from 'react'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PushSubscriptionRecord {
  id: string
  userId: string
  endpoint: string
  keys_p256dh: string
  keys_auth: string
  user_agent?: string
  createdAt?: string
  lastUsedAt?: string
}

export interface NotificationPreferences {
  leads: boolean
  deals: boolean
  messages: boolean
  systemAlerts: boolean
  marketing: boolean
}

const DEFAULT_PREFERENCES: NotificationPreferences = {
  leads: true,
  deals: true,
  messages: true,
  systemAlerts: true,
  marketing: false,
}

const PREFERENCES_KEY = 'solariq:notification_preferences'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)))
}

function isPushSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  )
}

// ---------------------------------------------------------------------------
// Hook: useWebPushSubscription
// ---------------------------------------------------------------------------

interface UseWebPushSubscriptionReturn {
  isSupported: boolean
  subscription: PushSubscription | null
  isLoading: boolean
  error: string | null
  subscribe: () => Promise<PushSubscription | null>
  unsubscribe: () => Promise<boolean>
}

export function useWebPushSubscription(): UseWebPushSubscriptionReturn {
  const [isSupported] = useState<boolean>(isPushSupported)
  const [subscription, setSubscription] = useState<PushSubscription | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  // Read existing subscription on mount
  useEffect(() => {
    if (!isSupported) return

    let cancelled = false

    navigator.serviceWorker.ready
      .then((registration) => {
        return registration.pushManager.getSubscription()
      })
      .then((existing) => {
        if (!cancelled) setSubscription(existing)
      })
      .catch((err) => {
        if (!cancelled) setError(String(err))
      })

    return () => {
      cancelled = true
    }
  }, [isSupported])

  const subscribe = useCallback(async (): Promise<PushSubscription | null> => {
    if (!isSupported) {
      setError('Push notifications are not supported in this browser.')
      return null
    }

    setIsLoading(true)
    setError(null)

    try {
      const registration = await navigator.serviceWorker.ready

      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      if (!vapidKey) {
        throw new Error('VAPID public key is not configured.')
      }

      const applicationServerKey = urlBase64ToUint8Array(vapidKey)

      const pushSubscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey,
      })

      setSubscription(pushSubscription)
      return pushSubscription
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      setError(message)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [isSupported])

  const unsubscribe = useCallback(async (): Promise<boolean> => {
    if (!subscription) return false

    setIsLoading(true)
    setError(null)

    try {
      const success = await subscription.unsubscribe()
      if (success) setSubscription(null)
      return success
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      setError(message)
      return false
    } finally {
      setIsLoading(false)
    }
  }, [subscription])

  return { isSupported, subscription, isLoading, error, subscribe, unsubscribe }
}

// ---------------------------------------------------------------------------
// Hook: usePushPermission
// ---------------------------------------------------------------------------

interface UsePushPermissionReturn {
  permission: NotificationPermission | null
  isSupported: boolean
  isLoading: boolean
  requestPermission: () => Promise<NotificationPermission>
}

export function usePushPermission(): UsePushPermissionReturn {
  const [isSupported] = useState<boolean>(
    () => typeof window !== 'undefined' && 'Notification' in window,
  )
  const [permission, setPermission] = useState<NotificationPermission | null>(
    isSupported ? Notification.permission : null,
  )
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const requestPermission = useCallback(async (): Promise<NotificationPermission> => {
    if (!isSupported) return 'denied'

    setIsLoading(true)
    try {
      const result = await Notification.requestPermission()
      setPermission(result)
      return result
    } finally {
      setIsLoading(false)
    }
  }, [isSupported])

  return { permission, isSupported, isLoading, requestPermission }
}

// ---------------------------------------------------------------------------
// Hook: useNotificationPreferences
// ---------------------------------------------------------------------------

interface UseNotificationPreferencesReturn {
  preferences: NotificationPreferences
  isLoading: boolean
  updatePreferences: (updates: Partial<NotificationPreferences>) => void
  resetPreferences: () => void
}

export function useNotificationPreferences(): UseNotificationPreferencesReturn {
  const [preferences, setPreferences] = useState<NotificationPreferences>(DEFAULT_PREFERENCES)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  // Load saved preferences from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(PREFERENCES_KEY)
      if (stored) {
        const parsed = JSON.parse(stored) as Partial<NotificationPreferences>
        setPreferences({ ...DEFAULT_PREFERENCES, ...parsed })
      }
    } catch {
      // If parsing fails, fall back to defaults silently
    } finally {
      setIsLoading(false)
    }
  }, [])

  const updatePreferences = useCallback((updates: Partial<NotificationPreferences>) => {
    setPreferences((prev) => {
      const next = { ...prev, ...updates }
      try {
        localStorage.setItem(PREFERENCES_KEY, JSON.stringify(next))
      } catch {
        // Storage may be unavailable (e.g. private browsing quota)
      }
      return next
    })
  }, [])

  const resetPreferences = useCallback(() => {
    setPreferences(DEFAULT_PREFERENCES)
    try {
      localStorage.removeItem(PREFERENCES_KEY)
    } catch {
      // Ignore storage errors
    }
  }, [])

  return { preferences, isLoading, updatePreferences, resetPreferences }
}

// ---------------------------------------------------------------------------
// Convenience re-export: usePushNotifications (combined)
// ---------------------------------------------------------------------------

interface UsePushNotificationsReturn
  extends UseWebPushSubscriptionReturn,
    UsePushPermissionReturn {
  preferences: NotificationPreferences
  updatePreferences: (updates: Partial<NotificationPreferences>) => void
}

export function usePushNotifications(): UsePushNotificationsReturn {
  const push = useWebPushSubscription()
  const perm = usePushPermission()
  const { preferences, updatePreferences } = useNotificationPreferences()

  return {
    // from useWebPushSubscription
    isSupported: push.isSupported,
    subscription: push.subscription,
    subscribe: push.subscribe,
    unsubscribe: push.unsubscribe,
    // from usePushPermission (overrides isSupported from push with logical AND)
    permission: perm.permission,
    requestPermission: perm.requestPermission,
    // shared
    isLoading: push.isLoading || perm.isLoading,
    error: push.error,
    // preferences
    preferences,
    updatePreferences,
  }
}
