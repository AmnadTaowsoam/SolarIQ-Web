import type { Metadata } from 'next'
import { toAbsoluteUrl } from '@/lib/site'

export const metadata: Metadata = {
  title: 'ติดต่อเรา - SolarIQ',
  description:
    'ติดต่อทีมงาน SolarIQ สอบถามข้อมูลเพิ่มเติม ขอใบเสนอราคา หรือแจ้งปัญหาการใช้งาน พร้อมให้บริการจันทร์-ศุกร์ 9:00-18:00 น.',
  keywords: [
    'ติดต่อ SolarIQ',
    'Contact SolarIQ',
    'สอบถามข้อมูล',
    'ขอใบเสนอราคา',
    'โซลาร์เซลล์',
    'solar energy',
    'ฝ่ายขาย',
    'support',
  ],
  openGraph: {
    title: 'ติดต่อเรา - SolarIQ',
    description: 'ติดต่อทีมงาน SolarIQ สอบถามข้อมูลเพิ่มเติม ขอใบเสนอราคา หรือแจ้งปัญหาการใช้งาน',
    url: toAbsoluteUrl('/contact'),
  },
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
