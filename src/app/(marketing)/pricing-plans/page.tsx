'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Check,
  X as XIcon,
  ChevronDown,
  ChevronUp,
  Shield,
  Lock,
  Database,
  Award,
  Zap,
  Rocket,
  Building2,
  Gift,
} from 'lucide-react'

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */
interface PlanFeature {
  text: string
}

interface Plan {
  id: string
  icon: React.ElementType
  name: string
  subtitle: string
  monthlyPrice: number | null
  annualPrice: number | null
  priceLabel?: string
  features: PlanFeature[]
  cta: string
  ctaHref: string
  popular: boolean
  highlight?: string
}

/* ------------------------------------------------------------------ */
/*  Data                                                                */
/* ------------------------------------------------------------------ */
const plans: Plan[] = [
  {
    id: 'free',
    icon: Gift,
    name: 'ทดลองฟรี',
    subtitle: 'Free Trial',
    monthlyPrice: 0,
    annualPrice: 0,
    priceLabel: 'ฟรี 14 วัน',
    features: [
      { text: 'วิเคราะห์โซลาร์: 5 ครั้ง' },
      { text: 'ROI Calculator พื้นฐาน' },
      { text: '1 ผู้ใช้' },
      { text: 'Community Support' },
    ],
    cta: 'เริ่มทดลองฟรี',
    ctaHref: '/signup',
    popular: false,
  },
  {
    id: 'starter',
    icon: Zap,
    name: 'Starter',
    subtitle: 'สำหรับทีมขนาดเล็ก',
    monthlyPrice: 2900,
    annualPrice: 2320,
    features: [
      { text: 'วิเคราะห์โซลาร์: 20 ครั้ง/เดือน' },
      { text: 'ROI Calculator พื้นฐาน' },
      { text: 'PDF Proposal Generation' },
      { text: 'Basic Dashboard' },
      { text: '1 ผู้ใช้' },
      { text: 'Email Support' },
    ],
    cta: 'เลือกแพ็กเกจนี้',
    ctaHref: '/signup',
    popular: false,
  },
  {
    id: 'pro',
    icon: Rocket,
    name: 'Professional',
    subtitle: 'สำหรับทีมที่ต้องการเติบโต',
    monthlyPrice: 7900,
    annualPrice: 6320,
    features: [
      { text: 'วิเคราะห์โซลาร์: 100 ครั้ง/เดือน' },
      { text: 'Climate Reliability Score' },
      { text: 'Energy Independence Score' },
      { text: 'PM2.5 Impact Analysis' },
      { text: 'เปรียบเทียบการลงทุน (เงินสด/สินเชื่อ/เช่า)' },
      { text: 'Smart Alerts อัจฉริยะ' },
      { text: 'Full Dashboard + CSV Export' },
      { text: 'API Access' },
      { text: '5 ผู้ใช้' },
      { text: 'Priority Support' },
    ],
    cta: 'เลือกแพ็กเกจนี้',
    ctaHref: '/signup',
    popular: true,
    highlight: 'ยอดนิยม',
  },
  {
    id: 'enterprise',
    icon: Building2,
    name: 'Enterprise',
    subtitle: 'สำหรับองค์กรขนาดใหญ่',
    monthlyPrice: 15000,
    annualPrice: 12000,
    features: [
      { text: 'วิเคราะห์โซลาร์: ไม่จำกัด' },
      { text: 'ทุกอย่างใน Professional +' },
      { text: 'White-label Branding' },
      { text: 'Custom API Integration' },
      { text: 'ผู้ใช้ไม่จำกัด' },
      { text: 'Dedicated Account Manager' },
      { text: 'SLA 99.9% Uptime' },
    ],
    cta: 'ติดต่อฝ่ายขาย',
    ctaHref: '/contact',
    popular: false,
  },
]

/* ------------------------------------------------------------------ */
/*  Comparison Table Data                                               */
/* ------------------------------------------------------------------ */
interface ComparisonRow {
  feature: string
  free: string | boolean
  starter: string | boolean
  professional: string | boolean
  enterprise: string | boolean
}

const comparisonData: ComparisonRow[] = [
  {
    feature: 'วิเคราะห์โซลาร์',
    free: '5 ครั้ง',
    starter: '20 ครั้ง/เดือน',
    professional: '100 ครั้ง/เดือน',
    enterprise: 'ไม่จำกัด',
  },
  {
    feature: 'ROI Calculator',
    free: 'พื้นฐาน',
    starter: 'พื้นฐาน',
    professional: true,
    enterprise: true,
  },
  {
    feature: 'PDF Proposal Generation',
    free: false,
    starter: true,
    professional: true,
    enterprise: true,
  },
  { feature: 'Dashboard', free: false, starter: 'Basic', professional: 'Full', enterprise: 'Full' },
  {
    feature: 'PM2.5 Impact Analysis',
    free: false,
    starter: false,
    professional: true,
    enterprise: true,
  },
  {
    feature: 'Climate Reliability Score',
    free: false,
    starter: false,
    professional: true,
    enterprise: true,
  },
  {
    feature: 'Energy Independence Score',
    free: false,
    starter: false,
    professional: true,
    enterprise: true,
  },
  {
    feature: 'เปรียบเทียบการลงทุน',
    free: false,
    starter: false,
    professional: true,
    enterprise: true,
  },
  { feature: 'Smart Alerts', free: false, starter: false, professional: true, enterprise: true },
  { feature: 'CSV Export', free: false, starter: false, professional: true, enterprise: true },
  { feature: 'API Access', free: false, starter: false, professional: true, enterprise: true },
  { feature: 'จำนวนผู้ใช้', free: '1', starter: '1', professional: '5', enterprise: 'ไม่จำกัด' },
  {
    feature: 'White-label Branding',
    free: false,
    starter: false,
    professional: false,
    enterprise: true,
  },
  {
    feature: 'Custom API Integration',
    free: false,
    starter: false,
    professional: false,
    enterprise: true,
  },
  {
    feature: 'Dedicated Account Manager',
    free: false,
    starter: false,
    professional: false,
    enterprise: true,
  },
  { feature: 'SLA Uptime', free: false, starter: false, professional: false, enterprise: '99.9%' },
  {
    feature: 'Support',
    free: 'Community',
    starter: 'Email',
    professional: 'Priority',
    enterprise: 'Dedicated',
  },
]

/* ------------------------------------------------------------------ */
/*  FAQ Data                                                            */
/* ------------------------------------------------------------------ */
const faqs = [
  {
    q: 'ทดลองฟรีมีข้อจำกัดอะไรบ้าง?',
    a: 'แพ็กเกจทดลองฟรีให้คุณใช้งานได้ 14 วัน พร้อมวิเคราะห์โซลาร์ 5 ครั้ง และ ROI Calculator พื้นฐาน ไม่ต้องใช้บัตรเครดิต เมื่อครบกำหนดคุณสามารถเลือกอัพเกรดเป็นแพ็กเกจที่เหมาะสมได้',
  },
  {
    q: 'เริ่มเรียกเก็บเงินเมื่อไหร่?',
    a: 'หลังจากทดลองใช้ฟรี 14 วัน ระบบจะไม่เรียกเก็บเงินอัตโนมัติ คุณต้องเลือกแพ็กเกจและชำระเงินด้วยตนเองเท่านั้น หากคุณไม่อัปเกรด คุณจะได้รับฟรี 5 leads/เดือนต่อไป',
  },
  {
    q: 'ต่ออายุอัตโนมัติหรือไม่?',
    a: 'แพ็กเกจรายเดือนและรายปีจะต่ออายุอัตโนมัติ คุณสามารถยกเลิกได้ตลอดเวลาจากหน้า Billing ในแพลตฟอร์ม เมื่อยกเลิก คุณจะยังใช้บริการได้จนสิ้นสุดรอบบิลปัจจุบัน',
  },
  {
    q: 'ขอรับใบกำกับภาษีได้อย่างไร?',
    a: 'สำหรับลูกค้าที่ต้องการใบกำกับภาษี (VAT Invoice) สามารถขอรับได้โดย: 1) ไปที่หน้า Billing > Invoices 2) คลิกปุ่ม "ขอใบกำกับภาษี" 3) กรอกข้อมูลบริษัท 4) ยืนยัน ระบบจะส่งใบกำกับภาษีให้ภายใน 3-7 วันทำการ',
  },
  {
    q: 'ยกเลิกแล้วข้อมูลจะเกิดอะไรขึ้น?',
    a: 'เมื่อยกเลิกแพ็กเกจ: 1) คุณยังสามารถใช้บริการได้จนสิ้นสุดรอบบิลปัจจุบัน 2) ข้อมูลทั้งหมดจะถูกเก็บรักษาเป็นเวลา 90 วัน 3) หลังจาก 90 วัน ข้อมูลจะถูกลบออกจากระบบถาวร คุณสามารถส่งออกข้อมูลก่อนยกเลิกได้',
  },
  {
    q: 'ขั้นตอนการขอคืนเงิน?',
    a: 'สำหรับแพ็กเกจรายปี: 1) ยกเลิกแพ็กเกจจากหน้า Billing 2) ส่งอีเมลไปที่ billing@solariqapp.com พร้อมระบุชื่อบัญชีและเหตุผล 3) ทีมงานตรวจสอบภายใน 3 วันทำการ 4) เงินคืนตามสัดส่วน (หักวันที่ใช้แล้ว) ภายใน 5-14 วันทำการ หมายเหตุ: แพ็กเกจรายเดือนไม่รับคืนเงิน',
  },
  {
    q: 'รองรับการชำระเงินแบบไหนบ้าง?',
    a: 'เรารองรับบัตรเครดิต/เดบิต (Visa, Mastercard, JCB), พร้อมเพย์ (PromptPay), โอนผ่านธนาคาร (SCB, KBANK, BBL) ผ่านระบบ Opn Payments ที่ปลอดภัย สำหรับแพ็กเกจ Enterprise สามารถออกใบแจ้งหนี้และชำระแบบรายปีได้',
  },
  {
    q: 'อัพเกรดหรือดาวน์เกรดได้ไหม?',
    a: 'ได้ คุณสามารถเปลี่ยนแพ็กเกจได้ตลอดเวลา เมื่ออัพเกรดจะมีผลทันที โดยระบบจะคำนวณค่าใช้จ่ายตามสัดส่วนวันที่เหลือ เมื่อดาวน์เกรดจะมีผลในรอบบิลถัดไป',
  },
  {
    q: 'ข้อมูลของฉันปลอดภัยหรือไม่?',
    a: 'ข้อมูลของคุณมีความปลอดภัยสูงสุด เราใช้ AES-256 Encryption, SSL/TLS สำหรับการเชื่อมต่อ ปฏิบัติตาม PDPA อย่างเคร่งครัด และจัดเก็บข้อมูลบน Google Cloud Platform ที่ได้รับมาตรฐาน ISO 27001',
  },
  {
    q: 'มีส่วนลดสำหรับองค์กรการศึกษาไหม?',
    a: 'มีครับ เรามีโปรแกรมพิเศษสำหรับสถาบันการศึกษาและองค์กรไม่แสวงผลกำไร โปรดติดต่อฝ่ายขายเพื่อขอรายละเอียดเพิ่มเติมและส่วนลดพิเศษ',
  },
]

/* ------------------------------------------------------------------ */
/*  FAQ Item                                                            */
/* ------------------------------------------------------------------ */
function FAQItem({ q, a }: { q: string; a: string }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="border-b border-[var(--brand-border)]">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between py-5 text-left"
      >
        <span className="text-base font-semibold text-[var(--brand-text)]">{q}</span>
        {isOpen ? (
          <ChevronUp className="h-5 w-5 shrink-0 text-primary-500" />
        ) : (
          <ChevronDown className="h-5 w-5 shrink-0 text-[var(--brand-text-secondary)]" />
        )}
      </button>
      {isOpen && (
        <div className="pb-5 text-sm leading-relaxed text-[var(--brand-text-secondary)]">{a}</div>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Cell Renderer for Comparison Table                                  */
/* ------------------------------------------------------------------ */
function CellValue({ value }: { value: string | boolean }) {
  if (value === true) {
    return <Check className="mx-auto h-5 w-5 text-primary-500" />
  }
  if (value === false) {
    return (
      <XIcon className="mx-auto h-5 w-5 text-[var(--brand-text-secondary)] dark:text-[var(--brand-text-secondary)]" />
    )
  }
  return <span className="text-sm text-[var(--brand-text)]">{value}</span>
}

/* ------------------------------------------------------------------ */
/*  Page                                                                */
/* ------------------------------------------------------------------ */
function getCtaHref(plan: Plan, annual: boolean): string {
  if (plan.id === 'free') {
    return '/signup?trial=true'
  }
  if (plan.id === 'enterprise') {
    return '/contact?subject=enterprise'
  }
  return `/checkout?plan=${plan.id}&billing=${annual ? 'annual' : 'monthly'}`
}

export default function PricingPlansPage() {
  const [annual, setAnnual] = useState(false)

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-500 to-amber-500 py-20 sm:py-28">
        <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-[var(--brand-surface)]/5" />
        <div className="absolute -bottom-40 -left-40 h-[400px] w-[400px] rounded-full bg-[var(--brand-surface)]/5" />
        <div className="relative mx-auto max-w-4xl px-4 text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight">
            เลือกแพ็กเกจที่เหมาะกับธุรกิจของคุณ
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-white/85">
            เริ่มต้นฟรี 14 วัน ไม่ต้องใช้บัตรเครดิต
          </p>

          {/* Toggle */}
          <div className="mt-10 inline-flex items-center gap-4 rounded-full bg-[var(--brand-surface)]/15 backdrop-blur p-1.5">
            <button
              onClick={() => setAnnual(false)}
              className={`rounded-full px-6 py-2 text-sm font-semibold transition-all ${
                !annual
                  ? 'bg-[var(--brand-surface)] text-primary-600 shadow'
                  : 'text-white hover:text-white/80'
              }`}
            >
              รายเดือน
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`rounded-full px-6 py-2 text-sm font-semibold transition-all ${
                annual
                  ? 'bg-[var(--brand-surface)] text-primary-600 shadow'
                  : 'text-white hover:text-white/80'
              }`}
            >
              รายปี
              <span className="ml-2 inline-block rounded-full bg-green-500 px-2 py-0.5 text-xs text-white">
                -20%
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="relative -mt-16 pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {plans.map((plan) => {
              const price =
                annual && plan.annualPrice !== null ? plan.annualPrice : plan.monthlyPrice
              const Icon = plan.icon

              return (
                <div
                  key={plan.id}
                  className={`relative flex flex-col rounded-2xl border p-6 lg:p-8 bg-[var(--brand-surface)] transition-all duration-300 hover:shadow-xl ${
                    plan.popular
                      ? 'border-primary-400 shadow-lg ring-2 ring-primary-400'
                      : 'border-[var(--brand-border)] shadow-sm'
                  }`}
                >
                  {plan.popular && plan.highlight && (
                    <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-primary-500 to-amber-500 px-4 py-1 text-xs font-bold text-white shadow">
                      {plan.highlight}
                    </span>
                  )}

                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary-50 to-amber-50 dark:from-primary-900/30 dark:to-amber-900/30">
                    <Icon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                  </div>

                  <h3 className="text-xl font-bold text-[var(--brand-text)]">{plan.name}</h3>
                  <p className="mt-1 text-sm text-[var(--brand-text-secondary)]">{plan.subtitle}</p>

                  <div className="mt-6">
                    {price === 0 ? (
                      <div>
                        <span className="text-3xl font-extrabold text-[var(--brand-text)]">
                          ฟรี
                        </span>
                        <span className="ml-2 text-sm text-[var(--brand-text-secondary)]">
                          14 วัน
                        </span>
                      </div>
                    ) : price !== null ? (
                      <div className="flex items-baseline gap-1">
                        <span className="text-sm text-[var(--brand-text-secondary)]">฿</span>
                        <span className="text-3xl font-extrabold text-[var(--brand-text)]">
                          {price.toLocaleString('th-TH')}
                        </span>
                        <span className="text-sm text-[var(--brand-text-secondary)]">/เดือน</span>
                      </div>
                    ) : (
                      <span className="text-2xl font-extrabold text-[var(--brand-text)]">
                        ติดต่อเรา
                      </span>
                    )}
                    {plan.priceLabel && price !== 0 && (
                      <p className="mt-1 text-xs text-[var(--brand-text-secondary)]">
                        {plan.priceLabel}
                      </p>
                    )}
                    {annual &&
                      plan.annualPrice !== null &&
                      plan.monthlyPrice !== null &&
                      plan.monthlyPrice > 0 && (
                        <p className="mt-1 text-xs text-[var(--brand-text-secondary)] line-through">
                          ฿{plan.monthlyPrice.toLocaleString('th-TH')}/เดือน
                        </p>
                      )}
                  </div>

                  <ul className="mt-6 flex-1 space-y-3">
                    {plan.features.map((f, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2.5 text-sm text-[var(--brand-text)]"
                      >
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary-500" />
                        {f.text}
                      </li>
                    ))}
                  </ul>

                  <Link
                    href={getCtaHref(plan, annual)}
                    className={`mt-8 block rounded-xl py-3 text-center text-sm font-semibold transition-all ${
                      plan.popular
                        ? 'bg-gradient-to-r from-primary-600 to-amber-500 text-white shadow-md hover:shadow-lg'
                        : 'border-2 border-primary-500 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20'
                    }`}
                  >
                    {plan.cta}
                  </Link>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Feature Comparison Table */}
      <section className="py-20 bg-[var(--brand-background)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[var(--brand-text)]">
              เปรียบเทียบฟีเจอร์ทั้งหมด
            </h2>
            <p className="mt-4 text-[var(--brand-text-secondary)]">
              ดูรายละเอียดทุกฟีเจอร์ในแต่ละแพ็กเกจ
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-[var(--brand-border)] bg-[var(--brand-surface)] shadow-sm">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="border-b border-[var(--brand-border)]">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--brand-text)]">
                    ฟีเจอร์
                  </th>
                  <th className="px-4 py-4 text-center text-sm font-semibold text-[var(--brand-text)]">
                    ทดลองฟรี
                  </th>
                  <th className="px-4 py-4 text-center text-sm font-semibold text-[var(--brand-text)]">
                    Starter
                  </th>
                  <th className="px-4 py-4 text-center text-sm font-semibold text-primary-600 dark:text-primary-400 bg-primary-50/50 dark:bg-primary-900/10">
                    Professional
                  </th>
                  <th className="px-4 py-4 text-center text-sm font-semibold text-[var(--brand-text)]">
                    Enterprise
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparisonData.map((row, i) => (
                  <tr
                    key={row.feature}
                    className={`border-b border-[var(--brand-border)] dark:border-gray-700/50 ${
                      i % 2 === 0
                        ? 'bg-[var(--brand-surface)]'
                        : 'bg-[var(--brand-background)]/50 dark:bg-gray-800/50'
                    }`}
                  >
                    <td className="px-6 py-3.5 text-sm text-[var(--brand-text)] font-medium">
                      {row.feature}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <CellValue value={row.free} />
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <CellValue value={row.starter} />
                    </td>
                    <td className="px-4 py-3.5 text-center bg-primary-50/30 dark:bg-primary-900/5">
                      <CellValue value={row.professional} />
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <CellValue value={row.enterprise} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* How Billing Works */}
      <section className="py-20 bg-[var(--brand-background)]">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[var(--brand-text)]">วิธีการเรียกเก็บเงิน</h2>
            <p className="mt-4 text-[var(--brand-text-secondary)]">
              เข้าใจกระบวนการการเรียกเก็บเงินที่โปร่งใสและง่ายดาย
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-4">
            {[
              {
                step: '1',
                title: 'ทดลองใช้ฟรี 14 วัน',
                description: 'ไม่มีการเรียกเก็บเงิน ไม่ต้องใช้บัตรเครดิต',
                icon: Gift,
              },
              {
                step: '2',
                title: 'เลือกแพ็กเกจ',
                description: 'คุณต้องเลือกแพ็กเกจด้วยตนเอง ไม่มีการเรียกเก็บอัตโนมัติ',
                icon: Rocket,
              },
              {
                step: '3',
                title: 'ชำระเงินครั้งแรก',
                description: 'รองรับบัตรเครดิต, พร้อมเพย์, โอนธนาคาร',
                icon: Lock,
              },
              {
                step: '4',
                title: 'ต่ออายุอัตโนมัติ',
                description: 'ยกเลิกได้ตลอดเวลาจากหน้า Billing',
                icon: Shield,
              },
            ].map((item) => (
              <div
                key={item.step}
                className="relative rounded-2xl border border-[var(--brand-border)] bg-[var(--brand-background)] dark:bg-gray-800 p-6 text-center"
              >
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900/30 text-xl font-bold text-primary-600 dark:text-primary-400">
                  {item.step}
                </div>
                <item.icon className="mx-auto mb-3 h-8 w-8 text-primary-500" />
                <h3 className="mb-2 font-semibold text-[var(--brand-text)]">{item.title}</h3>
                <p className="text-sm text-[var(--brand-text-secondary)]">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-[var(--brand-background)]">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[var(--brand-text)]">คำถามที่พบบ่อย</h2>
            <p className="mt-4 text-[var(--brand-text-secondary)]">
              หากมีคำถามเพิ่มเติม สามารถติดต่อเราได้ตลอดเวลา
            </p>
          </div>

          <div className="divide-y divide-[var(--brand-border)] dark:divide-gray-700 border-t border-[var(--brand-border)]">
            {faqs.map((faq) => (
              <FAQItem key={faq.q} q={faq.q} a={faq.a} />
            ))}
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-16 bg-[var(--brand-background)]">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Award, label: '500+ บริษัทที่ไว้วางใจ' },
              { icon: Database, label: 'ข้อมูลจาก Google Solar API' },
              { icon: Shield, label: 'PDPA Compliant' },
              { icon: Lock, label: 'SSL Encrypted' },
            ].map((badge) => (
              <div
                key={badge.label}
                className="flex flex-col items-center gap-3 rounded-xl bg-[var(--brand-surface)] p-6 shadow-sm border border-[var(--brand-border)] text-center"
              >
                <badge.icon className="h-8 w-8 text-primary-500" />
                <span className="text-sm font-semibold text-[var(--brand-text)]">
                  {badge.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-primary-600 via-primary-500 to-amber-500">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white">พร้อมเริ่มต้นแล้วหรือยัง?</h2>
          <p className="mt-4 text-lg text-white/85">
            เริ่มทดลองใช้ฟรี 14 วัน ไม่ต้องใช้บัตรเครดิต ยกเลิกได้ตลอดเวลา
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/signup?trial=true"
              className="inline-flex items-center gap-2 rounded-xl bg-[var(--brand-surface)] px-8 py-4 text-base font-bold text-primary-600 shadow-lg hover:shadow-xl hover:bg-[var(--brand-primary-light)] transition-all"
            >
              เริ่มทดลองฟรี
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-xl border-2 border-white/40 px-8 py-4 text-base font-bold text-white hover:bg-[var(--brand-surface)]/10 transition-all"
            >
              ติดต่อฝ่ายขาย
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
