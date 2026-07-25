// ═══════════════════════════════════════════════════════════
// PRODUCT ADAPTER
// Bridges the NEW product model (sellingUnits, baseUnitId)
// and the OLD model (packaging, baseUnit).
//
// All POS code continues to work unchanged because
// packaging is derived from sellingUnits via derivePackaging().
// ═══════════════════════════════════════════════════════════

import type { Product, PackagingConfig, SellingUnit } from '@/types'
import { UNITS } from './units'

// ─── Packaging derivation ──────────────────────────────────

/**
 * Derives legacy PackagingConfig[] from the new sellingUnits model.
 * This lets all POS code continue to work without changes.
 *
 * Each selling unit becomes a PackagingConfig with:
 *   - purchasePrice calculated from purchaseConfig (or 0 if no purchase config)
 *   - salePrice from the selling unit
 */
export function derivePackaging(product: Product): PackagingConfig[] {
  return product.sellingUnits.map((su) => ({
    name: su.name,
    quantity: su.quantity,
    purchasePrice: calculateSellingUnitCost(product, su.id),
    salePrice: su.salePrice,
    barcode: su.barcode,
    sku: su.sku,
  }))
}

// ─── Cost calculation ──────────────────────────────────────

/**
 * Calculate the cost for a specific selling unit.
 * Spreads the purchase cost across base units, then multiplies by the
 * selling unit's quantity.
 *
 * @example For a product with purchaseConfig: { cost: 750, quantity: 100 }
 *          and a selling unit with quantity: 10
 *          → costPerBaseUnit = 750 / 100 = 7.5
 *          → sellingUnitCost = 7.5 * 10 = 75
 */
export function calculateSellingUnitCost(product: Product, sellingUnitId: string): number {
  const su = product.sellingUnits.find((u) => u.id === sellingUnitId)
  if (!su) return 0
  if (!product.purchaseConfig) return 0

  const costPerBaseUnit = product.purchaseConfig.cost / product.purchaseConfig.quantity
  return costPerBaseUnit * su.quantity
}

// ─── Margin calculation ────────────────────────────────────

export interface MarginResult {
  profit: number
  marginPercent: number
}

export function calculateMargin(salePrice: number, cost: number): MarginResult {
  const profit = salePrice - cost
  const marginPercent = salePrice > 0 ? (profit / salePrice) * 100 : 0
  return { profit, marginPercent }
}

// ─── Default selling unit ──────────────────────────────────

/**
 * Get the default selling unit for a product.
 * Returns the one marked isDefault, or the first one in the array.
 */
export function getDefaultSellingUnit(product: Product): SellingUnit | undefined {
  return product.sellingUnits.find((u) => u.isDefault) || product.sellingUnits[0]
}

// ─── Legacy field derivation ───────────────────────────────

/**
 * Derive the old baseUnit string from baseUnitId.
 */
export function deriveBaseUnitName(baseUnitId: string): string {
  const unit = UNITS[baseUnitId]
  return unit?.name || baseUnitId
}

/**
 * Ensure a product has both old and new fields populated.
 * If only new fields exist, derive old ones.
 * If only old fields exist (e.g. from localStorage), derive new ones.
 *
 * This is idempotent and safe to call on any product.
 */
export function ensureBackwardCompat(product: Product): Product {
  // If sellingUnits exist but packaging doesn't, derive packaging
  if (product.sellingUnits?.length > 0 && (!product.packaging || product.packaging.length === 0)) {
    product.packaging = derivePackaging(product)
  }

  // If baseUnitId exists but baseUnit doesn't, derive baseUnit
  if (product.baseUnitId && !product.baseUnit) {
    product.baseUnit = deriveBaseUnitName(product.baseUnitId) as Product['baseUnit']
  }

  // If packaging exists but sellingUnits don't, derive sellingUnits
  if (product.packaging?.length > 0 && (!product.sellingUnits || product.sellingUnits.length === 0)) {
    product.sellingUnits = product.packaging.map((pkg, idx) => ({
      id: `su-legacy-${product.id}-${idx}`,
      name: pkg.name,
      unitId: product.baseUnitId || 'piece',
      quantity: pkg.quantity,
      salePrice: pkg.salePrice,
      barcode: pkg.barcode,
      sku: pkg.sku,
      isDefault: idx === 0,
    }))
  }

  // If baseUnit exists but baseUnitId doesn't, derive baseUnitId
  if (product.baseUnit && !product.baseUnitId) {
    const name = product.baseUnit as string
    const found = Object.values(UNITS).find(
      (u) => u.name.toLowerCase() === name.toLowerCase() || u.id.toLowerCase() === name.toLowerCase()
    )
    product.baseUnitId = found?.id || 'piece'
  }

  return product
}

// ─── Phase 2: Supporting services ──────────────────────────

/**
 * Calls ensureBackwardCompat on a product after mutation.
 * Ensures baseUnit and packaging are always in sync with new fields.
 */
export function syncProduct(product: Product): void {
  ensureBackwardCompat(product)
}

/**
 * Gets the effective selling price for a given selling unit at POS.
 * Returns 0 if the selling unit is not found.
 */
export function getSellingPrice(product: Product, sellingUnitId: string): number {
  const su = product.sellingUnits.find((u) => u.id === sellingUnitId)
  return su?.salePrice ?? 0
}

/**
 * Gets all selling units formatted for POS dropdown.
 * Returns an array of { name, price, quantity } objects.
 */
export function getPosSellingOptions(product: Product): { name: string; price: number; quantity: number }[] {
  return product.sellingUnits.map((su) => ({
    name: su.name,
    price: su.salePrice,
    quantity: su.quantity,
  }))
}
