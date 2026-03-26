'use client'

import { useMemo } from 'react'
import { Card, CardHeader, CardBody } from '@/components/ui'
import { Wind, Droplets, AlertTriangle, Calendar } from 'lucide-react'
import type { AirQualityData, DustSeasonAnalysis } from '@/types'

interface AirQualityImpactProps {
  airQuality: AirQualityData | null
  dustSeason: DustSeasonAnalysis | null
}

const formatNumber = (value: number): string =>
  new Intl.NumberFormat('th-TH', { maximumFractionDigits: 1 }).format(value)

function getAqiConfig(aqi: number) {
  if (aqi <= 50) {
    return {
      label: '\u0E14\u0E35',
      color: 'text-green-600',
      bg: 'bg-green-500',
      bgLight: 'bg-green-500/10',
      border: 'border-green-500/20',
    }
  }
  if (aqi <= 100) {
    return {
      label: '\u0E1B\u0E32\u0E19\u0E01\u0E25\u0E32\u0E07',
      color: 'text-yellow-600',
      bg: 'bg-yellow-500',
      bgLight: 'bg-yellow-500/10',
      border: 'border-yellow-500/20',
    }
  }
  if (aqi <= 150) {
    return {
      label:
        '\u0E44\u0E21\u0E48\u0E14\u0E35\u0E15\u0E48\u0E2D\u0E01\u0E25\u0E38\u0E48\u0E21\u0E40\u0E2A\u0E35\u0E48\u0E22\u0E07',
      color: 'text-orange-600',
      bg: 'bg-orange-500',
      bgLight: 'bg-orange-500/10',
      border: 'border-orange-500/20',
    }
  }
  if (aqi <= 200) {
    return {
      label: '\u0E44\u0E21\u0E48\u0E14\u0E35\u0E15\u0E48\u0E2D\u0E2A\u0E38\u0E02\u0E20\u0E32\u0E1E',
      color: 'text-red-600',
      bg: 'bg-red-500',
      bgLight: 'bg-red-500/10',
      border: 'border-red-500/20',
    }
  }
  return {
    label: '\u0E2D\u0E31\u0E19\u0E15\u0E23\u0E32\u0E22\u0E21\u0E32\u0E01',
    color: 'text-purple-600',
    bg: 'bg-purple-500',
    bgLight: 'bg-purple-500/10',
    border: 'border-purple-500/20',
  }
}

const DUST_MONTHS = [
  { month: 1, name: '\u0E21.\u0E04.' },
  { month: 2, name: '\u0E01.\u0E1E.' },
  { month: 3, name: '\u0E21\u0E35.\u0E04.' },
  { month: 4, name: '\u0E40\u0E21.\u0E22.' },
  { month: 5, name: '\u0E1E.\u0E04.' },
  { month: 6, name: '\u0E21\u0E34.\u0E22.' },
  { month: 7, name: '\u0E01.\u0E04.' },
  { month: 8, name: '\u0E2A.\u0E04.' },
  { month: 9, name: '\u0E01.\u0E22.' },
  { month: 10, name: '\u0E15.\u0E04.' },
  { month: 11, name: '\u0E1E.\u0E22.' },
  { month: 12, name: '\u0E18.\u0E04.' },
]

export function AirQualityImpact({ airQuality, dustSeason }: AirQualityImpactProps) {
  const dustMonthSet = useMemo(() => {
    if (!dustSeason?.worstMonths) {
      return new Set<string>()
    }
    return new Set(dustSeason.worstMonths)
  }, [dustSeason])

  if (!airQuality) {
    return (
      <Card>
        <CardBody className="p-6 text-center text-[var(--brand-text-secondary)]">
          <Wind className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No air quality data available.</p>
        </CardBody>
      </Card>
    )
  }

  const aqiConfig = getAqiConfig(airQuality.aqi)
  const aqiPercent = Math.min((airQuality.aqi / 300) * 100, 100)

  return (
    <Card>
      <CardHeader
        title={'\u0E04\u0E38\u0E13\u0E20\u0E32\u0E1E\u0E2D\u0E32\u0E01\u0E32\u0E28'}
        subtitle={
          '\u0E1C\u0E25\u0E01\u0E23\u0E30\u0E17\u0E1A\u0E15\u0E48\u0E2D\u0E41\u0E1C\u0E07\u0E42\u0E0B\u0E25\u0E32\u0E23\u0E4C'
        }
      />
      <CardBody>
        <div className="space-y-5">
          {/* AQI Gauge */}
          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* AQI Circle */}
            <div
              className={`relative w-28 h-28 rounded-full ${aqiConfig.bgLight} border-4 ${aqiConfig.border} flex flex-col items-center justify-center`}
            >
              <span className={`text-3xl font-extrabold ${aqiConfig.color}`}>{airQuality.aqi}</span>
              <span className="text-xs text-[var(--brand-text-secondary)]">AQI</span>
            </div>

            <div className="flex-1 space-y-3">
              {/* AQI Bar */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className={`font-bold ${aqiConfig.color}`}>{aqiConfig.label}</span>
                  <span className="text-[var(--brand-text-secondary)]">
                    PM2.5: {airQuality.pm25} \u00B5g/m\u00B3
                  </span>
                </div>
                <div className="w-full h-3 rounded-full bg-gradient-to-r from-green-500 via-yellow-500 via-orange-500 to-purple-500 relative">
                  <div
                    className="absolute top-0 w-1 h-3 bg-white border border-gray-800 rounded"
                    style={{ left: `${aqiPercent}%` }}
                  />
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-2 rounded-lg bg-red-500/5 border border-red-500/10">
                  <div className="text-xs text-[var(--brand-text-secondary)]">
                    {
                      '\u0E1B\u0E23\u0E30\u0E2A\u0E34\u0E17\u0E18\u0E34\u0E20\u0E32\u0E1E\u0E25\u0E14\u0E25\u0E07'
                    }
                  </div>
                  <div className="text-lg font-bold text-red-600">
                    -{(airQuality.solarEfficiencyLoss ?? 0).toFixed(1)}%
                  </div>
                </div>
                <div className="p-2 rounded-lg bg-blue-500/5 border border-blue-500/10">
                  <div className="text-xs text-[var(--brand-text-secondary)]">
                    {
                      '\u0E27\u0E31\u0E19\u0E17\u0E35\u0E48\u0E44\u0E21\u0E48\u0E21\u0E35\u0E1D\u0E19'
                    }
                  </div>
                  <div className="text-lg font-bold text-blue-600">
                    {airQuality.daysSinceRain} {'\u0E27\u0E31\u0E19'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Cleaning Recommendation */}
          <div className="flex items-start gap-3 p-3 rounded-lg bg-yellow-500/5 border border-yellow-500/20">
            <Droplets className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
            <div>
              <div className="text-sm font-medium text-[var(--brand-text)]">
                {'\u0E41\u0E19\u0E30\u0E19\u0E33\u0E25\u0E49\u0E32\u0E07\u0E41\u0E1C\u0E07'}
              </div>
              <div className="text-xs text-[var(--brand-text-secondary)] mt-0.5">
                {airQuality.cleaningRecommendation}
              </div>
            </div>
          </div>

          {/* Panel Efficiency Comparison */}
          <div>
            <h4 className="text-sm font-semibold text-[var(--brand-text)] mb-3">
              {
                '\u0E40\u0E1B\u0E23\u0E35\u0E22\u0E1A\u0E40\u0E17\u0E35\u0E22\u0E1A\u0E1B\u0E23\u0E30\u0E2A\u0E34\u0E17\u0E18\u0E34\u0E20\u0E32\u0E1E: \u0E2A\u0E30\u0E2D\u0E32\u0E14 vs \u0E21\u0E35\u0E1D\u0E38\u0E48\u0E19'
              }
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-green-500/5 border border-green-500/20 text-center">
                <div className="text-xs text-[var(--brand-text-secondary)] mb-1">
                  {'\u0E41\u0E1C\u0E07\u0E2A\u0E30\u0E2D\u0E32\u0E14'}
                </div>
                <div className="text-2xl font-bold text-green-600">100%</div>
              </div>
              <div className="p-3 rounded-lg bg-orange-500/5 border border-orange-500/20 text-center">
                <div className="text-xs text-[var(--brand-text-secondary)] mb-1">
                  {'\u0E41\u0E1C\u0E07\u0E21\u0E35\u0E1D\u0E38\u0E48\u0E19'}
                </div>
                <div className="text-2xl font-bold text-orange-600">
                  {(100 - (airQuality.solarEfficiencyLoss ?? 0)).toFixed(1)}%
                </div>
              </div>
            </div>
          </div>

          {/* Dust Season Calendar */}
          {dustSeason && (
            <div>
              <h4 className="text-sm font-semibold text-[var(--brand-text)] mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-orange-500" />
                {'\u0E24\u0E14\u0E39\u0E2B\u0E21\u0E2D\u0E01\u0E04\u0E27\u0E31\u0E19'} (
                {dustSeason.region})
              </h4>
              <div className="grid grid-cols-6 sm:grid-cols-12 gap-1 mb-3">
                {DUST_MONTHS.map((m) => {
                  const isDust = dustMonthSet.has(m.name) || dustMonthSet.has(m.month.toString())
                  return (
                    <div
                      key={m.month}
                      className={`p-1.5 rounded text-center text-xs ${
                        isDust
                          ? 'bg-orange-500/20 text-orange-600 border border-orange-500/30 font-bold'
                          : 'bg-[var(--brand-surface)] text-[var(--brand-text-secondary)] border border-[var(--brand-border)]'
                      }`}
                    >
                      {m.name}
                    </div>
                  )
                })}
              </div>
              <div className="flex items-center gap-3 text-xs text-[var(--brand-text-secondary)]">
                <AlertTriangle className="w-3.5 h-3.5 text-orange-500" />
                <span>
                  {
                    '\u0E01\u0E32\u0E23\u0E2A\u0E39\u0E0D\u0E40\u0E2A\u0E35\u0E22\u0E1B\u0E23\u0E30\u0E08\u0E33\u0E1B\u0E35'
                  }
                  : -{formatNumber(dustSeason.annualLossPercent)}%
                </span>
              </div>
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  )
}
