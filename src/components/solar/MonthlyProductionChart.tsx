'use client'

import { useMemo } from 'react'
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
} from 'recharts'
import { Card, CardHeader, CardBody } from '@/components/ui'
import { Sun, TrendingUp, TrendingDown, BarChart3 } from 'lucide-react'
import { CHART_COLORS } from '@/lib/constants'
import type { MonthlyProduction } from '@/types'

interface MonthlyProductionChartProps {
  data: MonthlyProduction[]
  systemSizeKwp: number
}

const SEASON_LABELS: Record<number, string> = {
  1: 'Dry Season',
  2: 'Dry Season',
  3: 'Dry Season',
  4: 'Dry Season',
  5: 'Monsoon',
  6: 'Monsoon',
  7: 'Monsoon',
  8: 'Monsoon',
  9: 'Monsoon',
  10: 'Monsoon',
  11: 'Dry Season',
  12: 'Dry Season',
}

function getBarColor(productionKwh: number, maxProduction: number): string {
  const ratio = maxProduction > 0 ? productionKwh / maxProduction : 0
  if (ratio >= 0.75) {
    return '#22c55e'
  } // green - high
  if (ratio >= 0.5) {
    return '#eab308'
  } // yellow - medium
  return '#f97316' // orange - low (monsoon)
}

const formatNumber = (value: number): string =>
  new Intl.NumberFormat('th-TH', { maximumFractionDigits: 0 }).format(value)

export function MonthlyProductionChart({ data, systemSizeKwp }: MonthlyProductionChartProps) {
  const stats = useMemo(() => {
    if (!data || data.length === 0) {
      return null
    }
    const sorted = [...data].sort((a, b) => b.productionKwh - a.productionKwh)
    const total = data.reduce((sum, d) => sum + d.productionKwh, 0)
    const best = sorted[0]
    const worst = sorted[sorted.length - 1]
    if (!best || !worst) {
      return null
    }
    return {
      best,
      worst,
      average: total / data.length,
      total,
      maxProduction: best.productionKwh,
    }
  }, [data])

  const chartData = useMemo(() => {
    if (!data) {
      return []
    }
    return data.map((d) => ({
      ...d,
      season: SEASON_LABELS[d.month] || '',
      shortMonth: d.monthName.substring(0, 3),
    }))
  }, [data])

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardBody className="p-6 text-center text-[var(--brand-text-secondary)]">
          <Sun className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No monthly production data available.</p>
        </CardBody>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader
        title="Monthly Solar Production"
        subtitle={`System size: ${(systemSizeKwp ?? 0).toFixed(2)} kWp`}
      />
      <CardBody>
        {/* Summary Stats */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-green-500/5">
              <TrendingUp className="w-5 h-5 text-green-500" />
              <div>
                <div className="text-xs text-[var(--brand-text-secondary)]">Best Month</div>
                <div className="text-lg font-bold text-green-600">{stats.best.monthName}</div>
                <div className="text-xs text-[var(--brand-text-secondary)]">
                  {formatNumber(stats.best.productionKwh)} kWh
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-orange-500/5">
              <TrendingDown className="w-5 h-5 text-orange-500" />
              <div>
                <div className="text-xs text-[var(--brand-text-secondary)]">Worst Month</div>
                <div className="text-lg font-bold text-orange-600">{stats.worst.monthName}</div>
                <div className="text-xs text-[var(--brand-text-secondary)]">
                  {formatNumber(stats.worst.productionKwh)} kWh
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-500/5">
              <BarChart3 className="w-5 h-5 text-blue-500" />
              <div>
                <div className="text-xs text-[var(--brand-text-secondary)]">Average Monthly</div>
                <div className="text-lg font-bold text-blue-600">
                  {formatNumber(stats.average)} kWh
                </div>
                <div className="text-xs text-[var(--brand-text-secondary)]">
                  Total: {formatNumber(stats.total)} kWh/yr
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Seasonal Labels */}
        <div className="flex items-center gap-4 mb-4 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-green-500" />
            <span className="text-[var(--brand-text-secondary)]">
              High Production (Dry Season: Nov-Apr)
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-orange-500" />
            <span className="text-[var(--brand-text-secondary)]">
              Low Production (Monsoon: May-Oct)
            </span>
          </div>
        </div>

        {/* Chart */}
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--brand-border)" />
              <XAxis
                dataKey="shortMonth"
                tick={{ fontSize: 11, fill: 'var(--brand-text-secondary)' }}
              />
              <YAxis
                yAxisId="left"
                tick={{ fontSize: 11, fill: 'var(--brand-text-secondary)' }}
                label={{
                  value: 'Production (kWh)',
                  angle: -90,
                  position: 'insideLeft',
                  style: { fontSize: 11, fill: 'var(--brand-text-secondary)' },
                }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                tick={{ fontSize: 11, fill: 'var(--brand-text-secondary)' }}
                label={{
                  value: 'Sunshine Hours',
                  angle: 90,
                  position: 'insideRight',
                  style: { fontSize: 11, fill: 'var(--brand-text-secondary)' },
                }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--brand-surface)',
                  border: '1px solid var(--brand-border)',
                  borderRadius: '8px',
                  color: 'var(--brand-text)',
                }}
                formatter={(value: number, name: string) => {
                  const labels: Record<string, string> = {
                    productionKwh: 'Production',
                    sunshineHours: 'Sunshine Hours',
                  }
                  if (name === 'productionKwh') {
                    return [`${formatNumber(value)} kWh`, labels[name]]
                  }
                  if (name === 'sunshineHours') {
                    return [`${(value ?? 0).toFixed(0)} hrs`, labels[name]]
                  }
                  return [value, name]
                }}
                labelFormatter={(
                  _label: string,
                  payload: Array<{
                    payload?: { monthName?: string; efficiencyFactor?: number; season?: string }
                  }>
                ) => {
                  if (payload && payload.length > 0) {
                    const item = payload[0]?.payload
                    return `${item?.monthName || _label} (${item?.season || ''}) - Efficiency: ${((item?.efficiencyFactor || 0) * 100).toFixed(1)}%`
                  }
                  return _label
                }}
              />
              <Legend
                wrapperStyle={{ fontSize: 12 }}
                formatter={(value: string) => {
                  const labels: Record<string, string> = {
                    productionKwh: 'Production (kWh)',
                    sunshineHours: 'Sunshine Hours',
                  }
                  return labels[value] || value
                }}
              />

              {/* Production bars with color gradient */}
              <Bar yAxisId="left" dataKey="productionKwh" radius={[4, 4, 0, 0]} barSize={28}>
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={getBarColor(entry.productionKwh, stats?.maxProduction || 1)}
                  />
                ))}
              </Bar>

              {/* Sunshine hours line overlay */}
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="sunshineHours"
                stroke={CHART_COLORS.primary}
                strokeWidth={2}
                dot={{ fill: CHART_COLORS.primary, r: 4 }}
                activeDot={{ r: 6 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardBody>
    </Card>
  )
}
