'use client'

import { use, useState } from 'react'
import { useTranslations } from 'next-intl'
import { AppLayout } from '@/components/layout'
import { useAuth } from '@/context'
import {
  useInstallation,
  useMaintenanceSchedules,
  useServiceRecords,
  useCreateMaintenanceSchedule,
  useCreateServiceRecord,
} from '@/hooks/useMaintenance'
import WarrantyBadge from '@/components/maintenance/WarrantyBadge'
import Link from 'next/link'

export default function InstallationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const t = useTranslations('maintenanceDetailPage')
  const { id } = use(params)
  const { user } = useAuth()
  const { data: installation, isLoading } = useInstallation(id)
  const { data: schedules } = useMaintenanceSchedules(id)
  const { data: records } = useServiceRecords(id)
  const createSchedule = useCreateMaintenanceSchedule(id)
  const createRecord = useCreateServiceRecord(id)

  const [showScheduleForm, setShowScheduleForm] = useState(false)
  const [showRecordForm, setShowRecordForm] = useState(false)

  if (!user) {
    return null
  }

  if (isLoading) {
    return (
      <AppLayout user={user}>
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-t-transparent" />
        </div>
      </AppLayout>
    )
  }

  if (!installation) {
    return (
      <AppLayout user={user}>
        <div className="p-12 text-center text-gray-500">{t('notFound')}</div>
      </AppLayout>
    )
  }

  return (
    <AppLayout user={user}>
      <div className="max-w-5xl space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Link href="/maintenance" className="hover:text-amber-600">
            {t('title')}
          </Link>
          <span>/</span>
          <span className="text-gray-900">{installation.customer_name}</span>
        </div>

        {/* Header */}
        <div className="rounded-xl border bg-white p-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">{installation.customer_name}</h1>
              <p className="mt-1 text-sm text-gray-500">
                {installation.address || t('addressNotSpecified')}
              </p>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                installation.status === 'active'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {installation.status === 'active' ? t('status.active') : installation.status}
            </span>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
            <div>
              <span className="text-gray-500">{t('systemInfo.systemSize')}</span>
              <p className="font-semibold">{installation.system_size_kw} kWp</p>
            </div>
            <div>
              <span className="text-gray-500">{t('systemInfo.solarPanels')}</span>
              <p className="font-semibold">
                {installation.panel_brand || '-'} {installation.panel_model || ''}
              </p>
            </div>
            <div>
              <span className="text-gray-500">{t('systemInfo.inverter')}</span>
              <p className="font-semibold">
                {installation.inverter_brand || '-'} {installation.inverter_model || ''}
              </p>
            </div>
            <div>
              <span className="text-gray-500">{t('systemInfo.installationDate')}</span>
              <p className="font-semibold">
                {installation.installation_date
                  ? new Date(installation.installation_date).toLocaleDateString('th-TH')
                  : '-'}
              </p>
            </div>
          </div>

          {/* Warranty Status */}
          {installation.warranty_status && (
            <div className="mt-4 flex flex-wrap gap-2">
              <WarrantyBadge
                label={t('warranty.panel')}
                status={installation.warranty_status.panel.status}
                daysRemaining={installation.warranty_status.panel.days_remaining}
              />
              <WarrantyBadge
                label={t('warranty.inverter')}
                status={installation.warranty_status.inverter.status}
                daysRemaining={installation.warranty_status.inverter.days_remaining}
              />
              <WarrantyBadge
                label={t('warranty.installation')}
                status={installation.warranty_status.installation.status}
                daysRemaining={installation.warranty_status.installation.days_remaining}
              />
            </div>
          )}
        </div>

        {/* Maintenance Schedules */}
        <div className="rounded-xl border bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">{t('schedule.title')}</h2>
            <button
              onClick={() => setShowScheduleForm(!showScheduleForm)}
              className="rounded-lg bg-amber-100 px-3 py-1.5 text-xs font-medium text-amber-700 hover:bg-amber-200"
            >
              {t('schedule.addSchedule')}
            </button>
          </div>

          {showScheduleForm && (
            <form
              className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-4"
              onSubmit={async (e) => {
                e.preventDefault()
                const form = e.target as HTMLFormElement
                const data = new FormData(form)
                await createSchedule.mutateAsync({
                  maintenance_type: data.get('type') as string,
                  frequency_months: Number(data.get('frequency')),
                  next_due_date: data.get('next_date') as string,
                  notes: data.get('notes') as string,
                })
                setShowScheduleForm(false)
                form.reset()
              }}
            >
              <div className="grid gap-3 md:grid-cols-4">
                <select name="type" required className="rounded-lg border px-3 py-2 text-sm">
                  <option value="cleaning">{t('schedule.type.cleaning')}</option>
                  <option value="inspection">{t('schedule.type.inspection')}</option>
                  <option value="inverter_check">{t('schedule.type.inverterCheck')}</option>
                  <option value="general">{t('schedule.type.general')}</option>
                </select>
                <select name="frequency" className="rounded-lg border px-3 py-2 text-sm">
                  <option value="3">{t('schedule.frequency.3')}</option>
                  <option value="6">{t('schedule.frequency.6')}</option>
                  <option value="12">{t('schedule.frequency.12')}</option>
                </select>
                <input
                  name="next_date"
                  type="date"
                  required
                  className="rounded-lg border px-3 py-2 text-sm"
                />
                <input
                  name="notes"
                  placeholder={t('schedule.notes')}
                  className="rounded-lg border px-3 py-2 text-sm"
                />
              </div>
              <button
                type="submit"
                className="mt-3 rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600"
              >
                {t('schedule.save')}
              </button>
            </form>
          )}

          {schedules && schedules.length > 0 ? (
            <div className="space-y-2">
              {schedules.map((s) => (
                <div key={s.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <span className="text-sm font-medium text-gray-900">
                      {s.maintenance_type === 'cleaning'
                        ? t('schedule.type.cleaning')
                        : s.maintenance_type === 'inspection'
                          ? t('schedule.type.inspection')
                          : s.maintenance_type === 'inverter_check'
                            ? t('schedule.type.inverterCheck')
                            : s.maintenance_type}
                    </span>
                    <span className="ml-2 text-xs text-gray-500">
                      {t('schedule.everyXMonths', { count: s.frequency_months })}
                    </span>
                  </div>
                  <span className="text-sm text-gray-600">
                    {s.next_due_date
                      ? `${t('schedule.nextDue')} ${new Date(s.next_due_date).toLocaleDateString('th-TH')}`
                      : t('schedule.notSet')}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">{t('schedule.noSchedule')}</p>
          )}
        </div>

        {/* Service Records */}
        <div className="rounded-xl border bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">{t('records.title')}</h2>
            <button
              onClick={() => setShowRecordForm(!showRecordForm)}
              className="rounded-lg bg-blue-100 px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-200"
            >
              {t('records.addRecord')}
            </button>
          </div>

          {showRecordForm && (
            <form
              className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-4"
              onSubmit={async (e) => {
                e.preventDefault()
                const form = e.target as HTMLFormElement
                const data = new FormData(form)
                await createRecord.mutateAsync({
                  service_date: data.get('date') as string,
                  service_type: data.get('type') as string,
                  description: data.get('description') as string,
                  cost_thb: Number(data.get('cost')) || undefined,
                  technician_name: data.get('technician') as string,
                })
                setShowRecordForm(false)
                form.reset()
              }}
            >
              <div className="grid gap-3 md:grid-cols-3">
                <input
                  name="date"
                  type="date"
                  required
                  className="rounded-lg border px-3 py-2 text-sm"
                />
                <select name="type" required className="rounded-lg border px-3 py-2 text-sm">
                  <option value="cleaning">{t('records.type.cleaning')}</option>
                  <option value="inspection">{t('records.type.inspection')}</option>
                  <option value="repair">{t('records.type.repair')}</option>
                  <option value="replacement">{t('records.type.replacement')}</option>
                </select>
                <input
                  name="technician"
                  placeholder={t('records.technicianPlaceholder')}
                  className="rounded-lg border px-3 py-2 text-sm"
                />
              </div>
              <textarea
                name="description"
                placeholder={t('records.descriptionPlaceholder')}
                className="mt-3 w-full rounded-lg border px-3 py-2 text-sm"
                rows={2}
              />
              <input
                name="cost"
                type="number"
                placeholder={t('records.costPlaceholder')}
                className="mt-2 rounded-lg border px-3 py-2 text-sm"
              />
              <button
                type="submit"
                className="mt-3 rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600"
              >
                {t('records.save')}
              </button>
            </form>
          )}

          {records && records.length > 0 ? (
            <div className="space-y-3">
              {records.map((r) => (
                <div key={r.id} className="rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">
                      {r.service_type === 'cleaning'
                        ? t('records.type.cleaning')
                        : r.service_type === 'inspection'
                          ? t('records.type.inspection')
                          : r.service_type === 'repair'
                            ? t('records.type.repair')
                            : r.service_type === 'replacement'
                              ? t('records.type.replacement')
                              : r.service_type}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(r.service_date).toLocaleDateString('th-TH')}
                    </span>
                  </div>
                  {r.description && <p className="mt-1 text-sm text-gray-600">{r.description}</p>}
                  <div className="mt-2 flex gap-4 text-xs text-gray-500">
                    {r.technician_name && (
                      <span>{t('records.technicianLabel', { name: r.technician_name })}</span>
                    )}
                    {r.cost_thb && (
                      <span>{t('records.costLabel', { cost: r.cost_thb.toLocaleString() })}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">{t('records.noRecords')}</p>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
