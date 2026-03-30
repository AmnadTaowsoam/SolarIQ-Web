/**
 * LIFF (LINE Front-end Framework) SDK Wrapper
 * Provides type-safe access to LIFF SDK functionality
 */

import * as Sentry from '@sentry/nextjs'

// Simple logger for LIFF module
const logger = {
  info: (message: string, data?: Record<string, unknown>) => {
    Sentry.addBreadcrumb({ category: 'liff', message, level: 'info', data })
  },
  warn: (message: string, data?: Record<string, unknown>) => {
    Sentry.addBreadcrumb({ category: 'liff', message, level: 'warning', data })
  },
  error: (message: string, data?: Record<string, unknown>) => {
    Sentry.captureMessage(message, { level: 'error', extra: data })
  },
}

// LIFF types
export interface LIFFProfile {
  userId: string
  displayName: string
  pictureUrl?: string
  statusMessage?: string
  email?: string
}

export interface LIFFContext {
  type: 'utou' | 'room' | 'group' | 'none'
  userId?: string
  utouId?: string
  roomId?: string
  groupId?: string
  endpointUrl?: string
}

export interface LIFFDecodedIDToken {
  iss: string
  sub: string
  aud: string
  exp: number
  iat: number
  nonce?: string
  amr?: string[]
  name?: string
  picture?: string
  email?: string
}

export interface LIFFSendMessage {
  type: 'text' | 'image' | 'video' | 'audio' | 'location' | 'template' | 'imagemap' | 'flex'
  text?: string
  originalContentUrl?: string
  previewImageUrl?: string
  duration?: number
  title?: string
  address?: string
  latitude?: number
  longitude?: number
  altText?: string
  template?: Record<string, unknown>
  contents?: Record<string, unknown>
}

type LIFFSDK = import('@line/liff').Liff

let liffSDK: LIFFSDK | null = null
let isInitialized = false
let initPromise: Promise<void> | null = null

/**
 * Get LIFF SDK instance (lazy loaded)
 */
async function getLIFFSDK(): Promise<LIFFSDK> {
  if (!liffSDK) {
    const mod = await import('@line/liff')
    liffSDK = mod.default ?? mod.liff
  }
  return liffSDK as LIFFSDK
}

/**
 * Initialize LIFF SDK
 * Should be called once when the app starts
 */
export async function initLIFF(liffId: string): Promise<void> {
  if (isInitialized) {
    return
  }

  if (initPromise) {
    return initPromise
  }

  initPromise = (async () => {
    try {
      const liff = await getLIFFSDK()
      await liff.init({ liffId, withLoginOnExternalBrowser: true })
      isInitialized = true
      logger.info('LIFF SDK initialized successfully')
    } catch (error) {
      logger.error('Failed to initialize LIFF SDK', { error })
      initPromise = null
      throw error
    }
  })()

  return initPromise
}

/**
 * Check if LIFF is running in LINE app
 */
export async function isInLINEApp(): Promise<boolean> {
  const liff = await getLIFFSDK()
  return liff.isInClient()
}

/**
 * Check if LIFF is initialized
 */
export function isLIFFReady(): boolean {
  return isInitialized
}

/**
 * Get user profile from LINE
 */
export async function getProfile(): Promise<LIFFProfile> {
  const liff = await getLIFFSDK()
  if (!isInitialized) {
    throw new Error('LIFF not initialized. Call initLIFF first.')
  }
  return liff.getProfile() as Promise<LIFFProfile>
}

/**
 * Get LIFF context (conversation type, IDs, etc.)
 */
export async function getLIFFContext(): Promise<LIFFContext | null> {
  const liff = await getLIFFSDK()
  if (!isInitialized) {
    throw new Error('LIFF not initialized. Call initLIFF first.')
  }
  return liff.getContext() as LIFFContext | null
}

/**
 * Get decoded ID token
 */
export async function getDecodedIDToken(): Promise<LIFFDecodedIDToken | null> {
  const liff = await getLIFFSDK()
  if (!isInitialized) {
    throw new Error('LIFF not initialized. Call initLIFF first.')
  }
  try {
    return liff.getDecodedIDToken() as LIFFDecodedIDToken | null
  } catch {
    return null
  }
}

/**
 * Get access token for backend authentication
 */
export async function getAccessToken(): Promise<string | null> {
  const liff = await getLIFFSDK()
  if (!isInitialized) {
    throw new Error('LIFF not initialized. Call initLIFF first.')
  }
  try {
    return liff.getAccessToken()
  } catch {
    return null
  }
}

/**
 * Check if user is logged in
 */
export async function isLoggedIn(): Promise<boolean> {
  const liff = await getLIFFSDK()
  if (!isInitialized) {
    return false
  }
  return liff.isLoggedIn()
}

/**
 * Login user (redirects to LINE login)
 */
export async function login(redirectUri?: string): Promise<void> {
  const liff = await getLIFFSDK()
  if (!isInitialized) {
    throw new Error('LIFF not initialized. Call initLIFF first.')
  }
  liff.login({ redirectUri })
}

/**
 * Logout user
 */
export async function logout(): Promise<void> {
  const liff = await getLIFFSDK()
  if (!isInitialized) {
    throw new Error('LIFF not initialized. Call initLIFF first.')
  }
  liff.logout()
}

/**
 * Send messages to the chat (only works in LINE app)
 */
export async function sendMessages(messages: LIFFSendMessage[]): Promise<void> {
  const liff = await getLIFFSDK()
  if (!isInitialized) {
    throw new Error('LIFF not initialized. Call initLIFF first.')
  }

  const inClient = liff.isInClient()
  if (!inClient) {
    logger.warn('sendMessages called outside LINE app')
    return
  }

  await liff.sendMessages(messages as Parameters<typeof liff.sendMessages>[0])
}

/**
 * Send text message to chat
 */
export async function sendTextMessage(text: string): Promise<void> {
  await sendMessages([{ type: 'text', text }])
}

/**
 * Send location message to chat
 */
export async function sendLocationMessage(
  title: string,
  address: string,
  latitude: number,
  longitude: number
): Promise<void> {
  await sendMessages([
    {
      type: 'location',
      title,
      address,
      latitude,
      longitude,
    },
  ])
}

/**
 * Send flex message to chat
 */
export async function sendFlexMessage(
  altText: string,
  contents: Record<string, unknown>
): Promise<void> {
  await sendMessages([
    {
      type: 'flex',
      altText,
      contents,
    },
  ])
}

/**
 * Close LIFF app
 */
export async function closeWindow(): Promise<void> {
  const liff = await getLIFFSDK()
  if (!isInitialized) {
    throw new Error('LIFF not initialized. Call initLIFF first.')
  }
  liff.closeWindow()
}

/**
 * Open external URL in in-app browser or external browser
 */
export async function openWindow(url: string, options?: { external?: boolean }): Promise<void> {
  const liff = await getLIFFSDK()
  if (!isInitialized) {
    throw new Error('LIFF not initialized. Call initLIFF first.')
  }
  liff.openWindow({ url, ...options })
}

/**
 * Get user agent info
 */
export async function getLIFFOS(): Promise<string> {
  const liff = await getLIFFSDK()
  return liff.getOS() || ''
}

/**
 * Get LINE version
 */
export async function getLINEVersion(): Promise<string> {
  const liff = await getLIFFSDK()
  return liff.getLineVersion() || ''
}

/**
 * Check if features are available
 */
export async function isApiAvailable(apiName: string): Promise<boolean> {
  const liff = await getLIFFSDK()
  return liff.isApiAvailable(apiName)
}

/**
 * Get permission for using specific features
 */
export async function requestPermission(
  permission: 'profile' | 'email' | 'chat_message.write' | 'openid'
): Promise<boolean> {
  const liff = await getLIFFSDK()
  if (!isInitialized) {
    throw new Error('LIFF not initialized. Call initLIFF first.')
  }
  try {
    const status = await liff.permission.query(permission)
    if (status.state === 'granted') {
      return true
    }
    if (status.state === 'prompt') {
      await liff.permission.requestAll()
      return true
    }
    return false
  } catch {
    return false
  }
}

/**
 * Share target picker - let user select friends/groups to share content
 */
export async function shareTargetPicker(
  messages: LIFFSendMessage[]
): Promise<{ status: 'success' | 'cancel' | 'error'; error?: string }> {
  const liff = await getLIFFSDK()
  if (!isInitialized) {
    throw new Error('LIFF not initialized. Call initLIFF first.')
  }

  try {
    const result = await liff.shareTargetPicker(
      messages as Parameters<typeof liff.shareTargetPicker>[0]
    )
    return result as { status: 'success' | 'cancel' | 'error' }
  } catch (error) {
    logger.error('Share target picker failed', { error })
    return { status: 'error', error: String(error) }
  }
}

/**
 * Scan QR code using device camera
 */
export async function scanCode(): Promise<string | null> {
  const liff = await getLIFFSDK()
  if (!isInitialized) {
    throw new Error('LIFF not initialized. Call initLIFF first.')
  }

  try {
    const result = await liff.scanCode?.()
    return result?.value ?? null
  } catch (error) {
    logger.error('Scan code failed', { error })
    return null
  }
}
