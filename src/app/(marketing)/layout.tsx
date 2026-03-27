'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Zap, Menu, X, Facebook, Linkedin, Mail, Phone, MapPin, Clock } from 'lucide-react'

/* ------------------------------------------------------------------ */
/*  Marketing Navbar                                                    */
/* ------------------------------------------------------------------ */
function MarketingNavbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const navLinks = [
    { label: 'หน้าแรก', href: '/landing' },
    { label: 'แพ็กเกจ', href: '/pricing-plans' },
    { label: 'เกี่ยวกับเรา', href: '/about' },
    { label: 'ติดต่อ', href: '/contact' },
  ]

  return (
    <nav
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 dark:bg-gray-900/95 backdrop-blur shadow-md'
          : 'bg-white dark:bg-gray-900 shadow-sm'
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/landing" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary-500 to-amber-500">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">SolarIQ</span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors hover:text-primary-500"
              >
                {l.label}
              </Link>
            ))}
          </div>

          {/* CTA buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-lg px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-primary-600 transition-colors"
            >
              เข้าสู่ระบบ
            </Link>
            <Link
              href="/signup"
              className="rounded-lg bg-primary-600 px-5 py-2 text-sm font-semibold text-white shadow hover:bg-primary-700 transition-colors"
            >
              ทดลองฟรี
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden p-2 rounded-lg text-gray-700 dark:text-gray-300"
            aria-label="Toggle menu"
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-white dark:bg-gray-900 border-t shadow-lg">
          <div className="px-4 py-3 space-y-2">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="block rounded-lg px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-gray-800 hover:text-primary-600"
              >
                {l.label}
              </Link>
            ))}
            <div className="pt-2 border-t border-gray-200 dark:border-gray-700 space-y-2">
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="block rounded-lg px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-gray-800"
              >
                เข้าสู่ระบบ
              </Link>
              <Link
                href="/signup"
                onClick={() => setOpen(false)}
                className="block rounded-lg bg-primary-600 px-3 py-2 text-center text-sm font-semibold text-white hover:bg-primary-700"
              >
                ทดลองฟรี
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}

/* ------------------------------------------------------------------ */
/*  Marketing Footer                                                    */
/* ------------------------------------------------------------------ */
const footerSections = [
  {
    title: 'ผลิตภัณฑ์',
    links: [
      { label: 'แพ็กเกจราคา', href: '/pricing-plans' },
      { label: 'ฟีเจอร์ทั้งหมด', href: '/landing#features' },
      { label: 'ROI Calculator', href: '/landing#roi' },
      { label: 'API Documentation', href: '/developers' },
    ],
  },
  {
    title: 'บริษัท',
    links: [
      { label: 'เกี่ยวกับเรา', href: '/about' },
      { label: 'ติดต่อเรา', href: '/contact' },
      { label: 'ร่วมงานกับเรา', href: '/contact' },
      { label: 'บล็อก', href: '/blog' },
    ],
  },
  {
    title: 'กฎหมาย',
    links: [
      { label: 'ข้อกำหนดการใช้งาน', href: '/terms' },
      { label: 'นโยบายความเป็นส่วนตัว', href: '/privacy' },
      { label: 'นโยบายการคืนเงิน', href: '/refund-policy' },
      { label: 'PDPA Compliance', href: '/privacy#user-rights' },
    ],
  },
]

function MarketingFooter() {
  return (
    <footer className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand column */}
          <div className="lg:col-span-2">
            <Link href="/landing" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary-500 to-amber-500">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">SolarIQ</span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-gray-600 dark:text-gray-400">
              แพลตฟอร์มวิเคราะห์พลังงานแสงอาทิตย์อัจฉริยะ สำหรับธุรกิจโซลาร์ยุคใหม่ในประเทศไทย
            </p>

            {/* Contact info */}
            <div className="mt-6 space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Mail className="h-4 w-4" />
                <span>contact@solariqapp.com</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Phone className="h-4 w-4" />
                <span>085-662-1113</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <MapPin className="h-4 w-4" />
                <span>นนทบุรี, ประเทศไทย</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Clock className="h-4 w-4" />
                <span>จ.-ศ. 9:00-18:00</span>
              </div>
            </div>

            {/* Social links */}
            <div className="mt-6 flex items-center gap-4">
              <a
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-primary-100 hover:text-primary-600 dark:hover:bg-primary-900 dark:hover:text-primary-400 transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-primary-100 hover:text-primary-600 dark:hover:bg-primary-900 dark:hover:text-primary-400 transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-[#06C755] text-white hover:bg-[#05b34d] transition-colors"
                aria-label="LINE Official"
              >
                <span className="text-xs font-bold">LINE</span>
              </a>
            </div>
          </div>

          {/* Link columns */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                {section.title}
              </h3>
              <ul className="mt-4 space-y-3">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-12 border-t border-gray-200 dark:border-gray-700 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-400">
            &copy; {new Date().getFullYear()} SolarIQ. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-sm text-gray-400">
            <Link href="/terms" className="hover:text-primary-600 transition-colors">
              ข้อกำหนดการใช้งาน
            </Link>
            <Link href="/privacy" className="hover:text-primary-600 transition-colors">
              ความเป็นส่วนตัว
            </Link>
            <Link href="/pdpa" className="hover:text-primary-600 transition-colors">
              PDPA Compliance
            </Link>
            <Link href="/refund-policy" className="hover:text-primary-600 transition-colors">
              การคืนเงิน
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

/* ------------------------------------------------------------------ */
/*  Marketing Layout                                                    */
/* ------------------------------------------------------------------ */
export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-950">
      <MarketingNavbar />
      <main className="flex-1 pt-16">{children}</main>
      <MarketingFooter />
    </div>
  )
}
