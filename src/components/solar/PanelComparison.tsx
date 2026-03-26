'use client'

import { useState, useMemo } from 'react'
import { Card, CardHeader, CardBody } from '@/components/ui'
import { ArrowUpDown, Star } from 'lucide-react'
import type { PanelSpec } from '@/types'

interface PanelComparisonProps {
  panels: PanelSpec[]
  systemSizeKw: number
}

type SortField = 'wattage' | 'efficiencyPercent' | 'pricePerWattThb' | 'warrantyYears'
type SortDir = 'asc' | 'desc'

const formatCurrency = (value: number): string =>
  new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)

export function PanelComparison({ panels, systemSizeKw }: PanelComparisonProps) {
  const [sortField, setSortField] = useState<SortField>('efficiencyPercent')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  const sorted = useMemo(() => {
    return [...panels].sort((a, b) => {
      const av = a[sortField]
      const bv = b[sortField]
      return sortDir === 'asc' ? av - bv : bv - av
    })
  }, [panels, sortField, sortDir])

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortDir('desc')
    }
  }

  const recommended = sorted.length > 0 ? sorted[0] : null

  if (!panels || panels.length === 0) {
    return (
      <Card>
        <CardBody className="p-6 text-center text-[var(--brand-text-secondary)]">
          No panel specifications available.
        </CardBody>
      </Card>
    )
  }

  const SortButton = ({ field, label }: { field: SortField; label: string }) => (
    <button
      onClick={() => toggleSort(field)}
      className="flex items-center gap-1 text-xs font-medium text-[var(--brand-text-secondary)] hover:text-[var(--brand-text)] transition-colors"
    >
      {label}
      <ArrowUpDown
        className={`w-3 h-3 ${sortField === field ? 'text-[var(--brand-primary)]' : ''}`}
      />
    </button>
  )

  return (
    <Card>
      <CardHeader
        title="Panel Comparison"
        subtitle={`${panels.length} panel options for ${(systemSizeKw ?? 0).toFixed(1)} kW system`}
      />
      <CardBody className="p-0">
        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--brand-border)]">
                <th className="text-left px-4 py-3 text-xs font-medium text-[var(--brand-text-secondary)]">
                  Brand / Model
                </th>
                <th className="px-4 py-3">
                  <SortButton field="wattage" label="Wattage" />
                </th>
                <th className="px-4 py-3">
                  <SortButton field="efficiencyPercent" label="Efficiency" />
                </th>
                <th className="px-4 py-3">
                  <SortButton field="pricePerWattThb" label="Price/W" />
                </th>
                <th className="px-4 py-3">
                  <SortButton field="warrantyYears" label="Warranty" />
                </th>
                <th className="px-4 py-3 text-xs font-medium text-[var(--brand-text-secondary)]">
                  Type
                </th>
                <th className="px-4 py-3 text-xs font-medium text-[var(--brand-text-secondary)]">
                  Total Cost
                </th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((panel, idx) => {
                const panelsNeeded = Math.ceil((systemSizeKw * 1000) / panel.wattage)
                const totalCost = panelsNeeded * panel.wattage * panel.pricePerWattThb
                const isRecommended =
                  recommended &&
                  panel.brand === recommended.brand &&
                  panel.model === recommended.model
                return (
                  <tr
                    key={idx}
                    className={`border-b border-[var(--brand-border)] hover:bg-[var(--brand-primary)]/5 transition-colors ${
                      isRecommended ? 'bg-[var(--brand-primary)]/5' : ''
                    }`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {isRecommended && (
                          <Star className="w-4 h-4 text-[var(--brand-primary)] fill-current" />
                        )}
                        <div>
                          <div className="font-medium text-[var(--brand-text)]">{panel.brand}</div>
                          <div className="text-xs text-[var(--brand-text-secondary)]">
                            {panel.model}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center text-[var(--brand-text)]">
                      {panel.wattage}W
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`font-medium ${panel.efficiencyPercent >= 21 ? 'text-green-600' : 'text-[var(--brand-text)]'}`}
                      >
                        {(panel.efficiencyPercent ?? 0).toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-[var(--brand-text)]">
                      {formatCurrency(panel.pricePerWattThb)}/W
                    </td>
                    <td className="px-4 py-3 text-center text-[var(--brand-text)]">
                      {panel.warrantyYears} yrs
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="px-2 py-0.5 rounded-full text-xs bg-[var(--brand-primary)]/10 text-[var(--brand-primary)]">
                        {panel.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center font-medium text-[var(--brand-text)]">
                      {formatCurrency(totalCost)}
                      <div className="text-xs text-[var(--brand-text-secondary)]">
                        {panelsNeeded} panels
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden space-y-3 p-4">
          {sorted.map((panel, idx) => {
            const panelsNeeded = Math.ceil((systemSizeKw * 1000) / panel.wattage)
            const totalCost = panelsNeeded * panel.wattage * panel.pricePerWattThb
            const isRecommended =
              recommended && panel.brand === recommended.brand && panel.model === recommended.model
            return (
              <div
                key={idx}
                className={`p-4 rounded-lg border transition-colors ${
                  isRecommended
                    ? 'border-[var(--brand-primary)] bg-[var(--brand-primary)]/5'
                    : 'border-[var(--brand-border)]'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {isRecommended && (
                      <Star className="w-4 h-4 text-[var(--brand-primary)] fill-current" />
                    )}
                    <div>
                      <div className="font-medium text-[var(--brand-text)]">{panel.brand}</div>
                      <div className="text-xs text-[var(--brand-text-secondary)]">
                        {panel.model}
                      </div>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-xs bg-[var(--brand-primary)]/10 text-[var(--brand-primary)]">
                    {panel.type}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-[var(--brand-text-secondary)]">Wattage: </span>
                    <span className="font-medium text-[var(--brand-text)]">{panel.wattage}W</span>
                  </div>
                  <div>
                    <span className="text-[var(--brand-text-secondary)]">Efficiency: </span>
                    <span className="font-medium text-[var(--brand-text)]">
                      {(panel.efficiencyPercent ?? 0).toFixed(1)}%
                    </span>
                  </div>
                  <div>
                    <span className="text-[var(--brand-text-secondary)]">Warranty: </span>
                    <span className="font-medium text-[var(--brand-text)]">
                      {panel.warrantyYears} yrs
                    </span>
                  </div>
                  <div>
                    <span className="text-[var(--brand-text-secondary)]">Dimensions: </span>
                    <span className="font-medium text-[var(--brand-text)]">
                      {panel.dimensionsMm.width}x{panel.dimensionsMm.height}mm
                    </span>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-[var(--brand-border)] flex justify-between items-center">
                  <span className="text-[var(--brand-text-secondary)] text-sm">
                    {panelsNeeded} panels needed
                  </span>
                  <span className="font-bold text-[var(--brand-text)]">
                    {formatCurrency(totalCost)}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </CardBody>
    </Card>
  )
}
