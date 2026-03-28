'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  AlertTriangle,
  ArrowLeft,
  HelpCircle,
  MessageCircle,
  ChevronDown,
  ChevronUp,
  RefreshCw,
} from 'lucide-react'
import { useTranslations } from 'next-intl'

/* ------------------------------------------------------------------ */
/*  FAQ Item                                                            */
/* ------------------------------------------------------------------ */
function FAQItem({ q, a }: { q: string; a: string }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="border-b border-gray-200 dark:border-gray-700 last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between py-4 text-left"
      >
        <span className="text-sm font-semibold text-gray-900 dark:text-white pr-4">{q}</span>
        {isOpen ? (
          <ChevronUp className="h-4 w-4 shrink-0 text-primary-500" />
        ) : (
          <ChevronDown className="h-4 w-4 shrink-0 text-gray-400" />
        )}
      </button>
      {isOpen && (
        <div className="pb-4 text-sm leading-relaxed text-gray-600 dark:text-gray-400">{a}</div>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Page                                                                */
/* ------------------------------------------------------------------ */
export default function CheckoutCancelPage() {
  const t = useTranslations('checkoutCancel')

  const faqs = [
    { q: t('faq1Q'), a: t('faq1A') },
    { q: t('faq2Q'), a: t('faq2A') },
    { q: t('faq3Q'), a: t('faq3A') },
    { q: t('faq4Q'), a: t('faq4A') },
  ]

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-orange-50 to-white dark:from-gray-900 dark:to-gray-950 flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg text-center">
        {/* Warning icon */}
        <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/20">
          <AlertTriangle className="h-14 w-14 text-orange-500 dark:text-orange-400" />
        </div>

        {/* Heading */}
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-3">
          {t('title')}
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-2">{t('subtitle')}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
          คุณสามารถลองใหม่ได้ตลอดเวลา หรือเลือกแพ็กเกจอื่นที่เหมาะสม
        </p>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
          <Link
            href="/pricing-plans"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary-600 to-amber-500 px-8 py-4 text-base font-bold text-white shadow-lg hover:shadow-xl transition-all"
          >
            <RefreshCw className="h-5 w-5" />
            {t('tryAgain')}
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 rounded-xl border-2 border-gray-200 dark:border-gray-700 px-6 py-4 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <MessageCircle className="h-4 w-4" />
            {t('contactUs')}
          </Link>
        </div>

        {/* FAQ Section */}
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 text-left shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <HelpCircle className="h-5 w-5 text-primary-500" />
            <h2 className="text-base font-bold text-gray-900 dark:text-white">{t('faqTitle')}</h2>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700 border-t border-gray-200 dark:border-gray-700">
            {faqs.map((faq) => (
              <FAQItem key={faq.q} q={faq.q} a={faq.a} />
            ))}
          </div>
        </div>

        {/* Back link */}
        <Link
          href="/pricing-plans"
          className="inline-flex items-center gap-2 mt-8 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-primary-600 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('backToPlans')}
        </Link>
      </div>
    </div>
  )
}
