'use client'

import { ReactNode, useEffect, useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from 'next-themes'
import dynamic from 'next/dynamic'
import { AuthProvider, BrandProvider } from '@/context'
import { ToastProvider } from '@/components/ui'
import { initWebVitals } from '@/lib/webVitals'

const QuotaExceededModal = dynamic(
  () =>
    import('@/components/billing/QuotaExceededModal').then((m) => ({
      default: m.QuotaExceededModal || m.default,
    })),
  { ssr: false }
)

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  // useState ensures each request gets its own QueryClient (important for SSR)
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      })
  )

  // Quota exceeded modal state
  const [quotaError, setQuotaError] = useState<unknown>(null)

  useEffect(() => {
    const handler = (e: CustomEvent) => {
      setQuotaError(e.detail)
    }
    window.addEventListener('quotaExceeded', handler as EventListener)
    return () => window.removeEventListener('quotaExceeded', handler as EventListener)
  }, [])

  // Initialize Web Vitals tracking on client side
  useEffect(() => {
    initWebVitals()
  }, [])

  // Register service worker
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          // eslint-disable-next-line no-console
          console.log('[SW] Registered, scope:', registration.scope)
        })
        .catch((err) => {
          // eslint-disable-next-line no-console
          console.error('[SW] Registration failed:', err)
        })
    }
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <AuthProvider>
          <BrandProvider>
            <ToastProvider>
              {children}
              {quotaError && (
                <QuotaExceededModal
                  isOpen={!!quotaError}
                  onClose={() => setQuotaError(null)}
                  error={quotaError}
                  onUpgrade={() => {
                    setQuotaError(null)
                    window.location.href = '/billing'
                  }}
                />
              )}
            </ToastProvider>
          </BrandProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}
