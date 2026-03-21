'use client'

import { useEffect } from 'react'
import { PricingBreakdown } from '@/types/quotes'

interface PricingCalculatorProps {
  pricing: PricingBreakdown
  onChange: (pricing: PricingBreakdown) => void
  systemSizeKw: number
}

function formatThb(value: number): string {
  return `฿${value.toLocaleString('en-US')}`
}

function NumberInput({
  label,
  value,
  onChange,
  hint,
  readOnly,
}: {
  label: string
  value: number
  onChange?: (v: number) => void
  hint?: string
  readOnly?: boolean
}) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
      <div>
        <span className="text-sm text-gray-700">{label}</span>
        {hint && <p className="text-xs text-gray-400">{hint}</p>}
      </div>
      <div className="flex items-center gap-1">
        <span className="text-sm text-gray-500">฿</span>
        {readOnly ? (
          <span className="text-sm font-semibold text-gray-900 w-28 text-right">
            {value.toLocaleString('en-US')}
          </span>
        ) : (
          <input
            type="number"
            value={value || ''}
            onChange={(e) => onChange?.(parseFloat(e.target.value) || 0)}
            className="w-28 text-right text-sm font-medium border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-orange-500"
            min={0}
          />
        )}
      </div>
    </div>
  )
}

export function PricingCalculator({ pricing, onChange, systemSizeKw }: PricingCalculatorProps) {
  // Auto-recalculate totals whenever any input changes
  useEffect(() => {
    const equipmentCost =
      pricing.panelCost +
      pricing.inverterCost +
      (pricing.batteryCost || 0) +
      pricing.mountingCost +
      pricing.cableAndAccessories

    const installationCost = pricing.laborCost + (pricing.scaffoldingCost || 0)

    const subtotalBeforeDiscount =
      equipmentCost + installationCost + pricing.permitCost + (pricing.engineeringCost || 0)

    const subtotal = subtotalBeforeDiscount - pricing.discountAmount
    const vatAmount = Math.round(subtotal * (pricing.vatRate / 100))
    const totalPrice = subtotal + vatAmount
    const pricePerKw = systemSizeKw > 0 ? Math.round(totalPrice / systemSizeKw) : 0

    const updated: PricingBreakdown = {
      ...pricing,
      equipmentCost,
      installationCost,
      subtotal,
      vatAmount,
      totalPrice,
      pricePerKw,
    }

    const hasChange =
      updated.equipmentCost !== pricing.equipmentCost ||
      updated.installationCost !== pricing.installationCost ||
      updated.subtotal !== pricing.subtotal ||
      updated.vatAmount !== pricing.vatAmount ||
      updated.totalPrice !== pricing.totalPrice ||
      updated.pricePerKw !== pricing.pricePerKw

    if (hasChange) {
      onChange(updated)
    }
  }, [
    pricing.panelCost,
    pricing.inverterCost,
    pricing.batteryCost,
    pricing.mountingCost,
    pricing.cableAndAccessories,
    pricing.laborCost,
    pricing.scaffoldingCost,
    pricing.permitCost,
    pricing.engineeringCost,
    pricing.discountAmount,
    pricing.vatRate,
    systemSizeKw,
  ])

  const update = (key: keyof PricingBreakdown) => (value: number) => {
    onChange({ ...pricing, [key]: value })
  }

  return (
    <div className="space-y-4">
      {/* Equipment Costs */}
      <div className="bg-gray-50 rounded-xl p-4">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">ค่าอุปกรณ์</h4>
        <NumberInput label="ค่าแผงโซลาร์" value={pricing.panelCost} onChange={update('panelCost')} />
        <NumberInput label="ค่าอินเวอร์เตอร์" value={pricing.inverterCost} onChange={update('inverterCost')} />
        <NumberInput label="ค่าแบตเตอรี่" value={pricing.batteryCost || 0} onChange={update('batteryCost')} hint="(ถ้ามี)" />
        <NumberInput label="ค่าโครงยึด" value={pricing.mountingCost} onChange={update('mountingCost')} />
        <NumberInput label="ค่าสายไฟและอุปกรณ์เสริม" value={pricing.cableAndAccessories} onChange={update('cableAndAccessories')} />
        <div className="flex justify-between pt-2 mt-1 border-t border-gray-200">
          <span className="text-xs font-semibold text-gray-600">รวมค่าอุปกรณ์</span>
          <span className="text-xs font-bold text-gray-800">{formatThb(pricing.equipmentCost)}</span>
        </div>
      </div>

      {/* Installation Costs */}
      <div className="bg-gray-50 rounded-xl p-4">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">ค่าติดตั้ง</h4>
        <NumberInput label="ค่าแรงงาน" value={pricing.laborCost} onChange={update('laborCost')} />
        <NumberInput label="ค่านั่งร้าน" value={pricing.scaffoldingCost || 0} onChange={update('scaffoldingCost')} hint="(ถ้ามี)" />
        <div className="flex justify-between pt-2 mt-1 border-t border-gray-200">
          <span className="text-xs font-semibold text-gray-600">รวมค่าติดตั้ง</span>
          <span className="text-xs font-bold text-gray-800">{formatThb(pricing.installationCost)}</span>
        </div>
      </div>

      {/* Other Costs */}
      <div className="bg-gray-50 rounded-xl p-4">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">ค่าใช้จ่ายอื่นๆ</h4>
        <NumberInput label="ค่าขออนุญาต PEA/MEA" value={pricing.permitCost} onChange={update('permitCost')} />
        <NumberInput label="ค่าออกแบบวิศวกรรม" value={pricing.engineeringCost || 0} onChange={update('engineeringCost')} hint="(ถ้ามี)" />
      </div>

      {/* Discount */}
      <div className="bg-yellow-50 rounded-xl p-4">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">ส่วนลด</h4>
        <NumberInput label="จำนวนส่วนลด" value={pricing.discountAmount} onChange={update('discountAmount')} />
        <div className="mt-2">
          <input
            type="text"
            placeholder="เหตุผลส่วนลด (เช่น ส่วนลดพิเศษลูกค้าใหม่)"
            value={pricing.discountReason || ''}
            onChange={(e) => onChange({ ...pricing, discountReason: e.target.value })}
            className="w-full text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
      </div>

      {/* Summary */}
      <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
        <h4 className="text-sm font-semibold text-orange-800 mb-3">สรุปราคา</h4>
        <div className="space-y-1.5 text-sm">
          <div className="flex justify-between text-gray-700">
            <span>รวม (ก่อน VAT)</span>
            <span className="font-medium">{formatThb(pricing.subtotal)}</span>
          </div>
          <div className="flex justify-between text-gray-500 text-xs">
            <span>VAT {pricing.vatRate}%</span>
            <span>{formatThb(pricing.vatAmount)}</span>
          </div>
          <div className="flex justify-between font-bold text-base text-orange-900 pt-2 border-t border-orange-200 mt-2">
            <span>ราคารวมทั้งสิ้น</span>
            <span>{formatThb(pricing.totalPrice)}</span>
          </div>
          {pricing.pricePerKw > 0 && (
            <div className="flex justify-between text-xs text-gray-500">
              <span>ราคาต่อ kW</span>
              <span>{formatThb(pricing.pricePerKw)}/kW</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
