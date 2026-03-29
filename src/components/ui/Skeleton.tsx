'use client'

import clsx from 'clsx'

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={clsx('animate-pulse rounded-lg bg-[var(--brand-border)]', className)}
      {...props}
    />
  )
}

export function CardSkeleton() {
  return (
    <div className="bg-[var(--brand-surface)] rounded-xl border border-[var(--brand-border)] p-5">
      <Skeleton className="h-3 w-24 mb-3" />
      <Skeleton className="h-8 w-16 mb-2" />
      <Skeleton className="h-3 w-32" />
    </div>
  )
}

export function ChartSkeleton() {
  return (
    <div className="bg-[var(--brand-surface)] rounded-xl border border-[var(--brand-border)] p-6">
      <Skeleton className="h-5 w-40 mb-1" />
      <Skeleton className="h-3 w-24 mb-6" />
      <div className="flex items-end gap-2 h-48">
        {Array.from({ length: 12 }).map((_, i) => (
          <Skeleton
            key={i}
            className="flex-1 rounded-t-md"
            style={{ height: `${20 + Math.random() * 80}%` }}
          />
        ))}
      </div>
    </div>
  )
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="bg-[var(--brand-surface)] rounded-xl border border-[var(--brand-border)]">
      <div className="px-6 py-4 border-b border-[var(--brand-border)]">
        <Skeleton className="h-5 w-32" />
      </div>
      <div className="divide-y divide-[var(--brand-border)]">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-6 py-3.5">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3.5 w-32" />
              <Skeleton className="h-3 w-20" />
            </div>
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-3.5 w-20" />
          </div>
        ))}
      </div>
    </div>
  )
}
