'use client'

/**
 * Permits Page (WK-112)
 * MEA/PEA automated permitting workflow management
 */

import { useState, useEffect, useCallback } from 'react'
import { AppLayout } from '@/components/layout'
import { useAuth } from '@/context'
import apiClient from '@/lib/api'
import { Shield, Clock, CheckCircle, AlertTriangle, FileText, Plus } from 'lucide-react'
import Link from 'next/link'

interface PermitRecord {
  id: string
  type: 'MEA' | 'PEA'
  customerName: string
  dealId: string
  status: 'draft' | 'submitted' | 'reviewing' | 'approved' | 'rejected'
  systemSize: number
  submittedDate: string | null
  approvedDate: string | null
}

const statusConfig = {
  draft: {
    label: 'Draft',
    color: 'bg-gray-500/10 text-[var(--brand-text-secondary)]',
    icon: FileText,
  },
  submitted: { label: 'Submitted', color: 'bg-blue-500/10 text-blue-600', icon: Clock },
  reviewing: { label: 'Reviewing', color: 'bg-yellow-500/10 text-yellow-600', icon: AlertTriangle },
  approved: { label: 'Approved', color: 'bg-green-500/10 text-green-600', icon: CheckCircle },
  rejected: { label: 'Rejected', color: 'bg-red-500/10 text-red-600', icon: AlertTriangle },
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapPermit(raw: Record<string, any>): PermitRecord {
  return {
    id: raw.id ?? raw.permit_id ?? '',
    type: raw.type ?? raw.permit_type ?? 'MEA',
    customerName: raw.customerName ?? raw.customer_name ?? '',
    dealId: raw.dealId ?? raw.deal_id ?? '',
    status: raw.status ?? 'draft',
    systemSize: Number(raw.systemSize ?? raw.system_size ?? 0),
    submittedDate: raw.submittedDate ?? raw.submitted_date ?? raw.submitted_at ?? null,
    approvedDate: raw.approvedDate ?? raw.approved_date ?? raw.approved_at ?? null,
  }
}

export default function PermitsPage() {
  const { user } = useAuth()
  const [permits, setPermits] = useState<PermitRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [showNewForm, setShowNewForm] = useState(false)

  const fetchPermits = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await apiClient.get('/api/v1/permits')
      const payload = response.data
      const items = payload.permits || payload.items || payload || []
      setPermits(Array.isArray(items) ? items.map(mapPermit) : [])
    } catch (err) {
      setPermits([])
      setError(err instanceof Error ? err.message : 'Permits are currently unavailable.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPermits()
  }, [fetchPermits])

  const filteredPermits =
    filterStatus === 'all' ? permits : permits.filter((p) => p.status === filterStatus)

  const stats = {
    total: permits.length,
    approved: permits.filter((p) => p.status === 'approved').length,
    pending: permits.filter((p) => ['submitted', 'reviewing'].includes(p.status)).length,
    draft: permits.filter((p) => p.status === 'draft').length,
  }

  return (
    <AppLayout user={user}>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[var(--brand-text)] flex items-center gap-2">
              <Shield className="w-7 h-7 text-[var(--brand-primary)]" />
              MEA/PEA Permits
            </h1>
            <p className="text-sm text-[var(--brand-text-secondary)] mt-1">
              Manage grid connection permits for solar installations
            </p>
          </div>
          <button
            onClick={() => setShowNewForm(!showNewForm)}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--brand-primary)] text-white rounded-lg hover:opacity-90 transition-opacity text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            New Permit
          </button>
        </div>

        {/* New Permit Form */}
        {showNewForm && (
          <form
            className="rounded-xl border border-amber-200 bg-amber-50 p-5"
            onSubmit={async (e) => {
              e.preventDefault()
              setSubmitError(null)
              const form = e.target as HTMLFormElement
              const data = new FormData(form)
              try {
                await apiClient.post('/api/v1/permits', {
                  authority: data.get('authority'),
                  permit_type: data.get('permit_type'),
                  customer_name: data.get('customer_name'),
                  system_size_kw: Number(data.get('system_size_kw')),
                })
                setShowNewForm(false)
                form.reset()
                await fetchPermits()
              } catch (err) {
                setSubmitError(
                  err instanceof Error ? err.message : 'Unable to create permit right now.'
                )
              }
            }}
          >
            <h3 className="mb-3 font-semibold text-[var(--brand-text)]">Create New Permit</h3>
            <div className="grid gap-3 md:grid-cols-2">
              <select name="authority" required className="rounded-lg border px-3 py-2 text-sm">
                <option value="mea">MEA (การไฟฟ้านครหลวง)</option>
                <option value="pea">PEA (การไฟฟ้าส่วนภูมิภาค)</option>
              </select>
              <select name="permit_type" required className="rounded-lg border px-3 py-2 text-sm">
                <option value="self_consumption">Self Consumption</option>
                <option value="net_metering">Net Metering</option>
                <option value="feed_in_tariff">Feed-in Tariff</option>
              </select>
              <input
                name="customer_name"
                placeholder="Customer Name *"
                required
                className="rounded-lg border px-3 py-2 text-sm"
              />
              <input
                name="system_size_kw"
                type="number"
                placeholder="System Size (kW) *"
                required
                className="rounded-lg border px-3 py-2 text-sm"
              />
            </div>
            <div className="mt-3 flex gap-2">
              <button
                type="submit"
                className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600"
              >
                Create Permit
              </button>
              <button
                type="button"
                onClick={() => setShowNewForm(false)}
                className="rounded-lg bg-gray-100 px-4 py-2 text-sm text-gray-600 hover:bg-gray-200"
              >
                Cancel
              </button>
            </div>
            {submitError && <p className="mt-3 text-sm text-red-600">{submitError}</p>}
          </form>
        )}

        {error && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {error}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total', value: stats.total, color: 'text-[var(--brand-text)]' },
            { label: 'Approved', value: stats.approved, color: 'text-green-600' },
            { label: 'Pending', value: stats.pending, color: 'text-yellow-600' },
            { label: 'Draft', value: stats.draft, color: 'text-[var(--brand-text-secondary)]' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-[var(--brand-surface)] border border-[var(--brand-border)] rounded-xl p-4 text-center"
            >
              <p className="text-xs text-[var(--brand-text-secondary)]">{stat.label}</p>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 flex-wrap">
          {['all', 'draft', 'submitted', 'reviewing', 'approved', 'rejected'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filterStatus === status
                  ? 'bg-[var(--brand-primary)] text-white'
                  : 'bg-[var(--brand-surface)] text-[var(--brand-text-secondary)] border border-[var(--brand-border)] hover:bg-[var(--brand-primary-light)]'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {/* Permits Table */}
        <div className="bg-[var(--brand-surface)] border border-[var(--brand-border)] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--brand-border)] bg-[var(--brand-surface)]">
                  <th className="text-left py-3 px-4 text-[var(--brand-text-secondary)] font-medium">
                    ID
                  </th>
                  <th className="text-left py-3 px-4 text-[var(--brand-text-secondary)] font-medium">
                    Type
                  </th>
                  <th className="text-left py-3 px-4 text-[var(--brand-text-secondary)] font-medium">
                    Customer
                  </th>
                  <th className="text-right py-3 px-4 text-[var(--brand-text-secondary)] font-medium">
                    System Size
                  </th>
                  <th className="text-center py-3 px-4 text-[var(--brand-text-secondary)] font-medium">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 text-[var(--brand-text-secondary)] font-medium">
                    Submitted
                  </th>
                  <th className="text-left py-3 px-4 text-[var(--brand-text-secondary)] font-medium">
                    Approved
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-8 text-center text-[var(--brand-text-secondary)]"
                    >
                      Loading permits...
                    </td>
                  </tr>
                )}
                {!isLoading && filteredPermits.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-8 text-center text-[var(--brand-text-secondary)]"
                    >
                      No permits found for the selected filter.
                    </td>
                  </tr>
                )}
                {filteredPermits.map((permit) => {
                  const config = statusConfig[permit.status]
                  const StatusIcon = config.icon
                  return (
                    <tr
                      key={permit.id}
                      className="border-b border-[var(--brand-border)]/50 hover:bg-[var(--brand-primary-light)] transition-colors"
                    >
                      <td className="py-3 px-4">
                        <Link
                          href={`/deals/${permit.dealId}/permits`}
                          className="text-[var(--brand-primary)] font-medium hover:underline"
                        >
                          {permit.id}
                        </Link>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-bold ${
                            permit.type === 'MEA'
                              ? 'bg-blue-500/10 text-blue-600'
                              : 'bg-purple-500/10 text-purple-600'
                          }`}
                        >
                          {permit.type}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-[var(--brand-text)]">{permit.customerName}</td>
                      <td className="py-3 px-4 text-right text-[var(--brand-text)]">
                        {permit.systemSize} kWp
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${config.color}`}
                        >
                          <StatusIcon className="w-3 h-3" />
                          {config.label}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-[var(--brand-text-secondary)]">
                        {permit.submittedDate || '-'}
                      </td>
                      <td className="py-3 px-4 text-[var(--brand-text-secondary)]">
                        {permit.approvedDate || '-'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
