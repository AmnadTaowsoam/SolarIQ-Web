import Link from 'next/link'
import {
  Target,
  Zap,
  Shield,
  Globe,
  Cloud,
  Sun,
  Satellite,
  Wind,
  CreditCard,
  ArrowRight,
  MonitorSmartphone,
  Code2,
  CalendarClock,
} from 'lucide-react'

/* ------------------------------------------------------------------ */
/*  Data                                                                */
/* ------------------------------------------------------------------ */
const pillars = [
  {
    icon: Target,
    title: 'แม่นยำ',
    desc: 'ข้อมูลจาก Google Solar API + NASA POWER ให้ผลลัพธ์การวิเคราะห์ที่แม่นยำสูง',
  },
  {
    icon: Zap,
    title: 'รวดเร็ว',
    desc: 'วิเคราะห์พลังงานแสงอาทิตย์และ ROI ภายใน 30 วินาที พร้อมรายงานทันที',
  },
  {
    icon: Globe,
    title: 'ออกแบบมาสำหรับไทย',
    desc: 'รองรับค่าไฟ PEA/MEA สภาพอากาศท้องถิ่น และข้อมูลฝุ่น PM2.5 ของประเทศไทย',
  },
  {
    icon: Shield,
    title: 'ปลอดภัย',
    desc: 'ปฏิบัติตาม PDPA อย่างเคร่งครัด พร้อม SSL และ AES-256 Encryption',
  },
]

const partners = [
  { icon: Cloud, name: 'Google Cloud Platform' },
  { icon: Sun, name: 'Google Solar API' },
  { icon: Satellite, name: 'NASA POWER' },
  { icon: Wind, name: 'OpenWeatherMap' },
  { icon: CreditCard, name: 'Opn Payments' },
]

const numbers = [
  { icon: Code2, value: '22+', label: 'ฟีเจอร์วิเคราะห์' },
  { icon: MonitorSmartphone, value: '9', label: 'หน้าจอวิเคราะห์' },
  { icon: Zap, value: '22', label: 'API Endpoints' },
  { icon: CalendarClock, value: '25 ปี', label: 'การคำนวณ ROI' },
]

const team = [
  { name: 'คุณสมชาย กิจเจริญ', role: 'CEO & Founder', initials: 'ส' },
  { name: 'คุณนภา เทคโนโลยี', role: 'CTO', initials: 'น' },
  { name: 'คุณวิชัย พัฒนาการ', role: 'Lead Developer', initials: 'ว' },
  { name: 'คุณอรุณ แสงทอง', role: 'Head of Sales', initials: 'อ' },
]

/* ------------------------------------------------------------------ */
/*  Page                                                                */
/* ------------------------------------------------------------------ */
export default function AboutPage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-500 to-amber-500 py-20 sm:py-28">
        <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-white/5" />
        <div className="absolute -bottom-40 -left-40 h-[400px] w-[400px] rounded-full bg-white/5" />
        <div className="relative mx-auto max-w-4xl px-4 text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight">
            เกี่ยวกับ SolarIQ
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-white/85 leading-relaxed">
            แพลตฟอร์มวิเคราะห์พลังงานแสงอาทิตย์อัจฉริยะ สำหรับธุรกิจโซลาร์ยุคใหม่
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20 bg-white dark:bg-gray-950">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-block rounded-full bg-primary-100 dark:bg-primary-900/30 px-4 py-1 text-sm font-semibold text-primary-600 dark:text-primary-400 mb-4">
            พันธกิจของเรา
          </span>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Our Mission</h2>
          <p className="mx-auto mt-6 max-w-3xl text-lg leading-relaxed text-gray-600 dark:text-gray-400">
            เราเชื่อว่าพลังงานสะอาดคืออนาคต SolarIQ ถูกสร้างขึ้นเพื่อช่วยให้ธุรกิจโซลาร์ในประเทศไทย
            เข้าถึงเครื่องมือวิเคราะห์ระดับโลก ด้วยข้อมูลที่แม่นยำ เทคโนโลยี AI ที่ล้ำสมัย
            และประสบการณ์การใช้งานที่เรียบง่าย เพื่อเร่งการเปลี่ยนผ่านสู่พลังงานสะอาดในประเทศไทย
          </p>
        </div>
      </section>

      {/* Why SolarIQ - 4 Pillars */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="inline-block rounded-full bg-primary-100 dark:bg-primary-900/30 px-4 py-1 text-sm font-semibold text-primary-600 dark:text-primary-400 mb-4">
              ทำไมต้อง SolarIQ
            </span>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Why SolarIQ?</h2>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {pillars.map((p) => (
              <div
                key={p.title}
                className="group rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm hover:shadow-lg hover:border-primary-200 dark:hover:border-primary-700 transition-all duration-300"
              >
                <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-primary-50 to-amber-50 dark:from-primary-900/30 dark:to-amber-900/30 text-primary-600 dark:text-primary-400 group-hover:from-primary-100 group-hover:to-amber-100 transition-colors">
                  <p.icon className="h-7 w-7" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                  {p.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Partners */}
      <section className="py-20 bg-white dark:bg-gray-950">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="inline-block rounded-full bg-primary-100 dark:bg-primary-900/30 px-4 py-1 text-sm font-semibold text-primary-600 dark:text-primary-400 mb-4">
              Technology Partners
            </span>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              พาร์ทเนอร์เทคโนโลยี
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
            {partners.map((p) => (
              <div
                key={p.name}
                className="flex flex-col items-center gap-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-6 hover:shadow-md transition-shadow"
              >
                <p.icon className="h-8 w-8 text-gray-600 dark:text-gray-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 text-center">
                  {p.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Key Numbers */}
      <section className="py-20 bg-gradient-to-br from-primary-600 via-primary-500 to-amber-500">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-white">ตัวเลขสำคัญ</h2>
            <p className="mt-4 text-white/80">SolarIQ ในมุมมองตัวเลข</p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {numbers.map((n) => (
              <div
                key={n.label}
                className="flex flex-col items-center gap-3 rounded-2xl bg-white/15 backdrop-blur p-8 text-center"
              >
                <n.icon className="h-8 w-8 text-white/80" />
                <div className="text-4xl font-extrabold text-white">{n.value}</div>
                <div className="text-sm text-white/70 font-medium">{n.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="inline-block rounded-full bg-primary-100 dark:bg-primary-900/30 px-4 py-1 text-sm font-semibold text-primary-600 dark:text-primary-400 mb-4">
              ทีมงานของเรา
            </span>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Our Team</h2>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((t) => (
              <div
                key={t.name}
                className="flex flex-col items-center gap-4 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary-400 to-amber-400 text-2xl font-bold text-white">
                  {t.initials}
                </div>
                <div className="text-center">
                  <div className="text-sm font-semibold text-gray-900 dark:text-white">
                    {t.name}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-white dark:bg-gray-950">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
            พร้อมเริ่มต้นแล้วหรือยัง?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600 dark:text-gray-400">
            ดูแพ็กเกจที่เหมาะกับธุรกิจของคุณ เริ่มทดลองใช้ฟรี 14 วัน
          </p>
          <div className="mt-8">
            <Link
              href="/pricing-plans"
              className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary-600 to-amber-500 px-8 py-4 text-base font-bold text-white shadow-lg hover:shadow-xl transition-all"
            >
              ดูแพ็กเกจราคา
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
