export default function DevelopersLoading() {
  return (
    <div className="space-y-6 animate-pulse max-w-7xl">
      <div className="h-8 bg-[var(--brand-border)] rounded-lg w-48" />
      <div className="flex gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex-1 h-24 bg-[var(--brand-background)] rounded-xl" />
        ))}
      </div>
      <div className="h-64 bg-[var(--brand-background)] rounded-xl" />
    </div>
  )
}
