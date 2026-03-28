'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { AppLayout } from '@/components/layout'
import { useAuth } from '@/context'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/Toast'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface UsageStats {
  total_requests: number
  cached_requests: number
  cache_hit_rate: number
  total_input_tokens: number
  total_output_tokens: number
  total_cost_usd: number
  total_cost_thb: number
  avg_latency_ms: number
  breakdown_by_feature: Record<string, { requests: number; cost_thb: number }>
  breakdown_by_model: Record<string, { requests: number; cost_thb: number }>
}

interface PlanUsage {
  plan_name: string
  analyses_used: number
  analyses_limit: number
  analyses_percentage: number
  ocr_used: number
  ocr_limit: number
  ocr_percentage: number
  chat_used: number
  chat_limit: number
  chat_percentage: number
  rag_used: number
  rag_limit: number
  rag_percentage: number
}

interface DashboardOverview {
  today_requests: number
  today_cost_thb: number
  month_requests: number
  month_cost_thb: number
  cache_hit_rate: number
  avg_latency_ms: number
  active_orgs: number
}

interface OrganizationUsage {
  org_id: string
  org_name: string | null
  plan_name: string
  total_requests: number
  total_cost_thb: number
  cache_hit_rate: number
}

// ---------------------------------------------------------------------------
// Components
// ---------------------------------------------------------------------------

function StatCard({
  title,
  value,
  icon,
  trend,
  color = 'orange',
}: {
  title: string
  value: string | number
  icon: React.ReactNode
  trend?: { value: number; label: string }
  color?: 'orange' | 'blue' | 'green' | 'purple'
}) {
  const colorClasses = {
    orange: 'text-orange-500',
    blue: 'text-blue-500',
    green: 'text-green-500',
    purple: 'text-purple-500',
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">{title}</span>
        <span className={colorClasses[color]}>{icon}</span>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      {trend && (
        <p className={`text-xs mt-1 ${trend.value >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}% {trend.label}
        </p>
      )}
    </div>
  )
}

function ProgressBar({
  used,
  limit,
  percentage,
  color = 'orange',
  unlimitedLabel = 'Unlimited',
}: {
  used: number
  limit: number
  percentage: number
  color?: 'orange' | 'blue' | 'green' | 'red'
  unlimitedLabel?: string
}) {
  const colorClasses = {
    orange: 'bg-orange-500',
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    red: 'bg-red-500',
  }

  const isUnlimited = limit < 0

  return (
    <div className="w-full">
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-600">
          {used} {isUnlimited ? '' : `/ ${limit}`}
        </span>
        <span
          className={
            isUnlimited ? 'text-green-600' : percentage >= 90 ? 'text-red-600' : 'text-gray-500'
          }
        >
          {isUnlimited ? unlimitedLabel : `${percentage.toFixed(1)}%`}
        </span>
      </div>
      {!isUnlimited && (
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`${colorClasses[color]} h-2 rounded-full transition-all duration-300`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
      )}
    </div>
  )
}

function UsageBarChart({
  data,
}: {
  data: Array<{ date: string; requests: number; cost_thb: number }>
}) {
  const maxRequests = Math.max(...data.map((d) => d.requests), 1)

  return (
    <div className="space-y-2">
      {data.map((item, index) => (
        <div key={index} className="flex items-center gap-3">
          <div className="w-20 text-xs text-gray-500 flex-shrink-0">
            {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </div>
          <div className="flex-1">
            <div className="relative h-8 bg-gray-100 rounded overflow-hidden">
              <div
                className="absolute left-0 top-0 h-full bg-orange-400 transition-all duration-300"
                style={{ width: `${(item.requests / maxRequests) * 100}%` }}
              />
              <div className="absolute inset-0 flex items-center px-3">
                <span className="text-xs font-medium text-gray-700">{item.requests} req</span>
                <span className="ml-auto text-xs text-gray-500">฿{item.cost_thb.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function AIDashboardPage() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const t = useTranslations('admin.ai-dashboard')

  const [overview, setOverview] = useState<DashboardOverview | null>(null)
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null)
  const [planUsage, setPlanUsage] = useState<PlanUsage | null>(null)
  const [orgUsage, setOrgUsage] = useState<OrganizationUsage[]>([])
  const [usageHistory, setUsageHistory] = useState<
    Array<{ date: string; requests: number; cost_thb: number }>
  >([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { addToast } = useToast()
  const [activeTab, setActiveTab] = useState<'overview' | 'usage' | 'organizations' | 'cache'>(
    'overview'
  )

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Load all data in parallel
      const [overviewRes, usageRes, planRes, orgRes, historyRes] = await Promise.all([
        fetch('/api/v1/admin/ai/dashboard'),
        fetch('/api/v1/admin/ai/usage'),
        fetch('/api/v1/admin/ai/plan-usage'),
        fetch('/api/v1/admin/ai/organizations'),
        fetch('/api/v1/admin/ai/usage/history?days=30'),
      ])

      if (!overviewRes.ok || !usageRes.ok || !planRes.ok || !orgRes.ok || !historyRes.ok) {
        throw new Error('Failed to load dashboard data')
      }

      const [overviewData, usageData, planData, orgData, historyData] = await Promise.all([
        overviewRes.json(),
        usageRes.json(),
        planRes.json(),
        orgRes.json(),
        historyRes.json(),
      ])

      setOverview(overviewData)
      setUsageStats(usageData)
      setPlanUsage(planData)
      setOrgUsage(orgData)
      setUsageHistory(historyData.history || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : t('loadFailed'))
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => {
    if (!authLoading && user) {
      loadDashboardData()
    }
  }, [user, authLoading, loadDashboardData])

  const handleInvalidateCache = async () => {
    try {
      const res = await fetch('/api/v1/admin/ai/cache/cleanup', { method: 'POST' })
      if (!res.ok) {
        throw new Error('Failed to cleanup cache')
      }
      addToast('success', t('cacheCleanedSuccess'))
    } catch (err) {
      addToast('error', err instanceof Error ? err.message : t('cacheCleanedFailed'))
    }
  }

  // Redirect non-admin users
  useEffect(() => {
    if (!authLoading && user && user.role !== 'admin') {
      router.replace('/dashboard')
    }
  }, [authLoading, user, router])

  if (authLoading || loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
      </AppLayout>
    )
  }

  if (!user || user.role !== 'admin') {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <p className="text-gray-500">{t('unauthorized')}</p>
        </div>
      </AppLayout>
    )
  }

  if (error) {
    return (
      <AppLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
            <button
              onClick={loadDashboardData}
              className="mt-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              {t('retry')}
            </button>
          </div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{t('title')}</h1>
          <p className="mt-2 text-gray-600">{t('subtitle')}</p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: t('tabs.overview') },
              { id: 'usage', label: t('tabs.usage') },
              { id: 'organizations', label: t('tabs.organizations') },
              { id: 'cache', label: t('tabs.cache') },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() =>
                  setActiveTab(tab.id as 'overview' | 'usage' | 'organizations' | 'cache')
                }
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && overview && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title={t('stats.todayRequests')}
                value={overview.today_requests.toLocaleString()}
                icon={
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                }
              />
              <StatCard
                title={t('stats.todayCost')}
                value={`฿${overview.today_cost_thb.toFixed(2)}`}
                icon={
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                }
                color="green"
              />
              <StatCard
                title={t('stats.monthRequests')}
                value={overview.month_requests.toLocaleString()}
                icon={
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                }
                color="blue"
              />
              <StatCard
                title={t('stats.monthCost')}
                value={`฿${overview.month_cost_thb.toFixed(2)}`}
                icon={
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                }
                color="green"
              />
            </div>

            {/* Additional Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatCard
                title={t('stats.cacheHitRate')}
                value={`${overview.cache_hit_rate.toFixed(1)}%`}
                icon={
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                    />
                  </svg>
                }
                color="purple"
              />
              <StatCard
                title={t('stats.avgLatency')}
                value={`${overview.avg_latency_ms.toFixed(0)}ms`}
                icon={
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                }
                color="blue"
              />
              <StatCard
                title={t('stats.activeOrgs')}
                value={overview.active_orgs}
                icon={
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                }
                color="orange"
              />
            </div>

            {/* Usage History */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('usageHistory')}</h2>
              {usageHistory.length > 0 ? (
                <UsageBarChart data={usageHistory.slice(0, 14)} />
              ) : (
                <p className="text-gray-500 text-sm">{t('noData')}</p>
              )}
            </div>
          </div>
        )}

        {/* Usage Stats Tab */}
        {activeTab === 'usage' && usageStats && planUsage && (
          <div className="space-y-6">
            {/* Plan Usage */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                {t('planUsage')} ({planUsage.plan_name})
              </h2>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-gray-700">{t('analyses')}</span>
                  </div>
                  <ProgressBar
                    used={planUsage.analyses_used}
                    limit={planUsage.analyses_limit}
                    percentage={planUsage.analyses_percentage}
                    color={planUsage.analyses_percentage >= 90 ? 'red' : 'orange'}
                    unlimitedLabel={t('unlimited')}
                  />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-gray-700">{t('billOcr')}</span>
                  </div>
                  <ProgressBar
                    used={planUsage.ocr_used}
                    limit={planUsage.ocr_limit}
                    percentage={planUsage.ocr_percentage}
                    color={planUsage.ocr_percentage >= 90 ? 'red' : 'orange'}
                    unlimitedLabel={t('unlimited')}
                  />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-gray-700">{t('chatMessages')}</span>
                  </div>
                  <ProgressBar
                    used={planUsage.chat_used}
                    limit={planUsage.chat_limit}
                    percentage={planUsage.chat_percentage}
                    color={planUsage.chat_percentage >= 90 ? 'red' : 'orange'}
                    unlimitedLabel={t('unlimited')}
                  />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-gray-700">{t('ragQueries')}</span>
                  </div>
                  <ProgressBar
                    used={planUsage.rag_used}
                    limit={planUsage.rag_limit}
                    percentage={planUsage.rag_percentage}
                    color={planUsage.rag_percentage >= 90 ? 'red' : 'orange'}
                    unlimitedLabel={t('unlimited')}
                  />
                </div>
              </div>
            </div>

            {/* Breakdown by Feature */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('usageByFeature')}</h2>
              <div className="space-y-3">
                {Object.entries(usageStats.breakdown_by_feature).map(([feature, data]) => (
                  <div
                    key={feature}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-900 capitalize">{feature}</p>
                      <p className="text-sm text-gray-500">
                        {data.requests} {t('requests')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">฿{data.cost_thb.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Breakdown by Model */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('usageByModel')}</h2>
              <div className="space-y-3">
                {Object.entries(usageStats.breakdown_by_model).map(([model, data]) => (
                  <div
                    key={model}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{model}</p>
                      <p className="text-sm text-gray-500">
                        {data.requests} {t('requests')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">฿{data.cost_thb.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Organizations Tab */}
        {activeTab === 'organizations' && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">{t('orgUsage')}</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('columns.organization')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('columns.plan')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('columns.requests')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('columns.costThb')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('columns.cacheHitRate')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orgUsage.map((org) => (
                    <tr key={org.org_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {org.org_name || t('unknown')}
                        </div>
                        <div className="text-xs text-gray-500">{org.org_id}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          {org.plan_name}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {org.total_requests.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ฿{org.total_cost_thb.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {org.cache_hit_rate.toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Cache Tab */}
        {activeTab === 'cache' && usageStats && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatCard
                title={t('stats.cacheHitRate')}
                value={`${usageStats.cache_hit_rate.toFixed(1)}%`}
                icon={
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                    />
                  </svg>
                }
                color="green"
              />
              <StatCard
                title={t('stats.cachedRequests')}
                value={usageStats.cached_requests.toLocaleString()}
                icon={
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                    />
                  </svg>
                }
                color="blue"
              />
              <StatCard
                title={t('stats.totalRequests')}
                value={usageStats.total_requests.toLocaleString()}
                icon={
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                }
                color="purple"
              />
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">{t('cacheManagement')}</h2>
                <button
                  onClick={handleInvalidateCache}
                  className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 text-sm font-medium"
                >
                  {t('cleanUpExpired')}
                </button>
              </div>
              <p className="text-sm text-gray-600">{t('cleanUpDescription')}</p>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
