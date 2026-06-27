import type { Product, ProductCategory, ProductPurchase, InventoryTransaction, Sale } from '@/types'
import {
  generatedProducts,
  generatedCategories,
  generatedPurchases,
  generatedTransactions,
  generatedSales,
} from './generator'
import { calculateRunningBalances } from '@/lib/inventory-engine'

export const categories: ProductCategory[] = generatedCategories
export const mockProducts: Product[] = generatedProducts
export const mockPurchases: ProductPurchase[] = generatedPurchases

// Transactions with running balance calculated
export const allTransactions: InventoryTransaction[] = calculateRunningBalances(generatedTransactions)

// Keep old alias for backward compat
export const mockMovements: InventoryTransaction[] = allTransactions

export function getProductById(id: string): Product | undefined {
  return mockProducts.find((p) => p.id === id)
}

export function getProductPurchases(productId: string): ProductPurchase[] {
  return mockPurchases.filter((p) => p.productId === productId)
}

export function getProductMovements(productId: string): InventoryTransaction[] {
  return allTransactions.filter((m) => m.productId === productId)
}

export function getProductTransactions(productId: string): InventoryTransaction[] {
  return allTransactions.filter((t) => t.productId === productId)
}

export function getProductSales(productId: string): Sale[] {
  return generatedSales.filter((s) => s.items.some((i) => i.productId === productId))
}

export function calculateUnitCost(purchaseCost: number, conversionRate: number): number {
  if (conversionRate === 0) return 0
  return purchaseCost / conversionRate
}
