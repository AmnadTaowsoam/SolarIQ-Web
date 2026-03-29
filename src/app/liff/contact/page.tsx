'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'

interface ContactFormData {
  phone: string
  email: string
  display_name: string
  address: string
  province: string
  district: string
}

interface ContactData extends ContactFormData {
  id: string
  line_user_id: string
  quality_score: number | null
  quality_tier: string | null
  created_at: string
  updated_at: string
}

const THAI_PROVINCES = [
  'กรุงเทพมหานคร',
  'เชียงใหม่',
  'เชียงราย',
  'ขอนแก่น',
  'นครราชสีมา',
  'นครศรีธรรมราช',
  'ภูเก็ต',
  'สงขลา',
  'ชลบุรี',
  'ระยอง',
  'พระนครศรีอยุธยา',
  'สุโขทัย',
  'พิษณุโลก',
  'อุดรธานี',
  'อุบลราชธานี',
  'สุราษฎร์ธานี',
  'นครสวรรค์',
  'สมุทรปราการ',
  'ปทุมธานี',
  'อื่นๆ',
]

export default function ContactPage(): React.ReactElement {
  const t = useTranslations('contactPage')
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [existingContact, setExistingContact] = useState<ContactData | null>(null)

  const [formData, setFormData] = useState<ContactFormData>({
    phone: '',
    email: '',
    display_name: '',
    address: '',
    province: '',
    district: '',
  })

  const [formErrors, setFormErrors] = useState<Partial<ContactFormData>>({})

  const validateThaiPhone = (phone: string): boolean => {
    const phoneRegex = /^0[689]\d{8}$/
    return phoneRegex.test(phone.replace(/[-\s]/g, ''))
  }

  const validateEmail = (email: string): boolean => {
    if (!email) {
      return true
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validateForm = (): boolean => {
    const errors: Partial<ContactFormData> = {}

    if (!formData.phone) {
      errors.phone = t('form.phoneRequired')
    } else if (!validateThaiPhone(formData.phone)) {
      errors.phone = t('form.phoneInvalid')
    }

    if (formData.email && !validateEmail(formData.email)) {
      errors.email = t('form.emailInvalid')
    }

    if (!formData.display_name) {
      errors.display_name = t('form.nameRequired')
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const fetchExistingContact = useCallback(async () => {
    try {
      const lineUserId = localStorage.getItem('line_user_id')
      if (!lineUserId) {
        router.push('/liff/login')
        return
      }

      const response = await fetch(`/api/liff/contact/${lineUserId}`)
      if (response.ok) {
        const data: ContactData = await response.json()
        setExistingContact(data)
        setFormData({
          phone: data.phone || '',
          email: data.email || '',
          display_name: data.display_name || '',
          address: data.address || '',
          province: data.province || '',
          district: data.district || '',
        })
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Error fetching contact:', err)
    } finally {
      setIsLoading(false)
    }
  }, [router])

  useEffect(() => {
    fetchExistingContact()
  }, [fetchExistingContact])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    if (formErrors[name as keyof ContactFormData]) {
      setFormErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const lineUserId = localStorage.getItem('line_user_id')
      if (!lineUserId) {
        router.push('/liff/login')
        return
      }

      const url = existingContact ? `/api/liff/contact/${lineUserId}` : '/api/liff/contact'
      const method = existingContact ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          line_user_id: lineUserId,
          ...formData,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || t('form.saveError'))
      }

      setSuccess(true)

      setTimeout(() => {
        router.push('/liff/consent')
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : t('form.saving'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatPhoneNumber = (value: string): string => {
    const numbers = value.replace(/\D/g, '')
    if (numbers.length <= 3) {
      return numbers
    }
    if (numbers.length <= 6) {
      return `${numbers.slice(0, 3)}-${numbers.slice(3)}`
    }
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 6)}-${numbers.slice(6, 10)}`
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value)
    setFormData((prev) => ({ ...prev, phone: formatted }))
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--brand-background)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-[var(--brand-text-secondary)]">{t('loading')}</p>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[var(--brand-background)] flex items-center justify-center">
        <div className="text-center p-6">
          <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="mt-4 text-xl font-semibold text-[var(--brand-text)]">
            {t('success.title')}
          </h2>
          <p className="mt-2 text-[var(--brand-text-secondary)]">{t('success.redirecting')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--brand-background)]">
      <header className="bg-green-600 text-white p-4 shadow-md">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">{t('title')}</h1>
        </div>
      </header>

      <main className="p-4 max-w-lg mx-auto">
        <div className="bg-[var(--brand-surface)] rounded-xl shadow-sm p-6 mb-4">
          <p className="text-[var(--brand-text-secondary)] mb-6">{t('description')}</p>

          {error && (
            <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--brand-text)] mb-1">
                {t('form.name')} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="display_name"
                value={formData.display_name}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  formErrors.display_name ? 'border-red-500' : 'border-[var(--brand-border)]'
                }`}
                placeholder={t('form.name')}
              />
              {formErrors.display_name && (
                <p className="mt-1 text-sm text-red-500">{formErrors.display_name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--brand-text)] mb-1">
                {t('form.phone')} <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handlePhoneChange}
                maxLength={12}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  formErrors.phone ? 'border-red-500' : 'border-[var(--brand-border)]'
                }`}
                placeholder="0xx-xxx-xxxx"
              />
              {formErrors.phone && <p className="mt-1 text-sm text-red-500">{formErrors.phone}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--brand-text)] mb-1">
                {t('form.email')}
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  formErrors.email ? 'border-red-500' : 'border-[var(--brand-border)]'
                }`}
                placeholder="email@example.com"
              />
              {formErrors.email && <p className="mt-1 text-sm text-red-500">{formErrors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--brand-text)] mb-1">
                {t('form.address')}
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-[var(--brand-border)] rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder={t('form.addressPlaceholder')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--brand-text)] mb-1">
                {t('form.province')}
              </label>
              <select
                name="province"
                value={formData.province}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-[var(--brand-border)] rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">{t('form.selectProvince')}</option>
                {THAI_PROVINCES.map((province) => (
                  <option key={province} value={province}>
                    {province}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--brand-text)] mb-1">
                {t('form.district')}
              </label>
              <input
                type="text"
                name="district"
                value={formData.district}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-[var(--brand-border)] rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder={t('form.districtPlaceholder')}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  {t('form.saving')}
                </span>
              ) : existingContact ? (
                t('form.update')
              ) : (
                t('form.save')
              )}
            </button>
          </form>
        </div>

        <p className="text-xs text-[var(--brand-text-secondary)] text-center">{t('pdpaNotice')}</p>
      </main>
    </div>
  )
}
