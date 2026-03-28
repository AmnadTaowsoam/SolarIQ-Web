'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { Brand, PublicBrand } from '@/types/branding'
import { fetchPublicBrand, listBrands } from '@/hooks/useBranding'
import { useAuth } from './AuthContext'

interface BrandContextType {
  brand: Brand | PublicBrand | null
  brands: Brand[]
  isWhiteLabel: boolean
  switchBrand: (brandId: string) => void
  refresh: () => Promise<void>
}

const BrandContext = createContext<BrandContextType | undefined>(undefined)

const DEFAULT_HOST_SUFFIX = process.env.NEXT_PUBLIC_DEFAULT_BRAND_SUFFIX || 'solariqapp.com'
const BRAND_STORAGE_KEY = 'solariq_brand_id'

export function useBrand() {
  const ctx = useContext(BrandContext)
  if (!ctx) {
    throw new Error('useBrand must be used within a BrandProvider')
  }
  return ctx
}

function applyTheme(brand: Brand | PublicBrand) {
  if (typeof document === 'undefined') {
    return
  }

  const root = document.documentElement
  const colors = brand.colors || {}
  Object.entries(colors).forEach(([key, value]) => {
    if (value) {
      root.style.setProperty(`--brand-${toKebab(key)}`, value)
    }
  })

  if (colors.primary) {
    root.style.setProperty('--brand-primary-hover', shiftColor(colors.primary, -0.12))
    root.style.setProperty('--brand-primary-light', shiftColor(colors.primary, 0.9))
    // WK-030: theme engine canonical vars
    root.style.setProperty('--color-primary', colors.primary)
    root.style.setProperty('--color-primary-hover', darkenHex(colors.primary, 10))
  }

  if (colors.secondary) {
    root.style.setProperty('--color-secondary', colors.secondary)
  }

  const fontBodyValue = brand.fonts?.body
  if (fontBodyValue) {
    root.style.setProperty('--font-brand', fontBodyValue)
  }

  if ('border_radius' in brand && typeof brand.border_radius === 'number') {
    root.style.setProperty('--brand-radius', `${brand.border_radius}px`)
    root.style.setProperty('--brand-radius-sm', `${Math.max(brand.border_radius - 2, 0)}px`)
    root.style.setProperty('--brand-radius-lg', `${brand.border_radius + 4}px`)
    root.style.setProperty('--radius-brand', `${brand.border_radius}px`)
  }

  if ('company_name' in brand && brand.company_name) {
    root.style.setProperty('--company-name', `"${brand.company_name}"`)
  }

  if ('dark_mode_enabled' in brand && brand.dark_mode_enabled) {
    root.dataset.theme = 'dark'
  } else {
    root.dataset.theme = 'light'
  }

  if (brand.fonts) {
    if (brand.fonts.heading) {
      root.style.setProperty('--brand-font-heading', `'${brand.fonts.heading}', sans-serif`)
    }
    if (brand.fonts.body) {
      root.style.setProperty('--brand-font-body', `'${brand.fonts.body}', sans-serif`)
    }
    if (brand.fonts.mono) {
      root.style.setProperty('--brand-font-mono', `'${brand.fonts.mono}', monospace`)
    }

    const fontLink = 'font_link' in brand ? brand.font_link : undefined
    const href = fontLink || buildFontLink(brand.fonts)
    if (href) {
      let link = document.querySelector<HTMLLinkElement>('link[data-brand-fonts]')
      if (!link) {
        link = document.createElement('link')
        link.rel = 'stylesheet'
        link.setAttribute('data-brand-fonts', 'true')
        document.head.appendChild(link)
      }
      if (link.href !== href) {
        link.href = href
      }
    }
  }

  const favicon =
    ('favicon_url' in brand && brand.favicon_url) ||
    ('favicon_ico_url' in brand && brand.favicon_ico_url) ||
    ('logo' in brand ? brand.logo?.square : undefined) ||
    ('logo_square_url' in brand ? brand.logo_square_url : null) ||
    null

  if (favicon) {
    updateFavicon('icon', favicon)
    updateFavicon('apple-touch-icon', favicon)
  }
}

function updateFavicon(rel: string, href: string) {
  const selector = `link[rel="${rel}"]`
  let link = document.querySelector<HTMLLinkElement>(selector)
  if (!link) {
    link = document.createElement('link')
    link.rel = rel
    document.head.appendChild(link)
  }
  link.href = href
}

function toKebab(value: string) {
  return value.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`)
}

function shiftColor(hexColor: string, ratio: number) {
  const value = hexColor.replace('#', '')
  if (value.length !== 6) {
    return hexColor
  }
  const r = parseInt(value.slice(0, 2), 16)
  const g = parseInt(value.slice(2, 4), 16)
  const b = parseInt(value.slice(4, 6), 16)

  const shift = (channel: number) => {
    if (ratio >= 0) {
      return Math.round(channel + (255 - channel) * ratio)
    }
    return Math.round(channel * (1 + ratio))
  }

  const next = [shift(r), shift(g), shift(b)].map((c) =>
    Math.min(255, Math.max(0, c)).toString(16).padStart(2, '0')
  )

  return `#${next.join('')}`
}

/** Darken a hex color by a given percentage (0–100). WK-030 */
function darkenHex(hexColor: string, percent: number): string {
  const value = hexColor.replace('#', '')
  if (value.length !== 6) {
    return hexColor
  }
  const factor = 1 - percent / 100
  const r = Math.round(parseInt(value.slice(0, 2), 16) * factor)
  const g = Math.round(parseInt(value.slice(2, 4), 16) * factor)
  const b = Math.round(parseInt(value.slice(4, 6), 16) * factor)
  return `#${[r, g, b].map((c) => Math.min(255, Math.max(0, c)).toString(16).padStart(2, '0')).join('')}`
}

function buildFontLink(fonts: Record<string, string>) {
  const heading = fonts.heading || 'Prompt'
  const body = fonts.body || 'Sarabun'
  const mono = fonts.mono || 'JetBrains Mono'
  const families = [
    `${heading}:wght@400;500;600;700`,
    `${body}:wght@300;400;500;600`,
    `${mono}:wght@400;500`,
  ]
  const familyParam = families.map((f) => f.replace(/\s+/g, '+')).join('&family=')
  return `https://fonts.googleapis.com/css2?family=${familyParam}&display=swap`
}

export function BrandProvider({ children }: { children: React.ReactNode }) {
  const { isLoading, isAuthenticated } = useAuth()
  const [brand, setBrand] = useState<Brand | PublicBrand | null>(null)
  const [brands, setBrands] = useState<Brand[]>([])
  const [isWhiteLabel, setIsWhiteLabel] = useState(false)

  const resolveBrand = useCallback(async () => {
    if (typeof window === 'undefined') {
      return
    }

    const hostname = window.location.hostname
    const isLocalHost =
      hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '0.0.0.0'
    const isCustomDomain = !isLocalHost && !hostname.endsWith(DEFAULT_HOST_SUFFIX)

    if (isCustomDomain) {
      try {
        const publicBrand = await fetchPublicBrand(hostname)
        setBrand(publicBrand)
        setBrands([])
        setIsWhiteLabel(true)
        applyTheme(publicBrand)
        return
      } catch {
        setIsWhiteLabel(false)
      }
    }

    if (!isAuthenticated) {
      setBrand(null)
      setBrands([])
      setIsWhiteLabel(false)
      return
    }

    try {
      const data = await listBrands()
      const stored = typeof window !== 'undefined' ? localStorage.getItem(BRAND_STORAGE_KEY) : null
      const selected =
        data.brands.find((item) => item.id === stored) || data.default || data.brands[0] || null

      setBrands(data.brands)
      setBrand(selected)
      setIsWhiteLabel(Boolean(selected && selected.domain))
      if (selected) {
        applyTheme(selected)
      }
    } catch {
      setBrand(null)
      setBrands([])
      setIsWhiteLabel(false)
    }
  }, [isAuthenticated])

  useEffect(() => {
    if (isLoading) {
      return
    }
    resolveBrand()
  }, [isLoading, resolveBrand])

  const switchBrand = useCallback(
    (brandId: string) => {
      const selected = brands.find((item) => item.id === brandId) || null
      if (selected) {
        setBrand(selected)
        setIsWhiteLabel(Boolean(selected.domain))
        if (typeof window !== 'undefined') {
          localStorage.setItem(BRAND_STORAGE_KEY, brandId)
        }
        applyTheme(selected)
      }
    },
    [brands]
  )

  const value = useMemo(
    () => ({
      brand,
      brands,
      isWhiteLabel,
      switchBrand,
      refresh: resolveBrand,
    }),
    [brand, brands, isWhiteLabel, switchBrand, resolveBrand]
  )

  return <BrandContext.Provider value={value}>{children}</BrandContext.Provider>
}
