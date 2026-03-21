import type { Metadata, Viewport } from 'next'
import { headers } from 'next/headers'
import { Inter, Noto_Sans_Thai } from 'next/font/google'
import { NextIntlClientProvider } from 'next-intl'
import { Providers } from './providers'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { defaultLocale, isSupportedLocale } from '@/i18n/config'
import { getMessages } from '@/i18n/messages'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const notoSansThai = Noto_Sans_Thai({
  subsets: ['thai'],
  variable: '--font-noto-thai',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
})

export const metadata: Metadata = {
  title: {
    default: 'SolarIQ - Solar Energy Analysis Portal',
    template: '%s | SolarIQ',
  },
  description: 'B2B Web Portal for solar energy analysis, lead management, and ROI calculations',
  keywords: ['solar', 'energy', 'ROI', 'solar analysis', 'lead management', 'Thailand'],
  authors: [{ name: 'SolarIQ Team' }],
  manifest: '/site.webmanifest',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: '/favicon.svg',
  },
  openGraph: {
    type: 'website',
    locale: 'th_TH',
    siteName: 'SolarIQ',
    title: 'SolarIQ - Solar Energy Analysis Portal',
    description: 'B2B Web Portal for solar energy analysis, lead management, and ROI calculations',
  },
  robots: {
    index: false,
    follow: false,
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#ea580c',
}

function resolveLocale(): string {
  const headerLocale = headers().get('x-locale')
  return isSupportedLocale(headerLocale) ? headerLocale : defaultLocale
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const locale = resolveLocale()
  const messages = await getMessages(locale)

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${inter.variable} ${notoSansThai.variable} font-sans`}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ErrorBoundary>
            <Providers>{children}</Providers>
          </ErrorBoundary>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
