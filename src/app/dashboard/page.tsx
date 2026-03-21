'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context'
import { AppLayout } from '@/components/layout'
import { Card, CardHeader, CardBody, Badge } from '@/components/ui'
import { useDashboardStats, useRecentLeads, useLeadsOverTime, useTopLocations } from '@/hooks'
import { ROUTES, LEAD_STATUS_COLORS, LEAD_STATUS_LABELS } from '@/lib/constants'
import { DEMO_STATS, DEMO_RECENT_LEADS, DEMO_LEADS_OVER_TIME, DEMO_TOP_LOCATIONS } from '@/lib/demo-data'
import { Lead, LeadStatus } from '@/types'
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Area,
  AreaChart,
} from 'recharts'
import { format } from 'date-fns'

/** Format number as Thai Baht — hardcode ฿ to avoid locale issues in Docker Alpine */
function formatThb(value: number): string {
  return `฿${value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}

/** Format large numbers with commas */
function formatNumber(value: number): string {
  return new Intl.NumberFormat('th-TH').format(value)
}

// Stat Card Component
function StatCard({
  title,
  value,
  change,
  changeType,
  icon,
  iconBg,
}: {
  title: string
  value: string | number
  change?: string
  changeType?: 'positive' | 'negative' | 'neutral'
  icon: React.ReactNode
  iconBg?: string
}) {
  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardBody className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{title}</p>
            <p className="text-2xl font-bold text-gray-900 mt-2 tracking-tight">{value}</p>
            {change && (
              <div className="flex items-center gap-1 mt-2">
                {changeType === 'positive' && (
                  <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
                  </svg>
                )}
                {changeType === 'negative' && (
                  <svg className="w-3.5 h-3.5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4.5 4.5l15 15m0 0V8.25m0 11.25H8.25" />
                  </svg>
                )}
                <p className={`text-xs font-medium ${
                  changeType === 'positive'
                    ? 'text-emerald-600'
                    : changeType === 'negative'
                    ? 'text-red-600'
                    : 'text-gray-500'
                }`}>
                  {change}
                </p>
              </div>
            )}
          </div>
          <div className={`p-2.5 rounded-xl flex-shrink-0 ${iconBg || 'bg-orange-50'}`}>
            {icon}
          </div>
        </div>
      </CardBody>
    </Card>
  )
}

// Recent Leads Table
function RecentLeadsTable({ leads }: { leads: Lead[] }) {
  const router = useRouter()

  if (leads.length === 0) {
    return (
      <Card>
        <CardHeader
          title="Recent Leads"
          action={
            <button
              onClick={() => router.push(ROUTES.LEADS)}
              className="text-xs font-semibold text-orange-600 hover:text-orange-700 px-3 py-1.5 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors"
            >
              View all
            </button>
          }
        />
        <CardBody>
          <div className="text-center py-10">
            <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
            </svg>
            <p className="text-sm font-medium text-gray-500">No leads yet</p>
            <p className="text-xs text-gray-400 mt-1">New leads will appear here</p>
          </div>
        </CardBody>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader
        title="Recent Leads"
        action={
          <button
            onClick={() => router.push(ROUTES.LEADS)}
            className="text-xs font-semibold text-orange-600 hover:text-orange-700 px-3 py-1.5 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors"
          >
            View all
          </button>
        }
      />
      <CardBody className="p-0">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-6 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                  Monthly Bill
                </th>
                <th className="px-6 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                  Created
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {leads.map((lead) => (
                <tr
                  key={lead.id}
                  className="hover:bg-gray-50/50 cursor-pointer transition-colors"
                  onClick={() => router.push(`${ROUTES.LEADS}/${lead.id}`)}
                >
                  <td className="px-6 py-3.5 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-semibold text-gray-500">
                          {lead.name?.charAt(0).toUpperCase() || '?'}
                        </span>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{lead.name}</div>
                        <div className="text-xs text-gray-400">{lead.phone}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-3.5 whitespace-nowrap">
                    <Badge className={LEAD_STATUS_COLORS[lead.status as LeadStatus]}>
                      {LEAD_STATUS_LABELS[lead.status as LeadStatus]}
                    </Badge>
                  </td>
                  <td className="px-6 py-3.5 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatThb(lead.monthlyBill)}
                  </td>
                  <td className="px-6 py-3.5 whitespace-nowrap text-xs text-gray-500">
                    {format(new Date(lead.createdAt), 'dd MMM yyyy')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardBody>
    </Card>
  )
}

// Leads Over Time Chart
function LeadsOverTimeChart({ data }: { data: { date: string; count: number }[] }) {
  return (
    <Card>
      <CardHeader title="Leads Over Time" subtitle="Last 30 days" />
      <CardBody>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="leadGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f97316" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="#f97316" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                tickFormatter={(value) => format(new Date(value), 'dd MMM')}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '10px',
                  fontSize: '12px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)',
                }}
                labelFormatter={(value) => format(new Date(value), 'dd MMM yyyy')}
                formatter={(value: number) => [formatNumber(value), 'Leads']}
              />
              <Area
                type="monotone"
                dataKey="count"
                stroke="#f97316"
                strokeWidth={2}
                fill="url(#leadGradient)"
                dot={false}
                activeDot={{ r: 4, fill: '#f97316', strokeWidth: 2, stroke: '#fff' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardBody>
    </Card>
  )
}

// Top Locations Chart
function TopLocationsChart({ data }: { data: { location: string; count: number }[] }) {
  return (
    <Card>
      <CardHeader title="Top Locations" subtitle="By lead volume" />
      <CardBody>
        <div className="h-64">
          {data.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <svg className="w-10 h-10 text-gray-300 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
                <p className="text-xs text-gray-400">No location data yet</p>
              </div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis
                  dataKey="location"
                  type="category"
                  tick={{ fontSize: 11, fill: '#6b7280' }}
                  width={100}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '10px',
                    fontSize: '12px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)',
                  }}
                  formatter={(value: number) => [formatNumber(value), 'Leads']}
                />
                <Bar dataKey="count" fill="#22c55e" radius={[0, 6, 6, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardBody>
    </Card>
  )
}

export default function DashboardPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const { data: statsData } = useDashboardStats()
  const { data: recentLeads = [] } = useRecentLeads(5)
  const { data: leadsOverTime = [] } = useLeadsOverTime(30)
  const { data: topLocations = [] } = useTopLocations(5)

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace(ROUTES.LOGIN)
    }
  }, [user, authLoading, router])

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-orange-200 border-t-orange-600 rounded-full animate-spin" />
          <p className="text-sm text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const stats = statsData?.data || DEMO_STATS
  const isDemoMode = recentLeads.length === 0
  const displayLeads = recentLeads.length > 0 ? recentLeads : DEMO_RECENT_LEADS.slice(0, 5)
  const displayLeadsOverTime = leadsOverTime.length > 0 ? leadsOverTime : DEMO_LEADS_OVER_TIME
  const displayTopLocations = topLocations.length > 0 ? topLocations : DEMO_TOP_LOCATIONS

  return (
    <AppLayout user={user}>
      <div className="space-y-6 max-w-7xl">
        {/* Page header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Welcome back, {user.displayName || 'User'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">
              {format(new Date(), 'EEEE, dd MMMM yyyy')}
            </span>
          </div>
        </div>

        {/* Demo mode banner */}
        {isDemoMode && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-2.5 flex items-center gap-2 text-sm">
            <svg className="w-4 h-4 text-amber-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-amber-800">Demo Mode — Showing sample data. Connect your backend API to see real data.</span>
          </div>
        )}

        {/* Stats cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Leads"
            value={formatNumber(stats.totalLeads)}
            iconBg="bg-blue-50"
            icon={
              <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
              </svg>
            }
          />
          <StatCard
            title="New Leads"
            value={formatNumber(stats.newLeads)}
            change="+12% from last month"
            changeType="positive"
            iconBg="bg-emerald-50"
            icon={
              <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
              </svg>
            }
          />
          <StatCard
            title="Conversion Rate"
            value={`${stats.conversionRate}%`}
            change="+5% from last month"
            changeType="positive"
            iconBg="bg-purple-50"
            icon={
              <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
              </svg>
            }
          />
          <StatCard
            title="Revenue"
            value={formatThb(stats.revenue)}
            change="+8% from last month"
            changeType="positive"
            iconBg="bg-orange-50"
            icon={
              <svg className="w-5 h-5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
              </svg>
            }
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <LeadsOverTimeChart data={displayLeadsOverTime} />
          <TopLocationsChart data={displayTopLocations} />
        </div>

        {/* Recent leads */}
        <RecentLeadsTable leads={displayLeads} />
      </div>
    </AppLayout>
  )
}
