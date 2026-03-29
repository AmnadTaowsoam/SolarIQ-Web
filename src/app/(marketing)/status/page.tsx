import {
  CheckCircle2,
  AlertCircle,
  XCircle,
  Clock,
  Activity,
  Server,
  Database,
  Globe,
  MessageSquare,
  CreditCard,
} from 'lucide-react'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type ServiceStatus = 'operational' | 'degraded' | 'outage' | 'maintenance'

interface Service {
  name: string
  status: ServiceStatus
  description: string
  lastChecked: string
  uptime: number
}

interface Incident {
  id: string
  title: string
  status: 'investigating' | 'identified' | 'monitoring' | 'resolved'
  severity: 'critical' | 'major' | 'minor'
  startedAt: string
  updates: Array<{
    time: string
    message: string
  }>
}

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

// In production, this data should be fetched from an API
// For now, using mock data that will be replaced with real monitoring
const services: Service[] = [
  {
    name: 'Frontend Website',
    status: 'operational',
    description: 'Public website at www.solariqapp.com',
    lastChecked: new Date().toISOString(),
    uptime: 99.9,
  },
  {
    name: 'Backend API',
    status: 'operational',
    description: 'REST API at api.solariqapp.com',
    lastChecked: new Date().toISOString(),
    uptime: 99.8,
  },
  {
    name: 'Database (Cloud SQL)',
    status: 'operational',
    description: 'PostgreSQL database cluster',
    lastChecked: new Date().toISOString(),
    uptime: 100,
  },
  {
    name: 'Redis Cache',
    status: 'operational',
    description: 'Memorystore for session and caching',
    lastChecked: new Date().toISOString(),
    uptime: 100,
  },
  {
    name: 'LINE Messaging API',
    status: 'operational',
    description: 'LINE webhook and message delivery',
    lastChecked: new Date().toISOString(),
    uptime: 99.9,
  },
  {
    name: 'Payment Processing',
    status: 'operational',
    description: 'Stripe/Opn Payments integration',
    lastChecked: new Date().toISOString(),
    uptime: 99.5,
  },
  {
    name: 'Google Solar API',
    status: 'operational',
    description: 'External API for solar analysis',
    lastChecked: new Date().toISOString(),
    uptime: 99.9,
  },
  {
    name: 'AI Services (Gemini)',
    status: 'operational',
    description: 'Google Gemini for AI-powered features',
    lastChecked: new Date().toISOString(),
    uptime: 99.7,
  },
]

const incidents: Incident[] = [
  // Add active incidents here when they occur
  // Example:
  // {
  //   id: 'INC-2024-001',
  //   title: 'Elevated latency on Backend API',
  //   status: 'monitoring',
  //   severity: 'minor',
  //   startedAt: '2024-03-27T10:00:00Z',
  //   updates: [
  //     {
  //       time: '2024-03-27T10:00:00Z',
  //       message: 'We are investigating elevated latency on the Backend API.',
  //     },
  //     {
  //       time: '2024-03-27T10:15:00Z',
  //       message: 'The issue has been identified and a fix is being deployed.',
  //     },
  //     {
  //       time: '2024-03-27T10:30:00Z',
  //       message: 'The fix has been deployed and we are monitoring the situation.',
  //     },
  //   ],
  // },
]

const overallStatus: ServiceStatus = services.every((s) => s.status === 'operational')
  ? 'operational'
  : services.some((s) => s.status === 'outage')
    ? 'outage'
    : 'degraded'

/* ------------------------------------------------------------------ */
/*  Components                                                         */
/* ------------------------------------------------------------------ */

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
      className: 'bg-red-100 text-red-400 dark:bg-red-900/30 dark:text-red-400',
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
    'Database (Cloud SQL)': Database,
    'Redis Cache': Activity,
    'LINE Messaging API': MessageSquare,
    'Payment Processing': CreditCard,
    'Google Solar API': Globe,
    'AI Services (Gemini)': Activity,
  }

  const Icon = iconMap[name] || Server
  return (
    <Icon className="h-5 w-5 text-[var(--brand-text-secondary)] dark:text-[var(--brand-text-secondary)]" />
  )
}

function ServiceCard({ service }: { service: Service }) {
  return (
    <div className="rounded-lg border border-[var(--brand-border)] bg-[var(--brand-surface)] p-4 dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <ServiceIcon name={service.name} />
          <div>
            <h3 className="font-semibold text-[var(--brand-text)] dark:text-white">
              {service.name}
            </h3>
            <p className="mt-1 text-sm text-[var(--brand-text-secondary)] dark:text-[var(--brand-text-secondary)]">
              {service.description}
            </p>
          </div>
        </div>
        <StatusBadge status={service.status} />
      </div>
      <div className="mt-4 flex items-center justify-between text-sm text-[var(--brand-text-secondary)] dark:text-[var(--brand-text-secondary)]">
        <span>Uptime: {service.uptime.toFixed(1)}%</span>
        <span>Last checked: {new Date(service.lastChecked).toLocaleTimeString('th-TH')}</span>
      </div>
    </div>
  )
}

function IncidentCard({ incident }: { incident: Incident }) {
  const severityConfig = {
    critical: 'border-red-500 bg-red-500/10 dark:bg-red-900/10',
    major: 'border-amber-500 bg-amber-50 dark:bg-amber-900/10',
    minor: 'border-blue-500 bg-blue-500/10 dark:bg-blue-900/10',
  }

  const statusConfig = {
    investigating: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
    identified: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
    monitoring: 'bg-blue-500/10 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    resolved: 'bg-green-500/10 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  }

  return (
    <div className={`rounded-lg border-l-4 p-4 ${severityConfig[incident.severity]}`}>
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium uppercase">
              {incident.severity}
            </span>
            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusConfig[incident.status]}`}
            >
              {incident.status}
            </span>
          </div>
          <h3 className="mt-2 font-semibold text-[var(--brand-text)] dark:text-white">
            {incident.title}
          </h3>
        </div>
        <span className="text-sm text-[var(--brand-text-secondary)] dark:text-[var(--brand-text-secondary)]">
          {new Date(incident.startedAt).toLocaleString('th-TH')}
        </span>
      </div>
      <div className="mt-4 space-y-3">
        {incident.updates.map((update, idx) => (
          <div key={idx} className="flex gap-3 text-sm">
            <span className="text-[var(--brand-text-secondary)] dark:text-[var(--brand-text-secondary)]">
              {new Date(update.time).toLocaleString('th-TH')}
            </span>
            <span className="text-[var(--brand-text)] dark:text-[var(--brand-text-secondary)]">
              {update.message}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function StatusPage() {
  return (
    <div className="min-h-screen bg-[var(--brand-background)] dark:bg-gray-950">
      {/* Header */}
      <div className="border-b border-[var(--brand-border)] bg-[var(--brand-surface)] dark:border-gray-800 dark:bg-gray-900">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[var(--brand-text)] dark:text-white">
                System Status
              </h1>
              <p className="mt-1 text-sm text-[var(--brand-text-secondary)] dark:text-[var(--brand-text-secondary)]">
                Real-time status of SolarIQ services
              </p>
            </div>
            <StatusBadge status={overallStatus} />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Active Incidents */}
        {incidents.length > 0 && (
          <section className="mb-8">
            <h2 className="mb-4 text-lg font-semibold text-[var(--brand-text)] dark:text-white">
              Active Incidents
            </h2>
            <div className="space-y-4">
              {incidents.map((incident) => (
                <IncidentCard key={incident.id} incident={incident} />
              ))}
            </div>
          </section>
        )}

        {/* Services Status */}
        <section>
          <h2 className="mb-4 text-lg font-semibold text-[var(--brand-text)] dark:text-white">
            Services
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {services.map((service) => (
              <ServiceCard key={service.name} service={service} />
            ))}
          </div>
        </section>

        {/* Uptime History */}
        <section className="mt-8">
          <h2 className="mb-4 text-lg font-semibold text-[var(--brand-text)] dark:text-white">
            Uptime History (Last 90 Days)
          </h2>
          <div className="rounded-lg border border-[var(--brand-border)] bg-[var(--brand-surface)] p-6 dark:border-gray-800 dark:bg-gray-900">
            <div className="flex gap-1">
              {Array.from({ length: 90 }).map((_, i) => {
                // In production, this would be real uptime data
                const isDown = Math.random() > 0.995
                return (
                  <div
                    key={i}
                    className={`h-8 flex-1 rounded-sm ${isDown ? 'bg-red-500' : 'bg-green-500'}`}
                    title={isDown ? 'Outage' : 'Operational'}
                  />
                )
              })}
            </div>
            <div className="mt-4 flex items-center justify-between text-sm text-[var(--brand-text-secondary)] dark:text-[var(--brand-text-secondary)]">
              <span>90 days ago</span>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <div className="h-3 w-3 rounded-sm bg-green-500" />
                  <span>Operational</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-3 w-3 rounded-sm bg-red-500" />
                  <span>Outage</span>
                </div>
              </div>
              <span>Today</span>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-12 border-t border-[var(--brand-border)] pt-8 text-center text-sm text-[var(--brand-text-secondary)] dark:border-gray-800 dark:text-[var(--brand-text-secondary)]">
          <p>Status page updated every 1 minute</p>
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

/* ------------------------------------------------------------------ */
/*  Metadata                                                           */
/* ------------------------------------------------------------------ */

export const metadata = {
  title: 'System Status - SolarIQ',
  description: 'Real-time status of SolarIQ services and infrastructure',
}
