/**
 * WK-109: Performance Optimization - Lazy-loaded Bar Chart
 */

'use client'

import dynamic from 'next/dynamic'
import { ComponentType } from 'react'

interface BarChartProps {
  data: Record<string, unknown>[]
  bars: Array<{
    dataKey: string
    fill: string
    name?: string
  }>
  width?: number | string
  height?: number | string
  showXAxis?: boolean
  showYAxis?: boolean
  showTooltip?: boolean
  showLegend?: boolean
  xAxisDataKey?: string
  className?: string
}

const BarChartComponent = dynamic(
  () => import('./BarChart').then((mod) => ({ default: mod.BarChart })),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full w-full bg-[var(--brand-background)] dark:bg-gray-800 animate-pulse">
        <div className="h-4 w-4 bg-[var(--brand-border)] dark:bg-gray-600 rounded-full animate-bounce" />
      </div>
    ),
  }
) as ComponentType<BarChartProps>

export function LazyBarChart(props: BarChartProps) {
  return <BarChartComponent {...props} />
}
