'use client'

import { useAnalyticsMarket } from '@/hooks/useAnalytics'
import { Card, CardBody, CardHeader } from '@/components/ui'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts'

export default function MarketPage() {
  const { data } = useAnalyticsMarket()
  const distribution = Object.entries(data.systemSize.distribution).map(([label, count]) => ({ label, count }))

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader title="System Size Distribution" subtitle="kWp breakdown" />
        <CardBody>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={distribution}>
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#f97316" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardBody>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader title="Top Panel Brands" subtitle="By installations" />
          <CardBody>
            <ul className="space-y-2 text-sm">
              {data.popularBrands.panels.map((brand) => (
                <li key={brand.name} className="flex justify-between">
                  <span className="text-gray-700">{brand.name}</span>
                  <span className="font-semibold">{brand.count}</span>
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Top Inverter Brands" subtitle="By installations" />
          <CardBody>
            <ul className="space-y-2 text-sm">
              {data.popularBrands.inverters.map((brand) => (
                <li key={brand.name} className="flex justify-between">
                  <span className="text-gray-700">{brand.name}</span>
                  <span className="font-semibold">{brand.count}</span>
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
