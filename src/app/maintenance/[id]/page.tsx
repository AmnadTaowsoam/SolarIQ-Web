'use client'

import { use, useState } from 'react'
import { AppLayout } from '@/components/layout'
import { useAuth } from '@/context'
import {
  useInstallation,
  useMaintenanceSchedules,
  useServiceRecords,
  useCreateMaintenanceSchedule,
  useCreateServiceRecord,
} from '@/hooks/useMaintenance'
import WarrantyBadge from '@/components/maintenance/WarrantyBadge'
import Link from 'next/link'

export default function InstallationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { user } = useAuth()
  const { data: installation, isLoading } = useInstallation(id)
  const { data: schedules } = useMaintenanceSchedules(id)
  const { data: records } = useServiceRecords(id)
  const createSchedule = useCreateMaintenanceSchedule(id)
  const createRecord = useCreateServiceRecord(id)

  const [showScheduleForm, setShowScheduleForm] = useState(false)
  const [showRecordForm, setShowRecordForm] = useState(false)

  if (!user) {
    return null
  }

  if (isLoading) {
    return (
      <AppLayout user={user}>
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-t-transparent" />
        </div>
      </AppLayout>
    )
  }

  if (!installation) {
    return (
      <AppLayout user={user}>
        <div className="p-12 text-center text-gray-500">ไม่พบข้อมูลงานติดตั้ง</div>
      </AppLayout>
    )
  }

  return (
    <AppLayout user={user}>
      <div className="max-w-5xl space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Link href="/maintenance" className="hover:text-amber-600">
            บำรุงรักษา
          </Link>
          <span>/</span>
          <span className="text-gray-900">{installation.customer_name}</span>
        </div>

        {/* Header */}
        <div className="rounded-xl border bg-white p-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">{installation.customer_name}</h1>
              <p className="mt-1 text-sm text-gray-500">
                {installation.address || 'ไม่ระบุที่อยู่'}
              </p>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                installation.status === 'active'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {installation.status === 'active' ? 'ใช้งาน' : installation.status}
            </span>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
            <div>
              <span className="text-gray-500">ขนาดระบบ</span>
              <p className="font-semibold">{installation.system_size_kw} kWp</p>
            </div>
            <div>
              <span className="text-gray-500">แผงโซลาร์</span>
              <p className="font-semibold">
                {installation.panel_brand || '-'} {installation.panel_model || ''}
              </p>
            </div>
            <div>
              <span className="text-gray-500">อินเวอร์เตอร์</span>
              <p className="font-semibold">
                {installation.inverter_brand || '-'} {installation.inverter_model || ''}
              </p>
            </div>
            <div>
              <span className="text-gray-500">วันที่ติดตั้ง</span>
              <p className="font-semibold">
                {installation.installation_date
                  ? new Date(installation.installation_date).toLocaleDateString('th-TH')
                  : '-'}
              </p>
            </div>
          </div>

          {/* Warranty Status */}
          {installation.warranty_status && (
            <div className="mt-4 flex flex-wrap gap-2">
              <WarrantyBadge
                label="แผง"
                status={installation.warranty_status.panel.status}
                daysRemaining={installation.warranty_status.panel.days_remaining}
              />
              <WarrantyBadge
                label="อินเวอร์เตอร์"
                status={installation.warranty_status.inverter.status}
                daysRemaining={installation.warranty_status.inverter.days_remaining}
              />
              <WarrantyBadge
                label="ติดตั้ง"
                status={installation.warranty_status.installation.status}
                daysRemaining={installation.warranty_status.installation.days_remaining}
              />
            </div>
          )}
        </div>

        {/* Maintenance Schedules */}
        <div className="rounded-xl border bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">ตารางบำรุงรักษา</h2>
            <button
              onClick={() => setShowScheduleForm(!showScheduleForm)}
              className="rounded-lg bg-amber-100 px-3 py-1.5 text-xs font-medium text-amber-700 hover:bg-amber-200"
            >
              + เพิ่มตาราง
            </button>
          </div>

          {showScheduleForm && (
            <form
              className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-4"
              onSubmit={async (e) => {
                e.preventDefault()
                const form = e.target as HTMLFormElement
                const data = new FormData(form)
                await createSchedule.mutateAsync({
                  maintenance_type: data.get('type') as string,
                  frequency_months: Number(data.get('frequency')),
                  next_due_date: data.get('next_date') as string,
                  notes: data.get('notes') as string,
                })
                setShowScheduleForm(false)
                form.reset()
              }}
            >
              <div className="grid gap-3 md:grid-cols-4">
                <select name="type" required className="rounded-lg border px-3 py-2 text-sm">
                  <option value="cleaning">ล้างแผง</option>
                  <option value="inspection">ตรวจสอบระบบ</option>
                  <option value="inverter_check">เช็คอินเวอร์เตอร์</option>
                  <option value="general">ทั่วไป</option>
                </select>
                <select name="frequency" className="rounded-lg border px-3 py-2 text-sm">
                  <option value="3">ทุก 3 เดือน</option>
                  <option value="6">ทุก 6 เดือน</option>
                  <option value="12">ทุกปี</option>
                </select>
                <input
                  name="next_date"
                  type="date"
                  required
                  className="rounded-lg border px-3 py-2 text-sm"
                />
                <input
                  name="notes"
                  placeholder="หมายเหตุ"
                  className="rounded-lg border px-3 py-2 text-sm"
                />
              </div>
              <button
                type="submit"
                className="mt-3 rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600"
              >
                บันทึก
              </button>
            </form>
          )}

          {schedules && schedules.length > 0 ? (
            <div className="space-y-2">
              {schedules.map((s) => (
                <div key={s.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <span className="text-sm font-medium text-gray-900">
                      {s.maintenance_type === 'cleaning'
                        ? 'ล้างแผง'
                        : s.maintenance_type === 'inspection'
                          ? 'ตรวจสอบ'
                          : s.maintenance_type === 'inverter_check'
                            ? 'เช็คอินเวอร์เตอร์'
                            : s.maintenance_type}
                    </span>
                    <span className="ml-2 text-xs text-gray-500">
                      ทุก {s.frequency_months} เดือน
                    </span>
                  </div>
                  <span className="text-sm text-gray-600">
                    {s.next_due_date
                      ? `ครั้งถัดไป: ${new Date(s.next_due_date).toLocaleDateString('th-TH')}`
                      : 'ยังไม่กำหนด'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">ยังไม่มีตารางบำรุงรักษา</p>
          )}
        </div>

        {/* Service Records */}
        <div className="rounded-xl border bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">ประวัติการบำรุงรักษา</h2>
            <button
              onClick={() => setShowRecordForm(!showRecordForm)}
              className="rounded-lg bg-blue-100 px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-200"
            >
              + บันทึกการซ่อม
            </button>
          </div>

          {showRecordForm && (
            <form
              className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-4"
              onSubmit={async (e) => {
                e.preventDefault()
                const form = e.target as HTMLFormElement
                const data = new FormData(form)
                await createRecord.mutateAsync({
                  service_date: data.get('date') as string,
                  service_type: data.get('type') as string,
                  description: data.get('description') as string,
                  cost_thb: Number(data.get('cost')) || undefined,
                  technician_name: data.get('technician') as string,
                })
                setShowRecordForm(false)
                form.reset()
              }}
            >
              <div className="grid gap-3 md:grid-cols-3">
                <input
                  name="date"
                  type="date"
                  required
                  className="rounded-lg border px-3 py-2 text-sm"
                />
                <select name="type" required className="rounded-lg border px-3 py-2 text-sm">
                  <option value="cleaning">ล้างแผง</option>
                  <option value="inspection">ตรวจสอบ</option>
                  <option value="repair">ซ่อม</option>
                  <option value="replacement">เปลี่ยนอุปกรณ์</option>
                </select>
                <input
                  name="technician"
                  placeholder="ช่างผู้ดูแล"
                  className="rounded-lg border px-3 py-2 text-sm"
                />
              </div>
              <textarea
                name="description"
                placeholder="รายละเอียดงาน"
                className="mt-3 w-full rounded-lg border px-3 py-2 text-sm"
                rows={2}
              />
              <input
                name="cost"
                type="number"
                placeholder="ค่าใช้จ่าย (บาท)"
                className="mt-2 rounded-lg border px-3 py-2 text-sm"
              />
              <button
                type="submit"
                className="mt-3 rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600"
              >
                บันทึก
              </button>
            </form>
          )}

          {records && records.length > 0 ? (
            <div className="space-y-3">
              {records.map((r) => (
                <div key={r.id} className="rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">
                      {r.service_type === 'cleaning'
                        ? 'ล้างแผง'
                        : r.service_type === 'inspection'
                          ? 'ตรวจสอบ'
                          : r.service_type === 'repair'
                            ? 'ซ่อม'
                            : r.service_type === 'replacement'
                              ? 'เปลี่ยนอุปกรณ์'
                              : r.service_type}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(r.service_date).toLocaleDateString('th-TH')}
                    </span>
                  </div>
                  {r.description && <p className="mt-1 text-sm text-gray-600">{r.description}</p>}
                  <div className="mt-2 flex gap-4 text-xs text-gray-500">
                    {r.technician_name && <span>ช่าง: {r.technician_name}</span>}
                    {r.cost_thb && <span>ค่าใช้จ่าย: {r.cost_thb.toLocaleString()} บาท</span>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">ยังไม่มีประวัติการบำรุงรักษา</p>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
