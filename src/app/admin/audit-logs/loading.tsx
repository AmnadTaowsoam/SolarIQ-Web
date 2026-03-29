import { CardSkeleton, TableSkeleton } from '@/components/ui/Skeleton'

export default function AuditLogsLoading() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div>
          <div className="h-7 w-48 bg-[var(--brand-border)] rounded animate-pulse" />
          <div className="h-4 w-64 bg-[var(--brand-border)] rounded animate-pulse mt-2" />
        </div>
        <div className="h-10 w-32 bg-[var(--brand-border)] rounded-lg animate-pulse" />
      </div>

      {/* Filter bar skeleton */}
      <div className="bg-[var(--brand-surface)] rounded-xl border border-[var(--brand-border)] p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i}>
              <div className="h-3 w-16 bg-[var(--brand-border)] rounded animate-pulse mb-1.5" />
              <div className="h-10 bg-[var(--brand-border)] rounded-lg animate-pulse" />
            </div>
          ))}
        </div>
      </div>

      {/* Stats cards skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>

      {/* Table + timeline skeleton */}
      <div className="flex gap-6">
        <div className="flex-1">
          <TableSkeleton rows={10} />
        </div>
        {/* Timeline sidebar skeleton */}
        <div className="hidden xl:block w-80 flex-shrink-0">
          <div className="bg-[var(--brand-surface)] rounded-xl border border-[var(--brand-border)] p-4">
            <div className="h-4 w-24 bg-[var(--brand-border)] rounded animate-pulse mb-4" />
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex gap-3 py-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[var(--brand-border)] animate-pulse mt-1 flex-shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 bg-[var(--brand-border)] rounded animate-pulse w-4/5" />
                  <div className="h-2.5 bg-[var(--brand-border)] rounded animate-pulse w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
