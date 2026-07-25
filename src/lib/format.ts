import { getSettings } from '@/data/settings'

export function formatCurrency(amount: number): string {
  const settings = getSettings()
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: settings.business.currency || 'PKR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatCurrencyShort(amount: number): string {
  const settings = getSettings()
  return `${settings.business.currencySymbol || 'Rs.'} ${amount.toLocaleString()}`
}
