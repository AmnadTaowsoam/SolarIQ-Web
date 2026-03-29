import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import {
  Search,
  Book,
  Video,
  FileText,
  HelpCircle,
  Zap,
  Users,
  Settings,
  Shield,
  LayoutGrid,
  ArrowRight,
} from 'lucide-react'

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */
interface HelpCategory {
  id: string
  title: string
  description: string
  icon: React.ElementType
  articles: HelpArticle[]
}

interface HelpArticle {
  id: string
  title: string
  description: string
  slug: string
}

/* ------------------------------------------------------------------ */
/*  Data                                                                */
/* ------------------------------------------------------------------ */
const helpCategories: HelpCategory[] = [
  {
    id: 'getting-started',
    title: 'เริ่มต้นใช้งาน',
    description: 'คู่มือการเริ่มต้นใช้งาน SolarIQ',
    icon: Book,
    articles: [
      {
        id: 'getting-started-1',
        title: 'สร้างบัญชีผู้ใช้',
        description: 'วิธีการสร้างบัญชีผู้ใช้ SolarIQ',
        slug: 'getting-started/create-account',
      },
      {
        id: 'getting-started-2',
        title: 'เชื่อมต่อ LINE Official Account',
        description: 'วิธีการเชื่อมต่อ LINE Official Account',
        slug: 'getting-started/connect-line',
      },
      {
        id: 'getting-started-3',
        title: 'วิเคราะห์พลังงานแสงอาทิตย์ครั้งแรก',
        description: 'วิธีการวิเคราะห์พลังงานแสงอาทิตย์ครั้งแรก',
        slug: 'getting-started/first-analysis',
      },
    ],
  },
  {
    id: 'features',
    title: 'ฟีเจอร์และฟังก์ชัน',
    description: 'คู่มือการใช้งานฟีเจอร์ต่างๆ',
    icon: Zap,
    articles: [
      {
        id: 'features-1',
        title: 'ROI Calculator',
        description: 'วิธีการใช้งาน ROI Calculator',
        slug: 'features/roi-calculator',
      },
      {
        id: 'features-2',
        title: 'Climate Reliability Score',
        description: 'วิธีการใช้งาน Climate Reliability Score',
        slug: 'features/climate-reliability',
      },
      {
        id: 'features-3',
        title: 'Energy Independence Score',
        description: 'วิธีการใช้งาน Energy Independence Score',
        slug: 'features/energy-independence',
      },
      {
        id: 'features-4',
        title: 'PM2.5 Impact Analysis',
        description: 'วิธีการใช้งาน PM2.5 Impact Analysis',
        slug: 'features/pm25-impact',
      },
    ],
  },
  {
    id: 'lead-management',
    title: 'การจัดการลีด',
    description: 'คู่มือการจัดการลีด',
    icon: Users,
    articles: [
      {
        id: 'leads-1',
        title: 'สร้างลีดใหม่',
        description: 'วิธีการสร้างลีดใหม่',
        slug: 'leads/create-lead',
      },
      {
        id: 'leads-2',
        title: 'ติดตามลีด',
        description: 'วิธีการติดตามลีด',
        slug: 'leads/follow-up-lead',
      },
      {
        id: 'leads-3',
        title: 'จัดการข้อมูลลูกค้า',
        description: 'วิธีการจัดการข้อมูลลูกค้า',
        slug: 'leads/manage-customer-data',
      },
    ],
  },
  {
    id: 'settings',
    title: 'การตั้งค่า',
    description: 'คู่มือการตั้งค่า',
    icon: Settings,
    articles: [
      {
        id: 'settings-1',
        title: 'ตั้งค่าโปรไฟล์',
        description: 'วิธีการตั้งค่าโปรไฟล์',
        slug: 'settings/profile',
      },
      {
        id: 'settings-2',
        title: 'ตั้งค่าพื้นที่บริการ',
        description: 'วิธีการตั้งค่าพื้นที่บริการ',
        slug: 'settings/service-area',
      },
      {
        id: 'settings-3',
        title: 'ตั้งค่าการแจ้งเตือน',
        description: 'วิธีการตั้งค่าการแจ้งเตือน',
        slug: 'settings/notifications',
      },
    ],
  },
  {
    id: 'billing',
    title: 'การเรียกเก็บเงิน',
    description: 'คู่มือการเรียกเก็บเงิน',
    icon: FileText,
    articles: [
      {
        id: 'billing-1',
        title: 'ดูใบแจ้งหนี้',
        description: 'วิธีการดูใบแจ้งหนี้',
        slug: 'billing/view-invoice',
      },
      {
        id: 'billing-2',
        title: 'เปลี่ยนแพ็กเกจ',
        description: 'วิธีการเปลี่ยนแพ็กเกจ',
        slug: 'billing/change-plan',
      },
      {
        id: 'billing-3',
        title: 'เพิ่มวิธีชำระเงิน',
        description: 'วิธีการเพิ่มวิธีชำระเงิน',
        slug: 'billing/add-payment-method',
      },
    ],
  },
  {
    id: 'security',
    title: 'ความปลอดภัย',
    description: 'คู่มือความปลอดภัย',
    icon: Shield,
    articles: [
      {
        id: 'security-1',
        title: 'ตั้งค่ารหัสผ่าน',
        description: 'วิธีการตั้งค่ารหัสผ่าน',
        slug: 'security/set-password',
      },
      {
        id: 'security-2',
        title: 'เปิดใช้งาน 2FA',
        description: 'วิธีการเปิดใช้งาน 2FA',
        slug: 'security/enable-2fa',
      },
      {
        id: 'security-3',
        title: 'จัดการเซสชัน',
        description: 'วิธีการจัดการเซสชัน',
        slug: 'security/manage-sessions',
      },
    ],
  },
]

const faqs = [
  {
    id: 'faq-1',
    question: 'SolarIQ คืออะไร?',
    answer:
      'SolarIQ เป็นแพลตฟอร์มวิเคราะห์พลังงานแสงอาทิตย์อัจฉริยะ สำหรับธุรกิจโซลาร์ยุคใหม่ในประเทศไทย ช่วยให้คุณวิเคราะห์ศักยภาพโซลาร์เซลล์ คำนวณ ROI และจัดการลูกค้าได้อย่างมีประสิทธิภาพ',
  },
  {
    id: 'faq-2',
    question: 'SolarIQ ราคาเท่าไหร่?',
    answer:
      'SolarIQ มีหลายแพ็กเกจให้เลือก ตั้งแต่ Free Trial, Starter, Professional และ Enterprise สำหรับรายละเอียดของราคา โปรดดูที่หน้า Pricing Plans',
  },
  {
    id: 'faq-3',
    question: 'ฉันสามารถทดลองใช้งาน SolarIQ ได้หรือไม่?',
    answer:
      'ใช่ คุณสามารถทดลองใช้งาน SolarIQ ฟรี 14 วัน โดยไม่ต้องใช้บัตรเครดิต หลังจากนั้นคุณสามารถเลือกแพ็กเกจที่เหมาะสมกับธุรกิจของคุณ',
  },
  {
    id: 'faq-4',
    question: 'ฉันต้องการอินเทอร์เน็ตหรือไม่?',
    answer:
      'ไม่ SolarIQ เป็นแพลตฟอร์มบนเว็บ คุณสามารถเข้าใช้งานผ่านเบราว์เซอร์บนคอมพิวเตอร์ แท็บเล็ต หรือมือถือได้ทันที',
  },
  {
    id: 'faq-5',
    question: 'ฉันสามารถยกเลิกการใช้งานได้หรือไม่?',
    answer: 'ใช่ คุณสามารถยกเลิกการใช้งาน SolarIQ ได้ทุกเมื่อ โดยไม่มีค่าธรรมเนียมในการยกเลิก',
  },
]

/* ------------------------------------------------------------------ */
/*  SEO Metadata                                                        */
/* ------------------------------------------------------------------ */
export const metadata: Metadata = {
  title: 'คลังความรู้ - SolarIQ',
  description: 'คู่มือการใช้งาน SolarIQ คำถามที่พบบ่อย และวิดีโอการสอนการใช้งาน',
  keywords: ['คู่มือ', 'คำถามที่พบบ่อย', 'วิดีโอ', 'SolarIQ'],
  openGraph: {
    title: 'คลังความรู้ - SolarIQ',
    description: 'คู่มือการใช้งาน SolarIQ คำถามที่พบบ่อย และวิดีโอการสอนการใช้งาน',
    type: 'website',
    locale: 'th_TH',
  },
}

/* ------------------------------------------------------------------ */
/*  Page Component                                                      */
/* ------------------------------------------------------------------ */
export default function HelpPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-amber-600 py-20">
        <div className="absolute inset-0 bg-[url('/SolarIQ/4.png')] bg-cover bg-center opacity-10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">คลังความรู้ SolarIQ</h1>
            <p className="text-xl text-primary-100 max-w-2xl mx-auto">
              คู่มือการใช้งาน คำถามที่พบบ่อย และวิดีโอการสอนการใช้งาน
            </p>
          </div>
        </div>
      </section>

      {/* Search Bar */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-[var(--brand-text-secondary)]" />
          <input
            type="text"
            placeholder="ค้นหาคำถามหรือหัวข้อ..."
            className="w-full pl-12 pr-4 py-4 border border-[var(--brand-border)] dark:border-gray-600 rounded-xl shadow-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800 dark:text-white text-lg"
          />
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Help Categories */}
        <section className="mb-16">
          <div className="flex items-center gap-2 mb-8">
            <LayoutGrid className="h-6 w-6 text-primary-600" />
            <h2 className="text-2xl font-bold text-[var(--brand-text)] dark:text-white">
              หมวดหมู่
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {helpCategories.map((category) => (
              <div
                key={category.id}
                className="bg-[var(--brand-surface)] dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-[var(--brand-border)] dark:border-gray-700"
              >
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100 dark:bg-primary-900">
                      <category.icon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-[var(--brand-text)] dark:text-white">
                      {category.title}
                    </h3>
                  </div>
                  <p className="text-[var(--brand-text-secondary)] dark:text-[var(--brand-text-secondary)] mb-4">
                    {category.description}
                  </p>
                  <ul className="space-y-2">
                    {category.articles.map((article) => (
                      <li key={article.id}>
                        <Link
                          href={`/help/${article.slug}`}
                          className="flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-[var(--brand-primary-light)] dark:hover:bg-gray-700 text-[var(--brand-text)] dark:text-[var(--brand-text-secondary)] transition-colors group"
                        >
                          <span className="flex-1">{article.title}</span>
                          <ArrowRight className="h-4 w-4 text-[var(--brand-text-secondary)] group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ Section */}
        <section className="mb-16">
          <div className="flex items-center gap-2 mb-8">
            <HelpCircle className="h-6 w-6 text-primary-600" />
            <h2 className="text-2xl font-bold text-[var(--brand-text)] dark:text-white">
              คำถามที่พบบ่อย
            </h2>
          </div>
          <div className="bg-[var(--brand-surface)] dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-[var(--brand-border)] dark:border-gray-700">
            <div className="space-y-4">
              {faqs.map((faq) => (
                <details
                  key={faq.id}
                  className="group border-b border-[var(--brand-border)] dark:border-gray-700 last:border-0 pb-4 last:pb-0"
                >
                  <summary className="flex items-center justify-between cursor-pointer list-none">
                    <h3 className="text-lg font-medium text-[var(--brand-text)] dark:text-white pr-4">
                      {faq.question}
                    </h3>
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--brand-background)] dark:bg-gray-700 text-[var(--brand-text-secondary)] dark:text-[var(--brand-text-secondary)] group-open:bg-primary-100 dark:group-open:bg-primary-900 group-open:text-primary-600 dark:group-open:text-primary-400 transition-colors">
                      +
                    </span>
                  </summary>
                  <p className="mt-4 text-[var(--brand-text-secondary)] dark:text-[var(--brand-text-secondary)] leading-relaxed">
                    {faq.answer}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Video Tutorials */}
        <section className="mb-16">
          <div className="flex items-center gap-2 mb-8">
            <Video className="h-6 w-6 text-primary-600" />
            <h2 className="text-2xl font-bold text-[var(--brand-text)] dark:text-white">
              วิดีโอการสอนการใช้งาน
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                id: 'video-1',
                title: 'เริ่มต้นใช้งาน SolarIQ',
                duration: '5:30',
                thumbnail: '/SolarIQ/1.png',
              },
              {
                id: 'video-2',
                title: 'วิเคราะห์พลังงานแสงอาทิตย์',
                duration: '8:15',
                thumbnail: '/SolarIQ/2.png',
              },
              {
                id: 'video-3',
                title: 'จัดการลีดด้วย SolarIQ',
                duration: '6:45',
                thumbnail: '/SolarIQ/3.png',
              },
            ].map((video) => (
              <div
                key={video.id}
                className="bg-[var(--brand-surface)] dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-[var(--brand-border)] dark:border-gray-700 group"
              >
                <div className="relative aspect-video bg-[var(--brand-border)] dark:bg-gray-700">
                  <Image src={video.thumbnail} alt={video.title} fill className="object-cover" />
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--brand-surface)]/90 text-primary-600">
                      <PlayIcon className="h-8 w-8 ml-1" />
                    </div>
                  </div>
                  <div className="absolute bottom-2 right-2 bg-black/75 text-white text-xs px-2 py-1 rounded">
                    {video.duration}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-[var(--brand-text)] dark:text-white">
                    {video.title}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section>
          <div className="bg-gradient-to-br from-primary-600 to-amber-600 rounded-xl p-8 text-white text-center">
            <h2 className="text-2xl font-bold mb-4">ยังมีคำถามหรือไม่?</h2>
            <p className="text-primary-100 mb-6 max-w-2xl mx-auto">
              ทีมงาน SolarIQ พร้อมให้ความช่วยเหลือคุณตลอด 24 ชั่วโมง
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 bg-[var(--brand-surface)] text-primary-600 font-semibold py-3 px-8 rounded-lg hover:bg-primary-50 transition-colors"
              >
                ติดต่อเรา
              </Link>
              <Link
                href="/signup"
                className="inline-flex items-center justify-center gap-2 bg-primary-700 text-white font-semibold py-3 px-8 rounded-lg hover:bg-primary-800 transition-colors"
              >
                ทดลองฟรี
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

function PlayIcon({ className }: { className: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  )
}
