/**
 * WK-109: Performance Optimization - Performance Monitor Component
 * This component monitors and reports performance issues in real-time
 */

'use client'

import { useEffect, useState } from 'react'
import { onCLS, onFID, onLCP, onFCP, onTTFB, Metric } from 'web-vitals'
import * as Sentry from '@sentry/nextjs'

interface PerformanceMetrics {
  cls?: number
  fid?: number
  lcp?: number
  fcp?: number
  ttfb?: number
  overallRating: 'good' | 'needs-improvement' | 'poor'
}

interface PerformanceMonitorProps {
  enabled?: boolean
  reportToSentry?: boolean
  showInDev?: boolean
}

// Performance thresholds
const THRESHOLDS = {
  LCP: { good: 2500, needsImprovement: 4000 },
  FID: { good: 100, needsImprovement: 300 },
  CLS: { good: 0.1, needsImprovement: 0.25 },
  FCP: { good: 1800, needsImprovement: 3000 },
  TTFB: { good: 800, needsImprovement: 1800 },
}

function getRating(metricName: string, value: number): 'good' | 'needs-improvement' | 'poor' {
  const threshold = THRESHOLDS[metricName as keyof typeof THRESHOLDS]
  if (!threshold) {
    return 'good'
  }

  if (metricName === 'CLS') {
    if (value <= threshold.good) {
      return 'good'
    }
    if (value <= threshold.needsImprovement) {
      return 'needs-improvement'
    }
    return 'poor'
  }

  if (value <= threshold.good) {
    return 'good'
  }
  if (value <= threshold.needsImprovement) {
    return 'needs-improvement'
  }
  return 'poor'
}

function getOverallRating(metrics: PerformanceMetrics): 'good' | 'needs-improvement' | 'poor' {
  const ratings = [
    metrics.cls ? getRating('CLS', metrics.cls) : 'good',
    metrics.fid ? getRating('FID', metrics.fid) : 'good',
    metrics.lcp ? getRating('LCP', metrics.lcp) : 'good',
    metrics.fcp ? getRating('FCP', metrics.fcp) : 'good',
    metrics.ttfb ? getRating('TTFB', metrics.ttfb) : 'good',
  ]

  if (ratings.some((r) => r === 'poor')) {
    return 'poor'
  }
  if (ratings.some((r) => r === 'needs-improvement')) {
    return 'needs-improvement'
  }
  return 'good'
}

export function PerformanceMonitor({
  enabled = true,
  reportToSentry = true,
  showInDev = true,
}: PerformanceMonitorProps) {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    overallRating: 'good',
  })
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (!enabled) {
      return
    }

    const updateMetrics = (metric: Metric) => {
      const rating = getRating(metric.name, metric.value)

      // Log to console in development
      if (process.env.NODE_ENV === 'development') {
      }

      setMetrics((prev) => {
        const newMetrics = {
          ...prev,
          [metric.name.toLowerCase() as keyof PerformanceMetrics]: metric.value,
        }
        return { ...newMetrics, overallRating: getOverallRating(newMetrics) }
      })

      // Report to Sentry if enabled and metric is poor
      if (reportToSentry && rating === 'poor' && process.env.NEXT_PUBLIC_SENTRY_DSN) {
        Sentry.captureMessage(`Poor Performance Metric: ${metric.name}`, {
          level: 'warning',
          tags: {
            metric_name: metric.name,
            metric_rating: rating,
          },
          extra: {
            value: metric.value,
            id: metric.id,
            delta: metric.delta,
            navigationType: metric.navigationType,
          },
        })
      }
    }

    // Register performance observers
    onCLS(updateMetrics)
    onFID(updateMetrics)
    onLCP(updateMetrics)
    onFCP(updateMetrics)
    onTTFB(updateMetrics)

    // Toggle visibility on Ctrl+Shift+P
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'P') {
        setIsVisible((prev) => !prev)
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [enabled, reportToSentry])

  // Don't render in production unless explicitly enabled
  if (process.env.NODE_ENV === 'production' && !showInDev) {
    return null
  }

  // Don't render if not visible
  if (!isVisible && process.env.NODE_ENV === 'development') {
    return null
  }

  const ratingColors = {
    good: 'bg-green-500',
    'needs-improvement': 'bg-yellow-500',
    poor: 'bg-red-500',
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-[var(--brand-surface)] dark:bg-gray-800 rounded-lg shadow-lg p-4 max-w-xs">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-[var(--brand-text)] dark:text-white">
          Performance Metrics
        </h3>
        <div className={`h-2 w-2 rounded-full ${ratingColors[metrics.overallRating]}`} />
      </div>
      <div className="space-y-2 text-xs">
        {metrics.lcp !== undefined && (
          <div className="flex justify-between">
            <span className="text-[var(--brand-text-secondary)] dark:text-[var(--brand-text-secondary)]">
              LCP
            </span>
            <span
              className={
                getRating('LCP', metrics.lcp) === 'poor'
                  ? 'text-red-600'
                  : 'text-[var(--brand-text)] dark:text-white'
              }
            >
              {metrics.lcp.toFixed(0)}ms
            </span>
          </div>
        )}
        {metrics.fid !== undefined && (
          <div className="flex justify-between">
            <span className="text-[var(--brand-text-secondary)] dark:text-[var(--brand-text-secondary)]">
              FID
            </span>
            <span
              className={
                getRating('FID', metrics.fid) === 'poor'
                  ? 'text-red-600'
                  : 'text-[var(--brand-text)] dark:text-white'
              }
            >
              {metrics.fid.toFixed(0)}ms
            </span>
          </div>
        )}
        {metrics.cls !== undefined && (
          <div className="flex justify-between">
            <span className="text-[var(--brand-text-secondary)] dark:text-[var(--brand-text-secondary)]">
              CLS
            </span>
            <span
              className={
                getRating('CLS', metrics.cls) === 'poor'
                  ? 'text-red-600'
                  : 'text-[var(--brand-text)] dark:text-white'
              }
            >
              {metrics.cls.toFixed(3)}
            </span>
          </div>
        )}
        {metrics.fcp !== undefined && (
          <div className="flex justify-between">
            <span className="text-[var(--brand-text-secondary)] dark:text-[var(--brand-text-secondary)]">
              FCP
            </span>
            <span
              className={
                getRating('FCP', metrics.fcp) === 'poor'
                  ? 'text-red-600'
                  : 'text-[var(--brand-text)] dark:text-white'
              }
            >
              {metrics.fcp.toFixed(0)}ms
            </span>
          </div>
        )}
        {metrics.ttfb !== undefined && (
          <div className="flex justify-between">
            <span className="text-[var(--brand-text-secondary)] dark:text-[var(--brand-text-secondary)]">
              TTFB
            </span>
            <span
              className={
                getRating('TTFB', metrics.ttfb) === 'poor'
                  ? 'text-red-600'
                  : 'text-[var(--brand-text)] dark:text-white'
              }
            >
              {metrics.ttfb.toFixed(0)}ms
            </span>
          </div>
        )}
      </div>
      <div className="mt-3 pt-3 border-t border-[var(--brand-border)] dark:border-gray-700">
        <p className="text-xs text-[var(--brand-text-secondary)] dark:text-[var(--brand-text-secondary)]">
          Press{' '}
          <kbd className="px-1 py-0.5 bg-[var(--brand-background)] dark:bg-gray-700 rounded">
            Ctrl+Shift+P
          </kbd>{' '}
          to toggle
        </p>
      </div>
    </div>
  )
}
