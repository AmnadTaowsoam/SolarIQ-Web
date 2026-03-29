import { CardSkeleton, ChartSkeleton, TableSkeleton } from '@/components/ui/Skeleton'

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-[var(--brand-background)] flex">
      {/* Sidebar placeholder */}
      <div className="hidden lg:block w-[260px] border-r border-[var(--brand-border)] bg-[var(--brand-surface)]" />
      <div className="flex-1 p-6 lg:p-8">
        <div className="space-y-6 max-w-7xl">
          <div className="h-6 w-32 bg-[var(--brand-border)] rounded animate-pulse" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ChartSkeleton />
            <ChartSkeleton />
          </div>
          <TableSkeleton rows={5} />
        </div>
      </div>
    </div>
  )
}
