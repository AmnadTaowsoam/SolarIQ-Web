'use client'

import { useMemo } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { Card, CardHeader, CardBody } from '@/components/ui'
import { ShieldCheck, AlertTriangle, Sun, CloudRain } from 'lucide-react'
import type { ClimateReliabilityData } from '@/types'

interface ClimateReliabilityScoreProps {
  data: ClimateReliabilityData | null
}

const formatNumber = (value: number): string =>
  new Intl.NumberFormat('th-TH', { maximumFractionDigits: 1 }).format(value)

function getBadgeConfig(badgeLevel: string) {
  switch (badgeLevel) {
    case 'Platinum':
      return { stars: '\u2B50\u2B50\u2B50\u2B50', color: 'text-purple-600', bg: 'bg-purple-500/10' }
    case 'Gold':
      return { stars: '\u2B50\u2B50\u2B50', color: 'text-yellow-600', bg: 'bg-yellow-500/10' }
    case 'Silver':
      return {
        stars: '\u2B50\u2B50',
        color: 'text-[var(--brand-text-secondary)]',
        bg: 'bg-gray-500/10',
      }
    default:
      return { stars: '\u2B50', color: 'text-orange-600', bg: 'bg-orange-500/10' }
  }
}

function getScoreColor(score: number): string {
  if (score >= 80) {
    return '#22c55e'
  }
  if (score >= 60) {
    return '#eab308'
  }
  if (score >= 40) {
    return '#f97316'
  }
  return '#ef4444'
}

function getSeverityColor(severity: string): string {
  switch (severity) {
    case 'high':
      return 'text-red-500 bg-red-500/10'
    case 'medium':
      return 'text-yellow-500 bg-yellow-500/10'
    case 'low':
      return 'text-green-500 bg-green-500/10'
    default:
      return 'text-blue-500 bg-blue-500/10'
  }
}

const THAI_MONTHS = [
  '\u0E21.\u0E04.',
  '\u0E01.\u0E1E.',
  '\u0E21\u0E35.\u0E04.',
  '\u0E40\u0E21.\u0E22.',
  '\u0E1E.\u0E04.',
  '\u0E21\u0E34.\u0E22.',
  '\u0E01.\u0E04.',
  '\u0E2A.\u0E04.',
  '\u0E01.\u0E22.',
  '\u0E15.\u0E04.',
  '\u0E1E.\u0E22.',
  '\u0E18.\u0E04.',
]

export function ClimateReliabilityScore({ data }: ClimateReliabilityScoreProps) {
  const radiationChartData = useMemo(() => {
    if (!data?.monthlyRadiation) {
      return []
    }
    return data.monthlyRadiation.map((r) => ({
      label: r.month,
      radiation: r.radiation,
      year: r.year,
    }))
  }, [data])

  const seasonalCalendar = useMemo(() => {
    if (!data?.seasonalPattern) {
      return []
    }
    return data.seasonalPattern
  }, [data])

  if (!data) {
    return (
      <Card>
        <CardBody className="p-6 text-center text-[var(--brand-text-secondary)]">
          <ShieldCheck className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No climate reliability data available.</p>
        </CardBody>
      </Card>
    )
  }

  const badgeConfig = getBadgeConfig(data.badgeLevel)
  const scoreColor = getScoreColor(data.score)
  const circumference = 2 * Math.PI * 60
  const dashOffset = circumference - (data.score / 100) * circumference

  return (
    <Card>
      <CardHeader
        title={
          '\u0E14\u0E31\u0E0A\u0E19\u0E35\u0E04\u0E27\u0E32\u0E21\u0E19\u0E48\u0E32\u0E40\u0E0A\u0E37\u0E48\u0E2D\u0E16\u0E37\u0E2D\u0E02\u0E2D\u0E07\u0E41\u0E2A\u0E07\u0E41\u0E14\u0E14'
        }
        subtitle="Climate Reliability Score"
      />
      <CardBody>
        <div className="space-y-6">
          {/* Score Gauge */}
          <div className="flex flex-col items-center">
            <div className="relative w-40 h-40">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 140 140">
                <circle
                  cx="70"
                  cy="70"
                  r="60"
                  fill="none"
                  stroke="var(--brand-border)"
                  strokeWidth="10"
                />
                <circle
                  cx="70"
                  cy="70"
                  r="60"
                  fill="none"
                  stroke={scoreColor}
                  strokeWidth="10"
                  strokeDasharray={circumference}
                  strokeDashoffset={dashOffset}
                  strokeLinecap="round"
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-extrabold text-[var(--brand-text)]">
                  {data.score}
                </span>
                <span className="text-xs text-[var(--brand-text-secondary)]">/100</span>
              </div>
            </div>

            {/* Badge */}
            <div className={`mt-3 px-4 py-1.5 rounded-full ${badgeConfig.bg}`}>
              <span className={`text-sm font-bold ${badgeConfig.color}`}>
                {data.badge} {badgeConfig.stars}
              </span>
            </div>
          </div>

          {/* Risk Factors */}
          {data.riskFactors && data.riskFactors.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-[var(--brand-text)] mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-500" />
                {'\u0E04\u0E27\u0E32\u0E21\u0E40\u0E2A\u0E35\u0E48\u0E22\u0E07'}
              </h4>
              <div className="space-y-2">
                {data.riskFactors.map((risk, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 p-2 rounded-lg border border-[var(--brand-border)]"
                  >
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-full ${getSeverityColor(risk.severity)}`}
                    >
                      {risk.severity === 'high'
                        ? '\u0E2A\u0E39\u0E07'
                        : risk.severity === 'medium'
                          ? '\u0E1B\u0E32\u0E19\u0E01\u0E25\u0E32\u0E07'
                          : '\u0E15\u0E48\u0E33'}
                    </span>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-[var(--brand-text)]">
                        {risk.factor}
                      </div>
                      <div className="text-xs text-[var(--brand-text-secondary)]">
                        {risk.description}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Seasonal Calendar */}
          {seasonalCalendar.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-[var(--brand-text)] mb-3 flex items-center gap-2">
                <Sun className="w-4 h-4 text-yellow-500" />
                {'\u0E1B\u0E0F\u0E34\u0E17\u0E34\u0E19\u0E24\u0E14\u0E39\u0E01\u0E32\u0E25'}
              </h4>
              <div className="grid grid-cols-6 sm:grid-cols-12 gap-1">
                {seasonalCalendar.map((s) => {
                  const isMonsoon = s.season === 'monsoon'
                  return (
                    <div
                      key={s.month}
                      className={`p-2 rounded text-center text-xs ${
                        isMonsoon
                          ? 'bg-blue-500/10 text-blue-600 border border-blue-500/20'
                          : 'bg-yellow-500/10 text-yellow-600 border border-yellow-500/20'
                      }`}
                    >
                      <div className="font-medium">{THAI_MONTHS[s.month - 1] || s.month}</div>
                      <div className="mt-0.5">
                        {isMonsoon ? (
                          <CloudRain className="w-3 h-3 mx-auto" />
                        ) : (
                          <Sun className="w-3 h-3 mx-auto" />
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className="flex items-center gap-4 mt-2 text-xs">
                <div className="flex items-center gap-1">
                  <Sun className="w-3 h-3 text-yellow-500" />
                  <span className="text-[var(--brand-text-secondary)]">
                    {'\u0E24\u0E14\u0E39\u0E41\u0E25\u0E49\u0E07'}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <CloudRain className="w-3 h-3 text-blue-500" />
                  <span className="text-[var(--brand-text-secondary)]">
                    {'\u0E24\u0E14\u0E39\u0E21\u0E23\u0E2A\u0E38\u0E21'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Radiation Trend Line */}
          {radiationChartData.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-[var(--brand-text)] mb-3">
                {
                  '\u0E41\u0E19\u0E27\u0E42\u0E19\u0E49\u0E21\u0E23\u0E31\u0E07\u0E2A\u0E35\u0E22\u0E49\u0E2D\u0E19\u0E2B\u0E25\u0E31\u0E07'
                }
              </h4>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={radiationChartData}
                    margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--brand-border)" />
                    <XAxis
                      dataKey="label"
                      tick={{ fontSize: 10, fill: 'var(--brand-text-secondary)' }}
                      interval={Math.max(0, Math.floor(radiationChartData.length / 12) - 1)}
                    />
                    <YAxis tick={{ fontSize: 10, fill: 'var(--brand-text-secondary)' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--brand-surface)',
                        border: '1px solid var(--brand-border)',
                        borderRadius: '8px',
                        color: 'var(--brand-text)',
                        fontSize: 12,
                      }}
                      formatter={(value: number) => [
                        `${formatNumber(value)} kWh/m\u00B2`,
                        '\u0E23\u0E31\u0E07\u0E2A\u0E35',
                      ]}
                    />
                    <Line
                      type="monotone"
                      dataKey="radiation"
                      stroke="#f97316"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Attribution */}
          <div className="text-xs text-center text-[var(--brand-text-secondary)] opacity-60">
            Powered by NASA POWER & ECMWF
          </div>
        </div>
      </CardBody>
    </Card>
  )
}
