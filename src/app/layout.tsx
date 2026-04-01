export const runtime = 'edge'

import type { Metadata, Viewport } from 'next'
import { Inter, Noto_Sans_Thai } from 'next/font/google'
import { NextIntlClientProvider } from 'next-intl'
import { getLocale, getMessages } from 'next-intl/server'
import { Providers } from './providers'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { CriticalCSS } from '@/components/CriticalCSS'
import { Preconnect } from '@/components/Preconnect'
import { PerformanceMonitor } from '@/components/PerformanceMonitor'
import { GoogleAnalytics } from '@/components/GoogleAnalytics'
import { CookieConsentBanner } from '@/components/CookieConsent'
import { SITE_URL, toAbsoluteUrl } from '@/lib/site'
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
    default: 'SolarIQ - แพลตฟอร์มวิเคราะห์พลังงานแสงอาทิตย์อัจฉริยะ',
    template: '%s | SolarIQ',
  },
  description:
    'SolarIQ แพลตฟอร์มวิเคราะห์พลังงานแสงอาทิตย์อัจฉริยะสำหรับธุรกิจ คำนวณ ROI ติดตั้งโซลาร์เซลล์ บริหารลูกค้าเป้าหมาย วิเคราะห์ผลตอบแทนการลงทุนอย่างแม่นยำ สำหรับผู้ติดตั้งและตัวแทนจำหน่ายโซลาร์ในประเทศไทย',
  keywords: [
    'โซลาร์เซลล์',
    'พลังงานแสงอาทิตย์',
    'solar energy',
    'ROI',
    'solar analysis',
    'วิเคราะห์โซลาร์',
    'ติดตั้งโซลาร์',
    'lead management',
    'Thailand',
    'SolarIQ',
  ],
  authors: [{ name: 'SolarIQ Team' }],
  manifest: '/site.webmanifest',
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: [{ url: '/SolarIQ/4.png', type: 'image/png' }],
    apple: '/SolarIQ/4.png',
  },
  openGraph: {
    type: 'website',
    locale: 'th_TH',
    url: SITE_URL,
    siteName: 'SolarIQ',
    title: 'SolarIQ - แพลตฟอร์มวิเคราะห์พลังงานแสงอาทิตย์อัจฉริยะ',
    description:
      'แพลตฟอร์มวิเคราะห์โซลาร์เซลล์สำหรับธุรกิจ คำนวณ ROI วิเคราะห์ผลตอบแทน บริหารลูกค้าเป้าหมาย',
    images: [
      {
        url: toAbsoluteUrl('/SolarIQ/4.png'),
        width: 512,
        height: 512,
        alt: 'SolarIQ - Solar Energy Analysis Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SolarIQ - แพลตฟอร์มวิเคราะห์พลังงานแสงอาทิตย์อัจฉริยะ',
    description:
      'แพลตฟอร์มวิเคราะห์โซลาร์เซลล์สำหรับธุรกิจ คำนวณ ROI วิเคราะห์ผลตอบแทน บริหารลูกค้าเป้าหมาย',
    images: [toAbsoluteUrl('/SolarIQ/4.png')],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#ea580c',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale()
  const messages = await getMessages()

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <Preconnect />
        <GoogleAnalytics />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'SoftwareApplication',
              name: 'SolarIQ',
              applicationCategory: 'BusinessApplication',
              operatingSystem: 'Web',
              description:
                'AI-powered solar energy analysis platform for contractors and installers in Thailand. Calculate ROI, generate proposals, manage leads.',
              url: SITE_URL,
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'THB',
                description: '14-day free trial',
              },
              provider: {
                '@type': 'Organization',
                name: 'SolarIQ',
                url: SITE_URL,
                logo: toAbsoluteUrl('/SolarIQ/4.png'),
                contactPoint: {
                  '@type': 'ContactPoint',
                  telephone: '+66-85-662-1113',
                  contactType: 'customer service',
                  availableLanguage: ['Thai', 'English'],
                  areaServed: 'TH',
                },
                address: {
                  '@type': 'PostalAddress',
                  addressLocality: 'Nonthaburi',
                  addressCountry: 'TH',
                },
              },
            }),
          }}
        />
      </head>
      <body className={`${inter.variable} ${notoSansThai.variable} font-sans`}>
        <CriticalCSS />
        <PerformanceMonitor
          enabled={process.env.NODE_ENV === 'development'}
          reportToSentry={true}
          showInDev={true}
        />
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ErrorBoundary>
            <Providers>{children}</Providers>
          </ErrorBoundary>
          <CookieConsentBanner />
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
