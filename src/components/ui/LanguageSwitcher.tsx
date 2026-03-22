'use client'

import { useLocale } from 'next-intl'
import { usePathname } from 'next/navigation'
import { buildLocalizedPath } from '@/lib/locale'
import { defaultLocale, type Locale } from '@/i18n/config'

const LANGUAGES: { code: Locale; label: string }[] = [
  { code: 'th', label: 'ไทย' },
  { code: 'en', label: 'English' },
]

export function LanguageSwitcher() {
  const locale = useLocale() as Locale
  const pathname = usePathname()

  function switchLocale(newLocale: Locale) {
    const target = buildLocalizedPath(pathname, newLocale)
    if (typeof document !== 'undefined') {
      const isSecure = window.location.protocol === 'https:' ? '; Secure' : ''
      document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax${isSecure}`
      // Force full navigation so all server/client trees render with the same locale state.
      window.location.assign(target)
    }
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
                ? 'bg-[var(--brand-primary)] text-white border-[var(--brand-primary)]'
                : 'bg-[var(--brand-surface)] text-[var(--brand-text-secondary)] border-[var(--brand-border)] hover:bg-[var(--brand-primary-light)]'
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
