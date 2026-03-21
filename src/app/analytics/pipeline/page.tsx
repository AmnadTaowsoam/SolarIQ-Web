'use client'

import { useAnalyticsPipeline } from '@/hooks/useAnalytics'
import { Card, CardBody, CardHeader } from '@/components/ui'
import { ResponsiveContainer, FunnelChart, Funnel, LabelList, Tooltip } from 'recharts'

export default function PipelinePage() {
  const { data } = useAnalyticsPipeline()

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader title="Pipeline Funnel" subtitle="Lead to win conversion" />
        <CardBody>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <FunnelChart>
                <Tooltip />
                <Funnel dataKey="count" data={data.funnel} isAnimationActive>
                  <LabelList position="right" fill="#111827" dataKey="stage" />
                </Funnel>
              </FunnelChart>
            </ResponsiveContainer>
          </div>
        </CardBody>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader title="Bottlenecks" subtitle="Stages with slow movement" />
          <CardBody>
            <ul className="space-y-3">
              {data.bottlenecks.map((item) => (
                <li key={item.stage} className="p-3 border border-gray-100 rounded-lg">
                  <p className="text-sm font-semibold text-gray-900">{item.stage}</p>
                  <p className="text-xs text-gray-500 mt-1">{item.issue}</p>
                  <p className="text-xs text-orange-600 mt-2">{item.recommendation}</p>
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Revenue Forecast" subtitle="Weighted pipeline" />
          <CardBody>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Weighted</span>
                <span className="font-semibold">฿{data.forecast.weighted.toLocaleString('en-US')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Best case</span>
                <span className="font-semibold">฿{data.forecast.best.toLocaleString('en-US')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Worst case</span>
                <span className="font-semibold">฿{data.forecast.worst.toLocaleString('en-US')}</span>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
