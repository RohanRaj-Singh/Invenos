import type { TransactionStrategy } from './types'
import type { TransactionRecord, TransactionParty, ReceiptData } from '../types'
import type { ProductInfo, UnitInfo, CustomUnitOption } from '@/domain/products/types'
import { posProducts as rawProducts, filterPOSProducts } from '@/data/pos'
import { allSales } from '@/data/sales'
import { validateCart } from '../validation'
import { itemsRequiredRule } from '../validation'
import { generateInvoiceRef } from '../reference'

function productToInfo(p: typeof rawProducts[number]): ProductInfo {
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

const CACHED_PRODUCTS = rawProducts.map(productToInfo)

export const saleReturnStrategy: TransactionStrategy = {
  type: 'sale-return',

  getInventoryMultiplier: () => 1,
  getInventoryTransactionType: () => 'return',
  getInventoryEffects(tx) {
    return tx.items
      .filter((item) => item.restock !== false)
      .map((item) => ({
        productId: item.productId,
        quantity: item.baseQuantity,
        type: 'return',
        reference: tx.invoiceRef,
      }))
  },

  getFinancialDirection: () => 'out',
  getFinancialTransactionType: () => 'refund',
  getFinancialEffect(tx) {
    if (tx.amountPaid <= 0) return null
    return {
      direction: 'out' as const,
      type: 'refund',
      amount: tx.amountPaid,
      method: tx.paymentMethod!,
      partyId: tx.partyId ?? 'ct-001',
      reference: tx.invoiceRef,
    }
  },

  requiresParty: () => false,
  getDefaultParty: (): TransactionParty => ({
    id: 'cust-0', name: 'Walk-in Customer', role: 'customer', isWalkIn: true,
  }),
  getPartyRole: () => 'customer',

  generateInvoiceRef: () => generateInvoiceRef('RET', allSales.length + 1),
  getInvoicePrefix: () => 'RET',
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
      transactionType: 'sale-return' as const,
    }
  },

  getDefaultUnit(product) {
    const raw = rawProducts.find((p) => p.id === product.id)
    if (!raw) return null
    const su = raw.sellingUnits[0]
    if (!su) return null
    return { id: su.id, name: su.name, quantity: su.quantity, salePrice: su.salePrice }
  },
  getAvailableUnits(product) {
    return product.sellingUnits
  },
  getCustomUnitOptions() {
    return []
  },
  getDefaultPrice(_product, unit) {
    return unit.salePrice ?? 0
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

  getValidationRules: () => [itemsRequiredRule],
  validate(cart) {
    return validateCart(cart, saleReturnStrategy)
  },

  getLabels: () => ({
    pageTitle: 'Sale Return',
    partyLabel: 'Customer',
    partyPlaceholder: 'Search customer...',
    confirmTitle: 'Confirm Return',
    confirmAction: 'Process Return',
    receiptTitle: 'Return Recorded',
    receiptDetailRoute: (id: string) => `/sales/${id}`,
    searchPlaceholder: 'Search original invoice...',
    emptyCart: 'Select an invoice to begin',
    emptyCartHint: 'Search for the original sale invoice above',
    paymentLabel: 'Refund Amount',
    recordAction: 'Process Return',
    holdAction: '',
    clearAction: 'Clear',
  }),
}
