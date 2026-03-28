'use client'

/**
 * API Usage Dashboard page (WK-031)
 * Auth and AppLayout handled by developers/layout.tsx
 */

import { format } from 'date-fns'
import { th } from 'date-fns/locale'
import { useTranslations } from 'next-intl'
import { useApiUsage } from '@/hooks/useDeveloperApi'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</p>
      <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  )
}

export default function ApiUsagePage() {
  const t = useTranslations('developersExtra')
  const { usage, isLoading } = useApiUsage()

  const usagePercent = usage ? Math.round((usage.totalCallsMonth / usage.monthLimit) * 100) : 0

  const chartData =
    usage?.dailyStats.map((d) => ({
      date: format(new Date(d.date), 'd', { locale: th }),
      calls: d.calls,
      errors: d.errors,
    })) ?? []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-gray-900">{t('usage.title')}</h2>
        <p className="text-sm text-gray-500 mt-0.5">
          {format(new Date(), 'MMMM yyyy', { locale: th })}
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4 animate-pulse">
          <div className="grid grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-100 rounded-xl" />
            ))}
          </div>
          <div className="h-64 bg-gray-100 rounded-xl" />
        </div>
      ) : (
        <>
          {/* Stats row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard
              label={t('usage.totalRequests')}
              value={(usage?.totalCallsMonth ?? 0).toLocaleString()}
              sub={t('usage.thisMonth')}
            />
            <StatCard
              label={t('usage.successRate')}
              value={`${usage?.successRate ?? 0}%`}
              sub={t('usage.avgResponseTime')}
            />
            <StatCard
              label={t('usage.avgResponseTime')}
              value={`${usage?.avgLatencyMs ?? 0} ms`}
              sub={t('usage.today')}
            />
          </div>

          {/* Monthly quota bar */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-gray-900">{t('usage.thisMonth')}</h3>
              <span className="text-sm font-semibold text-gray-700">{usagePercent}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-3 mb-2">
              <div
                className="h-3 rounded-full transition-all"
                style={{
                  width: `${Math.min(usagePercent, 100)}%`,
                  backgroundColor:
                    usagePercent >= 90 ? '#ef4444' : usagePercent >= 70 ? '#f97316' : '#22c55e',
                }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>{(usage?.totalCallsMonth ?? 0).toLocaleString()} calls</span>
              <span>{(usage?.monthLimit ?? 0).toLocaleString()} calls</span>
            </div>
            {usagePercent >= 80 && (
              <div className="mt-3 bg-orange-50 border border-orange-200 rounded-lg px-3 py-2 text-xs text-orange-800">
                {usagePercent}%
              </div>
            )}
          </div>

          {/* Daily chart */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="text-sm font-bold text-gray-900 mb-4">{t('usage.requests')}</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} barSize={8}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: '#9ca3af' }}
                    axisLine={false}
                    tickLine={false}
                    interval={4}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#9ca3af' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(v))}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '10px',
                      fontSize: '12px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)',
                    }}
                    formatter={(value: number, name: string) => [
                      value.toLocaleString(),
                      name === 'calls' ? 'API Calls' : 'Errors',
                    ]}
                  />
                  <Bar dataKey="calls" fill="#f97316" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="errors" fill="#ef4444" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center gap-4 mt-3 justify-center">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm bg-orange-500" />
                <span className="text-xs text-gray-500">API Calls</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm bg-red-500" />
                <span className="text-xs text-gray-500">Errors</span>
              </div>
            </div>
          </div>

          {/* Endpoint breakdown */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="text-sm font-bold text-gray-900 mb-4">{t('usage.endpoint')}</h3>
            <div className="space-y-3">
              {(usage?.endpointBreakdown ?? []).map((ep) => (
                <div key={ep.endpoint}>
                  <div className="flex items-center justify-between mb-1">
                    <code className="text-xs font-mono text-gray-700">{ep.endpoint}</code>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-500">
                        {ep.calls.toLocaleString()} calls
                      </span>
                      <span className="text-xs font-semibold text-gray-700 w-10 text-right">
                        {ep.percentage}%
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div
                      className="h-1.5 rounded-full bg-orange-400 transition-all"
                      style={{ width: `${ep.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
