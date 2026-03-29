'use client'

import { useState, useEffect } from 'react'
import { useInstallPrompt } from '@/hooks/useInstallPrompt'
import { X, Download, Smartphone } from 'lucide-react'
import clsx from 'clsx'

export function InstallBanner() {
  const { canInstall, install, dismissPrompt } = useInstallPrompt()
  const [isVisible, setIsVisible] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // Check if mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    if (canInstall) {
      // Delay showing banner for better UX
      const timer = setTimeout(() => {
        setIsVisible(true)
        setIsAnimating(true)
      }, 3000)
      return () => clearTimeout(timer)
    }
    return undefined
  }, [canInstall])

  const handleInstall = async () => {
    const success = await install()
    if (success) {
      setIsVisible(false)
    }
  }

  const handleDismiss = () => {
    setIsAnimating(false)
    setTimeout(() => {
      setIsVisible(false)
      dismissPrompt()
    }, 300)
  }

  if (!isVisible) {
    return null
  }

  return (
    <div
      className={clsx(
        'fixed z-50 transition-all duration-300',
        isMobile
          ? 'bottom-20 left-4 right-4' // Above bottom nav on mobile
          : 'top-0 left-0 right-0', // Top bar on desktop
        isAnimating
          ? isMobile
            ? 'translate-y-0 opacity-100'
            : 'translate-y-0 opacity-100'
          : isMobile
            ? 'translate-y-full opacity-0'
            : '-translate-y-full opacity-0'
      )}
    >
      <div
        className={clsx(
          'flex items-center gap-3 p-3 shadow-lg',
          isMobile ? 'bg-slate-900 rounded-xl border border-slate-700' : 'bg-amber-500'
        )}
      >
        <div
          className={clsx(
            'flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center',
            isMobile ? 'bg-amber-500' : 'bg-[var(--brand-surface)]/20'
          )}
        >
          <Smartphone className="w-5 h-5 text-white" />
        </div>

        <div className="flex-1 min-w-0">
          <p
            className={clsx('font-medium text-sm truncate', isMobile ? 'text-white' : 'text-white')}
          >
            Install SolarIQ
          </p>
          <p className={clsx('text-xs truncate', isMobile ? 'text-slate-400' : 'text-white/80')}>
            {isMobile
              ? 'Add to home screen for quick access'
              : 'Install for faster access and offline support'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleInstall}
            className={clsx(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium text-sm transition-colors',
              isMobile
                ? 'bg-amber-500 text-white hover:bg-amber-600'
                : 'bg-[var(--brand-surface)] text-amber-600 hover:bg-amber-50'
            )}
          >
            <Download className="w-4 h-4" />
            Install
          </button>
          <button
            onClick={handleDismiss}
            className={clsx(
              'p-1.5 rounded-lg transition-colors',
              isMobile
                ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                : 'text-white/80 hover:text-white hover:bg-[var(--brand-surface)]/20'
            )}
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

// iOS-specific install instructions banner
export function IOSInstallInstructions() {
  const [showInstructions, setShowInstructions] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    // Detect iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent)
    // @ts-expect-error - iOS Safari specific property
    const isInStandaloneMode = window.navigator.standalone === true

    setIsIOS(isIOSDevice)
    setIsStandalone(isInStandaloneMode)

    // Show instructions for iOS users who haven't installed
    if (isIOSDevice && !isInStandaloneMode) {
      const dismissed = localStorage.getItem('solariq_ios_install_dismissed')
      if (!dismissed) {
        const timer = setTimeout(() => setShowInstructions(true), 5000)
        return () => clearTimeout(timer)
      }
    }
    return undefined
  }, [])

  const handleDismiss = () => {
    setShowInstructions(false)
    localStorage.setItem('solariq_ios_install_dismissed', Date.now().toString())
  }

  if (!showInstructions || !isIOS || isStandalone) {
    return null
  }

  return (
    <div className="fixed inset-x-4 bottom-20 z-50 md:bottom-4">
      <div className="bg-slate-900 rounded-xl border border-slate-700 p-4 shadow-lg">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-amber-500 flex items-center justify-center">
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div className="flex-1">
            <p className="font-medium text-white text-sm">Install SolarIQ on iOS</p>
            <ol className="mt-2 text-xs text-slate-400 space-y-1">
              <li>1. Tap the Share button below</li>
              <li>2. Scroll down and tap "Add to Home Screen"</li>
              <li>3. Tap "Add" in the top right corner</li>
            </ol>
          </div>
          <button
            onClick={handleDismiss}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
