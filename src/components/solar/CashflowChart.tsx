'use client'

import { useMemo } from 'react'
import {
  ComposedChart,
  Bar,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
} from 'recharts'
import { Card, CardHeader, CardBody } from '@/components/ui'
import { TrendingUp, Target, DollarSign } from 'lucide-react'
import { CHART_COLORS } from '@/lib/constants'
import type { YearlyCashflow } from '@/types'

interface CashflowChartProps {
  cashflow: YearlyCashflow[]
  paybackYears: number
  installationCost: number
}

const formatCurrency = (value: number): string =>
  new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)

const formatCompact = (value: number): string => {
  if (Math.abs(value) >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`
  }
  if (Math.abs(value) >= 1_000) {
    return `${(value / 1_000).toFixed(0)}K`
  }
  return (value ?? 0).toFixed(0)
}

export function CashflowChart({ cashflow, paybackYears, installationCost }: CashflowChartProps) {
  const paybackYear = Math.ceil(paybackYears)
  const totalSavings25 =
    cashflow.length > 0 ? (cashflow[cashflow.length - 1]?.cumulativeSavingThb ?? 0) : 0
  const totalROI =
    installationCost > 0 ? ((totalSavings25 - installationCost) / installationCost) * 100 : 0

  // Add ROI zone coloring data
  const chartData = useMemo(() => {
    return cashflow.map((cf) => ({
      ...cf,
      roiZone: cf.netPositionThb > 0 ? cf.netPositionThb : 0,
    }))
  }, [cashflow])

  if (!cashflow || cashflow.length === 0) {
    return (
      <Card>
        <CardBody className="p-6 text-center text-[var(--brand-text-secondary)]">
          No cashflow projection data available.
        </CardBody>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader
        title="25-Year Cashflow Projection"
        subtitle="Annual savings, cumulative returns, and payback analysis"
      />
      <CardBody>
        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-[var(--brand-primary)]/5">
            <Target className="w-5 h-5 text-[var(--brand-primary)]" />
            <div>
              <div className="text-xs text-[var(--brand-text-secondary)]">Payback Point</div>
              <div className="text-lg font-bold text-[var(--brand-text)]">Year {paybackYear}</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-green-500/5">
            <DollarSign className="w-5 h-5 text-green-500" />
            <div>
              <div className="text-xs text-[var(--brand-text-secondary)]">
                Total 25-Year Savings
              </div>
              <div className="text-lg font-bold text-green-600">
                {formatCurrency(totalSavings25)}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-500/5">
            <TrendingUp className="w-5 h-5 text-blue-500" />
            <div>
              <div className="text-xs text-[var(--brand-text-secondary)]">25-Year ROI</div>
              <div className="text-lg font-bold text-blue-600">{(totalROI ?? 0).toFixed(0)}%</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-purple-500/5">
            <DollarSign className="w-5 h-5 text-purple-500" />
            <div>
              <div className="text-xs text-[var(--brand-text-secondary)]">Installation Cost</div>
              <div className="text-lg font-bold text-[var(--brand-text)]">
                {formatCurrency(installationCost)}
              </div>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
              <defs>
                <linearGradient id="roiGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--brand-border)" />
              <XAxis
                dataKey="year"
                tick={{ fontSize: 11, fill: 'var(--brand-text-secondary)' }}
                label={{
                  value: 'Year',
                  position: 'insideBottom',
                  offset: -2,
                  style: { fontSize: 12, fill: 'var(--brand-text-secondary)' },
                }}
              />
              <YAxis
                yAxisId="left"
                tick={{ fontSize: 11, fill: 'var(--brand-text-secondary)' }}
                tickFormatter={(v) => `${formatCompact(v)}`}
                label={{
                  value: 'Annual (THB)',
                  angle: -90,
                  position: 'insideLeft',
                  style: { fontSize: 11, fill: 'var(--brand-text-secondary)' },
                }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                tick={{ fontSize: 11, fill: 'var(--brand-text-secondary)' }}
                tickFormatter={(v) => `${formatCompact(v)}`}
                label={{
                  value: 'Cumulative (THB)',
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
                    savingThb: 'Annual Saving',
                    cumulativeSavingThb: 'Cumulative',
                    netPositionThb: 'Net Position',
                    roiZone: 'Profit',
                  }
                  return [formatCurrency(value), labels[name] || name]
                }}
                labelFormatter={(label) => `Year ${label}`}
              />
              <Legend
                wrapperStyle={{ fontSize: 12 }}
                formatter={(value: string) => {
                  const labels: Record<string, string> = {
                    savingThb: 'Annual Saving',
                    cumulativeSavingThb: 'Cumulative',
                    roiZone: 'ROI Zone',
                  }
                  return labels[value] || value
                }}
              />

              {/* ROI zone (green area after payback) */}
              <Area
                yAxisId="right"
                type="monotone"
                dataKey="roiZone"
                fill="url(#roiGradient)"
                stroke="none"
              />

              {/* Annual savings bars */}
              <Bar
                yAxisId="left"
                dataKey="savingThb"
                fill={CHART_COLORS.primary}
                radius={[2, 2, 0, 0]}
                barSize={12}
              />

              {/* Cumulative line */}
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="cumulativeSavingThb"
                stroke={CHART_COLORS.tertiary}
                strokeWidth={2}
                dot={false}
              />

              {/* Payback reference line */}
              <ReferenceLine
                x={paybackYear}
                yAxisId="left"
                stroke="#ef4444"
                strokeDasharray="5 5"
                label={{
                  value: `Payback: Yr ${paybackYear}`,
                  position: 'top',
                  style: { fontSize: 11, fill: '#ef4444', fontWeight: 600 },
                }}
              />

              {/* Zero line for net position */}
              <ReferenceLine
                yAxisId="right"
                y={0}
                stroke="var(--brand-border)"
                strokeDasharray="3 3"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardBody>
    </Card>
  )
}
