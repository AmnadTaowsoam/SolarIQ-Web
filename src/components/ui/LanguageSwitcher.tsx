'use client'

import { useLocale } from 'next-intl'
import { usePathname, useRouter } from 'next/navigation'
import { buildLocalizedPath } from '@/lib/locale'
import { defaultLocale, type Locale } from '@/i18n/config'

const LANGUAGES: { code: Locale; label: string }[] = [
  { code: 'th', label: 'ไทย' },
  { code: 'en', label: 'English' },
]

export function LanguageSwitcher() {
  const locale = useLocale() as Locale
  const pathname = usePathname()
  const router = useRouter()

  function switchLocale(newLocale: Locale) {
    const target = buildLocalizedPath(pathname, newLocale)
    if (typeof document !== 'undefined') {
      const isSecure = window.location.protocol === 'https:' ? '; Secure' : ''
      document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax${isSecure}`
    }
    router.push(target)
    router.refresh()
  }

  return (
    <div className="flex items-center gap-1.5">
      {LANGUAGES.map((lang) => {
        const isActive = lang.code === locale
        return (
          <button
            key={lang.code}
            onClick={() => switchLocale(lang.code)}
            className={`px-2.5 py-1 text-xs font-semibold rounded-full border transition-colors ${
              isActive
                ? 'bg-orange-500 text-white border-orange-500'
                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
            }`}
            aria-pressed={isActive}
          >
            {lang.label}
          </button>
        )
      })}
    </div>
  )
}

export function getDefaultLocaleLabel() {
  return LANGUAGES.find((lang) => lang.code === defaultLocale)?.label ?? 'ไทย'
}
