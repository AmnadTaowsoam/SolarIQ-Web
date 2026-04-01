import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'แพ็กเกจและราคา - SolarIQ',
  description:
    'เปรียบเทียบแพ็กเกจ SolarIQ ตั้งแต่ทดลองฟรี 14 วัน จนถึง Enterprise เลือกแผนที่เหมาะกับธุรกิจโซลาร์ของคุณ เริ่มต้นที่ 2,900 บาท/เดือน',
  keywords: [
    'ราคา SolarIQ',
    'แพ็กเกจ SolarIQ',
    'Pricing',
    'SolarIQ Plans',
    'ทดลองฟรี',
    'โซลาร์เซลล์',
    'solar energy pricing',
    'B2B SaaS',
  ],
  openGraph: {
    title: 'แพ็กเกจและราคา - SolarIQ',
    description:
      'เปรียบเทียบแพ็กเกจ SolarIQ ตั้งแต่ทดลองฟรี 14 วัน จนถึง Enterprise เลือกแผนที่เหมาะกับธุรกิจโซลาร์ของคุณ',
    url: 'https://solariqapp.com/pricing-plans',
  },
}

/* ------------------------------------------------------------------ */
/*  JSON-LD Structured Data                                            */
/* ------------------------------------------------------------------ */
const productOffersJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: 'SolarIQ',
  description: 'แพลตฟอร์มวิเคราะห์พลังงานแสงอาทิตย์อัจฉริยะ สำหรับธุรกิจโซลาร์ยุคใหม่ในประเทศไทย',
  brand: {
    '@type': 'Brand',
    name: 'SolarIQ',
  },
  url: 'https://solariqapp.com/pricing-plans',
  offers: [
    {
      '@type': 'Offer',
      name: 'ทดลองฟรี (Free Trial)',
      price: '0',
      priceCurrency: 'THB',
      description: 'ทดลองใช้ฟรี 14 วัน วิเคราะห์โซลาร์ 5 ครั้ง ROI Calculator พื้นฐาน 1 ผู้ใช้',
      url: 'https://solariqapp.com/signup?trial=true',
      availability: 'https://schema.org/InStock',
      priceValidUntil: '2027-12-31',
    },
    {
      '@type': 'Offer',
      name: 'Starter',
      price: '2900',
      priceCurrency: 'THB',
      description:
        'สำหรับทีมขนาดเล็ก วิเคราะห์โซลาร์ 20 ครั้ง/เดือน PDF Proposal Generation Basic Dashboard 1 ผู้ใช้',
      url: 'https://solariqapp.com/checkout?plan=starter&billing=monthly',
      availability: 'https://schema.org/InStock',
      priceValidUntil: '2027-12-31',
      unitCode: 'MON',
    },
    {
      '@type': 'Offer',
      name: 'Professional',
      price: '7900',
      priceCurrency: 'THB',
      description:
        'สำหรับทีมที่ต้องการเติบโต วิเคราะห์โซลาร์ 100 ครั้ง/เดือน Climate Reliability Score PM2.5 Impact Analysis API Access 5 ผู้ใช้',
      url: 'https://solariqapp.com/checkout?plan=professional&billing=monthly',
      availability: 'https://schema.org/InStock',
      priceValidUntil: '2027-12-31',
      unitCode: 'MON',
    },
    {
      '@type': 'Offer',
      name: 'Enterprise',
      price: '15000',
      priceCurrency: 'THB',
      description:
        'สำหรับองค์กรขนาดใหญ่ วิเคราะห์โซลาร์ไม่จำกัด White-label Branding Custom API Integration ผู้ใช้ไม่จำกัด SLA 99.9%',
      url: 'https://solariqapp.com/contact?subject=enterprise',
      availability: 'https://schema.org/InStock',
      priceValidUntil: '2027-12-31',
      unitCode: 'MON',
    },
  ],
}

const pricingFaqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'ทดลองฟรีมีข้อจำกัดอะไรบ้าง?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'แพ็กเกจทดลองฟรีให้คุณใช้งานได้ 14 วัน พร้อมวิเคราะห์โซลาร์ 5 ครั้ง และ ROI Calculator พื้นฐาน ไม่ต้องใช้บัตรเครดิต เมื่อครบกำหนดคุณสามารถเลือกอัพเกรดเป็นแพ็กเกจที่เหมาะสมได้',
      },
    },
    {
      '@type': 'Question',
      name: 'เริ่มเรียกเก็บเงินเมื่อไหร่?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'หลังจากทดลองใช้ฟรี 14 วัน ระบบจะไม่เรียกเก็บเงินอัตโนมัติ คุณต้องเลือกแพ็กเกจและชำระเงินด้วยตนเองเท่านั้น',
      },
    },
    {
      '@type': 'Question',
      name: 'รองรับการชำระเงินแบบไหนบ้าง?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'รองรับบัตรเครดิต/เดบิต (Visa, Mastercard, JCB), พร้อมเพย์ (PromptPay), โอนผ่านธนาคาร (SCB, KBANK, BBL) ผ่านระบบ Opn Payments ที่ปลอดภัย สำหรับแพ็กเกจ Enterprise สามารถออกใบแจ้งหนี้และชำระแบบรายปีได้',
      },
    },
    {
      '@type': 'Question',
      name: 'อัพเกรดหรือดาวน์เกรดได้ไหม?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'ได้ คุณสามารถเปลี่ยนแพ็กเกจได้ตลอดเวลา เมื่ออัพเกรดจะมีผลทันที โดยระบบจะคำนวณค่าใช้จ่ายตามสัดส่วนวันที่เหลือ เมื่อดาวน์เกรดจะมีผลในรอบบิลถัดไป',
      },
    },
    {
      '@type': 'Question',
      name: 'ข้อมูลของฉันปลอดภัยหรือไม่?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'ข้อมูลของคุณมีความปลอดภัยสูงสุด เราใช้ AES-256 Encryption, SSL/TLS สำหรับการเชื่อมต่อ ปฏิบัติตาม PDPA อย่างเคร่งครัด และจัดเก็บข้อมูลบน Google Cloud Platform ที่ได้รับมาตรฐาน ISO 27001',
      },
    },
  ],
}

export default function PricingPlansLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productOffersJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pricingFaqJsonLd) }}
      />
      {children}
    </>
  )
}
