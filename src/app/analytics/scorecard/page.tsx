'use client'

import { useAnalyticsScorecard, useAnalyticsScorecardHistory } from '@/hooks/useAnalytics'
import { Card, CardBody, CardHeader } from '@/components/ui'

export default function ScorecardPage() {
  const { data } = useAnalyticsScorecard()
  const { data: historyData } = useAnalyticsScorecardHistory()

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader title="Performance Scorecard" subtitle={`Grade ${data.grade} · Score ${data.overallScore}`} />
        <CardBody>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { label: 'Response Time', value: data.responseTimeScore },
              { label: 'Conversion', value: data.conversionRateScore },
              { label: 'Satisfaction', value: data.satisfactionScore },
              { label: 'Cycle Time', value: data.cycleTimeScore },
              { label: 'Activity', value: data.activityScore },
            ].map((item) => (
              <div key={item.label} className="p-3 border border-gray-100 rounded-lg text-center">
                <p className="text-xs text-gray-500">{item.label}</p>
                <p className="text-lg font-semibold text-gray-900">{item.value}</p>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Score History" subtitle="Last 6 months" />
        <CardBody>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            {historyData.history.map((item) => (
              <div key={`${item.periodYear}-${item.periodMonth}`} className="p-3 border border-gray-100 rounded-lg text-center">
                <p className="text-xs text-gray-500">{item.periodMonth}/{item.periodYear}</p>
                <p className="text-lg font-semibold text-gray-900">{item.overallScore}</p>
                <p className="text-xs text-gray-400">Grade {item.grade}</p>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
