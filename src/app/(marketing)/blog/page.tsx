import { Metadata } from 'next'
import Link from 'next/link'
import { Calendar, Clock, Tag, Search, Filter } from 'lucide-react'
import { getAllBlogPosts } from '@/lib/blog'
import { toAbsoluteUrl } from '@/lib/site'

export const runtime = 'edge'

function getCategories(posts: ReturnType<typeof getAllBlogPosts>): string[] {
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

export const metadata: Metadata = {
  title: 'SolarIQ Blog',
  description:
    'Insights on rooftop ROI, proposals, solar sales, and operations for solar teams in Thailand.',
  keywords: ['SolarIQ blog', 'solar rooftop', 'solar ROI', 'solar CRM', 'Thailand solar'],
  alternates: {
    canonical: toAbsoluteUrl('/blog'),
  },
  openGraph: {
    title: 'SolarIQ Blog',
    description:
      'Insights on rooftop ROI, proposals, solar sales, and operations for solar teams in Thailand.',
    type: 'website',
    locale: 'th_TH',
    url: toAbsoluteUrl('/blog'),
  },
}

export default function BlogPage() {
  const posts = getAllBlogPosts()
  const categories = getCategories(posts)

  return (
    <div className="min-h-screen bg-gradient-to-b from-[var(--brand-background)] to-[var(--brand-surface)]">
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-amber-600 py-20">
        <div className="absolute inset-0 bg-[url('/SolarIQ/4.png')] bg-cover bg-center opacity-10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">SolarIQ Blog</h1>
            <p className="text-xl text-primary-100 max-w-2xl mx-auto">
              Practical articles on rooftop ROI, proposal generation, solar sales, and field
              operations.
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1">
            <div className="mb-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--brand-text-secondary)]" />
                <input
                  type="text"
                  placeholder="Search articles..."
                  className="w-full pl-10 pr-4 py-3 border border-[var(--brand-border)] rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-[var(--brand-surface)] text-[var(--brand-text)]"
                />
              </div>
            </div>

            <div className="grid gap-8">
              {posts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="group block bg-[var(--brand-surface)] rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-[var(--brand-border)]"
                >
                  <div className="p-6">
                    <div className="flex items-center gap-4 mb-3">
                      <span className="px-3 py-1 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 text-sm font-medium rounded-full">
                        {post.category}
                      </span>
                      <div className="flex items-center gap-1 text-sm text-[var(--brand-text-secondary)]">
                        <Calendar className="h-4 w-4" />
                        <time>{formatDate(post.date)}</time>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-[var(--brand-text-secondary)]">
                        <Clock className="h-4 w-4" />
                        <span>{post.readTime}</span>
                      </div>
                    </div>

                    <h2 className="text-2xl font-bold text-[var(--brand-text)] mb-3 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                      {post.title}
                    </h2>

                    <p className="text-[var(--brand-text-secondary)] mb-4 line-clamp-2">
                      {post.excerpt}
                    </p>

                    <div className="flex items-center gap-2 flex-wrap">
                      <Tag className="h-4 w-4 text-[var(--brand-text-secondary)]" />
                      {post.tags.map((tag) => (
                        <span key={tag} className="text-sm text-[var(--brand-text-secondary)]">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <aside className="lg:w-80">
            <div className="bg-[var(--brand-surface)] rounded-xl shadow-sm p-6 mb-6 border border-[var(--brand-border)]">
              <div className="flex items-center gap-2 mb-4">
                <Filter className="h-5 w-5 text-primary-600" />
                <h3 className="text-lg font-semibold text-[var(--brand-text)]">Categories</h3>
              </div>
              <ul className="space-y-2">
                {categories.map((category) => (
                  <li key={category}>
                    <Link
                      href={`/blog?category=${category}`}
                      className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-[var(--brand-primary-light)] text-[var(--brand-text)] transition-colors"
                    >
                      <span>{category}</span>
                      <span className="text-sm text-[var(--brand-text-secondary)]">
                        {posts.filter((post) => post.category === category).length}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-gradient-to-br from-primary-600 to-amber-600 rounded-xl p-6 text-white">
              <h3 className="text-xl font-bold mb-3">Try SolarIQ Free</h3>
              <p className="text-primary-100 mb-4">
                Start a free trial and explore rooftop analysis, proposal workflows, and ROI tools.
              </p>
              <Link
                href="/signup"
                className="inline-block w-full text-center bg-[var(--brand-surface)] text-primary-600 font-semibold py-3 px-6 rounded-lg hover:bg-primary-50 transition-colors"
              >
                Start Free Trial
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
