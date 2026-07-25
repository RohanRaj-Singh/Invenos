import type { PaymentMethod } from '@/types'
import type { TransactionRecord, TransactionLineItem, CartState, InventoryEffectEntry, FinancialEffectEntry, ReceiptData } from './types'
import type { TransactionStrategy } from './strategies/types'
import {
  computeSubtotal,
  computeCartDiscount,
  computeGrandTotal,
} from './cart-domain'
import {
  clampPaidAmount,
  computeOutstanding,
  computePaymentStatus,
} from './payment-domain'
import { generateTransactionId } from './reference'
import { validateCart } from './validation'

export interface ExecuteParams {
  strategy: TransactionStrategy
  cart: CartState
  payment: {
    method: PaymentMethod
    amount: number
  }
  date: string
  createdBy: string
}

export interface ExecuteResult {
  transaction: TransactionRecord
  inventoryEffects: InventoryEffectEntry[]
  financialEffect: FinancialEffectEntry | null
  receipt: ReceiptData
}

export class TransactionValidationError extends Error {
  constructor(public readonly errors: string[]) {
    super(errors.join('; '))
    this.name = 'TransactionValidationError'
  }
}

export function executeTransaction(params: ExecuteParams): ExecuteResult {
  const { strategy, cart, payment, date, createdBy } = params

  const errors = validateCart(cart, strategy)
  if (errors.length > 0) {
    throw new TransactionValidationError(errors)
  }

  const invoiceRef = strategy.generateInvoiceRef()

  const appliedDiscount = strategy.supportsDiscount()
    ? cart.discount + computeCartDiscount(
        computeSubtotal(cart.items.map((i) => i.total)),
        cart.discountPct,
      )
    : 0

  const subtotal = computeSubtotal(cart.items.map((i) => i.total))
  const discount = appliedDiscount
  const grandTotal = computeGrandTotal(subtotal, discount)

  const paidAmount = strategy.supportsPayment()
    ? clampPaidAmount(payment.amount, grandTotal)
    : 0
  const outstanding = computeOutstanding(grandTotal, paidAmount)
  const paymentStatus = strategy.supportsPayment()
    ? computePaymentStatus(grandTotal, paidAmount)
    : 'unpaid'

  const items: TransactionLineItem[] = cart.items.map((item) => {
    const price = strategy.supportsPriceOverride()
      ? (item.priceOverride ?? item.unitPrice)
      : item.unitPrice
    return {
      id: item.id,
      productId: item.productId,
      productName: item.productName,
      sku: item.sku,
      unitId: item.unitId,
      unitName: item.unitName,
      quantity: item.quantity,
      baseUnitFactor: item.baseUnitFactor,
      baseQuantity: item.baseQuantity,
      unitPrice: price,
      total: item.quantity * price,
      discountPct: item.discountPct,
      category: item.category,
    }
  })

  const transaction: TransactionRecord = {
    id: generateTransactionId(),
    transactionType: strategy.type,
    invoiceRef,
    partyId: cart.partyId,
    partyName: cart.partyName,
    date,
    items,
    subtotal,
    discount,
    grandTotal,
    amountPaid: paidAmount,
    outstandingBalance: outstanding,
    paymentStatus,
    paymentMethod: strategy.supportsPayment() ? payment.method : null,
    createdBy,
    createdAt: new Date().toISOString(),
  }

  const inventoryEffects = strategy.getInventoryEffects(transaction)
  const financialEffect = strategy.getFinancialEffect(transaction)
  const receipt = strategy.generateReceipt(transaction)

  return { transaction, inventoryEffects, financialEffect, receipt }
}
