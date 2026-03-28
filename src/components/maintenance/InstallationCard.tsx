'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import type { Installation } from '@/hooks/useMaintenance'
import WarrantyBadge from './WarrantyBadge'

interface InstallationCardProps {
  installation: Installation
}

export default function InstallationCard({ installation: inst }: InstallationCardProps) {
  const t = useTranslations('installationCard')
  return (
    <Link
      href={`/maintenance/${inst.id}`}
      className="block rounded-xl border border-gray-200 bg-white p-5 transition-shadow hover:shadow-md"
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-gray-900">{inst.customer_name}</h3>
          <p className="mt-0.5 text-sm text-gray-500">{inst.address || t('address')}</p>
        </div>
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
            inst.status === 'active'
              ? 'bg-green-100 text-green-700'
              : inst.status === 'inactive'
                ? 'bg-gray-100 text-gray-600'
                : 'bg-red-100 text-red-700'
          }`}
        >
          {inst.status === 'active'
            ? t('active')
            : inst.status === 'inactive'
              ? t('status')
              : t('maintenance')}
        </span>
      </div>

      <div className="mt-3 flex items-center gap-4 text-sm text-gray-600">
        <span className="flex items-center gap-1">
          <svg
            className="h-4 w-4 text-amber-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
          {inst.system_size_kw} kWp
        </span>
        {inst.panel_brand && (
          <span>
            {inst.panel_brand} {inst.panel_model || ''}
          </span>
        )}
        {inst.installation_date && (
          <span>
            {t('installDate')}: {new Date(inst.installation_date).toLocaleDateString('th-TH')}
          </span>
        )}
      </div>

      {inst.warranty_status && (
        <div className="mt-3 flex flex-wrap gap-2">
          <WarrantyBadge
            label={t('panelBrand')}
            status={inst.warranty_status.panel.status}
            daysRemaining={inst.warranty_status.panel.days_remaining}
          />
          <WarrantyBadge
            label={t('inverterBrand')}
            status={inst.warranty_status.inverter.status}
            daysRemaining={inst.warranty_status.inverter.days_remaining}
          />
          <WarrantyBadge
            label={t('installDate')}
            status={inst.warranty_status.installation.status}
            daysRemaining={inst.warranty_status.installation.days_remaining}
          />
        </div>
      )}
    </Link>
  )
}
