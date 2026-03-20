/**
 * SolarIQ Web - Sentry Instrumentation Hook
 * WK-013: GCP Production Deployment & Operations
 *
 * This file is automatically loaded by Next.js to initialize monitoring.
 */

export async function register(): Promise<void> {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { initSentry } = await import('./src/lib/sentry');
    initSentry();
  }
}
