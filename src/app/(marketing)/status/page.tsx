'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  Clock,
  CreditCard,
  Globe,
  MessageSquare,
  Server,
  XCircle,
} from 'lucide-react'

type ServiceStatus = 'operational' | 'degraded' | 'outage' | 'maintenance'

interface Service {
  name: string
  status: ServiceStatus
  description: string
  lastChecked: string
  details?: string
}

function StatusBadge({ status }: { status: ServiceStatus }) {
  const config = {
    operational: {
      icon: CheckCircle2,
      className: 'bg-green-500/10 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      label: 'Operational',
    },
    degraded: {
      icon: AlertCircle,
      className: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
      label: 'Degraded',
    },
    outage: {
      icon: XCircle,
      className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      label: 'Outage',
    },
    maintenance: {
      icon: Clock,
      className: 'bg-blue-500/10 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      label: 'Maintenance',
    },
  }

  const { icon: Icon, className, label } = config[status]

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium ${className}`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </span>
  )
}

function ServiceIcon({ name }: { name: string }) {
  const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    'Frontend Website': Globe,
    'Backend API': Server,
    'LINE Messaging API': MessageSquare,
    'Billing & Checkout': CreditCard,
    'Developer Sandbox': Activity,
  }

  const Icon = iconMap[name] || Server
  return (
    <Icon className="h-5 w-5 text-[var(--brand-text-secondary)] dark:text-[var(--brand-text-secondary)]" />
  )
}

function ServiceCard({ service }: { service: Service }) {
  return (
    <div className="rounded-lg border border-[var(--brand-border)] bg-[var(--brand-surface)] p-4 dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <ServiceIcon name={service.name} />
          <div>
            <h3 className="font-semibold text-[var(--brand-text)] dark:text-white">
              {service.name}
            </h3>
            <p className="mt-1 text-sm text-[var(--brand-text-secondary)] dark:text-[var(--brand-text-secondary)]">
              {service.description}
            </p>
            {service.details && (
              <p className="mt-2 text-xs text-[var(--brand-text-secondary)] dark:text-[var(--brand-text-secondary)]">
                {service.details}
              </p>
            )}
          </div>
        </div>
        <StatusBadge status={service.status} />
      </div>
      <div className="mt-4 text-sm text-[var(--brand-text-secondary)] dark:text-[var(--brand-text-secondary)]">
        Last checked: {new Date(service.lastChecked).toLocaleTimeString('th-TH')}
      </div>
    </div>
  )
}

export default function StatusPage() {
  const [services, setServices] = useState<Service[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [pageWarning, setPageWarning] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    const load = async () => {
      setIsLoading(true)
      setPageWarning(null)

      try {
        const response = await fetch('/api/status/services', {
          cache: 'no-store',
        })

        if (!response.ok) {
          throw new Error(`Status API failed with ${response.status}`)
        }

        const payload = (await response.json()) as { services?: Service[] }

        if (!isMounted) {
          return
        }

        const nextServices = Array.isArray(payload.services) ? payload.services : []
        setServices(nextServices)

        if (nextServices.some((service) => service.status !== 'operational')) {
          setPageWarning(
            'Some services are degraded. Details below come from live server-side probes.'
          )
        }
      } catch (error) {
        if (!isMounted) {
          return
        }

        setServices([])
        setPageWarning(
          error instanceof Error ? error.message : 'Unable to load live status checks right now.'
        )
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void load()
    const timer = window.setInterval(() => {
      void load()
    }, 60_000)

    return () => {
      isMounted = false
      window.clearInterval(timer)
    }
  }, [])

  const overallStatus = useMemo<ServiceStatus>(() => {
    if (services.length === 0) {
      return isLoading ? 'maintenance' : 'degraded'
    }

    if (services.some((service) => service.status === 'outage')) {
      return 'outage'
    }

    if (services.some((service) => service.status !== 'operational')) {
      return 'degraded'
    }

    return 'operational'
  }, [isLoading, services])

  return (
    <div className="min-h-screen bg-[var(--brand-background)] dark:bg-gray-950">
      <div className="border-b border-[var(--brand-border)] bg-[var(--brand-surface)] dark:border-gray-800 dark:bg-gray-900">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-[var(--brand-text)] dark:text-white">
                System Status
              </h1>
              <p className="mt-1 text-sm text-[var(--brand-text-secondary)] dark:text-[var(--brand-text-secondary)]">
                Live status checks for SolarIQ services
              </p>
            </div>
            <StatusBadge status={overallStatus} />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {pageWarning && (
          <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {pageWarning}
          </div>
        )}

        <section>
          <h2 className="mb-4 text-lg font-semibold text-[var(--brand-text)] dark:text-white">
            Services
          </h2>
          {isLoading ? (
            <div className="rounded-lg border border-[var(--brand-border)] bg-[var(--brand-surface)] p-6 text-sm text-[var(--brand-text-secondary)] dark:border-gray-800 dark:bg-gray-900 dark:text-[var(--brand-text-secondary)]">
              Checking live service probes...
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {services.map((service) => (
                <ServiceCard key={service.name} service={service} />
              ))}
            </div>
          )}
        </section>

        <section className="mt-8">
          <h2 className="mb-4 text-lg font-semibold text-[var(--brand-text)] dark:text-white">
            History
          </h2>
          <div className="rounded-lg border border-[var(--brand-border)] bg-[var(--brand-surface)] p-6 text-sm text-[var(--brand-text-secondary)] dark:border-gray-800 dark:bg-gray-900 dark:text-[var(--brand-text-secondary)]">
            Historical uptime is not published until a dedicated monitoring backend is connected.
            This page now shows only live probes instead of synthetic uptime data.
          </div>
        </section>

        <footer className="mt-12 border-t border-[var(--brand-border)] pt-8 text-center text-sm text-[var(--brand-text-secondary)] dark:border-gray-800 dark:text-[var(--brand-text-secondary)]">
          <p>Status page refreshes every 60 seconds</p>
          <p className="mt-1">
            Need help?{' '}
            <a
              href="mailto:support@solariqapp.com"
              className="text-primary-600 hover:text-primary-700 dark:text-primary-400"
            >
              Contact Support
            </a>
          </p>
        </footer>
      </div>
    </div>
  )
}
