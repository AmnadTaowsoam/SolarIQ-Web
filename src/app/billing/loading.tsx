import { CardSkeleton, Skeleton } from '@/components/ui/Skeleton'

export default function BillingLoading() {
  return (
    <div className="min-h-screen bg-[var(--brand-background)]/50 flex">
      <div className="hidden lg:block w-[260px] border-r border-[var(--brand-border)] bg-[var(--brand-surface)]" />
      <div className="flex-1 p-6 lg:p-8">
        <div className="space-y-6 max-w-7xl">
          <Skeleton className="h-6 w-48" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        </div>
      </div>
    </div>
  )
}
