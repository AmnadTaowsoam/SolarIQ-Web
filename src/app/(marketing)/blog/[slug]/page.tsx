export const runtime = 'edge'

import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Calendar, Clock, Tag, Share2, ArrowLeft, Facebook, Linkedin, Twitter } from 'lucide-react'

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */
interface BlogPostData {
  slug: string
  title: string
  excerpt: string
  category: string
  author: string
  date: string
  readTime: string
  tags: string[]
  content: string
}

/* ------------------------------------------------------------------ */
/*  Static blog data (edge-compatible, no fs required)                  */
/* ------------------------------------------------------------------ */
const BLOG_POSTS: BlogPostData[] = [
  {
    slug: 'solar-rooftop-roi',
    title: 'คู่มือคำนวณ ROI โซลาร์รูฟท็อป สำหรับผู้รับเหมา',
    excerpt: 'เรียนรู้วิธีคำนวณผลตอบแทนการลงทุนโซลาร์รูฟท็อปอย่างแม่นยำ พร้อมตัวอย่างจริง',
    category: 'การเงิน',
    author: 'SolarIQ Team',
    date: '2025-03-15',
    readTime: '8 นาที',
    tags: ['ROI', 'โซลาร์รูฟท็อป', 'การลงทุน'],
    content: `## ทำไมต้องคำนวณ ROI?\n\nการคำนวณ ROI (Return on Investment) เป็นสิ่งสำคัญสำหรับผู้รับเหมาโซลาร์เซลล์ เพราะจะช่วยให้ลูกค้าเข้าใจผลตอบแทนจากการลงทุนอย่างชัดเจน\n\n## สูตรคำนวณพื้นฐาน\n\nROI = (กำไรสุทธิ / ต้นทุนการลงทุน) × 100\n\n## ปัจจัยที่ต้องพิจารณา\n\n- ขนาดระบบ (kW)\n- ค่าไฟฟ้าปัจจุบัน\n- ปริมาณแสงอาทิตย์ในพื้นที่\n- อัตราค่าไฟที่คาดว่าจะเพิ่มขึ้น\n- อายุการใช้งานแผง (25 ปี)\n- ค่าบำรุงรักษา`,
  },
  {
    slug: 'choosing-solar-panels',
    title: 'วิธีเลือกแผงโซลาร์เซลล์ที่เหมาะสมกับลูกค้า',
    excerpt: 'เปรียบเทียบแผงโซลาร์เซลล์แต่ละประเภท พร้อมข้อดีข้อเสียเพื่อช่วยแนะนำลูกค้า',
    category: 'เทคนิค',
    author: 'SolarIQ Team',
    date: '2025-03-10',
    readTime: '6 นาที',
    tags: ['แผงโซลาร์', 'Mono', 'Poly', 'HJT'],
    content: `## ประเภทแผงโซลาร์เซลล์\n\n### 1. Monocrystalline (Mono)\n- ประสิทธิภาพสูง 20-22%\n- ราคาสูงกว่า\n- เหมาะกับพื้นที่จำกัด\n\n### 2. Polycrystalline (Poly)\n- ประสิทธิภาพ 15-17%\n- ราคาประหยัดกว่า\n- เหมาะกับงบประมาณจำกัด\n\n### 3. HJT (Heterojunction)\n- เทคโนโลยีใหม่ ประสิทธิภาพ 22-24%\n- ทนความร้อนดี\n- เหมาะกับสภาพอากาศร้อน`,
  },
  {
    slug: 'pm25-solar-impact',
    title: 'ผลกระทบ PM2.5 ต่อประสิทธิภาพโซลาร์เซลล์',
    excerpt: 'วิเคราะห์ผลกระทบฝุ่น PM2.5 ต่อการผลิตไฟฟ้าโซลาร์เซลล์ในประเทศไทย',
    category: 'วิจัย',
    author: 'SolarIQ Team',
    date: '2025-03-05',
    readTime: '5 นาที',
    tags: ['PM2.5', 'ประสิทธิภาพ', 'คุณภาพอากาศ'],
    content: `## PM2.5 กับโซลาร์เซลล์\n\nฝุ่น PM2.5 ส่งผลกระทบต่อประสิทธิภาพการผลิตไฟฟ้าของแผงโซลาร์เซลล์อย่างมีนัยสำคัญ\n\n## ผลกระทบที่พบ\n\n- ลดปริมาณแสงที่ตกกระทบแผง 10-30%\n- สะสมบนผิวแผงทำให้สกปรก\n- ลดอายุการใช้งานแผง\n\n## วิธีรับมือ\n\n- ล้างแผงสม่ำเสมอ\n- ติดตั้งระบบล้างอัตโนมัติ\n- คำนวณ ROI โดยหักลดประสิทธิภาพจาก PM2.5`,
  },
  {
    slug: 'mea-pea-permit',
    title: 'คู่มือขอใบอนุญาต MEA/PEA สำหรับโซลาร์รูฟท็อป',
    excerpt: 'ขั้นตอนการขอใบอนุญาตจาก MEA และ PEA สำหรับระบบโซลาร์รูฟท็อป',
    category: 'กฎหมาย',
    author: 'SolarIQ Team',
    date: '2025-02-28',
    readTime: '10 นาที',
    tags: ['MEA', 'PEA', 'ใบอนุญาต', 'กฎหมาย'],
    content: `## ขั้นตอนการขอใบอนุญาต\n\n### 1. เตรียมเอกสาร\n- สำเนาทะเบียนบ้าน\n- แบบแปลนบ้าน\n- รายละเอียดระบบโซลาร์\n\n### 2. ยื่นคำขอ\n- ยื่นที่สำนักงาน MEA/PEA ในพื้นที่\n- รอการตรวจสอบ 15-30 วัน\n\n### 3. ติดตั้งมิเตอร์\n- หลังอนุมัติ ติดตั้งมิเตอร์ 2 ทิศทาง\n- เริ่มขายไฟคืนได้`,
  },
  {
    slug: 'net-metering-thailand',
    title: 'Net Metering ในประเทศไทย: สิ่งที่ผู้รับเหมาต้องรู้',
    excerpt: 'ทำความเข้าใจระบบ Net Metering และการขายไฟคืนให้การไฟฟ้าในประเทศไทย',
    category: 'นโยบาย',
    author: 'SolarIQ Team',
    date: '2025-02-20',
    readTime: '7 นาที',
    tags: ['Net Metering', 'การขายไฟ', 'นโยบาย'],
    content: `## Net Metering คืออะไร?\n\nNet Metering คือระบบที่อนุญาตให้ผู้ใช้ไฟฟ้าที่มีแผงโซลาร์เซลล์สามารถขายไฟฟ้าส่วนเกินคืนให้การไฟฟ้าได้\n\n## สถานะในประเทศไทย\n\n- MEA/PEA รับซื้อไฟส่วนเกินในราคาที่กำหนด\n- อัตรารับซื้อประมาณ 2.20 บาท/kWh\n- สัญญา 10 ปี\n\n## ประโยชน์สำหรับผู้รับเหมา\n\n- เพิ่มจุดขายให้ลูกค้า\n- ลดระยะเวลาคืนทุน\n- สร้างรายได้เสริมให้ลูกค้า`,
  },
]

function getBlogPostBySlug(slug: string): BlogPostData | null {
  return BLOG_POSTS.find((post) => post.slug === slug) || null
}

function getRelatedPosts(currentSlug: string, category: string, limit = 3) {
  return BLOG_POSTS.filter((p) => p.slug !== currentSlug && p.category === category)
    .map((p) => ({ slug: p.slug, title: p.title, category: p.category }))
    .slice(0, limit)
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
    return { title: 'ไม่พบบทความ - SolarIQ' }
  }

  return {
    title: `${post.title} - SolarIQ`,
    description: post.excerpt,
    keywords: post.tags,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.date,
      authors: [post.author],
      locale: 'th_TH',
    },
  }
}

export default function BlogPostPage({ params }: PageProps) {
  const post = getBlogPostBySlug(params.slug)

  if (!post) {
    notFound()
  }

  const relatedPosts = getRelatedPosts(params.slug, post.category)

  // Simple markdown-to-html (edge-compatible, no ReactMarkdown needed)
  const contentHtml = post.content
    .replace(/^### (.*$)/gm, '<h3 class="text-xl font-bold mt-6 mb-2">$1</h3>')
    .replace(/^## (.*$)/gm, '<h2 class="text-2xl font-bold mt-8 mb-3">$1</h2>')
    .replace(/^- (.*$)/gm, '<li class="ml-4">$1</li>')
    .replace(/\n\n/g, '</p><p class="mb-4">')
    .replace(/\n/g, '<br/>')

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
              <span className="font-medium">โดย {post.author}</span>
            </div>
          </div>
        </div>
      </article>

      {/* Article Content */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-[var(--brand-surface)] dark:bg-gray-800 rounded-xl shadow-lg p-8 md:p-12">
          <div
            className="prose prose-lg dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: contentHtml }}
          />
        </div>
      </article>

      {/* Tags */}
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

      {/* Share Buttons */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="bg-[var(--brand-surface)] dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-[var(--brand-border)] dark:border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <Share2 className="h-5 w-5 text-[var(--brand-text-secondary)] dark:text-[var(--brand-text-secondary)]" />
            <h3 className="font-semibold text-[var(--brand-text)] dark:text-white">
              แบ่งปันบทความ
            </h3>
          </div>
          <div className="flex gap-3">
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`https://www.solariqapp.com/blog/${post.slug}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-[#1877F2] text-white rounded-lg hover:bg-[#166FE5] transition-colors"
            >
              <Facebook className="h-5 w-5" />
              Facebook
            </a>
            <a
              href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(`https://www.solariqapp.com/blog/${post.slug}`)}&text=${encodeURIComponent(post.title)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-[#000000] text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              <Twitter className="h-5 w-5" />
              Twitter
            </a>
            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`https://www.solariqapp.com/blog/${post.slug}`)}`}
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
          <h2 className="text-2xl font-bold text-[var(--brand-text)] dark:text-white mb-6">
            บทความที่เกี่ยวข้อง
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

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="bg-gradient-to-br from-primary-600 to-amber-600 rounded-xl p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-4">เริ่มต้นใช้งาน SolarIQ ฟรี</h2>
          <p className="text-primary-100 mb-6 max-w-2xl mx-auto">
            ทดลองใช้งาน SolarIQ ฟรี 14 วัน วิเคราะห์ศักยภาพโซลาร์เซลล์ และคำนวณ ROI ได้ทันที
          </p>
          <Link
            href="/signup"
            className="inline-block bg-[var(--brand-surface)] text-primary-600 font-semibold py-3 px-8 rounded-lg hover:bg-primary-50 transition-colors"
          >
            ทดลองฟรี
          </Link>
        </div>
      </section>
    </div>
  )
}
