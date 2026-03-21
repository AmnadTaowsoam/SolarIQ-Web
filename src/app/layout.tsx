import type { Metadata, Viewport } from 'next'
import { Inter, Noto_Sans_Thai } from 'next/font/google'
import { Providers } from './providers'
import { ErrorBoundary } from '@/components/ErrorBoundary'
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="th">
      <body className={`${inter.variable} ${notoSansThai.variable} font-sans`}>
        <ErrorBoundary>
          <Providers>{children}</Providers>
        </ErrorBoundary>
      </body>
    </html>
  )
}
