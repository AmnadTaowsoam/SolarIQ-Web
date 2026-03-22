import Link from 'next/link'
import { getLocale } from 'next-intl/server'
import { buildLocalizedPath } from '@/lib/locale'
import { defaultLocale, isSupportedLocale } from '@/i18n/config'

export default async function NotFound() {
  const localeCandidate = await getLocale()
  const locale = isSupportedLocale(localeCandidate) ? localeCandidate : defaultLocale
  const dashboardPath = buildLocalizedPath('/dashboard', locale)
  const homePath = buildLocalizedPath('/', locale)

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full text-center">
        <h1 className="text-6xl font-bold text-gray-300 mb-4">404</h1>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Page not found</h2>
        <p className="text-gray-600 mb-6">
          The page you are looking for does not exist or has been moved.
        </p>
        <div className="flex gap-3 justify-center">
          <Link
            href={dashboardPath}
            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Go to Dashboard
          </Link>
          <Link
            href={homePath}
            className="inline-flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Home
          </Link>
        </div>
      </div>
    </div>
  )
}
