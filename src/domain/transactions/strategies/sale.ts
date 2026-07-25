import type { TransactionStrategy } from './types'
import type { TransactionRecord, TransactionParty, ReceiptData } from '../types'
import type { ProductInfo, UnitInfo, CustomUnitOption } from '@/domain/products/types'
import { getDefaultSellingUnit } from '@/lib/product-adapter'
import { getUnit } from '@/lib/units'
import { posProducts as rawProducts, filterPOSProducts } from '@/data/pos'
import { allSales } from '@/data/sales'
import { getSalesSettings } from '@/data/settings'
import { validateCart } from '../validation'
import { itemsRequiredRule } from '../validation'
import { generateInvoiceRef } from '../reference'

function productToInfo(p: typeof rawProducts[number]): ProductInfo {
  return {
    id: p.id,
    name: p.name,
    sku: p.sku,
    category: p.category,
    baseUnitId: p.baseUnitId,
    sellingUnits: p.sellingUnits.map((su) => ({
      id: su.id,
      name: su.name,
      quantity: su.quantity,
      salePrice: su.salePrice,
    })),
    purchaseConfig: p.purchaseConfig ? {
      unitId: p.purchaseConfig.unitId,
      quantity: p.purchaseConfig.quantity,
      cost: p.purchaseConfig.cost,
      name: p.purchaseConfig.name,
    } : null,
  }
}

function createCustomUnitOptions(product: ProductInfo): CustomUnitOption[] {
  const unit = getUnit(product.baseUnitId)
  if (!unit) return []
  const bu = product.baseUnitId
  const opts: CustomUnitOption[] = []

  if (unit.measurementType === 'weight') {
    opts.push({ id: '__custom_gram', label: 'Per Gram', factor: bu === 'kg' ? 0.001 : 1 })
    opts.push({ id: '__custom_kg', label: 'Per KG', factor: bu === 'kg' ? 1 : 1000 })
  }
  if (unit.measurementType === 'volume') {
    opts.push({ id: '__custom_ml', label: 'Per mL', factor: bu === 'liter' ? 0.001 : 1 })
    opts.push({ id: '__custom_liter', label: 'Per Liter', factor: bu === 'liter' ? 1 : 1000 })
  }
  if (unit.measurementType === 'length') {
    opts.push({ id: '__custom_cm', label: 'Per cm', factor: bu === 'meter' ? 0.01 : 1 })
    opts.push({ id: '__custom_meter', label: 'Per Meter', factor: bu === 'meter' ? 1 : 100 })
  }
  return opts
}

const CACHED_PRODUCTS = rawProducts.map(productToInfo)

export const saleStrategy: TransactionStrategy = {
  type: 'sale',

  // ── Inventory ──
  getInventoryMultiplier: () => -1,
  getInventoryTransactionType: () => 'sale',
  getInventoryEffects(tx) {
    return tx.items.map((item) => ({
      productId: item.productId,
      quantity: -item.baseQuantity,
      type: 'sale',
      reference: tx.invoiceRef,
    }))
  },

  // ── Financial ──
  getFinancialDirection: () => 'in',
  getFinancialTransactionType: () => 'collection',
  getFinancialEffect(tx) {
    if (tx.amountPaid <= 0) return null
    return {
      direction: 'in' as const,
      type: 'collection',
      amount: tx.amountPaid,
      method: tx.paymentMethod!,
      partyId: tx.partyId ?? 'ct-001',
      reference: tx.invoiceRef,
    }
  },

  // ── Party ──
  requiresParty: () => false,
  getDefaultParty: (): TransactionParty => ({
    id: 'cust-0',
    name: 'Walk-in Customer',
    role: 'customer',
    isWalkIn: true,
  }),
  getPartyRole: () => 'customer',

  // ── Document ──
  generateInvoiceRef: () => {
    const prefix = getSalesSettings().invoicePrefix.replace(/-+$/, '').replace(/[^A-Z-]/gi, '') || 'INV'
    return generateInvoiceRef(prefix, allSales.length + 1)
  },
  getInvoicePrefix: () => getSalesSettings().invoicePrefix || 'INV-',
  generateReceipt(tx) {
    const paid = tx.amountPaid
    const grandTotal = tx.grandTotal
    return {
      invoiceNumber: tx.invoiceRef,
      transactionId: tx.id,
      items: tx.items,
      subtotal: tx.subtotal,
      discount: tx.discount,
      grandTotal,
      amountPaid: paid,
      outstanding: Math.max(0, grandTotal - paid),
      paymentStatus: tx.paymentStatus as 'paid' | 'partial',
      method: tx.paymentMethod ?? 'cash',
      partyName: tx.partyName,
      transactionType: 'sale' as const,
    }
  },

  // ── Product Resolution ──
  getDefaultUnit(product) {
    const raw = rawProducts.find((p) => p.id === product.id)
    if (!raw) return null
    const su = getDefaultSellingUnit(raw)
    if (!su) return null
    return { id: su.id, name: su.name, quantity: su.quantity, salePrice: su.salePrice }
  },
  getAvailableUnits(product) {
    return product.sellingUnits
  },
  getCustomUnitOptions(product) {
    return createCustomUnitOptions(product)
  },
  getDefaultPrice(_product, unit) {
    return unit.salePrice ?? 0
  },
  getAvailableProducts() {
    return CACHED_PRODUCTS
  },
  searchProducts(query) {
    const results = filterPOSProducts(query, 'all').slice(0, 8)
    return results.map(productToInfo)
  },

  // ── Capabilities ──
  supportsDiscount: () => true,
  supportsPerItemDiscount: () => true,
  supportsPriceOverride: () => true,
  supportsPayment: () => true,
  supportsPartialPayment: () => true,
  supportsHeldTransactions: () => true,

  // ── Validation ──
  getValidationRules: () => [itemsRequiredRule],
  validate(cart) {
    return validateCart(cart, saleStrategy)
  },

  // ── Labels ──
  getLabels: () => ({
    pageTitle: 'Create Sale',
    partyLabel: 'Customer',
    partyPlaceholder: 'Search customer...',
    confirmTitle: 'Confirm Sale',
    confirmAction: 'Confirm Sale',
    receiptTitle: 'Sale Successful',
    receiptDetailRoute: (id: string) => `/sales/${id}`,
    searchPlaceholder: 'Search product by name, SKU, or barcode...',
    emptyCart: 'No items yet',
    emptyCartHint: 'Search for a product above to add it to the bill',
    paymentLabel: 'Amount Received',
    recordAction: 'Record Sale',
    holdAction: 'Hold',
    clearAction: 'Clear',
  }),
}
