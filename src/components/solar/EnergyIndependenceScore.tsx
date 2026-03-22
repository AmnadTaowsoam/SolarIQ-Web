'use client'

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardBody } from '@/components/ui'
import { Battery, Sun, Plug, Lightbulb, Award } from 'lucide-react'
import type { EnergyIndependenceData } from '@/types'

interface EnergyIndependenceScoreProps {
  data: EnergyIndependenceData | null
}

const formatNumber = (value: number): string =>
  new Intl.NumberFormat('th-TH', { maximumFractionDigits: 1 }).format(value)

function getLevelConfig(level: string) {
  if (level === 'full' || level === '100')
    return {
      label: '\u0E1E\u0E36\u0E48\u0E07\u0E1E\u0E32\u0E15\u0E19\u0E40\u0E2D\u0E07 100%',
      color: 'text-green-600',
      bg: 'bg-green-500/10',
      icon: '\u{1F3C6}',
    }
  if (level === 'almost' || level === '75')
    return {
      label: '\u0E40\u0E01\u0E37\u0E2D\u0E1A\u0E2D\u0E34\u0E2A\u0E23\u0E30 75%+',
      color: 'text-blue-600',
      bg: 'bg-blue-500/10',
      icon: '\u{1F31F}',
    }
  if (level === 'transition' || level === '50')
    return {
      label: '\u0E01\u0E33\u0E25\u0E31\u0E07\u0E40\u0E1B\u0E25\u0E35\u0E48\u0E22\u0E19\u0E1C\u0E48\u0E32\u0E19 50%+',
      color: 'text-yellow-600',
      bg: 'bg-yellow-500/10',
      icon: '\u{26A1}',
    }
  return {
    label: '\u0E40\u0E23\u0E34\u0E48\u0E21\u0E15\u0E49\u0E19 <50%',
    color: 'text-orange-600',
    bg: 'bg-orange-500/10',
    icon: '\u{1F331}',
  }
}

function getScoreGradient(score: number): string {
  if (score >= 80) return '#22c55e'
  if (score >= 60) return '#3b82f6'
  if (score >= 40) return '#eab308'
  return '#f97316'
}

/** Animated counter with ease-out */
function AnimatedCounter({ target, suffix = '%' }: { target: number; suffix?: string }) {
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

  return <>{formatNumber(current)}{suffix}</>
}

export function EnergyIndependenceScore({ data }: EnergyIndependenceScoreProps) {
  if (!data) {
    return (
      <Card>
        <CardBody className="p-6 text-center text-[var(--brand-text-secondary)]">
          <Battery className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No energy independence data available.</p>
        </CardBody>
      </Card>
    )
  }

  const levelConfig = getLevelConfig(data.level)
  const scoreColor = getScoreGradient(data.score)
  const circumference = 2 * Math.PI * 60
  const dashOffset = circumference - (data.score / 100) * circumference

  return (
    <Card>
      <CardHeader
        title={'\u0E04\u0E30\u0E41\u0E19\u0E19\u0E04\u0E27\u0E32\u0E21\u0E40\u0E1B\u0E47\u0E19\u0E2D\u0E34\u0E2A\u0E23\u0E30\u0E14\u0E49\u0E32\u0E19\u0E1E\u0E25\u0E31\u0E07\u0E07\u0E32\u0E19'}
        subtitle="Energy Independence Score"
      />
      <CardBody>
        <div className="space-y-6">
          {/* Animated Circular Progress */}
          <div className="flex flex-col items-center">
            <div className="relative w-44 h-44">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 140 140">
                <circle
                  cx="70" cy="70" r="60"
                  fill="none"
                  stroke="var(--brand-border)"
                  strokeWidth="12"
                />
                <circle
                  cx="70" cy="70" r="60"
                  fill="none"
                  stroke={scoreColor}
                  strokeWidth="12"
                  strokeDasharray={circumference}
                  strokeDashoffset={dashOffset}
                  strokeLinecap="round"
                  className="transition-all duration-[2000ms] ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-extrabold text-[var(--brand-text)]">
                  <AnimatedCounter target={data.score} />
                </span>
              </div>
            </div>

            {/* Level Badge */}
            <div className={`mt-3 px-4 py-2 rounded-full ${levelConfig.bg} flex items-center gap-2`}>
              <span className="text-xl">{levelConfig.icon}</span>
              <span className={`text-sm font-bold ${levelConfig.color}`}>
                {levelConfig.label}
              </span>
            </div>
          </div>

          {/* Energy Breakdown Stacked Bar */}
          <div>
            <h4 className="text-sm font-semibold text-[var(--brand-text)] mb-3">
              {'\u0E2A\u0E31\u0E14\u0E2A\u0E48\u0E27\u0E19\u0E41\u0E2B\u0E25\u0E48\u0E07\u0E1E\u0E25\u0E31\u0E07\u0E07\u0E32\u0E19'}
            </h4>
            <div className="w-full h-8 rounded-full overflow-hidden flex">
              <div
                className="bg-green-500 transition-all duration-1000"
                style={{ width: `${data.solarSelfUsePercent}%` }}
                title={`\u0E42\u0E0B\u0E25\u0E32\u0E23\u0E4C\u0E43\u0E0A\u0E49\u0E40\u0E2D\u0E07: ${data.solarSelfUsePercent}%`}
              />
              <div
                className="bg-blue-500 transition-all duration-1000"
                style={{ width: `${data.gridImportPercent}%` }}
                title={`\u0E0B\u0E37\u0E49\u0E2D\u0E08\u0E32\u0E01\u0E01\u0E23\u0E34\u0E14: ${data.gridImportPercent}%`}
              />
              <div
                className="bg-yellow-400 transition-all duration-1000"
                style={{ width: `${data.surplusExportPercent}%` }}
                title={`\u0E02\u0E32\u0E22\u0E04\u0E37\u0E19: ${data.surplusExportPercent}%`}
              />
            </div>
            <div className="flex items-center gap-4 mt-2 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm bg-green-500" />
                <Sun className="w-3 h-3 text-green-500" />
                <span className="text-[var(--brand-text-secondary)]">
                  {'\u0E42\u0E0B\u0E25\u0E32\u0E23\u0E4C\u0E43\u0E0A\u0E49\u0E40\u0E2D\u0E07'} {data.solarSelfUsePercent}%
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm bg-blue-500" />
                <Plug className="w-3 h-3 text-blue-500" />
                <span className="text-[var(--brand-text-secondary)]">
                  {'\u0E0B\u0E37\u0E49\u0E2D\u0E08\u0E32\u0E01\u0E01\u0E23\u0E34\u0E14'} {data.gridImportPercent}%
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm bg-yellow-400" />
                <span className="text-[var(--brand-text-secondary)]">
                  {'\u0E02\u0E32\u0E22\u0E04\u0E37\u0E19'} {data.surplusExportPercent}%
                </span>
              </div>
            </div>
          </div>

          {/* Tips to Increase Score */}
          {data.tips && data.tips.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-[var(--brand-text)] mb-3 flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-yellow-500" />
                {'\u0E40\u0E1E\u0E34\u0E48\u0E21\u0E04\u0E30\u0E41\u0E19\u0E19\u0E44\u0E14\u0E49\u0E2D\u0E22\u0E48\u0E32\u0E07\u0E44\u0E23'}
              </h4>
              <div className="space-y-2">
                {data.tips.map((tip, idx) => (
                  <div key={idx} className="flex items-start gap-2 p-2 rounded-lg bg-[var(--brand-surface)] border border-[var(--brand-border)]">
                    <Award className="w-4 h-4 text-[var(--brand-primary)] mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-[var(--brand-text)]">{tip}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  )
}
