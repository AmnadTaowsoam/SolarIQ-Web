import type { Metadata } from 'next'
import { SITE_URL } from '@/lib/site'

export const metadata: Metadata = {
  title: 'SolarIQ - แพลตฟอร์ม AI วิเคราะห์พลังงานแสงอาทิตย์',
  description: 'เปลี่ยนทุกใบเสนอราคาให้เป็นยอดขาย ด้วยแพลตฟอร์ม AI สำหรับธุรกิจติดตั้งโซลาร์เซลล์',
  openGraph: {
    title: 'SolarIQ - แพลตฟอร์ม AI วิเคราะห์พลังงานแสงอาทิตย์',
    description:
      'เปลี่ยนทุกใบเสนอราคาให้เป็นยอดขาย ด้วยแพลตฟอร์ม AI สำหรับธุรกิจติดตั้งโซลาร์เซลล์',
    type: 'website',
    locale: 'th_TH',
  },
}

/* ------------------------------------------------------------------ */
/*  JSON-LD Structured Data                                            */
/* ------------------------------------------------------------------ */
const faqPageJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'SolarIQ คืออะไร? (What is SolarIQ?)',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'SolarIQ คือแพลตฟอร์ม B2B SaaS สำหรับธุรกิจติดตั้งโซลาร์เซลล์ในประเทศไทย ช่วยวิเคราะห์ศักยภาพพลังงานแสงอาทิตย์ คำนวณ ROI สร้าง Proposal อัตโนมัติ และบริหารจัดการโครงการติดตั้งโซลาร์เซลล์ได้ครบวงจร (SolarIQ is a B2B SaaS platform for solar installation businesses in Thailand, providing solar potential analysis, ROI calculation, automated proposal generation, and end-to-end solar project management.)',
      },
    },
    {
      '@type': 'Question',
      name: 'SolarIQ เหมาะกับใคร? (Who is SolarIQ for?)',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'SolarIQ ออกแบบมาสำหรับผู้รับเหมาติดตั้งโซลาร์เซลล์ (Solar Contractors) บริษัทพลังงานทดแทน ทีมขายโซลาร์ และวิศวกรโซลาร์ในประเทศไทย ที่ต้องการเครื่องมือวิเคราะห์และบริหารจัดการโครงการโซลาร์อย่างมืออาชีพ (SolarIQ is designed for solar contractors, renewable energy companies, solar sales teams, and solar engineers in Thailand.)',
      },
    },
    {
      '@type': 'Question',
      name: 'ทดลองใช้ฟรีได้กี่วัน? (How long is the free trial?)',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'SolarIQ ให้ทดลองใช้ฟรี 14 วัน โดยไม่ต้องใช้บัตรเครดิต สามารถวิเคราะห์โซลาร์ได้ 5 ครั้ง พร้อม ROI Calculator พื้นฐาน (SolarIQ offers a 14-day free trial with no credit card required, including 5 solar analyses and basic ROI Calculator.)',
      },
    },
    {
      '@type': 'Question',
      name: 'SolarIQ ช่วยเพิ่มยอดขายได้อย่างไร? (How does SolarIQ help increase sales?)',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'SolarIQ ช่วยเพิ่มยอดขายด้วยการวิเคราะห์ศักยภาพโซลาร์อัตโนมัติผ่าน Google Solar API สร้าง Proposal PDF มืออาชีพ คำนวณ ROI แบบแม่นยำ เปรียบเทียบทางเลือกการลงทุน (เงินสด/สินเชื่อ/เช่า) และระบบ Smart Alerts ที่แจ้งเตือนโอกาสขาย (SolarIQ boosts sales with automated solar analysis via Google Solar API, professional PDF proposals, accurate ROI calculations, investment comparison, and Smart Alerts.)',
      },
    },
    {
      '@type': 'Question',
      name: 'รองรับการทำงานร่วมกับ MEA/PEA ไหม? (Does it support MEA/PEA permit management?)',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'SolarIQ รองรับการบริหารจัดการเอกสารใบอนุญาตสำหรับการไฟฟ้านครหลวง (MEA) และการไฟฟ้าส่วนภูมิภาค (PEA) รวมถึงการติดตามสถานะใบอนุญาต การแจ้งเตือนเอกสารหมดอายุ และการเตรียมเอกสารที่จำเป็น (SolarIQ supports MEA and PEA permit document management, including permit status tracking, expiry alerts, and document preparation.)',
      },
    },
  ],
}

const webSiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'SolarIQ',
  url: SITE_URL,
  description: 'แพลตฟอร์มวิเคราะห์พลังงานแสงอาทิตย์อัจฉริยะ สำหรับธุรกิจโซลาร์ยุคใหม่ในประเทศไทย',
  inLanguage: ['th', 'en'],
}

export default function LandingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPageJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteJsonLd) }}
      />
      {children}
    </>
  )
}
