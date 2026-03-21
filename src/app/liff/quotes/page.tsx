'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  BudgetRange,
  Timeline,
  FinancingPreference,
  BUDGET_RANGE_LABELS,
  TIMELINE_LABELS,
  FINANCING_LABELS,
  QuoteRequestFormData,
} from '@/types/quotes'
import { useSubmitQuoteRequest } from '@/hooks/useQuotes'

const BUDGET_OPTIONS: BudgetRange[] = ['under_200k', '200k_400k', '400k_600k', 'over_600k', 'flexible']
const TIMELINE_OPTIONS: Timeline[] = ['urgent_1month', 'normal_3months', 'flexible', 'just_exploring']
const FINANCING_OPTIONS: FinancingPreference[] = ['cash', 'installment', 'leasing', 'undecided']

export default function QuoteRequestPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const leadId = searchParams.get('leadId') || 'demo-lead'
  const systemSizeKw = searchParams.get('sizeKw') ? parseFloat(searchParams.get('sizeKw')!) : undefined

  const { submit, isLoading } = useSubmitQuoteRequest()

  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState<Partial<QuoteRequestFormData>>({
    leadId,
    preferredSystemSizeKw: systemSizeKw,
    maxQuotes: 3,
    contactPreference: 'line',
    financingPreference: 'undecided',
  })
  const [error, setError] = useState('')

  const update = (field: keyof QuoteRequestFormData, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const canProceed = () => {
    if (step === 1) return !!formData.budgetRange
    if (step === 2) return !!formData.preferredTimeline
    if (step === 3) return !!formData.financingPreference
    return true
  }

  const handleSubmit = async () => {
    setError('')
    if (!formData.budgetRange || !formData.preferredTimeline || !formData.financingPreference) {
      setError('กรุณากรอกข้อมูลให้ครบถ้วน')
      return
    }
    try {
      const result = await submit(formData as QuoteRequestFormData)
      router.push(`/liff/quotes/request/${result.id}`)
    } catch {
      setError('ไม่สามารถส่งคำขอได้ กรุณาลองใหม่')
    }
  }

  const totalSteps = 4

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-orange-500 text-white px-4 py-5 safe-top">
        <div className="flex items-center gap-3 mb-3">
          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              className="w-8 h-8 flex items-center justify-center"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          <div className="flex-1">
            <h1 className="text-lg font-bold">ขอใบเสนอราคา</h1>
            <p className="text-orange-100 text-sm">ขั้นตอน {step}/{totalSteps}</p>
          </div>
        </div>
        {/* Progress bar */}
        <div className="h-1.5 bg-orange-400 rounded-full overflow-hidden">
          <div
            className="h-full bg-white rounded-full transition-all duration-300"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      <div className="px-4 py-6 space-y-4 max-w-lg mx-auto">
        {/* Step 1: Budget */}
        {step === 1 && (
          <>
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">งบประมาณของคุณ</h2>
              <p className="text-gray-500 text-sm">เลือกงบประมาณที่ตรงกับความต้องการ</p>
            </div>
            <div className="space-y-3">
              {BUDGET_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  onClick={() => update('budgetRange', opt)}
                  className={`w-full p-4 rounded-2xl border-2 text-left transition-all ${
                    formData.budgetRange === opt
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 bg-white hover:border-orange-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`font-medium ${formData.budgetRange === opt ? 'text-orange-700' : 'text-gray-800'}`}>
                      {BUDGET_RANGE_LABELS[opt]}
                    </span>
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        formData.budgetRange === opt
                          ? 'border-orange-500 bg-orange-500'
                          : 'border-gray-300'
                      }`}
                    >
                      {formData.budgetRange === opt && (
                        <div className="w-2 h-2 bg-white rounded-full" />
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}

        {/* Step 2: Timeline */}
        {step === 2 && (
          <>
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">ต้องการเร็วแค่ไหน?</h2>
              <p className="text-gray-500 text-sm">เลือกระยะเวลาที่ต้องการติดตั้ง</p>
            </div>
            <div className="space-y-3">
              {TIMELINE_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  onClick={() => update('preferredTimeline', opt)}
                  className={`w-full p-4 rounded-2xl border-2 text-left transition-all ${
                    formData.preferredTimeline === opt
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 bg-white hover:border-orange-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className={`font-medium block ${formData.preferredTimeline === opt ? 'text-orange-700' : 'text-gray-800'}`}>
                        {TIMELINE_LABELS[opt].split('(')[0].trim()}
                      </span>
                      {TIMELINE_LABELS[opt].includes('(') && (
                        <span className="text-xs text-gray-500">
                          {TIMELINE_LABELS[opt].match(/\(([^)]+)\)/)?.[1]}
                        </span>
                      )}
                    </div>
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        formData.preferredTimeline === opt
                          ? 'border-orange-500 bg-orange-500'
                          : 'border-gray-300'
                      }`}
                    >
                      {formData.preferredTimeline === opt && (
                        <div className="w-2 h-2 bg-white rounded-full" />
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}

        {/* Step 3: Financing */}
        {step === 3 && (
          <>
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">การชำระเงิน</h2>
              <p className="text-gray-500 text-sm">เลือกรูปแบบการชำระเงินที่ต้องการ</p>
            </div>
            <div className="space-y-3">
              {FINANCING_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  onClick={() => update('financingPreference', opt)}
                  className={`w-full p-4 rounded-2xl border-2 text-left transition-all ${
                    formData.financingPreference === opt
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 bg-white hover:border-orange-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`font-medium ${formData.financingPreference === opt ? 'text-orange-700' : 'text-gray-800'}`}>
                      {FINANCING_LABELS[opt]}
                    </span>
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        formData.financingPreference === opt
                          ? 'border-orange-500 bg-orange-500'
                          : 'border-gray-300'
                      }`}
                    >
                      {formData.financingPreference === opt && (
                        <div className="w-2 h-2 bg-white rounded-full" />
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}

        {/* Step 4: Additional details */}
        {step === 4 && (
          <>
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">ข้อมูลเพิ่มเติม</h2>
              <p className="text-gray-500 text-sm">กรอกข้อมูลเพิ่มเติมเพื่อรับใบเสนอราคาที่ตรงกับความต้องการ</p>
            </div>

            {/* Max quotes slider */}
            <div className="bg-white rounded-2xl p-4 border border-gray-200">
              <label className="block font-medium text-gray-800 mb-3">
                จำนวนใบเสนอราคาที่ต้องการ:{' '}
                <span className="text-orange-600">{formData.maxQuotes} ราย</span>
              </label>
              <input
                type="range"
                min={3}
                max={5}
                step={1}
                value={formData.maxQuotes || 3}
                onChange={(e) => update('maxQuotes', parseInt(e.target.value))}
                className="w-full accent-orange-500"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>3 ราย</span>
                <span>4 ราย</span>
                <span>5 ราย</span>
              </div>
            </div>

            {/* Contact preference */}
            <div className="bg-white rounded-2xl p-4 border border-gray-200">
              <label className="block font-medium text-gray-800 mb-3">ช่องทางติดต่อที่ต้องการ</label>
              <div className="flex gap-3">
                {[
                  { value: 'line', label: 'LINE' },
                  { value: 'phone', label: 'โทรศัพท์' },
                  { value: 'email', label: 'อีเมล' },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => update('contactPreference', opt.value)}
                    className={`flex-1 py-2 rounded-xl border-2 text-sm font-medium transition-all ${
                      formData.contactPreference === opt.value
                        ? 'border-orange-500 bg-orange-50 text-orange-700'
                        : 'border-gray-200 text-gray-600'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Additional requirements */}
            <div className="bg-white rounded-2xl p-4 border border-gray-200">
              <label className="block font-medium text-gray-800 mb-2">
                ความต้องการพิเศษ{' '}
                <span className="text-gray-400 font-normal text-sm">(ไม่บังคับ)</span>
              </label>
              <textarea
                value={formData.additionalRequirements || ''}
                onChange={(e) => update('additionalRequirements', e.target.value.slice(0, 500))}
                rows={4}
                placeholder="เช่น ต้องการแผง Tier 1, อยากได้ระบบ hybrid, มีพื้นที่หลังคา 80 ตร.ม..."
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
              />
              <p className="text-xs text-gray-400 text-right mt-1">
                {formData.additionalRequirements?.length || 0}/500
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">
                {error}
              </div>
            )}
          </>
        )}
      </div>

      {/* Fixed bottom button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-4 safe-bottom">
        <div className="max-w-lg mx-auto">
          {step < totalSteps ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={!canProceed()}
              className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl font-bold text-base transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              ถัดไป
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl font-bold text-base transition-colors disabled:opacity-50"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  กำลังส่งคำขอ...
                </span>
              ) : (
                'ส่งคำขอใบเสนอราคา'
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
