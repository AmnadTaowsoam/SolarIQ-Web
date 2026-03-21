export const SUPPORTED_CURRENCIES = ['THB', 'USD', 'VND', 'IDR', 'PHP', 'MYR'] as const
export type SupportedCurrency = (typeof SUPPORTED_CURRENCIES)[number]

const CURRENCY_DECIMALS: Record<SupportedCurrency, number> = {
  THB: 2,
  USD: 2,
  VND: 0,
  IDR: 0,
  PHP: 2,
  MYR: 2,
}

export function getCurrencyDecimals(currency: string): number {
  if (currency in CURRENCY_DECIMALS) {
    return CURRENCY_DECIMALS[currency as SupportedCurrency]
  }
  return 2
}
