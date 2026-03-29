'use client'

import { useCurrency } from '@/hooks/useCurrency'

interface CurrencyDisplayProps {
  amount: number
  currency?: string
  showConversion?: boolean
  compact?: boolean
  conversionAmount?: number
}

export function CurrencyDisplay({
  amount,
  currency = 'THB',
  showConversion = false,
  compact = false,
  conversionAmount,
}: CurrencyDisplayProps) {
  const { formatCurrency, formatCurrencyCompact } = useCurrency()
  const primary = compact
    ? formatCurrencyCompact(amount, currency)
    : formatCurrency(amount, currency)

  if (!showConversion || conversionAmount === undefined) {
    return <span>{primary}</span>
  }

  const secondary = formatCurrency(conversionAmount, currency === 'THB' ? 'USD' : 'THB')

  return (
    <span>
      {primary} <span className="text-xs text-[var(--brand-text-secondary)]">(~{secondary})</span>
    </span>
  )
}
