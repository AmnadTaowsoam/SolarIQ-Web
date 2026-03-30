'use client'

import { useState } from 'react'
import Link from 'next/link'
import { FileText, ArrowLeft, CheckCircle, AlertCircle, Mail, Shield } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */
enum DSRRequestType {
  ACCESS = 'access',
  CORRECTION = 'correction',
  DELETION = 'deletion',
  PORTABILITY = 'portability',
  OBJECTION = 'objection',
}

interface DSRFormData {
  requestType: DSRRequestType
  email: string
  description: string
  additionalInfo?: string
}

/* ------------------------------------------------------------------ */
/*  Constants                                                           */
/* ------------------------------------------------------------------ */
const REQUEST_TYPES = [
  {
    value: DSRRequestType.ACCESS,
    label: 'ขอเข้าถึงข้อมูล (Access)',
    description: 'ขอให้แจ้งว่ามีข้อมูลส่วนบุคคลของคุณอะไรบ้าง',
    icon: FileText,
  },
  {
    value: DSRRequestType.CORRECTION,
    label: 'ขอแก้ไขข้อมูล (Correction)',
    description: 'ขอให้แก้ไขข้อมูลส่วนบุคคลที่ไม่ถูกต้อง',
    icon: Shield,
  },
  {
    value: DSRRequestType.DELETION,
    label: 'ขอลบข้อมูล (Deletion)',
    description: 'ขอให้ลบข้อมูลส่วนบุคคลของคุณ',
    icon: AlertCircle,
  },
  {
    value: DSRRequestType.PORTABILITY,
    label: 'ขอส่งออกข้อมูล (Portability)',
    description: 'ขอให้ส่งข้อมูลส่วนบุคคลในรูปแบบที่อ่านได้',
    icon: FileText,
  },
  {
    value: DSRRequestType.OBJECTION,
    label: 'ขอคัดค้านการประมวลผล (Objection)',
    description: 'คัดค้านการประมวลผลข้อมูลในบางกรณี',
    icon: AlertCircle,
  },
]

// STATUS_LABELS, STATUS_COLORS, STATUS_ICONS reserved for future DSR status display
// (removed to fix unused-variable TS errors)

/* ------------------------------------------------------------------ */
/*  Component                                                           */
/* ------------------------------------------------------------------ */
export default function DSRRequestPage() {
  const [step, setStep] = useState<'select' | 'form' | 'success'>('select')
  const [formData, setFormData] = useState<DSRFormData>({
    requestType: DSRRequestType.ACCESS,
    email: '',
    description: '',
    additionalInfo: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSelectRequestType = (requestType: DSRRequestType) => {
    setFormData((prev) => ({ ...prev, requestType }))
    setStep('form')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      // Validate email
      if (!formData.email || !formData.email.includes('@')) {
        throw new Error('กรุณากรอกอีเมลที่ถูกต้อง')
      }

      if (!formData.description || formData.description.length < 10) {
        throw new Error('กรุณากรอกรายละเอียดคำขออย่างน้อย 10 ตัวอักษร')
      }

      // Simulate API call - Replace with actual API call
      // const response = await fetch('/api/v1/privacy/dsr', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData),
      // })

      // Simulate delay
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Success
      setStep('success')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleBack = () => {
    if (step === 'form') {
      setStep('select')
    }
  }

  const handleNewRequest = () => {
    setFormData({
      requestType: DSRRequestType.ACCESS,
      email: '',
      description: '',
      additionalInfo: '',
    })
    setStep('select')
    setError(null)
  }

  return (
    <div className="min-h-screen bg-[var(--brand-background)] dark:bg-gray-900">
      {/* Header */}
      <div className="bg-[var(--brand-surface)] dark:bg-gray-800 border-b border-[var(--brand-border)] dark:border-gray-700">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <Link
              href="/pdpa"
              className="p-2 hover:bg-[var(--brand-primary-light)] dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-[var(--brand-text-secondary)] dark:text-[var(--brand-text-secondary)]" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-[var(--brand-text)] dark:text-white">
                Data Subject Request Portal
              </h1>
              <p className="text-sm text-[var(--brand-text-secondary)] dark:text-[var(--brand-text-secondary)]">
                จัดการสิทธิของคุณตาม PDPA
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Step 1: Select Request Type */}
        {step === 'select' && (
          <div className="space-y-6">
            <div className="bg-blue-500/10 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div>
                  <p className="text-sm text-blue-900 dark:text-blue-100">
                    <strong>ข้อมูลสำคัญ:</strong> เราจะดำเนินการตามคำขอของคุณภายใน 30 วัน
                    ตามที่กฎหมาย PDPA กำหนด คุณจะได้รับอีเมลยืนยันหลังจากส่งคำขอ
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-[var(--brand-text)] dark:text-white mb-4">
                เลือกประเภทคำขอ
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {REQUEST_TYPES.map((type) => {
                  const Icon = type.icon
                  return (
                    <Card
                      key={type.value}
                      className="p-5 cursor-pointer hover:border-primary-500 hover:shadow-md transition-all"
                      onClick={() => handleSelectRequestType(type.value as DSRRequestType)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0">
                          <Icon className="h-6 w-6 text-primary-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-[var(--brand-text)] dark:text-white mb-1">
                            {type.label}
                          </h3>
                          <p className="text-sm text-[var(--brand-text-secondary)] dark:text-[var(--brand-text-secondary)]">
                            {type.description}
                          </p>
                        </div>
                      </div>
                    </Card>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Request Form */}
        {step === 'form' && (
          <Card className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Request Type Display */}
              <div className="bg-[var(--brand-background)] dark:bg-gray-800 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    {(() => {
                      const type = REQUEST_TYPES.find((t) => t.value === formData.requestType)
                      const Icon = type?.icon || FileText
                      return <Icon className="h-6 w-6 text-primary-600" />
                    })()}
                  </div>
                  <div>
                    <p className="text-sm text-[var(--brand-text-secondary)] dark:text-[var(--brand-text-secondary)]">
                      ประเภทคำขอ:
                    </p>
                    <p className="font-semibold text-[var(--brand-text)] dark:text-white">
                      {REQUEST_TYPES.find((t) => t.value === formData.requestType)?.label}
                    </p>
                  </div>
                </div>
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-[var(--brand-text)] dark:text-[var(--brand-text-secondary)] mb-2"
                >
                  อีเมล <span className="text-red-500">*</span>
                </label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="your@email.com"
                  required
                  className="w-full"
                />
                <p className="mt-1 text-xs text-[var(--brand-text-secondary)] dark:text-[var(--brand-text-secondary)]">
                  เราจะส่งรหัสยืนยันไปยังอีเมลนี้เพื่อยืนยันตัวตน
                </p>
              </div>

              {/* Description */}
              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-[var(--brand-text)] dark:text-[var(--brand-text-secondary)] mb-2"
                >
                  รายละเอียดคำขอ <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="อธิบายรายละเอียดเกี่ยวกับคำขอของคุณ..."
                  required
                  rows={5}
                  className="w-full rounded-lg border border-[var(--brand-border)] dark:border-gray-600 bg-[var(--brand-surface)] dark:bg-gray-800 px-3 py-2 text-[var(--brand-text)] dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <p className="mt-1 text-xs text-[var(--brand-text-secondary)] dark:text-[var(--brand-text-secondary)]">
                  อย่างน้อย 10 ตัวอักษร
                </p>
              </div>

              {/* Additional Info */}
              <div>
                <label
                  htmlFor="additionalInfo"
                  className="block text-sm font-medium text-[var(--brand-text)] dark:text-[var(--brand-text-secondary)] mb-2"
                >
                  ข้อมูลเพิ่มเติม (ไม่บังคับ)
                </label>
                <textarea
                  id="additionalInfo"
                  value={formData.additionalInfo}
                  onChange={(e) => setFormData({ ...formData, additionalInfo: e.target.value })}
                  placeholder="ข้อมูลเพิ่มเติมที่อาจช่วยในการดำเนินการ..."
                  rows={3}
                  className="w-full rounded-lg border border-[var(--brand-border)] dark:border-gray-600 bg-[var(--brand-surface)] dark:bg-gray-800 px-3 py-2 text-[var(--brand-text)] dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-500/10 dark:bg-red-900/20 border border-red-500/20 dark:border-red-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
                    <p className="text-sm text-red-900 dark:text-red-100">{error}</p>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  disabled={isSubmitting}
                >
                  ย้อนกลับ
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'กำลังส่ง...' : 'ส่งคำขอ'}
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Step 3: Success */}
        {step === 'success' && (
          <Card className="p-8 text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10 dark:bg-green-900/30">
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-[var(--brand-text)] dark:text-white mb-2">
              ส่งคำขอสำเร็จ!
            </h2>
            <p className="text-[var(--brand-text-secondary)] dark:text-[var(--brand-text-secondary)] mb-6">
              เราได้รับคำขอของคุณแล้ว และจะดำเนินการภายใน 30 วัน คุณจะได้รับอีเมลยืนยันที่{' '}
              {formData.email}
            </p>

            <div className="bg-[var(--brand-background)] dark:bg-gray-800 rounded-lg p-6 mb-6 text-left">
              <h3 className="font-semibold text-[var(--brand-text)] dark:text-white mb-4">
                ขั้นตอนถัดไป
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 flex h-6 w-6 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900/30 text-xs font-semibold text-primary-600 dark:text-primary-400">
                    1
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[var(--brand-text)] dark:text-white">
                      ตรวจสอบอีเมลของคุณ
                    </p>
                    <p className="text-sm text-[var(--brand-text-secondary)] dark:text-[var(--brand-text-secondary)]">
                      เราจะส่งอีเมลยืนยันพร้อมรหัสติดตามคำขอ
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 flex h-6 w-6 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900/30 text-xs font-semibold text-primary-600 dark:text-primary-400">
                    2
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[var(--brand-text)] dark:text-white">
                      รอการตรวจสอบจากทีมงาน
                    </p>
                    <p className="text-sm text-[var(--brand-text-secondary)] dark:text-[var(--brand-text-secondary)]">
                      เราจะตรวจสอบคำขอของคุณและดำเนินการตามที่กฎหมายกำหนด
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 flex h-6 w-6 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900/30 text-xs font-semibold text-primary-600 dark:text-primary-400">
                    3
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[var(--brand-text)] dark:text-white">
                      รับผลลัพธ์
                    </p>
                    <p className="text-sm text-[var(--brand-text-secondary)] dark:text-[var(--brand-text-secondary)]">
                      เราจะแจ้งผลลัพธ์ให้คุณทราบทางอีเมล
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/pdpa">
                <Button variant="outline">กลับไปหน้า PDPA</Button>
              </Link>
              <Button onClick={handleNewRequest}>ส่งคำขอใหม่</Button>
            </div>
          </Card>
        )}

        {/* Contact Info */}
        <div className="mt-8 text-center">
          <p className="text-sm text-[var(--brand-text-secondary)] dark:text-[var(--brand-text-secondary)] mb-2">
            มีคำถามเพิ่มเติม?
          </p>
          <Link
            href="mailto:dpo@solariqapp.com"
            className="inline-flex items-center gap-2 text-sm text-primary-600 dark:text-primary-400 hover:underline"
          >
            <Mail className="h-4 w-4" />
            ติดต่อ DPO ของเรา
          </Link>
        </div>
      </div>
    </div>
  )
}
