'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardBody, CardHeader, Input, Button } from '@/components/ui'
import { createReport } from '@/hooks/useAnalytics'
import { ROUTES } from '@/lib/constants'

export default function NewReportPage() {
  const router = useRouter()
  const [name, setName] = useState('Lead Summary')
  const [description, setDescription] = useState('Monthly lead summary report')
  const [isSaving, setIsSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleCreate = async () => {
    setIsSaving(true)
    setErrorMessage(null)
    try {
      const report = await createReport({
        name,
        description,
        category: 'sales',
        config: {
          dataSources: ['leads'],
          fields: [{ source: 'leads', field: 'status', aggregation: 'COUNT', alias: 'count' }],
          groupBy: ['status'],
          visualization: 'table' as const,
        },
      })
      router.push(`${ROUTES.ANALYTICS_REPORTS}/${report.id}`)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to create report right now.')
      setIsSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader title="Create Report" subtitle="Start from a simple template" />
      <CardBody className="space-y-4">
        {errorMessage && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </div>
        )}
        <Input label="Report name" value={name} onChange={(e) => setName(e.target.value)} />
        <Input
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <Button onClick={handleCreate} disabled={isSaving}>
          {isSaving ? 'Creating...' : 'Create Report'}
        </Button>
      </CardBody>
    </Card>
  )
}
