/**
 * WK-109: Performance Optimization - Lazy-loaded Line Chart
 * This component lazy-loads the recharts LineChart to reduce initial bundle size
 */

'use client'

import dynamic from 'next/dynamic'
import { ComponentType, ReactNode } from 'react'

// Types for the chart props
interface LineChartProps {
  data: Record<string, unknown>[]
  lines: Array<{
    dataKey: string
    stroke: string
    strokeWidth?: number
    type?: 'monotone' | 'linear' | 'step' | 'stepBefore' | 'stepAfter'
  }>
  width?: number | string
  height?: number | string
  showXAxis?: boolean
  showYAxis?: boolean
  showTooltip?: boolean
  showLegend?: boolean
  xAxisDataKey?: string
  className?: string
  children?: ReactNode
}

// Lazy load the actual chart component
const LineChartComponent = dynamic(
  () => import('./LineChart').then((mod) => ({ default: mod.LineChart })),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full w-full bg-[var(--brand-background)] dark:bg-gray-800 animate-pulse">
        <div className="h-4 w-4 bg-[var(--brand-border)] dark:bg-gray-600 rounded-full animate-bounce" />
      </div>
    ),
  }
) as ComponentType<LineChartProps>

export function LazyLineChart(props: LineChartProps) {
  return <LineChartComponent {...props} />
}
