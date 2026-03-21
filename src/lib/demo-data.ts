/**
 * Demo/Seed data for SolarIQ Dashboard
 * Used as fallback when backend API is not connected
 * Provides realistic Thai solar business data for sales demos
 */

import type { DashboardStats, Lead, LeadsOverTime, TopLocation } from '@/types'

// ── Dashboard Stats ─────────────────────────────────────────────────────────
export const DEMO_STATS: DashboardStats = {
  totalLeads: 147,
  newLeads: 23,
  conversionRate: 15.6,
  revenue: 4250000,
}

// ── Pipeline stages (not tied to a backend type) ────────────────────────────
export interface PipelineStage {
  stage: string
  count: number
  value: number
}

export const DEMO_PIPELINE: PipelineStage[] = [
  { stage: 'New Lead', count: 45, value: 12500000 },
  { stage: 'Analyzing', count: 23, value: 8750000 },
  { stage: 'Quoted', count: 18, value: 6200000 },
  { stage: 'Negotiating', count: 12, value: 4100000 },
  { stage: 'Won', count: 9, value: 3500000 },
]

// ── Recent Leads — realistic Thai names & companies, Bangkok area ───────────
export const DEMO_RECENT_LEADS: Lead[] = [
  {
    id: 'demo-1',
    name: 'คุณสมชาย วงศ์สวัสดิ์',
    phone: '081-234-5678',
    email: 'somchai@thaisun.co.th',
    status: 'quoted',
    monthlyBill: 45000,
    address: 'บริษัท ไทยซัน เอ็นเนอร์ยี่ จำกัด, บางนา, กรุงเทพฯ',
    latitude: 13.6677,
    longitude: 100.6014,
    assignedTo: null,
    notes: 'ระบบ 30 kW — สนใจติดโซลาร์เซลล์บนหลังคาโรงงาน',
    createdAt: '2026-03-18T10:30:00Z',
    updatedAt: '2026-03-20T14:15:00Z',
  },
  {
    id: 'demo-2',
    name: 'คุณวิภา สุขสันต์',
    phone: '089-876-5432',
    email: 'wipa@greenroofthai.com',
    status: 'contacted',
    monthlyBill: 18500,
    address: 'กรีนรูฟ ไทย จำกัด, พระราม 9, กรุงเทพฯ',
    latitude: 13.7563,
    longitude: 100.5018,
    assignedTo: null,
    notes: 'ระบบ 15 kW — อาคารพาณิชย์ 3 ชั้น หลังคากว้าง',
    createdAt: '2026-03-19T09:15:00Z',
    updatedAt: '2026-03-20T16:30:00Z',
  },
  {
    id: 'demo-3',
    name: 'คุณประเสริฐ ทองคำ',
    phone: '086-111-2222',
    email: 'prasert@email.com',
    status: 'new',
    monthlyBill: 8200,
    address: 'ลาดพร้าว 71, กรุงเทพฯ',
    latitude: 13.8168,
    longitude: 100.5615,
    assignedTo: null,
    notes: 'ระบบ 5 kW — บ้านเดี่ยว 2 ชั้น',
    createdAt: '2026-03-21T07:45:00Z',
    updatedAt: '2026-03-21T07:45:00Z',
  },
  {
    id: 'demo-4',
    name: 'คุณนภา แสงจันทร์',
    phone: '092-333-4444',
    email: 'napa@solarplus.co.th',
    status: 'won',
    monthlyBill: 32000,
    address: 'โซลาร์พลัส กรุ๊ป, บางแค, กรุงเทพฯ',
    latitude: 13.7140,
    longitude: 100.4097,
    assignedTo: null,
    notes: 'ระบบ 20 kW — ปิดการขายสำเร็จ ติดตั้งแล้ว',
    createdAt: '2026-03-10T11:20:00Z',
    updatedAt: '2026-03-19T09:00:00Z',
  },
  {
    id: 'demo-5',
    name: 'คุณอนันต์ เจริญสุข',
    phone: '095-555-6666',
    email: 'anan@email.com',
    status: 'contacted',
    monthlyBill: 5800,
    address: 'ปากเกร็ด, นนทบุรี',
    latitude: 13.9133,
    longitude: 100.4971,
    assignedTo: null,
    notes: 'ระบบ 3 kW — โทรนัดเข้าสำรวจหน้างาน',
    createdAt: '2026-03-17T13:00:00Z',
    updatedAt: '2026-03-20T10:00:00Z',
  },
]

// ── Leads over time — last 30 days with realistic growth pattern ────────────
function generateLeadsOverTime(): LeadsOverTime[] {
  const data: LeadsOverTime[] = []
  const now = new Date('2026-03-21T12:00:00Z')
  // Seeded pseudo-random for deterministic output
  let seed = 42
  function seededRandom() {
    seed = (seed * 16807 + 0) % 2147483647
    return (seed - 1) / 2147483646
  }
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    const dayOfWeek = date.getDay()
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
    const baseCount = 3 + Math.floor((30 - i) * 0.15) // growing trend
    const variance = Math.floor(seededRandom() * 4)
    const count = isWeekend ? Math.max(1, baseCount - 2 + variance) : baseCount + variance
    data.push({
      date: date.toISOString().split('T')[0],
      count,
    })
  }
  return data
}

export const DEMO_LEADS_OVER_TIME: LeadsOverTime[] = generateLeadsOverTime()

// ── Top locations ───────────────────────────────────────────────────────────
export const DEMO_TOP_LOCATIONS: TopLocation[] = [
  { location: 'กรุงเทพมหานคร', count: 45 },
  { location: 'นนทบุรี', count: 23 },
  { location: 'สมุทรปราการ', count: 19 },
  { location: 'ปทุมธานี', count: 15 },
  { location: 'ชลบุรี', count: 12 },
]
