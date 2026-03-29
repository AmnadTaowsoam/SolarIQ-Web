'use client'

import { useTranslations } from 'next-intl'

interface WarrantyBadgeProps {
  label: string
  status: string
  daysRemaining: number | null
}

export default function WarrantyBadge({ label, status, daysRemaining }: WarrantyBadgeProps) {
  const t = useTranslations('warrantyBadge')
  const config = {
    active: { bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-500' },
    expiring_soon: { bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-500' },
    expired: { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500' },
    not_set: {
      bg: 'bg-[var(--brand-background)]',
      text: 'text-[var(--brand-text-secondary)]',
      dot: 'bg-gray-400',
    },
  }[status] || {
    bg: 'bg-[var(--brand-background)]',
    text: 'text-[var(--brand-text-secondary)]',
    dot: 'bg-gray-400',
  }

  const statusText =
    {
      active:
        daysRemaining !== null ? `${Math.floor(daysRemaining / 365)} ${t('years')}` : t('active'),
      expiring_soon:
        daysRemaining !== null ? `${daysRemaining} ${t('daysLeft')}` : t('expiringSoon'),
      expired: t('expired'),
      not_set: t('warranty'),
    }[status] || status

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${config.bg} ${config.text}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
      {label}: {statusText}
    </div>
  )
}
