/**
 * Security Utilities for Frontend
 * Provides input sanitization, validation, and security helper functions
 */

/**
 * HTML entity encoding map for XSS prevention
 */
const HTML_ENTITIES: Record<string, string> = {
  '&': '&',
  '<': '<',
  '>': '>',
  '"': '"',
  "'": '&#x27;',
  '/': '&#x2F;',
  '`': '&#x60;',
  '=': '&#x3D;',
}

/**
 * Sanitize string input by encoding HTML entities
 * Prevents XSS attacks when rendering user input
 * @param input - The string to sanitize
 * @returns Sanitized string with HTML entities encoded
 */
export function sanitizeHtml(input: string): string {
  if (typeof input !== 'string') {
    return ''
  }
  return input.replace(/[&<>"'`=/]/g, (char) => HTML_ENTITIES[char] || char)
}

/**
 * Remove potentially dangerous characters from input
 * More aggressive sanitization for search queries and addresses
 * @param input - The string to sanitize
 * @returns Sanitized string with dangerous characters removed
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') {
    return ''
  }
  // Remove control characters, null bytes, and normalize whitespace
  return input
    .replace(/[\x00-\x1F\x7F]/g, '') // Remove control characters
    .replace(/\x00/g, '') // Remove null bytes
    .trim()
    .slice(0, 10000) // Limit length to prevent DoS
}

/**
 * Sanitize search query for API calls
 * Removes special regex characters and normalizes whitespace
 * @param query - The search query to sanitize
 * @returns Sanitized search query
 */
export function sanitizeSearchQuery(query: string): string {
  if (typeof query !== 'string') {
    return ''
  }
  return query
    .replace(/[\x00-\x1F\x7F]/g, '') // Remove control characters
    .replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // Escape regex special chars
    .trim()
    .slice(0, 500) // Reasonable max length for search
}

/**
 * Sanitize address input for geocoding API
 * Allows common address characters but removes dangerous ones
 * @param address - The address to sanitize
 * @returns Sanitized address string
 */
export function sanitizeAddress(address: string): string {
  if (typeof address !== 'string') {
    return ''
  }
  // Allow letters, numbers, spaces, and common address punctuation
  return address
    .replace(/[\x00-\x1F\x7F]/g, '') // Remove control characters
    .replace(/[<>\"'`\\]/g, '') // Remove dangerous characters
    .trim()
    .slice(0, 500) // Reasonable max length for address
}

/**
 * Sanitize error message before displaying to user
 * Removes potentially sensitive information from API errors
 * @param message - The error message to sanitize
 * @returns Safe error message for display
 */
export function sanitizeErrorMessage(message: string): string {
  if (typeof message !== 'string') {
    return 'An unexpected error occurred'
  }

  // Remove file paths
  let sanitized = message.replace(/\/[\w\-./]+/g, '[path]')

  // Remove URLs
  sanitized = sanitized.replace(/https?:\/\/[^\s]+/gi, '[url]')

  // Remove email addresses
  sanitized = sanitized.replace(/[\w.-]+@[\w.-]+\.\w+/g, '[email]')

  // Remove IP addresses
  sanitized = sanitized.replace(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g, '[ip]')

  // Remove stack trace patterns
  sanitized = sanitized.replace(/at\s+[\w.<>]+\([^)]*\)/g, '[stack]')

  // Remove potential tokens/keys (long alphanumeric strings)
  sanitized = sanitized.replace(/\b[A-Za-z0-9]{20,}\b/g, '[token]')

  // Limit length
  sanitized = sanitized.slice(0, 500)

  // If message becomes too short or meaningless, use generic message
  if (sanitized.length < 5 || sanitized === '[path]' || sanitized === '[url]') {
    return 'An error occurred. Please try again.'
  }

  return sanitized
}

/**
 * Allowed MIME types for file uploads
 */
export const ALLOWED_MIME_TYPES: Record<string, string[]> = {
  image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  document: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  spreadsheet: ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
  text: ['text/plain', 'text/csv'],
}

/**
 * File magic bytes signatures for validation
 * Maps file type to expected magic bytes (first few bytes of file)
 */
const MAGIC_BYTES: Record<string, number[][]> = {
  'image/jpeg': [[0xff, 0xd8, 0xff]],
  'image/png': [[0x89, 0x50, 0x4e, 0x47]],
  'image/gif': [[0x47, 0x49, 0x46, 0x38]],
  'image/webp': [[0x52, 0x49, 0x46, 0x46]], // RIFF (WebP container)
  'application/pdf': [[0x25, 0x50, 0x44, 0x46]], // %PDF
}

/**
 * Maximum file sizes in bytes
 */
export const MAX_FILE_SIZES: Record<string, number> = {
  image: 10 * 1024 * 1024, // 10MB
  document: 25 * 1024 * 1024, // 25MB
  spreadsheet: 25 * 1024 * 1024, // 25MB
  text: 5 * 1024 * 1024, // 5MB
  default: 10 * 1024 * 1024, // 10MB default
}

/**
 * File validation result
 */
export interface FileValidationResult {
  valid: boolean
  error?: string
}

/**
 * Validate file type using magic bytes
 * @param file - File object to validate
 * @param allowedTypes - Array of allowed MIME types
 * @returns Promise resolving to validation result
 */
export async function validateFileMagicBytes(
  file: File,
  allowedTypes: string[]
): Promise<FileValidationResult> {
  // Read first 8 bytes of file
  const buffer = await file.slice(0, 8).arrayBuffer()
  const bytes = new Uint8Array(buffer)

  // Check if any allowed type matches magic bytes
  for (const mimeType of allowedTypes) {
    const signatures = MAGIC_BYTES[mimeType]
    if (!signatures) {
      continue
    }

    for (const signature of signatures) {
      const matches = signature.every((byte, index) => bytes[index] === byte)
      if (matches) {
        return { valid: true }
      }
    }
  }

  return {
    valid: false,
    error: 'File content does not match the expected type',
  }
}

/**
 * Validate file for upload
 * Checks MIME type, size, and optionally magic bytes
 * @param file - File object to validate
 * @param options - Validation options
 * @returns Promise resolving to validation result
 */
export async function validateFileUpload(
  file: File,
  options: {
    allowedCategories?: ('image' | 'document' | 'spreadsheet' | 'text')[]
    allowedMimeTypes?: string[]
    maxSize?: number
    validateMagicBytes?: boolean
  } = {}
): Promise<FileValidationResult> {
  const {
    allowedCategories = ['image'],
    allowedMimeTypes,
    maxSize,
    validateMagicBytes = true,
  } = options

  // Build list of allowed MIME types
  let allowedTypes: string[] = []
  if (allowedMimeTypes) {
    allowedTypes = allowedMimeTypes
  } else {
    for (const category of allowedCategories) {
      const types = ALLOWED_MIME_TYPES[category]
      if (types) {
        allowedTypes = allowedTypes.concat(types)
      }
    }
  }

  // Check MIME type
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type ${file.type} is not allowed. Allowed types: ${allowedTypes.join(', ')}`,
    }
  }

  // Determine max size
  let maxFileSize: number = maxSize ?? MAX_FILE_SIZES.default ?? 10 * 1024 * 1024
  if (!maxSize) {
    for (const category of allowedCategories) {
      const categoryMax = MAX_FILE_SIZES[category]
      if (categoryMax && categoryMax > maxFileSize) {
        maxFileSize = categoryMax
      }
    }
  }

  // Check file size
  if (file.size > maxFileSize) {
    const maxMB = (maxFileSize / (1024 * 1024)).toFixed(1)
    return {
      valid: false,
      error: `File size exceeds maximum allowed size of ${maxMB}MB`,
    }
  }

  // Check file size is not zero
  if (file.size === 0) {
    return {
      valid: false,
      error: 'File is empty',
    }
  }

  // Validate magic bytes if enabled
  if (validateMagicBytes) {
    const magicResult = await validateFileMagicBytes(file, allowedTypes)
    if (!magicResult.valid) {
      return magicResult
    }
  }

  return { valid: true }
}

/**
 * Generate a secure random string for CSRF tokens or nonces
 * @param length - Length of the string to generate
 * @returns Random string
 */
export function generateSecureRandom(length: number = 32): string {
  const array = new Uint8Array(length)
  crypto.getRandomValues(array)
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('')
}

/**
 * Content Security Policy nonce for inline scripts
 * Should be generated server-side and injected
 */
let cspNonce: string | null = null

/**
 * Get or create CSP nonce
 * Note: In production, this should come from server-side injection
 * @returns CSP nonce string
 */
export function getCspNonce(): string {
  if (!cspNonce) {
    cspNonce = generateSecureRandom(16)
  }
  return cspNonce
}

/**
 * Rate limiter for client-side actions
 */
export class ClientRateLimiter {
  private attempts: number[] = []
  private maxAttempts: number
  private windowMs: number

  constructor(maxAttempts: number = 5, windowMs: number = 60000) {
    this.maxAttempts = maxAttempts
    this.windowMs = windowMs
  }

  /**
   * Record an attempt and check if rate limited
   * @returns true if rate limited, false if allowed
   */
  isRateLimited(): boolean {
    const now = Date.now()
    
    // Remove old attempts outside the window
    this.attempts = this.attempts.filter((time) => now - time < this.windowMs)
    
    // Check if over limit
    if (this.attempts.length >= this.maxAttempts) {
      return true
    }
    
    // Record this attempt
    this.attempts.push(now)
    return false
  }

  /**
   * Get remaining attempts in current window
   */
  getRemainingAttempts(): number {
    const now = Date.now()
    this.attempts = this.attempts.filter((time) => now - time < this.windowMs)
    return Math.max(0, this.maxAttempts - this.attempts.length)
  }

  /**
   * Get milliseconds until rate limit resets
   */
  getResetTime(): number {
    if (this.attempts.length === 0) {
      return 0
    }
    const oldestAttempt = Math.min(...this.attempts)
    const resetTime = oldestAttempt + this.windowMs - Date.now()
    return Math.max(0, resetTime)
  }

  /**
   * Reset the rate limiter
   */
  reset(): void {
    this.attempts = []
  }
}

/**
 * Validate email format
 * @param email - Email to validate
 * @returns true if valid email format
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') {
    return false
  }
  // RFC 5322 simplified email regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email) && email.length <= 255
}

/**
 * Validate password strength
 * @param password - Password to validate
 * @returns Object with valid flag and strength score
 */
export function validatePasswordStrength(password: string): {
  valid: boolean
  score: number
  feedback: string[]
} {
  const feedback: string[] = []
  let score = 0

  if (!password || typeof password !== 'string') {
    return { valid: false, score: 0, feedback: ['Password is required'] }
  }

  if (password.length < 8) {
    feedback.push('Password should be at least 8 characters')
  } else {
    score += 1
  }

  if (password.length >= 12) {
    score += 1
  }

  if (/[a-z]/.test(password)) {
    score += 1
  } else {
    feedback.push('Add lowercase letters')
  }

  if (/[A-Z]/.test(password)) {
    score += 1
  } else {
    feedback.push('Add uppercase letters')
  }

  if (/[0-9]/.test(password)) {
    score += 1
  } else {
    feedback.push('Add numbers')
  }

  if (/[^a-zA-Z0-9]/.test(password)) {
    score += 1
  } else {
    feedback.push('Add special characters')
  }

  // Check for common patterns
  const commonPatterns = ['password', '123456', 'qwerty', 'abc123']
  const lowerPassword = password.toLowerCase()
  for (const pattern of commonPatterns) {
    if (lowerPassword.includes(pattern)) {
      score -= 2
      feedback.push('Avoid common patterns')
      break
    }
  }

  return {
    valid: password.length >= 6 && score >= 3,
    score: Math.max(0, Math.min(6, score)),
    feedback: feedback.length === 0 ? ['Password is strong'] : feedback,
  }
}

/**
 * Check if running in secure context (HTTPS)
 * @returns true if secure context
 */
export function isSecureContext(): boolean {
  if (typeof window === 'undefined') {
    return false
  }
  return window.isSecureContext || window.location.protocol === 'https:'
}

/**
 * Clear all authentication data from client
 * Use on logout or session invalidation
 */
export function clearAuthData(): void {
  if (typeof window === 'undefined') {
    return
  }

  // Clear localStorage
  localStorage.clear()

  // Clear sessionStorage
  sessionStorage.clear()

  // Clear auth cookies by setting expiration to past
  const cookiesToClear = ['__session', 'user-role', 'firebase-auth-token']
  for (const name of cookiesToClear) {
    document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`
    // Also try with different domain variations
    document.cookie = `${name}=; path=/; domain=${window.location.hostname}; expires=Thu, 01 Jan 1970 00:00:00 GMT`
  }
}
