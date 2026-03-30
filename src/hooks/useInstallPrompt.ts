'use client'

import { useState, useEffect, useCallback } from 'react'

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

interface UseInstallPromptReturn {
  canInstall: boolean
  isInstalled: boolean
  isPromptDismissed: boolean
  install: () => Promise<boolean>
  dismissPrompt: () => void
  resetDismissal: () => void
}

const DISMISSAL_STORAGE_KEY = 'solariq_pwa_dismissed'
const DISMISSAL_DURATION_DAYS = 7
const VISIT_COUNT_KEY = 'solariq_visit_count'
const MIN_VISITS_BEFORE_PROMPT = 2

export function useInstallPrompt(): UseInstallPromptReturn {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isPromptDismissed, setIsPromptDismissed] = useState(false)
  const [visitCount, setVisitCount] = useState(0)

  // Check if app is already installed
  useEffect(() => {
    // Check if running in standalone mode (installed PWA)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
    // @ts-expect-error - iOS Safari specific property
    const isIOSStandalone = window.navigator.standalone === true
    setIsInstalled(isStandalone || isIOSStandalone)

    // Load visit count
    const storedVisits = localStorage.getItem(VISIT_COUNT_KEY)
    const count = storedVisits ? parseInt(storedVisits, 10) + 1 : 1
    localStorage.setItem(VISIT_COUNT_KEY, count.toString())
    setVisitCount(count)

    // Check dismissal status
    const dismissedAt = localStorage.getItem(DISMISSAL_STORAGE_KEY)
    if (dismissedAt) {
      const dismissedDate = new Date(parseInt(dismissedAt, 10))
      const daysSinceDismissal = (Date.now() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24)
      if (daysSinceDismissal < DISMISSAL_DURATION_DAYS) {
        setIsPromptDismissed(true)
      } else {
        // Reset dismissal after 7 days
        localStorage.removeItem(DISMISSAL_STORAGE_KEY)
        setIsPromptDismissed(false)
      }
    }
  }, [])

  // Listen for beforeinstallprompt event
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
    }

    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  // Listen for app installed event
  useEffect(() => {
    const handler = () => {
      setIsInstalled(true)
      setDeferredPrompt(null)
    }

    window.addEventListener('appinstalled', handler)
    return () => window.removeEventListener('appinstalled', handler)
  }, [])

  const install = useCallback(async (): Promise<boolean> => {
    if (!deferredPrompt) {
      return false
    }

    try {
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice

      if (outcome === 'accepted') {
        setDeferredPrompt(null)
        return true
      }

      return false
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Install prompt error:', error)
      return false
    }
  }, [deferredPrompt])

  const dismissPrompt = useCallback(() => {
    localStorage.setItem(DISMISSAL_STORAGE_KEY, Date.now().toString())
    setIsPromptDismissed(true)
  }, [])

  const resetDismissal = useCallback(() => {
    localStorage.removeItem(DISMISSAL_STORAGE_KEY)
    setIsPromptDismissed(false)
  }, [])

  // Only show prompt if:
  // 1. App is not already installed
  // 2. We have a deferred prompt (browser supports install)
  // 3. User hasn't dismissed recently
  // 4. User has visited at least MIN_VISITS_BEFORE_PROMPT times
  const canInstall =
    !isInstalled && !!deferredPrompt && !isPromptDismissed && visitCount >= MIN_VISITS_BEFORE_PROMPT

  return {
    canInstall,
    isInstalled,
    isPromptDismissed,
    install,
    dismissPrompt,
    resetDismissal,
  }
}
