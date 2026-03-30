'use client'

import { useEffect, useState } from 'react'
import { Card, CardHeader, CardBody } from '@/components/ui'
import { Trees, Car, Home, Fuel, Droplets, Leaf } from 'lucide-react'
import type { EnvironmentalImpactData } from '@/types'

interface EnvironmentalImpactProps {
  data: EnvironmentalImpactData
  annualProductionKwh: number
}

const formatNumber = (value: number): string =>
  new Intl.NumberFormat('th-TH', { maximumFractionDigits: 0 }).format(value)

const formatDecimal = (value: number): string =>
  new Intl.NumberFormat('th-TH', { maximumFractionDigits: 1 }).format(value)

/** Animated counter that counts up from 0 to target */
function AnimatedNumber({
  target,
  duration = 2000,
  decimals = 0,
}: {
  target: number
  duration?: number
  decimals?: number
}) {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    let startTime: number | null = null
    let animationFrame: number

    const animate = (timestamp: number) => {
      if (!startTime) {
        startTime = timestamp
      }
      const elapsed = timestamp - startTime
      const progress = Math.min(elapsed / duration, 1)
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setCurrent(eased * target)
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate)
      }
    }

    animationFrame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationFrame)
  }, [target, duration])

  return <>{decimals > 0 ? formatDecimal(current) : formatNumber(current)}</>
}

interface ImpactCardProps {
  icon: React.ReactNode
  label: string
  value: number
  unit?: string
  explanation: string
  decimals?: number
  colorClass: string
}

function ImpactCard({
  icon,
  label,
  value,
  unit,
  explanation,
  decimals = 0,
  colorClass,
}: ImpactCardProps) {
  return (
    <div
      className={`relative overflow-hidden rounded-xl border border-[var(--brand-border)] p-4 transition-all hover:shadow-md`}
    >
      <div
        className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full opacity-10 ${colorClass}`}
      />
      <div className="relative">
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-lg ${colorClass} bg-opacity-10`}>{icon}</div>
          <div className="flex-1 min-w-0">
            <div className="text-2xl font-bold text-[var(--brand-text)]">
              <AnimatedNumber target={value} decimals={decimals} />
              {unit && <span className="text-sm font-normal ml-1">{unit}</span>}
            </div>
            <div className="text-sm font-medium text-[var(--brand-text)] mt-0.5">{label}</div>
            <div className="text-xs text-[var(--brand-text-secondary)] mt-1">{explanation}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function EnvironmentalImpact({ data, annualProductionKwh }: EnvironmentalImpactProps) {
  if (!data) {
    return (
      <Card>
        <CardBody className="p-6 text-center text-[var(--brand-text-secondary)]">
          <Leaf className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No environmental impact data available.</p>
        </CardBody>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader
        title="Environmental Impact"
        subtitle={`Based on ${formatNumber(annualProductionKwh)} kWh annual production`}
      />
      <CardBody>
        {/* Hero Stat - 25 year CO2 offset */}
        <div className="text-center mb-8 p-6 rounded-2xl bg-gradient-to-br from-green-500/5 to-emerald-500/10 border border-green-500/20">
          <div className="text-xs uppercase tracking-widest text-green-600 font-semibold mb-2">
            Total CO2 Offset in 25 Years
          </div>
          <div className="text-5xl font-extrabold text-green-600">
            <AnimatedNumber target={data.co2OffsetTons25yr} duration={2500} decimals={1} />
          </div>
          <div className="text-lg text-green-600/80 font-medium mt-1">tons CO2</div>
          <div className="text-sm text-[var(--brand-text-secondary)] mt-2">
            ({formatDecimal(data.co2OffsetTonsPerYear)} tons/year)
          </div>
        </div>

        {/* Impact Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <ImpactCard
            icon={<Trees className="w-5 h-5 text-green-600" />}
            label={
              '\u0E40\u0E17\u0E35\u0E22\u0E1A\u0E40\u0E17\u0E48\u0E32\u0E01\u0E32\u0E23\u0E1B\u0E25\u0E39\u0E01\u0E15\u0E49\u0E19\u0E44\u0E21\u0E49'
            }
            value={data.treesEquivalent}
            unit={'\u0E15\u0E49\u0E19'}
            explanation={
              '\u0E08\u0E33\u0E19\u0E27\u0E19\u0E15\u0E49\u0E19\u0E44\u0E21\u0E49\u0E17\u0E35\u0E48\u0E15\u0E49\u0E2D\u0E07\u0E1B\u0E25\u0E39\u0E01\u0E40\u0E1E\u0E37\u0E48\u0E2D\u0E14\u0E39\u0E14\u0E0B\u0E31\u0E1A CO2 \u0E40\u0E17\u0E48\u0E32\u0E01\u0E31\u0E19'
            }
            colorClass="bg-green-500"
          />
          <ImpactCard
            icon={<Car className="w-5 h-5 text-blue-600" />}
            label={
              '\u0E40\u0E17\u0E35\u0E22\u0E1A\u0E40\u0E17\u0E48\u0E32\u0E01\u0E32\u0E23\u0E2B\u0E22\u0E38\u0E14\u0E43\u0E0A\u0E49\u0E23\u0E16\u0E22\u0E19\u0E15\u0E4C'
            }
            value={data.carsOffRoad}
            unit={'\u0E04\u0E31\u0E19/\u0E1B\u0E35'}
            explanation={
              '\u0E25\u0E14\u0E01\u0E32\u0E23\u0E1B\u0E25\u0E48\u0E2D\u0E22 CO2 \u0E40\u0E17\u0E35\u0E22\u0E1A\u0E40\u0E17\u0E48\u0E32\u0E01\u0E32\u0E23\u0E2B\u0E22\u0E38\u0E14\u0E43\u0E0A\u0E49\u0E23\u0E16\u0E22\u0E19\u0E15\u0E4C'
            }
            decimals={1}
            colorClass="bg-blue-500"
          />
          <ImpactCard
            icon={<Home className="w-5 h-5 text-purple-600" />}
            label={
              '\u0E1C\u0E25\u0E34\u0E15\u0E44\u0E1F\u0E40\u0E1E\u0E35\u0E22\u0E07\u0E1E\u0E2D\u0E2A\u0E33\u0E2B\u0E23\u0E31\u0E1A'
            }
            value={data.homesPowered}
            unit={'\u0E04\u0E23\u0E31\u0E27\u0E40\u0E23\u0E37\u0E2D\u0E19'}
            explanation={
              '\u0E08\u0E33\u0E19\u0E27\u0E19\u0E04\u0E23\u0E31\u0E27\u0E40\u0E23\u0E37\u0E2D\u0E19\u0E17\u0E35\u0E48\u0E2A\u0E32\u0E21\u0E32\u0E23\u0E16\u0E43\u0E0A\u0E49\u0E44\u0E1F\u0E44\u0E14\u0E49\u0E08\u0E32\u0E01\u0E23\u0E30\u0E1A\u0E1A\u0E19\u0E35\u0E49'
            }
            decimals={1}
            colorClass="bg-purple-500"
          />
          <ImpactCard
            icon={<Fuel className="w-5 h-5 text-amber-600" />}
            label={
              '\u0E25\u0E14\u0E01\u0E32\u0E23\u0E43\u0E0A\u0E49\u0E16\u0E48\u0E32\u0E19\u0E2B\u0E34\u0E19'
            }
            value={data.coalAvoidedKg}
            unit={'\u0E01\u0E01./\u0E1B\u0E35'}
            explanation={
              '\u0E1B\u0E23\u0E34\u0E21\u0E32\u0E13\u0E16\u0E48\u0E32\u0E19\u0E2B\u0E34\u0E19\u0E17\u0E35\u0E48\u0E44\u0E21\u0E48\u0E15\u0E49\u0E2D\u0E07\u0E40\u0E1C\u0E32\u0E40\u0E1E\u0E37\u0E48\u0E2D\u0E1C\u0E25\u0E34\u0E15\u0E44\u0E1F\u0E1F\u0E49\u0E32'
            }
            colorClass="bg-amber-500"
          />
          <ImpactCard
            icon={<Droplets className="w-5 h-5 text-cyan-600" />}
            label={'\u0E1B\u0E23\u0E30\u0E2B\u0E22\u0E31\u0E14\u0E19\u0E49\u0E33'}
            value={data.waterSavedLiters}
            unit={'\u0E25\u0E34\u0E15\u0E23/\u0E1B\u0E35'}
            explanation={
              '\u0E19\u0E49\u0E33\u0E17\u0E35\u0E48\u0E1B\u0E23\u0E30\u0E2B\u0E22\u0E31\u0E14\u0E44\u0E14\u0E49\u0E40\u0E21\u0E37\u0E48\u0E2D\u0E40\u0E17\u0E35\u0E22\u0E1A\u0E01\u0E31\u0E1A\u0E01\u0E32\u0E23\u0E1C\u0E25\u0E34\u0E15\u0E44\u0E1F\u0E08\u0E32\u0E01\u0E40\u0E0A\u0E37\u0E49\u0E2D\u0E40\u0E1E\u0E25\u0E34\u0E07\u0E1F\u0E2D\u0E2A\u0E0B\u0E34\u0E25'
            }
            colorClass="bg-cyan-500"
          />
        </div>
      </CardBody>
    </Card>
  )
}
