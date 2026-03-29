import { CardSkeleton } from '@/components/ui/Skeleton'

export default function SettingsLoading() {
  return (
    <div className="min-h-screen bg-[var(--brand-background)]/50 flex">
      {/* Sidebar placeholder */}
      <div className="hidden lg:block w-[260px] border-r border-[var(--brand-border)] bg-[var(--brand-surface)]" />
      <div className="flex-1 p-6 lg:p-8">
        <div className="space-y-6 max-w-5xl mx-auto">
          {/* Header skeleton */}
          <div>
            <div className="h-6 w-24 bg-[var(--brand-border)] rounded animate-pulse" />
            <div className="h-4 w-64 bg-[var(--brand-background)] rounded animate-pulse mt-2" />
          </div>

          {/* Tabs skeleton */}
          <div className="flex gap-4 border-b border-[var(--brand-border)] pb-px">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-4 w-20 bg-[var(--brand-border)] rounded animate-pulse mb-2.5"
              />
            ))}
          </div>

          {/* Card skeleton */}
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    </div>
  )
}
