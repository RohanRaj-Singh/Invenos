// Re-exports from the unified inventory engine
import type { Product, PackagingSuggestion } from '@/types'

export {
  findPackaging,
  getDefaultSalePackaging,
  getDefaultPurchasePackaging,
  packagingToBase,
  baseToPackaging,
  packagingToBaseMulti,
  buildCartItem,
  getStockDisplay,
  getPackagingPrice,
  calculateStockValue,
} from './inventory-engine'

// ─── Base unit options ───
export const BASE_UNITS = [
  'Piece', 'Gram', 'KG', 'ML', 'Liter', 'Tablet', 'Capsule', 'Bottle', 'Meter', 'Packet',
] as const

// ─── Packaging suggestions (name → common quantities) ───
const COMMON_PACKAGING: Record<string, { quantity: number; label: string }[]> = {
  Carton: [
    { quantity: 6, label: '6 Pieces' }, { quantity: 10, label: '10 Pieces' },
    { quantity: 12, label: '12 Pieces' }, { quantity: 20, label: '20 Pieces' },
    { quantity: 24, label: '24 Pieces' }, { quantity: 36, label: '36 Pieces' },
    { quantity: 48, label: '48 Pieces' }, { quantity: 50, label: '50 Pieces' },
    { quantity: 72, label: '72 Pieces' }, { quantity: 100, label: '100 Pieces' },
    { quantity: 144, label: '144 Pieces' }, { quantity: 500, label: '500 Pieces' },
    { quantity: 1000, label: '1000 Pieces' },
  ],
  Box: [
    { quantity: 6, label: '6 Units' }, { quantity: 10, label: '10 Units' },
    { quantity: 12, label: '12 Units' }, { quantity: 20, label: '20 Units' },
    { quantity: 24, label: '24 Units' }, { quantity: 25, label: '25 Units' },
    { quantity: 30, label: '30 Units' }, { quantity: 50, label: '50 Units' },
    { quantity: 100, label: '100 Units' },
  ],
  Strip: [
    { quantity: 6, label: '6 Tablets' }, { quantity: 10, label: '10 Tablets' },
    { quantity: 12, label: '12 Tablets' }, { quantity: 14, label: '14 Tablets' },
    { quantity: 20, label: '20 Tablets' }, { quantity: 30, label: '30 Tablets' },
    { quantity: 50, label: '50 Capsules' }, { quantity: 100, label: '100 Capsules' },
  ],
  Bag: [
    { quantity: 1000, label: '1 KG' }, { quantity: 5000, label: '5 KG' },
    { quantity: 10000, label: '10 KG' }, { quantity: 20000, label: '20 KG' },
    { quantity: 25000, label: '25 KG' }, { quantity: 50000, label: '50 KG' },
  ],
  Bottle: [
    { quantity: 1, label: '1 Unit' }, { quantity: 6, label: '6 Units' },
    { quantity: 12, label: '12 Units' }, { quantity: 24, label: '24 Units' },
  ],
  Case: [
    { quantity: 6, label: '6 Units' }, { quantity: 10, label: '10 Units' },
    { quantity: 12, label: '12 Units' }, { quantity: 24, label: '24 Units' },
    { quantity: 50, label: '50 Units' }, { quantity: 100, label: '100 Units' },
  ],
  Tray: [
    { quantity: 6, label: '6 Units' }, { quantity: 12, label: '12 Units' },
    { quantity: 24, label: '24 Units' }, { quantity: 30, label: '30 Units' },
  ],
}

export function getPackagingSuggestions(products: Product[]): PackagingSuggestion[] {
  const freq = new Map<string, Map<number, number>>()
  for (const product of products) {
    for (const pkg of product.packaging) {
      if (!freq.has(pkg.name)) freq.set(pkg.name, new Map())
      const qtyMap = freq.get(pkg.name)!
      qtyMap.set(pkg.quantity, (qtyMap.get(pkg.quantity) || 0) + 1)
    }
  }
  const result: PackagingSuggestion[] = []
  for (const [name, qtyMap] of freq) {
    for (const [quantity, productCount] of qtyMap) {
      result.push({ name, quantity, productCount })
    }
  }
  return result.sort((a, b) => b.productCount - a.productCount)
}

export function getSuggestionsForPackagingName(name: string, products: Product[]): { common: { quantity: number; label: string }[]; usedInProducts: number } {
  const preset = COMMON_PACKAGING[name] || []
  const matchedName = name.toLowerCase()
  const usedInProducts = products.filter((p) => p.packaging.some((pkg) => pkg.name.toLowerCase().includes(matchedName))).length
  return { common: preset, usedInProducts }
}
