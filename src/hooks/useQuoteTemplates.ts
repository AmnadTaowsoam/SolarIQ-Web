'use client'

import { useState, useEffect, useCallback } from 'react'
import { QuoteTemplate } from '@/types/quotes'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1'

// ── Demo Data ─────────────────────────────────────────────────────────────────

export const DEMO_TEMPLATES: QuoteTemplate[] = [
  {
    id: 'tpl-1',
    contractorId: 'contractor-1',
    name: 'แพ็กเกจบ้านพักอาศัย 5 kW มาตรฐาน',
    description: 'แพ็กเกจยอดนิยมสำหรับบ้านพักอาศัยทั่วไป ใช้ JA Solar + Huawei',
    specifications: {
      panelBrand: 'JA Solar',
      panelModel: 'JAM72S30-545/MR',
      panelWattage: 545,
      panelCount: 10,
      panelType: 'monocrystalline',
      totalPanelKw: 5.45,
      inverterBrand: 'Huawei',
      inverterModel: 'SUN2000-5KTL-M1',
      inverterCapacityKw: 5,
      inverterType: 'string',
      inverterCount: 1,
      mountingType: 'roof_rail',
      monitoringSystem: 'included',
      estimatedMonthlyKwh: 650,
      estimatedMonthlySavingsThb: 2800,
      estimatedPaybackYears: 5.1,
    },
    pricing: {
      equipmentCost: 140000,
      panelCost: 85000,
      inverterCost: 35000,
      mountingCost: 12000,
      cableAndAccessories: 8000,
      installationCost: 25000,
      laborCost: 20000,
      permitCost: 5000,
      discountAmount: 0,
      subtotal: 170000,
      vatRate: 7,
      vatAmount: 11900,
      totalPrice: 181900,
      pricePerKw: 33376,
    },
    warranty: {
      panelPerformanceYears: 25,
      panelProductYears: 12,
      inverterYears: 10,
      installationYears: 5,
    },
    financing: {
      cashDiscountPct: 3,
      installmentAvailable: true,
      installmentMonths: [12, 24, 36],
      installmentInterestRate: 0,
      leasingAvailable: false,
      financingPartners: ['ธนาคารกสิกรไทย'],
    },
    additionalServices: [
      { name: 'ระบบ Monitoring', description: 'แอปติดตามการผลิตไฟฟ้า', price: 0, included: true },
    ],
    notes: 'ราคาดังกล่าวรวมค่าขออนุญาต PEA/MEA แล้ว',
    isDefault: true,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'tpl-2',
    contractorId: 'contractor-1',
    name: 'แพ็กเกจพรีเมียม 10 kW + แบตเตอรี่',
    description: 'สำหรับบ้านขนาดใหญ่หรือธุรกิจขนาดเล็ก พร้อมระบบกักเก็บพลังงาน',
    specifications: {
      panelBrand: 'JA Solar',
      panelModel: 'JAM72D30-570/LB',
      panelWattage: 570,
      panelCount: 18,
      panelType: 'bifacial',
      totalPanelKw: 10.26,
      inverterBrand: 'Huawei',
      inverterModel: 'SUN2000-10KTL-M1',
      inverterCapacityKw: 10,
      inverterType: 'hybrid',
      inverterCount: 1,
      batteryBrand: 'CATL',
      batteryModel: 'CATL-10kWh',
      batteryCapacityKwh: 10,
      mountingType: 'roof_rail',
      monitoringSystem: 'included',
      estimatedMonthlyKwh: 1350,
      estimatedMonthlySavingsThb: 5800,
      estimatedPaybackYears: 6.5,
    },
    pricing: {
      equipmentCost: 320000,
      panelCost: 160000,
      inverterCost: 65000,
      batteryCost: 80000,
      mountingCost: 8000,
      cableAndAccessories: 7000,
      installationCost: 45000,
      laborCost: 35000,
      permitCost: 8000,
      discountAmount: 0,
      subtotal: 373000,
      vatRate: 7,
      vatAmount: 26110,
      totalPrice: 399110,
      pricePerKw: 38901,
    },
    warranty: {
      panelPerformanceYears: 25,
      panelProductYears: 15,
      inverterYears: 10,
      installationYears: 5,
      batteryYears: 10,
    },
    financing: {
      cashDiscountPct: 5,
      installmentAvailable: true,
      installmentMonths: [24, 36, 48, 60],
      installmentInterestRate: 0,
      leasingAvailable: true,
      leasingMonthly: 6500,
      leasingTermYears: 7,
      financingPartners: ['ธนาคารกสิกรไทย', 'ธนาคารไทยพาณิชย์'],
    },
    additionalServices: [
      { name: 'ระบบ Monitoring', description: 'แอปติดตามการผลิตไฟฟ้า', price: 0, included: true },
      {
        name: 'สัญญาบำรุงรักษา 3 ปี',
        description: 'ตรวจสอบระบบ 2 ครั้ง/ปี',
        price: 15000,
        included: false,
      },
    ],
    notes: 'ระบบ Hybrid รองรับ Off-Grid ได้บางส่วน',
    isDefault: false,
    createdAt: '2026-01-15T00:00:00Z',
    updatedAt: '2026-01-15T00:00:00Z',
  },
]

// ── Hooks ─────────────────────────────────────────────────────────────────────

export function useQuoteTemplates() {
  const [data, setData] = useState<QuoteTemplate[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await window.fetch(`${API_BASE}/quotes/templates`, {
        headers: { 'Content-Type': 'application/json' },
      })
      if (!res.ok) {
        throw new Error('API error')
      }
      const json = await res.json()
      setData(json.items || json)
    } catch {
      setData(DEMO_TEMPLATES)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetch()
  }, [fetch])

  return { data, isLoading, error, refetch: fetch }
}

export function useSaveTemplate() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const save = useCallback(
    async (
      template: Omit<QuoteTemplate, 'id' | 'contractorId' | 'createdAt' | 'updatedAt'>
    ): Promise<QuoteTemplate> => {
      setIsLoading(true)
      setError(null)
      try {
        const res = await window.fetch(`${API_BASE}/quotes/templates`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(template),
        })
        if (!res.ok) {
          throw new Error('Failed to save template')
        }
        return await res.json()
      } catch {
        return {
          ...template,
          id: `tpl-${Date.now()}`,
          contractorId: 'current-contractor',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  return { save, isLoading, error }
}

export function useApplyTemplate() {
  const apply = useCallback((template: QuoteTemplate) => {
    return {
      specifications: template.specifications,
      pricing: template.pricing,
      warranty: template.warranty,
      financing: template.financing,
      additionalServices: template.additionalServices,
      notes: template.notes,
    }
  }, [])

  return { apply }
}

export function useDeleteTemplate() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const remove = useCallback(async (templateId: string): Promise<void> => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await window.fetch(`${API_BASE}/quotes/templates/${templateId}`, {
        method: 'DELETE',
      })
      if (!res.ok) {
        throw new Error('Failed to delete template')
      }
    } catch {
      // Demo: no-op
    } finally {
      setIsLoading(false)
    }
  }, [])

  return { remove, isLoading, error }
}
