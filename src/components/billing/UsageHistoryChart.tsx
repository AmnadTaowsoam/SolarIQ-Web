'use client';

import React, { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';

interface UsageHistoryItem {
  id: string;
  feature_key: string;
  usage_count: number;
  period_start: string;
  period_end: string;
  created_at: string;
}

interface UsageHistoryChartProps {
  className?: string;
  limit?: number;
}

// Feature display configuration
const FEATURE_CONFIG: Record<string, { displayName: string; color: string }> = {
  lead_view: { displayName: 'Leads', color: '#3B82F6' },
  ai_analysis: { displayName: 'AI Analysis', color: '#10B981' },
  pdf_download: { displayName: 'PDFs', color: '#F59E0B' },
  api_call: { displayName: 'API Calls', color: '#8B5CF6' },
};

/**
 * UsageHistoryChart Component (WK-020)
 * Displays historical usage data in a simple bar chart format
 */
export function UsageHistoryChart({ className = '', limit = 6 }: UsageHistoryChartProps) {
  const [history, setHistory] = useState<UsageHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setIsLoading(true);
        const response = await apiClient.get<{ history: UsageHistoryItem[] }>(
          `/usage/history?limit=${limit}`
        );
        setHistory(response.data.history || []);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch usage history:', err);
        setError('Failed to load usage history');
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, [limit]);

  if (isLoading) {
    return (
      <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Usage History</h3>
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center space-x-4">
              <div className="h-4 bg-gray-200 rounded w-24"></div>
              <div className="h-4 bg-gray-200 rounded w-16"></div>
              <div className="h-4 bg-gray-200 rounded flex-1"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Usage History</h3>
        <p className="text-red-500 text-sm">{error}</p>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Usage History</h3>
        <p className="text-gray-500 text-sm">No usage history available yet.</p>
      </div>
    );
  }

  // Group history by period
  const groupedByPeriod = history.reduce((acc, item) => {
    const periodKey = `${item.period_start}-${item.period_end}`;
    if (!acc[periodKey]) {
      acc[periodKey] = {
        period_start: item.period_start,
        period_end: item.period_end,
        items: [],
      };
    }
    acc[periodKey].items.push(item);
    return acc;
  }, {} as Record<string, { period_start: string; period_end: string; items: UsageHistoryItem[] }>);

  const periods = Object.values(groupedByPeriod).slice(0, limit);

  // Find max value for scaling
  const maxValue = Math.max(
    ...history.map((h) => h.usage_count),
    1
  );

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Usage History</h3>

      <div className="space-y-6">
        {periods.map((period) => (
          <div key={`${period.period_start}-${period.period_end}`}>
            <h4 className="text-sm font-medium text-gray-600 mb-2">
              {formatDate(period.period_start)} - {formatDate(period.period_end)}
            </h4>
            <div className="space-y-2">
              {period.items.map((item) => {
                const config = FEATURE_CONFIG[item.feature_key] || {
                  displayName: item.feature_key,
                  color: '#6B7280',
                };
                const barWidth = (item.usage_count / maxValue) * 100;

                return (
                  <div key={item.id} className="flex items-center space-x-3">
                    <span className="text-xs text-gray-500 w-20 truncate">
                      {config.displayName}
                    </span>
                    <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${barWidth}%`,
                          backgroundColor: config.color,
                        }}
                      />
                    </div>
                    <span className="text-xs font-medium text-gray-700 w-12 text-right">
                      {item.usage_count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-gray-100">
        <div className="flex flex-wrap gap-4">
          {Object.entries(FEATURE_CONFIG).map(([key, config]) => (
            <div key={key} className="flex items-center space-x-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: config.color }}
              />
              <span className="text-xs text-gray-500">{config.displayName}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default UsageHistoryChart;
