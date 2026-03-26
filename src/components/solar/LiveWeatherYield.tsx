'use client'

import { useMemo } from 'react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { Card, CardHeader, CardBody } from '@/components/ui'
import { CloudSun, Thermometer, Zap, Clock } from 'lucide-react'
import type { LiveConditions, WeatherHourly } from '@/types'

interface LiveWeatherYieldProps {
  liveConditions: LiveConditions | null
  hourlyForecast: WeatherHourly[]
}

const formatNumber = (value: number): string =>
  new Intl.NumberFormat('th-TH', { maximumFractionDigits: 1 }).format(value)

function getWeatherIcon(clouds: number, description?: string): string {
  if (description?.includes('rain') || description?.includes('storm')) {
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
  return '\u{1F327}\u{FE0F}'
}

function getTempEfficiencyColor(temp: number): string {
  if (temp < 30) {
    return 'text-green-500'
  }
  if (temp < 35) {
    return 'text-yellow-500'
  }
  return 'text-red-500'
}

function getTempEfficiencyBg(temp: number): string {
  if (temp < 30) {
    return 'bg-green-500/10'
  }
  if (temp < 35) {
    return 'bg-yellow-500/10'
  }
  return 'bg-red-500/10'
}

export function LiveWeatherYield({ liveConditions, hourlyForecast }: LiveWeatherYieldProps) {
  const sparklineData = useMemo(() => {
    if (!hourlyForecast || hourlyForecast.length === 0) {
      return []
    }
    return hourlyForecast.slice(0, 24).map((h) => ({
      time: h.time,
      kWh: h.predictedKwh,
      label: `${new Date(h.time).getHours().toString().padStart(2, '0')}:00`,
    }))
  }, [hourlyForecast])

  if (!liveConditions) {
    return (
      <Card>
        <CardBody className="p-6 text-center text-[var(--brand-text-secondary)]">
          <CloudSun className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No live weather data available.</p>
        </CardBody>
      </Card>
    )
  }

  const { weather, predictedOutputNow, predicted24h, tempEfficiency } = liveConditions
  const weatherIcon = getWeatherIcon(weather.clouds, weather.description)

  return (
    <Card>
      <CardHeader
        title={
          '\u0E2A\u0E20\u0E32\u0E1E\u0E2D\u0E32\u0E01\u0E32\u0E28 \u0E13 \u0E1B\u0E31\u0E08\u0E08\u0E38\u0E1A\u0E31\u0E19'
        }
        subtitle="Live Weather & Yield"
      />
      <CardBody>
        <div className="space-y-4">
          {/* Current Weather Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Temperature */}
            <div className="flex items-center gap-3 p-3 rounded-lg bg-[var(--brand-surface)] border border-[var(--brand-border)]">
              <span className="text-3xl">{weatherIcon}</span>
              <div>
                <div className="text-xs text-[var(--brand-text-secondary)]">
                  {'\u0E2D\u0E38\u0E13\u0E2B\u0E20\u0E39\u0E21\u0E34'}
                </div>
                <div className={`text-xl font-bold ${getTempEfficiencyColor(weather.temp)}`}>
                  {(weather.temp ?? 0).toFixed(1)}&deg;C
                </div>
              </div>
            </div>

            {/* Cloud Cover */}
            <div className="flex items-center gap-3 p-3 rounded-lg bg-[var(--brand-surface)] border border-[var(--brand-border)]">
              <CloudSun className="w-6 h-6 text-blue-400" />
              <div>
                <div className="text-xs text-[var(--brand-text-secondary)]">
                  {'\u0E40\u0E21\u0E06\u0E1B\u0E01\u0E04\u0E25\u0E38\u0E21'}
                </div>
                <div className="text-xl font-bold text-[var(--brand-text)]">{weather.clouds}%</div>
              </div>
            </div>

            {/* Current Output */}
            <div className="flex items-center gap-3 p-3 rounded-lg bg-orange-500/5 border border-orange-500/20">
              <Zap className="w-6 h-6 text-[var(--brand-primary)]" />
              <div>
                <div className="text-xs text-[var(--brand-text-secondary)]">
                  {
                    '\u0E01\u0E33\u0E25\u0E31\u0E07\u0E1C\u0E25\u0E34\u0E15\u0E02\u0E13\u0E30\u0E19\u0E35\u0E49'
                  }
                </div>
                <div className="text-xl font-bold text-[var(--brand-primary)]">
                  {formatNumber(predictedOutputNow)} kW
                </div>
              </div>
            </div>

            {/* 24h Prediction */}
            <div className="flex items-center gap-3 p-3 rounded-lg bg-green-500/5 border border-green-500/20">
              <Clock className="w-6 h-6 text-green-500" />
              <div>
                <div className="text-xs text-[var(--brand-text-secondary)]">
                  {'\u0E04\u0E32\u0E14\u0E01\u0E32\u0E23\u0E13\u0E4C 24 \u0E0A\u0E21.'}
                </div>
                <div className="text-xl font-bold text-green-600">
                  {formatNumber(predicted24h)} kWh
                </div>
              </div>
            </div>
          </div>

          {/* Temperature Efficiency Indicator */}
          <div
            className={`flex items-center gap-2 p-2 rounded-lg ${getTempEfficiencyBg(weather.temp)}`}
          >
            <Thermometer className={`w-4 h-4 ${getTempEfficiencyColor(weather.temp)}`} />
            <span className="text-sm text-[var(--brand-text)]">
              {
                '\u0E1B\u0E23\u0E30\u0E2A\u0E34\u0E17\u0E18\u0E34\u0E20\u0E32\u0E1E\u0E08\u0E32\u0E01\u0E2D\u0E38\u0E13\u0E2B\u0E20\u0E39\u0E21\u0E34'
              }
              :{' '}
              <span className={`font-bold ${getTempEfficiencyColor(weather.temp)}`}>
                {((tempEfficiency ?? 0) * 100).toFixed(1)}%
              </span>
            </span>
            {weather.temp >= 35 && (
              <span className="text-xs text-red-500 ml-auto">
                {
                  '\u0E2D\u0E38\u0E13\u0E2B\u0E20\u0E39\u0E21\u0E34\u0E2A\u0E39\u0E07 - \u0E1B\u0E23\u0E30\u0E2A\u0E34\u0E17\u0E18\u0E34\u0E20\u0E32\u0E1E\u0E25\u0E14\u0E25\u0E07'
                }
              </span>
            )}
          </div>

          {/* 24h Sparkline */}
          {sparklineData.length > 0 && (
            <div>
              <div className="text-sm font-medium text-[var(--brand-text)] mb-2">
                {
                  '\u0E01\u0E23\u0E32\u0E1F\u0E04\u0E32\u0E14\u0E01\u0E32\u0E23\u0E13\u0E4C\u0E01\u0E32\u0E23\u0E1C\u0E25\u0E34\u0E15 24 \u0E0A\u0E31\u0E48\u0E27\u0E42\u0E21\u0E07'
                }
              </div>
              <div className="h-[120px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={sparklineData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                    <defs>
                      <linearGradient id="sparkGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="label"
                      tick={{ fontSize: 10, fill: 'var(--brand-text-secondary)' }}
                      interval={3}
                    />
                    <YAxis hide />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--brand-surface)',
                        border: '1px solid var(--brand-border)',
                        borderRadius: '8px',
                        color: 'var(--brand-text)',
                        fontSize: 12,
                      }}
                      formatter={(value: number) => [
                        `${formatNumber(value)} kWh`,
                        '\u0E01\u0E33\u0E25\u0E31\u0E07\u0E1C\u0E25\u0E34\u0E15',
                      ]}
                    />
                    <Area
                      type="monotone"
                      dataKey="kWh"
                      stroke="#f97316"
                      strokeWidth={2}
                      fill="url(#sparkGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  )
}
