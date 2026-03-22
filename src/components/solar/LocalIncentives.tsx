'use client'

import { useMemo } from 'react'
import { Card, CardHeader, CardBody, Badge } from '@/components/ui'
import { Gift, Building2, CheckCircle, Clock, Calculator } from 'lucide-react'
import type { LocalIncentive } from '@/types'

interface LocalIncentivesProps {
  incentives: LocalIncentive[]
  installationCost?: number
}

const formatCurrency = (value: number): string =>
  new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)

export function LocalIncentives({ incentives, installationCost }: LocalIncentivesProps) {
  const totalPotentialSavings = useMemo(() => {
    return incentives.reduce((sum, inc) => {
      if (inc.amountThb) return sum + inc.amountThb
      if (inc.percentage && installationCost) return sum + (installationCost * inc.percentage) / 100
      return sum
    }, 0)
  }, [incentives, installationCost])

  if (!incentives || incentives.length === 0) {
    return (
      <Card>
        <CardBody className="p-6 text-center text-[var(--brand-text-secondary)]">
          No incentive information available.
        </CardBody>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Total savings banner */}
      <Card className="bg-gradient-to-r from-[var(--brand-primary)]/10 to-green-500/10">
        <CardBody className="p-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-[var(--brand-primary)]/20">
                <Calculator className="w-6 h-6 text-[var(--brand-primary)]" />
              </div>
              <div>
                <div className="text-sm text-[var(--brand-text-secondary)]">Total Potential Savings</div>
                <div className="text-2xl font-bold text-[var(--brand-text)]">
                  {formatCurrency(totalPotentialSavings)}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-[var(--brand-text-secondary)]">Available Incentives</div>
              <div className="text-2xl font-bold text-[var(--brand-primary)]">{incentives.length}</div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Incentive cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {incentives.map((incentive, idx) => (
          <Card key={idx} className="hover:shadow-md transition-shadow">
            <CardBody className="p-5">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-green-500/10 mt-0.5">
                  <Gift className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-[var(--brand-text)] mb-1">{incentive.name}</h4>
                  <p className="text-sm text-[var(--brand-text-secondary)] mb-3 line-clamp-2">
                    {incentive.description}
                  </p>

                  {/* Amount */}
                  <div className="flex items-center gap-2 mb-3">
                    {incentive.amountThb && (
                      <Badge variant="success">
                        {formatCurrency(incentive.amountThb)}
                      </Badge>
                    )}
                    {incentive.percentage && (
                      <Badge variant="success">
                        {incentive.percentage}% discount
                      </Badge>
                    )}
                  </div>

                  {/* Provider */}
                  <div className="flex items-center gap-1.5 text-xs text-[var(--brand-text-secondary)] mb-2">
                    <Building2 className="w-3.5 h-3.5" />
                    <span>{incentive.provider}</span>
                  </div>

                  {/* Eligibility */}
                  <div className="flex items-start gap-1.5 text-xs text-[var(--brand-text-secondary)] mb-2">
                    <CheckCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                    <span>{incentive.eligibility}</span>
                  </div>

                  {/* Valid until */}
                  {incentive.validUntil && (
                    <div className="flex items-center gap-1.5 text-xs text-[var(--brand-text-secondary)]">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Valid until {incentive.validUntil}</span>
                    </div>
                  )}
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  )
}
