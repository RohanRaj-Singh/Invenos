import type { TransactionStrategy } from './types'
import type { ProductInfo } from '@/domain/products/types'
import { mockProducts } from '@/data/inventory'
import { filterPOSProducts } from '@/data/pos'
import { purchaseBills } from '@/data/purchases'
import { validateCart } from '../validation'
import { itemsRequiredRule, partyRequiredRule } from '../validation'
import { generateInvoiceRef } from '../reference'
import { getUnit } from '@/lib/units'

function productToInfo(p: typeof mockProducts[number]): ProductInfo {
  return {
    id: p.id, name: p.name, sku: p.sku, category: p.category,
    baseUnitId: p.baseUnitId,
    sellingUnits: p.sellingUnits.map((su) => ({
      id: su.id, name: su.name, quantity: su.quantity, salePrice: su.salePrice,
    })),
    purchaseConfig: p.purchaseConfig ? {
      unitId: p.purchaseConfig.unitId, quantity: p.purchaseConfig.quantity,
      cost: p.purchaseConfig.cost, name: p.purchaseConfig.name,
    } : null,
  }
}

const CACHED_PRODUCTS = mockProducts.map(productToInfo)

export const purchaseReturnStrategy: TransactionStrategy = {
  type: 'purchase-return',

  getInventoryMultiplier: () => -1,
  getInventoryTransactionType: () => 'return',
  getInventoryEffects(tx) {
    return tx.items
      .filter((item) => item.restock !== false)
      .map((item) => ({
        productId: item.productId,
        quantity: -item.baseQuantity,
        type: 'return',
        reference: tx.invoiceRef,
      }))
  },

  getFinancialDirection: () => 'in',
  getFinancialTransactionType: () => 'refund',
  getFinancialEffect(tx) {
    if (tx.amountPaid <= 0) return null
    return {
      direction: 'in' as const,
      type: 'refund',
      amount: tx.amountPaid,
      method: tx.paymentMethod ?? 'cash',
      partyId: tx.partyId ?? 'ct-001',
      reference: tx.invoiceRef,
    }
  },

  requiresParty: () => true,
  getDefaultParty: () => null,
  getPartyRole: () => 'supplier',

  generateInvoiceRef: () => generateInvoiceRef('PRET', purchaseBills.length + 1),
  getInvoicePrefix: () => 'PRET',
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
      transactionType: 'purchase-return' as const,
    }
  },

  getDefaultUnit(product) {
    if (!product.purchaseConfig) return null
    return {
      id: 'purchase-pack',
      name: product.purchaseConfig.name ?? 'Purchase Pack',
      quantity: product.purchaseConfig.quantity,
    }
  },
  getAvailableUnits(product) {
    if (!product.purchaseConfig) return []
    return [{
      id: 'purchase-pack',
      name: product.purchaseConfig.name ?? 'Purchase Pack',
      quantity: product.purchaseConfig.quantity,
    }]
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
    return filterPOSProducts(query, 'all').slice(0, 8).map(productToInfo)
  },

  supportsDiscount: () => false,
  supportsPerItemDiscount: () => false,
  supportsPriceOverride: () => false,
  supportsPayment: () => true,
  supportsPartialPayment: () => true,
  supportsHeldTransactions: () => false,

  getValidationRules: () => [itemsRequiredRule, partyRequiredRule],
  validate(cart) {
    return validateCart(cart, purchaseReturnStrategy)
  },

  getLabels: () => ({
    pageTitle: 'Purchase Return',
    partyLabel: 'Supplier',
    partyPlaceholder: 'Search supplier...',
    confirmTitle: 'Confirm Return',
    confirmAction: 'Process Return',
    receiptTitle: 'Return Recorded',
    receiptDetailRoute: (id: string) => `/purchases/${id}`,
    searchPlaceholder: 'Search original purchase invoice...',
    emptyCart: 'Select an invoice to begin',
    emptyCartHint: 'Search for the original purchase invoice above',
    paymentLabel: 'Refund Amount',
    recordAction: 'Process Return',
    holdAction: '',
    clearAction: 'Clear',
  }),
}
