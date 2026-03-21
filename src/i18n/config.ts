export const locales = ['th', 'en'] as const
export type Locale = (typeof locales)[number]
export const defaultLocale: Locale = 'th'

export function isSupportedLocale(locale: string | null | undefined): locale is Locale {
  return locale === 'th' || locale === 'en'
}
