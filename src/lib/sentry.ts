/**
 * SolarIQ Web - Sentry Error Tracking Integration
 * WK-013: GCP Production Deployment & Operations
 *
 * This module provides Sentry integration for error tracking and performance monitoring.
 */

import * as Sentry from '@sentry/nextjs'

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN
const ENVIRONMENT = process.env.NEXT_PUBLIC_ENVIRONMENT || 'development'
const RELEASE = process.env.NEXT_PUBLIC_COMMIT_SHA || process.env.npm_package_version || 'unknown'

/**
 * Initialize Sentry for Next.js application
 */
export function initSentry(): void {
  if (!SENTRY_DSN) {
    // Sentry DSN not configured, skipping initialization
    return
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    environment: ENVIRONMENT,
    release: `solariq-web@${RELEASE}`,

    // Performance monitoring
    // Early launch phase: 0.3 for better visibility. Reduce to 0.1 after stable launch.
    tracesSampleRate: ENVIRONMENT === 'production' ? 0.3 : 1.0,

    // Session replay (optional, for debugging)
    replaysSessionSampleRate: ENVIRONMENT === 'production' ? 0.1 : 0.5,
    replaysOnErrorSampleRate: ENVIRONMENT === 'production' ? 0.5 : 1.0,

    // Integrations
    // Note: @sentry/nextjs automatically captures Web Vitals (LCP, FID/INP, CLS)
    // via browserTracingIntegration — no extra setup required.
    integrations: [
      Sentry.browserTracingIntegration({
        enableInp: true,
      }),
      Sentry.replayIntegration({
        maskAllText: false,
        blockAllMedia: false,
      }),
    ],

    // Trace propagation targets
    tracePropagationTargets: ['localhost', /^https:\/\/solariq\.app/, /^https:\/\/.*\.vercel\.app/],

    // Before send hook
    beforeSend(event, hint) {
      // Filter out health check errors
      const request = event.request || {}
      if (request.url && request.url.includes('/api/health')) {
        return null
      }

      // Filter out rate limit errors
      const exception = hint.originalException
      if (exception && typeof exception === 'object' && 'status' in exception) {
        if ((exception as { status: number }).status === 429) {
          return null
        }
      }

      return event
    },

    // Ignore specific errors
    ignoreErrors: [
      // Browser extensions
      'ResizeObserver loop limit exceeded',
      'ResizeObserver loop completed with undelivered notifications',
      // Network errors
      'NetworkError',
      'Network request failed',
      // Canceled requests
      'canceled',
      'AbortError',
      // Random errors
      'Non-Error promise rejection captured',
    ],

    // Attach stack traces
    attachStacktrace: true,

    // Send default PII (set to false for strict privacy)
    sendDefaultPii: false,
  })

  // Sentry initialized successfully
}

/**
 * Set user context for error tracking
 */
export function setUserContext(user: { id?: string; email?: string; username?: string }): void {
  Sentry.setUser(user)
}

/**
 * Clear user context (on logout)
 */
export function clearUserContext(): void {
  Sentry.setUser(null)
}

/**
 * Add breadcrumb for debugging
 */
export function addBreadcrumb(options: {
  message: string
  category?: string
  level?: 'debug' | 'info' | 'warning' | 'error'
  data?: Record<string, unknown>
}): void {
  Sentry.addBreadcrumb({
    message: options.message,
    category: options.category || 'custom',
    level: options.level || 'info',
    data: options.data,
  })
}

/**
 * Capture exception with optional context
 */
export function captureException(
  error: Error | unknown,
  context?: Record<string, unknown>
): string | undefined {
  return Sentry.captureException(error, {
    contexts: context ? { custom: context } : undefined,
  })
}

/**
 * Capture message with optional context
 */
export function captureMessage(
  message: string,
  level: 'debug' | 'info' | 'warning' | 'error' | 'fatal' = 'info',
  context?: Record<string, unknown>
): string | undefined {
  return Sentry.captureMessage(message, {
    level,
    contexts: context ? { custom: context } : undefined,
  })
}

/**
 * Start a performance span
 */
export function startTransaction(options: {
  name: string
  op?: string
  data?: Record<string, unknown>
}) {
  return Sentry.startSpan(
    {
      name: options.name,
      op: options.op || 'custom',
      attributes: options.data as Record<string, string | number | boolean | undefined>,
    },
    () => {}
  )
}

/**
 * Wrap a function with Sentry error tracking
 */
export function withSentry<T extends (...args: unknown[]) => unknown>(
  fn: T,
  options?: {
    operation?: string
    name?: string
  }
): T {
  return Sentry.withScope(() => {
    if (options?.operation) {
      Sentry.setTag('operation', options.operation)
    }
    if (options?.name) {
      Sentry.setTag('function', options.name)
    }
    return fn
  }) as T
}

// Export Sentry for direct access
export { Sentry }
