'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  PermitPackage,
  PermitDocument,
  ApprovedEquipment,
  PermitTemplate,
  PermitChecklist,
  PermitStats,
  PermitPackageCreate,
  PermitPackageUpdate,
  PermitDocumentGenerate,
  PermitDocumentReview,
  ApprovedEquipmentSearch,
} from '@/types/permit'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1'

// ── Demo Data ──────────────────────────────────────────────────────────────

export const DEMO_PERMIT_PACKAGES: PermitPackage[] = [
  {
    id: 'permit-demo-1',
    dealId: 'deal-demo-1',
    orgId: 'org-1',
    authority: 'mea',
    permitType: 'self_consumption',
    status: 'draft',
    submittedAt: null,
    approvedAt: null,
    rejectionReason: null,
    submissionDeadline: '2026-04-20T00:00:00Z',
    metadata: {},
    documents: [],
    createdAt: '2026-03-21T10:00:00Z',
    updatedAt: '2026-03-21T10:00:00Z',
  },
  {
    id: 'permit-demo-2',
    dealId: 'deal-demo-2',
    orgId: 'org-1',
    authority: 'pea',
    permitType: 'net_metering',
    status: 'submitted',
    submittedAt: '2026-03-25T10:00:00Z',
    approvedAt: null,
    rejectionReason: null,
    submissionDeadline: '2026-04-20T00:00:00Z',
    metadata: {},
    documents: [
      {
        id: 'doc-demo-1',
        packageId: 'permit-demo-2',
        templateId: 'pea_application_form',
        documentType: 'application_form',
        title: 'Application Form',
        dataJson: {},
        pdfUrl: null,
        status: 'generated',
        reviewedBy: null,
        reviewedAt: null,
        reviewNotes: null,
        createdAt: '2026-03-25T10:00:00Z',
        updatedAt: '2026-03-25T10:00:00Z',
      },
    ],
    createdAt: '2026-03-21T10:00:00Z',
    updatedAt: '2026-03-25T10:00:00Z',
  },
]

export const DEMO_APPROVED_EQUIPMENT: ApprovedEquipment[] = [
  {
    id: 'eq-demo-1',
    equipmentType: 'inverter',
    brand: 'SMA',
    model: 'Sunny Tripower 10000TL-10',
    authority: 'mea',
    approvedUntil: '2026-12-31T23:59:59Z',
    specifications: {
      max_power: 10000,
      input_voltage: '320-800V',
      output_voltage: '220/380V',
      frequency: '50Hz',
      mppt: '2',
    },
    powerRating: 10.0,
    efficiency: 98.0,
    voltageRating: '220V/380V',
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'eq-demo-2',
    equipmentType: 'inverter',
    brand: 'Fronius',
    model: 'Primo 5.0-1',
    authority: 'mea',
    approvedUntil: '2026-12-31T23:59:59Z',
    specifications: {
      max_power: 5000,
      input_voltage: '150-550V',
      output_voltage: '230V',
      frequency: '50Hz',
      mppt: '2',
    },
    powerRating: 5.0,
    efficiency: 97.8,
    voltageRating: '220V',
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
]

export const DEMO_PERMIT_TEMPLATES: PermitTemplate[] = [
  {
    templateId: 'mea_application_form',
    name: 'Application Form',
    authority: 'mea',
    permitType: 'self_consumption',
    documentType: 'application_form',
    description: 'MEA Application Form for Solar Installation',
    requiredFields: [
      'customerName',
      'customerAddress',
      'customerPhone',
      'systemSize',
      'panelCount',
      'inverterModel',
    ],
  },
  {
    templateId: 'mea_sld',
    name: 'Single Line Diagram',
    authority: 'mea',
    permitType: 'self_consumption',
    documentType: 'sld',
    description: 'MEA Single Line Diagram Template',
    requiredFields: ['systemSize', 'inverterModel', 'panelCount', 'panelModel', 'connectionType'],
  },
  {
    templateId: 'pea_application_form',
    name: 'Application Form',
    authority: 'pea',
    permitType: 'net_metering',
    documentType: 'application_form',
    description: 'PEA Application Form for Solar Installation',
    requiredFields: [
      'customerName',
      'customerAddress',
      'customerPhone',
      'systemSize',
      'panelCount',
      'inverterModel',
    ],
  },
]

// ── Transform helper ────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function transformPermit(raw: any): PermitPackage {
  return {
    ...raw,
    dealId: raw.dealId || raw.deal_id || '',
    orgId: raw.orgId || raw.org_id || '',
    permitType: raw.permitType || raw.permit_type || '',
    submittedAt: raw.submittedAt || raw.submitted_at || null,
    approvedAt: raw.approvedAt || raw.approved_at || null,
    rejectionReason: raw.rejectionReason || raw.rejection_reason || null,
    submissionDeadline: raw.submissionDeadline || raw.submission_deadline || null,
    createdAt: raw.createdAt || raw.created_at || new Date().toISOString(),
    updatedAt: raw.updatedAt || raw.updated_at || new Date().toISOString(),
    documents: (raw.documents || []).map((d: Record<string, unknown>) => ({
      ...d,
      packageId: d.packageId || d.package_id || '',
      createdAt: d.createdAt || d.created_at || new Date().toISOString(),
      updatedAt: d.updatedAt || d.updated_at || new Date().toISOString(),
      reviewedAt: d.reviewedAt || d.reviewed_at || null,
    })),
  }
}

// ── API Hooks ───────────────────────────────────────────────────────────────

export function usePermits(status?: string, page = 1, limit = 20) {
  const [packages, setPackages] = useState<PermitPackage[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchPermits = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      })
      if (status) {
        params.append('status', status)
      }

      const response = await fetch(`${API_BASE}/permits?${params}`, {
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('Failed to fetch permits')
      }

      const data = await response.json()
      setPackages((data.items || []).map(transformPermit))
      setTotal(data.total || 0)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      // Use demo data as fallback
      setPackages(DEMO_PERMIT_PACKAGES)
      setTotal(DEMO_PERMIT_PACKAGES.length)
    } finally {
      setLoading(false)
    }
  }, [status, page, limit])

  useEffect(() => {
    fetchPermits()
  }, [fetchPermits])

  return { packages, total, loading, error, refetch: fetchPermits }
}

export function usePermit(id: string) {
  const [permit, setPermit] = useState<PermitPackage | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchPermit = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`${API_BASE}/permits/${id}`, {
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('Failed to fetch permit')
      }

      const data = await response.json()
      setPermit(transformPermit(data))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      // Use demo data as fallback
      const demoPermit = DEMO_PERMIT_PACKAGES.find((p) => p.id === id)
      setPermit(demoPermit || null)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchPermit()
  }, [fetchPermit])

  return { permit, loading, error, refetch: fetchPermit }
}

export function usePermitChecklist(permitId: string) {
  const [checklist, setChecklist] = useState<PermitChecklist[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchChecklist = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`${API_BASE}/permits/${permitId}/checklist`, {
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('Failed to fetch checklist')
      }

      const data = await response.json()
      setChecklist(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [permitId])

  useEffect(() => {
    fetchChecklist()
  }, [fetchChecklist])

  return { checklist, loading, error, refetch: fetchChecklist }
}

export function useApprovedEquipment(searchParams?: ApprovedEquipmentSearch) {
  const [equipment, setEquipment] = useState<ApprovedEquipment[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchEquipment = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (searchParams?.equipmentType) {
        params.append('equipment_type', searchParams.equipmentType)
      }
      if (searchParams?.authority) {
        params.append('authority', searchParams.authority)
      }
      if (searchParams?.brand) {
        params.append('brand', searchParams.brand)
      }
      if (searchParams?.minPower !== undefined) {
        params.append('min_power', searchParams.minPower.toString())
      }
      if (searchParams?.maxPower !== undefined) {
        params.append('max_power', searchParams.maxPower.toString())
      }

      const response = await fetch(`${API_BASE}/permits/equipment/inverters?${params}`, {
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('Failed to fetch equipment')
      }

      const data = await response.json()
      setEquipment(data.items || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      // Use demo data as fallback
      setEquipment(DEMO_APPROVED_EQUIPMENT)
    } finally {
      setLoading(false)
    }
  }, [searchParams])

  useEffect(() => {
    fetchEquipment()
  }, [fetchEquipment])

  return { equipment, loading, error, refetch: fetchEquipment }
}

export function usePermitTemplates(authority?: 'mea' | 'pea', permitType?: string) {
  const [templates, setTemplates] = useState<PermitTemplate[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchTemplates = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (authority) {
        params.append('authority', authority)
      }
      if (permitType) {
        params.append('permit_type', permitType)
      }

      const response = await fetch(`${API_BASE}/permits/templates?${params}`, {
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('Failed to fetch templates')
      }

      const data = await response.json()
      setTemplates(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      // Use demo data as fallback
      setTemplates(DEMO_PERMIT_TEMPLATES)
    } finally {
      setLoading(false)
    }
  }, [authority, permitType])

  useEffect(() => {
    fetchTemplates()
  }, [fetchTemplates])

  return { templates, loading, error, refetch: fetchTemplates }
}

export function usePermitStats() {
  const [stats, setStats] = useState<PermitStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`${API_BASE}/permits/stats`, {
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('Failed to fetch stats')
      }

      const data = await response.json()
      setStats(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  return { stats, loading, error, refetch: fetchStats }
}

// ── API Actions ─────────────────────────────────────────────────────────────

export async function createPermitPackage(data: PermitPackageCreate): Promise<PermitPackage> {
  try {
    const response = await fetch(`${API_BASE}/permits`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error('Failed to create permit package')
    }

    return await response.json()
  } catch (err) {
    throw err
  }
}

export async function updatePermitPackage(
  id: string,
  data: PermitPackageUpdate
): Promise<PermitPackage> {
  try {
    const response = await fetch(`${API_BASE}/permits/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error('Failed to update permit package')
    }

    return await response.json()
  } catch (err) {
    throw err
  }
}

export async function generatePermitDocument(
  permitId: string,
  data: PermitDocumentGenerate
): Promise<PermitDocument> {
  try {
    const response = await fetch(`${API_BASE}/permits/${permitId}/documents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error('Failed to generate document')
    }

    return await response.json()
  } catch (err) {
    throw err
  }
}

export async function reviewPermitDocument(
  permitId: string,
  documentId: string,
  data: PermitDocumentReview
): Promise<PermitDocument> {
  try {
    const response = await fetch(`${API_BASE}/permits/${permitId}/documents/${documentId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error('Failed to review document')
    }

    return await response.json()
  } catch (err) {
    throw err
  }
}
