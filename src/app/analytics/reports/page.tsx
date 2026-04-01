'use client'

import Link from 'next/link'
import { useReports } from '@/hooks/useAnalytics'
import { Card, CardBody, CardHeader } from '@/components/ui'
import { ROUTES } from '@/lib/constants'

export default function ReportsPage() {
  const { data, error, isLoading } = useReports()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-[var(--brand-text)]">Custom Reports</h2>
          <p className="text-sm text-[var(--brand-text-secondary)]">
            Build and schedule analytics reports
          </p>
        </div>
        <Link
          href={`${ROUTES.ANALYTICS_REPORTS}/new`}
          className="px-4 py-2 text-sm font-semibold bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
        >
          New Report
        </Link>
      </div>

      <Card>
        <CardHeader title="Reports" subtitle="Saved templates" />
        <CardBody>
          {error && (
            <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              Report templates could not be loaded from the backend.
            </div>
          )}
          {isLoading ? (
            <p className="text-sm text-[var(--brand-text-secondary)]">Loading reports...</p>
          ) : data.reports.length === 0 ? (
            <p className="text-sm text-[var(--brand-text-secondary)]">
              No custom reports are available yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-[var(--brand-border)] text-left text-xs text-[var(--brand-text-secondary)]">
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Last Run</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--brand-border)]">
                  {data.reports.map((report) => (
                    <tr key={report.id} className="hover:bg-[var(--brand-primary-light)]">
                      <td className="px-4 py-3 text-sm font-medium text-[var(--brand-text)]">
                        <Link
                          href={`${ROUTES.ANALYTICS_REPORTS}/${report.id}`}
                          className="hover:text-orange-600"
                        >
                          {report.name}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-sm text-[var(--brand-text-secondary)]">
                        {report.category}
                      </td>
                      <td className="px-4 py-3 text-xs text-[var(--brand-text-secondary)]">
                        {report.lastRunAt
                          ? new Date(report.lastRunAt).toLocaleDateString('en-GB')
                          : '-'}
                      </td>
                      <td className="px-4 py-3 text-xs text-[var(--brand-text-secondary)]">
                        {report.lastRunStatus || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  )
}
