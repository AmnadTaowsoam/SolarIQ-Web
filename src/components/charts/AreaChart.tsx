/**
 * WK-109: Performance Optimization - Area Chart Component
 */

'use client'

import {
  ResponsiveContainer,
  AreaChart as RechartsAreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts'
import { ComponentType } from 'react'

export interface AreaChartProps {
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
  showCartesianGrid?: boolean
  xAxisDataKey?: string
  className?: string
}

export const AreaChart: ComponentType<AreaChartProps> = ({
  data,
  areas,
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
        <RechartsAreaChart data={data}>
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
          {areas.map((area, index) => (
            <Area
              key={`${area.dataKey}-${index}`}
              type="monotone"
              dataKey={area.dataKey}
              stroke={area.stroke || area.fill}
              strokeWidth={area.strokeWidth || 2}
              fill={area.fill}
              fillOpacity={0.6}
              animationDuration={1000}
              animationEasing="ease-in-out"
            />
          ))}
        </RechartsAreaChart>
      </ResponsiveContainer>
    </div>
  )
}
