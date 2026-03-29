import { Skeleton } from '@/components/ui/Skeleton'

export default function LeadDetailLoading() {
  return (
    <div className="min-h-screen bg-[var(--brand-background)]">
      <div className="p-4 lg:p-6 xl:p-8 max-w-[1400px] mx-auto space-y-6">
        {/* Header skeleton */}
        <div>
          <Skeleton className="h-4 w-28 mb-3" />
          <div className="flex flex-col sm:flex-row sm:items-start gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
              <Skeleton className="h-4 w-64 mt-2" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-9 w-20 rounded-lg" />
              <Skeleton className="h-9 w-40 rounded-lg" />
              <Skeleton className="h-9 w-22 rounded-lg" />
            </div>
          </div>
        </div>

        {/* Pipeline skeleton — 6 stages + Lost */}
        <div className="bg-[var(--brand-surface)] rounded-xl border border-[var(--brand-border)] p-5">
          <div className="flex items-center gap-0">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center flex-shrink-0">
                <Skeleton className="h-10 w-24 rounded-lg" />
                {i < 5 && <Skeleton className="h-0.5 w-8" />}
              </div>
            ))}
            <Skeleton className="h-10 w-16 rounded-lg ml-3" />
          </div>
        </div>

        {/* Content grid skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column (2/3) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Info card */}
            <div className="bg-[var(--brand-surface)] rounded-xl border border-[var(--brand-border)]">
              <div className="px-6 py-4 border-b border-[var(--brand-border)] flex items-center justify-between">
                <Skeleton className="h-5 w-44" />
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>
              <div className="px-6 py-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex items-start gap-3 py-2">
                    <Skeleton className="h-4 w-4 mt-1 rounded flex-shrink-0" />
                    <div className="space-y-1.5 flex-1">
                      <Skeleton className="h-3 w-20" />
                      <Skeleton className="h-4 w-36" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bill Analysis card — 5 stat blocks */}
            <div className="bg-[var(--brand-surface)] rounded-xl border border-[var(--brand-border)]">
              <div className="px-6 py-4 border-b border-[var(--brand-border)]">
                <Skeleton className="h-5 w-28" />
                <Skeleton className="h-3 w-48 mt-1" />
              </div>
              <div className="px-6 py-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="bg-[var(--brand-background)] rounded-lg p-4 space-y-2">
                      <Skeleton className="h-3 w-16" />
                      <Skeleton className="h-8 w-20" />
                      <Skeleton className="h-3 w-14" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Solar Analysis card — 4 stat blocks + map placeholder */}
            <div className="bg-[var(--brand-surface)] rounded-xl border border-[var(--brand-border)]">
              <div className="px-6 py-4 border-b border-[var(--brand-border)] flex items-center justify-between">
                <div>
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-3 w-28 mt-1" />
                </div>
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>
              <div className="px-6 py-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="bg-[var(--brand-background)] rounded-lg p-4 space-y-2">
                      <Skeleton className="h-3 w-16" />
                      <Skeleton className="h-8 w-20" />
                      <Skeleton className="h-3 w-14" />
                    </div>
                  ))}
                </div>
                <Skeleton className="h-32 w-full rounded-lg mt-4" />
              </div>
            </div>

            {/* ROI Summary card — 5 stat blocks + savings bar */}
            <div className="bg-[var(--brand-surface)] rounded-xl border border-[var(--brand-border)]">
              <div className="px-6 py-4 border-b border-[var(--brand-border)]">
                <Skeleton className="h-5 w-28" />
                <Skeleton className="h-3 w-52 mt-1" />
              </div>
              <div className="px-6 py-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="bg-[var(--brand-background)] rounded-lg p-4 space-y-2">
                      <Skeleton className="h-3 w-16" />
                      <Skeleton className="h-8 w-20" />
                      <Skeleton className="h-3 w-14" />
                    </div>
                  ))}
                </div>
                <div className="mt-6 pt-4 border-t border-[var(--brand-border)] space-y-3">
                  <Skeleton className="h-4 w-40" />
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-full rounded-full" />
                    <Skeleton className="h-3 w-3/4 rounded-full" />
                  </div>
                </div>
              </div>
            </div>

            {/* Carbon Footprint card — 2 stat blocks */}
            <div className="bg-[var(--brand-surface)] rounded-xl border border-[var(--brand-border)]">
              <div className="px-6 py-4 border-b border-[var(--brand-border)] flex items-center justify-between">
                <div>
                  <Skeleton className="h-5 w-36" />
                  <Skeleton className="h-3 w-48 mt-1" />
                </div>
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
              <div className="px-6 py-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="bg-[var(--brand-background)] rounded-lg p-4 space-y-2">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-8 w-24" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right column (1/3) */}
          <div className="space-y-6">
            {/* Quick Actions */}
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

            {/* Activity Timeline */}
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
                <Skeleton className="h-3 w-20 mt-1" />
              </div>
              <div className="px-6 py-4 space-y-3">
                <Skeleton className="h-20 w-full rounded-lg" />
                <Skeleton className="h-8 w-24 rounded-lg" />
                <div className="border-t border-[var(--brand-border)] pt-3 space-y-3">
                  <div>
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4 mt-1" />
                    <Skeleton className="h-3 w-32 mt-2" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
