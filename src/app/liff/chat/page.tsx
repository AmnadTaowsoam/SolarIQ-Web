'use client'

import { useTranslations } from 'next-intl'

// WK-028: In-App Messaging — placeholder until chat system is implemented
export default function LiffChatPage() {
  const t = useTranslations('chatPage')

  return (
    <div className="min-h-screen bg-[var(--brand-background)] flex items-center justify-center p-4">
      <div className="text-center">
        <div className="text-4xl mb-4">💬</div>
        <h1 className="text-xl font-bold text-[var(--brand-text)] mb-2">{t('title')}</h1>
        <p className="text-[var(--brand-text-secondary)] text-sm">{t('underDevelopment')}</p>
      </div>
    </div>
  )
}
