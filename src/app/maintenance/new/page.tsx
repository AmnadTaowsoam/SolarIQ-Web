'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { AppLayout } from '@/components/layout'
import { useAuth } from '@/context'
import { apiClient } from '@/lib/api'
import Link from 'next/link'

const PANEL_BRANDS = [
  'JA Solar',
  'LONGi',
  'Trina Solar',
  'Canadian Solar',
  'Jinko Solar',
  'Risen Energy',
  'Hanwha Q Cells',
  'Astronergy',
  'Other',
]
const INVERTER_BRANDS = [
  'Huawei',
  'SMA',
  'Growatt',
  'Sungrow',
  'Goodwe',
  'Fronius',
  'Enphase',
  'SolarEdge',
  'Deye',
  'Other',
]

export default function NewInstallationPage() {
  const { user } = useAuth()
  const router = useRouter()
  const t = useTranslations('maintenanceNewPage')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    address: '',
    system_size_kw: '',
    panel_brand: '',
    panel_model: '',
    panel_count: '',
    inverter_brand: '',
    inverter_model: '',
    installation_date: '',
    warranty_years: '10',
    notes: '',
  })

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      await apiClient.post('/api/v1/installations', {
        customer_name: form.customer_name,
        customer_phone: form.customer_phone,
        customer_email: form.customer_email || undefined,
        address: form.address,
        system_size_kw: parseFloat(form.system_size_kw),
        panel_brand: form.panel_brand,
        panel_model: form.panel_model || undefined,
        panel_count: form.panel_count ? parseInt(form.panel_count) : undefined,
        inverter_brand: form.inverter_brand,
        inverter_model: form.inverter_model || undefined,
        installation_date: form.installation_date,
        warranty_years: parseInt(form.warranty_years),
        notes: form.notes || undefined,
      })
      router.push('/maintenance')
    } catch {
      setError(t('submitError'))
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!user) {
    return null
  }

  return (
    <AppLayout user={user}>
      <div className="max-w-2xl">
        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <Link href="/maintenance" className="text-gray-400 hover:text-gray-600">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{t('title')}</h1>
            <p className="text-sm text-gray-500">{t('subtitle')}</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Customer Info */}
          <div className="rounded-xl border bg-white p-5">
            <h2 className="mb-4 text-sm font-semibold text-gray-900">{t('sections.customer')}</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('fields.customerName')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="customer_name"
                  value={form.customer_name}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-amber-500 focus:ring-amber-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('fields.phone')}
                  </label>
                  <input
                    type="tel"
                    name="customer_phone"
                    value={form.customer_phone}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-amber-500 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('fields.email')}
                  </label>
                  <input
                    type="email"
                    name="customer_email"
                    value={form.customer_email}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-amber-500 focus:ring-amber-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('fields.address')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-amber-500 focus:ring-amber-500"
                />
              </div>
            </div>
          </div>

          {/* System Info */}
          <div className="rounded-xl border bg-white p-5">
            <h2 className="mb-4 text-sm font-semibold text-gray-900">{t('sections.system')}</h2>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('fields.systemSize')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="system_size_kw"
                    value={form.system_size_kw}
                    onChange={handleChange}
                    required
                    step="any"
                    min="0.1"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-amber-500 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('fields.panelCount')}
                  </label>
                  <input
                    type="number"
                    name="panel_count"
                    value={form.panel_count}
                    onChange={handleChange}
                    min="1"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-amber-500 focus:ring-amber-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('fields.panelBrand')} <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="panel_brand"
                    value={form.panel_brand}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-amber-500 focus:ring-amber-500"
                  >
                    <option value="">{t('fields.selectBrand')}</option>
                    {PANEL_BRANDS.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('fields.panelModel')}
                  </label>
                  <input
                    type="text"
                    name="panel_model"
                    value={form.panel_model}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-amber-500 focus:ring-amber-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('fields.inverterBrand')} <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="inverter_brand"
                    value={form.inverter_brand}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-amber-500 focus:ring-amber-500"
                  >
                    <option value="">{t('fields.selectBrand')}</option>
                    {INVERTER_BRANDS.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('fields.inverterModel')}
                  </label>
                  <input
                    type="text"
                    name="inverter_model"
                    value={form.inverter_model}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-amber-500 focus:ring-amber-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Installation Info */}
          <div className="rounded-xl border bg-white p-5">
            <h2 className="mb-4 text-sm font-semibold text-gray-900">
              {t('sections.installation')}
            </h2>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('fields.installationDate')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="installation_date"
                    value={form.installation_date}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-amber-500 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('fields.warrantyYears')}
                  </label>
                  <select
                    name="warranty_years"
                    value={form.warranty_years}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-amber-500 focus:ring-amber-500"
                  >
                    {[5, 10, 15, 20, 25].map((y) => (
                      <option key={y} value={y}>
                        {y} {t('fields.years')}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('fields.notes')}
                </label>
                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  rows={3}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-amber-500 focus:ring-amber-500 resize-none"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Link
              href="/maintenance"
              className="rounded-lg border border-gray-300 bg-white px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              {t('cancel')}
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-amber-500 px-6 py-2.5 text-sm font-medium text-white hover:bg-amber-600 disabled:opacity-50"
            >
              {isSubmitting ? t('submitting') : t('submit')}
            </button>
          </div>
        </form>
      </div>
    </AppLayout>
  )
}
