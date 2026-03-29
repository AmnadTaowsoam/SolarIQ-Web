import { TableSkeleton } from '@/components/ui/Skeleton'

export default function LeadsLoading() {
  return (
    <div className="min-h-screen bg-[var(--brand-background)] flex">
      <div className="hidden lg:block w-[260px] border-r border-[var(--brand-border)] bg-[var(--brand-surface)]" />
      <div className="flex-1 p-6 lg:p-8">
        <div className="space-y-6 max-w-7xl">
          <div className="h-6 w-40 bg-[var(--brand-border)] rounded animate-pulse" />
          <TableSkeleton rows={8} />
        </div>
      </div>
    </div>
  )
}
