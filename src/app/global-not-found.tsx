import type { Metadata } from 'next'
import Link from 'next/link'
import './globals.css'

export const runtime = 'edge'

export const metadata: Metadata = {
  title: '404 - Page Not Found | SolarIQ',
  description: 'The page you are looking for does not exist.',
}

export default function GlobalNotFound() {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
        <main className="min-h-screen flex flex-col items-center justify-center px-4">
          <div className="max-w-lg w-full text-center">
            <div className="mb-6">
              <span className="text-3xl font-bold text-orange-600">Solar</span>
              <span className="text-3xl font-bold text-[var(--brand-text)]">IQ</span>
            </div>

            <h1 className="text-8xl font-extrabold text-orange-200 mb-2">404</h1>
            <h2 className="text-2xl font-semibold text-[var(--brand-text)] mb-3">Page not found</h2>
            <p className="text-[var(--brand-text-secondary)] mb-2">
              The page you requested is unavailable or may have moved.
            </p>
            <p className="text-[var(--brand-text-secondary)] mb-8">
              The content may have moved, been removed, or the URL may be incorrect.
            </p>

            <div className="flex flex-wrap gap-3 justify-center">
              <Link
                href="/"
                className="inline-flex items-center px-5 py-2.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
              >
                Back to Home
              </Link>
              <Link
                href="/pricing-plans"
                className="inline-flex items-center px-5 py-2.5 bg-[var(--brand-surface)] text-[var(--brand-text)] border border-[var(--brand-border)] rounded-lg hover:bg-[var(--brand-background)] transition-colors font-medium"
              >
                View Pricing
              </Link>
            </div>
          </div>
        </main>
      </body>
    </html>
  )
}
