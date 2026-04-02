import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Calendar, Clock, Tag, Share2, ArrowLeft, Facebook, Linkedin, Twitter } from 'lucide-react'
import { getBlogPostBySlug, getRelatedBlogPosts, renderMarkdownToHtml } from '@/lib/blog'
import { toAbsoluteUrl } from '@/lib/site'

export const runtime = 'edge'

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

interface PageProps {
  params: { slug: string }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const post = getBlogPostBySlug(params.slug)

  if (!post) {
    return { title: 'Post Not Found - SolarIQ' }
  }

  return {
    title: `${post.title} - SolarIQ`,
    description: post.excerpt,
    keywords: post.tags,
    alternates: {
      canonical: toAbsoluteUrl(`/blog/${post.slug}`),
    },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.date,
      authors: [post.author],
      locale: 'th_TH',
      url: toAbsoluteUrl(`/blog/${post.slug}`),
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
    },
  }
}

export default function BlogPostPage({ params }: PageProps) {
  const post = getBlogPostBySlug(params.slug)

  if (!post) {
    notFound()
  }

  const relatedPosts = getRelatedBlogPosts(params.slug, post.category)
  const articleUrl = toAbsoluteUrl(`/blog/${post.slug}`)
  const articleHtml = renderMarkdownToHtml(post.content)
  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    dateModified: post.date,
    mainEntityOfPage: articleUrl,
    articleSection: post.category,
    keywords: post.tags.join(', '),
    author: {
      '@type': 'Person',
      name: post.author,
    },
    publisher: {
      '@type': 'Organization',
      name: 'SolarIQ',
      url: toAbsoluteUrl('/'),
      logo: {
        '@type': 'ImageObject',
        url: toAbsoluteUrl('/SolarIQ/4.png'),
      },
    },
  }
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: toAbsoluteUrl('/'),
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Blog',
        item: toAbsoluteUrl('/blog'),
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: post.title,
        item: articleUrl,
      },
    ],
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <article className="bg-gradient-to-br from-primary-600 via-primary-700 to-amber-600 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-primary-100 hover:text-white mb-8 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Blog
          </Link>

          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">{post.title}</h1>
          <p className="text-xl text-primary-100 mb-8">{post.excerpt}</p>

          <div className="flex flex-wrap items-center gap-6 text-primary-100">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              <time>{formatDate(post.date)}</time>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              <span>{post.readTime}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">By {post.author}</span>
            </div>
          </div>
        </div>
      </article>

      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-[var(--brand-surface)] dark:bg-gray-800 rounded-xl shadow-lg p-8 md:p-12">
          <div
            className="prose prose-lg dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: articleHtml }}
          />
        </div>
      </article>

      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="flex items-center gap-3 flex-wrap">
          <Tag className="h-5 w-5 text-[var(--brand-text-secondary)]" />
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="px-4 py-2 bg-[var(--brand-background)] dark:bg-gray-800 text-[var(--brand-text)] dark:text-[var(--brand-text-secondary)] rounded-full text-sm font-medium"
            >
              #{tag}
            </span>
          ))}
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="bg-[var(--brand-surface)] dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-[var(--brand-border)] dark:border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <Share2 className="h-5 w-5 text-[var(--brand-text-secondary)] dark:text-[var(--brand-text-secondary)]" />
            <h3 className="font-semibold text-[var(--brand-text)] dark:text-white">
              Share This Article
            </h3>
          </div>
          <div className="flex gap-3">
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(articleUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-[#1877F2] text-white rounded-lg hover:bg-[#166FE5] transition-colors"
            >
              <Facebook className="h-5 w-5" />
              Facebook
            </a>
            <a
              href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(articleUrl)}&text=${encodeURIComponent(post.title)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-[#000000] text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              <Twitter className="h-5 w-5" />
              Twitter
            </a>
            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(articleUrl)}`}
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

      {relatedPosts.length > 0 && (
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <h2 className="text-2xl font-bold text-[var(--brand-text)] dark:text-white mb-6">
            Related Articles
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            {relatedPosts.map((relatedPost) => (
              <Link
                key={relatedPost.slug}
                href={`/blog/${relatedPost.slug}`}
                className="group block bg-[var(--brand-surface)] dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-[var(--brand-border)] dark:border-gray-700"
              >
                <div className="p-6">
                  <span className="inline-block px-3 py-1 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 text-xs font-medium rounded-full mb-3">
                    {relatedPost.category}
                  </span>
                  <h3 className="text-lg font-semibold text-[var(--brand-text)] dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                    {relatedPost.title}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="bg-gradient-to-br from-primary-600 to-amber-600 rounded-xl p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-4">Start Your SolarIQ Trial</h2>
          <p className="text-primary-100 mb-6 max-w-2xl mx-auto">
            Explore proposal generation, rooftop analysis, and ROI workflows with a live trial.
          </p>
          <Link
            href="/signup"
            className="inline-block bg-[var(--brand-surface)] text-primary-600 font-semibold py-3 px-8 rounded-lg hover:bg-primary-50 transition-colors"
          >
            Start Free Trial
          </Link>
        </div>
      </section>
    </div>
  )
}
