/**
 * WK-109: Performance Optimization - Lazy-loaded Area Chart
 */

'use client'

import dynamic from 'next/dynamic'
import { ComponentType } from 'react'

interface AreaChartProps {
  data: Record<string, unknown>[]
  areas: Array<{
    dataKey: string
    fill: string
    stroke?: string
    strokeWidth?: number
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

const AreaChartComponent = dynamic(() => import('./AreaChart'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full w-full bg-gray-100 dark:bg-gray-800 animate-pulse">
      <div className="h-4 w-4 bg-gray-300 dark:bg-gray-600 rounded-full animate-bounce" />
    </div>
  ),
}) as ComponentType<AreaChartProps>

export function LazyAreaChart(props: AreaChartProps) {
  return <AreaChartComponent {...props} />
}
