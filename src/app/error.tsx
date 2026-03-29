'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { buildLocalizedPath, extractLocaleFromPath } from '@/lib/locale'
import { defaultLocale } from '@/i18n/config'

interface ErrorPageProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  const pathname = usePathname()
  const { locale } = extractLocaleFromPath(pathname)
  const dashboardPath = buildLocalizedPath('/dashboard', locale ?? defaultLocale)

  useEffect(() => {
    // Log error to monitoring service in production
    if (process.env.NODE_ENV === 'production') {
      // Error monitoring integration point - implement with Sentry/LogRocket when configured
      // Example: Sentry.captureException(error)
      void error // Acknowledge error for future monitoring integration
    }
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--brand-background)] px-4">
      <div className="max-w-md w-full text-center">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
          <svg
            className="h-8 w-8 text-red-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-[var(--brand-text)] mb-2">
          Something went wrong
        </h2>
        <p className="text-[var(--brand-text-secondary)] mb-6">
          An unexpected error occurred. Please try again.
        </p>
        {error.digest && (
          <p className="text-xs text-[var(--brand-text-secondary)] mb-4">
            Error ID: {error.digest}
          </p>
        )}
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Try Again
          </button>
          <a
            href={dashboardPath}
            className="inline-flex items-center px-4 py-2 bg-[var(--brand-border)] text-[var(--brand-text)] rounded-lg hover:bg-[var(--brand-border)] transition-colors"
          >
            Go to Dashboard
          </a>
        </div>
      </div>
    </div>
  )
}
