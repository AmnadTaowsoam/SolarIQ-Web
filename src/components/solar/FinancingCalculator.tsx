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
  Legend,
} from 'recharts'
import { Card, CardHeader, CardBody } from '@/components/ui'
import { Landmark, Award, Calculator, TrendingUp } from 'lucide-react'

interface FinancingCalculatorProps {
  systemCost: number
  annualSavings: number
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

export function FinancingCalculator({ systemCost, annualSavings }: FinancingCalculatorProps) {
  const [loanRate, setLoanRate] = useState(5.5)
  const [loanTerm, setLoanTerm] = useState(7)
  const [leaseMonthly, setLeaseMonthly] = useState(Math.round(systemCost / 84)) // ~7yr lease

  const options = useMemo(() => {
    const totalYears = 25

    // Cash option
    const cashNetSavings = annualSavings * totalYears - systemCost
    const cashBreakEven = systemCost / annualSavings

    // Loan option
    const monthlyRate = loanRate / 100 / 12
    const nPayments = loanTerm * 12
    const loanMonthly = monthlyRate > 0
      ? (systemCost * monthlyRate * Math.pow(1 + monthlyRate, nPayments)) / (Math.pow(1 + monthlyRate, nPayments) - 1)
      : systemCost / nPayments
    const totalLoanCost = loanMonthly * nPayments
    const loanNetSavings = annualSavings * totalYears - totalLoanCost
    // Break-even: when cumulative savings exceed total loan cost
    const loanBreakEven = totalLoanCost / annualSavings

    // Lease option
    const totalLeaseCost = leaseMonthly * 12 * totalYears
    const leaseNetSavings = annualSavings * totalYears - totalLeaseCost
    const leaseBreakEven = totalLeaseCost > annualSavings * totalYears ? totalYears : 0 // If lease costs more than savings, no break-even

    const results = [
      {
        type: 'cash',
        label: '\u0E40\u0E07\u0E34\u0E19\u0E2A\u0E14',
        upfrontCost: systemCost,
        monthlyPayment: 0,
        totalCost: systemCost,
        netSavings: cashNetSavings,
        breakEven: cashBreakEven,
        recommended: false,
        details: '\u0E0A\u0E33\u0E23\u0E30\u0E40\u0E15\u0E47\u0E21\u0E08\u0E33\u0E19\u0E27\u0E19 \u0E44\u0E21\u0E48\u0E21\u0E35\u0E14\u0E2D\u0E01\u0E40\u0E1A\u0E35\u0E49\u0E22',
      },
      {
        type: 'loan',
        label: '\u0E2A\u0E34\u0E19\u0E40\u0E0A\u0E37\u0E48\u0E2D\u0E18\u0E19\u0E32\u0E04\u0E32\u0E23',
        upfrontCost: 0,
        monthlyPayment: loanMonthly,
        totalCost: totalLoanCost,
        netSavings: loanNetSavings,
        breakEven: loanBreakEven,
        recommended: false,
        details: `\u0E14\u0E2D\u0E01\u0E40\u0E1A\u0E35\u0E49\u0E22 ${loanRate}% \u0E23\u0E30\u0E22\u0E30\u0E40\u0E27\u0E25\u0E32 ${loanTerm} \u0E1B\u0E35`,
      },
      {
        type: 'lease',
        label: '\u0E40\u0E0A\u0E48\u0E32\u0E23\u0E30\u0E1A\u0E1A',
        upfrontCost: 0,
        monthlyPayment: leaseMonthly,
        totalCost: totalLeaseCost,
        netSavings: leaseNetSavings,
        breakEven: leaseBreakEven,
        recommended: false,
        details: '\u0E40\u0E0A\u0E48\u0E32\u0E23\u0E30\u0E1A\u0E1A\u0E23\u0E32\u0E22\u0E40\u0E14\u0E37\u0E2D\u0E19 \u0E44\u0E21\u0E48\u0E15\u0E49\u0E2D\u0E07\u0E25\u0E07\u0E17\u0E38\u0E19',
      },
    ]

    // Mark recommended (highest net savings)
    const best = results.reduce((a, b) => a.netSavings > b.netSavings ? a : b)
    return results.map((r) => ({ ...r, recommended: r.type === best.type }))
  }, [systemCost, annualSavings, loanRate, loanTerm, leaseMonthly])

  // Chart data - cost vs savings over 25 years
  const chartData = useMemo(() => {
    return options.map((opt) => ({
      name: opt.label,
      totalCost: opt.totalCost,
      netSavings: Math.max(0, opt.netSavings),
    }))
  }, [options])

  return (
    <Card>
      <CardHeader
        title={'\u0E40\u0E1B\u0E23\u0E35\u0E22\u0E1A\u0E40\u0E17\u0E35\u0E22\u0E1A\u0E15\u0E31\u0E27\u0E40\u0E25\u0E37\u0E2D\u0E01\u0E01\u0E32\u0E23\u0E40\u0E07\u0E34\u0E19'}
        subtitle="Solar Financing Comparison"
      />
      <CardBody>
        <div className="space-y-6">
          {/* Interactive Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-lg bg-[var(--brand-surface)] border border-[var(--brand-border)]">
            <div>
              <label className="block text-xs font-medium text-[var(--brand-text)] mb-1">
                {'\u0E14\u0E2D\u0E01\u0E40\u0E1A\u0E35\u0E49\u0E22 (%)'}
              </label>
              <input
                type="number"
                min="1" max="15" step="0.5"
                value={loanRate}
                onChange={(e) => setLoanRate(parseFloat(e.target.value) || 5.5)}
                className="w-full px-3 py-1.5 text-sm rounded-[var(--brand-radius)] border border-[var(--brand-border)] bg-[var(--brand-surface)] text-[var(--brand-text)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--brand-text)] mb-1">
                {'\u0E23\u0E30\u0E22\u0E30\u0E40\u0E27\u0E25\u0E32\u0E01\u0E39\u0E49 (\u0E1B\u0E35)'}
              </label>
              <input
                type="number"
                min="1" max="20" step="1"
                value={loanTerm}
                onChange={(e) => setLoanTerm(parseInt(e.target.value) || 7)}
                className="w-full px-3 py-1.5 text-sm rounded-[var(--brand-radius)] border border-[var(--brand-border)] bg-[var(--brand-surface)] text-[var(--brand-text)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--brand-text)] mb-1">
                {'\u0E04\u0E48\u0E32\u0E40\u0E0A\u0E48\u0E32\u0E23\u0E32\u0E22\u0E40\u0E14\u0E37\u0E2D\u0E19 (\u0E1A\u0E32\u0E17)'}
              </label>
              <input
                type="number"
                min="500" max="50000" step="100"
                value={leaseMonthly}
                onChange={(e) => setLeaseMonthly(parseInt(e.target.value) || 3000)}
                className="w-full px-3 py-1.5 text-sm rounded-[var(--brand-radius)] border border-[var(--brand-border)] bg-[var(--brand-surface)] text-[var(--brand-text)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
              />
            </div>
          </div>

          {/* Three Column Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {options.map((opt) => (
              <div
                key={opt.type}
                className={`relative rounded-xl border-2 p-4 transition-all ${
                  opt.recommended
                    ? 'border-[var(--brand-primary)] shadow-lg shadow-[var(--brand-primary)]/10'
                    : 'border-[var(--brand-border)]'
                }`}
              >
                {opt.recommended && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[var(--brand-primary)] text-white text-xs font-bold px-3 py-0.5 rounded-full flex items-center gap-1">
                    <Award className="w-3 h-3" />
                    {'\u0E41\u0E19\u0E30\u0E19\u0E33'}
                  </div>
                )}

                <div className="text-center mb-3 pt-1">
                  <Landmark className="w-6 h-6 mx-auto text-[var(--brand-primary)] mb-1" />
                  <div className="text-lg font-bold text-[var(--brand-text)]">{opt.label}</div>
                  <div className="text-xs text-[var(--brand-text-secondary)]">{opt.details}</div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[var(--brand-text-secondary)]">{'\u0E40\u0E07\u0E34\u0E19\u0E25\u0E48\u0E27\u0E07\u0E2B\u0E19\u0E49\u0E32'}</span>
                    <span className="font-medium text-[var(--brand-text)]">{formatCurrency(opt.upfrontCost)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--brand-text-secondary)]">{'\u0E08\u0E48\u0E32\u0E22\u0E23\u0E32\u0E22\u0E40\u0E14\u0E37\u0E2D\u0E19'}</span>
                    <span className="font-medium text-[var(--brand-text)]">{formatCurrency(opt.monthlyPayment)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--brand-text-secondary)]">{'\u0E15\u0E49\u0E19\u0E17\u0E38\u0E19\u0E23\u0E27\u0E21 25 \u0E1B\u0E35'}</span>
                    <span className="font-medium text-[var(--brand-text)]">{formatCurrency(opt.totalCost)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-[var(--brand-border)]">
                    <span className="text-[var(--brand-text-secondary)] font-medium">{'\u0E1C\u0E25\u0E1B\u0E23\u0E30\u0E2B\u0E22\u0E31\u0E14\u0E2A\u0E38\u0E17\u0E18\u0E34'}</span>
                    <span className={`font-bold ${opt.netSavings > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(opt.netSavings)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--brand-text-secondary)]">{'\u0E04\u0E37\u0E19\u0E17\u0E38\u0E19'}</span>
                    <span className="font-medium text-blue-600">{opt.breakEven.toFixed(1)} {'\u0E1B\u0E35'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Comparison Chart */}
          <div>
            <h4 className="text-sm font-semibold text-[var(--brand-text)] mb-3 flex items-center gap-2">
              <Calculator className="w-4 h-4 text-[var(--brand-primary)]" />
              {'\u0E40\u0E1B\u0E23\u0E35\u0E22\u0E1A\u0E40\u0E17\u0E35\u0E22\u0E1A\u0E15\u0E49\u0E19\u0E17\u0E38\u0E19 vs \u0E1C\u0E25\u0E1B\u0E23\u0E30\u0E2B\u0E22\u0E31\u0E14 (25 \u0E1B\u0E35)'}
            </h4>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--brand-border)" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11, fill: 'var(--brand-text-secondary)' }}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: 'var(--brand-text-secondary)' }}
                    tickFormatter={(v) => `${formatCompact(v)}`}
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
                        totalCost: '\u0E15\u0E49\u0E19\u0E17\u0E38\u0E19\u0E23\u0E27\u0E21',
                        netSavings: '\u0E1C\u0E25\u0E1B\u0E23\u0E30\u0E2B\u0E22\u0E31\u0E14\u0E2A\u0E38\u0E17\u0E18\u0E34',
                      }
                      return [formatCurrency(value), labels[name] || name]
                    }}
                  />
                  <Legend
                    formatter={(value: string) => {
                      const labels: Record<string, string> = {
                        totalCost: '\u0E15\u0E49\u0E19\u0E17\u0E38\u0E19\u0E23\u0E27\u0E21',
                        netSavings: '\u0E1C\u0E25\u0E1B\u0E23\u0E30\u0E2B\u0E22\u0E31\u0E14\u0E2A\u0E38\u0E17\u0E18\u0E34',
                      }
                      return labels[value] || value
                    }}
                  />
                  <Bar dataKey="totalCost" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={32} />
                  <Bar dataKey="netSavings" fill="#22c55e" radius={[4, 4, 0, 0]} barSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bank References */}
          <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/20">
            <h4 className="text-sm font-semibold text-[var(--brand-text)] mb-2 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-500" />
              {'\u0E42\u0E1B\u0E23\u0E41\u0E01\u0E23\u0E21\u0E2A\u0E34\u0E19\u0E40\u0E0A\u0E37\u0E48\u0E2D\u0E42\u0E0B\u0E25\u0E32\u0E23\u0E4C\u0E08\u0E32\u0E01\u0E18\u0E19\u0E32\u0E04\u0E32\u0E23'}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-[var(--brand-text-secondary)]">
              <div className="p-2 rounded bg-[var(--brand-surface)]">
                <span className="font-bold text-purple-600">SCB</span> - {'\u0E2A\u0E34\u0E19\u0E40\u0E0A\u0E37\u0E48\u0E2D\u0E42\u0E0B\u0E25\u0E32\u0E23\u0E4C\u0E40\u0E0B\u0E25\u0E25\u0E4C'}
              </div>
              <div className="p-2 rounded bg-[var(--brand-surface)]">
                <span className="font-bold text-green-600">KBANK</span> - {'\u0E2A\u0E34\u0E19\u0E40\u0E0A\u0E37\u0E48\u0E2D\u0E1E\u0E25\u0E31\u0E07\u0E07\u0E32\u0E19\u0E2A\u0E30\u0E2D\u0E32\u0E14'}
              </div>
              <div className="p-2 rounded bg-[var(--brand-surface)]">
                <span className="font-bold text-blue-600">BBL</span> - {'\u0E2A\u0E34\u0E19\u0E40\u0E0A\u0E37\u0E48\u0E2D Green Energy'}
              </div>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  )
}
