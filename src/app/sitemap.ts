import { MetadataRoute } from 'next'
import fs from 'fs'
import path from 'path'

function getBlogPosts() {
  const blogDirectory = path.join(process.cwd(), 'content', 'blog')
  const filenames = fs.readdirSync(blogDirectory)
  const posts: { slug: string; date: string }[] = []

  for (const filename of filenames) {
    if (!filename.endsWith('.md')) {
      continue
    }

    const filePath = path.join(blogDirectory, filename)
    const content = fs.readFileSync(filePath, 'utf-8')
    const frontmatterRegex = /^---\n([\s\S]*?)\n---/
    const match = content.match(frontmatterRegex)

    if (match && match[1]) {
      const lines = match[1].split('\n')
      let slug = ''
      let date = ''

      for (const line of lines) {
        if (line.startsWith('slug:')) {
          slug = line.replace('slug:', '').trim().replace(/"/g, '')
        }
        if (line.startsWith('date:')) {
          date = line.replace('date:', '').trim().replace(/"/g, '')
        }
      }

      if (slug && date) {
        posts.push({ slug, date })
      }
    }
  }

  return posts
}

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://solariqapp.com'
  const blogPosts = getBlogPosts()

  const staticPages = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 1.0 },
    {
      url: `${baseUrl}/landing`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/pricing-plans`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/help`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    },
    {
      url: `${baseUrl}/refund-policy`,
      lastModified: new Date(),
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    },
  ]

  const blogPages = blogPosts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }))

  return [...staticPages, ...blogPages]
}
