import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://solariqapp.com'
  const isProduction = process.env.NODE_ENV === 'production' && !process.env.NEXT_PUBLIC_ENABLE_DEV_LOGIN

  return {
    rules: isProduction ? [
      {
        userAgent: '*',
        allow: ['/', '/landing', '/pricing-plans', '/about', '/contact', '/terms', '/privacy'],
        disallow: ['/dashboard', '/analyze', '/leads', '/deals', '/admin', '/api/', '/billing', '/settings'],
      },
    ] : [
      { userAgent: '*', disallow: '/' },
    ],
    sitemap: isProduction ? `${baseUrl}/sitemap.xml` : undefined,
  }
}
