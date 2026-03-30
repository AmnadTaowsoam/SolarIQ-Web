'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/context'
import { AppLayout } from '@/components/layout'
import { Card, CardHeader, CardBody, Badge, Button, Modal, ModalFooter } from '@/components/ui'
import { useToast } from '@/components/ui/Toast'
import { Skeleton } from '@/components/ui/Skeleton'
import { useLead, useUpdateLeadStatus, useDeleteLead } from '@/hooks'
import { ROUTES, LEAD_STATUS_COLORS, LEAD_STATUS_LABELS } from '@/lib/constants'
import { Lead, LeadStatus, FinancialAnalysis, SolarPanelConfig } from '@/types'
import { format, formatDistanceToNow } from 'date-fns'

// ---------------------------------------------------------------------------
// Pipeline definitions — 6-stage pipeline as requested
// ---------------------------------------------------------------------------

interface PipelineStep {
  key: string
  label: string
}

const PIPELINE_STEPS: PipelineStep[] = [
  { key: 'new', label: 'New' },
  { key: 'qualified', label: 'Qualified' },
  { key: 'analyzing', label: 'Analyzing' },
  { key: 'proposal', label: 'Proposal' },
  { key: 'negotiation', label: 'Negotiation' },
  { key: 'won', label: 'Won' },
]

/** Map real LeadStatus values to a pipeline step index */
const STATUS_TO_PIPELINE_INDEX: Record<string, number> = {
  new: 0,
  contacted: 1,
  qualified: 1,
  analyzing: 2,
  quoted: 3,
  proposal: 3,
  negotiation: 4,
  won: 5,
  lost: -1,
}

// ---------------------------------------------------------------------------
// Icons (inline SVGs — lucide-react is available but inline keeps the bundle lean)
// ---------------------------------------------------------------------------

function ArrowLeftIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
    </svg>
  )
}

function UserIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
      />
    </svg>
  )
}

function PhoneIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z"
      />
    </svg>
  )
}

function EnvelopeIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
      />
    </svg>
  )
}

function MapPinIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
      />
    </svg>
  )
}

function SunIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"
      />
    </svg>
  )
}

function CurrencyIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z"
      />
    </svg>
  )
}

function DocumentArrowDownIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m.75 12 3 3m0 0 3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
      />
    </svg>
  )
}

function ChatBubbleIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z"
      />
    </svg>
  )
}

function PencilIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
      />
    </svg>
  )
}

function TrashIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
      />
    </svg>
  )
}

function ClockIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
      />
    </svg>
  )
}

function CheckCircleIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
      />
    </svg>
  )
}

function LeafIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 21c-3.314 0-6-4.03-6-9S8.686 3 12 3c5.523 0 10 4.477 10 10 0 3.314-4.03 6-9 6H3"
      />
    </svg>
  )
}

function BuildingIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21"
      />
    </svg>
  )
}

function LineIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.349 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatCurrency(amount: number): string {
  return `฿${amount.toLocaleString()}`
}

function formatNumber(n: number, decimals = 0): string {
  return n.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

// ---------------------------------------------------------------------------
// Demo data — used when the API returns no data or the lead has no analysis
// ---------------------------------------------------------------------------

const DEMO_LEAD: Lead = {
  id: 'demo-001',
  name: 'คุณสมชาย ประเสริฐ',
  phone: '081-234-5678',
  email: 'somchai@thaisun.co.th',
  address: '123/45 ซอยสุขุมวิท 55 แขวงคลองตันเหนือ เขตวัฒนา กรุงเทพฯ 10110',
  latitude: 13.7363,
  longitude: 100.5618,
  monthlyBill: 8500,
  status: 'quoted',
  assignedTo: 'contractor-01',
  notes:
    'Interested in rooftop solar. Has a large flat roof area. Prefers to schedule installation on weekends.',
  createdAt: '2025-12-15T09:30:00Z',
  updatedAt: '2026-01-20T14:15:00Z',
  solarAnalysis: {
    coordinates: { latitude: 13.7363, longitude: 100.5618 },
    address: '123/45 Sukhumvit Soi 55, Klongton Nua, Wattana, Bangkok 10110',
    solarPotential: {
      maxSunshineHoursPerYear: 1825,
      carbonOffsetFactorKgPerMwh: 500,
    },
    panelConfig: {
      panelsCount: 24,
      capacityKw: 10.08,
      yearlyEnergyDcKwh: 14580,
    },
    financialAnalysis: {
      monthlySavings: 5200,
      yearlySavings: 62400,
      paybackYears: 5.8,
      roi25Year: 1210000,
      installationCost: 362000,
      netCost: 362000,
    },
    electricityRate: 4.5,
  },
}

// Extended demo fields that the Lead type does not carry
const DEMO_EXTENDED = {
  company: 'บริษัท ไทยซัน เอ็นเนอร์ยี่ จำกัด',
  lineId: '@somchai_prasert',
  peakUsageKwh: 1200,
  offPeakUsageKwh: 690,
  touRate: 5.2,
  roofAreaSqm: 65,
  irr: 18.5,
}

// ---------------------------------------------------------------------------
// Activity event types
// ---------------------------------------------------------------------------

interface ActivityEvent {
  id: string
  description: string
  date: string
  icon: 'create' | 'scan' | 'analysis' | 'proposal' | 'status' | 'note'
}

function buildActivityTimeline(lead: Lead): ActivityEvent[] {
  const events: ActivityEvent[] = []

  events.push({
    id: 'created',
    description: 'Lead created',
    date: lead.createdAt,
    icon: 'create',
  })

  if (lead.solarAnalysis) {
    const analysisDate = new Date(lead.createdAt)
    analysisDate.setMinutes(analysisDate.getMinutes() + 5)
    events.push({
      id: 'analysis',
      description: 'Solar analysis completed',
      date: analysisDate.toISOString(),
      icon: 'analysis',
    })

    analysisDate.setMinutes(analysisDate.getMinutes() + 2)
    events.push({
      id: 'proposal',
      description: 'Proposal generated automatically',
      date: analysisDate.toISOString(),
      icon: 'proposal',
    })
  }

  if (lead.status !== 'new') {
    events.push({
      id: 'status-update',
      description: `Status changed to: ${LEAD_STATUS_LABELS[lead.status as LeadStatus] ?? lead.status}`,
      date: lead.updatedAt,
      icon: 'status',
    })
  }

  return events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

function activityIconElement(icon: ActivityEvent['icon']) {
  const base = 'w-4 h-4'
  switch (icon) {
    case 'create':
      return <UserIcon className={base} />
    case 'scan':
      return <DocumentArrowDownIcon className={base} />
    case 'analysis':
      return <SunIcon className={base} />
    case 'proposal':
      return <DocumentArrowDownIcon className={base} />
    case 'status':
      return <CheckCircleIcon className={base} />
    case 'note':
      return <ChatBubbleIcon className={base} />
    default:
      return <ClockIcon className={base} />
  }
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function InfoRow({
  label,
  value,
  icon,
}: {
  label: string
  value: React.ReactNode
  icon?: React.ReactNode
}) {
  return (
    <div className="flex items-start gap-3 py-2.5">
      {icon && (
        <span className="mt-0.5 text-[var(--brand-text-secondary)] flex-shrink-0">{icon}</span>
      )}
      <div className="min-w-0">
        <dt className="text-xs font-medium text-[var(--brand-text-secondary)] uppercase tracking-wider">
          {label}
        </dt>
        <dd className="mt-0.5 text-sm text-[var(--brand-text)] break-words">
          {value || <span className="text-[var(--brand-text-secondary)]">--</span>}
        </dd>
      </div>
    </div>
  )
}

function StatBlock({
  label,
  value,
  sub,
  highlight,
}: {
  label: string
  value: string
  sub?: string
  highlight?: boolean
}) {
  return (
    <div
      className={`rounded-lg p-4 ${highlight ? 'bg-orange-50 ring-1 ring-orange-200' : 'bg-[var(--brand-background)]'}`}
    >
      <p className="text-xs font-medium text-[var(--brand-text-secondary)] uppercase tracking-wider">
        {label}
      </p>
      <p
        className={`mt-1 text-2xl font-bold ${highlight ? 'text-orange-700' : 'text-[var(--brand-text)]'}`}
      >
        {value}
      </p>
      {sub && <p className="mt-0.5 text-xs text-[var(--brand-text-secondary)]">{sub}</p>}
    </div>
  )
}

/** Horizontal savings comparison bar */
function SavingsBar({ currentBill, afterSolar }: { currentBill: number; afterSolar: number }) {
  const maxVal = Math.max(currentBill, afterSolar, 1)
  return (
    <div className="space-y-3 mt-4">
      <div>
        <div className="flex justify-between text-xs mb-1">
          <span className="text-[var(--brand-text-secondary)]">Current Monthly Bill</span>
          <span className="font-semibold text-[var(--brand-text)]">
            {formatCurrency(currentBill)}
          </span>
        </div>
        <div className="h-3 bg-[var(--brand-border)] rounded-full overflow-hidden">
          <div
            className="h-full bg-red-400 rounded-full transition-all duration-500"
            style={{ width: `${(currentBill / maxVal) * 100}%` }}
          />
        </div>
      </div>
      <div>
        <div className="flex justify-between text-xs mb-1">
          <span className="text-[var(--brand-text-secondary)]">After Solar</span>
          <span className="font-semibold text-green-700">{formatCurrency(afterSolar)}</span>
        </div>
        <div className="h-3 bg-[var(--brand-border)] rounded-full overflow-hidden">
          <div
            className="h-full bg-green-500 rounded-full transition-all duration-500"
            style={{ width: `${(afterSolar / maxVal) * 100}%` }}
          />
        </div>
      </div>
    </div>
  )
}

/** Visual pipeline bar showing 6 stages */
function PipelineBar({
  currentIndex,
  isLost,
  onStepClick,
  disabled,
}: {
  currentIndex: number
  isLost: boolean
  onStepClick: (stepKey: string) => void
  disabled: boolean
}) {
  return (
    <Card>
      <CardBody className="py-5 px-4 sm:px-6">
        {/* Desktop pipeline */}
        <div className="hidden sm:flex items-center gap-0 overflow-x-auto pb-1">
          {PIPELINE_STEPS.map((step, idx) => {
            const isCompleted = !isLost && currentIndex >= idx
            const isCurrent = !isLost && currentIndex === idx
            return (
              <div key={step.key} className="flex items-center flex-shrink-0">
                <button
                  onClick={() => onStepClick(step.key)}
                  disabled={disabled}
                  className={`
                    relative flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all
                    ${
                      isCurrent
                        ? 'bg-orange-500 text-white shadow-md shadow-orange-200'
                        : isCompleted
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-[var(--brand-background)] text-[var(--brand-text-secondary)] hover:bg-[var(--brand-border)]'
                    }
                    disabled:opacity-50
                  `}
                >
                  {isCompleted && !isCurrent && (
                    <CheckCircleIcon className="w-4 h-4 text-orange-600" />
                  )}
                  <span className="whitespace-nowrap">{step.label}</span>
                </button>
                {idx < PIPELINE_STEPS.length - 1 && (
                  <div
                    className={`w-6 lg:w-10 h-0.5 flex-shrink-0 ${
                      !isLost && currentIndex > idx ? 'bg-orange-400' : 'bg-[var(--brand-border)]'
                    }`}
                  />
                )}
              </div>
            )
          })}

          {/* Lost button -- separate */}
          <div className="ml-3 flex-shrink-0">
            <button
              onClick={() => onStepClick('lost')}
              disabled={disabled}
              className={`
                px-4 py-2.5 rounded-lg text-sm font-medium transition-all
                ${
                  isLost
                    ? 'bg-red-600 text-white shadow-md shadow-red-200'
                    : 'bg-red-500/10 text-red-600 hover:bg-red-100 border border-red-500/20'
                }
                disabled:opacity-50
              `}
            >
              Lost
            </button>
          </div>
        </div>

        {/* Mobile pipeline — compact scrollable version */}
        <div className="sm:hidden flex items-center gap-1 overflow-x-auto pb-1">
          {PIPELINE_STEPS.map((step, idx) => {
            const isCompleted = !isLost && currentIndex >= idx
            const isCurrent = !isLost && currentIndex === idx
            return (
              <div key={step.key} className="flex items-center flex-shrink-0">
                <button
                  onClick={() => onStepClick(step.key)}
                  disabled={disabled}
                  className={`
                    px-2.5 py-1.5 rounded-md text-xs font-medium transition-all
                    ${
                      isCurrent
                        ? 'bg-orange-500 text-white shadow-sm'
                        : isCompleted
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-[var(--brand-background)] text-[var(--brand-text-secondary)]'
                    }
                    disabled:opacity-50
                  `}
                >
                  {step.label}
                </button>
                {idx < PIPELINE_STEPS.length - 1 && (
                  <div
                    className={`w-3 h-0.5 flex-shrink-0 ${
                      !isLost && currentIndex > idx ? 'bg-orange-400' : 'bg-[var(--brand-border)]'
                    }`}
                  />
                )}
              </div>
            )
          })}
          <button
            onClick={() => onStepClick('lost')}
            disabled={disabled}
            className={`
              ml-1 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all flex-shrink-0
              ${isLost ? 'bg-red-600 text-white' : 'bg-red-500/10 text-red-600 border border-red-500/20'}
              disabled:opacity-50
            `}
          >
            Lost
          </button>
        </div>
      </CardBody>
    </Card>
  )
}

// ---------------------------------------------------------------------------
// Main page component
// ---------------------------------------------------------------------------

export default function LeadDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const { user, isLoading: authLoading } = useAuth()
  const { addToast } = useToast()

  const { data: apiLead, isLoading } = useLead(id)
  const updateStatusMutation = useUpdateLeadStatus()
  const deleteMutation = useDeleteLead()

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [noteText, setNoteText] = useState('')
  const [localNotes, setLocalNotes] = useState<Array<{ id: string; text: string; date: string }>>(
    []
  )

  // Use API data if available, fallback to demo data
  const lead: Lead = apiLead ?? DEMO_LEAD
  const isDemoMode = !apiLead

  // Auth guard
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace(ROUTES.LOGIN)
    }
  }, [user, authLoading, router])

  // Build the activity timeline from real data
  const activityTimeline = useMemo(() => {
    return buildActivityTimeline(lead)
  }, [lead])

  // Derive solar data
  const solar = lead.solarAnalysis ?? null
  const panel: SolarPanelConfig | null = solar?.panelConfig ?? null
  const finance: FinancialAnalysis | null = solar?.financialAnalysis ?? null

  // Electricity rate and usage estimates
  const electricityRate = solar?.electricityRate ?? 4.5
  const estMonthlyUsageKwh = lead.monthlyBill / electricityRate
  const peakUsageKwh = isDemoMode
    ? DEMO_EXTENDED.peakUsageKwh
    : Math.round(estMonthlyUsageKwh * 0.63)
  const offPeakUsageKwh = isDemoMode
    ? DEMO_EXTENDED.offPeakUsageKwh
    : Math.round(estMonthlyUsageKwh * 0.37)
  const touRate = isDemoMode ? DEMO_EXTENDED.touRate : electricityRate * 1.15

  // Solar estimates
  const roofAreaSqm = isDemoMode
    ? DEMO_EXTENDED.roofAreaSqm
    : panel
      ? Math.round(panel.panelsCount * 2.0)
      : 0

  // Carbon offset estimate: ~0.5 kg CO2 per kWh in Thailand grid
  const yearlyKwh = panel?.yearlyEnergyDcKwh ?? 0
  const co2PerYearTons = yearlyKwh > 0 ? (yearlyKwh * 0.5) / 1000 : 0
  const treesEquivalent = Math.round(co2PerYearTons / 0.022) // ~22 kg CO2 per tree per year

  // IRR estimate
  const irr = isDemoMode
    ? DEMO_EXTENDED.irr
    : finance
      ? Math.round((finance.yearlySavings / finance.installationCost) * 100 * 10) / 10
      : 0

  // Extended fields
  const company = isDemoMode ? DEMO_EXTENDED.company : null
  const lineId = isDemoMode ? DEMO_EXTENDED.lineId : null

  // Status pipeline mapping
  const currentStepIndex = STATUS_TO_PIPELINE_INDEX[lead.status] ?? -1
  const isLost = lead.status === 'lost'
  const afterSolarBill = finance ? lead.monthlyBill - finance.monthlySavings : lead.monthlyBill

  // Status update handler — maps pipeline step back to LeadStatus
  const STEP_TO_STATUS: Record<string, LeadStatus> = {
    new: 'new',
    qualified: 'contacted',
    analyzing: 'contacted',
    proposal: 'quoted',
    negotiation: 'quoted',
    won: 'won',
    lost: 'lost',
  }

  const handleStepClick = async (stepKey: string) => {
    const newStatus = STEP_TO_STATUS[stepKey]
    if (!newStatus || !lead) {
      return
    }
    try {
      await updateStatusMutation.mutateAsync({ id: lead.id, status: newStatus })
      addToast('success', `Status updated to ${LEAD_STATUS_LABELS[newStatus]}`)
    } catch {
      addToast('error', 'Failed to update status')
    }
  }

  // Delete handler
  const handleDelete = async () => {
    if (!lead) {
      return
    }
    try {
      await deleteMutation.mutateAsync(lead.id)
      addToast('success', 'Lead deleted')
      router.push(ROUTES.LEADS)
    } catch {
      addToast('error', 'Failed to delete lead')
    }
  }

  // Add note (local only — no backend endpoint)
  const handleAddNote = () => {
    const trimmed = noteText.trim()
    if (!trimmed) {
      return
    }
    setLocalNotes((prev) => [
      { id: crypto.randomUUID(), text: trimmed, date: new Date().toISOString() },
      ...prev,
    ])
    setNoteText('')
    addToast('success', 'Note added')
  }

  // ---------- Auth loading state ----------
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--brand-background)]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-orange-200 border-t-orange-600 rounded-full animate-spin" />
          <p className="text-sm text-[var(--brand-text-secondary)]">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  // ---------- Data loading state ----------
  if (isLoading) {
    return (
      <AppLayout user={user}>
        <LeadDetailSkeleton />
      </AppLayout>
    )
  }

  // ---------- Error state ----------
  // When API fails, fall back to demo data instead of showing error

  return (
    <AppLayout user={user}>
      <div className="space-y-6 max-w-[1400px]">
        {/* ============================================================== */}
        {/* DEMO MODE BANNER */}
        {/* ============================================================== */}
        {isDemoMode && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-2.5 flex items-center gap-2 text-sm">
            <svg
              className="w-4 h-4 text-amber-500 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="text-amber-800">
              Demo Mode — Showing sample data. Connect your backend API to see real data.
            </span>
          </div>
        )}

        {/* ============================================================== */}
        {/* A) HEADER */}
        {/* ============================================================== */}
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          {/* Left: back + name + company + badge */}
          <div className="flex-1 min-w-0">
            <button
              onClick={() => router.push(ROUTES.LEADS)}
              className="inline-flex items-center gap-1.5 text-sm text-[var(--brand-text-secondary)] hover:text-[var(--brand-text)] transition-colors mb-2"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              Back to Leads
            </button>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-[var(--brand-text)] truncate">{lead.name}</h1>
              {company && (
                <span className="text-sm text-[var(--brand-text-secondary)] flex items-center gap-1">
                  <BuildingIcon className="w-4 h-4" />
                  {company}
                </span>
              )}
              <Badge
                className={
                  LEAD_STATUS_COLORS[lead.status as LeadStatus] ??
                  'bg-[var(--brand-background)] text-[var(--brand-text)]'
                }
              >
                {LEAD_STATUS_LABELS[lead.status as LeadStatus] ?? lead.status}
              </Badge>
            </div>
            <p className="text-sm text-[var(--brand-text-secondary)] mt-1">
              Created {format(new Date(lead.createdAt), 'MMM dd, yyyy')} &middot; Last updated{' '}
              {formatDistanceToNow(new Date(lead.updatedAt), { addSuffix: true })}
            </p>
          </div>

          {/* Right: action buttons */}
          <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={() => addToast('info', 'Edit functionality coming soon')}
            >
              <PencilIcon className="w-4 h-4 mr-1.5" />
              Edit
            </Button>
            <Button
              size="sm"
              onClick={async () => {
                try {
                  addToast('info', 'Generating proposal...')
                  const { apiClient } = await import('@/lib/api')
                  const res = await apiClient.post(`/api/v1/proposals/generate`, {
                    lead_id: lead.id,
                    ai_summary: `Solar proposal for ${lead.name || 'customer'} - ${lead.solarAnalysis?.panelConfig?.capacityKw || 'N/A'} kWp system`,
                  })
                  if (res?.data?.url) {
                    window.open(res.data.url, '_blank')
                    addToast('success', 'Proposal generated successfully!')
                  } else {
                    addToast('success', 'Proposal generated! Check the proposals section.')
                  }
                } catch {
                  addToast('error', 'Failed to generate proposal. Please try again.')
                }
              }}
            >
              <DocumentArrowDownIcon className="w-4 h-4 mr-1.5" />
              Generate Proposal
            </Button>
            <Button variant="danger" size="sm" onClick={() => setIsDeleteModalOpen(true)}>
              <TrashIcon className="w-4 h-4 mr-1.5" />
              Delete
            </Button>
          </div>
        </div>

        {/* ============================================================== */}
        {/* B) PIPELINE STATUS BAR */}
        {/* ============================================================== */}
        <PipelineBar
          currentIndex={currentStepIndex}
          isLost={isLost}
          onStepClick={handleStepClick}
          disabled={updateStatusMutation.isPending}
        />

        {/* ============================================================== */}
        {/* MAIN CONTENT GRID */}
        {/* ============================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* =============================== */}
          {/* LEFT COLUMN (2/3) */}
          {/* =============================== */}
          <div className="lg:col-span-2 space-y-6">
            {/* C1) Customer Info Card */}
            <Card>
              <CardHeader
                title="Customer Information"
                action={
                  <Badge variant="info" size="sm">
                    {lead.assignedTo ? 'Assigned' : 'Unassigned'}
                  </Badge>
                }
              />
              <CardBody>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
                  <InfoRow
                    icon={<UserIcon className="w-4 h-4" />}
                    label="Full Name"
                    value={lead.name}
                  />
                  {company && (
                    <InfoRow
                      icon={<BuildingIcon className="w-4 h-4" />}
                      label="Company"
                      value={company}
                    />
                  )}
                  <InfoRow
                    icon={<EnvelopeIcon className="w-4 h-4" />}
                    label="Email"
                    value={
                      lead.email ? (
                        <a
                          href={`mailto:${lead.email}`}
                          className="text-orange-600 hover:underline"
                        >
                          {lead.email}
                        </a>
                      ) : null
                    }
                  />
                  <InfoRow
                    icon={<PhoneIcon className="w-4 h-4" />}
                    label="Phone"
                    value={
                      lead.phone ? (
                        <a href={`tel:${lead.phone}`} className="text-orange-600 hover:underline">
                          {lead.phone}
                        </a>
                      ) : null
                    }
                  />
                  <InfoRow
                    icon={<MapPinIcon className="w-4 h-4" />}
                    label="Address"
                    value={lead.address}
                  />
                  {lineId && (
                    <InfoRow
                      icon={<LineIcon className="w-4 h-4" />}
                      label="LINE ID"
                      value={lineId}
                    />
                  )}
                </div>
              </CardBody>
            </Card>

            {/* C2) Bill Analysis Card */}
            <Card>
              <CardHeader title="Bill Analysis" subtitle="Electricity consumption details" />
              <CardBody>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                  <StatBlock
                    label="Monthly Bill"
                    value={formatCurrency(lead.monthlyBill)}
                    sub="THB / month"
                    highlight
                  />
                  <StatBlock
                    label="Est. Usage"
                    value={`${formatNumber(estMonthlyUsageKwh)}`}
                    sub="kWh / month"
                  />
                  <StatBlock
                    label="Peak Usage"
                    value={`${formatNumber(peakUsageKwh)}`}
                    sub="kWh / month"
                  />
                  <StatBlock
                    label="Off-Peak Usage"
                    value={`${formatNumber(offPeakUsageKwh)}`}
                    sub="kWh / month"
                  />
                  <StatBlock
                    label="TOU Rate"
                    value={`฿${touRate.toFixed(2)}`}
                    sub="per kWh (peak)"
                  />
                </div>
              </CardBody>
            </Card>

            {/* C3) Solar Analysis Card */}
            <Card>
              <CardHeader
                title="Solar Analysis"
                subtitle={solar ? 'Analysis complete' : 'Analysis pending'}
                action={
                  solar ? (
                    <Badge variant="success" size="sm">
                      Complete
                    </Badge>
                  ) : (
                    <Badge variant="warning" size="sm">
                      Pending
                    </Badge>
                  )
                }
              />
              <CardBody>
                {solar ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <StatBlock
                        label="System Size"
                        value={`${panel?.capacityKw.toFixed(1) ?? '0'} kW`}
                        sub="Recommended"
                        highlight
                      />
                      <StatBlock
                        label="Panel Count"
                        value={`${panel?.panelsCount ?? 0}`}
                        sub="Solar panels"
                      />
                      <StatBlock
                        label="Annual Production"
                        value={formatNumber(panel?.yearlyEnergyDcKwh ?? 0)}
                        sub="kWh / year"
                      />
                      <StatBlock
                        label="Roof Area Needed"
                        value={`${formatNumber(roofAreaSqm)}`}
                        sub="m\u00B2 estimated"
                      />
                    </div>
                    {/* Map placeholder */}
                    {lead.latitude && lead.longitude && (
                      <div className="rounded-lg overflow-hidden border border-[var(--brand-border)] bg-[var(--brand-background)]">
                        <div className="relative aspect-[16/7] flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50">
                          <div className="text-center p-6">
                            <SunIcon className="w-10 h-10 text-orange-400 mx-auto mb-2" />
                            <p className="text-sm font-medium text-[var(--brand-text)]">
                              Roof Analysis Area
                            </p>
                            <p className="text-xs text-[var(--brand-text-secondary)] mt-1">
                              {lead.latitude.toFixed(4)}, {lead.longitude.toFixed(4)}
                            </p>
                            <a
                              href={`https://www.google.com/maps/@${lead.latitude},${lead.longitude},20z`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-3 inline-flex items-center gap-1 text-xs text-orange-600 hover:underline"
                            >
                              Open satellite view
                            </a>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <SunIcon className="w-12 h-12 text-[var(--brand-text-secondary)] mx-auto" />
                    <p className="mt-3 text-sm text-[var(--brand-text-secondary)]">
                      Solar analysis has not been completed for this lead yet.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-4"
                      onClick={() => router.push(ROUTES.ANALYZE)}
                    >
                      Run Analysis
                    </Button>
                  </div>
                )}
              </CardBody>
            </Card>

            {/* C4) ROI Summary Card */}
            <Card>
              <CardHeader
                title="ROI Summary"
                subtitle={finance ? 'Return on investment breakdown' : 'Pending solar analysis'}
              />
              <CardBody>
                {finance ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                      <StatBlock
                        label="Total Investment"
                        value={formatCurrency(finance.installationCost)}
                        sub="Estimated total"
                      />
                      <StatBlock
                        label="Monthly Savings"
                        value={formatCurrency(finance.monthlySavings)}
                        sub="THB / month"
                        highlight
                      />
                      <StatBlock
                        label="Payback Period"
                        value={`${finance.paybackYears.toFixed(1)} yrs`}
                        sub="Break-even"
                        highlight
                      />
                      <StatBlock
                        label="25-Year Savings"
                        value={formatCurrency(finance.roi25Year)}
                        sub="Total net savings"
                      />
                      <StatBlock label="IRR" value={`${irr}%`} sub="Internal Rate of Return" />
                    </div>

                    {/* Savings comparison bar */}
                    <div className="border-t border-[var(--brand-border)] pt-4">
                      <h4 className="text-sm font-semibold text-[var(--brand-text)] mb-1">
                        Monthly Bill Comparison
                      </h4>
                      <SavingsBar
                        currentBill={lead.monthlyBill}
                        afterSolar={Math.max(0, afterSolarBill)}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <CurrencyIcon className="w-12 h-12 text-[var(--brand-text-secondary)] mx-auto" />
                    <p className="mt-3 text-sm text-[var(--brand-text-secondary)]">
                      Financial analysis will be available after solar analysis is completed.
                    </p>
                  </div>
                )}
              </CardBody>
            </Card>

            {/* C5) Carbon Footprint Card */}
            <Card>
              <CardHeader
                title="Carbon Footprint"
                subtitle="Environmental impact estimates"
                action={
                  co2PerYearTons > 0 ? (
                    <Badge variant="success" size="sm">
                      <span className="flex items-center gap-1">
                        <LeafIcon className="w-3.5 h-3.5" />
                        Green
                      </span>
                    </Badge>
                  ) : null
                }
              />
              <CardBody>
                {co2PerYearTons > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <StatBlock
                      label="CO2 Reduction / Year"
                      value={`${co2PerYearTons.toFixed(1)} tons`}
                      sub="Annual carbon offset"
                      highlight
                    />
                    <StatBlock
                      label="Equivalent Trees Planted"
                      value={formatNumber(treesEquivalent)}
                      sub="Trees planted equivalent / year"
                    />
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <LeafIcon className="w-12 h-12 text-[var(--brand-text-secondary)] mx-auto" />
                    <p className="mt-3 text-sm text-[var(--brand-text-secondary)]">
                      Environmental impact data will be available after solar analysis.
                    </p>
                  </div>
                )}
              </CardBody>
            </Card>
          </div>

          {/* =============================== */}
          {/* RIGHT COLUMN (1/3) */}
          {/* =============================== */}
          <div className="space-y-6">
            {/* D1) Quick Actions */}
            <Card>
              <CardHeader title="Quick Actions" />
              <CardBody className="space-y-2.5">
                <Button
                  className="w-full justify-center"
                  onClick={async () => {
                    try {
                      addToast('info', 'Generating proposal...')
                      const { apiClient } = await import('@/lib/api')
                      const res = await apiClient.post(`/api/v1/proposals/generate`, {
                        lead_id: lead.id,
                        ai_summary: `Solar proposal for ${lead.name || 'customer'} - ${lead.solarAnalysis?.panelConfig?.capacityKw || 'N/A'} kWp system`,
                      })
                      if (res?.data?.url) {
                        window.open(res.data.url, '_blank')
                        addToast('success', 'Proposal generated!')
                      } else {
                        addToast('success', 'Proposal generated! Check proposals section.')
                      }
                    } catch {
                      addToast('error', 'Failed to generate proposal.')
                    }
                  }}
                >
                  <DocumentArrowDownIcon className="w-4 h-4 mr-2" />
                  Generate Proposal
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-center"
                  onClick={() => addToast('info', 'LINE integration coming soon')}
                >
                  <ChatBubbleIcon className="w-4 h-4 mr-2" />
                  Send via LINE
                </Button>

                {lead.phone && (
                  <a href={`tel:${lead.phone}`} className="block">
                    <Button variant="outline" className="w-full justify-center">
                      <PhoneIcon className="w-4 h-4 mr-2" />
                      Contact Customer
                    </Button>
                  </a>
                )}

                <Button
                  variant="ghost"
                  className="w-full justify-center"
                  onClick={() => addToast('info', 'Edit functionality coming soon')}
                >
                  <PencilIcon className="w-4 h-4 mr-2" />
                  Edit Lead
                </Button>
              </CardBody>
            </Card>

            {/* D2) Activity Timeline */}
            <Card>
              <CardHeader title="Activity Timeline" />
              <CardBody>
                {activityTimeline.length > 0 ? (
                  <div className="flow-root">
                    <ul className="-mb-4">
                      {activityTimeline.map((event, idx) => (
                        <li key={event.id} className="relative pb-4">
                          {idx !== activityTimeline.length - 1 && (
                            <span className="absolute top-5 left-[11px] -ml-px h-full w-0.5 bg-[var(--brand-border)]" />
                          )}
                          <div className="relative flex items-start gap-3">
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-50 text-orange-600 ring-4 ring-white">
                              {activityIconElement(event.icon)}
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm text-[var(--brand-text)]">
                                {event.description}
                              </p>
                              <p className="mt-0.5 text-xs text-[var(--brand-text-secondary)]">
                                {formatDistanceToNow(new Date(event.date), { addSuffix: true })}
                              </p>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p className="text-sm text-[var(--brand-text-secondary)] text-center py-4">
                    No activity yet
                  </p>
                )}
              </CardBody>
            </Card>

            {/* D3) Notes */}
            <Card>
              <CardHeader
                title="Notes"
                subtitle={`${localNotes.length + (lead.notes ? 1 : 0)} note(s)`}
              />
              <CardBody className="space-y-4">
                {/* Add note form */}
                <div>
                  <textarea
                    className="w-full rounded-lg border border-[var(--brand-border)] px-3 py-2 text-sm placeholder-[var(--brand-text-secondary)] focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none resize-none"
                    rows={3}
                    placeholder="Add an internal note..."
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                  />
                  <Button
                    size="sm"
                    className="mt-2"
                    onClick={handleAddNote}
                    disabled={!noteText.trim()}
                  >
                    Add Note
                  </Button>
                </div>

                {/* Notes list */}
                <div className="divide-y divide-[var(--brand-border)]">
                  {localNotes.map((note) => (
                    <div key={note.id} className="py-3">
                      <p className="text-sm text-[var(--brand-text)] whitespace-pre-wrap">
                        {note.text}
                      </p>
                      <p className="mt-1 text-xs text-[var(--brand-text-secondary)]">
                        {user.displayName || 'You'} &middot;{' '}
                        {formatDistanceToNow(new Date(note.date), { addSuffix: true })}
                      </p>
                    </div>
                  ))}
                  {lead.notes && (
                    <div className="py-3">
                      <p className="text-sm text-[var(--brand-text)] whitespace-pre-wrap">
                        {lead.notes}
                      </p>
                      <p className="mt-1 text-xs text-[var(--brand-text-secondary)]">
                        System &middot; {format(new Date(lead.createdAt), 'MMM dd, yyyy')}
                      </p>
                    </div>
                  )}
                  {localNotes.length === 0 && !lead.notes && (
                    <p className="text-sm text-[var(--brand-text-secondary)] text-center py-2">
                      No notes yet
                    </p>
                  )}
                </div>
              </CardBody>
            </Card>
          </div>
        </div>

        {/* ============================================================== */}
        {/* DELETE CONFIRMATION MODAL */}
        {/* ============================================================== */}
        <Modal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          title="Delete Lead"
          size="sm"
        >
          <div className="space-y-3">
            <p className="text-sm text-[var(--brand-text-secondary)]">
              Are you sure you want to delete <strong>{lead.name}</strong>? This action cannot be
              undone.
            </p>
          </div>
          <ModalFooter>
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete} isLoading={deleteMutation.isPending}>
              Delete Lead
            </Button>
          </ModalFooter>
        </Modal>
      </div>
    </AppLayout>
  )
}

// ---------------------------------------------------------------------------
// Loading skeleton component (inline, used when data is loading)
// ---------------------------------------------------------------------------

function LeadDetailSkeleton() {
  return (
    <div className="space-y-6 max-w-[1400px]">
      {/* Top bar skeleton */}
      <div>
        <Skeleton className="h-4 w-28 mb-3" />
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-6 w-24 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
        <Skeleton className="h-4 w-64 mt-2" />
      </div>

      {/* Pipeline skeleton */}
      <div className="bg-[var(--brand-surface)] rounded-xl border border-[var(--brand-border)] p-5">
        <div className="flex items-center gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center">
              <Skeleton className="h-10 w-24 rounded-lg" />
              {i < 5 && <Skeleton className="h-0.5 w-8 mx-1" />}
            </div>
          ))}
        </div>
      </div>

      {/* Content grid skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer info */}
          <div className="bg-[var(--brand-surface)] rounded-xl border border-[var(--brand-border)]">
            <div className="px-6 py-4 border-b border-[var(--brand-border)]">
              <Skeleton className="h-5 w-44" />
            </div>
            <div className="px-6 py-4 grid grid-cols-2 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-start gap-3">
                  <Skeleton className="h-4 w-4 mt-1 rounded" />
                  <div className="space-y-1.5">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bill analysis */}
          <div className="bg-[var(--brand-surface)] rounded-xl border border-[var(--brand-border)]">
            <div className="px-6 py-4 border-b border-[var(--brand-border)]">
              <Skeleton className="h-5 w-28" />
            </div>
            <div className="px-6 py-4 grid grid-cols-5 gap-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="bg-[var(--brand-background)] rounded-lg p-4 space-y-2">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-3 w-14" />
                </div>
              ))}
            </div>
          </div>

          {/* Solar analysis */}
          <div className="bg-[var(--brand-surface)] rounded-xl border border-[var(--brand-border)]">
            <div className="px-6 py-4 border-b border-[var(--brand-border)]">
              <Skeleton className="h-5 w-32" />
            </div>
            <div className="px-6 py-4 grid grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-[var(--brand-background)] rounded-lg p-4 space-y-2">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-3 w-14" />
                </div>
              ))}
            </div>
          </div>

          {/* ROI */}
          <div className="bg-[var(--brand-surface)] rounded-xl border border-[var(--brand-border)]">
            <div className="px-6 py-4 border-b border-[var(--brand-border)]">
              <Skeleton className="h-5 w-28" />
            </div>
            <div className="px-6 py-4 grid grid-cols-5 gap-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="bg-[var(--brand-background)] rounded-lg p-4 space-y-2">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-3 w-14" />
                </div>
              ))}
            </div>
          </div>

          {/* Carbon */}
          <div className="bg-[var(--brand-surface)] rounded-xl border border-[var(--brand-border)]">
            <div className="px-6 py-4 border-b border-[var(--brand-border)]">
              <Skeleton className="h-5 w-36" />
            </div>
            <div className="px-6 py-4 grid grid-cols-2 gap-4">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="bg-[var(--brand-background)] rounded-lg p-4 space-y-2">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-8 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Quick actions */}
          <div className="bg-[var(--brand-surface)] rounded-xl border border-[var(--brand-border)]">
            <div className="px-6 py-4 border-b border-[var(--brand-border)]">
              <Skeleton className="h-5 w-28" />
            </div>
            <div className="px-6 py-4 space-y-2.5">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full rounded-lg" />
              ))}
            </div>
          </div>

          {/* Activity timeline */}
          <div className="bg-[var(--brand-surface)] rounded-xl border border-[var(--brand-border)]">
            <div className="px-6 py-4 border-b border-[var(--brand-border)]">
              <Skeleton className="h-5 w-36" />
            </div>
            <div className="px-6 py-4 space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-start gap-3">
                  <Skeleton className="h-6 w-6 rounded-full flex-shrink-0" />
                  <div className="space-y-1 flex-1">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="bg-[var(--brand-surface)] rounded-xl border border-[var(--brand-border)]">
            <div className="px-6 py-4 border-b border-[var(--brand-border)]">
              <Skeleton className="h-5 w-16" />
            </div>
            <div className="px-6 py-4 space-y-3">
              <Skeleton className="h-20 w-full rounded-lg" />
              <Skeleton className="h-8 w-24 rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
