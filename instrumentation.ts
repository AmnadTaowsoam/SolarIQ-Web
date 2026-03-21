/**
 * SolarIQ Web - Instrumentation Hook
 *
 * Only loads Sentry when NEXT_PUBLIC_SENTRY_DSN is set.
 * Without DSN, this file does nothing — zero overhead.
 */

export async function register(): Promise<void> {
  if (
    process.env.NEXT_RUNTIME === 'nodejs' &&
    process.env.NEXT_PUBLIC_SENTRY_DSN
  ) {
    const { initSentry } = await import('./src/lib/sentry')
    initSentry()
  }
}
