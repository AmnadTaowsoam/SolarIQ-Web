'use client'

import { useState } from 'react'
import { Card, CardHeader, CardBody } from '@/components/ui'
import {
  Bell,
  CloudRain,
  Thermometer,
  AlertTriangle,
  Wrench,
  DollarSign,
  Info,
  X,
  Zap,
} from 'lucide-react'
import type { SmartAlertItem } from '@/types'

interface SmartAlertsProps {
  alerts: SmartAlertItem[]
}

function getAlertIcon(type: string) {
  switch (type) {
    case 'weather_rain':
      return <CloudRain className="w-5 h-5" />
    case 'weather_heat':
      return <Thermometer className="w-5 h-5" />
    case 'weather_storm':
      return <AlertTriangle className="w-5 h-5" />
    case 'maintenance':
      return <Wrench className="w-5 h-5" />
    case 'performance':
      return <Zap className="w-5 h-5" />
    case 'financial':
      return <DollarSign className="w-5 h-5" />
    default:
      return <Info className="w-5 h-5" />
  }
}

function getSeverityConfig(severity: string) {
  switch (severity) {
    case 'critical':
      return {
        bg: 'bg-red-500/5',
        border: 'border-red-500/20',
        iconColor: 'text-red-500',
        badge: 'bg-red-500 text-white',
        label: '\u0E27\u0E34\u0E01\u0E24\u0E15',
      }
    case 'warning':
      return {
        bg: 'bg-yellow-500/5',
        border: 'border-yellow-500/20',
        iconColor: 'text-yellow-500',
        badge: 'bg-yellow-500 text-white',
        label: '\u0E40\u0E15\u0E37\u0E2D\u0E19',
      }
    default:
      return {
        bg: 'bg-blue-500/5',
        border: 'border-blue-500/20',
        iconColor: 'text-blue-500',
        badge: 'bg-blue-500 text-white',
        label: '\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25',
      }
  }
}

export function SmartAlerts({ alerts }: SmartAlertsProps) {
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set())

  const safeAlerts = Array.isArray(alerts) ? alerts : []
  const visibleAlerts = safeAlerts.filter((a) => !dismissedIds.has(a.id))

  const handleDismiss = (id: string) => {
    setDismissedIds((prev) => new Set([...prev, id]))
  }

  if (safeAlerts.length === 0) {
    return (
      <Card>
        <CardBody className="p-6 text-center text-[var(--brand-text-secondary)]">
          <Bell className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>
            {
              '\u0E44\u0E21\u0E48\u0E21\u0E35\u0E01\u0E32\u0E23\u0E41\u0E08\u0E49\u0E07\u0E40\u0E15\u0E37\u0E2D\u0E19\u0E43\u0E19\u0E02\u0E13\u0E30\u0E19\u0E35\u0E49'
            }
          </p>
        </CardBody>
      </Card>
    )
  }

  if (visibleAlerts.length === 0) {
    return (
      <Card>
        <CardBody className="p-6 text-center text-[var(--brand-text-secondary)]">
          <Bell className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>
            {
              '\u0E1B\u0E34\u0E14\u0E01\u0E32\u0E23\u0E41\u0E08\u0E49\u0E07\u0E40\u0E15\u0E37\u0E2D\u0E19\u0E17\u0E31\u0E49\u0E07\u0E2B\u0E21\u0E14\u0E41\u0E25\u0E49\u0E27'
            }
          </p>
        </CardBody>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader
        title={
          '\u0E01\u0E32\u0E23\u0E41\u0E08\u0E49\u0E07\u0E40\u0E15\u0E37\u0E2D\u0E19\u0E2D\u0E31\u0E08\u0E09\u0E23\u0E34\u0E22\u0E30'
        }
        subtitle={`Smart Alerts (${visibleAlerts.length})`}
      />
      <CardBody>
        <div className="space-y-3">
          {visibleAlerts.map((alert) => {
            const config = getSeverityConfig(alert.severity)
            return (
              <div
                key={alert.id}
                className={`flex items-start gap-3 p-3 rounded-lg ${config.bg} border ${config.border} transition-all animate-in fade-in`}
              >
                <div className={`mt-0.5 flex-shrink-0 ${config.iconColor}`}>
                  {getAlertIcon(alert.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${config.badge}`}>
                      {config.label}
                    </span>
                    <span className="text-sm font-medium text-[var(--brand-text)]">
                      {alert.title}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--brand-text-secondary)]">{alert.description}</p>
                  <div className="text-[10px] text-[var(--brand-text-secondary)] mt-1 opacity-60">
                    {new Date(alert.timestamp).toLocaleString('th-TH')}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleDismiss(alert.id)}
                  className="p-1 rounded-full hover:bg-[var(--brand-border)] transition-colors flex-shrink-0"
                  aria-label="Dismiss"
                >
                  <X className="w-4 h-4 text-[var(--brand-text-secondary)]" />
                </button>
              </div>
            )
          })}
        </div>
      </CardBody>
    </Card>
  )
}
