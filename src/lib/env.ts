/**
 * Runtime environment variable validation.
 * During build (prerender) missing vars emit a warning instead of throwing,
 * so Cloudflare Pages / Vercel builds succeed even without env vars.
 * At actual runtime in the browser the vars are baked in by Next.js.
 */

const requiredEnvVars = [
  'NEXT_PUBLIC_API_URL',
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
] as const

const _optionalEnvVars = [
  'NEXT_PUBLIC_GOOGLE_MAPS_API_KEY',
  'NEXT_PUBLIC_USE_EMULATOR',
  'NEXT_PUBLIC_LIFF_ID',
] as const

type RequiredEnvKey = (typeof requiredEnvVars)[number]
type OptionalEnvKey = (typeof _optionalEnvVars)[number]

// Export types for use in other modules
export type { RequiredEnvKey, OptionalEnvKey }

interface EnvConfig {
  NEXT_PUBLIC_API_URL: string
  NEXT_PUBLIC_FIREBASE_API_KEY: string
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: string
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: string
  NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: string | undefined
  NEXT_PUBLIC_USE_EMULATOR: string | undefined
  NEXT_PUBLIC_LIFF_ID: string | undefined
}

/** True when running inside `next build` (not in the browser). */
const isBuildPhase = typeof window === 'undefined' && process.env.NODE_ENV === 'production'

function validateEnv(): EnvConfig {
  const missing: string[] = []

  for (const key of requiredEnvVars) {
    if (!process.env[key]) {
      missing.push(key)
    }
  }

  if (missing.length > 0) {
    if (isBuildPhase) {
      // During build/prerender, warn but don't throw — the values will be
      // available at runtime via NEXT_PUBLIC_* inlining.
      console.warn(
        `[env] Build-time warning: missing env vars: ${missing.join(', ')}. ` +
          `These must be set in the deployment environment.`
      )
    } else if (typeof window === 'undefined') {
      // Server-side at runtime (dev mode) — still throw
      throw new Error(
        `Missing required environment variables:\n${missing.map((k) => `  - ${k}`).join('\n')}\n\nCopy .env.example to .env.local and fill in the values.`
      )
    }
    // In the browser, NEXT_PUBLIC_* are inlined at build time — if they're
    // empty the app simply won't work, but we don't throw to avoid SSR mismatches.
  }

  return {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || '',
    NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    NEXT_PUBLIC_USE_EMULATOR: process.env.NEXT_PUBLIC_USE_EMULATOR,
    NEXT_PUBLIC_LIFF_ID: process.env.NEXT_PUBLIC_LIFF_ID,
  }
}

export const env = validateEnv()
