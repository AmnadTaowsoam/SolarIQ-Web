export default function MessagesLoading() {
  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Thread list skeleton */}
      <div className="w-[300px] flex-shrink-0 bg-white border-r border-gray-100 p-4 space-y-4">
        <div className="h-6 bg-gray-200 rounded-lg w-24 animate-pulse" />
        <div className="h-9 bg-gray-100 rounded-xl animate-pulse" />
        <div className="flex gap-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-7 bg-gray-100 rounded-full flex-1 animate-pulse" />
          ))}
        </div>
        <div className="space-y-3 pt-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-start gap-3 animate-pulse">
              <div className="w-10 h-10 bg-gray-200 rounded-full flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-100 rounded w-full" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat area skeleton */}
      <div className="flex-1 bg-gray-50 flex flex-col">
        <div className="h-14 bg-white border-b border-gray-100 animate-pulse" />
        <div className="flex-1 p-4 space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
              <div className={`h-10 bg-gray-200 rounded-2xl animate-pulse ${i % 2 === 0 ? 'w-48' : 'w-40 bg-orange-100'}`} />
            </div>
          ))}
        </div>
        <div className="h-16 bg-white border-t border-gray-100 animate-pulse" />
      </div>
    </div>
  )
}
