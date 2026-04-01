const DEFAULT_SITE_URL = 'https://www.solariqapp.com'

export function normalizeSiteUrl(url?: string | null): string {
  if (!url) {
    return DEFAULT_SITE_URL
  }

  const trimmed = url.trim()
  if (!trimmed) {
    return DEFAULT_SITE_URL
  }

  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`

  try {
    const normalized = new URL(withProtocol)
    normalized.hash = ''
    normalized.search = ''
    normalized.pathname = normalized.pathname.replace(/\/+$/, '')
    return normalized.toString().replace(/\/$/, '')
  } catch {
    return DEFAULT_SITE_URL
  }
}

export const SITE_URL = normalizeSiteUrl(process.env.NEXT_PUBLIC_APP_URL)

export function toAbsoluteUrl(path = '/'): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return new URL(normalizedPath, `${SITE_URL}/`).toString()
}
