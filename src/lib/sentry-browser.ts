'use client'

type SentryModule = typeof import('@sentry/browser')

let sentryModulePromise: Promise<SentryModule | null> | null = null

async function loadSentry(): Promise<SentryModule | null> {
  if (typeof window === 'undefined' || !process.env.NEXT_PUBLIC_SENTRY_DSN) {
    return null
  }

  if (!sentryModulePromise) {
    sentryModulePromise = import('@sentry/browser').catch(() => null)
  }

  return sentryModulePromise
}

function runWithSentry(callback: (sentry: SentryModule) => void): void {
  void loadSentry().then((sentry) => {
    if (sentry) {
      callback(sentry)
    }
  })
}

export function addSentryBreadcrumb(options: {
  message: string
  category?: string
  level?: 'debug' | 'info' | 'warning' | 'error'
  data?: Record<string, unknown>
}): void {
  runWithSentry((sentry) => {
    sentry.addBreadcrumb({
      message: options.message,
      category: options.category || 'custom',
      level: options.level || 'info',
      data: options.data,
    })
  })
}

export function captureSentryMessage(
  message: string,
  options:
    | {
        level?: 'debug' | 'info' | 'warning' | 'error' | 'fatal'
        tags?: Record<string, string>
        extra?: Record<string, unknown>
      }
    | undefined = undefined
): void {
  runWithSentry((sentry) => {
    sentry.captureMessage(message, options)
  })
}
