import type { PaymentMethod } from '@/types'

export type TransactionType =
  | 'sale'
  | 'purchase'
  | 'sale-return'
  | 'purchase-return'
  | 'opening-stock'
  | 'stock-transfer'
  | 'stock-adjustment'
  | 'manufacturing-consumption'
  | 'manufacturing-production'
  | 'damaged-goods'
  | 'physical-count'

export interface TransactionLineItem {
  id: string
  productId: string
  productName: string
  sku?: string
  unitId: string
  unitName: string
  quantity: number
  baseUnitFactor: number
  baseQuantity: number
  unitPrice: number
  total: number
  discountPct?: number
  category?: string
  /** Whether this item should be restocked in inventory (used by return strategies) */
  restock?: boolean
}

export interface TransactionRecord {
  id: string
  transactionType: TransactionType
  invoiceRef: string
  partyId: string | null
  partyName: string | null
  date: string
  items: TransactionLineItem[]
  subtotal: number
  discount: number
  grandTotal: number
  amountPaid: number
  outstandingBalance: number
  paymentStatus: 'paid' | 'partial' | 'unpaid'
  paymentMethod: PaymentMethod | null
  createdBy: string
  createdAt: string
  notes?: string
}

export interface TransactionParty {
  id: string
  name: string
  role: 'customer' | 'supplier'
  phone?: string
  isWalkIn?: boolean
}

export interface CartLineItem extends TransactionLineItem {
  priceOverride?: number
}

export interface CartState {
  items: CartLineItem[]
  partyId: string | null
  partyName: string | null
  discount: number
  discountPct: number
  paymentMethod: PaymentMethod
  amountPaid: number
}

export interface InventoryEffectEntry {
  productId: string
  quantity: number
  type: string
  reference: string
}

export interface FinancialEffectEntry {
  direction: 'in' | 'out'
  type: string
  amount: number
  method: PaymentMethod
  partyId: string
  reference: string
}

export interface ReceiptData {
  invoiceNumber: string
  transactionId: string
  items: TransactionLineItem[]
  subtotal: number
  discount: number
  grandTotal: number
  amountPaid: number
  outstanding: number
  paymentStatus: 'paid' | 'partial'
  method: PaymentMethod
  partyName: string | null
  transactionType: TransactionType
}
