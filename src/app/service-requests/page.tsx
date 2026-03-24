'use client'

import { useState } from 'react'
import { AppLayout } from '@/components/layout'
import { useAuth } from '@/context'
import {
  useServiceRequests,
  useServiceRequestStats,
  useCreateServiceRequest,
} from '@/hooks/useServiceRequests'
import Link from 'next/link'

const TYPE_LABELS: Record<string, string> = {
  repair: 'แจ้งซ่อม',
  complaint: 'ร้องเรียน',
  feedback: 'ข้อเสนอแนะ',
  inquiry: 'สอบถาม',
}

const STATUS_LABELS: Record<string, string> = {
  open: 'รอดำเนินการ',
  in_progress: 'กำลังดำเนินการ',
  resolved: 'แก้ไขแล้ว',
  closed: 'ปิดแล้ว',
}

const PRIORITY_CONFIG: Record<string, { label: string; color: string }> = {
  urgent: { label: 'เร่งด่วน', color: 'bg-red-100 text-red-700' },
  high: { label: 'สูง', color: 'bg-orange-100 text-orange-700' },
  medium: { label: 'ปานกลาง', color: 'bg-amber-100 text-amber-700' },
  low: { label: 'ต่ำ', color: 'bg-gray-100 text-gray-600' },
}

const STATUS_CONFIG: Record<string, { color: string }> = {
  open: { color: 'bg-blue-100 text-blue-700' },
  in_progress: { color: 'bg-amber-100 text-amber-700' },
  resolved: { color: 'bg-green-100 text-green-700' },
  closed: { color: 'bg-gray-100 text-gray-600' },
}

export default function ServiceRequestsPage() {
  const { user } = useAuth()
  const [statusFilter, setStatusFilter] = useState('')
  const { data: requests, isLoading } = useServiceRequests(statusFilter || undefined)
  const { data: stats } = useServiceRequestStats()
  const createRequest = useCreateServiceRequest()
  const [showForm, setShowForm] = useState(false)

  if (!user) {
    return null
  }

  return (
    <AppLayout user={user}>
      <div className="max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">ศูนย์บริการลูกค้า</h1>
            <p className="mt-0.5 text-sm text-gray-500">
              จัดการคำร้อง แจ้งซ่อม และข้อเสนอแนะจากลูกค้า
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600"
          >
            + สร้างคำร้อง
          </button>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
            {[
              { label: 'ทั้งหมด', value: stats.total, color: 'text-gray-900' },
              { label: 'รอดำเนินการ', value: stats.open, color: 'text-blue-600' },
              { label: 'กำลังดำเนินการ', value: stats.in_progress, color: 'text-amber-600' },
              { label: 'แก้ไขแล้ว', value: stats.resolved, color: 'text-green-600' },
              {
                label: 'เวลาแก้ไขเฉลี่ย',
                value: stats.avg_resolution_hours
                  ? `${Math.round(stats.avg_resolution_hours)}ชม.`
                  : '-',
                color: 'text-purple-600',
              },
            ].map((s) => (
              <div key={s.label} className="rounded-xl border bg-white p-4 text-center">
                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-xs text-gray-500">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Create Form */}
        {showForm && (
          <form
            className="rounded-xl border border-amber-200 bg-amber-50 p-5"
            onSubmit={async (e) => {
              e.preventDefault()
              const form = e.target as HTMLFormElement
              const data = new FormData(form)
              await createRequest.mutateAsync({
                customer_name: data.get('customer_name') as string,
                customer_phone: data.get('phone') as string,
                customer_email: data.get('email') as string,
                request_type: data.get('type') as 'repair' | 'complaint' | 'feedback' | 'inquiry',
                priority: data.get('priority') as 'low' | 'medium' | 'high' | 'urgent',
                subject: data.get('subject') as string,
                description: data.get('description') as string,
              })
              setShowForm(false)
              form.reset()
            }}
          >
            <h3 className="mb-3 font-semibold text-gray-900">สร้างคำร้องใหม่</h3>
            <div className="grid gap-3 md:grid-cols-3">
              <input
                name="customer_name"
                placeholder="ชื่อลูกค้า *"
                required
                className="rounded-lg border px-3 py-2 text-sm"
              />
              <input
                name="phone"
                placeholder="เบอร์โทร"
                className="rounded-lg border px-3 py-2 text-sm"
              />
              <input
                name="email"
                placeholder="อีเมล"
                className="rounded-lg border px-3 py-2 text-sm"
              />
            </div>
            <div className="mt-3 grid gap-3 md:grid-cols-3">
              <select name="type" required className="rounded-lg border px-3 py-2 text-sm">
                <option value="repair">แจ้งซ่อม</option>
                <option value="complaint">ร้องเรียน</option>
                <option value="feedback">ข้อเสนอแนะ</option>
                <option value="inquiry">สอบถาม</option>
              </select>
              <select name="priority" className="rounded-lg border px-3 py-2 text-sm">
                <option value="medium">ปานกลาง</option>
                <option value="low">ต่ำ</option>
                <option value="high">สูง</option>
                <option value="urgent">เร่งด่วน</option>
              </select>
              <input
                name="subject"
                placeholder="หัวข้อ *"
                required
                className="rounded-lg border px-3 py-2 text-sm"
              />
            </div>
            <textarea
              name="description"
              placeholder="รายละเอียด *"
              required
              className="mt-3 w-full rounded-lg border px-3 py-2 text-sm"
              rows={3}
            />
            <div className="mt-3 flex gap-2">
              <button
                type="submit"
                disabled={createRequest.isPending}
                className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600 disabled:opacity-50"
              >
                {createRequest.isPending ? 'กำลังส่ง...' : 'ส่งคำร้อง'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-lg bg-gray-100 px-4 py-2 text-sm text-gray-600 hover:bg-gray-200"
              >
                ยกเลิก
              </button>
            </div>
          </form>
        )}

        {/* Filter */}
        <div className="flex gap-2">
          {[
            { value: '', label: 'ทั้งหมด' },
            { value: 'open', label: 'รอดำเนินการ' },
            { value: 'in_progress', label: 'กำลังดำเนินการ' },
            { value: 'resolved', label: 'แก้ไขแล้ว' },
          ].map((f) => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                statusFilter === f.value
                  ? 'bg-amber-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Request List */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 animate-pulse rounded-xl border bg-gray-100" />
            ))}
          </div>
        ) : requests && requests.length > 0 ? (
          <div className="space-y-3">
            {requests.map((req) => (
              <Link
                key={req.id}
                href={`/service-requests/${req.id}`}
                className="block rounded-xl border bg-white p-4 transition-shadow hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-gray-900">{req.subject}</h3>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_CONFIG[req.status]?.color || ''}`}
                      >
                        {STATUS_LABELS[req.status] || req.status}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${PRIORITY_CONFIG[req.priority]?.color || ''}`}
                      >
                        {PRIORITY_CONFIG[req.priority]?.label || req.priority}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-gray-500 line-clamp-1">{req.description}</p>
                    <div className="mt-2 flex items-center gap-3 text-xs text-gray-400">
                      <span>{req.customer_name}</span>
                      <span>{TYPE_LABELS[req.request_type] || req.request_type}</span>
                      <span>{new Date(req.created_at).toLocaleDateString('th-TH')}</span>
                    </div>
                  </div>
                  {req.satisfaction_rating && (
                    <div className="flex items-center gap-0.5 text-amber-400">
                      {'★'.repeat(req.satisfaction_rating)}
                      {'☆'.repeat(5 - req.satisfaction_rating)}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border-2 border-dashed border-gray-300 p-12 text-center">
            <h3 className="text-sm font-medium text-gray-900">ยังไม่มีคำร้อง</h3>
            <p className="mt-1 text-sm text-gray-500">สร้างคำร้องแรกเมื่อมีลูกค้าติดต่อเข้ามา</p>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
