'use client';

/**
 * Usage Bar Component (WK-017)
 * Progress bar showing resource usage vs quota with color coding
 */

import React from 'react';

// ============== Props ==============

interface UsageBarProps {
  /** Display label for the resource */
  label: string;
  /** Current usage count */
  current: number;
  /** Usage limit (null = unlimited) */
  limit?: number | null;
  /** Pre-calculated usage percentage (null = unlimited) */
  percentage?: number | null;
}

// ============== Helpers ==============

function getBarColor(percentage: number): string {
  if (percentage > 90) return 'bg-red-500';
  if (percentage > 70) return 'bg-yellow-500';
  return 'bg-green-500';
}

function getBarBgColor(percentage: number): string {
  if (percentage > 90) return 'bg-red-100';
  if (percentage > 70) return 'bg-yellow-100';
  return 'bg-green-100';
}

function getTextColor(percentage: number): string {
  if (percentage > 90) return 'text-red-600';
  if (percentage > 70) return 'text-yellow-600';
  return 'text-green-600';
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat('th-TH').format(value);
}

// ============== Component ==============

export function UsageBar({ label, current, limit, percentage }: UsageBarProps) {
  const isUnlimited = limit === null || limit === undefined;
  const computedPercentage = isUnlimited
    ? 0
    : percentage !== null && percentage !== undefined
    ? percentage
    : limit && limit > 0
    ? Math.min((current / limit) * 100, 100)
    : 0;

  const clampedPercentage = Math.min(Math.max(computedPercentage, 0), 100);

  return (
    <div className="w-full">
      {/* Label and value row */}
      {label && (
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">{label}</span>
          <span className="text-sm text-gray-600">
            {isUnlimited ? (
              <>
                {formatNumber(current)} /{' '}
                <span className="text-purple-600 font-medium">ไม่จำกัด</span>
              </>
            ) : (
              <>
                <span className={getTextColor(clampedPercentage)}>
                  {formatNumber(current)}
                </span>
                {' / '}
                {formatNumber(limit!)}
              </>
            )}
          </span>
        </div>
      )}

      {/* Progress bar */}
      {isUnlimited ? (
        <div className="w-full h-3 rounded-full bg-purple-100 overflow-hidden">
          <div
            className="h-full rounded-full bg-purple-400 transition-all duration-500"
            style={{ width: '100%' }}
          />
        </div>
      ) : (
        <div
          className={`w-full h-3 rounded-full overflow-hidden ${getBarBgColor(clampedPercentage)}`}
        >
          <div
            className={`h-full rounded-full transition-all duration-500 ${getBarColor(clampedPercentage)}`}
            style={{ width: `${clampedPercentage}%` }}
          />
        </div>
      )}

      {/* Percentage text */}
      {!isUnlimited && label && (
        <div className="mt-1 text-right">
          <span className={`text-xs font-medium ${getTextColor(clampedPercentage)}`}>
            {Math.round(clampedPercentage)}%
          </span>
        </div>
      )}
    </div>
  );
}

export default UsageBar;
