'use client'

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceArea,
} from 'recharts'
import { Card, CardHeader, CardBody } from '@/components/ui'
import { Sunrise, Sunset, Zap } from 'lucide-react'
import { CHART_COLORS } from '@/lib/constants'
import type { HourlyIrradiance } from '@/types'

interface HourlyIrradianceChartProps {
  data: HourlyIrradiance[]
}

export function HourlyIrradianceChart({ data }: HourlyIrradianceChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardBody className="p-6 text-center text-[var(--brand-text-secondary)]">
          No hourly irradiance data available.
        </CardBody>
      </Card>
    )
  }

  const chartData = data.map((d) => ({
    ...d,
    label: `${d.hour.toString().padStart(2, '0')}:00`,
  }))

  const peakHours = data.filter((d) => d.isPeak)
  const peakStart = peakHours.length > 0 ? (peakHours[0]?.hour ?? 10) : 10
  const peakEnd = peakHours.length > 0 ? (peakHours[peakHours.length - 1]?.hour ?? 14) : 14
  const maxIrradiance = Math.max(...data.map((d) => d.irradianceWPerM2))
  const avgPeakIrradiance =
    peakHours.length > 0
      ? peakHours.reduce((sum, d) => sum + d.irradianceWPerM2, 0) / peakHours.length
      : 0

  return (
    <Card>
      <CardHeader title="Hourly Solar Irradiance" subtitle="Daily irradiance profile (W/m2)" />
      <CardBody>
        {/* Metrics */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-[var(--brand-primary)]/5">
            <Zap className="w-5 h-5 text-[var(--brand-primary)]" />
            <div>
              <div className="text-xs text-[var(--brand-text-secondary)]">Peak Irradiance</div>
              <div className="text-lg font-bold text-[var(--brand-text)]">
                {(maxIrradiance ?? 0).toFixed(0)} W/m&sup2;
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-500/5">
            <Sunrise className="w-5 h-5 text-amber-500" />
            <div>
              <div className="text-xs text-[var(--brand-text-secondary)]">Peak Hours</div>
              <div className="text-lg font-bold text-[var(--brand-text)]">
                {peakStart}:00 - {peakEnd}:00
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-green-500/5">
            <Sunset className="w-5 h-5 text-green-500" />
            <div>
              <div className="text-xs text-[var(--brand-text-secondary)]">Avg Peak</div>
              <div className="text-lg font-bold text-[var(--brand-text)]">
                {(avgPeakIrradiance ?? 0).toFixed(0)} W/m&sup2;
              </div>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <defs>
                <linearGradient id="irradianceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={CHART_COLORS.primary} stopOpacity={0.4} />
                  <stop offset="95%" stopColor={CHART_COLORS.primary} stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--brand-border)" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: 'var(--brand-text-secondary)' }}
                interval={2}
              />
              <YAxis
                tick={{ fontSize: 12, fill: 'var(--brand-text-secondary)' }}
                label={{
                  value: 'W/m2',
                  angle: -90,
                  position: 'insideLeft',
                  style: { fontSize: 12, fill: 'var(--brand-text-secondary)' },
                }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--brand-surface)',
                  border: '1px solid var(--brand-border)',
                  borderRadius: '8px',
                  color: 'var(--brand-text)',
                }}
                formatter={(value: number) => [
                  `${(value ?? 0).toFixed(1)} W/m\u00B2`,
                  'Irradiance',
                ]}
              />
              {/* Peak hours highlight */}
              <ReferenceArea
                x1={`${peakStart.toString().padStart(2, '0')}:00`}
                x2={`${peakEnd.toString().padStart(2, '0')}:00`}
                fill={CHART_COLORS.primary}
                fillOpacity={0.08}
                label={{
                  value: 'Peak Hours',
                  position: 'insideTop',
                  style: { fontSize: 11, fill: CHART_COLORS.primary },
                }}
              />
              <Area
                type="monotone"
                dataKey="irradianceWPerM2"
                stroke={CHART_COLORS.primary}
                strokeWidth={2}
                fill="url(#irradianceGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardBody>
    </Card>
  )
}
