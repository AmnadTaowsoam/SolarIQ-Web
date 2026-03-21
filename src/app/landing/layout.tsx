import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'SolarIQ - แพลตฟอร์ม AI วิเคราะห์พลังงานแสงอาทิตย์',
  description:
    'เปลี่ยนทุกใบเสนอราคาให้เป็นยอดขาย ด้วยแพลตฟอร์ม AI สำหรับธุรกิจติดตั้งโซลาร์เซลล์',
  openGraph: {
    title: 'SolarIQ - แพลตฟอร์ม AI วิเคราะห์พลังงานแสงอาทิตย์',
    description:
      'เปลี่ยนทุกใบเสนอราคาให้เป็นยอดขาย ด้วยแพลตฟอร์ม AI สำหรับธุรกิจติดตั้งโซลาร์เซลล์',
    type: 'website',
    locale: 'th_TH',
  },
}

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
