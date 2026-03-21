import { getRequestConfig } from 'next-intl/server'
import { locales, defaultLocale } from '@/i18n/config'

export { locales, defaultLocale }

export default getRequestConfig(async ({ locale }) => {
  const resolved = locales.includes(locale as typeof locales[number]) ? locale : defaultLocale
  return {
    locale: resolved,
    messages: (await import(`../messages/${resolved}.json`)).default,
  }
})
