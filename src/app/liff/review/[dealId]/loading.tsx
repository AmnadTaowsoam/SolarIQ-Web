// Skeleton loading state for the LIFF review page

export default function ReviewLoading() {
  return (
    <div className="min-h-screen bg-[var(--brand-background)] pb-28 animate-pulse">
      {/* Header skeleton */}
      <div className="bg-orange-400 px-4 py-5 h-20">
        <div className="max-w-lg mx-auto">
          <div className="h-5 bg-orange-300 rounded w-40 mb-1.5" />
          <div className="h-3 bg-orange-300 rounded w-24" />
        </div>
      </div>

      <div className="px-4 py-5 space-y-4 max-w-lg mx-auto">
        {/* Contractor card skeleton */}
        <div className="bg-[var(--brand-surface)] rounded-2xl p-4 shadow-sm flex items-center gap-3">
          <div className="w-12 h-12 bg-[var(--brand-border)] rounded-xl flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-[var(--brand-border)] rounded w-36" />
            <div className="h-3 bg-[var(--brand-background)] rounded w-24" />
          </div>
          <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="w-5 h-5 bg-[var(--brand-border)] rounded" />
            ))}
          </div>
        </div>

        {/* Dimensions skeleton */}
        <div className="bg-[var(--brand-surface)] rounded-2xl p-5 shadow-sm space-y-4">
          <div className="h-5 bg-[var(--brand-border)] rounded w-40 mb-4" />
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="h-4 bg-[var(--brand-border)] rounded w-20" />
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((j) => (
                  <div key={j} className="w-7 h-7 bg-[var(--brand-border)] rounded-full" />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Text area skeleton */}
        <div className="bg-[var(--brand-surface)] rounded-2xl p-5 shadow-sm space-y-3">
          <div className="h-5 bg-[var(--brand-border)] rounded w-32" />
          <div className="h-24 bg-[var(--brand-background)] rounded-xl" />
          <div className="h-3 bg-[var(--brand-background)] rounded w-12 ml-auto" />
        </div>

        {/* Photo upload skeleton */}
        <div className="bg-[var(--brand-surface)] rounded-2xl p-5 shadow-sm space-y-3">
          <div className="h-5 bg-[var(--brand-border)] rounded w-44" />
          <div className="h-3 bg-[var(--brand-background)] rounded w-36" />
          <div className="flex gap-3">
            <div className="w-24 h-24 bg-[var(--brand-border)] rounded-xl" />
            <div className="w-24 h-24 bg-[var(--brand-background)] rounded-xl border-2 border-dashed border-[var(--brand-border)]" />
          </div>
        </div>
      </div>

      {/* Fixed bottom skeleton */}
      <div className="fixed bottom-0 left-0 right-0 bg-[var(--brand-surface)] border-t border-[var(--brand-border)] px-4 py-4">
        <div className="max-w-lg mx-auto">
          <div className="w-full h-14 bg-orange-200 rounded-2xl" />
        </div>
      </div>
    </div>
  )
}
