'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home,
  LayoutDashboard,
  BarChart3,
  Users,
  Settings,
  CreditCard,
  Briefcase,
  MessageSquare,
  Code,
  Shield,
  Sun,
  BookOpen,
  Tag,
  TrendingUp,
  FileText,
  Percent,
  MapPin,
  Key,
  ChevronRight,
} from 'lucide-react'
import { extractLocaleFromPath } from '@/lib/locale'

const LABELS: Record<string, string> = {
  dashboard: 'Dashboard',
  analytics: 'Analytics',
  leads: 'Leads',
  deals: 'Deals',
  analyze: 'Solar Analysis',
  knowledge: 'Knowledge Base',
  pricing: 'Pricing',
  billing: 'Billing',
  commissions: 'Commissions',
  invoices: 'Invoices',
  settings: 'Settings',
  'service-area': 'Service Area',
  sessions: 'Sessions',
  developers: 'Developer Portal',
  keys: 'API Keys',
  webhooks: 'Webhooks',
  usage: 'Usage',
  sandbox: 'Sandbox',
  admin: 'Admin',
  revenue: 'Revenue',
  forecast: 'Forecast',
  'audit-logs': 'Audit Logs',
  reports: 'Reports',
  messages: 'Messages',
  assignments: 'Assignments',
  requests: 'Requests',
  quote: 'Quote',
  preview: 'Preview',
}

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  dashboard: LayoutDashboard,
  analytics: BarChart3,
  leads: Users,
  deals: Briefcase,
  messages: MessageSquare,
  analyze: Sun,
  knowledge: BookOpen,
  pricing: Tag,
  billing: CreditCard,
  commissions: Percent,
  invoices: FileText,
  settings: Settings,
  'service-area': MapPin,
  sessions: Key,
  developers: Code,
  admin: Shield,
  revenue: TrendingUp,
  'audit-logs': Shield,
  reports: BarChart3,
}

function looksLikeId(segment: string): boolean {
  return /^[0-9a-f]{8,}$/i.test(segment) || /^[0-9]+$/.test(segment)
}

function toLabel(segment: string): string {
  if (looksLikeId(segment)) {
    return `#${segment.slice(0, 8)}`
  }
  return LABELS[segment] ?? segment.replace(/-/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase())
}

export function Breadcrumbs() {
  const pathname = usePathname()
  const { pathname: cleanPath } = extractLocaleFromPath(pathname)
  const segments = cleanPath.split('/').filter(Boolean)

  if (segments.length === 0) return null

  const crumbs = segments.map((segment, index) => ({
    segment,
    label: toLabel(segment),
    href: `/${segments.slice(0, index + 1).join('/')}`,
    isCurrent: index === segments.length - 1,
  }))

  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <ol className="flex flex-wrap items-center gap-1.5 text-sm">
        <li>
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 text-[var(--brand-text-secondary)] hover:text-[var(--brand-primary)] transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Home</span>
          </Link>
        </li>
        {crumbs.map((crumb) => {
          const Icon = ICONS[crumb.segment]
          return (
            <li key={crumb.href} className="flex items-center gap-1.5">
              <ChevronRight className="w-3.5 h-3.5 text-[var(--brand-text-secondary)]/50" />
              {crumb.isCurrent ? (
                <span className="flex items-center gap-1.5 font-medium text-[var(--brand-text)]">
                  {Icon && <Icon className="w-3.5 h-3.5" />}
                  {crumb.label}
                </span>
              ) : (
                <Link
                  href={crumb.href}
                  className="flex items-center gap-1.5 text-[var(--brand-text-secondary)] hover:text-[var(--brand-primary)] transition-colors"
                >
                  {Icon && <Icon className="w-3.5 h-3.5" />}
                  {crumb.label}
                </Link>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
