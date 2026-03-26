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
import { CloudSun, TrendingUp, Target } from 'lucide-react'
import type { WeatherDaily } from '@/types'

interface SevenDayForecastProps {
  daily: WeatherDaily[]
  totalPredicted7Day: number
  totalIdeal7Day: number
}

const THAI_DAY_NAMES: Record<string, string> = {
  Mon: '\u0E08.',
  Tue: '\u0E2D.',
  Wed: '\u0E1E.',
  Thu: '\u0E1E\u0E24.',
  Fri: '\u0E28.',
  Sat: '\u0E2A.',
  Sun: '\u0E2D\u0E32.',
}

const formatNumber = (value: number): string =>
  new Intl.NumberFormat('th-TH', { maximumFractionDigits: 0 }).format(value)

function getBarColor(clouds: number, rain: number): string {
  if (rain > 5) {
    return '#ef4444'
  } // red - rain
  if (clouds > 60) {
    return '#eab308'
  } // yellow - cloudy
  return '#22c55e' // green - good
}

function getWeatherEmoji(clouds: number, rain: number): string {
  if (rain > 5) {
    return '\u{1F327}\u{FE0F}'
  }
  if (clouds < 20) {
    return '\u{2600}\u{FE0F}'
  }
  if (clouds < 50) {
    return '\u{1F324}\u{FE0F}'
  }
  if (clouds < 80) {
    return '\u{26C5}'
  }
  return '\u{1F325}\u{FE0F}'
}

export function SevenDayForecast({
  daily,
  totalPredicted7Day,
  totalIdeal7Day,
}: SevenDayForecastProps) {
  const chartData = useMemo(() => {
    if (!daily) {
      return []
    }
    return daily.map((d, idx) => {
      const dayLabel =
        idx === 0
          ? '\u0E27\u0E31\u0E19\u0E19\u0E35\u0E49'
          : idx === 1
            ? '\u0E1E\u0E23\u0E38\u0E48\u0E07\u0E19\u0E35\u0E49'
            : THAI_DAY_NAMES[d.dayName] || d.dayName
      return {
        ...d,
        dayLabel,
        barColor: getBarColor(d.clouds, d.rain),
        weatherEmoji: getWeatherEmoji(d.clouds, d.rain),
        cloudLabel: `${d.clouds}%`,
      }
    })
  }, [daily])

  const forecastAccuracy =
    totalIdeal7Day > 0 ? ((totalPredicted7Day / totalIdeal7Day) * 100).toFixed(0) : '0'

  if (!daily || daily.length === 0) {
    return (
      <Card>
        <CardBody className="p-6 text-center text-[var(--brand-text-secondary)]">
          <CloudSun className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No forecast data available.</p>
        </CardBody>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader
        title={
          '\u0E1E\u0E22\u0E32\u0E01\u0E23\u0E13\u0E4C\u0E01\u0E32\u0E23\u0E1C\u0E25\u0E34\u0E15\u0E44\u0E1F 7 \u0E27\u0E31\u0E19'
        }
        subtitle="7-Day Energy Production Forecast"
      />
      <CardBody>
        {/* Summary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-green-500/5">
            <TrendingUp className="w-5 h-5 text-green-500" />
            <div>
              <div className="text-xs text-[var(--brand-text-secondary)]">
                {'\u0E04\u0E32\u0E14\u0E01\u0E32\u0E23\u0E13\u0E4C 7 \u0E27\u0E31\u0E19'}
              </div>
              <div className="text-lg font-bold text-green-600">
                {formatNumber(totalPredicted7Day)} kWh
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-500/5">
            <Target className="w-5 h-5 text-blue-500" />
            <div>
              <div className="text-xs text-[var(--brand-text-secondary)]">
                {'\u0E2D\u0E38\u0E14\u0E21\u0E04\u0E15\u0E34 (Ideal)'}
              </div>
              <div className="text-lg font-bold text-blue-600">
                {formatNumber(totalIdeal7Day)} kWh
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-purple-500/5">
            <CloudSun className="w-5 h-5 text-purple-500" />
            <div>
              <div className="text-xs text-[var(--brand-text-secondary)]">
                {'\u0E04\u0E27\u0E32\u0E21\u0E41\u0E21\u0E48\u0E19\u0E22\u0E33'}
              </div>
              <div className="text-lg font-bold text-purple-600">{forecastAccuracy}%</div>
            </div>
          </div>
        </div>

        {/* Weather Icons Row */}
        <div className="flex justify-around mb-2">
          {chartData.map((d, idx) => (
            <div key={idx} className="text-center">
              <span className="text-lg">{d.weatherEmoji}</span>
              <div className="text-[10px] text-[var(--brand-text-secondary)]">{d.cloudLabel}</div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mb-4 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-green-500" />
            <span className="text-[var(--brand-text-secondary)]">
              {'\u0E41\u0E14\u0E14\u0E14\u0E35'}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-yellow-500" />
            <span className="text-[var(--brand-text-secondary)]">
              {'\u0E21\u0E35\u0E40\u0E21\u0E06'}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-red-500" />
            <span className="text-[var(--brand-text-secondary)]">{'\u0E1D\u0E19'}</span>
          </div>
        </div>

        {/* Chart */}
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--brand-border)" />
              <XAxis
                dataKey="dayLabel"
                tick={{ fontSize: 11, fill: 'var(--brand-text-secondary)' }}
              />
              <YAxis
                yAxisId="left"
                tick={{ fontSize: 11, fill: 'var(--brand-text-secondary)' }}
                label={{
                  value: 'kWh',
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
                  value: '\u00B0C',
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
                  const v = value ?? 0
                  if (name === 'predictedKwh') {
                    return [
                      `${v.toFixed(1)} kWh`,
                      '\u0E04\u0E32\u0E14\u0E01\u0E32\u0E23\u0E13\u0E4C',
                    ]
                  }
                  if (name === 'idealKwh') {
                    return [`${v.toFixed(1)} kWh`, '\u0E2D\u0E38\u0E14\u0E21\u0E04\u0E15\u0E34']
                  }
                  if (name === 'tempMax') {
                    return [
                      `${v.toFixed(1)}\u00B0C`,
                      '\u0E2D\u0E38\u0E13\u0E2B\u0E20\u0E39\u0E21\u0E34\u0E2A\u0E39\u0E07\u0E2A\u0E38\u0E14',
                    ]
                  }
                  return [v, name]
                }}
              />
              <Legend
                wrapperStyle={{ fontSize: 12 }}
                formatter={(value: string) => {
                  const labels: Record<string, string> = {
                    predictedKwh: '\u0E04\u0E32\u0E14\u0E01\u0E32\u0E23\u0E13\u0E4C (kWh)',
                    idealKwh: '\u0E2D\u0E38\u0E14\u0E21\u0E04\u0E15\u0E34 (kWh)',
                    tempMax: '\u0E2D\u0E38\u0E13\u0E2B\u0E20\u0E39\u0E21\u0E34 (\u00B0C)',
                  }
                  return labels[value] || value
                }}
              />

              <Bar yAxisId="left" dataKey="predictedKwh" radius={[4, 4, 0, 0]} barSize={28}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.barColor} />
                ))}
              </Bar>

              <Line
                yAxisId="left"
                type="monotone"
                dataKey="idealKwh"
                stroke="#3b82f6"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
              />

              <Line
                yAxisId="right"
                type="monotone"
                dataKey="tempMax"
                stroke="#f97316"
                strokeWidth={2}
                dot={{ fill: '#f97316', r: 3 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardBody>
    </Card>
  )
}
