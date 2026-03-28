'use client'

import { useTranslations } from 'next-intl'

export default function OfflinePage() {
  const t = useTranslations('offline')

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="text-4xl mb-4">📡</div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">{t('title')}</h1>
        <p className="text-gray-500 text-sm">{t('subtitle')}</p>
        <p className="text-gray-500 text-sm">{t('description')}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-orange-600 text-white rounded-lg text-sm"
        >
          {t('retry')}
        </button>
      </div>
    </div>
  )
}
