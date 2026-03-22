import type { Metadata, Viewport } from 'next'
import { Inter, Noto_Sans_Thai } from 'next/font/google'
import { NextIntlClientProvider } from 'next-intl'
import { getLocale, getMessages } from 'next-intl/server'
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

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://solariq.co.th'

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
  metadataBase: new URL(appUrl),
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }],
    apple: '/favicon.svg',
  },
  openGraph: {
    type: 'website',
    locale: 'th_TH',
    url: appUrl,
    siteName: 'SolarIQ',
    title: 'SolarIQ - แพลตฟอร์มวิเคราะห์พลังงานแสงอาทิตย์อัจฉริยะ',
    description:
      'แพลตฟอร์มวิเคราะห์โซลาร์เซลล์สำหรับธุรกิจ คำนวณ ROI วิเคราะห์ผลตอบแทน บริหารลูกค้าเป้าหมาย',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'SolarIQ - Solar Energy Analysis Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SolarIQ - แพลตฟอร์มวิเคราะห์พลังงานแสงอาทิตย์อัจฉริยะ',
    description:
      'แพลตฟอร์มวิเคราะห์โซลาร์เซลล์สำหรับธุรกิจ คำนวณ ROI วิเคราะห์ผลตอบแทน บริหารลูกค้าเป้าหมาย',
    images: ['/og-image.png'],
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

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const locale = await getLocale()
  const messages = await getMessages()

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
