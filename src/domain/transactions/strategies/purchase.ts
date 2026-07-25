import type { TransactionStrategy } from './types'
import type { ProductInfo } from '@/domain/products/types'
import { mockProducts } from '@/data/inventory'
import { filterPOSProducts } from '@/data/pos'
import { purchaseBills } from '@/data/purchases'
import { getPurchaseSettings } from '@/data/settings'
import { validateCart } from '../validation'
import { itemsRequiredRule, partyRequiredRule } from '../validation'
import { generateInvoiceRef } from '../reference'
import { getUnit } from '@/lib/units'

function productToInfo(p: typeof mockProducts[number]): ProductInfo {
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

const CACHED_PRODUCTS = mockProducts.map(productToInfo)

export const purchaseStrategy: TransactionStrategy = {
  type: 'purchase',

  // ── Inventory ──
  getInventoryMultiplier: () => 1,
  getInventoryTransactionType: () => 'purchase',
  getInventoryEffects(tx) {
    return tx.items.map((item) => ({
      productId: item.productId,
      quantity: item.baseQuantity,
      type: 'purchase',
      reference: tx.invoiceRef,
    }))
  },

  // ── Financial ──
  getFinancialDirection: () => 'out',
  getFinancialTransactionType: () => 'payout',
  getFinancialEffect(tx) {
    if (tx.amountPaid <= 0) return null
    return {
      direction: 'out' as const,
      type: 'payout',
      amount: tx.amountPaid,
      method: tx.paymentMethod ?? 'cash',
      partyId: tx.partyId ?? 'ct-001',
      reference: tx.invoiceRef,
    }
  },

  // ── Party ──
  requiresParty: () => true,
  getDefaultParty: () => null,
  getPartyRole: () => 'supplier',

  // ── Document ──
  generateInvoiceRef: () => {
    const prefix = getPurchaseSettings().purchasePrefix.replace(/-+$/, '').replace(/[^A-Z-]/gi, '') || 'PUR'
    return generateInvoiceRef(prefix, purchaseBills.length + 1)
  },
  getInvoicePrefix: () => getPurchaseSettings().purchasePrefix || 'PUR-',
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
      transactionType: 'purchase' as const,
    }
  },

  // ── Product Resolution ──
  getDefaultUnit(product) {
    if (!product.purchaseConfig) return null
    return {
      id: 'purchase-pack',
      name: product.purchaseConfig.name ?? 'Purchase Pack',
      quantity: product.purchaseConfig.quantity,
    }
  },
  getAvailableUnits(product) {
    const units: Array<{ id: string; name: string; quantity: number }> = []
    if (product.purchaseConfig) {
      units.push({
        id: 'purchase-pack',
        name: product.purchaseConfig.name ?? 'Purchase Pack',
        quantity: product.purchaseConfig.quantity,
      })
    }
    units.push({ id: product.baseUnitId, name: product.baseUnitId, quantity: 1 })
    return units
  },
  getCustomUnitOptions(product) {
    return getUnit(product.baseUnitId)
      ? (() => {
          const unit = getUnit(product.baseUnitId)!
          const bu = product.baseUnitId
          const opts: any[] = []
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
        })()
      : []
  },
  getDefaultPrice(product) {
    return product.purchaseConfig?.cost ?? 0
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
  supportsPerItemDiscount: () => false,
  supportsPriceOverride: () => true,
  supportsPayment: () => true,
  supportsPartialPayment: () => true,
  supportsHeldTransactions: () => false,

  // ── Validation ──
  getValidationRules: () => [itemsRequiredRule, partyRequiredRule],
  validate(cart) {
    return validateCart(cart, purchaseStrategy)
  },

  // ── Labels ──
  getLabels: () => ({
    pageTitle: 'New Purchase',
    partyLabel: 'Supplier',
    partyPlaceholder: 'Search supplier...',
    confirmTitle: 'Confirm Purchase',
    confirmAction: 'Record Purchase',
    receiptTitle: 'Purchase Recorded',
    receiptDetailRoute: (id: string) => `/purchases/${id}`,
    searchPlaceholder: 'Search product by name or SKU...',
    emptyCart: 'Cart is empty',
    emptyCartHint: 'Search for products to add to the purchase',
    paymentLabel: 'Amount Paid',
    recordAction: 'Record Purchase',
    holdAction: 'Save Draft',
    clearAction: 'Clear',
  }),
}
