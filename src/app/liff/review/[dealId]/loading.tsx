// Skeleton loading state for the LIFF review page

export default function ReviewLoading() {
  return (
    <div className="min-h-screen bg-gray-50 pb-28 animate-pulse">
      {/* Header skeleton */}
      <div className="bg-orange-400 px-4 py-5 h-20">
        <div className="max-w-lg mx-auto">
          <div className="h-5 bg-orange-300 rounded w-40 mb-1.5" />
          <div className="h-3 bg-orange-300 rounded w-24" />
        </div>
      </div>

      <div className="px-4 py-5 space-y-4 max-w-lg mx-auto">
        {/* Contractor card skeleton */}
        <div className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-3">
          <div className="w-12 h-12 bg-gray-200 rounded-xl flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-36" />
            <div className="h-3 bg-gray-100 rounded w-24" />
          </div>
          <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="w-5 h-5 bg-gray-200 rounded" />
            ))}
          </div>
        </div>

        {/* Dimensions skeleton */}
        <div className="bg-white rounded-2xl p-5 shadow-sm space-y-4">
          <div className="h-5 bg-gray-200 rounded w-40 mb-4" />
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="h-4 bg-gray-200 rounded w-20" />
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((j) => (
                  <div key={j} className="w-7 h-7 bg-gray-200 rounded-full" />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Text area skeleton */}
        <div className="bg-white rounded-2xl p-5 shadow-sm space-y-3">
          <div className="h-5 bg-gray-200 rounded w-32" />
          <div className="h-24 bg-gray-100 rounded-xl" />
          <div className="h-3 bg-gray-100 rounded w-12 ml-auto" />
        </div>

        {/* Photo upload skeleton */}
        <div className="bg-white rounded-2xl p-5 shadow-sm space-y-3">
          <div className="h-5 bg-gray-200 rounded w-44" />
          <div className="h-3 bg-gray-100 rounded w-36" />
          <div className="flex gap-3">
            <div className="w-24 h-24 bg-gray-200 rounded-xl" />
            <div className="w-24 h-24 bg-gray-100 rounded-xl border-2 border-dashed border-gray-200" />
          </div>
        </div>
      </div>

      {/* Fixed bottom skeleton */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-4">
        <div className="max-w-lg mx-auto">
          <div className="w-full h-14 bg-orange-200 rounded-2xl" />
        </div>
      </div>
    </div>
  )
}
