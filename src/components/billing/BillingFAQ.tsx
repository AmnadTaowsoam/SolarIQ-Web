'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface FAQItemProps {
  question: string
  answer: string
}

function FAQItem({ question, answer }: FAQItemProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="border-b border-gray-200 dark:border-gray-700">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between py-5 text-left"
        aria-expanded={isOpen}
      >
        <span className="text-base font-semibold text-gray-900 dark:text-white">{question}</span>
        {isOpen ? (
          <ChevronUp className="h-5 w-5 shrink-0 text-primary-500" />
        ) : (
          <ChevronDown className="h-5 w-5 shrink-0 text-gray-400" />
        )}
      </button>
      {isOpen && (
        <div className="pb-5 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
          {answer}
        </div>
      )}
    </div>
  )
}

interface BillingFAQProps {
  _locale?: string
}

export function BillingFAQ({ _locale = 'th' }: BillingFAQProps) {
  const t = useTranslations('billingPolicy')

  const faqs = [
    {
      question: t('questions.q1.question'),
      answer: t('questions.q1.answer'),
    },
    {
      question: t('questions.q2.question'),
      answer: t('questions.q2.answer'),
    },
    {
      question: t('questions.q3.question'),
      answer: t('questions.q3.answer'),
    },
    {
      question: t('questions.q4.question'),
      answer: t('questions.q4.answer'),
    },
    {
      question: t('questions.q5.question'),
      answer: t('questions.q5.answer'),
    },
  ]

  return (
    <div className="divide-y divide-gray-200 dark:divide-gray-700 border-t border-gray-200 dark:border-gray-700">
      {faqs.map((faq, index) => (
        <FAQItem key={index} question={faq.question} answer={faq.answer} />
      ))}
    </div>
  )
}
