'use client'

import { useFormatter, useLocale } from 'next-intl'
import { getCurrencyDecimals } from '@/lib/currency'

export function useCurrency() {
  const locale = useLocale()
  const format = useFormatter()

  function formatCurrency(amount: number, currency: string = 'THB'): string {
    const decimals = getCurrencyDecimals(currency)
    return format.number(amount, {
      style: 'currency',
      currency,
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })
  }

  function formatCurrencyCompact(amount: number, currency: string = 'THB'): string {
    return format.number(amount, {
      style: 'currency',
      currency,
      notation: 'compact',
      maximumFractionDigits: 1,
    })
  }

  return { locale, formatCurrency, formatCurrencyCompact }
}
