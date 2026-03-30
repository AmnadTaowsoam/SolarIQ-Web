'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Card, CardHeader, CardBody } from '@/components/ui'
import { Info, Home, Briefcase, Battery, Sun, Clock } from 'lucide-react'

export interface SelfConsumptionSliderProps {
  value: number // 0-1
  onChange: (value: number) => void
  netBillingRate: number
  onNetBillingRateChange: (rate: number) => void
}

interface Preset {
  labelKey: string
  value: number
  icon: React.ReactNode
  descriptionKey: string
}

const PRESETS: Preset[] = [
  {
    labelKey: 'low',
    value: 0.3,
    icon: <Briefcase className="w-4 h-4" />,
    descriptionKey: 'description',
  },
  {
    labelKey: 'medium',
    value: 0.5,
    icon: <Clock className="w-4 h-4" />,
    descriptionKey: 'description',
  },
  {
    labelKey: 'high',
    value: 0.7,
    icon: <Home className="w-4 h-4" />,
    descriptionKey: 'description',
  },
  {
    labelKey: 'selfConsumption',
    value: 0.9,
    icon: <Sun className="w-4 h-4" />,
    descriptionKey: 'description',
  },
  {
    labelKey: 'batteryRecommended',
    value: 0.95,
    icon: <Battery className="w-4 h-4" />,
    descriptionKey: 'batteryRecommended',
  },
]

export function SelfConsumptionSlider({
  value,
  onChange,
  netBillingRate,
  onNetBillingRateChange,
}: SelfConsumptionSliderProps) {
  const t = useTranslations('selfConsumption')
  const [showTooltip, setShowTooltip] = useState(false)

  const percentage = Math.round(value * 100)

  return (
    <Card>
      <CardHeader
        title={t('title')}
        subtitle={t('selfConsumption')}
        action={
          <button
            type="button"
            className="relative p-1.5 rounded-full hover:bg-[var(--brand-primary)]/10 transition-colors"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            onClick={() => setShowTooltip(!showTooltip)}
            aria-label={t('learnMore')}
          >
            <Info className="w-5 h-5 text-[var(--brand-primary)]" />
            {showTooltip && (
              <div className="absolute right-0 top-full mt-2 w-72 p-3 bg-[var(--brand-surface)] border border-[var(--brand-border)] rounded-[var(--brand-radius)] shadow-lg z-50 text-left">
                <p className="text-xs text-[var(--brand-text-secondary)] leading-relaxed">
                  <strong className="text-[var(--brand-text)]">{t('selfConsumption')}</strong>{' '}
                  {t('description')}
                </p>
              </div>
            )}
          </button>
        }
      />
      <CardBody>
        <div className="space-y-5">
          {/* Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--brand-text-secondary)]">0%</span>
              <span className="text-lg font-bold text-[var(--brand-primary)]">{percentage}%</span>
              <span className="text-sm text-[var(--brand-text-secondary)]">100%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={percentage}
              onChange={(e) => onChange(parseInt(e.target.value) / 100)}
              className="w-full h-2 rounded-full appearance-none cursor-pointer
                bg-gradient-to-r from-red-300 via-yellow-300 to-green-400
                [&::-webkit-slider-thumb]:appearance-none
                [&::-webkit-slider-thumb]:w-5
                [&::-webkit-slider-thumb]:h-5
                [&::-webkit-slider-thumb]:rounded-full
                [&::-webkit-slider-thumb]:bg-[var(--brand-primary)]
                [&::-webkit-slider-thumb]:border-2
                [&::-webkit-slider-thumb]:border-white
                [&::-webkit-slider-thumb]:shadow-md
                [&::-webkit-slider-thumb]:cursor-pointer
                [&::-moz-range-thumb]:w-5
                [&::-moz-range-thumb]:h-5
                [&::-moz-range-thumb]:rounded-full
                [&::-moz-range-thumb]:bg-[var(--brand-primary)]
                [&::-moz-range-thumb]:border-2
                [&::-moz-range-thumb]:border-white
                [&::-moz-range-thumb]:shadow-md
                [&::-moz-range-thumb]:cursor-pointer"
              aria-label={t('selfConsumption')}
            />
          </div>

          {/* Preset Buttons */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--brand-text)]">{t('optimize')}</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
              {PRESETS.map((preset) => {
                const isActive = Math.abs(value - preset.value) < 0.01
                return (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => onChange(preset.value)}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-[var(--brand-radius)] border-2 transition-all text-center ${
                      isActive
                        ? 'border-[var(--brand-primary)] bg-[var(--brand-primary)]/10 text-[var(--brand-primary)]'
                        : 'border-[var(--brand-border)] hover:border-[var(--brand-primary)]/50 text-[var(--brand-text-secondary)] hover:text-[var(--brand-text)]'
                    }`}
                  >
                    <span className={isActive ? 'text-[var(--brand-primary)]' : ''}>
                      {preset.icon}
                    </span>
                    <span className="text-xs font-medium leading-tight">
                      {t(preset.labelKey as Parameters<typeof t>[0])}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Net Billing Rate Input */}
          <div className="space-y-2">
            <label
              htmlFor="net-billing-rate"
              className="text-sm font-medium text-[var(--brand-text)]"
            >
              {t('exportRevenue')}
            </label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-[var(--brand-text-secondary)]">฿</span>
              <input
                id="net-billing-rate"
                type="number"
                min="0"
                max="10"
                step="0.1"
                value={netBillingRate}
                onChange={(e) => {
                  const val = parseFloat(e.target.value)
                  if (!isNaN(val) && val >= 0) {
                    onNetBillingRateChange(val)
                  }
                }}
                className="w-24 px-3 py-1.5 text-sm rounded-[var(--brand-radius)] border border-[var(--brand-border)]
                  bg-[var(--brand-surface)] text-[var(--brand-text)]
                  focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] focus:border-[var(--brand-primary)]"
              />
              <span className="text-sm text-[var(--brand-text-secondary)]">/kWh</span>
            </div>
            <p className="text-xs text-[var(--brand-text-secondary)]">
              {t('gridExport')} (฿2.2/kWh)
            </p>
          </div>
        </div>
      </CardBody>
    </Card>
  )
}
