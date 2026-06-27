import type { POSCustomer } from '@/types'
import { mockProducts } from './inventory'
import { generatedPOSCustomers } from './generator'

export const posCustomers: POSCustomer[] = generatedPOSCustomers

export const posCategories = [
  { id: 'all', name: 'All', icon: 'Grid3x3' },
  { id: 'Medicine', name: 'Medicine', icon: 'Pill' },
  { id: 'Clinic Supplies', name: 'Clinic', icon: 'Syringe' },
  { id: 'Cosmetics', name: 'Cosmetics', icon: 'Sparkles' },
  { id: 'Skincare', name: 'Skincare', icon: 'Droplets' },
  { id: 'Mobile Accessories', name: 'Accessories', icon: 'Smartphone' },
  { id: 'Electronics', name: 'Electronics', icon: 'Zap' },
  { id: 'Groceries', name: 'Groceries', icon: 'Apple' },
]

// POS-specific product subset with visual-friendly data
export const posProducts = mockProducts
  .filter((p) => p.status !== 'out-of-stock')
  .map((p) => ({
    ...p,
    _color: (
      ['from-sky-500/20 to-sky-600/10', 'from-violet-500/20 to-violet-600/10', 'from-emerald-500/20 to-emerald-600/10', 'from-amber-500/20 to-amber-600/10', 'from-rose-500/20 to-rose-600/10', 'from-cyan-500/20 to-cyan-600/10', 'from-orange-500/20 to-orange-600/10', 'from-pink-500/20 to-pink-600/10'] as const
    )[Math.floor(Math.random() * 8)],
  }))

export function getProductBySku(sku: string) {
  return posProducts.find((p) => p.sku.toLowerCase() === sku.toLowerCase())
}

export function filterPOSProducts(search: string, category: string) {
  let result = posProducts
  if (search) {
    const q = search.toLowerCase()
    result = result.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.barcode.includes(q)
    )
  }
  if (category !== 'all') {
    result = result.filter((p) => p.category === category)
  }
  return result
}
