'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from 'recharts'
import { Card, CardHeader, CardBody } from '@/components/ui'
import { CloudOff, Sun } from 'lucide-react'
import { CHART_COLORS } from '@/lib/constants'
import type { ShadeAnalysis } from '@/types'

interface ShadeAnalysisChartProps {
  shadeAnalysis: ShadeAnalysis
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export function ShadeAnalysisChart({ shadeAnalysis }: ShadeAnalysisChartProps) {
  const data = shadeAnalysis.monthlyShadePercent.map((percent, i) => ({
    month: MONTHS[i],
    shade: percent,
    isBest: MONTHS[i] === shadeAnalysis.bestMonth.substring(0, 3),
    isWorst: MONTHS[i] === shadeAnalysis.worstMonth.substring(0, 3),
  }))

  const getBarColor = (entry: typeof data[0]) => {
    if (entry.isBest) return CHART_COLORS.secondary
    if (entry.isWorst) return '#ef4444'
    return CHART_COLORS.primary
  }

  return (
    <Card>
      <CardHeader
        title="Shade Analysis"
        subtitle="Monthly shade percentage throughout the year"
      />
      <CardBody>
        {/* Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-[var(--brand-primary)]/5">
            <CloudOff className="w-5 h-5 text-[var(--brand-primary)]" />
            <div>
              <div className="text-xs text-[var(--brand-text-secondary)]">Annual Avg Shade</div>
              <div className="text-lg font-bold text-[var(--brand-text)]">
                {shadeAnalysis.annualAverageShadePercent.toFixed(1)}%
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-green-500/5">
            <Sun className="w-5 h-5 text-green-500" />
            <div>
              <div className="text-xs text-[var(--brand-text-secondary)]">Shade-Free Hours</div>
              <div className="text-lg font-bold text-[var(--brand-text)]">
                {shadeAnalysis.shadeFreeHoursPerDay.toFixed(1)} hrs/day
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-green-500/5">
            <Sun className="w-5 h-5 text-green-500" />
            <div>
              <div className="text-xs text-[var(--brand-text-secondary)]">Best Month</div>
              <div className="text-lg font-bold text-green-600">{shadeAnalysis.bestMonth}</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-red-500/5">
            <CloudOff className="w-5 h-5 text-red-500" />
            <div>
              <div className="text-xs text-[var(--brand-text-secondary)]">Worst Month</div>
              <div className="text-lg font-bold text-red-600">{shadeAnalysis.worstMonth}</div>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--brand-border)" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12, fill: 'var(--brand-text-secondary)' }}
              />
              <YAxis
                tick={{ fontSize: 12, fill: 'var(--brand-text-secondary)' }}
                label={{
                  value: 'Shade %',
                  angle: -90,
                  position: 'insideLeft',
                  style: { fontSize: 12, fill: 'var(--brand-text-secondary)' },
                }}
                domain={[0, 100]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--brand-surface)',
                  border: '1px solid var(--brand-border)',
                  borderRadius: '8px',
                  color: 'var(--brand-text)',
                }}
                formatter={(value: number) => [`${value.toFixed(1)}%`, 'Shade']}
              />
              <ReferenceLine
                y={shadeAnalysis.annualAverageShadePercent}
                stroke={CHART_COLORS.tertiary}
                strokeDasharray="5 5"
                label={{
                  value: `Avg: ${shadeAnalysis.annualAverageShadePercent.toFixed(1)}%`,
                  position: 'right',
                  style: { fontSize: 11, fill: CHART_COLORS.tertiary },
                }}
              />
              <Bar dataKey="shade" radius={[4, 4, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell key={index} fill={getBarColor(entry)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mt-4 text-xs text-[var(--brand-text-secondary)]">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: CHART_COLORS.secondary }} />
            <span>Best Month</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-red-500" />
            <span>Worst Month</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: CHART_COLORS.primary }} />
            <span>Regular</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-0.5" style={{ backgroundColor: CHART_COLORS.tertiary, borderTop: '2px dashed' }} />
            <span>Average</span>
          </div>
        </div>
      </CardBody>
    </Card>
  )
}
