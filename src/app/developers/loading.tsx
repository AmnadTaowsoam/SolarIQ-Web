export default function DevelopersLoading() {
  return (
    <div className="space-y-6 animate-pulse max-w-7xl">
      <div className="h-8 bg-gray-200 rounded-lg w-48" />
      <div className="flex gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex-1 h-24 bg-gray-100 rounded-xl" />
        ))}
      </div>
      <div className="h-64 bg-gray-100 rounded-xl" />
    </div>
  )
}
