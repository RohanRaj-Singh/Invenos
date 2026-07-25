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

// ── Test products for custom measurement units ──
mockProducts.push(
  {
    id: 'test-powder',
    name: 'Herbal Powder (Test)',
    sku: 'TST-POW-001',
    barcode: '8901000001',
    category: 'Groceries',
    description: 'Fine herbal powder sold by weight',
    trackInventory: true,
    baseUnit: 'KG' as any,
    baseUnitId: 'kg',
    packaging: [{ name: 'KG', quantity: 1, purchasePrice: 800, salePrice: 0 }],
    stockQuantity: 5000,
    lowStockThreshold: 200,
    status: 'in-stock',
    createdAt: '2026-07-01',
    updatedAt: '2026-07-01',
    sellingUnits: [
      { id: 'su-pow-50g', name: '50g Pack', unitId: 'kg', quantity: 0.05, salePrice: 100, isDefault: false },
      { id: 'su-pow-100g', name: '100g Pack', unitId: 'kg', quantity: 0.1, salePrice: 180, isDefault: false },
      { id: 'su-pow-250g', name: '250g Pack', unitId: 'kg', quantity: 0.25, salePrice: 400, isDefault: false },
      { id: 'su-pow-500g', name: '500g Pack', unitId: 'kg', quantity: 0.5, salePrice: 700, isDefault: false },
      { id: 'su-pow-1kg', name: '1 KG', unitId: 'kg', quantity: 1, salePrice: 1200, isDefault: true },
    ],
    purchaseConfig: { unitId: 'kg', quantity: 1, cost: 800 },
  } as Product,
  {
    id: 'test-oil',
    name: 'Cooking Oil (Test)',
    sku: 'TST-OIL-001',
    barcode: '8901000002',
    category: 'Groceries',
    description: 'Refined cooking oil sold by volume',
    trackInventory: true,
    baseUnit: 'Liter' as any,
    baseUnitId: 'liter',
    packaging: [{ name: 'Liter', quantity: 1, purchasePrice: 400, salePrice: 0 }],
    stockQuantity: 2000,
    lowStockThreshold: 100,
    status: 'in-stock',
    createdAt: '2026-07-01',
    updatedAt: '2026-07-01',
    sellingUnits: [
      { id: 'su-oil-100ml', name: '100ml Bottle', unitId: 'liter', quantity: 0.1, salePrice: 60, isDefault: false },
      { id: 'su-oil-250ml', name: '250ml Bottle', unitId: 'liter', quantity: 0.25, salePrice: 140, isDefault: false },
      { id: 'su-oil-500ml', name: '500ml Bottle', unitId: 'liter', quantity: 0.5, salePrice: 250, isDefault: false },
      { id: 'su-oil-1l', name: '1 Liter', unitId: 'liter', quantity: 1, salePrice: 450, isDefault: true },
    ],
    purchaseConfig: { unitId: 'liter', quantity: 1, cost: 400 },
  } as Product,
  {
    id: 'test-fabric',
    name: 'Cotton Fabric (Test)',
    sku: 'TST-FAB-001',
    barcode: '8901000003',
    category: 'Groceries',
    description: 'Cotton fabric sold by length',
    trackInventory: true,
    baseUnit: 'Meter' as any,
    baseUnitId: 'meter',
    packaging: [{ name: 'Meter', quantity: 1, purchasePrice: 150, salePrice: 0 }],
    stockQuantity: 10000,
    lowStockThreshold: 100,
    status: 'in-stock',
    createdAt: '2026-07-01',
    updatedAt: '2026-07-01',
    sellingUnits: [
      { id: 'su-fab-1m', name: '1 Meter', unitId: 'meter', quantity: 1, salePrice: 250, isDefault: true },
      { id: 'su-fab-2m', name: '2 Meters', unitId: 'meter', quantity: 2, salePrice: 480, isDefault: false },
      { id: 'su-fab-5m', name: '5 Meters', unitId: 'meter', quantity: 5, salePrice: 1100, isDefault: false },
      { id: 'su-fab-10m', name: '10 Meters', unitId: 'meter', quantity: 10, salePrice: 2000, isDefault: false },
    ],
    purchaseConfig: { unitId: 'meter', quantity: 1, cost: 150 },
  } as Product,
)
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

// ─── Manual inventory adjustment ──
export function addInventoryTransaction(data: {
  productId: string
  type: 'adjustment' | 'damage' | 'consumption'
  quantity: number
  notes?: string
}): InventoryTransaction | null {
  const product = getProductById(data.productId)
  if (!product) return null
  if (data.quantity === 0) return null

  const txn: InventoryTransaction = {
    id: `txn-man-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    productId: data.productId,
    type: data.type,
    quantity: data.quantity,
    unit: product.baseUnit,
    date: new Date().toISOString().split('T')[0],
    reference: `${data.type.toUpperCase().slice(0, 4)}-${String(Date.now()).slice(-6)}`,
    notes: data.notes || `Manual ${data.type}`,
    user: 'Dr. Ahmed',
    runningBalance: 0,
  }

  allTransactions.push(txn)

  // Update product stock
  product.stockQuantity += data.quantity
  if (product.stockQuantity <= 0) {
    product.status = 'out-of-stock'
  } else if (product.stockQuantity <= product.lowStockThreshold) {
    product.status = 'low-stock'
  } else {
    product.status = 'in-stock'
  }

  return txn
}
