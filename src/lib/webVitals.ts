/**
 * SolarIQ Web - Web Vitals Performance Tracking
 * WK-014: Monitoring, Logging & Observability
 *
 * This module provides Web Vitals performance tracking and reporting.
 */

import * as Sentry from '@sentry/nextjs';
import { onCLS, onFID, onLCP, onFCP, onTTFB, Metric } from 'web-vitals';

// Web Vitals thresholds (in milliseconds)
const THRESHOLDS = {
  // Core Web Vitals
  LCP: { good: 2500, needsImprovement: 4000 }, // Largest Contentful Paint
  FID: { good: 100, needsImprovement: 300 }, // First Input Delay
  CLS: { good: 0.1, needsImprovement: 0.25 }, // Cumulative Layout Shift

  // Other metrics
  FCP: { good: 1800, needsImprovement: 3000 }, // First Contentful Paint
  TTFB: { good: 800, needsImprovement: 1800 }, // Time to First Byte
};

// Metric rating types
type MetricRating = 'good' | 'needs-improvement' | 'poor';

/**
 * Get rating for a metric value
 */
function getRating(metricName: string, value: number): MetricRating {
  const threshold = THRESHOLDS[metricName as keyof typeof THRESHOLDS];
  if (!threshold) {
    return 'good';
  }

  if (metricName === 'CLS') {
    // CLS is a unitless score, not milliseconds
    if (value <= threshold.good) {
      return 'good';
    }
    if (value <= threshold.needsImprovement) {
      return 'needs-improvement';
    }
    return 'poor';
  }

  if (value <= threshold.good) {
    return 'good';
  }
  if (value <= threshold.needsImprovement) {
    return 'needs-improvement';
  }
  return 'poor';
}

/**
 * Send metric to analytics endpoint
 */
function sendToAnalytics(metric: Metric): void {
  const rating = getRating(metric.name, metric.value);

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line no-console
    console.log('[Web Vitals]', {
      name: metric.name,
      value: metric.value,
      rating,
      id: metric.id,
      delta: metric.delta,
      navigationType: metric.navigationType,
    });
  }

  // Send to Sentry as a transaction/span
  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    Sentry.addBreadcrumb({
      category: 'web-vitals',
      message: `${metric.name}: ${metric.value.toFixed(2)} (${rating})`,
      level: rating === 'poor' ? 'warning' : 'info',
      data: {
        metricName: metric.name,
        value: metric.value,
        rating,
        id: metric.id,
        delta: metric.delta,
        navigationType: metric.navigationType,
      },
    });

    // Track poor metrics as Sentry events
    if (rating === 'poor') {
      Sentry.captureMessage(`Poor Web Vital: ${metric.name}`, {
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
      });
    }
  }

  // Send to analytics API endpoint
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
    const url = '/api/analytics/vitals';
    const body = JSON.stringify({
      name: metric.name,
      value: metric.value,
      rating,
      id: metric.id,
      delta: metric.delta,
      navigationType: metric.navigationType,
      page: window.location.pathname,
      timestamp: new Date().toISOString(),
    });

    // Use sendBeacon if available, otherwise fetch
    if (navigator.sendBeacon) {
      navigator.sendBeacon(url, body);
    } else {
      fetch(url, {
        method: 'POST',
        body,
        headers: { 'Content-Type': 'application/json' },
        keepalive: true,
      }).catch(() => {
        // Silently fail - analytics should not break the app
      });
    }
  }
}

/**
 * Initialize Web Vitals tracking
 */
export function initWebVitals(): void {
  // Core Web Vitals
  onCLS(sendToAnalytics);
  onFID(sendToAnalytics);
  onLCP(sendToAnalytics);

  // Additional metrics
  onFCP(sendToAnalytics);
  onTTFB(sendToAnalytics);
}

/**
 * Get current page performance metrics
 */
export function getPagePerformanceMetrics(): {
  dns: number;
  tcp: number;
  request: number;
  response: number;
  domProcessing: number;
  totalLoad: number;
} | null {
  if (typeof window === 'undefined' || !window.performance) {
    return null;
  }

  const timing = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
  if (!timing) {
    return null;
  }

  return {
    dns: timing.domainLookupEnd - timing.domainLookupStart,
    tcp: timing.connectEnd - timing.connectStart,
    request: timing.responseStart - timing.requestStart,
    response: timing.responseEnd - timing.responseStart,
    domProcessing: timing.domComplete - timing.domInteractive,
    totalLoad: timing.loadEventEnd - timing.fetchStart,
  };
}

/**
 * Track custom performance mark
 */
export function trackPerformanceMark(name: string, data?: Record<string, unknown>): void {
  if (typeof window === 'undefined' || !window.performance) {
    return;
  }

  const markName = `custom:${name}`;
  performance.mark(markName);

  if (data && process.env.NEXT_PUBLIC_SENTRY_DSN) {
    Sentry.addBreadcrumb({
      category: 'performance-mark',
      message: markName,
      level: 'info',
      data,
    });
  }
}

/**
 * Measure time between two marks
 */
export function measurePerformance(
  name: string,
  startMark: string,
  endMark?: string
): PerformanceMeasure | null {
  if (typeof window === 'undefined' || !window.performance) {
    return null;
  }

  try {
    const end = endMark || `${name}:end`;
    if (!endMark) {
      performance.mark(end);
    }
    return performance.measure(name, startMark, end);
  } catch {
    return null;
  }
}

/**
 * Track API call performance
 */
export function trackApiCall(
  endpoint: string,
  duration: number,
  status: number,
  success: boolean
): void {
  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    Sentry.addBreadcrumb({
      category: 'api-call',
      message: `${endpoint} - ${status} (${duration}ms)`,
      level: success ? 'info' : 'warning',
      data: {
        endpoint,
        duration,
        status,
        success,
      },
    });

    // Track slow API calls (> 3 seconds)
    if (duration > 3000) {
      Sentry.captureMessage(`Slow API call: ${endpoint}`, {
        level: 'warning',
        tags: {
          endpoint,
          status: String(status),
        },
        extra: {
          duration,
        },
      });
    }
  }
}

/**
 * Track user interaction timing
 */
export function trackInteraction(
  action: string,
  duration: number,
  metadata?: Record<string, unknown>
): void {
  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    Sentry.addBreadcrumb({
      category: 'user-interaction',
      message: `${action} (${duration}ms)`,
      level: 'info',
      data: {
        action,
        duration,
        ...metadata,
      },
    });
  }
}

// Export types
export type { Metric };
