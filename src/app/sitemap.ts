export const runtime = 'nodejs'

import { MetadataRoute } from 'next'
import { getAllBlogPosts } from '@/lib/blog'
import { SITE_URL } from '@/lib/site'

const STATIC_PAGE_LAST_MODIFIED = {
  '/': '2026-04-02T00:00:00.000Z',
  '/pricing-plans': '2026-04-02T00:00:00.000Z',
  '/about': '2026-03-15T00:00:00.000Z',
  '/contact': '2026-03-15T00:00:00.000Z',
  '/blog': '2026-04-02T00:00:00.000Z',
  '/help': '2026-03-20T00:00:00.000Z',
  '/terms': '2026-03-01T00:00:00.000Z',
  '/privacy': '2026-03-01T00:00:00.000Z',
  '/refund-policy': '2026-03-01T00:00:00.000Z',
  '/pdpa': '2026-03-10T00:00:00.000Z',
} as const

function staticLastModified(path: keyof typeof STATIC_PAGE_LAST_MODIFIED): Date {
  return new Date(STATIC_PAGE_LAST_MODIFIED[path])
}

export default function sitemap(): MetadataRoute.Sitemap {
  const blogPosts = getAllBlogPosts()

  const staticPages = [
    {
      url: SITE_URL,
      lastModified: staticLastModified('/'),
      changeFrequency: 'weekly' as const,
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/pricing-plans`,
      lastModified: staticLastModified('/pricing-plans'),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: staticLastModified('/about'),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/contact`,
      lastModified: staticLastModified('/contact'),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/blog`,
      lastModified: staticLastModified('/blog'),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/help`,
      lastModified: staticLastModified('/help'),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/pdpa`,
      lastModified: staticLastModified('/pdpa'),
      changeFrequency: 'yearly' as const,
      priority: 0.4,
    },
    {
      url: `${SITE_URL}/terms`,
      lastModified: staticLastModified('/terms'),
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/privacy`,
      lastModified: staticLastModified('/privacy'),
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/refund-policy`,
      lastModified: staticLastModified('/refund-policy'),
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    },
  ]

  const blogPages = blogPosts.map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }))

  return [...staticPages, ...blogPages]
}
