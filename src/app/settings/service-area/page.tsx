'use client'

import { useEffect, useState } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card, CardHeader, CardBody, CardFooter } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/context/AuthContext'
import apiClient from '@/lib/api'

// ---------------------------------------------------------------------------
// Thai provinces list (77 provinces)
// ---------------------------------------------------------------------------
const THAI_PROVINCES = [
  'กรุงเทพมหานคร', 'กระบี่', 'กาญจนบุรี', 'กาฬสินธุ์', 'กำแพงเพชร', 'ขอนแก่น',
  'จันทบุรี', 'ฉะเชิงเทรา', 'ชลบุรี', 'ชัยนาท', 'ชัยภูมิ', 'ชุมพร', 'เชียงราย',
  'เชียงใหม่', 'ตรัง', 'ตราด', 'ตาก', 'นครนายก', 'นครปฐม', 'นครพนม', 'นครราชสีมา',
  'นครศรีธรรมราช', 'นครสวรรค์', 'นนทบุรี', 'นราธิวาส', 'น่าน', 'บึงกาฬ', 'บุรีรัมย์',
  'ปทุมธานี', 'ประจวบคีรีขันธ์', 'ปราจีนบุรี', 'ปัตตานี', 'พระนครศรีอยุธยา', 'พะเยา',
  'พังงา', 'พัทลุง', 'พิจิตร', 'พิษณุโลก', 'เพชรบุรี', 'เพชรบูรณ์', 'แพร่', 'ภูเก็ต',
  'มหาสารคาม', 'มุกดาหาร', 'แม่ฮ่องสอน', 'ยโสธร', 'ยะลา', 'ร้อยเอ็ด', 'ระนอง',
  'ระยอง', 'ราชบุรี', 'ลพบุรี', 'ลำปาง', 'ลำพูน', 'เลย', 'ศรีสะเกษ', 'สกลนคร',
  'สงขลา', 'สตูล', 'สมุทรปราการ', 'สมุทรสงคราม', 'สมุทรสาคร', 'สระแก้ว', 'สระบุรี',
  'สิงห์บุรี', 'สุโขทัย', 'สุพรรณบุรี', 'สุราษฎร์ธานี', 'สุรินทร์', 'หนองคาย',
  'หนองบัวลำภู', 'อ่างทอง', 'อำนาจเจริญ', 'อุดรธานี', 'อุตรดิตถ์', 'อุทัยธานี', 'อุบลราชธานี',
]

type AreaMode = 'province' | 'radius' | 'polygon'

interface RoutingSettings {
  mode: AreaMode
  provinces: string[]
  radius_km: number
  radius_center_province: string
  max_leads_per_day: number
  active_from: string
  active_to: string
  paused: boolean
}

const DEFAULT_SETTINGS: RoutingSettings = {
  mode: 'province',
  provinces: [],
  radius_km: 50,
  radius_center_province: 'กรุงเทพมหานคร',
  max_leads_per_day: 10,
  active_from: '07:00',
  active_to: '22:00',
  paused: false,
}

export default function ServiceAreaPage() {
  const { user } = useAuth()
  const [settings, setSettings] = useState<RoutingSettings>(DEFAULT_SETTINGS)
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [provinceSearch, setProvinceSearch] = useState('')
  const [showProvinceDropdown, setShowProvinceDropdown] = useState(false)

  useEffect(() => {
    apiClient
      .get<{ data: RoutingSettings }>('/lead-routing/settings')
      .then((res) => setSettings({ ...DEFAULT_SETTINGS, ...res.data.data }))
      .catch(() => {/* use defaults */})
  }, [])

  const handleSave = async () => {
    setIsSaving(true)
    setSaved(false)
    try {
      await apiClient.patch('/lead-routing/settings', settings)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch {
      // silent
    } finally {
      setIsSaving(false)
    }
  }

  const addProvince = (province: string) => {
    if (!settings.provinces.includes(province)) {
      setSettings((prev) => ({ ...prev, provinces: [...prev.provinces, province] }))
    }
    setProvinceSearch('')
    setShowProvinceDropdown(false)
  }

  const removeProvince = (province: string) => {
    setSettings((prev) => ({ ...prev, provinces: prev.provinces.filter((p) => p !== province) }))
  }

  const filteredProvinces = THAI_PROVINCES.filter(
    (p) => p.includes(provinceSearch) && !settings.provinces.includes(p)
  )

  return (
    <AppLayout user={user}>
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">พื้นที่ให้บริการ</h1>
          <p className="text-sm text-gray-500 mt-1">กำหนดพื้นที่และกฎการรับ Lead อัตโนมัติ</p>
        </div>

        {/* Mode selector */}
        <Card>
          <CardHeader title="วิธีกำหนดพื้นที่" subtitle="เลือกรูปแบบการกำหนดพื้นที่ให้บริการ" />
          <CardBody>
            <div className="flex flex-col sm:flex-row gap-3">
              {([
                { value: 'province', label: 'เลือกจังหวัด' },
                { value: 'radius', label: 'รัศมี (กม.)' },
                { value: 'polygon', label: 'วาด Polygon (Enterprise)', enterprise: true },
              ] as { value: AreaMode; label: string; enterprise?: boolean }[]).map((opt) => (
                <label
                  key={opt.value}
                  className={`flex items-center gap-2 flex-1 p-3 rounded-xl border-2 cursor-pointer transition-colors ${
                    settings.mode === opt.value
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 hover:border-gray-300'
                  } ${opt.enterprise ? 'opacity-60' : ''}`}
                >
                  <input
                    type="radio"
                    name="mode"
                    value={opt.value}
                    checked={settings.mode === opt.value}
                    onChange={() => setSettings((prev) => ({ ...prev, mode: opt.value }))}
                    disabled={opt.enterprise}
                    className="h-4 w-4 text-orange-500"
                  />
                  <span className="text-sm font-medium text-gray-900">{opt.label}</span>
                  {opt.enterprise && (
                    <span className="ml-auto text-[10px] font-semibold px-1.5 py-0.5 bg-purple-50 text-purple-600 rounded-full">
                      Enterprise
                    </span>
                  )}
                </label>
              ))}
            </div>
          </CardBody>
        </Card>

        {/* Province selection */}
        {settings.mode === 'province' && (
          <Card>
            <CardHeader title="เลือกจังหวัด" subtitle="เลือกจังหวัดที่คุณให้บริการ" />
            <CardBody className="space-y-4">
              {/* Province multi-select */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="เพิ่มจังหวัด..."
                  value={provinceSearch}
                  onChange={(e) => {
                    setProvinceSearch(e.target.value)
                    setShowProvinceDropdown(true)
                  }}
                  onFocus={() => setShowProvinceDropdown(true)}
                  onBlur={() => setTimeout(() => setShowProvinceDropdown(false), 150)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                {showProvinceDropdown && filteredProvinces.length > 0 && (
                  <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                    {filteredProvinces.slice(0, 20).map((province) => (
                      <button
                        key={province}
                        type="button"
                        onMouseDown={() => addProvince(province)}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-orange-50 hover:text-orange-700 transition-colors"
                      >
                        {province}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Selected provinces */}
              {settings.provinces.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {settings.provinces.map((province) => (
                    <span
                      key={province}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-100 text-orange-800 rounded-full text-sm font-medium"
                    >
                      {province}
                      <button
                        type="button"
                        onClick={() => removeProvince(province)}
                        className="text-orange-500 hover:text-orange-700 ml-0.5"
                        aria-label={`ลบ ${province}`}
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400 italic">ยังไม่ได้เลือกจังหวัด</p>
              )}
            </CardBody>
          </Card>
        )}

        {/* Radius mode */}
        {settings.mode === 'radius' && (
          <Card>
            <CardHeader title="รัศมีจากจุดศูนย์กลาง" subtitle="เลือกจังหวัดเป็นจุดศูนย์กลางและกำหนดรัศมี" />
            <CardBody className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">จังหวัดศูนย์กลาง</label>
                  <select
                    value={settings.radius_center_province}
                    onChange={(e) => setSettings((prev) => ({ ...prev, radius_center_province: e.target.value }))}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    {THAI_PROVINCES.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">รัศมี (กม.)</label>
                  <input
                    type="range"
                    min={10}
                    max={200}
                    step={10}
                    value={settings.radius_km}
                    onChange={(e) => setSettings((prev) => ({ ...prev, radius_km: Number(e.target.value) }))}
                    className="w-full accent-orange-500"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>10 กม.</span>
                    <span className="font-semibold text-orange-600">{settings.radius_km} กม.</span>
                    <span>200 กม.</span>
                  </div>
                </div>
              </div>
              {/* Static map placeholder */}
              <div className="h-40 bg-gray-100 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <svg className="w-10 h-10 mx-auto mb-2 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6-7V4m6 16l4.553 2.276A1 1 0 0021 21.382V10.618a1 1 0 00-1.447-.894L15 12m0 0V4m0 0L9 7" />
                  </svg>
                  <p className="text-sm">แผนที่แสดงรัศมี {settings.radius_km} กม. จาก{settings.radius_center_province}</p>
                </div>
              </div>
            </CardBody>
          </Card>
        )}

        {/* Lead reception settings */}
        <Card>
          <CardHeader title="ตั้งค่าการรับงาน" subtitle="กำหนดปริมาณและเวลารับ Lead" />
          <CardBody className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">รับ Lead สูงสุด/วัน</label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={settings.max_leads_per_day}
                  onChange={(e) => setSettings((prev) => ({ ...prev, max_leads_per_day: Number(e.target.value) }))}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">เวลารับ Lead</label>
                <div className="flex items-center gap-2">
                  <input
                    type="time"
                    value={settings.active_from}
                    onChange={(e) => setSettings((prev) => ({ ...prev, active_from: e.target.value }))}
                    className="flex-1 rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  <span className="text-gray-500 text-sm">ถึง</span>
                  <input
                    type="time"
                    value={settings.active_to}
                    onChange={(e) => setSettings((prev) => ({ ...prev, active_to: e.target.value }))}
                    className="flex-1 rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>
            </div>

            {/* Pause toggle */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div>
                <p className="text-sm font-medium text-gray-900">หยุดรับ Lead ชั่วคราว</p>
                <p className="text-xs text-gray-500 mt-0.5">ระงับการส่ง Lead ใหม่มายังคุณชั่วคราว</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={settings.paused}
                onClick={() => setSettings((prev) => ({ ...prev, paused: !prev.paused }))}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  settings.paused ? 'bg-red-500' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    settings.paused ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {settings.paused && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                ขณะนี้คุณหยุดรับ Lead ชั่วคราว Lead ใหม่จะไม่ถูกส่งมาจนกว่าจะเปิดใช้งานอีกครั้ง
              </div>
            )}
          </CardBody>
          <CardFooter>
            <div className="flex items-center justify-between w-full">
              {saved && (
                <span className="text-sm text-green-600 font-medium">บันทึกเรียบร้อยแล้ว</span>
              )}
              {!saved && <span />}
              <Button variant="primary" size="sm" onClick={handleSave} disabled={isSaving}>
                {isSaving ? 'กำลังบันทึก...' : 'บันทึก'}
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </AppLayout>
  )
}
