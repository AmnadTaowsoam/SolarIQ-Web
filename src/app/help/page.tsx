'use client'

/**
 * Help Center Page (WK-105)
 * User-facing help center with FAQs, guides, and support
 */

import { useState } from 'react'
import { AppLayout } from '@/components/layout'
import { useAuth } from '@/context'
import {
  HelpCircle,
  BookOpen,
  MessageCircle,
  ChevronDown,
  ChevronUp,
  Search,
  Zap,
  Settings,
  CreditCard,
  Shield,
} from 'lucide-react'

interface FAQItem {
  id: string
  question: string
  answer: string
  category: string
}

const FAQ_DATA: FAQItem[] = [
  {
    id: '1',
    category: 'general',
    question: 'How does SolarIQ help my solar business?',
    answer:
      'SolarIQ is a B2B SaaS platform designed for Thai solar contractors. It provides lead management, solar analysis, automated proposals, billing management, and AI-powered tools to streamline your operations and grow your business.',
  },
  {
    id: '2',
    category: 'general',
    question: 'What solar analysis features are available?',
    answer:
      'SolarIQ offers comprehensive solar irradiance analysis, weather forecasting, dust/air quality impact assessment, and ROI calculations based on your location. You can analyze any location in Thailand for solar potential.',
  },
  {
    id: '3',
    category: 'billing',
    question: 'How does the subscription billing work?',
    answer:
      'SolarIQ offers tiered plans (Starter, Professional, Enterprise). You can manage your subscription, view invoices, and track usage from the Billing page. We support Omise payment gateway for Thai payment methods.',
  },
  {
    id: '4',
    category: 'billing',
    question: 'Can I generate VAT invoices?',
    answer:
      'Yes! SolarIQ supports Thai VAT invoice generation (WK-103). You can create tax-compliant invoices with proper tax ID, VAT calculations, and export PDF documents for your records.',
  },
  {
    id: '5',
    category: 'permits',
    question: 'How does the MEA/PEA permit system work?',
    answer:
      'The automated permitting module (WK-112) helps you prepare and track MEA/PEA grid connection applications. Upload required documents, fill in system specifications, and track approval status all in one place.',
  },
  {
    id: '6',
    category: 'ai',
    question: 'What AI features are available?',
    answer:
      'SolarIQ includes AI-powered bill analysis (upload electricity bills for automatic data extraction), AI chatbot for customer support, auto-proposal generation, and intelligent lead routing based on contractor expertise and location.',
  },
  {
    id: '7',
    category: 'security',
    question: 'Is my data secure?',
    answer:
      'SolarIQ follows PDPA compliance standards. We use Firebase Authentication with optional MFA (WK-106), encrypted data storage, and audit logging. Your data is hosted on Google Cloud with enterprise-grade security.',
  },
  {
    id: '8',
    category: 'security',
    question: 'What is PDPA and how does it affect me?',
    answer:
      "PDPA (Personal Data Protection Act) is Thailand's data privacy law. SolarIQ is fully compliant - we provide data subject request portals, consent management, and transparent data handling practices. Visit our PDPA page for details.",
  },
]

const CATEGORIES = [
  { id: 'all', label: 'All', icon: BookOpen },
  { id: 'general', label: 'General', icon: HelpCircle },
  { id: 'billing', label: 'Billing', icon: CreditCard },
  { id: 'permits', label: 'Permits', icon: Shield },
  { id: 'ai', label: 'AI Features', icon: Zap },
  { id: 'security', label: 'Security', icon: Settings },
]

export default function HelpPage() {
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const filteredFAQs = FAQ_DATA.filter((faq) => {
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory
    const matchesSearch =
      searchQuery === '' ||
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <AppLayout user={user}>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-[var(--brand-text)] flex items-center justify-center gap-2">
            <HelpCircle className="w-8 h-8 text-[var(--brand-primary)]" />
            Help Center
          </h1>
          <p className="text-[var(--brand-text-secondary)] mt-2">
            Find answers to common questions about SolarIQ
          </p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--brand-text-secondary)]" />
          <input
            type="text"
            placeholder="Search for help..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-[var(--brand-surface)] border border-[var(--brand-border)] rounded-xl text-[var(--brand-text)] placeholder-[var(--brand-text-secondary)] focus:ring-2 focus:ring-[var(--brand-primary)] focus:border-transparent outline-none"
          />
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 flex-wrap justify-center">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  activeCategory === cat.id
                    ? 'bg-[var(--brand-primary)] text-white'
                    : 'bg-[var(--brand-surface)] text-[var(--brand-text-secondary)] border border-[var(--brand-border)] hover:bg-[var(--brand-primary-light)]'
                }`}
              >
                <Icon className="w-4 h-4" />
                {cat.label}
              </button>
            )
          })}
        </div>

        {/* FAQ List */}
        <div className="space-y-3">
          {filteredFAQs.map((faq) => (
            <div
              key={faq.id}
              className="bg-[var(--brand-surface)] border border-[var(--brand-border)] rounded-xl overflow-hidden"
            >
              <button
                onClick={() => setExpandedId(expandedId === faq.id ? null : faq.id)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-[var(--brand-primary-light)] transition-colors"
              >
                <span className="text-sm font-medium text-[var(--brand-text)] pr-4">
                  {faq.question}
                </span>
                {expandedId === faq.id ? (
                  <ChevronUp className="w-5 h-5 text-[var(--brand-text-secondary)] flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-[var(--brand-text-secondary)] flex-shrink-0" />
                )}
              </button>
              {expandedId === faq.id && (
                <div className="px-4 pb-4 text-sm text-[var(--brand-text-secondary)] leading-relaxed border-t border-[var(--brand-border)]">
                  <p className="pt-3">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
          {filteredFAQs.length === 0 && (
            <div className="text-center py-12 text-[var(--brand-text-secondary)]">
              <HelpCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No results found. Try a different search term.</p>
            </div>
          )}
        </div>

        {/* Contact Support */}
        <div className="bg-[var(--brand-primary)]/5 border border-[var(--brand-primary)]/20 rounded-xl p-6 text-center">
          <MessageCircle className="w-10 h-10 text-[var(--brand-primary)] mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-[var(--brand-text)]">Still need help?</h3>
          <p className="text-sm text-[var(--brand-text-secondary)] mt-1 mb-4">
            Contact our support team for personalized assistance
          </p>
          <a
            href="mailto:support@solariqapp.com"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--brand-primary)] text-white rounded-lg hover:opacity-90 transition-opacity text-sm font-medium"
          >
            <MessageCircle className="w-4 h-4" />
            Contact Support
          </a>
        </div>
      </div>
    </AppLayout>
  )
}
