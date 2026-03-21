'use client'

import { useAnalyticsLeads } from '@/hooks/useAnalytics'
import { Card, CardBody, CardHeader } from '@/components/ui'
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis } from 'recharts'

const COLORS = ['#f97316', '#22c55e', '#3b82f6', '#8b5cf6']

export default function LeadsAnalyticsPage() {
  const { data } = useAnalyticsLeads()

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader title="Lead Sources" subtitle="Distribution by channel" />
          <CardBody>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip />
                  <Pie data={data.sources} dataKey="count" nameKey="source" outerRadius={90}>
                    {data.sources.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Lead Quality" subtitle="A/B/C distribution" />
          <CardBody>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.quality}>
                  <XAxis dataKey="grade" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader title="Response Time" subtitle="Distribution" />
        <CardBody>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            {Object.entries(data.responseTime.distribution).map(([bucket, count]) => (
              <div key={bucket} className="p-3 border border-gray-100 rounded-lg text-center">
                <p className="text-xs text-gray-500">{bucket}</p>
                <p className="text-lg font-semibold text-gray-900">{count}</p>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
