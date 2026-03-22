'use client'

import React, { useEffect, useRef, useState } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card, CardHeader, CardBody, CardFooter } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useAuth, useBrand } from '@/context'
import { addBrandDomain, createBrand, setDefaultBrand, updateBrand, verifyBrandDomain } from '@/hooks/useBranding'
import apiClient from '@/lib/api'
import type { BrandDomain } from '@/types/branding'
import clsx from 'clsx'

const FONT_OPTIONS = [
  { value: 'Inter', label: 'Inter' },
  { value: 'Noto Sans Thai', label: 'Noto Sans Thai' },
  { value: 'Sarabun', label: 'Sarabun' },
  { value: 'Prompt', label: 'Prompt' },
]

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type SettingsTab =
  | 'company'
  | 'line'
  | 'notifications'
  | 'team'
  | 'api'
  | 'branding'

interface TeamMember {
  id: string
  name: string
  email: string
  role: 'admin' | 'contractor'
  status: 'active' | 'pending' | 'inactive'
}

interface NotificationChannel {
  line: boolean
  email: boolean
  sms: boolean
  webPush: boolean
}

interface NotificationPreference {
  key: string
  label: string
  channels: NotificationChannel
}

// ---------------------------------------------------------------------------
// Demo data
// ---------------------------------------------------------------------------

const DEMO_TEAM: TeamMember[] = [
  { id: '1', name: 'สมชาย วงศ์สวัสดิ์', email: 'somchai@solariq.co', role: 'admin', status: 'active' },
  { id: '2', name: 'วิภา สุขสันต์', email: 'wipa@solariq.co', role: 'contractor', status: 'active' },
  { id: '3', name: 'ประเสริฐ ทองคำ', email: 'prasert@solariq.co', role: 'contractor', status: 'pending' },
  { id: '4', name: 'นภา ศรีสุข', email: 'napa@solariq.co', role: 'contractor', status: 'inactive' },
]

const DEFAULT_NOTIFICATIONS: NotificationPreference[] = [
  { key: 'new_lead', label: 'แจ้งเตือน Lead ใหม่', channels: { line: true, email: true, sms: false, webPush: true } },
  { key: 'status_change', label: 'Lead เปลี่ยนสถานะ', channels: { line: true, email: false, sms: false, webPush: true } },
  { key: 'proposal_viewed', label: 'ลูกค้าเปิดดูใบเสนอราคา', channels: { line: true, email: true, sms: false, webPush: true } },
  { key: 'payment_received', label: 'ได้รับชำระเงิน', channels: { line: true, email: true, sms: true, webPush: false } },
  { key: 'weekly_summary', label: 'รายงานสรุปรายสัปดาห์', channels: { line: false, email: true, sms: false, webPush: false } },
]

// ---------------------------------------------------------------------------
// Tabs config
// ---------------------------------------------------------------------------

const TABS: { key: SettingsTab; label: string; icon: React.ReactNode; adminOnly?: boolean; enterpriseOnly?: boolean }[] = [
  {
    key: 'company',
    label: 'ข้อมูลบริษัท',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
      </svg>
    ),
  },
  {
    key: 'line',
    label: 'LINE OA',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
      </svg>
    ),
  },
  {
    key: 'notifications',
    label: 'การแจ้งเตือน',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
      </svg>
    ),
  },
  {
    key: 'team',
    label: 'สมาชิกทีม',
    adminOnly: true,
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
      </svg>
    ),
  },
  {
    key: 'api',
    label: 'API Keys',
    enterpriseOnly: true,
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
      </svg>
    ),
  },
  {
    key: 'branding',
    label: 'White-Label',
    enterpriseOnly: true,
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
      </svg>
    ),
  },
]

// ---------------------------------------------------------------------------
// Toggle Switch component
// ---------------------------------------------------------------------------

function Toggle({ enabled, onChange }: { enabled: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      onClick={() => onChange(!enabled)}
      className={clsx(
        'relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] focus:ring-offset-2',
        enabled ? 'bg-[var(--brand-primary)]' : 'bg-gray-200'
      )}
    >
      <span
        className={clsx(
          'pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
          enabled ? 'translate-x-4' : 'translate-x-0'
        )}
      />
    </button>
  )
}

// ---------------------------------------------------------------------------
// Section: Company Profile
// ---------------------------------------------------------------------------

function CompanyProfileSection() {
  const [companyName, setCompanyName] = useState('SolarIQ Thailand Co., Ltd.')
  const [taxId, setTaxId] = useState('0105563012345')
  const [address, setAddress] = useState('123/45 อาคารกรีนทาวเวอร์ ชั้น 15 ถ.สุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพฯ 10110')
  const [phone, setPhone] = useState('02-123-4567')
  const [email, setEmail] = useState('info@solariq.co')
  const [website, setWebsite] = useState('https://www.solariq.co')

  return (
    <Card>
      <CardHeader title="ข้อมูลบริษัท" subtitle="ข้อมูลพื้นฐานของบริษัทที่แสดงบน Proposal และเอกสาร" />
      <CardBody className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Input
            label="ชื่อบริษัท"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="ชื่อบริษัทของคุณ"
          />
          <Input
            label="เลขประจำตัวผู้เสียภาษี"
            value={taxId}
            onChange={(e) => setTaxId(e.target.value)}
            placeholder="0-0000-00000-00-0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">ที่อยู่</label>
          <textarea
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            rows={3}
            className="block w-full rounded-lg border border-gray-300 shadow-sm px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
            placeholder="ที่อยู่บริษัท"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Input
            label="เบอร์โทรศัพท์"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="02-xxx-xxxx"
          />
          <Input
            label="อีเมลบริษัท"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="info@company.com"
            type="email"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Input
            label="เว็บไซต์"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="https://www.company.com"
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">โลโก้บริษัท</label>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gray-100 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center text-gray-400">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
                </svg>
              </div>
              <div>
                <button
                  type="button"
                  className="text-sm font-medium text-orange-600 hover:text-orange-700 transition-colors"
                >
                  อัปโหลดโลโก้
                </button>
                <p className="text-xs text-gray-400 mt-0.5">PNG, JPG ขนาดไม่เกิน 2MB</p>
              </div>
            </div>
          </div>
        </div>
      </CardBody>
      <CardFooter>
        <div className="flex justify-end gap-3">
          <Button variant="outline" size="sm">ยกเลิก</Button>
          <Button variant="primary" size="sm">บันทึกข้อมูล</Button>
        </div>
      </CardFooter>
    </Card>
  )
}

// ---------------------------------------------------------------------------
// Section: LINE OA Integration
// ---------------------------------------------------------------------------

function LineIntegrationSection() {
  const [channelId, setChannelId] = useState('17xxxxxxxx')
  const [channelSecret, setChannelSecret] = useState('a1b2c3d4e5f6g7h8')
  const [accessToken, setAccessToken] = useState('eyJhbGciOiJIUzI1NiJ9...')
  const [liffId, setLiffId] = useState('1657xxxxxx-abcdefgh')
  const [showSecret, setShowSecret] = useState(false)
  const [showToken, setShowToken] = useState(false)
  const [isConnected] = useState(true)
  const [isTesting, setIsTesting] = useState(false)
  const [copied, setCopied] = useState(false)

  const webhookUrl = 'https://api.solariq.co/webhook/line/abc123xyz'

  const handleCopyWebhook = () => {
    navigator.clipboard.writeText(webhookUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleTestConnection = () => {
    setIsTesting(true)
    setTimeout(() => setIsTesting(false), 2000)
  }

  return (
    <Card>
      <CardHeader
        title="LINE OA Integration"
        subtitle="เชื่อมต่อ LINE Official Account เพื่อรับ Lead อัตโนมัติ"
        action={
          <div className="flex items-center gap-2">
            <span
              className={clsx(
                'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium',
                isConnected ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
              )}
            >
              <span className={clsx('w-2 h-2 rounded-full', isConnected ? 'bg-green-500' : 'bg-red-500')} />
              {isConnected ? 'เชื่อมต่อแล้ว' : 'ไม่ได้เชื่อมต่อ'}
            </span>
          </div>
        }
      />
      <CardBody className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Input
            label="Channel ID"
            value={channelId}
            onChange={(e) => setChannelId(e.target.value)}
            placeholder="LINE Channel ID"
            type="password"
          />
          <div>
            <Input
              label="Channel Secret"
              value={channelSecret}
              onChange={(e) => setChannelSecret(e.target.value)}
              placeholder="LINE Channel Secret"
              type={showSecret ? 'text' : 'password'}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowSecret(!showSecret)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showSecret ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              }
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <Input
              label="Access Token"
              value={accessToken}
              onChange={(e) => setAccessToken(e.target.value)}
              placeholder="LINE Channel Access Token"
              type={showToken ? 'text' : 'password'}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowToken(!showToken)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showToken ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              }
            />
          </div>
          <Input
            label="LIFF ID"
            value={liffId}
            onChange={(e) => setLiffId(e.target.value)}
            placeholder="LIFF Application ID"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Webhook URL</label>
          <div className="flex items-center gap-2">
            <div className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600 font-mono truncate">
              {webhookUrl}
            </div>
            <button
              type="button"
              onClick={handleCopyWebhook}
              className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              {copied ? (
                <>
                  <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  คัดลอกแล้ว
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
                  </svg>
                  คัดลอก
                </>
              )}
            </button>
          </div>
        </div>
      </CardBody>
      <CardFooter>
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            size="sm"
            isLoading={isTesting}
            onClick={handleTestConnection}
          >
            {isTesting ? 'กำลังทดสอบ...' : 'ทดสอบการเชื่อมต่อ'}
          </Button>
          <div className="flex gap-3">
            <Button variant="outline" size="sm">ยกเลิก</Button>
            <Button variant="primary" size="sm">บันทึก</Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}

// ---------------------------------------------------------------------------
// Section: Notification Preferences
// ---------------------------------------------------------------------------

function NotificationPreferencesSection() {
  const [preferences, setPreferences] = useState<NotificationPreference[]>(DEFAULT_NOTIFICATIONS)

  const toggleChannel = (prefIndex: number, channel: keyof NotificationChannel) => {
    setPreferences((prev) =>
      prev.map((p, i) =>
        i === prefIndex
          ? { ...p, channels: { ...p.channels, [channel]: !p.channels[channel] } }
          : p
      )
    )
  }

  return (
    <Card>
      <CardHeader title="การแจ้งเตือน" subtitle="กำหนดช่องทางการแจ้งเตือนสำหรับแต่ละเหตุการณ์" />
      <CardBody>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-3 px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">เหตุการณ์</th>
                <th className="text-center py-3 px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider w-24">LINE</th>
                <th className="text-center py-3 px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider w-24">Email</th>
                <th className="text-center py-3 px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider w-24">SMS</th>
                <th className="text-center py-3 px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider w-24">Web Push</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {preferences.map((pref, index) => (
                <tr key={pref.key} className="hover:bg-gray-50/50">
                  <td className="py-3.5 px-2 text-sm font-medium text-gray-900">{pref.label}</td>
                  <td className="py-3.5 px-2 text-center">
                    <div className="flex justify-center">
                      <Toggle enabled={pref.channels.line} onChange={() => toggleChannel(index, 'line')} />
                    </div>
                  </td>
                  <td className="py-3.5 px-2 text-center">
                    <div className="flex justify-center">
                      <Toggle enabled={pref.channels.email} onChange={() => toggleChannel(index, 'email')} />
                    </div>
                  </td>
                  <td className="py-3.5 px-2 text-center">
                    <div className="flex justify-center">
                      <Toggle enabled={pref.channels.sms} onChange={() => toggleChannel(index, 'sms')} />
                    </div>
                  </td>
                  <td className="py-3.5 px-2 text-center">
                    <div className="flex justify-center">
                      <Toggle enabled={pref.channels.webPush} onChange={() => toggleChannel(index, 'webPush')} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardBody>
      <CardFooter>
        <div className="flex justify-end gap-3">
          <Button variant="outline" size="sm">รีเซ็ตค่าเริ่มต้น</Button>
          <Button variant="primary" size="sm">บันทึกการตั้งค่า</Button>
        </div>
      </CardFooter>
    </Card>
  )
}

// ---------------------------------------------------------------------------
// Section: Team Members
// ---------------------------------------------------------------------------

function TeamMembersSection() {
  const [members] = useState<TeamMember[]>(DEMO_TEAM)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<'admin' | 'contractor'>('contractor')
  const [showInvite, setShowInvite] = useState(false)

  const statusLabel: Record<TeamMember['status'], { text: string; className: string }> = {
    active: { text: 'ใช้งาน', className: 'bg-green-50 text-green-700' },
    pending: { text: 'รอยืนยัน', className: 'bg-yellow-50 text-yellow-700' },
    inactive: { text: 'ปิดใช้งาน', className: 'bg-gray-100 text-gray-600' },
  }

  const roleLabel: Record<string, string> = {
    admin: 'ผู้ดูแลระบบ',
    contractor: 'ช่างติดตั้ง',
  }

  return (
    <Card>
      <CardHeader
        title="สมาชิกทีม"
        subtitle="จัดการสมาชิกและสิทธิ์การเข้าถึงระบบ"
        action={
          <Button variant="primary" size="sm" onClick={() => setShowInvite(!showInvite)}>
            <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
            </svg>
            เชิญสมาชิก
          </Button>
        }
      />
      <CardBody className="space-y-4">
        {/* Invite form */}
        {showInvite && (
          <div className="p-4 bg-orange-50/50 border border-orange-100 rounded-xl space-y-3">
            <p className="text-sm font-semibold text-gray-900">เชิญสมาชิกใหม่</p>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <Input
                  placeholder="อีเมลสมาชิก"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  type="email"
                />
              </div>
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as 'admin' | 'contractor')}
                className="rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="contractor">ช่างติดตั้ง</option>
                <option value="admin">ผู้ดูแลระบบ</option>
              </select>
              <Button variant="primary" size="md">ส่งคำเชิญ</Button>
            </div>
          </div>
        )}

        {/* Members table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-3 px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">ชื่อ</th>
                <th className="text-left py-3 px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">อีเมล</th>
                <th className="text-left py-3 px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">บทบาท</th>
                <th className="text-left py-3 px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">สถานะ</th>
                <th className="text-right py-3 px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider w-20">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {members.map((member) => (
                <tr key={member.id} className="hover:bg-gray-50/50">
                  <td className="py-3 px-2">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-gray-600 to-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-semibold text-white">{member.name.charAt(0)}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{member.name}</p>
                        <p className="text-xs text-gray-400 sm:hidden">{member.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-2 text-sm text-gray-600 hidden sm:table-cell">{member.email}</td>
                  <td className="py-3 px-2 text-sm text-gray-700">{roleLabel[member.role]}</td>
                  <td className="py-3 px-2">
                    <span className={clsx('inline-flex px-2 py-0.5 rounded-full text-xs font-medium', statusLabel[member.status].className)}>
                      {statusLabel[member.status].text}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-right">
                    <button
                      type="button"
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="ลบสมาชิก"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                      </svg>
                    </button>
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

// ---------------------------------------------------------------------------
// Section: API Keys (Enterprise)
// ---------------------------------------------------------------------------

function ApiKeysSection() {
  const [showKey, setShowKey] = useState(false)
  const [copied, setCopied] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const apiKey = 'sk-solariq-a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6'
  const maskedKey = 'sk-solariq-****************************o5p6'

  const handleCopy = () => {
    navigator.clipboard.writeText(apiKey)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Card>
      <CardHeader title="API Keys" subtitle="จัดการ API Key สำหรับเชื่อมต่อกับระบบภายนอก" />
      <CardBody className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
          <div className="flex items-center gap-2">
            <div className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-mono text-gray-600 truncate">
              {showKey ? apiKey : maskedKey}
            </div>
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="flex-shrink-0 p-2.5 border border-gray-300 rounded-lg text-gray-500 hover:bg-gray-50 transition-colors"
              title={showKey ? 'ซ่อน' : 'แสดง'}
            >
              {showKey ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              )}
            </button>
            <button
              type="button"
              onClick={handleCopy}
              className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              {copied ? (
                <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Regenerate */}
        <div>
          {showConfirm ? (
            <div className="p-4 bg-red-50 border border-red-100 rounded-xl space-y-3">
              <p className="text-sm font-medium text-red-800">
                คุณแน่ใจหรือไม่? การสร้าง API Key ใหม่จะทำให้ Key เดิมใช้งานไม่ได้ทันที
              </p>
              <div className="flex gap-2">
                <Button variant="danger" size="sm" onClick={() => setShowConfirm(false)}>ยืนยันสร้างใหม่</Button>
                <Button variant="outline" size="sm" onClick={() => setShowConfirm(false)}>ยกเลิก</Button>
              </div>
            </div>
          ) : (
            <Button variant="outline" size="sm" onClick={() => setShowConfirm(true)}>
              <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
              </svg>
              สร้าง API Key ใหม่
            </Button>
          )}
        </div>

        {/* Webhook endpoints */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Webhook Endpoints</label>
          <div className="space-y-2">
            {[
              { event: 'lead.created', url: 'https://api.solariq.co/webhook/lead-created', active: true },
              { event: 'proposal.viewed', url: 'https://api.solariq.co/webhook/proposal-viewed', active: true },
              { event: 'payment.received', url: 'https://api.solariq.co/webhook/payment-received', active: false },
            ].map((endpoint) => (
              <div key={endpoint.event} className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900">{endpoint.event}</p>
                  <p className="text-xs text-gray-500 font-mono truncate">{endpoint.url}</p>
                </div>
                <span className={clsx(
                  'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ml-3',
                  endpoint.active ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'
                )}>
                  <span className={clsx('w-1.5 h-1.5 rounded-full', endpoint.active ? 'bg-green-500' : 'bg-gray-400')} />
                  {endpoint.active ? 'Active' : 'Inactive'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Usage stats */}
        <div className="p-4 bg-gray-50 rounded-xl">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">สถิติการใช้งานเดือนนี้</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-2xl font-bold text-gray-900">1,247</p>
              <p className="text-xs text-gray-500">Requests ใช้ไป</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">10,000</p>
              <p className="text-xs text-gray-500">Limit ต่อเดือน</p>
            </div>
          </div>
          <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
            <div className="bg-orange-500 h-2 rounded-full" style={{ width: '12.47%' }} />
          </div>
          <p className="text-xs text-gray-400 mt-1.5">ใช้ไป 12.47% ของ Limit</p>
        </div>
      </CardBody>
    </Card>
  )
}

// ---------------------------------------------------------------------------
// Section: White-Label Branding (Enterprise)
// ---------------------------------------------------------------------------

function WhiteLabelSection() {
  const { brand, brands, switchBrand, refresh } = useBrand()
  const manageableBrand = brand && 'id' in brand ? brand : null
  const [activeBrandId, setActiveBrandId] = useState(manageableBrand?.id ?? '')
  const [brandName, setBrandName] = useState(manageableBrand?.name ?? '')
  const [companyName, setCompanyName] = useState(manageableBrand?.company_name ?? '')
  const [logoLightUrl, setLogoLightUrl] = useState(manageableBrand?.logo_light_url ?? '')
  const [logoDarkUrl, setLogoDarkUrl] = useState(manageableBrand?.logo_dark_url ?? '')
  const [faviconUrl, setFaviconUrl] = useState(manageableBrand?.favicon_ico_url ?? '')
  const [primaryColor, setPrimaryColor] = useState(manageableBrand?.colors?.primary ?? '#f97316')
  const [secondaryColor, setSecondaryColor] = useState(manageableBrand?.colors?.secondary ?? '#1A1A2E')
  const [accentColor, setAccentColor] = useState(manageableBrand?.colors?.accent ?? '#FFB800')
  const [fontBody, setFontBody] = useState(manageableBrand?.fonts?.body ?? 'Sarabun')
  const [fontHeading, setFontHeading] = useState(manageableBrand?.fonts?.heading ?? 'Prompt')
  const [borderRadius, setBorderRadius] = useState(manageableBrand?.border_radius ?? 8)
  const logoUploadRef = useRef<HTMLInputElement>(null)
  const [isUploadingLogo, setIsUploadingLogo] = useState(false)

  // Live preview: inject CSS vars when colors change
  useEffect(() => {
    if (typeof document === 'undefined') return
    const root = document.documentElement
    root.style.setProperty('--color-primary', primaryColor)
    root.style.setProperty('--brand-primary', primaryColor)
    const darkened = primaryColor.replace('#', '')
    if (darkened.length === 6) {
      const factor = 0.88
      const r = Math.round(parseInt(darkened.slice(0, 2), 16) * factor)
      const g = Math.round(parseInt(darkened.slice(2, 4), 16) * factor)
      const b = Math.round(parseInt(darkened.slice(4, 6), 16) * factor)
      const hov = `#${[r, g, b].map((c) => Math.min(255, Math.max(0, c)).toString(16).padStart(2, '0')).join('')}`
      root.style.setProperty('--color-primary-hover', hov)
      root.style.setProperty('--brand-primary-hover', hov)
    }
  }, [primaryColor])

  useEffect(() => {
    if (typeof document === 'undefined') return
    document.documentElement.style.setProperty('--color-secondary', secondaryColor)
    document.documentElement.style.setProperty('--brand-secondary', secondaryColor)
  }, [secondaryColor])

  useEffect(() => {
    if (typeof document === 'undefined') return
    document.documentElement.style.setProperty('--font-brand', fontBody)
  }, [fontBody])

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !manageableBrand) return
    setIsUploadingLogo(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await apiClient.post<{ url: string }>(`/brands/${manageableBrand.id}/logo`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setLogoLightUrl(res.data.url)
      await refresh()
    } catch {
      // silent fail — user can still enter URL manually
    } finally {
      setIsUploadingLogo(false)
    }
  }
  const [customDomain, setCustomDomain] = useState(manageableBrand?.domain ?? '')
  const [domainInfo, setDomainInfo] = useState<BrandDomain | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [newBrandName, setNewBrandName] = useState('')
  const [newCompanyName, setNewCompanyName] = useState('')

  useEffect(() => {
    if (!manageableBrand) return
    setActiveBrandId(manageableBrand.id)
    setBrandName(manageableBrand.name)
    setCompanyName(manageableBrand.company_name)
    setLogoLightUrl(manageableBrand.logo_light_url ?? '')
    setLogoDarkUrl(manageableBrand.logo_dark_url ?? '')
    setFaviconUrl(manageableBrand.favicon_ico_url ?? '')
    setPrimaryColor(manageableBrand.colors?.primary ?? '#f97316')
    setSecondaryColor(manageableBrand.colors?.secondary ?? '#1A1A2E')
    setAccentColor(manageableBrand.colors?.accent ?? '#FFB800')
    setFontHeading(manageableBrand.fonts?.heading ?? 'Prompt')
    setFontBody(manageableBrand.fonts?.body ?? 'Sarabun')
    setBorderRadius(manageableBrand.border_radius ?? 8)
    setCustomDomain(manageableBrand.domain ?? '')
  }, [manageableBrand?.id])

  const handleSwitchBrand = (id: string) => {
    setActiveBrandId(id)
    switchBrand(id)
  }

  const handleSave = async () => {
    if (!manageableBrand) return
    setIsSaving(true)
    try {
      await updateBrand(manageableBrand.id, {
        name: brandName,
        company_name: companyName,
        logo: { light: logoLightUrl || null, dark: logoDarkUrl || null },
        favicon: { ico: faviconUrl || null },
        colors: { primary: primaryColor, secondary: secondaryColor, accent: accentColor },
        fonts: { heading: fontHeading, body: fontBody },
        border_radius: borderRadius,
      })
      await refresh()
    } finally {
      setIsSaving(false)
    }
  }

  const handleCreateBrand = async () => {
    if (!newBrandName || !newCompanyName) return
    setIsCreating(true)
    try {
      await createBrand({
        name: newBrandName,
        company_name: newCompanyName,
        colors: { primary: primaryColor, secondary: secondaryColor, accent: accentColor },
        fonts: { heading: fontHeading, body: fontBody },
      })
      setNewBrandName('')
      setNewCompanyName('')
      await refresh()
    } finally {
      setIsCreating(false)
    }
  }

  const handleSetDefault = async () => {
    if (!manageableBrand) return
    setIsSaving(true)
    try {
      await setDefaultBrand(manageableBrand.id)
      await refresh()
    } finally {
      setIsSaving(false)
    }
  }

  const handleDomainSave = async () => {
    if (!manageableBrand || !customDomain) return
    setIsSaving(true)
    try {
      const info = await addBrandDomain(manageableBrand.id, customDomain)
      setDomainInfo(info)
    } finally {
      setIsSaving(false)
    }
  }

  const handleVerifyDomain = async () => {
    if (!manageableBrand) return
    setIsSaving(true)
    try {
      const result = await verifyBrandDomain(manageableBrand.id)
      setDomainInfo((prev) => prev ? { ...prev, status: result.status, ssl_status: result.ssl_status, dns_verified: result.verified } : prev)
    } finally {
      setIsSaving(false)
    }
  }

  if (!manageableBrand) {
    return (
      <Card>
        <CardHeader title="White-Label Branding" subtitle="ปรับแต่งแบรนด์สำหรับ Proposal และหน้าลูกค้า" />
        <CardBody>
          <p className="text-sm text-[var(--brand-text-secondary)]">White-label branding ใช้งานได้เฉพาะบัญชีที่เป็นสมาชิกองค์กรเท่านั้น</p>
        </CardBody>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader title="White-Label Branding" subtitle="ปรับแต่งแบรนด์สำหรับ Proposal และหน้าลูกค้า" />
      <CardBody className="space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          <div className="min-w-[200px]">
            <label className="block text-xs font-medium text-[var(--brand-text-secondary)] mb-1">เลือกแบรนด์</label>
            <select
              value={activeBrandId}
              onChange={(e) => handleSwitchBrand(e.target.value)}
              className="w-full rounded-lg border border-[var(--brand-border)] bg-[var(--brand-surface)] px-3 py-2 text-sm"
            >
              {brands.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>
          <Button variant="outline" size="sm" onClick={handleSetDefault} disabled={isSaving}>
            ตั้งเป็น Default
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Input label="ชื่อแบรนด์" value={brandName} onChange={(e) => setBrandName(e.target.value)} />
          <Input label="ชื่อบริษัทที่แสดง" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <Input label="Logo (Light URL)" value={logoLightUrl} onChange={(e) => setLogoLightUrl(e.target.value)} />
            <div className="mt-2 flex items-center gap-2">
              <input
                type="file"
                ref={logoUploadRef}
                accept="image/png,image/jpeg,image/svg+xml"
                className="hidden"
                onChange={handleLogoUpload}
              />
              <button
                type="button"
                onClick={() => logoUploadRef.current?.click()}
                disabled={isUploadingLogo}
                className="text-xs text-[var(--brand-primary)] hover:underline disabled:opacity-50"
              >
                {isUploadingLogo ? 'กำลังอัปโหลด...' : 'อัปโหลดโลโก้ (PNG/JPG/SVG)'}
              </button>
              {logoLightUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logoLightUrl} alt="logo preview" className="h-8 object-contain rounded" />
              )}
            </div>
          </div>
          <Input label="Logo (Dark URL)" value={logoDarkUrl} onChange={(e) => setLogoDarkUrl(e.target.value)} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Input label="Favicon URL" value={faviconUrl} onChange={(e) => setFaviconUrl(e.target.value)} />
          <Input
            label="Border Radius"
            value={borderRadius.toString()}
            onChange={(e) => setBorderRadius(Number(e.target.value) || 0)}
            type="number"
            min={0}
            max={16}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div>
            <label className="block text-sm font-medium text-[var(--brand-text)] mb-1">Primary Color</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="w-10 h-10 rounded-lg border border-[var(--brand-border)] cursor-pointer p-0.5"
              />
              <Input value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="flex-1 font-mono" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--brand-text)] mb-1">Secondary Color</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={secondaryColor}
                onChange={(e) => setSecondaryColor(e.target.value)}
                className="w-10 h-10 rounded-lg border border-[var(--brand-border)] cursor-pointer p-0.5"
              />
              <Input value={secondaryColor} onChange={(e) => setSecondaryColor(e.target.value)} className="flex-1 font-mono" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--brand-text)] mb-1">Accent Color</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={accentColor}
                onChange={(e) => setAccentColor(e.target.value)}
                className="w-10 h-10 rounded-lg border border-[var(--brand-border)] cursor-pointer p-0.5"
              />
              <Input value={accentColor} onChange={(e) => setAccentColor(e.target.value)} className="flex-1 font-mono" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-[var(--brand-text)] mb-1">Font Heading</label>
            <select
              value={fontHeading}
              onChange={(e) => setFontHeading(e.target.value)}
              className="w-full rounded-lg border border-[var(--brand-border)] bg-[var(--brand-surface)] px-3 py-2.5 text-sm text-[var(--brand-text)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
            >
              {FONT_OPTIONS.map((f) => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--brand-text)] mb-1">Font Body (Live Preview)</label>
            <select
              value={fontBody}
              onChange={(e) => setFontBody(e.target.value)}
              className="w-full rounded-lg border border-[var(--brand-border)] bg-[var(--brand-surface)] px-3 py-2.5 text-sm text-[var(--brand-text)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
            >
              {FONT_OPTIONS.map((f) => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-end">
          <Input
            label="Custom Domain"
            value={customDomain}
            onChange={(e) => setCustomDomain(e.target.value)}
            placeholder="solar.yourdomain.com"
            hint="ชี้ CNAME record มาที่ custom.solariq.app"
          />
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleDomainSave} disabled={isSaving}>
              ตั้งค่า Domain
            </Button>
            <Button variant="ghost" size="sm" onClick={handleVerifyDomain} disabled={isSaving}>
              ตรวจสอบ DNS
            </Button>
          </div>
        </div>

        {domainInfo && (
          <div className="rounded-xl border border-[var(--brand-border)] p-4 text-sm">
            <p className="font-semibold text-[var(--brand-text)] mb-2">DNS Records</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[var(--brand-text-secondary)]">
              <div>Type: {domainInfo.dns_record_type}</div>
              <div>Name: {domainInfo.dns_record_name}</div>
              <div>Value: {domainInfo.dns_record_value}</div>
              <div>Status: {domainInfo.status}</div>
              <div>SSL: {domainInfo.ssl_status}</div>
              <div>Verified: {domainInfo.dns_verified ? 'Yes' : 'No'}</div>
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-[var(--brand-text)] mb-2">ตัวอย่าง</label>
          <div className="p-6 border border-[var(--brand-border)] rounded-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: primaryColor }}>
                <span className="text-white text-sm font-bold">{companyName.charAt(0) || 'B'}</span>
              </div>
              <div>
                <p className="text-sm font-bold" style={{ color: primaryColor }}>{companyName || 'Your Company'}</p>
                <p className="text-xs text-[var(--brand-text-secondary)]">{customDomain || 'solar.yourdomain.com'}</p>
              </div>
            </div>
            <div className="h-2 rounded-full" style={{ backgroundColor: primaryColor, opacity: 0.2 }}>
              <div className="h-2 rounded-full w-3/4" style={{ backgroundColor: primaryColor }} />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-[var(--brand-border)] p-4">
          <p className="text-sm font-semibold text-[var(--brand-text)] mb-3">สร้างแบรนด์ใหม่</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="ชื่อแบรนด์ใหม่" value={newBrandName} onChange={(e) => setNewBrandName(e.target.value)} />
            <Input label="ชื่อบริษัท" value={newCompanyName} onChange={(e) => setNewCompanyName(e.target.value)} />
          </div>
          <div className="flex justify-end mt-3">
            <Button variant="outline" size="sm" onClick={handleCreateBrand} disabled={isCreating}>
              {isCreating ? 'กำลังสร้าง...' : 'สร้างแบรนด์'}
            </Button>
          </div>
        </div>
      </CardBody>
      <CardFooter>
        <div className="flex justify-between items-center w-full">
          <div className="text-xs text-[var(--brand-text-secondary)]">การปรับแต่งมีผลกับ UI, Proposal, และอีเมล</div>
          <Button variant="primary" size="sm" onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่า'}
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}

// ---------------------------------------------------------------------------
// Main Settings Page
// ---------------------------------------------------------------------------

export default function SettingsPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<SettingsTab>('company')
  const isAdmin = user?.role === 'admin'

  const visibleTabs = TABS.filter((tab) => {
    if (tab.adminOnly && !isAdmin) return false
    // Enterprise tabs still shown but can be gated with a badge
    return true
  })

  const renderSection = () => {
    switch (activeTab) {
      case 'company':
        return <CompanyProfileSection />
      case 'line':
        return <LineIntegrationSection />
      case 'notifications':
        return <NotificationPreferencesSection />
      case 'team':
        return <TeamMembersSection />
      case 'api':
        return <ApiKeysSection />
      case 'branding':
        return <WhiteLabelSection />
      default:
        return null
    }
  }

  return (
    <AppLayout user={user}>
      <div className="max-w-5xl space-y-6">
        {/* Page header */}
        <div>
          <h1 className="text-xl font-bold text-gray-900">ตั้งค่า</h1>
          <p className="text-sm text-gray-500 mt-1">จัดการข้อมูลบริษัท การเชื่อมต่อ และสิทธิ์การใช้งาน</p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 overflow-x-auto scrollbar-thin">
          <nav className="flex gap-1 min-w-max" aria-label="Settings tabs">
            {visibleTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={clsx(
                  'inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap',
                  activeTab === tab.key
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                )}
              >
                <span className={clsx(activeTab === tab.key ? 'text-orange-500' : 'text-gray-400')}>
                  {tab.icon}
                </span>
                {tab.label}
                {tab.enterpriseOnly && (
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 bg-purple-50 text-purple-600 rounded-full">
                    Enterprise
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Active section */}
        {renderSection()}
      </div>
    </AppLayout>
  )
}
