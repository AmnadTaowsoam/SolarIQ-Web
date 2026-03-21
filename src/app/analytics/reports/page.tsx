'use client'

import Link from 'next/link'
import { useReports } from '@/hooks/useAnalytics'
import { Card, CardBody, CardHeader } from '@/components/ui'
import { ROUTES } from '@/lib/constants'

export default function ReportsPage() {
  const { data } = useReports()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Custom Reports</h2>
          <p className="text-sm text-gray-500">Build and schedule analytics reports</p>
        </div>
        <Link href={`${ROUTES.ANALYTICS_REPORTS}/new`} className="px-4 py-2 text-sm font-semibold bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition">
          New Report
        </Link>
      </div>

      <Card>
        <CardHeader title="Reports" subtitle="Saved templates" />
        <CardBody>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-100 text-left text-xs text-gray-500">
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Last Run</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.reports.map((report) => (
                  <tr key={report.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      <Link href={`${ROUTES.ANALYTICS_REPORTS}/${report.id}`} className="hover:text-orange-600">
                        {report.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{report.category}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">{report.lastRunAt ? new Date(report.lastRunAt).toLocaleDateString('en-GB') : '-'}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">{report.lastRunStatus || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
