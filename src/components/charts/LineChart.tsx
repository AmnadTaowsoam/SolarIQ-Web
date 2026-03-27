/**
 * WK-109: Performance Optimization - Line Chart Component
 * This component uses recharts for line visualization
 */

'use client'

import {
  ResponsiveContainer,
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts'
import { ComponentType, ReactNode } from 'react'

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
  showCartesianGrid?: boolean
  xAxisDataKey?: string
  className?: string
  children?: ReactNode
}

export const LineChart: ComponentType<LineChartProps> = ({
  data,
  lines,
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
        <RechartsLineChart data={data}>
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
          {showLegend && <Legend wrapperStyle={{ paddingTop: '1rem' }} iconType="circle" />}
          {lines.map((line, index) => (
            <Line
              key={`${line.dataKey}-${index}`}
              type={line.type || 'monotone'}
              dataKey={line.dataKey}
              stroke={line.stroke}
              strokeWidth={line.strokeWidth || 2}
              dot={false}
              activeDot={{ r: 4 }}
              animationDuration={1000}
              animationEasing="ease-in-out"
            />
          ))}
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  )
}
