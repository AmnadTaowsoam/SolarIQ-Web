import type { Metadata } from 'next'
import Link from 'next/link'
import { Shield, Lock, Database, Globe, FileText, Mail, CheckCircle } from 'lucide-react'

export const metadata: Metadata = {
  title: 'นโยบาย PDPA - SolarIQ',
  description:
    'นโยบายคุ้มครองข้อมูลส่วนบุคคลตาม พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 (PDPA) ของ SolarIQ รวมถึงสิทธิ์ของเจ้าของข้อมูล และมาตรการรักษาความปลอดภัย',
  keywords: [
    'PDPA',
    'พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล',
    'SolarIQ',
    'ข้อมูลส่วนบุคคล',
    'data protection',
    'privacy',
    'Thailand PDPA',
    'สิทธิ์เจ้าของข้อมูล',
  ],
  openGraph: {
    title: 'นโยบาย PDPA - SolarIQ',
    description:
      'นโยบายคุ้มครองข้อมูลส่วนบุคคลตาม พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 (PDPA) ของ SolarIQ',
    url: 'https://solariqapp.com/pdpa',
  },
}

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */
interface TOCItem {
  id: string
  label: string
}

interface DataCategory {
  name: string
  description: string
  examples: string[]
  retention: string
}

interface Subprocessor {
  name: string
  purpose: string
  location: string
}

/* ------------------------------------------------------------------ */
/*  Data                                                                */
/* ------------------------------------------------------------------ */
const tocItems: TOCItem[] = [
  { id: 'overview', label: '1. ภาพรวม PDPA Compliance' },
  { id: 'data-categories', label: '2. หมวดหมู่ข้อมูลที่เก็บรวบรวม' },
  { id: 'data-purposes', label: '3. วัตถุประสงค์ในการใช้ข้อมูล' },
  { id: 'data-retention', label: '4. ระยะเวลาเก็บรักษาข้อมูล' },
  { id: 'subprocessors', label: '5. รายชื่อ Subprocessor' },
  { id: 'cross-border', label: '6. การโอนข้อมูลข้ามพรมแดน' },
  { id: 'security', label: '7. มาตรการรักษาความปลอดภัย' },
  { id: 'user-rights', label: '8. สิทธิของเจ้าของข้อมูล' },
  { id: 'dpo-contact', label: '9. ข้อมูลติดต่อ DPO' },
  { id: 'dsr-portal', label: '10. Data Subject Request Portal' },
]

const dataCategories: DataCategory[] = [
  {
    name: 'ข้อมูลบัญชีผู้ใช้',
    description: 'ข้อมูลที่ใช้ในการสร้างและจัดการบัญชีผู้ใช้',
    examples: ['อีเมล', 'ชื่อผู้ใช้', 'รหัสผ่าน (hashed)', 'เบอร์โทรศัพท์'],
    retention: 'ระหว่างเป็นสมาชิก + 2 ปีหลังยกเลิกบัญชี',
  },
  {
    name: 'ข้อมูลโปรไฟล์',
    description: 'ข้อมูลส่วนตัวและข้อมูลธุรกิจของผู้ใช้',
    examples: ['ชื่อ-นามสกุล', 'ที่อยู่', 'ข้อมูลบริษัท', 'ตำแหน่งงาน'],
    retention: 'ระหว่างเป็นสมาชิก + 2 ปีหลังยกเลิกบัญชี',
  },
  {
    name: 'ข้อมูลบิลไฟฟ้า',
    description: 'รูปภาพและข้อมูลจากบิลไฟฟ้าที่อัปโหลด',
    examples: ['รูปภาพบิล', 'ข้อมูลการใช้ไฟ', 'ข้อมูลผู้ใช้ไฟ'],
    retention: 'ระหว่างเป็นสมาชิก + 2 ปีหลังยกเลิกบัญชี',
  },
  {
    name: 'ข้อมูลวิเคราะห์พลังงานแสงอาทิตย์',
    description: 'ผลลัพธ์จากการวิเคราะห์พลังงานแสงอาทิตย์',
    examples: ['ตำแหน่งที่ตั้ง', 'ข้อมูลหลังคา', 'ผลลัพธ์ ROI', 'ข้อมูลแผงโซลาร์'],
    retention: 'ระหว่างเป็นสมาชิก + 2 ปีหลังยกเลิกบัญชี',
  },
  {
    name: 'ข้อมูลการชำระเงิน',
    description: 'ข้อมูลที่เกี่ยวข้องกับการชำระเงินและการสมัครสมาชิก',
    examples: ['ข้อมูลบัตรเครดิต (encrypted)', 'ประวัติการชำระ', 'ข้อมูลการสมัครสมาชิก'],
    retention: '7 ปี (ตามกฎหมายภาษี)',
  },
  {
    name: 'ข้อมูลการใช้งาน',
    description: 'ข้อมูลเกี่ยวกับการใช้งานแพลตฟอร์ม',
    examples: ['Log การเข้าใช้', 'หน้าที่เข้าชม', 'ฟีเจอร์ที่ใช้', 'ข้อมูล Cookie'],
    retention: '13 เดือน',
  },
  {
    name: 'ข้อมูลการสื่อสาร',
    description: 'ข้อมูลจากการสื่อสารผ่านแพลตฟอร์ม',
    examples: ['ข้อความแชท', 'อีเมล', 'ข้อมูลการติดต่อ'],
    retention: 'ระหว่างเป็นสมาชิก + 2 ปีหลังยกเลิกบัญชี',
  },
]

const dataPurposes = [
  'จัดหาและปรับปรุงบริการ SolarIQ',
  'ประมวลผลและวิเคราะห์ข้อมูลบิลไฟฟ้า',
  'คำนวณ ROI และข้อเสนอระบบโซลาร์',
  'จัดการบัญชีผู้ใช้และการสมัครสมาชิก',
  'ประมวลผลการชำระเงิน',
  'สื่อสารกับผู้ใช้เกี่ยวกับบริการ',
  'วิเคราะห์และปรับปรุงประสบการณ์การใช้งาน',
  'ป้องกันการฉ้อโกงและการใช้งานผิดกฎหมาย',
  'ปฏิบัติตามกฎหมายและข้อบังคับ',
]

const subprocessors: Subprocessor[] = [
  {
    name: 'Google Cloud Platform',
    purpose: 'Cloud infrastructure, database, compute services',
    location: 'asia-southeast1 (Singapore)',
  },
  {
    name: 'Cloudflare',
    purpose: 'CDN, DDoS protection, web application firewall',
    location: 'Global edge network',
  },
  {
    name: 'SendGrid',
    purpose: 'Transactional email delivery',
    location: 'United States',
  },
  {
    name: 'Omise',
    purpose: 'Payment processing',
    location: 'Thailand',
  },
  {
    name: 'LINE Corporation',
    purpose: 'LINE Messaging API, LIFF integration',
    location: 'Japan',
  },
  {
    name: 'Firebase (Google)',
    purpose: 'Authentication, real-time database, analytics',
    location: 'asia-southeast1 (Singapore)',
  },
]

const securityMeasures = [
  {
    icon: Lock,
    title: 'การเข้ารหัสข้อมูล',
    description: 'ข้อมูลทั้งหมดเข้ารหัสด้วย AES-256 ทั้งในการเก็บและการส่ง',
  },
  {
    icon: Shield,
    title: 'การจัดการการเข้าถึง',
    description: 'ระบบการยืนยันตัวตนแบบ multi-factor และ RBAC',
  },
  {
    icon: Database,
    title: 'การสำรองข้อมูล',
    description: 'สำรองข้อมูลอัตโนมัติทุกวัน พร้อมการเข้ารหัส',
  },
  {
    icon: Globe,
    title: 'การป้องกันภัยคุกคาม',
    description: 'WAF, DDoS protection, และ regular security audits',
  },
]

const userRights = [
  {
    title: 'สิทธิในการเข้าถึงข้อมูล',
    description: 'ขอให้แจ้งว่ามีข้อมูลส่วนบุคคลของคุณอะไรบ้าง',
    action: 'ใช้ DSR Portal หรือติดต่อ DPO',
  },
  {
    title: 'สิทธิในการแก้ไขข้อมูล',
    description: 'ขอให้แก้ไขข้อมูลส่วนบุคคลที่ไม่ถูกต้อง',
    action: 'แก้ไขได้ที่หน้า Profile หรือใช้ DSR Portal',
  },
  {
    title: 'สิทธิในการลบข้อมูล',
    description: 'ขอให้ลบข้อมูลส่วนบุคคลของคุณ',
    action: 'ใช้ DSR Portal เพื่อขอลบข้อมูล',
  },
  {
    title: 'สิทธิในการส่งออกข้อมูล',
    description: 'ขอให้ส่งข้อมูลส่วนบุคคลในรูปแบบที่อ่านได้',
    action: 'ใช้ DSR Portal หรือดาวน์โหลดจาก Settings',
  },
  {
    title: 'สิทธิในการคัดค้าน',
    description: 'คัดค้านการประมวลผลข้อมูลในบางกรณี',
    action: 'ติดต่อ DPO',
  },
  {
    title: 'สิทธิในการถอนความยินยอม',
    description: 'ถอนความยินยอมในการเก็บและใช้ข้อมูล',
    action: 'จัดการได้ที่หน้า Privacy Settings',
  },
]

/* ------------------------------------------------------------------ */
/*  Page                                                                */
/* ------------------------------------------------------------------ */
export default function PDPACompliancePage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--brand-surface)]/10">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white">PDPA Compliance Center</h1>
          <p className="mt-4 text-xl text-primary-100">
            ศูนย์กลางการปฏิบัติตามพระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562
          </p>
          <p className="mt-2 text-sm text-primary-200">ปรับปรุงล่าสุด: 27 มีนาคม 2569</p>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="lg:grid lg:grid-cols-4 lg:gap-12">
          {/* Table of Contents - Sidebar */}
          <nav className="hidden lg:block lg:col-span-1">
            <div className="sticky top-24 rounded-xl border border-[var(--brand-border)] dark:border-gray-700 bg-[var(--brand-background)] dark:bg-gray-800 p-5">
              <h3 className="text-sm font-bold text-[var(--brand-text)] dark:text-white mb-4">
                สารบัญ
              </h3>
              <ul className="space-y-2">
                {tocItems.map((item) => (
                  <li key={item.id}>
                    <a
                      href={`#${item.id}`}
                      className="block text-sm text-[var(--brand-text-secondary)] dark:text-[var(--brand-text-secondary)] hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </nav>

          {/* Content */}
          <div className="lg:col-span-3 prose prose-gray dark:prose-invert max-w-none">
            {/* Mobile TOC */}
            <div className="lg:hidden mb-8 rounded-xl border border-[var(--brand-border)] dark:border-gray-700 bg-[var(--brand-background)] dark:bg-gray-800 p-5">
              <h3 className="text-sm font-bold text-[var(--brand-text)] dark:text-white mb-3">
                สารบัญ
              </h3>
              <ul className="space-y-1.5">
                {tocItems.map((item) => (
                  <li key={item.id}>
                    <a
                      href={`#${item.id}`}
                      className="text-sm text-[var(--brand-text-secondary)] dark:text-[var(--brand-text-secondary)] hover:text-primary-600 transition-colors"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* 1. Overview */}
            <section id="overview" className="scroll-mt-24 mb-10">
              <h2 className="text-2xl font-bold text-[var(--brand-text)] dark:text-white mb-4 flex items-center gap-2">
                <Shield className="h-6 w-6 text-primary-600" />
                1. ภาพรวม PDPA Compliance
              </h2>
              <p className="text-[var(--brand-text-secondary)] dark:text-[var(--brand-text-secondary)] leading-relaxed mb-4">
                SolarIQ มุ่งมั่นในการปฏิบัติตามพระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562
                (Personal Data Protection Act: PDPA) ของประเทศไทย
                เราเคารพสิทธิความเป็นส่วนตัวของคุณและมีมาตรการความปลอดภัยที่เข้มงวดเพื่อปกป้องข้อมูลส่วนบุคคลของคุณ
              </p>
              <div className="bg-green-500/10 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                  <div>
                    <p className="font-semibold text-green-900 dark:text-green-100">
                      SolarIQ ได้รับการรับรอง PDPA Compliance
                    </p>
                    <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                      ระบบของเราได้รับการออกแบบและพัฒนาตามหลักการ PDPA ตั้งแต่เริ่มต้น (Privacy by
                      Design)
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* 2. Data Categories */}
            <section id="data-categories" className="scroll-mt-24 mb-10">
              <h2 className="text-2xl font-bold text-[var(--brand-text)] dark:text-white mb-4 flex items-center gap-2">
                <Database className="h-6 w-6 text-primary-600" />
                2. หมวดหมู่ข้อมูลที่เก็บรวบรวม
              </h2>
              <p className="text-[var(--brand-text-secondary)] dark:text-[var(--brand-text-secondary)] leading-relaxed mb-6">
                เราเก็บรวบรวมข้อมูลส่วนบุคคลตามที่จำเป็นเพื่อให้บริการของเราทำงานได้อย่างมีประสิทธิภาพ
              </p>
              <div className="space-y-4">
                {dataCategories.map((category) => (
                  <div
                    key={category.name}
                    className="border border-[var(--brand-border)] dark:border-gray-700 rounded-lg p-5 hover:border-primary-300 dark:hover:border-primary-700 transition-colors"
                  >
                    <h3 className="font-semibold text-[var(--brand-text)] dark:text-white mb-2">
                      {category.name}
                    </h3>
                    <p className="text-sm text-[var(--brand-text-secondary)] dark:text-[var(--brand-text-secondary)] mb-3">
                      {category.description}
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs font-semibold text-[var(--brand-text)] dark:text-[var(--brand-text-secondary)] mb-1">
                          ตัวอย่าง:
                        </p>
                        <ul className="text-sm text-[var(--brand-text-secondary)] dark:text-[var(--brand-text-secondary)] space-y-0.5">
                          {category.examples.map((example) => (
                            <li key={example} className="flex items-start gap-2">
                              <span className="text-primary-600">•</span>
                              {example}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-[var(--brand-text)] dark:text-[var(--brand-text-secondary)] mb-1">
                          ระยะเวลาเก็บรักษา:
                        </p>
                        <p className="text-sm text-[var(--brand-text-secondary)] dark:text-[var(--brand-text-secondary)]">
                          {category.retention}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 3. Data Purposes */}
            <section id="data-purposes" className="scroll-mt-24 mb-10">
              <h2 className="text-2xl font-bold text-[var(--brand-text)] dark:text-white mb-4 flex items-center gap-2">
                <FileText className="h-6 w-6 text-primary-600" />
                3. วัตถุประสงค์ในการใช้ข้อมูล
              </h2>
              <p className="text-[var(--brand-text-secondary)] dark:text-[var(--brand-text-secondary)] leading-relaxed mb-6">
                เราใช้ข้อมูลส่วนบุคคลของคุณเพื่อวัตถุประสงค์ดังต่อไปนี้:
              </p>
              <ul className="space-y-3">
                {dataPurposes.map((purpose, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-[var(--brand-text)] dark:text-[var(--brand-text-secondary)]">
                      {purpose}
                    </span>
                  </li>
                ))}
              </ul>
            </section>

            {/* 4. Data Retention */}
            <section id="data-retention" className="scroll-mt-24 mb-10">
              <h2 className="text-2xl font-bold text-[var(--brand-text)] dark:text-white mb-4 flex items-center gap-2">
                <Lock className="h-6 w-6 text-primary-600" />
                4. ระยะเวลาเก็บรักษาข้อมูล
              </h2>
              <p className="text-[var(--brand-text-secondary)] dark:text-[var(--brand-text-secondary)] leading-relaxed mb-4">
                เราเก็บรักษาข้อมูลส่วนบุคคลของคุณเพียงระยะเวลาที่จำเป็นตามวัตถุประสงค์ในการใช้ข้อมูล
                และตามที่กฎหมายกำหนด เมื่อครบกำหนดแล้ว เราจะลบหรือทำลายข้อมูลนั้นอย่างปลอดภัย
              </p>
              <div className="bg-blue-500/10 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>หมายเหตุ:</strong> หากคุณขอให้ลบข้อมูลก่อนระยะเวลาที่กำหนด
                  เราจะดำเนินการตามสิทธิของคุณในฐานะเจ้าของข้อมูล
                  ยกเว้นในกรณีที่จำเป็นต้องเก็บข้อมูลตามกฎหมาย
                </p>
              </div>
            </section>

            {/* 5. Subprocessors */}
            <section id="subprocessors" className="scroll-mt-24 mb-10">
              <h2 className="text-2xl font-bold text-[var(--brand-text)] dark:text-white mb-4 flex items-center gap-2">
                <Globe className="h-6 w-6 text-primary-600" />
                5. รายชื่อ Subprocessor
              </h2>
              <p className="text-[var(--brand-text-secondary)] dark:text-[var(--brand-text-secondary)] leading-relaxed mb-6">
                เราใช้บริการจากผู้ให้บริการบุคคลที่สาม (Subprocessors) เพื่อรองรับการดำเนินงานของเรา
                ทุก Subprocessor ได้รับการคัดเลือกอย่างรอบคอบและมีข้อตกลงความลับ (NDA)
              </p>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-[var(--brand-background)] dark:bg-gray-800">
                      <th className="text-left p-3 font-semibold text-[var(--brand-text)] dark:text-white border-b border-[var(--brand-border)] dark:border-gray-700">
                        Subprocessor
                      </th>
                      <th className="text-left p-3 font-semibold text-[var(--brand-text)] dark:text-white border-b border-[var(--brand-border)] dark:border-gray-700">
                        วัตถุประสงค์
                      </th>
                      <th className="text-left p-3 font-semibold text-[var(--brand-text)] dark:text-white border-b border-[var(--brand-border)] dark:border-gray-700">
                        ตำแหน่ง
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {subprocessors.map((sp) => (
                      <tr
                        key={sp.name}
                        className="border-b border-[var(--brand-border)] dark:border-gray-700"
                      >
                        <td className="p-3 text-[var(--brand-text)] dark:text-white font-medium">
                          {sp.name}
                        </td>
                        <td className="p-3 text-[var(--brand-text-secondary)] dark:text-[var(--brand-text-secondary)]">
                          {sp.purpose}
                        </td>
                        <td className="p-3 text-[var(--brand-text-secondary)] dark:text-[var(--brand-text-secondary)]">
                          {sp.location}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* 6. Cross-Border Data Transfer */}
            <section id="cross-border" className="scroll-mt-24 mb-10">
              <h2 className="text-2xl font-bold text-[var(--brand-text)] dark:text-white mb-4 flex items-center gap-2">
                <Globe className="h-6 w-6 text-primary-600" />
                6. การโอนข้อมูลข้ามพรมแดน
              </h2>
              <p className="text-[var(--brand-text-secondary)] dark:text-[var(--brand-text-secondary)] leading-relaxed mb-4">
                ข้อมูลส่วนบุคคลของคุณส่วนใหญ่ถูกเก็บและประมวลผลในภูมิภาค Asia Southeast 1
                (Singapore) อย่างไรก็ตาม เราอาจโอนข้อมูลไปยังประเทศอื่นในกรณีที่จำเป็น เช่น:
              </p>
              <ul className="list-disc list-inside space-y-2 text-[var(--brand-text)] dark:text-[var(--brand-text-secondary)] mb-4">
                <li>การใช้บริการจาก Subprocessor ที่ตั้งอยู่ต่างประเทศ</li>
                <li>การสนับสนุนลูกค้าระหว่างประเทศ</li>
                <li>การประมวลผลข้อมูลเพื่อความปลอดภัยและการสำรองข้อมูล</li>
              </ul>
              <div className="bg-yellow-500/10 dark:bg-yellow-900/20 border border-yellow-500/20 dark:border-yellow-800 rounded-lg p-4">
                <p className="text-sm text-yellow-600 dark:text-yellow-200">
                  <strong>การรับรอง:</strong> เรามีมาตรการคุ้มครองข้อมูลที่เทียบเท่ากับมาตรฐาน PDPA
                  และมีข้อตกลงการโอนข้อมูลข้ามพรมแดนที่เหมาะสมกับทุก Subprocessor
                </p>
              </div>
            </section>

            {/* 7. Security Measures */}
            <section id="security" className="scroll-mt-24 mb-10">
              <h2 className="text-2xl font-bold text-[var(--brand-text)] dark:text-white mb-4 flex items-center gap-2">
                <Shield className="h-6 w-6 text-primary-600" />
                7. มาตรการรักษาความปลอดภัย
              </h2>
              <p className="text-[var(--brand-text-secondary)] dark:text-[var(--brand-text-secondary)] leading-relaxed mb-6">
                เราใช้มาตรการความปลอดภัยที่ครอบคลุมเพื่อปกป้องข้อมูลส่วนบุคคลของคุณ:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {securityMeasures.map((measure) => (
                  <div
                    key={measure.title}
                    className="border border-[var(--brand-border)] dark:border-gray-700 rounded-lg p-5"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        <measure.icon className="h-6 w-6 text-primary-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-[var(--brand-text)] dark:text-white mb-1">
                          {measure.title}
                        </h3>
                        <p className="text-sm text-[var(--brand-text-secondary)] dark:text-[var(--brand-text-secondary)]">
                          {measure.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 8. User Rights */}
            <section id="user-rights" className="scroll-mt-24 mb-10">
              <h2 className="text-2xl font-bold text-[var(--brand-text)] dark:text-white mb-4 flex items-center gap-2">
                <CheckCircle className="h-6 w-6 text-primary-600" />
                8. สิทธิของเจ้าของข้อมูล
              </h2>
              <p className="text-[var(--brand-text-secondary)] dark:text-[var(--brand-text-secondary)] leading-relaxed mb-6">
                ตาม PDPA คุณมีสิทธิต่อไปนี้เกี่ยวกับข้อมูลส่วนบุคคลของคุณ:
              </p>
              <div className="space-y-4">
                {userRights.map((right) => (
                  <div
                    key={right.title}
                    className="border border-[var(--brand-border)] dark:border-gray-700 rounded-lg p-5"
                  >
                    <h3 className="font-semibold text-[var(--brand-text)] dark:text-white mb-2">
                      {right.title}
                    </h3>
                    <p className="text-sm text-[var(--brand-text-secondary)] dark:text-[var(--brand-text-secondary)] mb-2">
                      {right.description}
                    </p>
                    <p className="text-xs text-primary-600 dark:text-primary-400">
                      <strong>วิธีดำเนินการ:</strong> {right.action}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* 9. DPO Contact */}
            <section id="dpo-contact" className="scroll-mt-24 mb-10">
              <h2 className="text-2xl font-bold text-[var(--brand-text)] dark:text-white mb-4 flex items-center gap-2">
                <Mail className="h-6 w-6 text-primary-600" />
                9. ข้อมูลติดต่อ DPO
              </h2>
              <p className="text-[var(--brand-text-secondary)] dark:text-[var(--brand-text-secondary)] leading-relaxed mb-6">
                หากคุณมีคำถามหรือข้อกังวลเกี่ยวกับความเป็นส่วนตัวหรือการปฏิบัติตาม PDPA
                คุณสามารถติดต่อ Data Protection Officer (DPO) ของเราได้:
              </p>
              <div className="bg-[var(--brand-background)] dark:bg-gray-800 border border-[var(--brand-border)] dark:border-gray-700 rounded-lg p-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-semibold text-[var(--brand-text)] dark:text-[var(--brand-text-secondary)]">
                      ชื่อ:
                    </p>
                    <p className="text-[var(--brand-text)] dark:text-white">
                      SolarIQ Data Protection Officer
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[var(--brand-text)] dark:text-[var(--brand-text-secondary)]">
                      อีเมล:
                    </p>
                    <a
                      href="mailto:dpo@solariqapp.com"
                      className="text-primary-600 dark:text-primary-400 hover:underline"
                    >
                      dpo@solariqapp.com
                    </a>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[var(--brand-text)] dark:text-[var(--brand-text-secondary)]">
                      เวลาตอบกลับ:
                    </p>
                    <p className="text-[var(--brand-text)] dark:text-white">
                      ภายใน 30 วัน (ตามที่ PDPA กำหนด)
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* 10. DSR Portal */}
            <section id="dsr-portal" className="scroll-mt-24 mb-10">
              <h2 className="text-2xl font-bold text-[var(--brand-text)] dark:text-white mb-4 flex items-center gap-2">
                <FileText className="h-6 w-6 text-primary-600" />
                10. Data Subject Request Portal
              </h2>
              <p className="text-[var(--brand-text-secondary)] dark:text-[var(--brand-text-secondary)] leading-relaxed mb-6">
                คุณสามารถใช้ Data Subject Request (DSR) Portal เพื่อจัดการสิทธิของคุณ:
              </p>
              <div className="space-y-4">
                <Link
                  href="/pdpa/request"
                  className="block bg-primary-600 hover:bg-primary-700 text-white rounded-lg p-5 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">ส่งคำขอ DSR</h3>
                      <p className="text-sm text-primary-100 mt-1">
                        ขอเข้าถึง แก้ไข ลบ หรือส่งออกข้อมูลของคุณ
                      </p>
                    </div>
                    <FileText className="h-8 w-8 text-primary-200" />
                  </div>
                </Link>
                <div className="bg-[var(--brand-background)] dark:bg-gray-800 border border-[var(--brand-border)] dark:border-gray-700 rounded-lg p-5">
                  <p className="text-sm text-[var(--brand-text)] dark:text-[var(--brand-text-secondary)]">
                    <strong>ประเภทคำขอที่รองรับ:</strong>
                  </p>
                  <ul className="mt-2 space-y-1 text-sm text-[var(--brand-text-secondary)] dark:text-[var(--brand-text-secondary)]">
                    <li>• ขอเข้าถึงข้อมูล (Access)</li>
                    <li>• ขอแก้ไขข้อมูล (Correction)</li>
                    <li>• ขอลบข้อมูล (Deletion)</li>
                    <li>• ขอส่งออกข้อมูล (Portability)</li>
                    <li>• ขอคัดค้านการประมวลผล (Objection)</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Footer CTA */}
            <div className="mt-12 border-t border-[var(--brand-border)] dark:border-gray-700 pt-8">
              <p className="text-center text-sm text-[var(--brand-text-secondary)] dark:text-[var(--brand-text-secondary)] mb-4">
                SolarIQ มุ่งมั่นในการปกป้องความเป็นส่วนตัวของคุณ
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link
                  href="/privacy"
                  className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
                >
                  นโยบายความเป็นส่วนตัว
                </Link>
                <span className="text-[var(--brand-text-secondary)]">•</span>
                <Link
                  href="/terms"
                  className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
                >
                  เงื่อนไขการใช้งาน
                </Link>
                <span className="text-[var(--brand-text-secondary)]">•</span>
                <Link
                  href="/contact"
                  className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
                >
                  ติดต่อเรา
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
