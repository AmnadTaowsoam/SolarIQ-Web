'use client'

interface UsageMeterProps {
  label: string
  current: number
  limit: number
  unit?: string
}

export default function UsageMeter({ label, current, limit, unit = '' }: UsageMeterProps) {
  const percentage = limit > 0 ? Math.min((current / limit) * 100, 100) : 0
  const isNearLimit = percentage >= 80
  const isOverLimit = percentage >= 100

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-gray-700">{label}</span>
        <span
          className={`text-xs ${isOverLimit ? 'text-red-600' : isNearLimit ? 'text-amber-600' : 'text-gray-500'}`}
        >
          {current.toLocaleString()} / {limit.toLocaleString()} {unit}
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
        <div
          className={`h-full rounded-full transition-all ${isOverLimit ? 'bg-red-500' : isNearLimit ? 'bg-amber-500' : 'bg-blue-500'}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
