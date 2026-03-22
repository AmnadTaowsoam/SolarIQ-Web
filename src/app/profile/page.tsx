'use client'

import React, { useState, useRef } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { useToast } from '@/components/ui/Toast'
import { useAuth } from '@/context'
import apiClient from '@/lib/api'
import {
  Camera,
  Mail,
  Phone,
  Shield,
  ShieldCheck,
  BadgeCheck,
  Bell,
  BellRing,
  MessageCircle,
  Newspaper,
  Megaphone,
  Lock,
  Smartphone,
  QrCode,
  Monitor,
  MapPin,
  Clock,
  AlertTriangle,
  Trash2,
  Download,
  Eye,
  EyeOff,
  User,
  Briefcase,
  Building2,
  Hash,
  FileText,
} from 'lucide-react'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ProfileFormData {
  displayName: string
  email: string
  phone: string
  role: 'admin' | 'contractor' | 'viewer'
  emailVerified: boolean
  firstName: string
  lastName: string
  position: string
  company: string
  lineId: string
  bio: string
  photoUrl: string | null
}

interface NotificationPrefs {
  emailNotifications: boolean
  pushNotifications: boolean
  lineNotifications: boolean
  weeklyDigest: boolean
  marketingEmails: boolean
}

interface LastLoginInfo {
  ip: string
  device: string
  time: string
}

// ---------------------------------------------------------------------------
// Demo data
// ---------------------------------------------------------------------------

const DEMO_PROFILE: ProfileFormData = {
  displayName: 'สมชาย วงศ์สวัสดิ์',
  email: 'somchai@solariq.co',
  phone: '081-234-5678',
  role: 'admin',
  emailVerified: true,
  firstName: 'สมชาย',
  lastName: 'วงศ์สวัสดิ์',
  position: 'ผู้จัดการฝ่ายขาย',
  company: 'SolarIQ Co., Ltd.',
  lineId: '@somchai_solar',
  bio: 'ผู้เชี่ยวชาญด้านพลังงานแสงอาทิตย์ มีประสบการณ์กว่า 10 ปีในการติดตั้งระบบโซลาร์เซลล์',
  photoUrl: null,
}

const DEMO_NOTIF_PREFS: NotificationPrefs = {
  emailNotifications: true,
  pushNotifications: true,
  lineNotifications: false,
  weeklyDigest: true,
  marketingEmails: false,
}

const DEMO_LAST_LOGIN: LastLoginInfo = {
  ip: '203.150.xxx.xxx',
  device: 'Chrome 120 / Windows 11',
  time: '22 มี.ค. 2026, 09:15 น.',
}

// ---------------------------------------------------------------------------
// Toggle component
// ---------------------------------------------------------------------------

function Toggle({
  enabled,
  onChange,
  label,
  description,
  icon: Icon,
}: {
  enabled: boolean
  onChange: (v: boolean) => void
  label: string
  description?: string
  icon?: React.ComponentType<{ className?: string }>
}) {
  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex items-center gap-3">
        {Icon && <Icon className="w-5 h-5 text-[var(--brand-text-secondary)]" />}
        <div>
          <p className="text-sm font-medium text-[var(--brand-text)]">{label}</p>
          {description && (
            <p className="text-xs text-[var(--brand-text-secondary)]">{description}</p>
          )}
        </div>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        onClick={() => onChange(!enabled)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] focus:ring-offset-2 ${
          enabled ? 'bg-[var(--brand-primary)]' : 'bg-gray-300'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
            enabled ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Section Header
// ---------------------------------------------------------------------------

function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-1">
      <h2 className="text-lg font-semibold text-[var(--brand-text)]">{title}</h2>
      {subtitle && (
        <p className="text-sm text-[var(--brand-text-secondary)]">{subtitle}</p>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function ProfilePage() {
  const { user } = useAuth()
  const { addToast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Profile state
  const [profile, setProfile] = useState<ProfileFormData>(DEMO_PROFILE)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  // Notification prefs
  const [notifPrefs, setNotifPrefs] = useState<NotificationPrefs>(DEMO_NOTIF_PREFS)

  // Password modal
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [passwordForm, setPasswordForm] = useState({
    current: '',
    newPassword: '',
    confirm: '',
  })
  const [showCurrentPw, setShowCurrentPw] = useState(false)
  const [showNewPw, setShowNewPw] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)

  // 2FA
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)

  // Delete account modal
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [deleting, setDeleting] = useState(false)

  // Exporting data
  const [exporting, setExporting] = useState(false)

  // --- Handlers ---

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      addToast('error', 'ขนาดไฟล์ต้องไม่เกิน 5MB')
      return
    }
    const reader = new FileReader()
    reader.onloadend = () => {
      setPhotoPreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleSaveProfile = async () => {
    setSaving(true)
    try {
      await apiClient.put('/auth/me', {
        displayName: profile.displayName,
        phone: profile.phone,
        firstName: profile.firstName,
        lastName: profile.lastName,
        position: profile.position,
        lineId: profile.lineId,
        bio: profile.bio,
      })
      addToast('success', 'บันทึกข้อมูลโปรไฟล์เรียบร้อยแล้ว')
    } catch {
      addToast('error', 'ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่')
    } finally {
      setSaving(false)
    }
  }

  const handleSaveNotifications = async () => {
    try {
      await apiClient.put('/auth/me/notifications', notifPrefs)
      addToast('success', 'บันทึกการตั้งค่าแจ้งเตือนเรียบร้อยแล้ว')
    } catch {
      addToast('error', 'ไม่สามารถบันทึกการตั้งค่าได้')
    }
  }

  const handleChangePassword = async () => {
    if (passwordForm.newPassword.length < 8) {
      addToast('error', 'รหัสผ่านใหม่ต้องมีอย่างน้อย 8 ตัวอักษร')
      return
    }
    if (passwordForm.newPassword !== passwordForm.confirm) {
      addToast('error', 'รหัสผ่านใหม่ไม่ตรงกัน')
      return
    }
    setChangingPassword(true)
    try {
      await apiClient.post('/auth/change-password', {
        currentPassword: passwordForm.current,
        newPassword: passwordForm.newPassword,
      })
      addToast('success', 'เปลี่ยนรหัสผ่านเรียบร้อยแล้ว')
      setShowPasswordModal(false)
      setPasswordForm({ current: '', newPassword: '', confirm: '' })
    } catch {
      addToast('error', 'ไม่สามารถเปลี่ยนรหัสผ่านได้ กรุณาตรวจสอบรหัสผ่านปัจจุบัน')
    } finally {
      setChangingPassword(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') return
    setDeleting(true)
    try {
      await apiClient.delete('/auth/me')
      addToast('success', 'ลบบัญชีเรียบร้อยแล้ว')
    } catch {
      addToast('error', 'ไม่สามารถลบบัญชีได้ กรุณาลองใหม่')
    } finally {
      setDeleting(false)
      setShowDeleteModal(false)
    }
  }

  const handleExportData = async () => {
    setExporting(true)
    try {
      await apiClient.get('/auth/me/export')
      addToast('success', 'ส่งออกข้อมูลเรียบร้อยแล้ว ระบบจะส่งไฟล์ไปยังอีเมลของคุณ')
    } catch {
      addToast('error', 'ไม่สามารถส่งออกข้อมูลได้')
    } finally {
      setExporting(false)
    }
  }

  const roleBadgeColor: Record<string, string> = {
    admin: 'bg-purple-100 text-purple-800',
    contractor: 'bg-blue-100 text-blue-800',
    viewer: 'bg-gray-100 text-gray-800',
  }

  const roleLabel: Record<string, string> = {
    admin: 'ผู้ดูแลระบบ',
    contractor: 'ผู้รับเหมา',
    viewer: 'ผู้ชม',
  }

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Page title */}
        <div>
          <h1 className="text-2xl font-bold text-[var(--brand-text)]">ตั้งค่าโปรไฟล์</h1>
          <p className="text-sm text-[var(--brand-text-secondary)]">
            จัดการข้อมูลส่วนตัวและการตั้งค่าบัญชี
          </p>
        </div>

        {/* ========== Section 1: Profile Photo & Basic Info ========== */}
        <Card>
          <CardHeader>
            <SectionHeader title="รูปโปรไฟล์และข้อมูลพื้นฐาน" />
          </CardHeader>
          <CardBody>
            <div className="space-y-6">
              {/* Avatar upload */}
              <div className="flex items-center gap-5">
                <div className="relative group">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center overflow-hidden ring-4 ring-[var(--brand-border)]">
                    {photoPreview ? (
                      <img
                        src={photoPreview}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-2xl font-bold text-white">
                        {profile.displayName?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 w-7 h-7 bg-[var(--brand-primary)] text-white rounded-full flex items-center justify-center shadow-md hover:bg-[var(--brand-primary-hover)] transition-colors"
                  >
                    <Camera className="w-3.5 h-3.5" />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/gif"
                    className="hidden"
                    onChange={handlePhotoUpload}
                  />
                </div>
                <div>
                  <p className="text-sm font-medium text-[var(--brand-text)]">รูปโปรไฟล์</p>
                  <p className="text-xs text-[var(--brand-text-secondary)]">
                    JPG, PNG หรือ GIF ขนาดไม่เกิน 5MB
                  </p>
                </div>
              </div>

              {/* Display name */}
              <div>
                <label className="block text-sm font-medium text-[var(--brand-text)] mb-1.5">
                  <User className="w-4 h-4 inline mr-1.5 -mt-0.5" />
                  ชื่อที่แสดง
                </label>
                <Input
                  value={profile.displayName}
                  onChange={(e) => setProfile({ ...profile, displayName: e.target.value })}
                  placeholder="ชื่อที่แสดง"
                />
              </div>

              {/* Email (read-only) */}
              <div>
                <label className="block text-sm font-medium text-[var(--brand-text)] mb-1.5">
                  <Mail className="w-4 h-4 inline mr-1.5 -mt-0.5" />
                  อีเมล
                  {profile.emailVerified && (
                    <span className="inline-flex items-center gap-1 ml-2 px-2 py-0.5 text-[10px] font-semibold text-green-700 bg-green-100 rounded-full">
                      <BadgeCheck className="w-3 h-3" />
                      ยืนยันแล้ว
                    </span>
                  )}
                </label>
                <Input
                  value={profile.email}
                  disabled
                  className="bg-[var(--brand-background)] cursor-not-allowed"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-[var(--brand-text)] mb-1.5">
                  <Phone className="w-4 h-4 inline mr-1.5 -mt-0.5" />
                  เบอร์โทรศัพท์
                </label>
                <Input
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  placeholder="0xx-xxx-xxxx"
                />
              </div>

              {/* Role badge (read-only) */}
              <div>
                <label className="block text-sm font-medium text-[var(--brand-text)] mb-1.5">
                  <Shield className="w-4 h-4 inline mr-1.5 -mt-0.5" />
                  บทบาท
                </label>
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-full ${roleBadgeColor[profile.role]}`}
                >
                  <ShieldCheck className="w-4 h-4" />
                  {roleLabel[profile.role]}
                </span>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* ========== Section 2: Personal Information ========== */}
        <Card>
          <CardHeader>
            <SectionHeader title="ข้อมูลส่วนบุคคล" />
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* First name */}
                <div>
                  <label className="block text-sm font-medium text-[var(--brand-text)] mb-1.5">
                    ชื่อ
                  </label>
                  <Input
                    value={profile.firstName}
                    onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                    placeholder="ชื่อ"
                  />
                </div>
                {/* Last name */}
                <div>
                  <label className="block text-sm font-medium text-[var(--brand-text)] mb-1.5">
                    นามสกุล
                  </label>
                  <Input
                    value={profile.lastName}
                    onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                    placeholder="นามสกุล"
                  />
                </div>
              </div>

              {/* Position */}
              <div>
                <label className="block text-sm font-medium text-[var(--brand-text)] mb-1.5">
                  <Briefcase className="w-4 h-4 inline mr-1.5 -mt-0.5" />
                  ตำแหน่ง
                </label>
                <Input
                  value={profile.position}
                  onChange={(e) => setProfile({ ...profile, position: e.target.value })}
                  placeholder="ตำแหน่งงาน"
                />
              </div>

              {/* Company (read-only) */}
              <div>
                <label className="block text-sm font-medium text-[var(--brand-text)] mb-1.5">
                  <Building2 className="w-4 h-4 inline mr-1.5 -mt-0.5" />
                  บริษัท
                </label>
                <Input
                  value={profile.company}
                  disabled
                  className="bg-[var(--brand-background)] cursor-not-allowed"
                />
                <p className="text-xs text-[var(--brand-text-secondary)] mt-1">
                  เชื่อมโยงกับองค์กร ไม่สามารถแก้ไขได้
                </p>
              </div>

              {/* LINE ID */}
              <div>
                <label className="block text-sm font-medium text-[var(--brand-text)] mb-1.5">
                  <Hash className="w-4 h-4 inline mr-1.5 -mt-0.5" />
                  LINE ID
                  <span className="text-xs text-[var(--brand-text-secondary)] ml-1">(ไม่บังคับ)</span>
                </label>
                <Input
                  value={profile.lineId}
                  onChange={(e) => setProfile({ ...profile, lineId: e.target.value })}
                  placeholder="@line_id"
                />
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-medium text-[var(--brand-text)] mb-1.5">
                  <FileText className="w-4 h-4 inline mr-1.5 -mt-0.5" />
                  เกี่ยวกับตัวคุณ
                  <span className="text-xs text-[var(--brand-text-secondary)] ml-1">
                    ({profile.bio.length}/200)
                  </span>
                </label>
                <textarea
                  value={profile.bio}
                  onChange={(e) => {
                    if (e.target.value.length <= 200) {
                      setProfile({ ...profile, bio: e.target.value })
                    }
                  }}
                  maxLength={200}
                  rows={3}
                  placeholder="แนะนำตัวคุณสั้น ๆ ..."
                  className="w-full rounded-lg border border-[var(--brand-border)] bg-[var(--brand-surface)] px-3 py-2 text-sm text-[var(--brand-text)] placeholder:text-[var(--brand-text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] focus:border-transparent resize-none"
                />
              </div>

              {/* Save button */}
              <div className="flex justify-end pt-2">
                <Button onClick={handleSaveProfile} disabled={saving}>
                  {saving ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* ========== Section 3: Notification Preferences ========== */}
        <Card>
          <CardHeader>
            <SectionHeader
              title="การตั้งค่าแจ้งเตือน"
              subtitle="เลือกช่องทางที่ต้องการรับการแจ้งเตือน"
            />
          </CardHeader>
          <CardBody>
            <div className="divide-y divide-[var(--brand-border)]">
              <Toggle
                enabled={notifPrefs.emailNotifications}
                onChange={(v) => setNotifPrefs({ ...notifPrefs, emailNotifications: v })}
                label="แจ้งเตือนทางอีเมล"
                description="รับการแจ้งเตือนสำคัญทางอีเมล"
                icon={Mail}
              />
              <Toggle
                enabled={notifPrefs.pushNotifications}
                onChange={(v) => setNotifPrefs({ ...notifPrefs, pushNotifications: v })}
                label="แจ้งเตือนแบบ Push"
                description="รับ Push Notification บนเบราว์เซอร์"
                icon={BellRing}
              />
              <Toggle
                enabled={notifPrefs.lineNotifications}
                onChange={(v) => setNotifPrefs({ ...notifPrefs, lineNotifications: v })}
                label="แจ้งเตือนทาง LINE"
                description="รับการแจ้งเตือนผ่าน LINE Official"
                icon={MessageCircle}
              />
              <Toggle
                enabled={notifPrefs.weeklyDigest}
                onChange={(v) => setNotifPrefs({ ...notifPrefs, weeklyDigest: v })}
                label="สรุปรายสัปดาห์"
                description="รับรายงานสรุปประจำสัปดาห์ทุกวันจันทร์"
                icon={Newspaper}
              />
              <Toggle
                enabled={notifPrefs.marketingEmails}
                onChange={(v) => setNotifPrefs({ ...notifPrefs, marketingEmails: v })}
                label="อีเมลการตลาด"
                description="รับข่าวสาร โปรโมชัน และอัปเดตจากเรา"
                icon={Megaphone}
              />
            </div>
            <div className="flex justify-end pt-4">
              <Button onClick={handleSaveNotifications}>บันทึกการตั้งค่า</Button>
            </div>
          </CardBody>
        </Card>

        {/* ========== Section 4: Security ========== */}
        <Card>
          <CardHeader>
            <SectionHeader title="ความปลอดภัย" subtitle="จัดการรหัสผ่านและการยืนยันตัวตน" />
          </CardHeader>
          <CardBody>
            <div className="space-y-5">
              {/* Change password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Lock className="w-5 h-5 text-[var(--brand-text-secondary)]" />
                  <div>
                    <p className="text-sm font-medium text-[var(--brand-text)]">เปลี่ยนรหัสผ่าน</p>
                    <p className="text-xs text-[var(--brand-text-secondary)]">
                      แนะนำให้เปลี่ยนรหัสผ่านทุก 3 เดือน
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => setShowPasswordModal(true)}>
                  เปลี่ยนรหัสผ่าน
                </Button>
              </div>

              {/* 2FA */}
              <div className="border-t border-[var(--brand-border)] pt-5">
                <Toggle
                  enabled={twoFactorEnabled}
                  onChange={setTwoFactorEnabled}
                  label="ยืนยันตัวตนสองชั้น (2FA)"
                  description="เพิ่มความปลอดภัยด้วยรหัส OTP จากแอปยืนยันตัวตน"
                  icon={Smartphone}
                />
                {twoFactorEnabled && (
                  <div className="mt-3 ml-8 p-4 rounded-lg border border-dashed border-[var(--brand-border)] bg-[var(--brand-background)] flex flex-col items-center gap-3">
                    <div className="w-32 h-32 bg-[var(--brand-surface)] rounded-lg border border-[var(--brand-border)] flex items-center justify-center">
                      <QrCode className="w-16 h-16 text-[var(--brand-text-secondary)]" />
                    </div>
                    <p className="text-xs text-[var(--brand-text-secondary)] text-center">
                      สแกน QR Code ด้วยแอป Authenticator<br />
                      (Google Authenticator, Authy, ฯลฯ)
                    </p>
                  </div>
                )}
              </div>

              {/* Last login */}
              <div className="border-t border-[var(--brand-border)] pt-5">
                <p className="text-sm font-medium text-[var(--brand-text)] mb-3">
                  ข้อมูลการเข้าสู่ระบบล่าสุด
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-[var(--brand-text-secondary)]">
                    <MapPin className="w-4 h-4" />
                    <span>IP: {DEMO_LAST_LOGIN.ip}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[var(--brand-text-secondary)]">
                    <Monitor className="w-4 h-4" />
                    <span>อุปกรณ์: {DEMO_LAST_LOGIN.device}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[var(--brand-text-secondary)]">
                    <Clock className="w-4 h-4" />
                    <span>เวลา: {DEMO_LAST_LOGIN.time}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* ========== Section 5: Danger Zone ========== */}
        <Card>
          <div className="border-2 border-red-300 rounded-xl overflow-hidden">
            <CardHeader>
              <SectionHeader title="โซนอันตราย" subtitle="การดำเนินการเหล่านี้ไม่สามารถย้อนกลับได้" />
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                {/* Export data */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Download className="w-5 h-5 text-[var(--brand-text-secondary)]" />
                    <div>
                      <p className="text-sm font-medium text-[var(--brand-text)]">ส่งออกข้อมูลทั้งหมด</p>
                      <p className="text-xs text-[var(--brand-text-secondary)]">
                        ดาวน์โหลดข้อมูลทั้งหมดของคุณในรูปแบบ JSON
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleExportData} disabled={exporting}>
                    {exporting ? 'กำลังส่งออก...' : 'ส่งออกข้อมูล'}
                  </Button>
                </div>

                {/* Delete account */}
                <div className="border-t border-red-200 pt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Trash2 className="w-5 h-5 text-red-500" />
                      <div>
                        <p className="text-sm font-medium text-red-600">ลบบัญชี</p>
                        <p className="text-xs text-[var(--brand-text-secondary)]">
                          ลบบัญชีและข้อมูลทั้งหมดอย่างถาวร
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowDeleteModal(true)}
                      className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                    >
                      ลบบัญชี
                    </button>
                  </div>
                </div>
              </div>
            </CardBody>
          </div>
        </Card>
      </div>

      {/* ========== Change Password Modal ========== */}
      <Modal
        isOpen={showPasswordModal}
        onClose={() => {
          setShowPasswordModal(false)
          setPasswordForm({ current: '', newPassword: '', confirm: '' })
        }}
        title="เปลี่ยนรหัสผ่าน"
        size="sm"
      >
        <div className="space-y-4 p-4">
          {/* Current password */}
          <div>
            <label className="block text-sm font-medium text-[var(--brand-text)] mb-1.5">
              รหัสผ่านปัจจุบัน
            </label>
            <div className="relative">
              <Input
                type={showCurrentPw ? 'text' : 'password'}
                value={passwordForm.current}
                onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                placeholder="รหัสผ่านปัจจุบัน"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPw(!showCurrentPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--brand-text-secondary)] hover:text-[var(--brand-text)]"
              >
                {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          {/* New password */}
          <div>
            <label className="block text-sm font-medium text-[var(--brand-text)] mb-1.5">
              รหัสผ่านใหม่
            </label>
            <div className="relative">
              <Input
                type={showNewPw ? 'text' : 'password'}
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                placeholder="รหัสผ่านใหม่ (อย่างน้อย 8 ตัวอักษร)"
              />
              <button
                type="button"
                onClick={() => setShowNewPw(!showNewPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--brand-text-secondary)] hover:text-[var(--brand-text)]"
              >
                {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          {/* Confirm new password */}
          <div>
            <label className="block text-sm font-medium text-[var(--brand-text)] mb-1.5">
              ยืนยันรหัสผ่านใหม่
            </label>
            <Input
              type="password"
              value={passwordForm.confirm}
              onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
              placeholder="ยืนยันรหัสผ่านใหม่"
            />
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowPasswordModal(false)
                setPasswordForm({ current: '', newPassword: '', confirm: '' })
              }}
            >
              ยกเลิก
            </Button>
            <Button onClick={handleChangePassword} disabled={changingPassword}>
              {changingPassword ? 'กำลังเปลี่ยน...' : 'เปลี่ยนรหัสผ่าน'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* ========== Delete Account Modal ========== */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false)
          setDeleteConfirmText('')
        }}
        title="ยืนยันการลบบัญชี"
        size="sm"
      >
        <div className="space-y-4 p-4">
          <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-700">
              การดำเนินการนี้ไม่สามารถย้อนกลับได้ ข้อมูลทั้งหมดของคุณจะถูกลบอย่างถาวร
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--brand-text)] mb-1.5">
              พิมพ์ <span className="font-bold text-red-600">DELETE</span> เพื่อยืนยัน
            </label>
            <Input
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="DELETE"
            />
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteModal(false)
                setDeleteConfirmText('')
              }}
            >
              ยกเลิก
            </Button>
            <button
              onClick={handleDeleteAccount}
              disabled={deleteConfirmText !== 'DELETE' || deleting}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
            >
              {deleting ? 'กำลังลบ...' : 'ลบบัญชีถาวร'}
            </button>
          </div>
        </div>
      </Modal>
    </AppLayout>
  )
}
