'use client'

import { useAnalyticsDashboard } from '@/hooks/useAnalytics'
import { Card, CardBody, CardHeader, Badge } from '@/components/ui'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, BarChart, Bar } from 'recharts'

function formatThb(value: number) {
  return `฿${value.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
}

export default function AnalyticsOverviewPage() {
  const { data } = useAnalyticsDashboard()

  const kpis = data.kpis

  const sparkData = kpis.revenue.sparkline.map((value, idx) => ({ day: idx + 1, value }))

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {[
          { label: 'Revenue', value: formatThb(kpis.revenue.value), change: kpis.revenue.change },
          { label: 'Deals Won', value: kpis.dealsWon.value.toLocaleString('en-US'), change: kpis.dealsWon.change },
          { label: 'Conversion', value: `${kpis.conversionRate.value.toFixed(1)}%`, change: kpis.conversionRate.change },
          { label: 'Avg Deal', value: formatThb(kpis.avgDealValue.value), change: kpis.avgDealValue.change },
          { label: 'CSAT', value: kpis.satisfaction.value.toFixed(1), change: kpis.satisfaction.change },
          { label: 'Resp Time', value: `${kpis.responseTime.value.toFixed(0)} min`, change: kpis.responseTime.change },
        ].map((item) => (
          <Card key={item.label}>
            <CardBody>
              <p className="text-xs text-gray-500 uppercase">{item.label}</p>
              <p className="text-xl font-bold text-gray-900 mt-2">{item.value}</p>
              {item.change !== null && item.change !== undefined && (
                <p className={`text-xs mt-1 ${item.change >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {item.change >= 0 ? '+' : ''}{item.change.toFixed(1)}%
                </p>
              )}
            </CardBody>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card>
          <CardHeader title="Revenue Trend" subtitle="Last 30 days" />
          <CardBody>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sparkData}>
                  <XAxis dataKey="day" hide />
                  <YAxis hide />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke="#f97316" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Top Lead Sources" subtitle="Share by channel" />
          <CardBody>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.topSources}>
                  <XAxis dataKey="source" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#22c55e" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader title="AI Insights" subtitle="Latest insights from analytics engine" />
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {data.recentInsights.map((insight) => (
              <div key={insight.id} className="border border-gray-100 rounded-lg p-4 bg-white">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-gray-900">{insight.title}</p>
                  <Badge className={insight.severity === 'warning' ? 'bg-yellow-100 text-yellow-800' : 'bg-emerald-100 text-emerald-700'}>
                    {insight.type}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mt-2">{insight.body}</p>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
