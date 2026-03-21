import { Skeleton } from '@/components/ui/Skeleton'

export default function AnalyzeLoading() {
  return (
    <div className="min-h-screen bg-gray-50/50 flex">
      <div className="hidden lg:block w-[260px] border-r border-gray-200 bg-white" />
      <div className="flex-1 p-6 lg:p-8">
        <div className="space-y-6 max-w-7xl">
          <Skeleton className="h-6 w-36" />
          <Skeleton className="h-[400px] w-full rounded-xl" />
        </div>
      </div>
    </div>
  )
}
