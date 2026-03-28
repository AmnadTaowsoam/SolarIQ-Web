'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import {
  SystemSpecification,
  PricingBreakdown,
  InstallationTimeline,
  WarrantyTerms,
  FinancingOptions,
  AdditionalService,
  PanelType,
  InverterType,
  MountingType,
  MonitoringStatus,
} from '@/types/quotes'
import { PricingCalculator } from './PricingCalculator'

interface QuoteBuilderProps {
  requestId: string
  systemSizeKw?: number
  locationDisplay?: string
  onSaveDraft: (data: QuoteBuilderData) => void
  onSubmit: (data: QuoteBuilderData) => void
  onPreview: (data: QuoteBuilderData) => void
  isSubmitting?: boolean
  isSaving?: boolean
  initialData?: Partial<QuoteBuilderData>
}

export interface QuoteBuilderData {
  specifications: SystemSpecification
  pricing: PricingBreakdown
  timeline: InstallationTimeline
  warranty: WarrantyTerms
  financing: FinancingOptions
  additionalServices: AdditionalService[]
  notes: string
  validDays: number
}

const DEFAULT_SPEC: SystemSpecification = {
  panelBrand: '',
  panelModel: '',
  panelWattage: 545,
  panelCount: 10,
  panelType: 'monocrystalline',
  totalPanelKw: 5.45,
  inverterBrand: '',
  inverterModel: '',
  inverterCapacityKw: 5,
  inverterType: 'string',
  inverterCount: 1,
  mountingType: 'roof_rail',
  monitoringSystem: 'included',
  estimatedMonthlyKwh: 0,
  estimatedMonthlySavingsThb: 0,
  estimatedPaybackYears: 0,
}

const DEFAULT_PRICING: PricingBreakdown = {
  equipmentCost: 0,
  panelCost: 0,
  inverterCost: 0,
  mountingCost: 0,
  cableAndAccessories: 0,
  installationCost: 0,
  laborCost: 0,
  permitCost: 5000,
  discountAmount: 0,
  subtotal: 0,
  vatRate: 7,
  vatAmount: 0,
  totalPrice: 0,
  pricePerKw: 0,
}

const DEFAULT_TIMELINE: InstallationTimeline = {
  installationStartDate: '',
  installationEndDate: '',
  estimatedTotalDays: 0,
}

const DEFAULT_WARRANTY: WarrantyTerms = {
  panelPerformanceYears: 25,
  panelProductYears: 12,
  inverterYears: 10,
  installationYears: 5,
}

const DEFAULT_FINANCING: FinancingOptions = {
  cashDiscountPct: 3,
  installmentAvailable: true,
  installmentMonths: [12, 24, 36],
  installmentInterestRate: 0,
  leasingAvailable: false,
  financingPartners: [],
}

export function QuoteBuilder({
  requestId: _requestId,
  systemSizeKw = 5,
  locationDisplay: _locationDisplay,
  onSaveDraft,
  onSubmit,
  onPreview,
  isSubmitting,
  isSaving,
  initialData,
}: QuoteBuilderProps) {
  const t = useTranslations('quoteBuilder')
  const [activeSection, setActiveSection] = useState(1)
  const [specifications, setSpecifications] = useState<SystemSpecification>(
    initialData?.specifications || { ...DEFAULT_SPEC, totalPanelKw: systemSizeKw }
  )
  const [pricing, setPricing] = useState<PricingBreakdown>(initialData?.pricing || DEFAULT_PRICING)
  const [timeline, setTimeline] = useState<InstallationTimeline>(
    initialData?.timeline || DEFAULT_TIMELINE
  )
  const [warranty, setWarranty] = useState<WarrantyTerms>(initialData?.warranty || DEFAULT_WARRANTY)
  const [financing, setFinancing] = useState<FinancingOptions>(
    initialData?.financing || DEFAULT_FINANCING
  )
  const [additionalServices, setAdditionalServices] = useState<AdditionalService[]>(
    initialData?.additionalServices || [
      { name: 'ระบบ Monitoring', description: 'แอปติดตามการผลิตไฟฟ้า', price: 0, included: true },
      {
        name: 'สัญญาบำรุงรักษา 2 ปี',
        description: 'ตรวจสอบระบบ 2 ครั้ง/ปี',
        price: 8000,
        included: false,
      },
      {
        name: 'ประกันภัยโซลาร์',
        description: 'คุ้มครองความเสียหายจากภัยธรรมชาติ',
        price: 3500,
        included: false,
      },
    ]
  )
  const [notes, setNotes] = useState(initialData?.notes || '')
  const [validDays, setValidDays] = useState(initialData?.validDays || 30)

  const getData = (): QuoteBuilderData => ({
    specifications,
    pricing,
    timeline,
    warranty,
    financing,
    additionalServices,
    notes,
    validDays,
  })

  // Auto-calculate totalPanelKw
  const updatePanelCount = (count: number) => {
    const totalKw = (specifications.panelWattage * count) / 1000
    setSpecifications((prev) => ({
      ...prev,
      panelCount: count,
      totalPanelKw: parseFloat(totalKw.toFixed(2)),
    }))
  }

  const updatePanelWattage = (wattage: number) => {
    const totalKw = (wattage * specifications.panelCount) / 1000
    setSpecifications((prev) => ({
      ...prev,
      panelWattage: wattage,
      totalPanelKw: parseFloat(totalKw.toFixed(2)),
    }))
  }

  const toggleInstallmentMonth = (month: number) => {
    const months = financing.installmentMonths || []
    const updated = months.includes(month)
      ? months.filter((m) => m !== month)
      : [...months, month].sort((a, b) => a - b)
    setFinancing((prev) => ({ ...prev, installmentMonths: updated }))
  }

  const sections = [
    { id: 1, label: `1. ${t('step1')}` },
    { id: 2, label: `2. ${t('step2')}` },
    { id: 3, label: `3. ${t('step3')}` },
    { id: 4, label: `4. ${t('step4')}` },
    { id: 5, label: `5. ${t('paymentTerms')}` },
    { id: 6, label: `6. ${t('notes')}` },
  ]

  return (
    <div className="space-y-4">
      {/* Section navigation */}
      <div className="flex overflow-x-auto gap-2 pb-1">
        {sections.map((s) => (
          <button
            key={s.id}
            onClick={() => setActiveSection(s.id)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeSection === s.id
                ? 'bg-orange-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Section 1: System Specification */}
      {activeSection === 1 && (
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-800">{t('systemSize')}</h3>

          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('panelBrand')} *
              </label>
              <input
                type="text"
                placeholder="เช่น JA Solar, LONGi, Canadian Solar"
                value={specifications.panelBrand}
                onChange={(e) => setSpecifications((p) => ({ ...p, panelBrand: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('panelModel')} *
              </label>
              <input
                type="text"
                placeholder="เช่น JAM72S30-545/MR"
                value={specifications.panelModel}
                onChange={(e) => setSpecifications((p) => ({ ...p, panelModel: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('installationType')}
              </label>
              <select
                value={specifications.panelType}
                onChange={(e) =>
                  setSpecifications((p) => ({ ...p, panelType: e.target.value as PanelType }))
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="monocrystalline">Monocrystalline</option>
                <option value="polycrystalline">Polycrystalline</option>
                <option value="bifacial">Bifacial</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('panelCount')} (W) *
              </label>
              <input
                type="number"
                value={specifications.panelWattage}
                onChange={(e) => updatePanelWattage(parseInt(e.target.value) || 0)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('panelCount')} *
              </label>
              <input
                type="number"
                value={specifications.panelCount}
                onChange={(e) => updatePanelCount(parseInt(e.target.value) || 0)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          <div className="bg-orange-50 rounded-lg px-4 py-3 text-sm">
            <span className="text-gray-600">{t('systemSize')}: </span>
            <span className="font-bold text-orange-600 text-base">
              {specifications.totalPanelKw} kW
            </span>
          </div>

          {/* Inverter */}
          <h4 className="font-medium text-gray-700 mt-4">{t('inverterBrand')}</h4>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('inverterBrand')} *
              </label>
              <input
                type="text"
                placeholder="เช่น Huawei, Growatt, SMA"
                value={specifications.inverterBrand}
                onChange={(e) =>
                  setSpecifications((p) => ({ ...p, inverterBrand: e.target.value }))
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('inverterModel')} *
              </label>
              <input
                type="text"
                placeholder="เช่น SUN2000-5KTL-M1"
                value={specifications.inverterModel}
                onChange={(e) =>
                  setSpecifications((p) => ({ ...p, inverterModel: e.target.value }))
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('systemSize')} (kW)
              </label>
              <input
                type="number"
                value={specifications.inverterCapacityKw}
                onChange={(e) =>
                  setSpecifications((p) => ({
                    ...p,
                    inverterCapacityKw: parseFloat(e.target.value) || 0,
                  }))
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('installationType')}
              </label>
              <select
                value={specifications.inverterType}
                onChange={(e) =>
                  setSpecifications((p) => ({ ...p, inverterType: e.target.value as InverterType }))
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="string">String Inverter</option>
                <option value="micro">Micro Inverter</option>
                <option value="hybrid">Hybrid Inverter</option>
              </select>
            </div>
          </div>

          {/* Mounting */}
          <h4 className="font-medium text-gray-700 mt-4">{t('mounting')}</h4>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('roofType')}
              </label>
              <select
                value={specifications.mountingType}
                onChange={(e) =>
                  setSpecifications((p) => ({ ...p, mountingType: e.target.value as MountingType }))
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="roof_rail">{t('roofSloped')} (Rail)</option>
                <option value="ballast">Ballast ({t('roofFlat')})</option>
                <option value="ground">{t('roofConcrete')}</option>
                <option value="carport">Carport</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('mounting')}
              </label>
              <select
                value={specifications.monitoringSystem}
                onChange={(e) =>
                  setSpecifications((p) => ({
                    ...p,
                    monitoringSystem: e.target.value as MonitoringStatus,
                  }))
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="included">{t('addItem')}</option>
                <option value="optional">{t('addCustomItem')}</option>
                <option value="none">{t('removeItem')}</option>
              </select>
            </div>
          </div>

          {/* Performance */}
          <h4 className="font-medium text-gray-700 mt-4">{t('estimatedSavings')}</h4>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('estimatedSavings')} (kWh)
              </label>
              <input
                type="number"
                value={specifications.estimatedMonthlyKwh}
                onChange={(e) =>
                  setSpecifications((p) => ({
                    ...p,
                    estimatedMonthlyKwh: parseFloat(e.target.value) || 0,
                  }))
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('discount')} ({t('thb')})
              </label>
              <input
                type="number"
                value={specifications.estimatedMonthlySavingsThb}
                onChange={(e) =>
                  setSpecifications((p) => ({
                    ...p,
                    estimatedMonthlySavingsThb: parseFloat(e.target.value) || 0,
                  }))
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('paybackPeriod')} ({t('years')})
              </label>
              <input
                type="number"
                step="0.1"
                value={specifications.estimatedPaybackYears}
                onChange={(e) =>
                  setSpecifications((p) => ({
                    ...p,
                    estimatedPaybackYears: parseFloat(e.target.value) || 0,
                  }))
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* Section 2: Pricing */}
      {activeSection === 2 && (
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-800">{t('total')}</h3>
          <PricingCalculator
            pricing={pricing}
            onChange={setPricing}
            systemSizeKw={specifications.totalPanelKw}
          />
        </div>
      )}

      {/* Section 3: Timeline */}
      {activeSection === 3 && (
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-800">{t('step3')}</h3>
          <div className="space-y-3">
            {[
              { key: 'siteSurveyDate', label: t('step1'), required: false },
              { key: 'designCompletionDate', label: t('step2'), required: false },
              { key: 'permitSubmissionDate', label: t('step4'), required: false },
              { key: 'installationStartDate', label: `${t('step3')} *`, required: true },
              { key: 'installationEndDate', label: `${t('step3')} *`, required: true },
              { key: 'gridConnectionDate', label: t('step4'), required: false },
            ].map(({ key, label, required }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                <input
                  type="date"
                  value={(timeline as unknown as Record<string, string>)[key] || ''}
                  onChange={(e) => {
                    const updated = { ...timeline, [key]: e.target.value }
                    if (updated.installationStartDate && updated.installationEndDate) {
                      const start = new Date(updated.installationStartDate)
                      const end = new Date(updated.installationEndDate)
                      const days = Math.max(
                        0,
                        Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
                      )
                      updated.estimatedTotalDays = days
                    }
                    setTimeline(updated)
                  }}
                  required={required}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            ))}
          </div>
          {timeline.estimatedTotalDays > 0 && (
            <div className="bg-blue-50 rounded-lg px-4 py-3 text-sm text-blue-800">
              {t('step3')}:{' '}
              <strong>
                {timeline.estimatedTotalDays} {t('days' as Parameters<typeof t>[0]) || 'วัน'}
              </strong>
            </div>
          )}
        </div>
      )}

      {/* Section 4: Warranty */}
      {activeSection === 4 && (
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-800">{t('warrantyPanel')}</h3>
          <div className="space-y-3">
            {[
              {
                key: 'panelPerformanceYears',
                label: `${t('warrantyPanel')} (${t('years')})`,
                default: 25,
              },
              {
                key: 'panelProductYears',
                label: `${t('warrantyPanel')} (${t('years')})`,
                default: 12,
              },
              {
                key: 'inverterYears',
                label: `${t('warrantyInverter')} (${t('years')})`,
                default: 10,
              },
              {
                key: 'installationYears',
                label: `${t('warrantyInstallation')} (${t('years')})`,
                default: 5,
              },
              { key: 'roofLeakYears', label: `${t('roofType')} (${t('years')})`, default: 0 },
              { key: 'batteryYears', label: `${t('accessories')} (${t('years')})`, default: 0 },
            ].map(({ key, label }) => (
              <div key={key} className="flex items-center justify-between">
                <label className="text-sm text-gray-700">{label}</label>
                <input
                  type="number"
                  value={(warranty as unknown as Record<string, number>)[key] || 0}
                  onChange={(e) =>
                    setWarranty((w) => ({ ...w, [key]: parseInt(e.target.value) || 0 }))
                  }
                  className="w-20 text-right border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  min={0}
                  max={99}
                />
              </div>
            ))}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('warrantyPanel')}
            </label>
            <textarea
              value={warranty.additionalTerms || ''}
              onChange={(e) => setWarranty((w) => ({ ...w, additionalTerms: e.target.value }))}
              rows={3}
              placeholder="ระบุเงื่อนไขพิเศษเพิ่มเติม..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </div>
      )}

      {/* Section 5: Financing */}
      {activeSection === 5 && (
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-800">{t('paymentTerms')}</h3>

          <div className="bg-gray-50 rounded-xl p-4 space-y-3">
            <h4 className="text-sm font-semibold text-gray-700">{t('discount')}</h4>
            <div className="flex items-center justify-between">
              <label className="text-sm text-gray-700">{t('discount')} (%)</label>
              <input
                type="number"
                value={financing.cashDiscountPct || 0}
                onChange={(e) =>
                  setFinancing((f) => ({ ...f, cashDiscountPct: parseFloat(e.target.value) || 0 }))
                }
                className="w-20 text-right border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                min={0}
                max={100}
                step={0.5}
              />
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-gray-700">{t('balance')}</h4>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={financing.installmentAvailable}
                  onChange={(e) =>
                    setFinancing((f) => ({ ...f, installmentAvailable: e.target.checked }))
                  }
                  className="w-4 h-4 accent-orange-500"
                />
                <span className="text-sm text-gray-600">{t('includeVat')}</span>
              </label>
            </div>
            {financing.installmentAvailable && (
              <>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    {t('months')}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {[12, 24, 36, 48, 60].map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => toggleInstallmentMonth(m)}
                        className={`px-3 py-1 rounded-full text-sm font-medium border transition-colors ${
                          (financing.installmentMonths || []).includes(m)
                            ? 'bg-orange-500 text-white border-orange-500'
                            : 'bg-white text-gray-600 border-gray-300'
                        }`}
                      >
                        {m} {t('months')}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm text-gray-700">
                    {t('vat')} (% {t('years')})
                  </label>
                  <input
                    type="number"
                    value={financing.installmentInterestRate || 0}
                    onChange={(e) =>
                      setFinancing((f) => ({
                        ...f,
                        installmentInterestRate: parseFloat(e.target.value) || 0,
                      }))
                    }
                    className="w-20 text-right border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    min={0}
                    step={0.1}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    {t('paymentTerms')}
                  </label>
                  <input
                    type="text"
                    placeholder="เช่น ธนาคารกสิกรไทย, ธนาคารไทยพาณิชย์"
                    value={financing.financingPartners.join(', ')}
                    onChange={(e) =>
                      setFinancing((f) => ({
                        ...f,
                        financingPartners: e.target.value
                          .split(',')
                          .map((s) => s.trim())
                          .filter(Boolean),
                      }))
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </>
            )}
          </div>

          <div className="bg-gray-50 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-gray-700">{t('currency')}</h4>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={financing.leasingAvailable}
                  onChange={(e) =>
                    setFinancing((f) => ({ ...f, leasingAvailable: e.target.checked }))
                  }
                  className="w-4 h-4 accent-orange-500"
                />
                <span className="text-sm text-gray-600">{t('includeVat')}</span>
              </label>
            </div>
            {financing.leasingAvailable && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    {t('thb')}/{t('months')}
                  </label>
                  <input
                    type="number"
                    value={financing.leasingMonthly || ''}
                    onChange={(e) =>
                      setFinancing((f) => ({
                        ...f,
                        leasingMonthly: parseFloat(e.target.value) || 0,
                      }))
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    {t('years')}
                  </label>
                  <input
                    type="number"
                    value={financing.leasingTermYears || ''}
                    onChange={(e) =>
                      setFinancing((f) => ({
                        ...f,
                        leasingTermYears: parseInt(e.target.value) || 0,
                      }))
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Additional services */}
          <h4 className="font-semibold text-gray-700">{t('accessories')}</h4>
          <div className="space-y-2">
            {additionalServices.map((svc, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <input
                  type="checkbox"
                  checked={svc.included}
                  onChange={(e) => {
                    const updated = [...additionalServices]
                    updated[idx] = { ...updated[idx], included: e.target.checked }
                    setAdditionalServices(updated)
                  }}
                  className="mt-0.5 w-4 h-4 accent-orange-500"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-800">{svc.name}</span>
                    {svc.price > 0 && (
                      <span className="text-xs text-gray-500">
                        (+฿{svc.price.toLocaleString('en-US')})
                      </span>
                    )}
                    {svc.price === 0 && (
                      <span className="text-xs text-green-600">({t('includeVat')})</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">{svc.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section 6: Notes */}
      {activeSection === 6 && (
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-800">{t('notes')}</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('notes')}</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value.slice(0, 1000))}
              rows={5}
              placeholder="ระบุข้อมูลเพิ่มเติม เงื่อนไขพิเศษ หรือข้อควรรู้สำหรับลูกค้า..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <p className="text-xs text-gray-400 text-right mt-1">{notes.length}/1,000</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('validity')}</label>
            <select
              value={validDays}
              onChange={(e) => setValidDays(parseInt(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              {[7, 14, 30, 45, 60].map((d) => (
                <option key={d} value={d}>
                  {d} {t('validity')}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="pt-4 border-t border-gray-200 flex gap-3 flex-wrap">
        <button
          type="button"
          onClick={() => onSaveDraft(getData())}
          disabled={isSaving}
          className="flex-1 min-w-[120px] py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          {isSaving ? t('saving') : t('save')}
        </button>
        <button
          type="button"
          onClick={() => onPreview(getData())}
          className="flex-1 min-w-[120px] py-2.5 border border-orange-300 rounded-lg text-sm font-medium text-orange-600 hover:bg-orange-50 transition-colors"
        >
          {t('preview')}
        </button>
        <button
          type="button"
          onClick={() => onSubmit(getData())}
          disabled={isSubmitting}
          className="flex-1 min-w-[140px] py-2.5 bg-orange-500 hover:bg-orange-600 rounded-lg text-sm font-bold text-white transition-colors disabled:opacity-50"
        >
          {isSubmitting ? t('sending') : t('send')}
        </button>
      </div>
    </div>
  )
}
