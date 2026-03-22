'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import {
  Zap,
  FileText,
  BarChart3,
  Users,
  MessageCircle,
  LayoutDashboard,
  Clock,
  TrendingUp,
  Upload,
  Brain,
  Send,
  CheckCircle2,
  Star,
  ArrowRight,
  Menu,
  X,
  ChevronDown,
  Calculator,
  AlertTriangle,
  Search,
  FileWarning,
} from 'lucide-react'

/* ------------------------------------------------------------------ */
/*  Scroll-reveal hook                                                 */
/* ------------------------------------------------------------------ */
function useReveal() {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          obs.disconnect()
        }
      },
      { threshold: 0.12 },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return { ref, visible }
}

/* ------------------------------------------------------------------ */
/*  Section wrapper with reveal animation                              */
/* ------------------------------------------------------------------ */
function Section({
  children,
  className = '',
  id,
}: {
  children: React.ReactNode
  className?: string
  id?: string
}) {
  const { ref, visible } = useReveal()
  return (
    <section
      id={id}
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      } ${className}`}
    >
      {children}
    </section>
  )
}

/* ------------------------------------------------------------------ */
/*  Navbar                                                             */
/* ------------------------------------------------------------------ */
function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const links = [
    { label: 'ฟีเจอร์', href: '#features' },
    { label: 'แพ็กเกจ', href: '/pricing-plans' },
    { label: 'เกี่ยวกับเรา', href: '/about' },
    { label: 'ติดต่อ', href: '/contact' },
    { label: 'คำนวณ ROI', href: '#roi' },
  ]

  return (
    <nav
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur shadow-md'
          : 'bg-transparent'
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/landing" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary-500 to-amber-500">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <span
              className={`text-xl font-bold transition-colors ${
                scrolled ? 'text-gray-900' : 'text-white'
              }`}
            >
              SolarIQ
            </span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-6">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className={`text-sm font-medium transition-colors hover:text-primary-500 ${
                  scrolled ? 'text-gray-700' : 'text-white/90'
                }`}
              >
                {l.label}
              </a>
            ))}
            <Link
              href="/login"
              className="ml-2 rounded-lg bg-primary-600 px-5 py-2 text-sm font-semibold text-white shadow hover:bg-primary-700 transition-colors"
            >
              เข้าสู่ระบบ
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setOpen(!open)}
            className={`md:hidden p-2 rounded-lg transition-colors ${
              scrolled ? 'text-gray-700' : 'text-white'
            }`}
            aria-label="Toggle menu"
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-white border-t shadow-lg">
          <div className="px-4 py-3 space-y-2">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="block rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-primary-50 hover:text-primary-600"
              >
                {l.label}
              </a>
            ))}
            <Link
              href="/login"
              className="block rounded-lg bg-primary-600 px-3 py-2 text-center text-sm font-semibold text-white hover:bg-primary-700"
            >
              เข้าสู่ระบบ
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}

/* ------------------------------------------------------------------ */
/*  Hero                                                               */
/* ------------------------------------------------------------------ */
function Hero() {
  return (
    <div className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-primary-600 via-primary-500 to-amber-500">
      {/* Decorative circles */}
      <div className="absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full bg-white/5" />
      <div className="absolute -bottom-60 -left-60 h-[500px] w-[500px] rounded-full bg-white/5" />
      <div className="absolute top-1/3 right-1/4 h-72 w-72 rounded-full bg-amber-400/10" />

      <div className="relative mx-auto max-w-7xl px-4 py-32 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur px-4 py-1.5 text-sm font-medium text-white mb-8">
          <Zap className="h-4 w-4" />
          <span>แพลตฟอร์ม AI สำหรับธุรกิจโซลาร์เซลล์</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight tracking-tight">
          เปลี่ยนทุกใบเสนอราคา
          <br />
          <span className="text-amber-200">ให้เป็นยอดขาย</span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg sm:text-xl text-white/85 leading-relaxed">
          แพลตฟอร์ม AI วิเคราะห์พลังงานแสงอาทิตย์ สำหรับธุรกิจติดตั้งโซลาร์เซลล์
          <br className="hidden sm:block" />
          คำนวณ ROI อัตโนมัติ สร้างใบเสนอราคาใน 30 วินาที ปิดการขายได้เร็วขึ้น 3 เท่า
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/login"
            className="group inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-base font-bold text-primary-600 shadow-lg hover:shadow-xl hover:bg-gray-50 transition-all"
          >
            เริ่มใช้งานฟรี
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Link>
          <a
            href="#how-it-works"
            className="inline-flex items-center gap-2 rounded-xl border-2 border-white/40 px-8 py-4 text-base font-bold text-white hover:bg-white/10 transition-all"
          >
            ดูตัวอย่าง
            <ChevronDown className="h-5 w-5" />
          </a>
        </div>

        {/* Stats */}
        <div className="mx-auto mt-16 grid max-w-3xl grid-cols-3 gap-8">
          {[
            { value: '500+', label: 'บริษัทที่ใช้งาน' },
            { value: '30 วิ', label: 'สร้างใบเสนอราคา' },
            { value: '3x', label: 'ปิดการขายเร็วขึ้น' },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-3xl sm:text-4xl font-extrabold text-white">
                {s.value}
              </div>
              <div className="mt-1 text-sm text-white/70">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Pain Points                                                        */
/* ------------------------------------------------------------------ */
const painPoints = [
  {
    icon: Clock,
    title: 'ใช้เวลานานในการคำนวณ ROI',
    desc: 'ต้องใช้เวลาหลายชั่วโมงในการคำนวณผลตอบแทนการลงทุน ทำให้เสียโอกาสในการปิดการขาย',
  },
  {
    icon: FileWarning,
    title: 'ใบเสนอราคาไม่น่าเชื่อถือ',
    desc: 'ใบเสนอราคาที่สร้างด้วยมือมักมีข้อผิดพลาด ทำให้ลูกค้าไม่มั่นใจในตัวเลข',
  },
  {
    icon: Search,
    title: 'ติดตามลูกค้ายาก',
    desc: 'ไม่มีระบบจัดการลูกค้าที่เหมาะกับธุรกิจโซลาร์ ทำให้ลูกค้าหลุดมือ',
  },
  {
    icon: AlertTriangle,
    title: 'ไม่มีข้อมูลเชิงลึก',
    desc: 'ไม่สามารถวิเคราะห์ข้อมูลการขายและพฤติกรรมลูกค้าเพื่อปรับกลยุทธ์ได้',
  },
]

function PainPoints() {
  return (
    <Section id="pain-points" className="py-20 sm:py-28 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <span className="inline-block rounded-full bg-red-100 px-4 py-1 text-sm font-semibold text-red-600 mb-4">
            ปัญหาที่พบบ่อย
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
            ปัญหาที่ธุรกิจโซลาร์กำลังเผชิญ
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
            หลายธุรกิจโซลาร์เซลล์ยังคงใช้วิธีดั้งเดิมที่ไม่มีประสิทธิภาพ ทำให้สูญเสียโอกาสในการเติบโต
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {painPoints.map((p, i) => (
            <div
              key={i}
              className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-lg hover:border-primary-200 transition-all duration-300"
            >
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-500 group-hover:bg-primary-50 group-hover:text-primary-600 transition-colors">
                <p.icon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">{p.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </Section>
  )
}

/* ------------------------------------------------------------------ */
/*  How It Works                                                       */
/* ------------------------------------------------------------------ */
const steps = [
  {
    icon: Upload,
    num: '01',
    title: 'อัพโหลดบิลค่าไฟ',
    desc: 'ถ่ายรูปหรืออัพโหลดบิลค่าไฟฟ้าของลูกค้า รองรับทุกรูปแบบ',
  },
  {
    icon: Brain,
    num: '02',
    title: 'AI วิเคราะห์อัตโนมัติ',
    desc: 'ระบบ AI วิเคราะห์ข้อมูลการใช้ไฟ คำนวณขนาดระบบโซลาร์และ ROI ที่เหมาะสม',
  },
  {
    icon: Send,
    num: '03',
    title: 'ส่งใบเสนอราคาให้ลูกค้า',
    desc: 'ส่งใบเสนอราคาที่สวยงามและน่าเชื่อถือให้ลูกค้าผ่าน LINE หรืออีเมล',
  },
]

function HowItWorks() {
  return (
    <Section id="how-it-works" className="py-20 sm:py-28 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <span className="inline-block rounded-full bg-primary-100 px-4 py-1 text-sm font-semibold text-primary-600 mb-4">
            ง่ายใน 3 ขั้นตอน
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
            ใช้งานง่าย ได้ผลจริง
          </h2>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {steps.map((s, i) => (
            <div key={i} className="relative text-center">
              {/* Connector line */}
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-16 left-[60%] w-[80%] border-t-2 border-dashed border-primary-200" />
              )}
              <div className="relative mx-auto mb-6 flex h-32 w-32 items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary-100 to-amber-100" />
                <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-amber-500 shadow-lg">
                  <s.icon className="h-9 w-9 text-white" />
                </div>
                <span className="absolute -top-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-primary-600 text-xs font-bold text-white shadow">
                  {s.num}
                </span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900">{s.title}</h3>
              <p className="mx-auto mt-3 max-w-xs text-sm leading-relaxed text-gray-600">
                {s.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </Section>
  )
}

/* ------------------------------------------------------------------ */
/*  Features                                                           */
/* ------------------------------------------------------------------ */
const features = [
  {
    icon: Brain,
    title: 'AI Bill Analysis',
    thai: 'วิเคราะห์บิลค่าไฟด้วย AI',
    desc: 'อัพโหลดบิลค่าไฟ ระบบ AI จะอ่านและวิเคราะห์ข้อมูลการใช้ไฟฟ้าอัตโนมัติ',
  },
  {
    icon: Calculator,
    title: 'Solar ROI Calculator',
    thai: 'คำนวณผลตอบแทนโซลาร์',
    desc: 'คำนวณ ROI, ระยะเวลาคืนทุน, และประหยัดค่าไฟได้เท่าไหร่อย่างแม่นยำ',
  },
  {
    icon: FileText,
    title: 'Auto Proposal Generator',
    thai: 'สร้างใบเสนอราคาอัตโนมัติ',
    desc: 'สร้างใบเสนอราคาที่สวยงามและเป็นมืออาชีพใน 30 วินาที',
  },
  {
    icon: Users,
    title: 'Lead Management',
    thai: 'จัดการลูกค้า',
    desc: 'ติดตามสถานะลูกค้าทุกราย ตั้งแต่สนใจจนถึงปิดการขาย',
  },
  {
    icon: MessageCircle,
    title: 'LINE Integration',
    thai: 'เชื่อมต่อ LINE',
    desc: 'ส่งใบเสนอราคาและติดตามลูกค้าผ่าน LINE OA ได้โดยตรง',
  },
  {
    icon: LayoutDashboard,
    title: 'Real-time Dashboard',
    thai: 'แดชบอร์ดเรียลไทม์',
    desc: 'ดูภาพรวมยอดขาย อัตราการปิดการขาย และ KPI ทั้งหมดแบบเรียลไทม์',
  },
]

function Features() {
  return (
    <Section id="features" className="py-20 sm:py-28 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <span className="inline-block rounded-full bg-primary-100 px-4 py-1 text-sm font-semibold text-primary-600 mb-4">
            ฟีเจอร์ทั้งหมด
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
            ทุกเครื่องมือที่คุณต้องการ
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
            ครบจบในแพลตฟอร์มเดียว ตั้งแต่วิเคราะห์บิลค่าไฟจนถึงปิดการขาย
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <div
              key={i}
              className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-lg hover:border-primary-200 transition-all duration-300"
            >
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary-50 to-amber-50 text-primary-600 group-hover:from-primary-100 group-hover:to-amber-100 transition-colors">
                <f.icon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">{f.title}</h3>
              <p className="text-sm text-primary-600 font-medium">{f.thai}</p>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </Section>
  )
}

/* ------------------------------------------------------------------ */
/*  Pricing                                                            */
/* ------------------------------------------------------------------ */
const tiers = [
  {
    name: 'Starter',
    price: '2,900',
    desc: 'สำหรับทีมขนาดเล็กที่เริ่มต้น',
    features: [
      'วิเคราะห์บิลค่าไฟ 50 ครั้ง/เดือน',
      'สร้างใบเสนอราคาอัตโนมัติ',
      'จัดการลูกค้าสูงสุด 100 ราย',
      'แดชบอร์ดพื้นฐาน',
      'อีเมลซัพพอร์ต',
    ],
    cta: 'เริ่มทดลองใช้ฟรี',
    popular: false,
  },
  {
    name: 'Professional',
    price: '7,900',
    desc: 'สำหรับทีมที่ต้องการเติบโต',
    features: [
      'วิเคราะห์บิลค่าไฟไม่จำกัด',
      'สร้างใบเสนอราคาแบบกำหนดเอง',
      'จัดการลูกค้าไม่จำกัด',
      'LINE OA Integration',
      'แดชบอร์ดขั้นสูง + รายงาน',
      'ซัพพอร์ตทาง LINE ภายใน 2 ชม.',
      'API Access',
    ],
    cta: 'เริ่มทดลองใช้ฟรี',
    popular: true,
  },
  {
    name: 'Enterprise',
    price: 'ติดต่อเรา',
    desc: 'สำหรับองค์กรขนาดใหญ่',
    features: [
      'ทุกฟีเจอร์ใน Professional',
      'White-label branding',
      'Custom AI model training',
      'Dedicated account manager',
      'SLA 99.9% uptime',
      'On-premise deployment option',
      'Priority support 24/7',
    ],
    cta: 'ติดต่อฝ่ายขาย',
    popular: false,
  },
]

function Pricing() {
  return (
    <Section id="pricing" className="py-20 sm:py-28 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <span className="inline-block rounded-full bg-primary-100 px-4 py-1 text-sm font-semibold text-primary-600 mb-4">
            ราคา
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
            แพ็กเกจที่เหมาะกับทุกธุรกิจ
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
            ทดลองใช้ฟรี 14 วัน ไม่ต้องใส่บัตรเครดิต
          </p>
        </div>

        <div className="mt-14 grid gap-8 lg:grid-cols-3">
          {tiers.map((t, i) => (
            <div
              key={i}
              className={`relative rounded-2xl border p-8 transition-all duration-300 hover:shadow-xl ${
                t.popular
                  ? 'border-primary-400 bg-white shadow-lg ring-2 ring-primary-400'
                  : 'border-gray-200 bg-white shadow-sm'
              }`}
            >
              {t.popular && (
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-primary-500 to-amber-500 px-4 py-1 text-xs font-bold text-white shadow">
                  แนะนำ
                </span>
              )}
              <h3 className="text-xl font-bold text-gray-900">{t.name}</h3>
              <p className="mt-1 text-sm text-gray-500">{t.desc}</p>

              <div className="mt-6">
                {t.price === 'ติดต่อเรา' ? (
                  <span className="text-3xl font-extrabold text-gray-900">{t.price}</span>
                ) : (
                  <div className="flex items-baseline gap-1">
                    <span className="text-sm text-gray-500">฿</span>
                    <span className="text-4xl font-extrabold text-gray-900">{t.price}</span>
                    <span className="text-sm text-gray-500">/เดือน</span>
                  </div>
                )}
              </div>

              <ul className="mt-8 space-y-3">
                {t.features.map((f, fi) => (
                  <li key={fi} className="flex items-start gap-3 text-sm text-gray-700">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary-500" />
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                href="/login"
                className={`mt-8 block rounded-xl py-3 text-center text-sm font-semibold transition-all ${
                  t.popular
                    ? 'bg-gradient-to-r from-primary-600 to-amber-500 text-white shadow-md hover:shadow-lg'
                    : 'border-2 border-primary-500 text-primary-600 hover:bg-primary-50'
                }`}
              >
                {t.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </Section>
  )
}

/* ------------------------------------------------------------------ */
/*  ROI Calculator                                                     */
/* ------------------------------------------------------------------ */
function ROICalculator() {
  const [clients, setClients] = useState(20)

  const manualHoursPerClient = 2.5
  const solariqMinutesPerClient = 5
  const avgDealValue = 350000 // THB
  const closeRateImprovement = 0.15

  const timeSavedHours = Math.round(clients * (manualHoursPerClient - solariqMinutesPerClient / 60))
  const additionalDeals = Math.round(clients * closeRateImprovement)
  const revenueIncrease = additionalDeals * avgDealValue

  const formatNumber = (n: number) => n.toLocaleString('th-TH')

  return (
    <Section id="roi" className="py-20 sm:py-28 bg-gradient-to-br from-primary-600 via-primary-500 to-amber-500">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <span className="inline-block rounded-full bg-white/20 backdrop-blur px-4 py-1 text-sm font-semibold text-white mb-4">
            ROI Calculator
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white">
            คำนวณผลตอบแทนของคุณ
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-white/80">
            ดูว่า SolarIQ จะช่วยธุรกิจของคุณประหยัดเวลาและเพิ่มรายได้ได้เท่าไหร่
          </p>
        </div>

        <div className="mx-auto mt-12 max-w-3xl rounded-2xl bg-white p-8 shadow-2xl">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            จำนวนลูกค้าเฉลี่ยต่อเดือน
          </label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min={5}
              max={200}
              value={clients}
              onChange={(e) => setClients(Number(e.target.value))}
              className="h-2 w-full cursor-pointer appearance-none rounded-full bg-primary-100 accent-primary-600"
            />
            <span className="min-w-[3rem] rounded-lg bg-primary-50 px-3 py-1.5 text-center text-lg font-bold text-primary-700">
              {clients}
            </span>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            <div className="rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 p-5 text-center">
              <Clock className="mx-auto mb-2 h-8 w-8 text-blue-600" />
              <div className="text-3xl font-extrabold text-blue-700">{timeSavedHours}</div>
              <div className="text-sm text-blue-600 font-medium">ชั่วโมง/เดือนที่ประหยัดได้</div>
            </div>
            <div className="rounded-xl bg-gradient-to-br from-green-50 to-green-100 p-5 text-center">
              <TrendingUp className="mx-auto mb-2 h-8 w-8 text-green-600" />
              <div className="text-3xl font-extrabold text-green-700">+{additionalDeals}</div>
              <div className="text-sm text-green-600 font-medium">ดีลที่ปิดได้เพิ่ม/เดือน</div>
            </div>
            <div className="rounded-xl bg-gradient-to-br from-primary-50 to-amber-100 p-5 text-center">
              <BarChart3 className="mx-auto mb-2 h-8 w-8 text-primary-600" />
              <div className="text-3xl font-extrabold text-primary-700">
                ฿{formatNumber(revenueIncrease)}
              </div>
              <div className="text-sm text-primary-600 font-medium">รายได้ที่เพิ่มขึ้น/เดือน</div>
            </div>
          </div>
        </div>
      </div>
    </Section>
  )
}

/* ------------------------------------------------------------------ */
/*  Testimonials                                                       */
/* ------------------------------------------------------------------ */
const testimonials = [
  {
    name: 'คุณสมชาย วิริยะกุล',
    role: 'กรรมการผู้จัดการ',
    company: 'กรีนเพาเวอร์ โซลาร์ จำกัด',
    text: 'SolarIQ ช่วยให้ทีมขายของเราสร้างใบเสนอราคาได้เร็วขึ้น 10 เท่า ลูกค้าประทับใจความเป็นมืออาชีพ ยอดขายเพิ่มขึ้น 40% ในไตรมาสแรก',
    rating: 5,
  },
  {
    name: 'คุณนภา แสงทอง',
    role: 'ผู้อำนวยการฝ่ายขาย',
    company: 'ซันไรส์ เอนเนอร์จี กรุ๊ป',
    text: 'ระบบ AI วิเคราะห์บิลค่าไฟได้แม่นยำมาก ลูกค้าเชื่อมั่นในตัวเลขที่เราเสนอ ทำให้อัตราการปิดการขายสูงขึ้นอย่างเห็นได้ชัด',
    rating: 5,
  },
  {
    name: 'คุณวิชัย พลังงาม',
    role: 'เจ้าของกิจการ',
    company: 'โซลาร์พลัส เทคโนโลยี',
    text: 'จากที่เคยใช้ Excel คำนวณเอง เปลี่ยนมาใช้ SolarIQ แล้วประหยัดเวลาได้มหาศาล ทีมงานมีเวลาไปพบลูกค้าได้มากขึ้น',
    rating: 5,
  },
]

function Testimonials() {
  return (
    <Section className="py-20 sm:py-28 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <span className="inline-block rounded-full bg-primary-100 px-4 py-1 text-sm font-semibold text-primary-600 mb-4">
            ลูกค้าของเรา
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
            เสียงจากผู้ใช้จริง
          </h2>
        </div>

        <div className="mt-14 grid gap-8 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-lg transition-shadow duration-300"
            >
              <div className="flex gap-1 mb-4">
                {Array.from({ length: t.rating }).map((_, si) => (
                  <Star
                    key={si}
                    className="h-5 w-5 fill-amber-400 text-amber-400"
                  />
                ))}
              </div>
              <p className="text-sm leading-relaxed text-gray-700">&ldquo;{t.text}&rdquo;</p>
              <div className="mt-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary-400 to-amber-400 text-sm font-bold text-white">
                  {t.name.charAt(3)}
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-900">{t.name}</div>
                  <div className="text-xs text-gray-500">
                    {t.role}, {t.company}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Section>
  )
}

/* ------------------------------------------------------------------ */
/*  CTA Footer                                                         */
/* ------------------------------------------------------------------ */
function CTAFooter() {
  return (
    <Section className="py-20 sm:py-28 bg-white">
      <div className="mx-auto max-w-4xl px-4 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
          พร้อมเพิ่มยอดขายโซลาร์ของคุณ?
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
          เริ่มทดลองใช้ฟรี 14 วัน ไม่ต้องใส่บัตรเครดิต ยกเลิกได้ตลอดเวลา
        </p>
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/login"
            className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary-600 to-amber-500 px-8 py-4 text-base font-bold text-white shadow-lg hover:shadow-xl transition-all"
          >
            เริ่มใช้งานฟรี
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            href="/pricing-plans"
            className="inline-flex items-center gap-2 rounded-xl border-2 border-gray-300 px-8 py-4 text-base font-bold text-gray-700 hover:border-primary-400 hover:text-primary-600 transition-all"
          >
            ดูแพ็กเกจราคา
          </Link>
        </div>
      </div>
    </Section>
  )
}

/* ------------------------------------------------------------------ */
/*  Footer                                                             */
/* ------------------------------------------------------------------ */
function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-gray-50 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary-500 to-amber-500">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900">SolarIQ</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500">
            <Link href="/pricing-plans" className="hover:text-primary-600 transition-colors">
              แพ็กเกจ
            </Link>
            <Link href="/about" className="hover:text-primary-600 transition-colors">
              เกี่ยวกับเรา
            </Link>
            <Link href="/contact" className="hover:text-primary-600 transition-colors">
              ติดต่อ
            </Link>
            <Link href="/privacy" className="hover:text-primary-600 transition-colors">
              นโยบาย
            </Link>
            <Link href="/terms" className="hover:text-primary-600 transition-colors">
              ข้อกำหนด
            </Link>
            <Link href="/login" className="hover:text-primary-600 transition-colors">
              เข้าสู่ระบบ
            </Link>
          </div>
          <p className="text-sm text-gray-400">
            &copy; {new Date().getFullYear()} SolarIQ. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */
export default function LandingPage() {
  return (
    <div className="min-h-screen scroll-smooth">
      <Navbar />
      <Hero />
      <PainPoints />
      <HowItWorks />
      <Features />
      <Pricing />
      <ROICalculator />
      <Testimonials />
      <CTAFooter />
      <Footer />
    </div>
  )
}
