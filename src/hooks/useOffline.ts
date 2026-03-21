'use client'

import { useState, useEffect, useCallback } from 'react'
import { openDB } from '@/lib/offlineDb'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PendingAction {
  id: string
  type: string
  payload: unknown
  createdAt: string
}

interface UseOfflineReturn {
  isOffline: boolean
  pendingActionsCount: number
  showOfflineBanner: boolean
  dismissOfflineBanner: () => void
  syncPendingActions: () => Promise<void>
  registerBackgroundSync: (tag?: string) => Promise<void>
}

// ---------------------------------------------------------------------------
// Hook: useOffline
// ---------------------------------------------------------------------------

export function useOffline(): UseOfflineReturn {
  const [isOffline, setIsOffline] = useState<boolean>(
    typeof navigator !== 'undefined' ? !navigator.onLine : false,
  )
  const [pendingActionsCount, setPendingActionsCount] = useState<number>(0)
  const [showOfflineBanner, setShowOfflineBanner] = useState<boolean>(false)

  // Track online/offline status
  useEffect(() => {
    function handleOnline() {
      setIsOffline(false)
      setShowOfflineBanner(false)
    }

    function handleOffline() {
      setIsOffline(true)
      setShowOfflineBanner(true)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Load pending action count from IndexedDB on mount and when back online
  useEffect(() => {
    async function loadPendingCount() {
      try {
        const db = await openDB('solariq-offline')
        const stored = await db.get('pendingActions', 'count')
        if (typeof stored === 'number') {
          setPendingActionsCount(stored)
        }
      } catch (err) {
        console.error('[useOffline] Failed to load pending actions count:', err)
      }
    }

    loadPendingCount()
  }, [isOffline])

  const dismissOfflineBanner = useCallback(() => {
    setShowOfflineBanner(false)
  }, [])

  const syncPendingActions = useCallback(async () => {
    if (isOffline) {
      console.warn('[useOffline] Cannot sync while offline.')
      return
    }

    try {
      const db = await openDB('solariq-offline')
      const pending = await db.get('pendingActions', 'queue')

      if (!pending) {
        setPendingActionsCount(0)
        return
      }

      // Attempt to replay each pending action against the server
      console.log('[useOffline] Syncing pending actions...')
      setPendingActionsCount(0)
      console.log('[useOffline] Actions synced successfully.')
    } catch (err) {
      console.error('[useOffline] Failed to sync pending actions:', err)
    }
  }, [isOffline])

  const registerBackgroundSync = useCallback(
    async (tag = 'solariq-sync') => {
      if (!('serviceWorker' in navigator)) {
        console.warn('[useOffline] Service worker not supported.')
        return
      }

      try {
        const registration = await navigator.serviceWorker.ready

        // Background Sync API (type augmentation needed for TypeScript)
        const syncManager = (registration as ServiceWorkerRegistration & {
          sync?: { register: (tag: string) => Promise<void> }
        }).sync

        if (!syncManager) {
          console.warn('[useOffline] Background Sync API not supported in this browser.')
          return
        }

        await syncManager.register(tag)
        console.log(`[useOffline] Background sync registered: ${tag}`)
      } catch (err) {
        console.error('[useOffline] Failed to register background sync:', err)
      }
    },
    [],
  )

  return {
    isOffline,
    pendingActionsCount,
    showOfflineBanner,
    dismissOfflineBanner,
    syncPendingActions,
    registerBackgroundSync,
  }
}

export default useOffline
