import { isSupportedLocale, type Locale } from '@/i18n/config'

export function extractLocaleFromPath(pathname: string): {
  locale: Locale | null
  pathname: string
} {
  const segments = pathname.split('/')
  const maybeLocale = segments[1]
  if (isSupportedLocale(maybeLocale)) {
    const rest = `/${segments.slice(2).join('/')}`
    return { locale: maybeLocale, pathname: rest === '/' ? '/' : rest.replace(/\/$/, '') }
  }
  return { locale: null, pathname }
}

export function buildLocalizedPath(pathname: string, _locale: Locale): string {
  // This project uses cookie-based locale (no [locale] URL segments).
  // Always return clean path without locale prefix.
  const { pathname: cleaned } = extractLocaleFromPath(pathname)
  return cleaned === '/' ? '/' : cleaned
}

export function normalizePathname(pathname: string): string {
  const cleaned = pathname.split('?')[0]
  return cleaned.endsWith('/') && cleaned !== '/' ? cleaned.slice(0, -1) : cleaned
}
