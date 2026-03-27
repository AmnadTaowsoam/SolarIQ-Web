import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Calendar, Clock, Tag, Share2, ArrowLeft, Facebook, Linkedin, Twitter } from 'lucide-react'
import fs from 'fs'
import path from 'path'
import ReactMarkdown from 'react-markdown'

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */
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

interface BlogPost {
  frontmatter: Frontmatter
  content: string
}

/* ------------------------------------------------------------------ */
/*  Utilities                                                           */
/* ------------------------------------------------------------------ */
function parseFrontmatter(content: string): Frontmatter {
  const frontmatterRegex = /^---\n([\s\S]*?)\n---/
  const match = content.match(frontmatterRegex)

  if (!match || !match[1]) {
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

function getBlogPostBySlug(slug: string): BlogPost | null {
  const blogDirectory = path.join(process.cwd(), 'content', 'blog')
  const filenames = fs.readdirSync(blogDirectory)

  for (const filename of filenames) {
    if (!filename.endsWith('.md')) {
      continue
    }

    const filePath = path.join(blogDirectory, filename)
    const content = fs.readFileSync(filePath, 'utf-8')
    const frontmatter = parseFrontmatter(content)

    if (frontmatter.slug === slug) {
      return {
        frontmatter,
        content: content.replace(/^---\n[\s\S]*?\n---\n/, ''),
      }
    }
  }

  return null
}

function getAllBlogPosts(): { slug: string; title: string }[] {
  const blogDirectory = path.join(process.cwd(), 'content', 'blog')
  const filenames = fs.readdirSync(blogDirectory)

  const posts: { slug: string; title: string }[] = []

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
    })
  }

  return posts
}

function getRelatedPosts(currentSlug: string, category: string, limit = 3) {
  const allPosts = getAllBlogPosts()
  const blogDirectory = path.join(process.cwd(), 'content', 'blog')

  const postsWithCategory: { slug: string; title: string; category: string }[] = []

  for (const post of allPosts) {
    const filePath = path.join(blogDirectory, `${post.slug}.md`)
    const content = fs.readFileSync(filePath, 'utf-8')
    const frontmatter = parseFrontmatter(content)

    if (frontmatter.slug === currentSlug) {
      continue
    }

    if (frontmatter.category === category) {
      postsWithCategory.push({
        slug: post.slug,
        title: post.title,
        category: frontmatter.category,
      })
    }
  }

  return postsWithCategory.slice(0, limit)
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
/*  Page Component                                                      */
/* ------------------------------------------------------------------ */
interface PageProps {
  params: { slug: string }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const post = getBlogPostBySlug(params.slug)

  if (!post) {
    return {
      title: 'ไม่พบบทความ - SolarIQ',
    }
  }

  return {
    title: `${post.frontmatter.title} - SolarIQ`,
    description: post.frontmatter.excerpt,
    keywords: post.frontmatter.tags,
    openGraph: {
      title: post.frontmatter.title,
      description: post.frontmatter.excerpt,
      type: 'article',
      publishedTime: post.frontmatter.date,
      authors: [post.frontmatter.author],
      locale: 'th_TH',
    },
  }
}

export default function BlogPostPage({ params }: PageProps) {
  const post = getBlogPostBySlug(params.slug)

  if (!post) {
    notFound()
  }

  const relatedPosts = getRelatedPosts(params.slug, post.frontmatter.category)

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
      {/* Article Header */}
      <article className="bg-gradient-to-br from-primary-600 via-primary-700 to-amber-600 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-primary-100 hover:text-white mb-8 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            กลับไปที่บล็อก
          </Link>

          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            {post.frontmatter.title}
          </h1>

          <p className="text-xl text-primary-100 mb-8">{post.frontmatter.excerpt}</p>

          <div className="flex flex-wrap items-center gap-6 text-primary-100">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              <time>{formatDate(post.frontmatter.date)}</time>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              <span>{post.frontmatter.readTime}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">โดย {post.frontmatter.author}</span>
            </div>
          </div>
        </div>
      </article>

      {/* Article Content */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 md:p-12">
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <ReactMarkdown>{post.content}</ReactMarkdown>
          </div>
        </div>
      </article>

      {/* Tags */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="flex items-center gap-3 flex-wrap">
          <Tag className="h-5 w-5 text-gray-400" />
          {post.frontmatter.tags.map((tag) => (
            <span
              key={tag}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-sm font-medium"
            >
              #{tag}
            </span>
          ))}
        </div>
      </section>

      {/* Share Buttons */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <Share2 className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            <h3 className="font-semibold text-gray-900 dark:text-white">แบ่งปันบทความ</h3>
          </div>
          <div className="flex gap-3">
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                typeof window !== 'undefined' ? window.location.href : ''
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-[#1877F2] text-white rounded-lg hover:bg-[#166FE5] transition-colors"
            >
              <Facebook className="h-5 w-5" />
              Facebook
            </a>
            <a
              href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(
                typeof window !== 'undefined' ? window.location.href : ''
              )}&text=${encodeURIComponent(post.frontmatter.title)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-[#000000] text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              <Twitter className="h-5 w-5" />
              Twitter
            </a>
            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
                typeof window !== 'undefined' ? window.location.href : ''
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-[#0A66C2] text-white rounded-lg hover:bg-[#095BC4] transition-colors"
            >
              <Linkedin className="h-5 w-5" />
              LinkedIn
            </a>
          </div>
        </div>
      </section>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            บทความที่เกี่ยวข้อง
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            {relatedPosts.map((relatedPost) => (
              <Link
                key={relatedPost.slug}
                href={`/blog/${relatedPost.slug}`}
                className="group block bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-700"
              >
                <div className="p-6">
                  <span className="inline-block px-3 py-1 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 text-xs font-medium rounded-full mb-3">
                    {relatedPost.category}
                  </span>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                    {relatedPost.title}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="bg-gradient-to-br from-primary-600 to-amber-600 rounded-xl p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-4">เริ่มต้นใช้งาน SolarIQ ฟรี</h2>
          <p className="text-primary-100 mb-6 max-w-2xl mx-auto">
            ทดลองใช้งาน SolarIQ ฟรี 14 วัน วิเคราะห์ศักยภาพโซลาร์เซลล์ และคำนวณ ROI ได้ทันที
          </p>
          <Link
            href="/signup"
            className="inline-block bg-white text-primary-600 font-semibold py-3 px-8 rounded-lg hover:bg-primary-50 transition-colors"
          >
            ทดลองฟรี
          </Link>
        </div>
      </section>
    </div>
  )
}
