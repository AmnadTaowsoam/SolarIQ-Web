import { getRequestConfig } from 'next-intl/server'
import { defaultLocale, isSupportedLocale, type Locale } from '@/i18n/config'

export default getRequestConfig(async ({ requestLocale }) => {
  const localeFromRequest = await requestLocale
  const resolvedLocale: Locale = isSupportedLocale(localeFromRequest)
    ? localeFromRequest
    : defaultLocale

  return {
    locale: resolvedLocale,
    messages: (await import(`../../messages/${resolvedLocale}.json`)).default,
  }
})
