'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card, CardHeader, CardBody, CardFooter } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useAuth, useBrand } from '@/context'
import {
  addBrandDomain,
  createBrand,
  setDefaultBrand,
  updateBrand,
  verifyBrandDomain,
} from '@/hooks/useBranding'
import { useTaxProfile, useUpdateTaxProfile } from '@/hooks'
import apiClient from '@/lib/api'
import type { BrandDomain } from '@/types/branding'
import clsx from 'clsx'
import Image from 'next/image'

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
  | 'tax'
  | 'line'
  | 'notifications'
  | 'team'
  | 'api'
  | 'branding'
  | 'privacy'
  | 'security'

interface TeamMember {
  id: string
  name: string
  email: string
  role: 'admin' | 'contractor'
  status: 'active' | 'pending' | 'inactive'
}

function toTeamMember(user: unknown): TeamMember | null {
  if (!user || typeof user !== 'object') {
    return null
  }

  const record = user as Record<string, unknown>
  const id = typeof record.id === 'string' || typeof record.id === 'number' ? String(record.id) : ''
  const email = typeof record.email === 'string' ? record.email : ''
  const name =
    [record.name, record.display_name, record.email].find(
      (value): value is string => typeof value === 'string'
    ) ?? ''
  const role = record.role === 'admin' ? 'admin' : 'contractor'
  const status =
    record.status === 'active' || record.status === 'pending' || record.status === 'inactive'
      ? record.status
      : record.is_active
        ? 'active'
        : 'inactive'

  return {
    id,
    name,
    email,
    role,
    status,
  }
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
  {
    id: '1',
    name: 'สมชาย วงศ์สวัสดิ์',
    email: 'somchai@solariq.co',
    role: 'admin',
    status: 'active',
  },
  {
    id: '2',
    name: 'วิภา สุขสันต์',
    email: 'wipa@solariq.co',
    role: 'contractor',
    status: 'active',
  },
  {
    id: '3',
    name: 'ประเสริฐ ทองคำ',
    email: 'prasert@solariq.co',
    role: 'contractor',
    status: 'pending',
  },
  { id: '4', name: 'นภา ศรีสุข', email: 'napa@solariq.co', role: 'contractor', status: 'inactive' },
]

const DEFAULT_NOTIFICATIONS: NotificationPreference[] = [
  {
    key: 'new_lead',
    label: 'newLead',
    channels: { line: true, email: true, sms: false, webPush: true },
  },
  {
    key: 'status_change',
    label: 'statusChange',
    channels: { line: true, email: false, sms: false, webPush: true },
  },
  {
    key: 'proposal_viewed',
    label: 'proposalViewed',
    channels: { line: true, email: true, sms: false, webPush: true },
  },
  {
    key: 'payment_received',
    label: 'paymentReceived',
    channels: { line: true, email: true, sms: true, webPush: false },
  },
  {
    key: 'weekly_summary',
    label: 'weeklySummary',
    channels: { line: false, email: true, sms: false, webPush: false },
  },
]

// ---------------------------------------------------------------------------
// Tabs config
// ---------------------------------------------------------------------------

const TABS: {
  key: SettingsTab
  labelKey: string
  icon: React.ReactNode
  adminOnly?: boolean
  enterpriseOnly?: boolean
}[] = [
  {
    key: 'company',
    labelKey: 'tabs.company',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21"
        />
      </svg>
    ),
  },
  {
    key: 'line',
    labelKey: 'tabs.line',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
        />
      </svg>
    ),
  },
  {
    key: 'notifications',
    labelKey: 'tabs.notifications',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
        />
      </svg>
    ),
  },
  {
    key: 'team',
    labelKey: 'tabs.team',
    adminOnly: true,
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
        />
      </svg>
    ),
  },
  {
    key: 'api',
    labelKey: 'tabs.api',
    enterpriseOnly: true,
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z"
        />
      </svg>
    ),
  },
  {
    key: 'branding',
    labelKey: 'tabs.branding',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42"
        />
      </svg>
    ),
  },
  {
    key: 'privacy',
    labelKey: 'tabs.privacy',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.745 3.745 0 011.043 3.296A3.745 3.745 0 0121 12z"
        />
      </svg>
    ),
  },
  {
    key: 'security',
    labelKey: 'tabs.security',
    adminOnly: true,
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
        />
      </svg>
    ),
  },
  {
    key: 'tax',
    labelKey: 'tabs.tax',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
        />
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
        enabled ? 'bg-[var(--brand-primary)]' : 'bg-[var(--brand-border)]'
      )}
    >
      <span
        className={clsx(
          'pointer-events-none inline-block h-4 w-4 transform rounded-full bg-[var(--brand-surface)] shadow ring-0 transition duration-200 ease-in-out',
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
  const t = useTranslations('settingsPage')
  const [companyName, setCompanyName] = useState('SolarIQ Thailand Co., Ltd.')
  const [taxId, setTaxId] = useState('0105563012345')
  const [address, setAddress] = useState(
    '123/45 อาคารกรีนทาวเวอร์ ชั้น 15 ถ.สุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพฯ 10110'
  )
  const [phone, setPhone] = useState('02-123-4567')
  const [email, setEmail] = useState('info@solariq.co')
  const [website, setWebsite] = useState('https://www.solariq.co')

  return (
    <Card>
      <CardHeader title={t('company.title')} subtitle={t('company.subtitle')} />
      <CardBody className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Input
            label={t('company.companyName')}
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder={t('company.companyNamePlaceholder')}
          />
          <Input
            label={t('company.taxId')}
            value={taxId}
            onChange={(e) => setTaxId(e.target.value)}
            placeholder={t('company.taxIdPlaceholder')}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--brand-text)] mb-1">
            {t('company.address')}
          </label>
          <textarea
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            rows={3}
            className="block w-full rounded-lg border border-[var(--brand-border)] shadow-sm px-4 py-2.5 text-[var(--brand-text)] placeholder-[var(--brand-text-secondary)] focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
            placeholder={t('company.addressPlaceholder')}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Input
            label={t('company.phone')}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder={t('company.phonePlaceholder')}
          />
          <Input
            label={t('company.email')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t('company.emailPlaceholder')}
            type="email"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Input
            label={t('company.website')}
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder={t('company.websitePlaceholder')}
          />
          <div>
            <label className="block text-sm font-medium text-[var(--brand-text)] mb-1">
              {t('company.logo')}
            </label>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-[var(--brand-background)] border-2 border-dashed border-[var(--brand-border)] rounded-xl flex items-center justify-center text-[var(--brand-text-secondary)]">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z"
                  />
                </svg>
              </div>
              <div>
                <button
                  type="button"
                  onClick={() =>
                    alert(
                      'Logo upload will be available after setting up White-Label Branding in the Branding tab.'
                    )
                  }
                  className="text-sm font-medium text-orange-600 hover:text-orange-700 transition-colors"
                >
                  {t('company.uploadLogo')}
                </button>
                <p className="text-xs text-[var(--brand-text-secondary)] mt-0.5">
                  {t('company.logoHint')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardBody>
      <CardFooter>
        <div className="flex justify-end gap-3">
          <Button variant="outline" size="sm">
            {t('company.cancel')}
          </Button>
          <Button variant="primary" size="sm">
            {t('company.save')}
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}

// ---------------------------------------------------------------------------
// Section: Tax Profile
// ---------------------------------------------------------------------------

function TaxProfileSection() {
  const t = useTranslations('settingsPage')
  const tExtra = useTranslations('settingsExtra')
  const { data: taxProfile, isLoading } = useTaxProfile()
  const updateTaxProfile = useUpdateTaxProfile()

  const [companyNameTh, setCompanyNameTh] = useState('')
  const [companyNameEn, setCompanyNameEn] = useState('')
  const [taxId, setTaxId] = useState('')
  const [branchNumber, setBranchNumber] = useState('00000')
  const [taxAddress, setTaxAddress] = useState('')
  const [taxContactPerson, setTaxContactPerson] = useState('')
  const [taxContactEmail, setTaxContactEmail] = useState('')
  const [taxContactPhone, setTaxContactPhone] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  // Initialize form with current tax profile
  useEffect(() => {
    if (taxProfile) {
      setCompanyNameTh(taxProfile.company_name_th || '')
      setCompanyNameEn(taxProfile.company_name_en || '')
      setTaxId(taxProfile.tax_id || '')
      setBranchNumber(taxProfile.branch_number || '00000')
      setTaxAddress(taxProfile.tax_address || '')
      setTaxContactPerson(taxProfile.tax_contact_person || '')
      setTaxContactEmail(taxProfile.tax_contact_email || '')
      setTaxContactPhone(taxProfile.tax_contact_phone || '')
    }
  }, [taxProfile])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await updateTaxProfile.mutateAsync({
        company_name_th: companyNameTh || undefined,
        company_name_en: companyNameEn || undefined,
        tax_id: taxId || undefined,
        branch_number: branchNumber,
        tax_address: taxAddress || undefined,
        tax_contact_person: taxContactPerson || undefined,
        tax_contact_email: taxContactEmail || undefined,
        tax_contact_phone: taxContactPhone || undefined,
      })
      alert(tExtra('saved'))
    } catch {
      alert(tExtra('error'))
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = () => {
    if (taxProfile) {
      setCompanyNameTh(taxProfile.company_name_th || '')
      setCompanyNameEn(taxProfile.company_name_en || '')
      setTaxId(taxProfile.tax_id || '')
      setBranchNumber(taxProfile.branch_number || '00000')
      setTaxAddress(taxProfile.tax_address || '')
      setTaxContactPerson(taxProfile.tax_contact_person || '')
      setTaxContactEmail(taxProfile.tax_contact_email || '')
      setTaxContactPhone(taxProfile.tax_contact_phone || '')
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardBody>
          <div className="text-center py-10 text-[var(--brand-text-secondary)]">
            {tExtra('saving')}
          </div>
        </CardBody>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader title={t('tax.title')} subtitle={t('tax.subtitle')} />
      <CardBody className="space-y-5">
        <div className="bg-blue-500/10 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <p className="text-sm text-blue-900 dark:text-blue-100">
            <strong>ข้อมูลภาษี:</strong> ข้อมูลนี้จะถูกใช้ในการออกใบกำกับภาษีและใบเสร็จรับเงิน
            ตามมาตรฐานกรมสรรพากร กรุณาตรวจสอบข้อมูลให้ถูกต้อง
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Input
            label={t('tax.companyNameTh')}
            value={companyNameTh}
            onChange={(e) => setCompanyNameTh(e.target.value)}
            placeholder="บริษัท ตัวอย่าง จำกัด"
          />
          <Input
            label={t('tax.companyNameEn')}
            value={companyNameEn}
            onChange={(e) => setCompanyNameEn(e.target.value)}
            placeholder="Example Company Limited"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Input
            label={t('tax.taxId')}
            value={taxId}
            onChange={(e) => setTaxId(e.target.value.replace(/[^0-9]/g, '').slice(0, 13))}
            placeholder="0105560123456"
            maxLength={13}
          />
          <Input
            label={t('tax.branchNumber')}
            value={branchNumber}
            onChange={(e) => setBranchNumber(e.target.value.replace(/[^0-9]/g, '').slice(0, 5))}
            placeholder="00000"
            maxLength={5}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--brand-text)] mb-1">
            {t('tax.taxAddress')}
          </label>
          <textarea
            value={taxAddress}
            onChange={(e) => setTaxAddress(e.target.value)}
            rows={3}
            className="block w-full rounded-lg border border-[var(--brand-border)] shadow-sm px-4 py-2.5 text-[var(--brand-text)] placeholder-[var(--brand-text-secondary)] focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
            placeholder="ที่อยู่สำนักงานใหญ่..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Input
            label={t('tax.contactPerson')}
            value={taxContactPerson}
            onChange={(e) => setTaxContactPerson(e.target.value)}
            placeholder="ชื่อผู้ติดต่อ"
          />
          <Input
            label={t('tax.contactEmail')}
            value={taxContactEmail}
            onChange={(e) => setTaxContactEmail(e.target.value)}
            placeholder="billing@example.com"
            type="email"
          />
        </div>

        <Input
          label={t('tax.contactPhone')}
          value={taxContactPhone}
          onChange={(e) => setTaxContactPhone(e.target.value)}
          placeholder="02-xxx-xxxx"
        />
      </CardBody>
      <CardFooter>
        <div className="flex justify-end gap-3">
          <Button variant="outline" size="sm" onClick={handleReset}>
            {t('tax.reset')}
          </Button>
          <Button variant="primary" size="sm" onClick={handleSave} disabled={isSaving}>
            {isSaving ? tExtra('saving') : t('tax.save')}
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}

// ---------------------------------------------------------------------------
// Section: LINE OA Integration
// ---------------------------------------------------------------------------

function LineIntegrationSection() {
  const t = useTranslations('settingsPage')
  const { user } = useAuth()
  const [channelId, setChannelId] = useState('')
  const [channelSecret, setChannelSecret] = useState('')
  const [accessToken, setAccessToken] = useState('')
  const [liffId, setLiffId] = useState('')
  const [showSecret, setShowSecret] = useState(false)
  const [showToken, setShowToken] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [copied, setCopied] = useState(false)
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)

  const webhookUrl = `https://api.solariq.co/webhook/line/${user?.uid ?? 'unknown'}`

  // Load LINE config on mount
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const res = await apiClient.get<{
          channelId?: string
          channelSecret?: string
          accessToken?: string
          liffId?: string
          isConnected?: boolean
        }>('/api/v1/settings/line')
        const data = res.data
        if (data.channelId) {
          setChannelId(data.channelId)
        }
        if (data.channelSecret) {
          setChannelSecret(data.channelSecret)
        }
        if (data.accessToken) {
          setAccessToken(data.accessToken)
        }
        if (data.liffId) {
          setLiffId(data.liffId)
        }
        setIsConnected(data.isConnected ?? false)
      } catch {
        // No existing config — fields stay empty
      }
    }
    loadConfig()
  }, [])

  const handleCopyWebhook = () => {
    navigator.clipboard.writeText(webhookUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleTestConnection = async () => {
    setIsTesting(true)
    setStatusMessage(null)
    try {
      const res = await apiClient.post<{ connected: boolean; message?: string }>(
        '/api/v1/settings/line/test',
        { channelId, channelSecret, accessToken }
      )
      setIsConnected(res.data.connected)
      setStatusMessage({
        type: res.data.connected ? 'success' : 'error',
        text:
          res.data.message ??
          (res.data.connected ? t('line.connectionSuccess') : t('line.connectionFailed')),
      })
    } catch (err) {
      setIsConnected(false)
      setStatusMessage({
        type: 'error',
        text: err instanceof Error ? err.message : t('line.connectionFailed'),
      })
    } finally {
      setIsTesting(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    setStatusMessage(null)
    try {
      await apiClient.post('/api/v1/settings/line', {
        channelId,
        channelSecret,
        accessToken,
        liffId,
      })
      setStatusMessage({ type: 'success', text: t('line.saveSuccess') })
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: err instanceof Error ? err.message : t('line.saveFailed'),
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader
        title={t('line.title')}
        subtitle={t('line.subtitle')}
        action={
          <div className="flex items-center gap-2">
            <span
              className={clsx(
                'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium',
                isConnected ? 'bg-green-500/10 text-green-700' : 'bg-red-500/10 text-red-700'
              )}
            >
              <span
                className={clsx(
                  'w-2 h-2 rounded-full',
                  isConnected ? 'bg-green-500' : 'bg-red-500'
                )}
              />
              {isConnected ? t('line.connected') : t('line.disconnected')}
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
                  className="text-[var(--brand-text-secondary)] hover:text-[var(--brand-text-secondary)] transition-colors"
                >
                  {showSecret ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                      />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
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
                  className="text-[var(--brand-text-secondary)] hover:text-[var(--brand-text-secondary)] transition-colors"
                >
                  {showToken ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                      />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
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
          <label className="block text-sm font-medium text-[var(--brand-text)] mb-1">
            Webhook URL
          </label>
          <div className="flex items-center gap-2">
            <div className="flex-1 px-4 py-2.5 bg-[var(--brand-background)] border border-[var(--brand-border)] rounded-lg text-sm text-[var(--brand-text-secondary)] font-mono truncate">
              {webhookUrl}
            </div>
            <button
              type="button"
              onClick={handleCopyWebhook}
              className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-2.5 border border-[var(--brand-border)] rounded-lg text-sm font-medium text-[var(--brand-text)] hover:bg-[var(--brand-primary-light)] transition-colors"
            >
              {copied ? (
                <>
                  <svg
                    className="w-4 h-4 text-green-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4.5 12.75l6 6 9-13.5"
                    />
                  </svg>
                  {t('line.copied')}
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184"
                    />
                  </svg>
                  {t('line.copy')}
                </>
              )}
            </button>
          </div>
        </div>
      </CardBody>
      <CardFooter>
        <div className="space-y-3">
          {statusMessage && (
            <div
              className={clsx(
                'px-4 py-2 rounded-lg text-sm',
                statusMessage.type === 'success'
                  ? 'bg-green-500/10 text-green-700 border border-green-200'
                  : 'bg-red-500/10 text-red-700 border border-red-500/20'
              )}
            >
              {statusMessage.text}
            </div>
          )}
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              size="sm"
              isLoading={isTesting}
              onClick={handleTestConnection}
            >
              {isTesting ? t('line.testing') : t('line.testConnection')}
            </Button>
            <div className="flex gap-3">
              <Button variant="outline" size="sm">
                {t('line.cancel')}
              </Button>
              <Button variant="primary" size="sm" isLoading={isSaving} onClick={handleSave}>
                {isSaving ? t('line.saving') : t('line.save')}
              </Button>
            </div>
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
  const t = useTranslations('settingsPage')
  const [preferences, setPreferences] = useState<NotificationPreference[]>(DEFAULT_NOTIFICATIONS)

  const toggleChannel = (prefIndex: number, channel: keyof NotificationChannel) => {
    setPreferences((prev) =>
      prev.map((p, i) =>
        i === prefIndex ? { ...p, channels: { ...p.channels, [channel]: !p.channels[channel] } } : p
      )
    )
  }

  return (
    <Card>
      <CardHeader title={t('notifications.title')} subtitle={t('notifications.subtitle')} />
      <CardBody>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--brand-border)]">
                <th className="text-left py-3 px-2 text-xs font-semibold text-[var(--brand-text-secondary)] uppercase tracking-wider">
                  {t('notifications.event')}
                </th>
                <th className="text-center py-3 px-2 text-xs font-semibold text-[var(--brand-text-secondary)] uppercase tracking-wider w-24">
                  LINE
                </th>
                <th className="text-center py-3 px-2 text-xs font-semibold text-[var(--brand-text-secondary)] uppercase tracking-wider w-24">
                  Email
                </th>
                <th className="text-center py-3 px-2 text-xs font-semibold text-[var(--brand-text-secondary)] uppercase tracking-wider w-24">
                  SMS
                </th>
                <th className="text-center py-3 px-2 text-xs font-semibold text-[var(--brand-text-secondary)] uppercase tracking-wider w-24">
                  Web Push
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--brand-border)]">
              {preferences.map((pref, index) => (
                <tr key={pref.key} className="hover:bg-[var(--brand-primary-light)]/50">
                  <td className="py-3.5 px-2 text-sm font-medium text-[var(--brand-text)]">
                    {t(`notifications.${pref.label}`)}
                  </td>
                  <td className="py-3.5 px-2 text-center">
                    <div className="flex justify-center">
                      <Toggle
                        enabled={pref.channels.line}
                        onChange={() => toggleChannel(index, 'line')}
                      />
                    </div>
                  </td>
                  <td className="py-3.5 px-2 text-center">
                    <div className="flex justify-center">
                      <Toggle
                        enabled={pref.channels.email}
                        onChange={() => toggleChannel(index, 'email')}
                      />
                    </div>
                  </td>
                  <td className="py-3.5 px-2 text-center">
                    <div className="flex justify-center">
                      <Toggle
                        enabled={pref.channels.sms}
                        onChange={() => toggleChannel(index, 'sms')}
                      />
                    </div>
                  </td>
                  <td className="py-3.5 px-2 text-center">
                    <div className="flex justify-center">
                      <Toggle
                        enabled={pref.channels.webPush}
                        onChange={() => toggleChannel(index, 'webPush')}
                      />
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
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setPreferences(DEFAULT_NOTIFICATIONS)
            }}
          >
            {t('notifications.resetDefaults')}
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={async () => {
              try {
                const { apiClient } = await import('@/lib/api')
                await apiClient.put('/api/v1/users/me/preferences', { notifications: preferences })
                alert('Notification settings saved!')
              } catch {
                alert('Unable to save notification settings right now.')
              }
            }}
          >
            {t('notifications.saveSettings')}
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}

// ---------------------------------------------------------------------------
// Section: Team Members
// ---------------------------------------------------------------------------

function TeamMembersSection() {
  const t = useTranslations('settingsPage')
  const [members, setMembers] = useState<TeamMember[]>(DEMO_TEAM)
  const [isLoadingMembers, setIsLoadingMembers] = useState(true)
  const [membersError, setMembersError] = useState<string | null>(null)
  const [inviteEmail, setInviteEmail] = useState('')

  // Team roster endpoint is not available yet; hydrate only the signed-in user when possible.
  useEffect(() => {
    setIsLoadingMembers(true)
    setMembersError(null)
    apiClient
      .get('/api/v1/users/me')
      .then((response) => {
        const member = toTeamMember(response.data)
        if (member) {
          setMembers([member])
        } else {
          setMembers([])
        }
      })
      .catch((error: unknown) => {
        setMembers([])
        setMembersError(
          error instanceof Error
            ? error.message
            : 'Team member management is currently unavailable.'
        )
      })
      .finally(() => {
        setIsLoadingMembers(false)
      })
  }, [])
  const [inviteRole, setInviteRole] = useState<'admin' | 'contractor'>('contractor')
  const [showInvite, _setShowInvite] = useState(false)

  const statusLabel: Record<TeamMember['status'], { text: string; className: string }> = {
    active: { text: t('team.memberStatus.active'), className: 'bg-green-500/10 text-green-700' },
    pending: {
      text: t('team.memberStatus.pending'),
      className: 'bg-yellow-500/10 text-yellow-700',
    },
    inactive: {
      text: t('team.memberStatus.inactive'),
      className: 'bg-[var(--brand-background)] text-[var(--brand-text-secondary)]',
    },
  }

  const roleLabel: Record<string, string> = {
    admin: t('team.roles.admin'),
    contractor: t('team.roles.contractor'),
  }

  return (
    <Card>
      <CardHeader
        title={t('team.title')}
        subtitle={t('team.subtitle')}
        action={
          <Button variant="primary" size="sm" disabled>
            <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z"
              />
            </svg>
            {t('team.inviteMember')}
          </Button>
        }
      />
      <CardBody className="space-y-4">
        {membersError && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {membersError} Team invitations and full roster sync are disabled until a dedicated team
            members endpoint is available.
          </div>
        )}

        {/* Invite form */}
        {showInvite && (
          <div className="p-4 bg-orange-50/50 border border-orange-100 rounded-xl space-y-3">
            <p className="text-sm font-semibold text-[var(--brand-text)]">
              {t('team.inviteNewMember')}
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <Input
                  placeholder={t('team.memberEmailPlaceholder')}
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  type="email"
                />
              </div>
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as 'admin' | 'contractor')}
                className="rounded-lg border border-[var(--brand-border)] px-3 py-2.5 text-sm text-[var(--brand-text)] focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="contractor">{t('team.roles.contractor')}</option>
                <option value="admin">{t('team.roles.admin')}</option>
              </select>
              <Button variant="primary" size="md">
                {t('team.sendInvite')}
              </Button>
            </div>
          </div>
        )}

        {/* Members table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--brand-border)]">
                <th className="text-left py-3 px-2 text-xs font-semibold text-[var(--brand-text-secondary)] uppercase tracking-wider">
                  {t('team.name')}
                </th>
                <th className="text-left py-3 px-2 text-xs font-semibold text-[var(--brand-text-secondary)] uppercase tracking-wider hidden sm:table-cell">
                  {t('team.email')}
                </th>
                <th className="text-left py-3 px-2 text-xs font-semibold text-[var(--brand-text-secondary)] uppercase tracking-wider">
                  {t('team.role')}
                </th>
                <th className="text-left py-3 px-2 text-xs font-semibold text-[var(--brand-text-secondary)] uppercase tracking-wider">
                  {t('team.status')}
                </th>
                <th className="text-right py-3 px-2 text-xs font-semibold text-[var(--brand-text-secondary)] uppercase tracking-wider w-20">
                  {t('team.manage')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--brand-border)]">
              {isLoadingMembers && (
                <tr>
                  <td
                    colSpan={5}
                    className="py-8 px-2 text-center text-sm text-[var(--brand-text-secondary)]"
                  >
                    Loading team members...
                  </td>
                </tr>
              )}
              {!isLoadingMembers && members.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="py-8 px-2 text-center text-sm text-[var(--brand-text-secondary)]"
                  >
                    No team members could be loaded.
                  </td>
                </tr>
              )}
              {!isLoadingMembers &&
                members.map((member) => (
                  <tr key={member.id} className="hover:bg-[var(--brand-primary-light)]/50">
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-gray-600 to-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-semibold text-white">
                            {member.name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[var(--brand-text)]">
                            {member.name}
                          </p>
                          <p className="text-xs text-[var(--brand-text-secondary)] sm:hidden">
                            {member.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-2 text-sm text-[var(--brand-text-secondary)] hidden sm:table-cell">
                      {member.email}
                    </td>
                    <td className="py-3 px-2 text-sm text-[var(--brand-text)]">
                      {roleLabel[member.role]}
                    </td>
                    <td className="py-3 px-2">
                      <span
                        className={clsx(
                          'inline-flex px-2 py-0.5 rounded-full text-xs font-medium',
                          statusLabel[member.status].className
                        )}
                      >
                        {statusLabel[member.status].text}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-right">
                      <button
                        type="button"
                        className="p-1.5 text-[var(--brand-text-secondary)] hover:text-red-600 hover:bg-red-500/10 rounded-lg transition-colors"
                        title={t('team.deleteMember')}
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                          />
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
  const t = useTranslations('settingsPage')
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
      <CardHeader title={t('api.title')} subtitle={t('api.subtitle')} />
      <CardBody className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-[var(--brand-text)] mb-1">
            {t('api.apiKey')}
          </label>
          <div className="flex items-center gap-2">
            <div className="flex-1 px-4 py-2.5 bg-[var(--brand-background)] border border-[var(--brand-border)] rounded-lg text-sm font-mono text-[var(--brand-text-secondary)] truncate">
              {showKey ? apiKey : maskedKey}
            </div>
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="flex-shrink-0 p-2.5 border border-[var(--brand-border)] rounded-lg text-[var(--brand-text-secondary)] hover:bg-[var(--brand-primary-light)] transition-colors"
              title={showKey ? t('api.hide') : t('api.show')}
            >
              {showKey ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                  />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              )}
            </button>
            <button
              type="button"
              onClick={handleCopy}
              className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-2.5 border border-[var(--brand-border)] rounded-lg text-sm font-medium text-[var(--brand-text)] hover:bg-[var(--brand-primary-light)] transition-colors"
            >
              {copied ? (
                <svg
                  className="w-4 h-4 text-green-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.5 12.75l6 6 9-13.5"
                  />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Regenerate */}
        <div>
          {showConfirm ? (
            <div className="p-4 bg-red-500/10 border border-red-100 rounded-xl space-y-3">
              <p className="text-sm font-medium text-red-400">{t('api.regenerateConfirm')}</p>
              <div className="flex gap-2">
                <Button variant="danger" size="sm" onClick={() => setShowConfirm(false)}>
                  {t('api.confirmRegenerate')}
                </Button>
                <Button variant="outline" size="sm" onClick={() => setShowConfirm(false)}>
                  {t('api.cancel')}
                </Button>
              </div>
            </div>
          ) : (
            <Button variant="outline" size="sm" onClick={() => setShowConfirm(true)}>
              <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182"
                />
              </svg>
              {t('api.regenerateKey')}
            </Button>
          )}
        </div>

        {/* Webhook endpoints */}
        <div>
          <label className="block text-sm font-medium text-[var(--brand-text)] mb-2">
            {t('api.webhookEndpoints')}
          </label>
          <div className="space-y-2">
            {[
              {
                event: 'lead.created',
                url: 'https://api.solariq.co/webhook/lead-created',
                active: true,
              },
              {
                event: 'proposal.viewed',
                url: 'https://api.solariq.co/webhook/proposal-viewed',
                active: true,
              },
              {
                event: 'payment.received',
                url: 'https://api.solariq.co/webhook/payment-received',
                active: false,
              },
            ].map((endpoint) => (
              <div
                key={endpoint.event}
                className="flex items-center justify-between p-3 bg-[var(--brand-background)] border border-[var(--brand-border)] rounded-lg"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[var(--brand-text)]">{endpoint.event}</p>
                  <p className="text-xs text-[var(--brand-text-secondary)] font-mono truncate">
                    {endpoint.url}
                  </p>
                </div>
                <span
                  className={clsx(
                    'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ml-3',
                    endpoint.active
                      ? 'bg-green-500/10 text-green-700'
                      : 'bg-[var(--brand-background)] text-[var(--brand-text-secondary)]'
                  )}
                >
                  <span
                    className={clsx(
                      'w-1.5 h-1.5 rounded-full',
                      endpoint.active ? 'bg-green-500' : 'bg-gray-400'
                    )}
                  />
                  {endpoint.active ? 'Active' : 'Inactive'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Usage stats */}
        <div className="p-4 bg-[var(--brand-background)] rounded-xl">
          <p className="text-xs font-semibold text-[var(--brand-text-secondary)] uppercase tracking-wider mb-3">
            {t('api.usageThisMonth')}
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-2xl font-bold text-[var(--brand-text)]">1,247</p>
              <p className="text-xs text-[var(--brand-text-secondary)]">{t('api.requestsUsed')}</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-[var(--brand-text)]">10,000</p>
              <p className="text-xs text-[var(--brand-text-secondary)]">{t('api.monthlyLimit')}</p>
            </div>
          </div>
          <div className="mt-3 w-full bg-[var(--brand-border)] rounded-full h-2">
            <div className="bg-orange-500 h-2 rounded-full" style={{ width: '12.47%' }} />
          </div>
          <p className="text-xs text-[var(--brand-text-secondary)] mt-1.5">
            {t('api.usagePercent', { percent: '12.47' })}
          </p>
        </div>
      </CardBody>
    </Card>
  )
}

// ---------------------------------------------------------------------------
// Section: White-Label Branding (Enterprise)
// ---------------------------------------------------------------------------

function WhiteLabelSection() {
  const t = useTranslations('settingsPage')
  const { brand, brands, switchBrand, refresh } = useBrand()
  const manageableBrand = brand && 'id' in brand ? brand : null
  const [activeBrandId, setActiveBrandId] = useState(manageableBrand?.id ?? '')
  const [brandName, setBrandName] = useState(manageableBrand?.name ?? '')
  const [companyName, setCompanyName] = useState(manageableBrand?.company_name ?? '')
  const [logoLightUrl, setLogoLightUrl] = useState(manageableBrand?.logo_light_url ?? '')
  const [logoDarkUrl, setLogoDarkUrl] = useState(manageableBrand?.logo_dark_url ?? '')
  const [faviconUrl, setFaviconUrl] = useState(manageableBrand?.favicon_ico_url ?? '')
  const [primaryColor, setPrimaryColor] = useState(manageableBrand?.colors?.primary ?? '#f97316')
  const [secondaryColor, setSecondaryColor] = useState(
    manageableBrand?.colors?.secondary ?? '#1A1A2E'
  )
  const [accentColor, setAccentColor] = useState(manageableBrand?.colors?.accent ?? '#FFB800')
  const [fontBody, setFontBody] = useState(manageableBrand?.fonts?.body ?? 'Sarabun')
  const [fontHeading, setFontHeading] = useState(manageableBrand?.fonts?.heading ?? 'Prompt')
  const [borderRadius, setBorderRadius] = useState(manageableBrand?.border_radius ?? 8)

  // Live preview: inject CSS vars when colors change
  useEffect(() => {
    if (typeof document === 'undefined') {
      return
    }
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
    if (typeof document === 'undefined') {
      return
    }
    document.documentElement.style.setProperty('--color-secondary', secondaryColor)
    document.documentElement.style.setProperty('--brand-secondary', secondaryColor)
  }, [secondaryColor])

  useEffect(() => {
    if (typeof document === 'undefined') {
      return
    }
    document.documentElement.style.setProperty('--font-brand', fontBody)
  }, [fontBody])

  const [customDomain, setCustomDomain] = useState(manageableBrand?.domain ?? '')
  const [domainInfo, setDomainInfo] = useState<BrandDomain | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [newBrandName, setNewBrandName] = useState('')
  const [newCompanyName, setNewCompanyName] = useState('')

  useEffect(() => {
    if (!manageableBrand) {
      return
    }
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [manageableBrand?.id])

  const handleSwitchBrand = (id: string) => {
    setActiveBrandId(id)
    switchBrand(id)
  }

  const handleSave = async () => {
    if (!manageableBrand) {
      return
    }
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
    if (!newBrandName || !newCompanyName) {
      return
    }
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
    if (!manageableBrand) {
      return
    }
    setIsSaving(true)
    try {
      await setDefaultBrand(manageableBrand.id)
      await refresh()
    } finally {
      setIsSaving(false)
    }
  }

  const handleDomainSave = async () => {
    if (!manageableBrand || !customDomain) {
      return
    }
    setIsSaving(true)
    try {
      const info = await addBrandDomain(manageableBrand.id, customDomain)
      setDomainInfo(info)
    } finally {
      setIsSaving(false)
    }
  }

  const handleVerifyDomain = async () => {
    if (!manageableBrand) {
      return
    }
    setIsSaving(true)
    try {
      const result = await verifyBrandDomain(manageableBrand.id)
      setDomainInfo((prev) =>
        prev
          ? {
              ...prev,
              status: result.status,
              ssl_status: result.ssl_status,
              dns_verified: result.verified,
            }
          : prev
      )
    } finally {
      setIsSaving(false)
    }
  }

  if (!manageableBrand) {
    return (
      <Card>
        <CardHeader title={t('branding.title')} subtitle={t('branding.subtitle')} />
        <CardBody>
          <p className="text-sm text-[var(--brand-text-secondary)]">{t('branding.orgOnly')}</p>
        </CardBody>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader title={t('branding.title')} subtitle={t('branding.subtitle')} />
      <CardBody className="space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          <div className="min-w-[200px]">
            <label className="block text-xs font-medium text-[var(--brand-text-secondary)] mb-1">
              {t('branding.selectBrand')}
            </label>
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
            {t('branding.setDefault')}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Input
            label={t('branding.brandName')}
            value={brandName}
            onChange={(e) => setBrandName(e.target.value)}
          />
          <Input
            label={t('branding.displayCompanyName')}
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <Input
              label={t('branding.logoLight')}
              value={logoLightUrl}
              onChange={(e) => setLogoLightUrl(e.target.value)}
            />
            <div className="mt-2 flex items-center gap-2">
              <span className="text-xs text-[var(--brand-text-secondary)]">
                Upload is not available from this screen yet. Paste a hosted logo URL instead.
              </span>
              {logoLightUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logoLightUrl} alt="logo preview" className="h-8 object-contain rounded" />
              )}
            </div>
          </div>
          <Input
            label={t('branding.logoDark')}
            value={logoDarkUrl}
            onChange={(e) => setLogoDarkUrl(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Input
            label={t('branding.faviconUrl')}
            value={faviconUrl}
            onChange={(e) => setFaviconUrl(e.target.value)}
          />
          <Input
            label={t('branding.borderRadius')}
            value={borderRadius.toString()}
            onChange={(e) => setBorderRadius(Number(e.target.value) || 0)}
            type="number"
            min={0}
            max={16}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div>
            <label className="block text-sm font-medium text-[var(--brand-text)] mb-1">
              {t('branding.primaryColor')}
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="w-10 h-10 rounded-lg border border-[var(--brand-border)] cursor-pointer p-0.5"
              />
              <Input
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="flex-1 font-mono"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--brand-text)] mb-1">
              {t('branding.secondaryColor')}
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={secondaryColor}
                onChange={(e) => setSecondaryColor(e.target.value)}
                className="w-10 h-10 rounded-lg border border-[var(--brand-border)] cursor-pointer p-0.5"
              />
              <Input
                value={secondaryColor}
                onChange={(e) => setSecondaryColor(e.target.value)}
                className="flex-1 font-mono"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--brand-text)] mb-1">
              {t('branding.accentColor')}
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={accentColor}
                onChange={(e) => setAccentColor(e.target.value)}
                className="w-10 h-10 rounded-lg border border-[var(--brand-border)] cursor-pointer p-0.5"
              />
              <Input
                value={accentColor}
                onChange={(e) => setAccentColor(e.target.value)}
                className="flex-1 font-mono"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-[var(--brand-text)] mb-1">
              {t('branding.fontHeading')}
            </label>
            <select
              value={fontHeading}
              onChange={(e) => setFontHeading(e.target.value)}
              className="w-full rounded-lg border border-[var(--brand-border)] bg-[var(--brand-surface)] px-3 py-2.5 text-sm text-[var(--brand-text)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
            >
              {FONT_OPTIONS.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--brand-text)] mb-1">
              {t('branding.fontBody')}
            </label>
            <select
              value={fontBody}
              onChange={(e) => setFontBody(e.target.value)}
              className="w-full rounded-lg border border-[var(--brand-border)] bg-[var(--brand-surface)] px-3 py-2.5 text-sm text-[var(--brand-text)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
            >
              {FONT_OPTIONS.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
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
            hint={t('branding.customDomainHint')}
          />
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleDomainSave} disabled={isSaving}>
              {t('branding.setupDomain')}
            </Button>
            <Button variant="ghost" size="sm" onClick={handleVerifyDomain} disabled={isSaving}>
              {t('branding.verifyDns')}
            </Button>
          </div>
        </div>

        {domainInfo && (
          <div className="rounded-xl border border-[var(--brand-border)] p-4 text-sm">
            <p className="font-semibold text-[var(--brand-text)] mb-2">
              {t('branding.dnsRecords')}
            </p>
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
          <label className="block text-sm font-medium text-[var(--brand-text)] mb-2">
            {t('branding.preview')}
          </label>
          <div className="p-6 border border-[var(--brand-border)] rounded-xl">
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: primaryColor }}
              >
                <span className="text-white text-sm font-bold">{companyName.charAt(0) || 'B'}</span>
              </div>
              <div>
                <p className="text-sm font-bold" style={{ color: primaryColor }}>
                  {companyName || 'Your Company'}
                </p>
                <p className="text-xs text-[var(--brand-text-secondary)]">
                  {customDomain || 'solar.yourdomain.com'}
                </p>
              </div>
            </div>
            <div
              className="h-2 rounded-full"
              style={{ backgroundColor: primaryColor, opacity: 0.2 }}
            >
              <div className="h-2 rounded-full w-3/4" style={{ backgroundColor: primaryColor }} />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-[var(--brand-border)] p-4">
          <p className="text-sm font-semibold text-[var(--brand-text)] mb-3">
            {t('branding.createNewBrand')}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label={t('branding.newBrandName')}
              value={newBrandName}
              onChange={(e) => setNewBrandName(e.target.value)}
            />
            <Input
              label={t('branding.newCompanyName')}
              value={newCompanyName}
              onChange={(e) => setNewCompanyName(e.target.value)}
            />
          </div>
          <div className="flex justify-end mt-3">
            <Button variant="outline" size="sm" onClick={handleCreateBrand} disabled={isCreating}>
              {isCreating ? t('branding.creating') : t('branding.createBrand')}
            </Button>
          </div>
        </div>
      </CardBody>
      <CardFooter>
        <div className="flex justify-between items-center w-full">
          <div className="text-xs text-[var(--brand-text-secondary)]">
            {t('branding.customizationNote')}
          </div>
          <Button variant="primary" size="sm" onClick={handleSave} disabled={isSaving}>
            {isSaving ? t('branding.saving') : t('branding.saveSettings')}
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}

// ---------------------------------------------------------------------------
// Section: Security & MFA
// ---------------------------------------------------------------------------

function SecurityMFASection() {
  const t = useTranslations('settingsPage')
  const [mfaStatus, setMfaStatus] = useState<
    'not_enrolled' | 'enrolling' | 'enrolled' | 'disabled'
  >('not_enrolled')
  const [loading, setLoading] = useState(true)
  const [enrollStep, setEnrollStep] = useState<'idle' | 'qr' | 'verify'>('idle')
  const [qrCodeUrl, setQrCodeUrl] = useState('')
  const [secret, setSecret] = useState('')
  const [backupCodes, setBackupCodes] = useState<string[]>([])
  const [verifyCode, setVerifyCode] = useState('')
  const [error, setError] = useState('')
  const [backupCodesRemaining, setBackupCodesRemaining] = useState(0)
  const [showBackupCodes, setShowBackupCodes] = useState(false)

  const fetchStatus = useCallback(async () => {
    try {
      setLoading(true)
      const res = await apiClient.get('/api/v1/mfa/status')
      setMfaStatus(res.data.status)
      setBackupCodesRemaining(res.data.backup_codes_remaining ?? 0)
    } catch {
      setError(t('security.fetchError'))
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => {
    fetchStatus()
  }, [fetchStatus])

  const handleStartEnroll = async () => {
    try {
      setError('')
      const res = await apiClient.post('/api/v1/mfa/enroll/start', { method: 'totp' })
      setSecret(res.data.secret)
      setQrCodeUrl(res.data.qr_code_url)
      setBackupCodes(res.data.backup_codes ?? [])
      setEnrollStep('qr')
    } catch {
      setError(t('security.enrollError'))
    }
  }

  const handleVerifyEnroll = async () => {
    if (verifyCode.length !== 6) {
      setError(t('security.codeLength'))
      return
    }
    try {
      setError('')
      const res = await apiClient.post('/api/v1/mfa/enroll/verify', {
        secret,
        code: verifyCode,
        backup_codes: backupCodes,
      })
      if (res.data.success) {
        setMfaStatus('enrolled')
        setEnrollStep('idle')
        setShowBackupCodes(true)
        setBackupCodesRemaining(res.data.backup_codes_remaining ?? backupCodes.length)
      } else {
        setError(t('security.verifyFailed'))
      }
    } catch {
      setError(t('security.verifyFailed'))
    }
  }

  const handleDisable = async () => {
    if (!confirm(t('security.disableConfirm'))) {
      return
    }
    try {
      setError('')
      await apiClient.post('/api/v1/mfa/disable')
      setMfaStatus('not_enrolled')
      setEnrollStep('idle')
      setBackupCodes([])
      setShowBackupCodes(false)
    } catch {
      setError(t('security.disableError'))
    }
  }

  if (loading) {
    return (
      <Card>
        <CardBody>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500" />
          </div>
        </CardBody>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* MFA Status Card */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-[var(--brand-text)]">{t('security.title')}</h2>
          <p className="text-sm text-[var(--brand-text-secondary)] mt-1">
            {t('security.subtitle')}
          </p>
        </CardHeader>
        <CardBody>
          {error && (
            <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Current status */}
          <div className="flex items-center justify-between p-4 bg-[var(--brand-background)] rounded-lg mb-4">
            <div className="flex items-center gap-3">
              <div
                className={clsx(
                  'w-3 h-3 rounded-full',
                  mfaStatus === 'enrolled' ? 'bg-green-500' : 'bg-[var(--brand-border)]'
                )}
              />
              <div>
                <p className="text-sm font-medium text-[var(--brand-text)]">
                  {t('security.mfaStatus')}
                </p>
                <p className="text-xs text-[var(--brand-text-secondary)]">
                  {mfaStatus === 'enrolled'
                    ? t('security.statusEnabled')
                    : t('security.statusDisabled')}
                </p>
              </div>
            </div>
            {mfaStatus === 'enrolled' && (
              <span className="text-xs text-[var(--brand-text-secondary)]">
                {t('security.backupCodesRemaining', { count: backupCodesRemaining })}
              </span>
            )}
          </div>

          {/* Enrollment flow */}
          {mfaStatus !== 'enrolled' && enrollStep === 'idle' && (
            <Button onClick={handleStartEnroll} variant="primary">
              {t('security.enableMfa')}
            </Button>
          )}

          {enrollStep === 'qr' && (
            <div className="space-y-4">
              <div className="p-4 bg-[var(--brand-surface)] border border-[var(--brand-border)] rounded-lg">
                <p className="text-sm font-medium text-[var(--brand-text)] mb-3">
                  {t('security.scanQr')}
                </p>
                <div className="flex justify-center mb-3">
                  <Image
                    src={qrCodeUrl}
                    alt="MFA QR Code"
                    width={192}
                    height={192}
                    className="w-48 h-48"
                  />
                </div>
                <div className="text-center">
                  <p className="text-xs text-[var(--brand-text-secondary)] mb-1">
                    {t('security.manualEntry')}
                  </p>
                  <code className="text-xs bg-[var(--brand-background)] px-2 py-1 rounded select-all break-all">
                    {secret}
                  </code>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--brand-text)] mb-1">
                  {t('security.enterCode')}
                </label>
                <div className="flex gap-2">
                  <Input
                    value={verifyCode}
                    onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    className="w-40 text-center tracking-widest"
                  />
                  <Button onClick={handleVerifyEnroll} variant="primary">
                    {t('security.verify')}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Backup codes display */}
          {showBackupCodes && backupCodes.length > 0 && (
            <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <p className="text-sm font-medium text-yellow-600 mb-2">
                {t('security.backupCodesTitle')}
              </p>
              <p className="text-xs text-yellow-700 mb-3">{t('security.backupCodesWarning')}</p>
              <div className="grid grid-cols-2 gap-1">
                {backupCodes.map((code, i) => (
                  <code
                    key={i}
                    className="text-xs bg-white px-2 py-1 rounded text-center select-all"
                  >
                    {code}
                  </code>
                ))}
              </div>
              <Button
                variant="secondary"
                className="mt-3"
                onClick={() => setShowBackupCodes(false)}
              >
                {t('security.backupCodesDone')}
              </Button>
            </div>
          )}
        </CardBody>
        {mfaStatus === 'enrolled' && (
          <CardFooter>
            <Button variant="danger" onClick={handleDisable}>
              {t('security.disableMfa')}
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Section: Privacy & PDPA
// ---------------------------------------------------------------------------

function PrivacySection() {
  const t = useTranslations('settingsPage')
  const { user } = useAuth()
  const [activePrivacyTab, setActivePrivacyTab] = useState<'consent' | 'data' | 'cookie'>('consent')
  const [isExporting, setIsExporting] = useState(false)
  const [_showDeleteModal, setShowDeleteModal] = useState(false)

  const handleExportData = async () => {
    setIsExporting(true)
    try {
      // Simulate API call - Replace with actual API call
      // const response = await apiClient.get('/privacy/export', {
      //   responseType: 'blob',
      // })
      // const url = window.URL.createObjectURL(new Blob([response.data]))
      // const link = document.createElement('a')
      // link.href = url
      // link.setAttribute('download', `solariq-data-export-${Date.now()}.json`)
      // document.body.appendChild(link)
      // link.click()
      // link.remove()

      // Simulate delay
      await new Promise((resolve) => setTimeout(resolve, 1500))
      alert(t('privacy.data.exportSuccess'))
    } catch {
      alert(t('privacy.data.exportError'))
    } finally {
      setIsExporting(false)
    }
  }

  // handleDeleteAccount reserved for future implementation
  // (removed to fix unused-variable TS error)

  return (
    <div className="space-y-6">
      {/* Privacy Tabs */}
      <div className="border-b border-[var(--brand-border)]">
        <nav className="flex gap-8" aria-label="Privacy tabs">
          <button
            onClick={() => setActivePrivacyTab('consent')}
            className={`pb-4 text-sm font-medium border-b-2 transition-colors ${
              activePrivacyTab === 'consent'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-[var(--brand-text-secondary)] hover:text-[var(--brand-text)]'
            }`}
          >
            {t('privacy.tabs.consent')}
          </button>
          <button
            onClick={() => setActivePrivacyTab('data')}
            className={`pb-4 text-sm font-medium border-b-2 transition-colors ${
              activePrivacyTab === 'data'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-[var(--brand-text-secondary)] hover:text-[var(--brand-text)]'
            }`}
          >
            {t('privacy.tabs.data')}
          </button>
          <button
            onClick={() => setActivePrivacyTab('cookie')}
            className={`pb-4 text-sm font-medium border-b-2 transition-colors ${
              activePrivacyTab === 'cookie'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-[var(--brand-text-secondary)] hover:text-[var(--brand-text)]'
            }`}
          >
            {t('privacy.tabs.cookie')}
          </button>
        </nav>
      </div>

      {/* Consent Tab */}
      {activePrivacyTab === 'consent' && (
        <Card>
          <CardHeader title={t('privacy.consent.title')} subtitle={t('privacy.consent.subtitle')} />
          <CardBody className="space-y-4">
            <div className="bg-blue-500/10 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-sm text-blue-900 dark:text-blue-100">
                {t('privacy.consent.notice')}
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 border border-[var(--brand-border)] dark:border-gray-700 rounded-lg">
                <div>
                  <p className="font-medium text-[var(--brand-text)] dark:text-white">
                    {t('privacy.consent.storage')}
                  </p>
                  <p className="text-sm text-[var(--brand-text-secondary)] dark:text-[var(--brand-text-secondary)]">
                    {t('privacy.consent.storageDesc')}
                  </p>
                </div>
                <div className="px-3 py-1 text-xs font-medium bg-green-500/10 dark:bg-green-900/30 text-green-800 dark:text-green-400 rounded-full">
                  {t('privacy.consent.given')}
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border border-[var(--brand-border)] dark:border-gray-700 rounded-lg">
                <div>
                  <p className="font-medium text-[var(--brand-text)] dark:text-white">
                    {t('privacy.consent.analysis')}
                  </p>
                  <p className="text-sm text-[var(--brand-text-secondary)] dark:text-[var(--brand-text-secondary)]">
                    {t('privacy.consent.analysisDesc')}
                  </p>
                </div>
                <div className="px-3 py-1 text-xs font-medium bg-green-500/10 dark:bg-green-900/30 text-green-800 dark:text-green-400 rounded-full">
                  {t('privacy.consent.given')}
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border border-[var(--brand-border)] dark:border-gray-700 rounded-lg">
                <div>
                  <p className="font-medium text-[var(--brand-text)] dark:text-white">
                    {t('privacy.consent.marketing')}
                  </p>
                  <p className="text-sm text-[var(--brand-text-secondary)] dark:text-[var(--brand-text-secondary)]">
                    {t('privacy.consent.marketingDesc')}
                  </p>
                </div>
                <Toggle enabled={true} onChange={() => {}} />
              </div>

              <div className="flex items-center justify-between p-4 border border-[var(--brand-border)] dark:border-gray-700 rounded-lg">
                <div>
                  <p className="font-medium text-[var(--brand-text)] dark:text-white">
                    {t('privacy.consent.sharing')}
                  </p>
                  <p className="text-sm text-[var(--brand-text-secondary)] dark:text-[var(--brand-text-secondary)]">
                    {t('privacy.consent.sharingDesc')}
                  </p>
                </div>
                <Toggle enabled={false} onChange={() => {}} />
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Data Tab */}
      {activePrivacyTab === 'data' && (
        <Card>
          <CardHeader title={t('privacy.data.title')} subtitle={t('privacy.data.subtitle')} />
          <CardBody className="space-y-6">
            {/* User Info */}
            <div className="bg-[var(--brand-background)] dark:bg-gray-800 rounded-lg p-4">
              <h3 className="font-medium text-[var(--brand-text)] dark:text-white mb-3">
                {t('privacy.data.accountInfo')}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-[var(--brand-text-secondary)] dark:text-[var(--brand-text-secondary)]">
                    {t('privacy.data.name')}
                  </p>
                  <p className="text-[var(--brand-text)] dark:text-white font-medium">
                    {user?.displayName || '-'}
                  </p>
                </div>
                <div>
                  <p className="text-[var(--brand-text-secondary)] dark:text-[var(--brand-text-secondary)]">
                    {t('privacy.data.email')}
                  </p>
                  <p className="text-[var(--brand-text)] dark:text-white font-medium">
                    {user?.email || '-'}
                  </p>
                </div>
                <div>
                  <p className="text-[var(--brand-text-secondary)] dark:text-[var(--brand-text-secondary)]">
                    {t('privacy.data.phone')}
                  </p>
                  <p className="text-[var(--brand-text)] dark:text-white font-medium">
                    {(user as unknown as { phoneNumber?: string })?.phoneNumber || '-'}
                  </p>
                </div>
                <div>
                  <p className="text-[var(--brand-text-secondary)] dark:text-[var(--brand-text-secondary)]">
                    {t('privacy.data.role')}
                  </p>
                  <p className="text-[var(--brand-text)] dark:text-white font-medium">
                    {user?.role || '-'}
                  </p>
                </div>
              </div>
            </div>

            {/* Data Export */}
            <div>
              <h3 className="font-medium text-[var(--brand-text)] dark:text-white mb-3">
                {t('privacy.data.export')}
              </h3>
              <p className="text-sm text-[var(--brand-text-secondary)] dark:text-[var(--brand-text-secondary)] mb-3">
                {t('privacy.data.exportDesc')}
              </p>
              <Button variant="outline" onClick={handleExportData} disabled={isExporting}>
                {isExporting ? t('privacy.data.exporting') : t('privacy.data.exportButton')}
              </Button>
            </div>

            {/* Delete Account */}
            <div className="border border-red-500/20 dark:border-red-800 rounded-lg p-4">
              <h3 className="font-medium text-red-900 dark:text-red-100 mb-2">
                {t('privacy.data.delete')}
              </h3>
              <p className="text-sm text-red-700 dark:text-red-300 mb-4">
                {t('privacy.data.deleteDesc')}
              </p>
              <Button
                variant="outline"
                className="border-red-500 text-red-600 hover:bg-red-500/10 dark:hover:bg-red-900/20"
                onClick={() => setShowDeleteModal(true)}
              >
                {t('privacy.data.deleteButton')}
              </Button>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Cookie Tab */}
      {activePrivacyTab === 'cookie' && (
        <Card>
          <CardHeader title={t('privacy.cookie.title')} subtitle={t('privacy.cookie.subtitle')} />
          <CardBody className="space-y-4">
            <div className="bg-blue-500/10 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-sm text-blue-900 dark:text-blue-100">
                {t('privacy.cookie.notice')}
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 border border-[var(--brand-border)] dark:border-gray-700 rounded-lg">
                <div>
                  <p className="font-medium text-[var(--brand-text)] dark:text-white">
                    {t('privacy.cookie.essential')}
                  </p>
                  <p className="text-sm text-[var(--brand-text-secondary)] dark:text-[var(--brand-text-secondary)]">
                    {t('privacy.cookie.essentialDesc')}
                  </p>
                </div>
                <div className="px-3 py-1 text-xs font-medium bg-green-500/10 dark:bg-green-900/30 text-green-800 dark:text-green-400 rounded-full">
                  {t('privacy.cookie.enabled')}
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border border-[var(--brand-border)] dark:border-gray-700 rounded-lg">
                <div>
                  <p className="font-medium text-[var(--brand-text)] dark:text-white">
                    {t('privacy.cookie.analytics')}
                  </p>
                  <p className="text-sm text-[var(--brand-text-secondary)] dark:text-[var(--brand-text-secondary)]">
                    {t('privacy.cookie.analyticsDesc')}
                  </p>
                </div>
                <Toggle enabled={true} onChange={() => {}} />
              </div>

              <div className="flex items-center justify-between p-4 border border-[var(--brand-border)] dark:border-gray-700 rounded-lg">
                <div>
                  <p className="font-medium text-[var(--brand-text)] dark:text-white">
                    {t('privacy.cookie.marketing')}
                  </p>
                  <p className="text-sm text-[var(--brand-text-secondary)] dark:text-[var(--brand-text-secondary)]">
                    {t('privacy.cookie.marketingDesc')}
                  </p>
                </div>
                <Toggle enabled={false} onChange={() => {}} />
              </div>
            </div>

            <div className="pt-4 border-t border-[var(--brand-border)] dark:border-gray-700">
              <a
                href="/pdpa"
                className="text-sm text-orange-600 dark:text-orange-400 hover:underline"
              >
                {t('privacy.cookie.pdpaLink')} &rarr;
              </a>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main Settings Page
// ---------------------------------------------------------------------------

export default function SettingsPage() {
  const t = useTranslations('settingsPage')
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<SettingsTab>('company')
  const isAdmin = user?.role === 'admin'

  const visibleTabs = TABS.filter((tab) => {
    if (tab.adminOnly && !isAdmin) {
      return false
    }
    // Enterprise tabs still shown but can be gated with a badge
    return true
  })

  const renderSection = () => {
    switch (activeTab) {
      case 'company':
        return <CompanyProfileSection />
      case 'tax':
        return <TaxProfileSection />
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
      case 'privacy':
        return <PrivacySection />
      case 'security':
        return <SecurityMFASection />
      default:
        return null
    }
  }

  return (
    <AppLayout user={user}>
      <div className="max-w-5xl space-y-6">
        {/* Page header */}
        <div>
          <h1 className="text-xl font-bold text-[var(--brand-text)]">{t('title')}</h1>
          <p className="text-sm text-[var(--brand-text-secondary)] mt-1">{t('subtitle')}</p>
        </div>

        {/* Tabs */}
        <div className="border-b border-[var(--brand-border)] overflow-x-auto scrollbar-thin">
          <nav className="flex gap-1 min-w-max" aria-label="Settings tabs">
            {visibleTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={clsx(
                  'inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap',
                  activeTab === tab.key
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-[var(--brand-text-secondary)] hover:text-[var(--brand-text)] hover:border-[var(--brand-border)]'
                )}
              >
                <span
                  className={clsx(
                    activeTab === tab.key ? 'text-orange-500' : 'text-[var(--brand-text-secondary)]'
                  )}
                >
                  {tab.icon}
                </span>
                {t(tab.labelKey)}
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
