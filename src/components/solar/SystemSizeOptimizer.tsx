'use client'

import { useState, useMemo } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { Card, CardHeader, CardBody } from '@/components/ui'
import { Zap, TrendingUp, Clock, Award } from 'lucide-react'
import { CHART_COLORS } from '@/lib/constants'
import type { SystemSizeOption } from '@/types'

interface SystemSizeOptimizerProps {
  options: SystemSizeOption[]
  currentBillThb: number
}

const formatCurrency = (value: number): string =>
  new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)

const formatCompact = (value: number): string => {
  if (Math.abs(value) >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
  if (Math.abs(value) >= 1_000) return `${(value / 1_000).toFixed(0)}K`
  return value.toFixed(0)
}

export function SystemSizeOptimizer({ options, currentBillThb }: SystemSizeOptimizerProps) {
  const minPanels = useMemo(() => Math.min(...options.map((o) => o.panelsCount)), [options])
  const maxPanels = useMemo(() => Math.max(...options.map((o) => o.panelsCount)), [options])
  const [selectedPanels, setSelectedPanels] = useState<number>(
    options.find((o) => o.isRecommended)?.panelsCount || maxPanels
  )

  // Find closest option to slider value
  const closestOption = useMemo(() => {
    return options.reduce((prev, curr) =>
      Math.abs(curr.panelsCount - selectedPanels) < Math.abs(prev.panelsCount - selectedPanels)
        ? curr
        : prev
    )
  }, [options, selectedPanels])

  const paybackChartData = useMemo(() => {
    return options.map((opt) => ({
      name: `${opt.sizeKwp.toFixed(1)} kWp`,
      paybackYears: opt.paybackYears,
      isRecommended: opt.isRecommended,
      panelsCount: opt.panelsCount,
    }))
  }, [options])

  if (!options || options.length === 0) {
    return (
      <Card>
        <CardBody className="p-6 text-center text-[var(--brand-text-secondary)]">
          <Zap className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No system size options available.</p>
        </CardBody>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader
        title="System Size Optimizer"
        subtitle="Compare different system sizes to find the best fit"
      />
      <CardBody>
        {/* Interactive Slider */}
        <div className="mb-6 p-4 rounded-lg bg-[var(--brand-surface)] border border-[var(--brand-border)]">
          <label className="block text-sm font-medium text-[var(--brand-text)] mb-3">
            {'\u0E40\u0E25\u0E37\u0E2D\u0E01\u0E08\u0E33\u0E19\u0E27\u0E19\u0E41\u0E1C\u0E07\u0E17\u0E35\u0E48\u0E15\u0E49\u0E2D\u0E07\u0E01\u0E32\u0E23\u0E15\u0E34\u0E14\u0E15\u0E31\u0E49\u0E07'}: <span className="text-[var(--brand-primary)] font-bold">{closestOption.panelsCount} panels ({closestOption.sizeKwp.toFixed(1)} kWp)</span>
          </label>
          <input
            type="range"
            min={minPanels}
            max={maxPanels}
            value={selectedPanels}
            onChange={(e) => setSelectedPanels(parseInt(e.target.value))}
            className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-[var(--brand-primary)]"
            style={{
              background: `linear-gradient(to right, var(--brand-primary) ${((selectedPanels - minPanels) / (maxPanels - minPanels)) * 100}%, var(--brand-border) ${((selectedPanels - minPanels) / (maxPanels - minPanels)) * 100}%)`,
            }}
          />
          <div className="flex justify-between text-xs text-[var(--brand-text-secondary)] mt-1">
            <span>{minPanels} panels</span>
            <span>{maxPanels} panels</span>
          </div>
        </div>

        {/* Option Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {options.map((opt, idx) => {
            const billCoverage = currentBillThb > 0
              ? Math.min((opt.monthlySavingsThb / currentBillThb) * 100, 100)
              : 0

            return (
              <div
                key={idx}
                className={`relative rounded-xl border-2 p-4 transition-all ${
                  opt.isRecommended
                    ? 'border-[var(--brand-primary)] shadow-lg shadow-[var(--brand-primary)]/10'
                    : closestOption.panelsCount === opt.panelsCount
                    ? 'border-blue-400 shadow-md'
                    : 'border-[var(--brand-border)]'
                }`}
              >
                {/* Recommended badge */}
                {opt.isRecommended && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[var(--brand-primary)] text-white text-xs font-bold px-3 py-0.5 rounded-full flex items-center gap-1">
                    <Award className="w-3 h-3" />
                    {'\u0E41\u0E19\u0E30\u0E19\u0E33'}
                  </div>
                )}

                {/* System info */}
                <div className="text-center mb-3 pt-1">
                  <div className="text-2xl font-bold text-[var(--brand-text)]">
                    {opt.sizeKwp.toFixed(1)} <span className="text-sm font-normal">kWp</span>
                  </div>
                  <div className="text-xs text-[var(--brand-text-secondary)]">
                    {opt.panelsCount} panels
                  </div>
                </div>

                {/* Metrics */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[var(--brand-text-secondary)]">Installation</span>
                    <span className="font-medium text-[var(--brand-text)]">{formatCurrency(opt.installationCostThb)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--brand-text-secondary)]">Monthly Savings</span>
                    <span className="font-medium text-green-600">{formatCurrency(opt.monthlySavingsThb)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--brand-text-secondary)]">Yearly Savings</span>
                    <span className="font-medium text-green-600">{formatCurrency(opt.annualSavingsThb)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--brand-text-secondary)]">Payback</span>
                    <span className="font-medium text-blue-600">{opt.paybackYears.toFixed(1)} yrs</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--brand-text-secondary)]">25-yr ROI</span>
                    <span className="font-medium text-[var(--brand-primary)]">{opt.roi25YrPercent.toFixed(0)}%</span>
                  </div>

                  {/* Self-consumption bar */}
                  <div className="pt-2">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-[var(--brand-text-secondary)]">Self-consumption</span>
                      <span className="font-medium text-[var(--brand-text)]">{opt.selfConsumptionPercent.toFixed(0)}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-[var(--brand-border)]">
                      <div
                        className="h-2 rounded-full bg-green-500 transition-all"
                        style={{ width: `${opt.selfConsumptionPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Bill coverage */}
                  <div className="pt-1">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-[var(--brand-text-secondary)]">Bill Coverage</span>
                      <span className="font-medium text-[var(--brand-text)]">{billCoverage.toFixed(0)}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-[var(--brand-border)]">
                      <div
                        className="h-2 rounded-full bg-[var(--brand-primary)] transition-all"
                        style={{ width: `${billCoverage}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Recommendation reason */}
                {opt.recommendationReason && (
                  <div className="mt-3 pt-2 border-t border-[var(--brand-border)]">
                    <p className="text-xs text-[var(--brand-text-secondary)] italic">{opt.recommendationReason}</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Payback Comparison Chart */}
        <div className="mt-6">
          <h4 className="text-sm font-semibold text-[var(--brand-text)] mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4 text-[var(--brand-primary)]" />
            Payback Period Comparison
          </h4>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={paybackChartData} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--brand-border)" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: 'var(--brand-text-secondary)' }}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: 'var(--brand-text-secondary)' }}
                  label={{
                    value: 'Years',
                    angle: -90,
                    position: 'insideLeft',
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
                  formatter={(value: number) => [`${value.toFixed(1)} years`, 'Payback Period']}
                />
                <Bar dataKey="paybackYears" radius={[4, 4, 0, 0]} barSize={40}>
                  {paybackChartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.isRecommended ? CHART_COLORS.primary : CHART_COLORS.tertiary}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardBody>
    </Card>
  )
}
