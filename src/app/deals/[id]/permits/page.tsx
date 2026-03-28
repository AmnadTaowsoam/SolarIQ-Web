'use client'

import { useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { PermitWizard } from '@/components/permits/PermitWizard'
import { Button } from '@/components/ui/Button'

import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function PermitPage() {
  const t = useTranslations('permitsPage')
  const params = useParams()
  const dealId = params.id as string

  // For demo purposes, use a fixed permit ID
  const permitId = 'permit-demo-1'

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link href="/deals">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {t('noPermits')}
                </Button>
              </Link>
              <h1 className="ml-4 text-xl font-semibold">{t('title')}</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-6">
        <PermitWizard permitId={permitId} dealId={dealId} />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-gray-600">© 2026 SolarIQ. {t('status')}</p>
        </div>
      </footer>
    </div>
  )
}
