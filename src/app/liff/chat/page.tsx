'use client'

import { useTranslations } from 'next-intl'

// WK-028: In-App Messaging — placeholder until chat system is implemented
export default function LiffChatPage() {
  const t = useTranslations('chatPage')

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="text-4xl mb-4">💬</div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">{t('title')}</h1>
        <p className="text-gray-500 text-sm">{t('underDevelopment')}</p>
      </div>
    </div>
  )
}
