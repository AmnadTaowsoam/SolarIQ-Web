'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardBody, CardHeader, Button } from '@/components/ui'
import { useReport, runReport } from '@/hooks/useAnalytics'

export default function ReportDetailPage() {
  const params = useParams()
  const reportId = params?.id as string
  const { data: report } = useReport(reportId)
  const [result, setResult] = useState<{
    columns: string[]
    rows: Record<string, unknown>[]
  } | null>(null)

  const handleRun = async () => {
    try {
      const res = await runReport(reportId, 'json')
      if (res.data) {
        setResult(res.data)
      }
    } catch {
      setResult(null)
    }
  }

  if (!report) {
    return null
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader title={report.name} subtitle={report.description || 'Custom report'} />
        <CardBody>
          <Button onClick={handleRun}>Run Report</Button>
        </CardBody>
      </Card>

      {result && (
        <Card>
          <CardHeader title="Report Results" subtitle={`${result.rows.length} rows`} />
          <CardBody>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-[var(--brand-border)] text-left text-xs text-[var(--brand-text-secondary)]">
                    {result.columns.map((col) => (
                      <th key={col} className="px-4 py-2">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--brand-border)]">
                  {result.rows.map((row, idx) => (
                    <tr key={idx} className="hover:bg-[var(--brand-primary-light)]">
                      {result.columns.map((col) => (
                        <td key={col} className="px-4 py-2 text-sm text-[var(--brand-text)]">
                          {String(row[col])}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  )
}
