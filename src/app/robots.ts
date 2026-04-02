import { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/site'

export default function robots(): MetadataRoute.Robots {
  const isProduction =
    process.env.NODE_ENV === 'production' && !process.env.NEXT_PUBLIC_ENABLE_DEV_LOGIN

  return {
    rules: isProduction
      ? [
          {
            userAgent: '*',
            allow: [
              '/',
              '/pricing-plans',
              '/about',
              '/contact',
              '/blog',
              '/help',
              '/terms',
              '/privacy',
              '/pdpa',
            ],
            disallow: [
              '/admin',
              '/analytics',
              '/analyze',
              '/api/',
              '/bill-analysis',
              '/billing',
              '/calendar',
              '/commissions',
              '/dashboard',
              '/deals',
              '/developers',
              '/invoices',
              '/knowledge',
              '/leads',
              '/maintenance',
              '/messages',
              '/onboarding',
              '/permits',
              '/profile',
              '/service-requests',
              '/settings',
            ],
          },
        ]
      : [{ userAgent: '*', disallow: '/' }],
    sitemap: isProduction ? `${SITE_URL}/sitemap.xml` : undefined,
  }
}
