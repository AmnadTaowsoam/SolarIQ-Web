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
            allow: ['/', '/landing', '/pricing-plans', '/about', '/contact', '/terms', '/privacy'],
            disallow: [
              '/dashboard',
              '/analyze',
              '/leads',
              '/deals',
              '/admin',
              '/api/',
              '/billing',
              '/settings',
            ],
          },
        ]
      : [{ userAgent: '*', disallow: '/' }],
    sitemap: isProduction ? `${SITE_URL}/sitemap.xml` : undefined,
  }
}
