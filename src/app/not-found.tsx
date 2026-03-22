import Link from 'next/link'
import { getLocale } from 'next-intl/server'
import { buildLocalizedPath } from '@/lib/locale'
import { defaultLocale, isSupportedLocale } from '@/i18n/config'

export default async function NotFound() {
  const localeCandidate = await getLocale()
  const locale = isSupportedLocale(localeCandidate) ? localeCandidate : defaultLocale
  const homePath = buildLocalizedPath('/', locale)

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-orange-50 to-white px-4">
      <div className="max-w-lg w-full text-center">
        {/* SolarIQ branding */}
        <div className="mb-6">
          <span className="text-3xl font-bold text-orange-600">Solar</span>
          <span className="text-3xl font-bold text-gray-800">IQ</span>
        </div>

        <h1 className="text-8xl font-extrabold text-orange-200 mb-2">404</h1>
        <h2 className="text-2xl font-semibold text-gray-900 mb-3">
          ไม่พบหน้าที่คุณต้องการ
        </h2>
        <p className="text-gray-600 mb-8">
          หน้าที่คุณกำลังมองหาอาจถูกย้าย ลบ หรือไม่เคยมีอยู่
          <br />
          ลองตรวจสอบ URL อีกครั้ง หรือไปยังหน้าด้านล่าง
        </p>

        <div className="flex flex-wrap gap-3 justify-center mb-10">
          <Link
            href={homePath}
            className="inline-flex items-center px-5 py-2.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
          >
            หน้าแรก
          </Link>
          <Link
            href="/pricing-plans"
            className="inline-flex items-center px-5 py-2.5 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            แพ็กเกจ
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center px-5 py-2.5 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            ติดต่อเรา
          </Link>
        </div>

        <p className="text-sm text-gray-400">
          หากคุณคิดว่านี่คือข้อผิดพลาด กรุณาติดต่อทีมสนับสนุนของเรา
        </p>
      </div>
    </div>
  )
}
