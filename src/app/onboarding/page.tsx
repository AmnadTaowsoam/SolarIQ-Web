'use client'

// WK-019: Self-Serve Onboarding Wizard — Full 5-step implementation

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { api } from '@/lib/api'
import type { AxiosRequestConfig } from 'axios'

// ---------------------------------------------------------------------------
// Thai provinces list
// ---------------------------------------------------------------------------
const THAI_PROVINCES = [
  'กระบี่', 'กรุงเทพมหานคร', 'กาญจนบุรี', 'กาฬสินธุ์', 'กำแพงเพชร',
  'ขอนแก่น', 'จันทบุรี', 'ฉะเชิงเทรา', 'ชลบุรี', 'ชัยนาท',
  'ชัยภูมิ', 'ชุมพร', 'เชียงราย', 'เชียงใหม่', 'ตรัง',
  'ตราด', 'ตาก', 'นครนายก', 'นครปฐม', 'นครพนม',
  'นครราชสีมา', 'นครศรีธรรมราช', 'นครสวรรค์', 'นนทบุรี', 'นราธิวาส',
  'น่าน', 'บึงกาฬ', 'บุรีรัมย์', 'ปทุมธานี', 'ประจวบคีรีขันธ์',
  'ปราจีนบุรี', 'ปัตตานี', 'พระนครศรีอยุธยา', 'พะเยา', 'พังงา',
  'พัทลุง', 'พิจิตร', 'พิษณุโลก', 'เพชรบุรี', 'เพชรบูรณ์',
  'แพร่', 'ภูเก็ต', 'มหาสารคาม', 'มุกดาหาร', 'แม่ฮ่องสอน',
  'ยโสธร', 'ยะลา', 'ร้อยเอ็ด', 'ระนอง', 'ระยอง',
  'ราชบุรี', 'ลพบุรี', 'ลำปาง', 'ลำพูน', 'เลย',
  'ศรีสะเกษ', 'สกลนคร', 'สงขลา', 'สตูล', 'สมุทรปราการ',
  'สมุทรสงคราม', 'สมุทรสาคร', 'สระแก้ว', 'สระบุรี', 'สิงห์บุรี',
  'สุโขทัย', 'สุพรรณบุรี', 'สุราษฎร์ธานี', 'สุรินทร์', 'หนองคาย',
  'หนองบัวลำภู', 'อ่างทอง', 'อำนาจเจริญ', 'อุดรธานี', 'อุตรดิตถ์',
  'อุทัยธานี', 'อุบลราชธานี',
]

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CompanyData {
  name: string
  taxId: string
  address: string
  province: string
  phone: string
  logoFile: File | null
  logoPreview: string | null
}

interface LineData {
  channelId: string
  channelSecret: string
  skipped: boolean
}

interface InviteMember {
  email: string
  role: 'member' | 'admin'
}

interface TeamData {
  members: InviteMember[]
  skipped: boolean
}

interface DemoLeadData {
  name: string
  phone: string
  monthlyBill: string
  province: string
  skipped: boolean
}

interface SetupSummary {
  companyName: string
  lineConnected: boolean
  teamInvited: number
  demoLeadCreated: boolean
}

// ---------------------------------------------------------------------------
// Tax ID validation: XX-XXXXXXX-XX-X  (13 digits formatted)
// ---------------------------------------------------------------------------
function validateTaxId(value: string): boolean {
  const cleaned = value.replace(/-/g, '')
  return /^\d{13}$/.test(cleaned)
}

function formatTaxId(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 13)
  if (digits.length <= 1) return digits
  if (digits.length <= 8) return `${digits.slice(0, 1)}-${digits.slice(1)}`
  if (digits.length <= 10) return `${digits.slice(0, 1)}-${digits.slice(1, 8)}-${digits.slice(8)}`
  if (digits.length <= 12) return `${digits.slice(0, 1)}-${digits.slice(1, 8)}-${digits.slice(8, 10)}-${digits.slice(10)}`
  return `${digits.slice(0, 1)}-${digits.slice(1, 8)}-${digits.slice(8, 10)}-${digits.slice(10)}`
}

// ---------------------------------------------------------------------------
// Step indicator
// ---------------------------------------------------------------------------
const STEP_LABELS = [
  'ข้อมูลบริษัท',
  'LINE OA',
  'เชิญทีม',
  'Lead แรก',
  'เสร็จสิ้น',
]

function StepIndicator({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) {
  return (
    <div className="w-full">
      {/* Progress bar */}
      <div className="h-1.5 bg-orange-200 rounded-full overflow-hidden mb-3">
        <div
          className="h-full bg-white rounded-full transition-all duration-500"
          style={{ width: `${(currentStep / totalSteps) * 100}%` }}
        />
      </div>
      {/* Step dots */}
      <div className="flex justify-between">
        {STEP_LABELS.map((label, idx) => {
          const stepNum = idx + 1
          const isCompleted = stepNum < currentStep
          const isCurrent = stepNum === currentStep
          return (
            <div key={label} className="flex flex-col items-center gap-1 flex-1">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  isCompleted
                    ? 'bg-white text-orange-600'
                    : isCurrent
                    ? 'bg-white text-orange-600 ring-2 ring-white ring-offset-2 ring-offset-orange-500'
                    : 'bg-orange-400 text-orange-100'
                }`}
              >
                {isCompleted ? (
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                ) : (
                  stepNum
                )}
              </div>
              <span className={`text-[10px] text-center leading-tight ${isCurrent ? 'text-white font-semibold' : 'text-orange-200'}`}>
                {label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Step 1 — Company Profile
// ---------------------------------------------------------------------------
function Step1Company({
  data,
  onChange,
  onNext,
  isLoading,
  error,
}: {
  data: CompanyData
  onChange: (d: Partial<CompanyData>) => void
  onNext: () => void
  isLoading: boolean
  error: string
}) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const preview = URL.createObjectURL(file)
    onChange({ logoFile: file, logoPreview: preview })
  }

  const taxIdError =
    data.taxId && !validateTaxId(data.taxId) ? 'รูปแบบเลขประจำตัวผู้เสียภาษีไม่ถูกต้อง (13 หลัก)' : ''

  const canProceed = !!data.name.trim() && (!data.taxId || validateTaxId(data.taxId))

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-1">ข้อมูลบริษัท</h2>
        <p className="text-gray-500 text-sm">กรอกข้อมูลพื้นฐานของบริษัทคุณ</p>
      </div>

      {/* Logo upload */}
      <div className="flex items-center gap-4">
        <div
          onClick={() => fileInputRef.current?.click()}
          className="w-20 h-20 rounded-2xl border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-orange-400 transition-colors overflow-hidden bg-gray-50 flex-shrink-0"
        >
          {data.logoPreview ? (
            <img src={data.logoPreview} alt="logo preview" className="w-full h-full object-cover" />
          ) : (
            <div className="text-center">
              <svg className="w-6 h-6 text-gray-400 mx-auto mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
              <span className="text-[10px] text-gray-400">โลโก้</span>
            </div>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleLogoChange}
        />
        <div className="text-sm text-gray-500">
          <p className="font-medium text-gray-700 mb-0.5">อัพโหลดโลโก้บริษัท</p>
          <p>รองรับ JPG, PNG (ไม่บังคับ)</p>
          {data.logoFile && (
            <p className="text-orange-600 text-xs mt-1">{data.logoFile.name}</p>
          )}
        </div>
      </div>

      {/* Company name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          ชื่อบริษัท <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={data.name}
          onChange={(e) => onChange({ name: e.target.value })}
          placeholder="บริษัท โซลาร์ไอคิว จำกัด"
          className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
        />
      </div>

      {/* Tax ID */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          เลขประจำตัวผู้เสียภาษี
          <span className="text-gray-400 font-normal ml-1">(ไม่บังคับ)</span>
        </label>
        <input
          type="text"
          value={data.taxId}
          onChange={(e) => onChange({ taxId: formatTaxId(e.target.value) })}
          placeholder="X-XXXXXXX-XX-X"
          className={`w-full rounded-xl border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent ${
            taxIdError ? 'border-red-300' : 'border-gray-300'
          }`}
        />
        {taxIdError && <p className="mt-1 text-xs text-red-600">{taxIdError}</p>}
        {!taxIdError && data.taxId && (
          <p className="mt-1 text-xs text-green-600">รูปแบบถูกต้อง</p>
        )}
      </div>

      {/* Address */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">ที่อยู่</label>
        <textarea
          value={data.address}
          onChange={(e) => onChange({ address: e.target.value })}
          placeholder="เลขที่, ถนน, แขวง/ตำบล, เขต/อำเภอ"
          rows={2}
          className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
        />
      </div>

      {/* Province */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">จังหวัด</label>
        <select
          value={data.province}
          onChange={(e) => onChange({ province: e.target.value })}
          className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
        >
          <option value="">-- เลือกจังหวัด --</option>
          {THAI_PROVINCES.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </div>

      {/* Phone */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">เบอร์โทรศัพท์</label>
        <input
          type="tel"
          value={data.phone}
          onChange={(e) => onChange({ phone: e.target.value })}
          placeholder="02-XXX-XXXX"
          className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <button
        onClick={onNext}
        disabled={!canProceed || isLoading}
        className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl font-bold text-base transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            กำลังบันทึก...
          </span>
        ) : (
          'ถัดไป →'
        )}
      </button>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Step 2 — LINE OA Integration
// ---------------------------------------------------------------------------
function Step2Line({
  data,
  orgId,
  onChange,
  onNext,
  onSkip,
  isLoading,
  error,
}: {
  data: LineData
  orgId: string
  onChange: (d: Partial<LineData>) => void
  onNext: () => void
  onSkip: () => void
  isLoading: boolean
  error: string
}) {
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'ok' | 'fail'>('idle')
  const [showSecret, setShowSecret] = useState(false)
  const webhookUrl = `https://api.solariq.app/webhooks/line/${orgId || '{org_id}'}`

  const handleCopy = () => {
    navigator.clipboard.writeText(webhookUrl).catch(() => undefined)
  }

  const handleTest = async () => {
    setTestStatus('testing')
    try {
      await api.post('/api/v1/line/verify', {
        channel_id: data.channelId,
        channel_secret: data.channelSecret,
      })
      setTestStatus('ok')
    } catch {
      setTestStatus('fail')
    }
  }

  const canProceed = !!data.channelId.trim() && !!data.channelSecret.trim()

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-1">เชื่อมต่อ LINE OA</h2>
        <p className="text-gray-500 text-sm">เชื่อมต่อ LINE Official Account เพื่อรับ Lead อัตโนมัติ</p>
      </div>

      {/* Channel ID */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Channel ID</label>
        <input
          type="text"
          value={data.channelId}
          onChange={(e) => onChange({ channelId: e.target.value })}
          placeholder="1234567890"
          className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
        />
      </div>

      {/* Channel Secret */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Channel Secret</label>
        <div className="relative">
          <input
            type={showSecret ? 'text' : 'password'}
            value={data.channelSecret}
            onChange={(e) => onChange({ channelSecret: e.target.value })}
            placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
            className="w-full rounded-xl border border-gray-300 px-4 py-2.5 pr-11 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
          <button
            type="button"
            onClick={() => setShowSecret((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showSecret ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Webhook URL */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Webhook URL
          <span className="text-gray-400 font-normal ml-1">(คัดลอกไปใส่ใน LINE Developers)</span>
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            readOnly
            value={webhookUrl}
            className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm bg-gray-50 text-gray-600 select-all"
          />
          <button
            onClick={handleCopy}
            className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-medium text-gray-700 transition-colors flex-shrink-0 flex items-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
            </svg>
            คัดลอก
          </button>
        </div>
      </div>

      {/* Test Connection */}
      {canProceed && (
        <button
          onClick={handleTest}
          disabled={testStatus === 'testing'}
          className="w-full py-3 border-2 border-orange-400 text-orange-600 rounded-2xl font-medium text-sm transition-colors hover:bg-orange-50 disabled:opacity-50"
        >
          {testStatus === 'testing' ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
              กำลังทดสอบ...
            </span>
          ) : testStatus === 'ok' ? (
            <span className="flex items-center justify-center gap-2 text-green-600">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              เชื่อมต่อสำเร็จ!
            </span>
          ) : testStatus === 'fail' ? (
            <span className="flex items-center justify-center gap-2 text-red-600">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
              ไม่สามารถเชื่อมต่อได้ — ทดสอบอีกครั้ง
            </span>
          ) : (
            'ทดสอบการเชื่อมต่อ'
          )}
        </button>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <button
        onClick={onNext}
        disabled={!canProceed || isLoading}
        className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl font-bold text-base transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            กำลังบันทึก...
          </span>
        ) : (
          'ถัดไป →'
        )}
      </button>
      <button onClick={onSkip} className="w-full py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors">
        ข้ามขั้นตอนนี้
      </button>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Step 3 — Team Invites
// ---------------------------------------------------------------------------
function Step3Team({
  data,
  onChange,
  onNext,
  onSkip,
  isLoading,
  error,
}: {
  data: TeamData
  onChange: (d: Partial<TeamData>) => void
  onNext: () => void
  onSkip: () => void
  isLoading: boolean
  error: string
}) {
  const addMember = () => {
    if (data.members.length >= 5) return
    onChange({ members: [...data.members, { email: '', role: 'member' }] })
  }

  const updateMember = (idx: number, patch: Partial<InviteMember>) => {
    const updated = data.members.map((m, i) => (i === idx ? { ...m, ...patch } : m))
    onChange({ members: updated })
  }

  const removeMember = (idx: number) => {
    onChange({ members: data.members.filter((_, i) => i !== idx) })
  }

  const validMembers = data.members.filter((m) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(m.email))

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-1">เชิญสมาชิกทีม</h2>
        <p className="text-gray-500 text-sm">เพิ่มสมาชิกทีมของคุณ (สูงสุด 5 คน)</p>
      </div>

      {data.members.length === 0 ? (
        <div className="bg-gray-50 rounded-2xl p-6 text-center">
          <svg className="w-10 h-10 text-gray-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
          </svg>
          <p className="text-gray-400 text-sm">ยังไม่มีสมาชิกทีม</p>
        </div>
      ) : (
        <div className="space-y-3">
          {data.members.map((member, idx) => (
            <div key={idx} className="bg-gray-50 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">สมาชิกที่ {idx + 1}</span>
                <button
                  onClick={() => removeMember(idx)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <input
                type="email"
                value={member.email}
                onChange={(e) => updateMember(idx, { email: e.target.value })}
                placeholder="email@example.com"
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
              <div className="flex gap-2">
                {(['member', 'admin'] as const).map((role) => (
                  <button
                    key={role}
                    onClick={() => updateMember(idx, { role })}
                    className={`flex-1 py-2 rounded-xl border-2 text-sm font-medium transition-all ${
                      member.role === role
                        ? 'border-orange-500 bg-orange-50 text-orange-700'
                        : 'border-gray-200 text-gray-600 hover:border-orange-200'
                    }`}
                  >
                    {role === 'member' ? 'สมาชิก' : 'ผู้ดูแล'}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {data.members.length < 5 && (
        <button
          onClick={addMember}
          className="w-full py-3 border-2 border-dashed border-gray-300 rounded-2xl text-sm text-gray-500 hover:border-orange-400 hover:text-orange-600 transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          เพิ่มสมาชิก {data.members.length}/5
        </button>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {validMembers.length > 0 && (
        <button
          onClick={onNext}
          disabled={isLoading}
          className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl font-bold text-base transition-colors disabled:opacity-50"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              กำลังส่งคำเชิญ...
            </span>
          ) : (
            `ส่งคำเชิญ ${validMembers.length} คน →`
          )}
        </button>
      )}
      <button onClick={onSkip} className="w-full py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors">
        ข้ามขั้นตอนนี้
      </button>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Step 4 — Demo Lead
// ---------------------------------------------------------------------------
function Step4Lead({
  data,
  onChange,
  onNext,
  onSkip,
  isLoading,
  error,
}: {
  data: DemoLeadData
  onChange: (d: Partial<DemoLeadData>) => void
  onNext: () => void
  onSkip: () => void
  isLoading: boolean
  error: string
}) {
  const canProceed = !!data.name.trim() && !!data.phone.trim() && !!data.monthlyBill.trim()

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-1">สร้าง Lead แรก</h2>
        <p className="text-gray-500 text-sm">ลองสร้าง Lead ลูกค้าตัวอย่างเพื่อทดลองใช้งาน</p>
      </div>

      <div className="bg-orange-50 rounded-2xl p-4 border border-orange-100">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
          </svg>
          <p className="text-sm text-orange-700">Lead นี้จะเป็นข้อมูลจริงในระบบ คุณสามารถทดลองขั้นตอนการทำงานได้เลย</p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          ชื่อลูกค้า <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={data.name}
          onChange={(e) => onChange({ name: e.target.value })}
          placeholder="นายสมชาย ใจดี"
          className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          เบอร์โทรศัพท์ <span className="text-red-500">*</span>
        </label>
        <input
          type="tel"
          value={data.phone}
          onChange={(e) => onChange({ phone: e.target.value })}
          placeholder="08X-XXX-XXXX"
          className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          ค่าไฟฟ้าเฉลี่ยต่อเดือน (บาท) <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            type="number"
            value={data.monthlyBill}
            onChange={(e) => onChange({ monthlyBill: e.target.value })}
            placeholder="3000"
            min={0}
            className="w-full rounded-xl border border-gray-300 px-4 py-2.5 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">บาท</span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">จังหวัด</label>
        <select
          value={data.province}
          onChange={(e) => onChange({ province: e.target.value })}
          className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
        >
          <option value="">-- เลือกจังหวัด --</option>
          {THAI_PROVINCES.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <button
        onClick={onNext}
        disabled={!canProceed || isLoading}
        className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl font-bold text-base transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            กำลังสร้าง Lead...
          </span>
        ) : (
          'สร้าง Lead →'
        )}
      </button>
      <button onClick={onSkip} className="w-full py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors">
        ข้ามขั้นตอนนี้
      </button>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Step 5 — Complete
// ---------------------------------------------------------------------------
function Step5Complete({
  summary,
  onFinish,
  isLoading,
}: {
  summary: SetupSummary
  onFinish: () => void
  isLoading: boolean
}) {
  return (
    <div className="space-y-6 text-center">
      {/* Success animation */}
      <div className="relative">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto animate-bounce-slow">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
        </div>
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 text-2xl animate-bounce">🎉</div>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">ตั้งค่าเสร็จสิ้น!</h2>
        <p className="text-gray-500 text-sm">SolarIQ พร้อมใช้งานแล้วสำหรับทีมของคุณ</p>
      </div>

      {/* Summary */}
      <div className="bg-gray-50 rounded-2xl p-5 text-left space-y-3">
        <h3 className="font-semibold text-gray-800 text-sm mb-3">สรุปการตั้งค่า</h3>

        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-800">บริษัท: {summary.companyName}</p>
          </div>
          <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>

        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${summary.lineConnected ? 'bg-green-100' : 'bg-gray-100'}`}>
            <svg className={`w-4 h-4 ${summary.lineConnected ? 'text-green-600' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
            </svg>
          </div>
          <p className="text-sm text-gray-700 flex-1">
            LINE OA: {summary.lineConnected ? 'เชื่อมต่อแล้ว' : 'ยังไม่ได้เชื่อมต่อ'}
          </p>
          {summary.lineConnected ? (
            <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          ) : (
            <span className="text-xs text-gray-400">ข้าม</span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${summary.teamInvited > 0 ? 'bg-blue-100' : 'bg-gray-100'}`}>
            <svg className={`w-4 h-4 ${summary.teamInvited > 0 ? 'text-blue-600' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
            </svg>
          </div>
          <p className="text-sm text-gray-700 flex-1">
            ทีม: {summary.teamInvited > 0 ? `เชิญ ${summary.teamInvited} คน` : 'ยังไม่ได้เชิญ'}
          </p>
          {summary.teamInvited > 0 ? (
            <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          ) : (
            <span className="text-xs text-gray-400">ข้าม</span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${summary.demoLeadCreated ? 'bg-purple-100' : 'bg-gray-100'}`}>
            <svg className={`w-4 h-4 ${summary.demoLeadCreated ? 'text-purple-600' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
          </div>
          <p className="text-sm text-gray-700 flex-1">
            Lead แรก: {summary.demoLeadCreated ? 'สร้างแล้ว' : 'ยังไม่ได้สร้าง'}
          </p>
          {summary.demoLeadCreated ? (
            <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          ) : (
            <span className="text-xs text-gray-400">ข้าม</span>
          )}
        </div>
      </div>

      <button
        onClick={onFinish}
        disabled={isLoading}
        className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl font-bold text-base transition-colors disabled:opacity-50"
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            กำลังเตรียม Dashboard...
          </span>
        ) : (
          'ไปยัง Dashboard →'
        )}
      </button>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main Onboarding Page
// ---------------------------------------------------------------------------

export default function OnboardingPage() {
  const { user } = useAuth()
  const router = useRouter()

  const [step, setStep] = useState(1)
  const totalSteps = 5

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const [companyData, setCompanyData] = useState<CompanyData>({
    name: '',
    taxId: '',
    address: '',
    province: '',
    phone: '',
    logoFile: null,
    logoPreview: null,
  })

  const [lineData, setLineData] = useState<LineData>({
    channelId: '',
    channelSecret: '',
    skipped: false,
  })

  const [teamData, setTeamData] = useState<TeamData>({
    members: [],
    skipped: false,
  })

  const [demoLeadData, setDemoLeadData] = useState<DemoLeadData>({
    name: '',
    phone: '',
    monthlyBill: '',
    province: '',
    skipped: false,
  })

  const [summary, setSummary] = useState<SetupSummary>({
    companyName: '',
    lineConnected: false,
    teamInvited: 0,
    demoLeadCreated: false,
  })

  useEffect(() => {
    if (!user) router.push('/login')
  }, [user, router])

  const orgId = (user as { orgId?: string } | null)?.orgId || ''

  const clearError = useCallback(() => setError(''), [])

  // Step 1 submit
  const handleStep1Next = async () => {
    setIsLoading(true)
    setError('')
    try {
      // Upload logo first if present
      if (companyData.logoFile) {
        const formData = new FormData()
        formData.append('logo', companyData.logoFile)
        const config: AxiosRequestConfig = { headers: { 'Content-Type': 'multipart/form-data' } }
        await api.post('/api/v1/orgs/logo', formData, config)
      }

      // Save company data
      await api.patch('/api/v1/orgs/me', {
        name: companyData.name,
        tax_id: companyData.taxId || undefined,
        address: companyData.address || undefined,
        province: companyData.province || undefined,
        phone: companyData.phone || undefined,
      })

      setSummary((prev) => ({ ...prev, companyName: companyData.name }))
      setStep(2)
    } catch {
      setError('ไม่สามารถบันทึกข้อมูลบริษัทได้ กรุณาลองใหม่')
    } finally {
      setIsLoading(false)
    }
  }

  // Step 2 submit
  const handleStep2Next = async () => {
    setIsLoading(true)
    setError('')
    try {
      // Save LINE integration (the verify endpoint also saves config)
      await api.post('/api/v1/line/verify', {
        channel_id: lineData.channelId,
        channel_secret: lineData.channelSecret,
      })
      setLineData((prev) => ({ ...prev, skipped: false }))
      setSummary((prev) => ({ ...prev, lineConnected: true }))
      setStep(3)
    } catch {
      setError('ไม่สามารถบันทึก LINE OA ได้ กรุณาตรวจสอบ Channel ID และ Secret')
    } finally {
      setIsLoading(false)
    }
  }

  const handleStep2Skip = () => {
    setLineData((prev) => ({ ...prev, skipped: true }))
    setSummary((prev) => ({ ...prev, lineConnected: false }))
    setStep(3)
  }

  // Step 3 submit
  const handleStep3Next = async () => {
    const validMembers = teamData.members.filter((m) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(m.email))
    if (validMembers.length === 0) {
      handleStep3Skip()
      return
    }

    setIsLoading(true)
    setError('')
    try {
      await api.post('/api/v1/orgs/invites', {
        invites: validMembers.map((m) => ({ email: m.email, role: m.role })),
      })
      setTeamData((prev) => ({ ...prev, skipped: false }))
      setSummary((prev) => ({ ...prev, teamInvited: validMembers.length }))
      setStep(4)
    } catch {
      setError('ไม่สามารถส่งคำเชิญได้ กรุณาลองใหม่')
    } finally {
      setIsLoading(false)
    }
  }

  const handleStep3Skip = () => {
    setTeamData((prev) => ({ ...prev, skipped: true }))
    setSummary((prev) => ({ ...prev, teamInvited: 0 }))
    setStep(4)
  }

  // Step 4 submit
  const handleStep4Next = async () => {
    setIsLoading(true)
    setError('')
    try {
      await api.post('/api/v1/leads', {
        name: demoLeadData.name,
        phone: demoLeadData.phone,
        monthly_bill: parseFloat(demoLeadData.monthlyBill),
        province: demoLeadData.province || undefined,
        address: demoLeadData.province || undefined,
      })
      setDemoLeadData((prev) => ({ ...prev, skipped: false }))
      setSummary((prev) => ({ ...prev, demoLeadCreated: true }))
      setStep(5)
    } catch {
      setError('ไม่สามารถสร้าง Lead ได้ กรุณาลองใหม่')
    } finally {
      setIsLoading(false)
    }
  }

  const handleStep4Skip = () => {
    setDemoLeadData((prev) => ({ ...prev, skipped: true }))
    setSummary((prev) => ({ ...prev, demoLeadCreated: false }))
    setStep(5)
  }

  // Step 5 — Mark onboarding complete
  const handleFinish = async () => {
    setIsLoading(true)
    try {
      await api.post('/api/v1/onboarding/complete', {})
    } catch {
      // Non-critical — still redirect
    } finally {
      setIsLoading(false)
      router.push('/dashboard')
    }
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* Header */}
      <div className="bg-orange-500 text-white px-4 pt-6 pb-8">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center gap-3 mb-4">
            {step > 1 && step < 5 && (
              <button
                onClick={() => {
                  clearError()
                  setStep((s) => s - 1)
                }}
                className="w-8 h-8 flex items-center justify-center hover:bg-orange-400 rounded-full transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            <div className="flex-1">
              <h1 className="text-lg font-bold">ตั้งค่า SolarIQ</h1>
              <p className="text-orange-100 text-xs">ขั้นตอน {step}/{totalSteps}</p>
            </div>
          </div>
          <StepIndicator currentStep={step} totalSteps={totalSteps} />
        </div>
      </div>

      {/* Card offset from header */}
      <div className="max-w-lg mx-auto px-4 -mt-4">
        <div className="bg-white rounded-3xl shadow-sm p-6 border border-gray-100">
          {step === 1 && (
            <Step1Company
              data={companyData}
              onChange={(d) => setCompanyData((prev) => ({ ...prev, ...d }))}
              onNext={handleStep1Next}
              isLoading={isLoading}
              error={error}
            />
          )}
          {step === 2 && (
            <Step2Line
              data={lineData}
              orgId={orgId}
              onChange={(d) => setLineData((prev) => ({ ...prev, ...d }))}
              onNext={handleStep2Next}
              onSkip={handleStep2Skip}
              isLoading={isLoading}
              error={error}
            />
          )}
          {step === 3 && (
            <Step3Team
              data={teamData}
              onChange={(d) => setTeamData((prev) => ({ ...prev, ...d }))}
              onNext={handleStep3Next}
              onSkip={handleStep3Skip}
              isLoading={isLoading}
              error={error}
            />
          )}
          {step === 4 && (
            <Step4Lead
              data={demoLeadData}
              onChange={(d) => setDemoLeadData((prev) => ({ ...prev, ...d }))}
              onNext={handleStep4Next}
              onSkip={handleStep4Skip}
              isLoading={isLoading}
              error={error}
            />
          )}
          {step === 5 && (
            <Step5Complete
              summary={summary}
              onFinish={handleFinish}
              isLoading={isLoading}
            />
          )}
        </div>
      </div>

      <style>{`
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
