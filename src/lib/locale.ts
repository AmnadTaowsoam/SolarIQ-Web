import { defaultLocale, isSupportedLocale, type Locale } from '@/i18n/config'

export function extractLocaleFromPath(pathname: string): { locale: Locale | null; pathname: string } {
  const segments = pathname.split('/')
  const maybeLocale = segments[1]
  if (isSupportedLocale(maybeLocale)) {
    const rest = '/' + segments.slice(2).join('/')
    return { locale: maybeLocale, pathname: rest === '/' ? '/' : rest.replace(/\/$/, '') }
  }
  return { locale: null, pathname }
}

export function buildLocalizedPath(pathname: string, locale: Locale): string {
  const { pathname: cleaned } = extractLocaleFromPath(pathname)
  if (locale === defaultLocale) {
    return cleaned === '/' ? '/' : cleaned
  }
  if (cleaned === '/') {
    return `/${locale}`
  }
  return `/${locale}${cleaned}`
}

export function normalizePathname(pathname: string): string {
  const cleaned = pathname.split('?')[0]
  return cleaned.endsWith('/') && cleaned !== '/' ? cleaned.slice(0, -1) : cleaned
}
