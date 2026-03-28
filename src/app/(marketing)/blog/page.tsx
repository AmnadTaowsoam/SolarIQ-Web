export const runtime = 'nodejs'

import { Metadata } from 'next'
import Link from 'next/link'
import { Calendar, Clock, Tag, Search, Filter } from 'lucide-react'
import fs from 'fs'
import path from 'path'

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */
interface BlogPost {
  slug: string
  title: string
  excerpt: string
  category: string
  author: string
  date: string
  readTime: string
  tags: string[]
}

interface Frontmatter {
  title: string
  slug: string
  category: string
  author: string
  date: string
  excerpt: string
  readTime: string
  tags: string[]
}

/* ------------------------------------------------------------------ */
/*  Utilities                                                           */
/* ------------------------------------------------------------------ */
function parseFrontmatter(content: string): Frontmatter {
  const frontmatterRegex = /^---\n([\s\S]*?)\n---/
  const match = content.match(frontmatterRegex)

  if (!match) {
    throw new Error('No frontmatter found')
  }

  const frontmatter: Record<string, string | string[]> = {}
  const lines = match[1].split('\n')

  for (const line of lines) {
    const colonIndex = line.indexOf(':')
    if (colonIndex === -1) {
      continue
    }

    const key = line.slice(0, colonIndex).trim()
    const value = line.slice(colonIndex + 1).trim()

    // Parse arrays
    if (value.startsWith('[') && value.endsWith(']')) {
      frontmatter[key] = value
        .slice(1, -1)
        .split(',')
        .map((item) => item.trim().replace(/"/g, ''))
    } else {
      frontmatter[key] = value.replace(/"/g, '')
    }
  }

  return frontmatter as unknown as Frontmatter
}

function getBlogPosts(): BlogPost[] {
  const blogDirectory = path.join(process.cwd(), 'content', 'blog')
  const filenames = fs.readdirSync(blogDirectory)

  const posts: BlogPost[] = []

  for (const filename of filenames) {
    if (!filename.endsWith('.md')) {
      continue
    }

    const filePath = path.join(blogDirectory, filename)
    const content = fs.readFileSync(filePath, 'utf-8')
    const frontmatter = parseFrontmatter(content)

    posts.push({
      slug: frontmatter.slug,
      title: frontmatter.title,
      excerpt: frontmatter.excerpt,
      category: frontmatter.category,
      author: frontmatter.author,
      date: frontmatter.date,
      readTime: frontmatter.readTime,
      tags: frontmatter.tags,
    })
  }

  // Sort by date (newest first)
  return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

function getCategories(posts: BlogPost[]): string[] {
  const categories = new Set(posts.map((post) => post.category))
  return Array.from(categories).sort()
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

/* ------------------------------------------------------------------ */
/*  SEO Metadata                                                        */
/* ------------------------------------------------------------------ */
export const metadata: Metadata = {
  title: 'บล็อก - SolarIQ',
  description: 'บทความและข้อมูลเกี่ยวกับพลังงานแสงอาทิตย์ โซลาร์เซลล์ และการประหยัดค่าไฟฟ้า',
  keywords: ['โซลาร์เซลล์', 'พลังงานแสงอาทิตย์', 'Solar Rooftop', 'ค่าไฟฟ้า', 'ROI'],
  openGraph: {
    title: 'บล็อก - SolarIQ',
    description: 'บทความและข้อมูลเกี่ยวกับพลังงานแสงอาทิตย์ โซลาร์เซลล์ และการประหยัดค่าไฟฟ้า',
    type: 'website',
    locale: 'th_TH',
  },
}

/* ------------------------------------------------------------------ */
/*  Page Component                                                      */
/* ------------------------------------------------------------------ */
export default function BlogPage() {
  const posts = getBlogPosts()
  const categories = getCategories(posts)

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-amber-600 py-20">
        <div className="absolute inset-0 bg-[url('/SolarIQ/4.png')] bg-cover bg-center opacity-10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">บล็อก SolarIQ</h1>
            <p className="text-xl text-primary-100 max-w-2xl mx-auto">
              บทความและข้อมูลเกี่ยวกับพลังงานแสงอาทิตย์ โซลาร์เซลล์ และการประหยัดค่าไฟฟ้า
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="flex-1">
            {/* Search Bar */}
            <div className="mb-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="ค้นหาบทความ..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                />
              </div>
            </div>

            {/* Blog Posts Grid */}
            <div className="grid gap-8">
              {posts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="group block bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-700"
                >
                  <div className="p-6">
                    {/* Category & Date */}
                    <div className="flex items-center gap-4 mb-3">
                      <span className="px-3 py-1 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 text-sm font-medium rounded-full">
                        {post.category}
                      </span>
                      <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                        <Calendar className="h-4 w-4" />
                        <time>{formatDate(post.date)}</time>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                        <Clock className="h-4 w-4" />
                        <span>{post.readTime}</span>
                      </div>
                    </div>

                    {/* Title */}
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                      {post.title}
                    </h2>

                    {/* Excerpt */}
                    <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                      {post.excerpt}
                    </p>

                    {/* Tags */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <Tag className="h-4 w-4 text-gray-400" />
                      {post.tags.map((tag) => (
                        <span key={tag} className="text-sm text-gray-500 dark:text-gray-400">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <aside className="lg:w-80">
            {/* Categories */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-4">
                <Filter className="h-5 w-5 text-primary-600" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">หมวดหมู่</h3>
              </div>
              <ul className="space-y-2">
                {categories.map((category) => (
                  <li key={category}>
                    <Link
                      href={`/blog?category=${category}`}
                      className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
                    >
                      <span>{category}</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {posts.filter((p) => p.category === category).length}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* CTA Card */}
            <div className="bg-gradient-to-br from-primary-600 to-amber-600 rounded-xl p-6 text-white">
              <h3 className="text-xl font-bold mb-3">เริ่มต้นใช้งาน SolarIQ ฟรี</h3>
              <p className="text-primary-100 mb-4">
                ทดลองใช้งาน SolarIQ ฟรี 14 วัน วิเคราะห์ศักยภาพโซลาร์เซลล์ และคำนวณ ROI ได้ทันที
              </p>
              <Link
                href="/signup"
                className="inline-block w-full text-center bg-white text-primary-600 font-semibold py-3 px-6 rounded-lg hover:bg-primary-50 transition-colors"
              >
                ทดลองฟรี
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
