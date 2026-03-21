'use client'

import { ReactNode, useEffect, useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider, BrandProvider } from '@/context'
import { ToastProvider } from '@/components/ui'
import { initWebVitals } from '@/lib/webVitals'

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
          console.log('[SW] Registered, scope:', registration.scope)
        })
        .catch((err) => {
          console.error('[SW] Registration failed:', err)
        })
    }
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrandProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </BrandProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}
