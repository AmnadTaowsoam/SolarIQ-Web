'use client'

import { useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { PermitWizard } from '@/components/permits/PermitWizard'
import { Button } from '@/components/ui/Button'
import { AppLayout } from '@/components/layout'
import { useAuth } from '@/context'

import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function PermitPage() {
  const { user } = useAuth()
  const t = useTranslations('permitsPage')
  const params = useParams()
  const dealId = params.id as string

  const permitId = 'permit-demo-1'

  return (
    <AppLayout user={user}>
      <div className="flex items-center mb-4">
        <Link href="/deals">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('noPermits')}
          </Button>
        </Link>
        <h1 className="ml-4 text-xl font-semibold">{t('title')}</h1>
      </div>
      <PermitWizard permitId={permitId} dealId={dealId} />
    </AppLayout>
  )
}
