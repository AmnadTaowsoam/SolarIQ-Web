'use client'

import * as React from 'react'
import { ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

type Accent = 'orange' | 'green' | 'blue'

const accentStyles: Record<
  Accent,
  {
    glow: string
    ring: string
    badge: string
    button: string
    soft: string
    softText: string
  }
> = {
  orange: {
    glow: 'before:absolute before:-right-16 before:-top-16 before:h-40 before:w-40 before:rounded-full before:bg-orange-300/25 before:blur-3xl after:absolute after:-left-8 after:bottom-0 after:h-28 after:w-28 after:rounded-full after:bg-amber-200/40 after:blur-2xl',
    ring: 'border-orange-200/80 shadow-[0_24px_60px_-34px_rgba(249,115,22,0.55)]',
    badge: 'bg-orange-500/10 text-orange-700 ring-1 ring-orange-200',
    button: 'bg-orange-500 text-white hover:bg-orange-600',
    soft: 'bg-orange-50 text-orange-700 ring-1 ring-orange-100',
    softText: 'text-orange-700',
  },
  green: {
    glow: 'before:absolute before:-right-16 before:-top-16 before:h-40 before:w-40 before:rounded-full before:bg-emerald-300/25 before:blur-3xl after:absolute after:-left-8 after:bottom-0 after:h-28 after:w-28 after:rounded-full after:bg-lime-200/35 after:blur-2xl',
    ring: 'border-emerald-200/80 shadow-[0_24px_60px_-34px_rgba(16,185,129,0.45)]',
    badge: 'bg-emerald-500/10 text-emerald-700 ring-1 ring-emerald-200',
    button: 'bg-emerald-600 text-white hover:bg-emerald-700',
    soft: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100',
    softText: 'text-emerald-700',
  },
  blue: {
    glow: 'before:absolute before:-right-16 before:-top-16 before:h-40 before:w-40 before:rounded-full before:bg-sky-300/25 before:blur-3xl after:absolute after:-left-8 after:bottom-0 after:h-28 after:w-28 after:rounded-full after:bg-blue-200/35 after:blur-2xl',
    ring: 'border-sky-200/80 shadow-[0_24px_60px_-34px_rgba(59,130,246,0.4)]',
    badge: 'bg-sky-500/10 text-sky-700 ring-1 ring-sky-200',
    button: 'bg-sky-600 text-white hover:bg-sky-700',
    soft: 'bg-sky-50 text-sky-700 ring-1 ring-sky-100',
    softText: 'text-sky-700',
  },
}

export function LiffPageFrame({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'min-h-screen bg-[linear-gradient(180deg,#fff8f1_0%,#fffdf9_22%,#f8fafc_52%,#f5f7fb_100%)]',
        className
      )}
    >
      <div className="pointer-events-none fixed inset-x-0 top-0 h-56 bg-[radial-gradient(circle_at_top,_rgba(251,191,36,0.14),_transparent_62%)]" />
      <div className="pointer-events-none fixed inset-x-0 top-32 h-48 bg-[radial-gradient(circle_at_left,_rgba(249,115,22,0.08),_transparent_45%),radial-gradient(circle_at_right,_rgba(59,130,246,0.08),_transparent_42%)]" />
      <div className="relative mx-auto max-w-lg px-4 py-4">{children}</div>
    </div>
  )
}

export function LiffHeroCard({
  title,
  description,
  eyebrow,
  badge,
  accent = 'orange',
  onBack,
  children,
  className,
}: {
  title: string
  description?: string
  eyebrow?: string
  badge?: string
  accent?: Accent
  onBack?: () => void
  children?: React.ReactNode
  className?: string
}) {
  const style = accentStyles[accent]

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-[30px] border bg-white/88 p-5 backdrop-blur-sm',
        style.glow,
        style.ring,
        className
      )}
    >
      <div className="relative">
        <div className="flex items-start gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="mt-0.5 inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-white/70 bg-white/80 text-slate-700 shadow-sm transition-colors hover:bg-white"
              aria-label="Go back"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
          )}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              {eyebrow ? (
                <span
                  className={cn(
                    'inline-flex rounded-full px-3 py-1 text-[11px] font-semibold',
                    style.badge
                  )}
                >
                  {eyebrow}
                </span>
              ) : null}
              {badge ? (
                <span className="inline-flex rounded-full bg-slate-900 px-3 py-1 text-[11px] font-semibold text-white">
                  {badge}
                </span>
              ) : null}
            </div>
            <h1 className="mt-3 font-[var(--brand-font-heading)] text-[28px] font-bold leading-tight text-slate-950">
              {title}
            </h1>
            {description ? (
              <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
            ) : null}
          </div>
        </div>
        {children ? <div className="mt-5">{children}</div> : null}
      </div>
    </div>
  )
}

export function LiffMetricStrip({
  items,
  accent = 'orange',
  columns = 3,
}: {
  items: Array<{ label: string; value: string; hint?: string }>
  accent?: Accent
  columns?: 2 | 3
}) {
  const style = accentStyles[accent]

  return (
    <div className={cn('grid gap-3', columns === 2 ? 'grid-cols-2' : 'grid-cols-3')}>
      {items.map((item) => (
        <div
          key={`${item.label}-${item.value}`}
          className="rounded-2xl border border-white/80 bg-white/80 p-3 shadow-sm backdrop-blur-sm"
        >
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-slate-400">
            {item.label}
          </p>
          <p className="mt-2 text-base font-bold text-slate-950">{item.value}</p>
          {item.hint ? <p className={cn('mt-1 text-xs', style.softText)}>{item.hint}</p> : null}
        </div>
      ))}
    </div>
  )
}

export function LiffPanel({
  title,
  subtitle,
  action,
  children,
  className,
}: {
  title?: string
  subtitle?: string
  action?: React.ReactNode
  children?: React.ReactNode
  className?: string
}) {
  return (
    <section
      className={cn(
        'rounded-[26px] border border-white/75 bg-white/88 p-4 shadow-[0_18px_48px_-32px_rgba(15,23,42,0.28)] backdrop-blur-sm',
        className
      )}
    >
      {(title || subtitle || action) && (
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            {title ? (
              <h2 className="font-[var(--brand-font-heading)] text-base font-semibold text-slate-950">
                {title}
              </h2>
            ) : null}
            {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  )
}

export function LiffPill({
  children,
  tone = 'default',
  className,
}: {
  children: React.ReactNode
  tone?: 'default' | 'success' | 'warning' | 'info'
  className?: string
}) {
  const tones: Record<NonNullable<typeof tone>, string> = {
    default: 'bg-slate-100 text-slate-700 ring-1 ring-slate-200',
    success: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100',
    warning: 'bg-amber-50 text-amber-700 ring-1 ring-amber-100',
    info: 'bg-sky-50 text-sky-700 ring-1 ring-sky-100',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold',
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  )
}

export function LiffPrimaryButton({
  children,
  accent = 'orange',
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  accent?: Accent
}) {
  return (
    <button
      {...props}
      className={cn(
        'inline-flex items-center justify-center rounded-2xl px-4 py-3.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50',
        accentStyles[accent].button,
        className
      )}
    >
      {children}
    </button>
  )
}
