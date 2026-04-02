import { getRequestConfig } from 'next-intl/server'
import { headers } from 'next/headers'
import { defaultLocale, isSupportedLocale, type Locale } from '@/i18n/config'

export default getRequestConfig(async ({ requestLocale }) => {
  const localeFromRequest = await requestLocale
  const requestHeaders = await headers()
  const localeFromHeader = requestHeaders.get('x-locale')
  const resolvedLocale: Locale = isSupportedLocale(localeFromRequest)
    ? localeFromRequest
    : isSupportedLocale(localeFromHeader)
      ? localeFromHeader
      : defaultLocale

  return {
    locale: resolvedLocale,
    messages: (await import(`../../messages/${resolvedLocale}.json`)).default,
  }
})
