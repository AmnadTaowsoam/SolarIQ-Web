export default function MessagesLoading() {
  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Thread list skeleton */}
      <div className="w-[300px] flex-shrink-0 bg-[var(--brand-surface)] border-r border-[var(--brand-border)] p-4 space-y-4">
        <div className="h-6 bg-[var(--brand-border)] rounded-lg w-24 animate-pulse" />
        <div className="h-9 bg-[var(--brand-background)] rounded-xl animate-pulse" />
        <div className="flex gap-2">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-7 bg-[var(--brand-background)] rounded-full flex-1 animate-pulse"
            />
          ))}
        </div>
        <div className="space-y-3 pt-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-start gap-3 animate-pulse">
              <div className="w-10 h-10 bg-[var(--brand-border)] rounded-full flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-[var(--brand-border)] rounded w-3/4" />
                <div className="h-3 bg-[var(--brand-background)] rounded w-full" />
                <div className="h-3 bg-[var(--brand-background)] rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat area skeleton */}
      <div className="flex-1 bg-[var(--brand-background)] flex flex-col">
        <div className="h-14 bg-[var(--brand-surface)] border-b border-[var(--brand-border)] animate-pulse" />
        <div className="flex-1 p-4 space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
              <div
                className={`h-10 bg-[var(--brand-border)] rounded-2xl animate-pulse ${i % 2 === 0 ? 'w-48' : 'w-40 bg-orange-100'}`}
              />
            </div>
          ))}
        </div>
        <div className="h-16 bg-[var(--brand-surface)] border-t border-[var(--brand-border)] animate-pulse" />
      </div>
    </div>
  )
}
