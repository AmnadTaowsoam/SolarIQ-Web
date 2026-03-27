/**
 * WK-109: Performance Optimization - Bar Chart Component
 */

'use client'

import {
  ResponsiveContainer,
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts'
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
  showCartesianGrid?: boolean
  xAxisDataKey?: string
  className?: string
}

export const BarChart: ComponentType<BarChartProps> = ({
  data,
  bars,
  width = '100%',
  height = '100%',
  showXAxis = true,
  showYAxis = true,
  showTooltip = true,
  showLegend = true,
  showCartesianGrid = true,
  xAxisDataKey = 'date',
  className = '',
}) => {
  return (
    <div className={`w-full h-full ${className}`}>
      <ResponsiveContainer width={width} height={height}>
        <RechartsBarChart data={data}>
          {showCartesianGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />}
          {showXAxis && (
            <XAxis
              dataKey={xAxisDataKey}
              stroke="#6b7280"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
          )}
          {showYAxis && <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />}
          {showTooltip && (
            <Tooltip
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              }}
              itemStyle={{ color: '#111827' }}
            />
          )}
          {showLegend && <Legend wrapperStyle={{ paddingTop: '1rem' }} iconType="rect" />}
          {bars.map((bar, index) => (
            <Bar
              key={`${bar.dataKey}-${index}`}
              dataKey={bar.dataKey}
              fill={bar.fill}
              name={bar.name}
              radius={[4, 4, 0, 0]}
              animationDuration={1000}
              animationEasing="ease-in-out"
            />
          ))}
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  )
}
