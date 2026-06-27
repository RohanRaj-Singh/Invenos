import type { InventoryTransaction, TransactionType, InventorySummary, Product, PackagingConfig, CartItem } from '@/types'

// ═══════════════════════════════════════════════
// UNIFIED CONVERSION ENGINE
// Every module uses these functions, never raw math
// ═══════════════════════════════════════════════

// ─── Packaging lookup ───
export function findPackaging(product: Product, packagingName: string): PackagingConfig | undefined {
  return product.packaging.find((p) => p.name.toLowerCase() === packagingName.toLowerCase())
}

export function getDefaultSalePackaging(product: Product): PackagingConfig {
  // Smallest packaging (usually the base unit itself or the smallest named packaging)
  const sorted = [...product.packaging].sort((a, b) => a.quantity - b.quantity)
  return sorted[0]
}

export function getDefaultPurchasePackaging(product: Product): PackagingConfig {
  // Largest packaging
  const sorted = [...product.packaging].sort((a, b) => b.quantity - a.quantity)
  return sorted[0]
}

// ─── Core conversions ───
export function packagingToBase(quantity: number, packaging: PackagingConfig): number {
  return quantity * packaging.quantity
}

export function baseToPackaging(quantity: number, packaging: PackagingConfig): number {
  if (packaging.quantity === 0) return quantity
  return quantity / packaging.quantity
}

export function packagingToBaseMulti(
  product: Product,
  packagingName: string,
  packagingQuantity: number
): { baseQuantity: number; packaging: PackagingConfig | undefined } {
  const pkg = findPackaging(product, packagingName)
  if (!pkg) return { baseQuantity: packagingQuantity, packaging: undefined }
  return { baseQuantity: packagingQuantity * pkg.quantity, packaging: pkg }
}

// ─── Cart item builder ───
export function buildCartItem(
  product: Product,
  packagingName: string,
  packagingQuantity: number
): CartItem | null {
  const pkg = findPackaging(product, packagingName)
  if (!pkg) return null
  const baseQuantity = packagingQuantity * pkg.quantity
  return {
    id: `ci-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    productId: product.id,
    name: product.name,
    packagingName: pkg.name,
    packagingQuantity,
    baseUnitQuantity: pkg.quantity,
    baseQuantity,
    unitPrice: pkg.salePrice,
    total: packagingQuantity * pkg.salePrice,
    category: product.category,
  }
}

// ─── Stock calculation from transactions ───
export function calculateCurrentStock(txns: InventoryTransaction[]): number {
  return txns.reduce((sum, t) => sum + t.quantity, 0)
}

export function calculateInventorySummary(txns: InventoryTransaction[]): InventorySummary {
  const byType = new Map<TransactionType, number>()
  for (const t of txns) byType.set(t.type, (byType.get(t.type) || 0) + t.quantity)
  return {
    currentStock: calculateCurrentStock(txns),
    totalPurchased: byType.get('purchase') || 0,
    totalSold: Math.abs(byType.get('sale') || 0),
    totalReturned: byType.get('return') || 0,
    totalAdjusted: Math.abs(byType.get('adjustment') || 0),
    totalDamaged: Math.abs(byType.get('damage') || 0),
    totalConsumed: Math.abs(byType.get('consumption') || 0),
    totalTransferred: Math.abs(byType.get('transfer') || 0),
    netMovement: txns.reduce((s, t) => s + Math.abs(t.quantity), 0),
    transactionCount: txns.length,
  }
}

// ─── Running balances ───
export function calculateRunningBalances(txns: InventoryTransaction[]): InventoryTransaction[] {
  const sorted = [...txns].sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id))
  let balance = 0
  return sorted.map((t) => { balance += t.quantity; return { ...t, runningBalance: balance } })
}

// ─── Stock display helpers ───
export function getStockDisplay(product: Product): { total: string; equivalents: { label: string; qty: number }[] } {
  const total = `${product.stockQuantity.toLocaleString()} ${product.baseUnit}${product.stockQuantity !== 1 ? 's' : ''}`
  const equivalents = product.packaging
    .filter((p) => p.quantity > 0)
    .map((pkg) => ({ label: pkg.name, qty: Math.floor(product.stockQuantity / pkg.quantity) }))
    .filter((e) => e.qty > 0)
  return { total, equivalents }
}

// ─── Transaction grouping ───
export function sortTransactionsByDateDesc(txns: InventoryTransaction[]): InventoryTransaction[] {
  return [...txns].sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id))
}

export function groupTransactionsByDate(txns: InventoryTransaction[]): Map<string, InventoryTransaction[]> {
  const groups = new Map<string, InventoryTransaction[]>()
  for (const txn of sortTransactionsByDateDesc(txns)) {
    const existing = groups.get(txn.date) || []
    existing.push(txn); groups.set(txn.date, existing)
  }
  return groups
}

export function getDateGroupLabel(dateStr: string): string {
  const today = new Date(2026, 5, 22)
  const date = new Date(dateStr + 'T00:00:00')
  const diffDays = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`
}

// ─── Transaction display config ───
export interface TransactionDisplayConfig { label: string; color: string; bgClass: string; inflow: boolean }
export const TRANSACTION_CONFIG: Record<TransactionType, TransactionDisplayConfig> = {
  purchase: { label:'Purchase', color:'text-blue-600 dark:text-blue-400', bgClass:'bg-blue-50 dark:bg-blue-500/10', inflow: true },
  sale: { label:'Sale', color:'text-emerald-600 dark:text-emerald-400', bgClass:'bg-emerald-50 dark:bg-emerald-500/10', inflow: false },
  return: { label:'Return', color:'text-purple-600 dark:text-purple-400', bgClass:'bg-purple-50 dark:bg-purple-500/10', inflow: true },
  adjustment: { label:'Adjustment', color:'text-amber-600 dark:text-amber-400', bgClass:'bg-amber-50 dark:bg-amber-500/10', inflow: false },
  damage: { label:'Damage', color:'text-red-600 dark:text-red-400', bgClass:'bg-red-50 dark:bg-red-500/10', inflow: false },
  consumption: { label:'Consumption', color:'text-orange-600 dark:text-orange-400', bgClass:'bg-orange-50 dark:bg-orange-500/10', inflow: false },
  transfer: { label:'Transfer', color:'text-cyan-600 dark:text-cyan-400', bgClass:'bg-cyan-50 dark:bg-cyan-500/10', inflow: false },
}

// ─── Inventory value calculation (FIFO approximation) ───
export function calculateStockValue(product: Product): number {
  // Value base units at average purchase cost across packaging
  if (product.packaging.length === 0) return product.stockQuantity * 0
  const avgCostPerBaseUnit = product.packaging.reduce((sum, p) => sum + (p.purchasePrice / p.quantity), 0) / product.packaging.length
  return product.stockQuantity * avgCostPerBaseUnit
}

// ─── Sale price per packaging ───
export function getPackagingPrice(product: Product, packagingName: string): number {
  const pkg = findPackaging(product, packagingName)
  return pkg?.salePrice || 0
}
