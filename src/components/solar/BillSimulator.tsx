'use client'

import { useState, useMemo, useEffect } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { Card, CardHeader, CardBody } from '@/components/ui'
import { Receipt, TrendingDown, Zap } from 'lucide-react'

interface BillSimulatorProps {
  monthlyBillThb: number
  monthlySavingsThb: number
  annualProductionKwh: number
  electricityRate: number
}

const formatCurrency = (value: number): string =>
  new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)

/** Animated counter */
function AnimatedSavings({ target }: { target: number }) {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    let startTime: number | null = null
    let frame: number
    const animate = (ts: number) => {
      if (!startTime) startTime = ts
      const progress = Math.min((ts - startTime) / 2000, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCurrent(eased * target)
      if (progress < 1) frame = requestAnimationFrame(animate)
    }
    frame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frame)
  }, [target])

  return <>{formatCurrency(current)}</>
}

const THAI_MONTHS_SHORT = ['\u0E21.\u0E04.', '\u0E01.\u0E1E.', '\u0E21\u0E35.\u0E04.', '\u0E40\u0E21.\u0E22.', '\u0E1E.\u0E04.', '\u0E21\u0E34.\u0E22.', '\u0E01.\u0E04.', '\u0E2A.\u0E04.', '\u0E01.\u0E22.', '\u0E15.\u0E04.', '\u0E1E.\u0E22.', '\u0E18.\u0E04.']

// Seasonal production variation (higher in dry season Nov-Apr, lower in monsoon)
const SEASONAL_FACTOR = [0.95, 1.05, 1.1, 1.1, 0.95, 0.85, 0.8, 0.82, 0.85, 0.9, 0.93, 0.9]

export function BillSimulator({ monthlyBillThb, monthlySavingsThb, annualProductionKwh, electricityRate }: BillSimulatorProps) {
  const afterSolarBill = Math.max(0, monthlyBillThb - monthlySavingsThb)
  const annualSavings = monthlySavingsThb * 12

  // Simulate 12 months of bills
  const monthlyData = useMemo(() => {
    return THAI_MONTHS_SHORT.map((name, idx) => {
      const factor = SEASONAL_FACTOR[idx]
      const saving = monthlySavingsThb * factor
      const before = monthlyBillThb * (0.9 + Math.random() * 0.2) // slight variation
      const after = Math.max(0, before - saving)
      return {
        month: name,
        before: Math.round(before),
        after: Math.round(after),
        savings: Math.round(before - after),
      }
    })
  }, [monthlyBillThb, monthlySavingsThb])

  // Bill breakdown
  const ftRate = 0.3966 // FT rate approximation
  const vatRate = 0.07
  const baseCharge = 38.22 // base service charge

  const beforeUnits = monthlyBillThb / (electricityRate + ftRate) / (1 + vatRate)
  const beforeBase = baseCharge
  const beforeFT = beforeUnits * ftRate
  const beforeVAT = (beforeUnits * electricityRate + beforeBase + beforeFT) * vatRate

  const afterUnits = Math.max(0, beforeUnits - (annualProductionKwh / 12) * 0.7) // assuming 70% self-consumption
  const afterBase = baseCharge
  const afterFT = afterUnits * ftRate
  const afterVAT = (afterUnits * electricityRate + afterBase + afterFT) * vatRate

  return (
    <Card>
      <CardHeader
        title={'\u0E40\u0E1B\u0E23\u0E35\u0E22\u0E1A\u0E40\u0E17\u0E35\u0E22\u0E1A\u0E04\u0E48\u0E32\u0E44\u0E1F\u0E01\u0E48\u0E2D\u0E19-\u0E2B\u0E25\u0E31\u0E07\u0E15\u0E34\u0E14\u0E42\u0E0B\u0E25\u0E32\u0E23\u0E4C'}
        subtitle="Before/After Bill Simulator"
      />
      <CardBody>
        <div className="space-y-6">
          {/* Savings Highlight */}
          <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-green-500/5 to-emerald-500/10 border border-green-500/20">
            <div className="text-xs uppercase tracking-widest text-green-600 font-semibold mb-2">
              {'\u0E04\u0E38\u0E13\u0E1B\u0E23\u0E30\u0E2B\u0E22\u0E31\u0E14\u0E44\u0E14\u0E49'}
            </div>
            <div className="text-4xl font-extrabold text-green-600">
              <AnimatedSavings target={monthlySavingsThb} />
            </div>
            <div className="text-sm text-green-600/80 font-medium mt-1">
              {'\u0E1B\u0E23\u0E30\u0E2B\u0E22\u0E31\u0E14\u0E15\u0E48\u0E2D\u0E40\u0E14\u0E37\u0E2D\u0E19'}
            </div>
            <div className="text-xs text-[var(--brand-text-secondary)] mt-2">
              {'\u0E1B\u0E23\u0E30\u0E2B\u0E22\u0E31\u0E14\u0E15\u0E48\u0E2D\u0E1B\u0E35'}: {formatCurrency(annualSavings)}
            </div>
          </div>

          {/* Side-by-side Bill Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Before Solar */}
            <div className="p-4 rounded-xl border-2 border-red-500/20 bg-red-500/5">
              <div className="flex items-center gap-2 mb-3">
                <Receipt className="w-5 h-5 text-red-500" />
                <span className="font-bold text-[var(--brand-text)]">
                  {'\u0E04\u0E48\u0E32\u0E44\u0E1F\u0E01\u0E48\u0E2D\u0E19\u0E15\u0E34\u0E14\u0E42\u0E0B\u0E25\u0E32\u0E23\u0E4C'}
                </span>
              </div>
              <div className="text-3xl font-extrabold text-red-600 mb-3">
                {formatCurrency(monthlyBillThb)}
              </div>
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-[var(--brand-text-secondary)]">{'\u0E04\u0E48\u0E32\u0E1A\u0E23\u0E34\u0E01\u0E32\u0E23'}</span>
                  <span className="text-[var(--brand-text)]">{formatCurrency(beforeBase)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--brand-text-secondary)]">{'\u0E04\u0E48\u0E32\u0E2B\u0E19\u0E48\u0E27\u0E22\u0E44\u0E1F\u0E1F\u0E49\u0E32'}</span>
                  <span className="text-[var(--brand-text)]">{formatCurrency(beforeUnits * electricityRate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--brand-text-secondary)]">{'\u0E04\u0E48\u0E32 FT'}</span>
                  <span className="text-[var(--brand-text)]">{formatCurrency(beforeFT)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--brand-text-secondary)]">VAT 7%</span>
                  <span className="text-[var(--brand-text)]">{formatCurrency(beforeVAT)}</span>
                </div>
              </div>
            </div>

            {/* After Solar */}
            <div className="p-4 rounded-xl border-2 border-green-500/20 bg-green-500/5">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-5 h-5 text-green-500" />
                <span className="font-bold text-[var(--brand-text)]">
                  {'\u0E04\u0E48\u0E32\u0E44\u0E1F\u0E2B\u0E25\u0E31\u0E07\u0E15\u0E34\u0E14\u0E42\u0E0B\u0E25\u0E32\u0E23\u0E4C'}
                </span>
              </div>
              <div className="text-3xl font-extrabold text-green-600 mb-3">
                {formatCurrency(afterSolarBill)}
              </div>
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-[var(--brand-text-secondary)]">{'\u0E04\u0E48\u0E32\u0E1A\u0E23\u0E34\u0E01\u0E32\u0E23'}</span>
                  <span className="text-[var(--brand-text)]">{formatCurrency(afterBase)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--brand-text-secondary)]">{'\u0E04\u0E48\u0E32\u0E2B\u0E19\u0E48\u0E27\u0E22\u0E44\u0E1F\u0E1F\u0E49\u0E32'}</span>
                  <span className="text-[var(--brand-text)]">{formatCurrency(afterUnits * electricityRate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--brand-text-secondary)]">{'\u0E04\u0E48\u0E32 FT'}</span>
                  <span className="text-[var(--brand-text)]">{formatCurrency(afterFT)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--brand-text-secondary)]">VAT 7%</span>
                  <span className="text-[var(--brand-text)]">{formatCurrency(afterVAT)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 12-month Comparison Chart */}
          <div>
            <h4 className="text-sm font-semibold text-[var(--brand-text)] mb-3 flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-green-500" />
              {'\u0E40\u0E1B\u0E23\u0E35\u0E22\u0E1A\u0E40\u0E17\u0E35\u0E22\u0E1A\u0E23\u0E32\u0E22\u0E40\u0E14\u0E37\u0E2D\u0E19 12 \u0E40\u0E14\u0E37\u0E2D\u0E19'}
            </h4>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--brand-border)" />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 10, fill: 'var(--brand-text-secondary)' }}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: 'var(--brand-text-secondary)' }}
                    tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`}
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
                        before: '\u0E01\u0E48\u0E2D\u0E19\u0E15\u0E34\u0E14\u0E42\u0E0B\u0E25\u0E32\u0E23\u0E4C',
                        after: '\u0E2B\u0E25\u0E31\u0E07\u0E15\u0E34\u0E14\u0E42\u0E0B\u0E25\u0E32\u0E23\u0E4C',
                      }
                      return [formatCurrency(value), labels[name] || name]
                    }}
                  />
                  <Legend
                    formatter={(value: string) => {
                      const labels: Record<string, string> = {
                        before: '\u0E01\u0E48\u0E2D\u0E19\u0E15\u0E34\u0E14\u0E42\u0E0B\u0E25\u0E32\u0E23\u0E4C',
                        after: '\u0E2B\u0E25\u0E31\u0E07\u0E15\u0E34\u0E14\u0E42\u0E0B\u0E25\u0E32\u0E23\u0E4C',
                      }
                      return labels[value] || value
                    }}
                  />
                  <Bar dataKey="before" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={16} />
                  <Bar dataKey="after" fill="#22c55e" radius={[4, 4, 0, 0]} barSize={16} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  )
}
