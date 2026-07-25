import type { InventoryEffectEntry, FinancialEffectEntry, TransactionRecord } from '@/domain/transactions/types'
import { allTransactions, getProductById } from '@/data/inventory'
import { addTransaction } from '@/data/financial-transactions'
import { allSales } from '@/data/sales'
import { addPurchaseBill } from '@/data/purchases'
import type { InventoryStore, FinancialStore, TransactionStore } from '@/application/stores'
import type { Sale, PurchaseBill } from '@/types'

export class MockInventoryStore implements InventoryStore {
  applyEffect(effect: InventoryEffectEntry): void {
    const product = getProductById(effect.productId)
    if (!product || !product.trackInventory) return

    const baseQty = effect.quantity
    allTransactions.push({
      id: `txn-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      productId: effect.productId,
      type: effect.type as any,
      quantity: baseQty,
      unit: product.baseUnit,
      date: new Date().toISOString().split('T')[0],
      reference: effect.reference,
      notes: `Transaction: ${effect.type} — ${effect.reference}`,
      user: 'System',
      runningBalance: product.stockQuantity + baseQty,
    })

    product.stockQuantity += baseQty

    if (product.stockQuantity <= 0) {
      product.status = 'out-of-stock'
    } else if (product.stockQuantity <= product.lowStockThreshold) {
      product.status = 'low-stock'
    } else {
      product.status = 'in-stock'
    }
  }
}

export class MockFinancialStore implements FinancialStore {
  recordEffect(effect: FinancialEffectEntry): void {
    addTransaction({
      contactId: effect.partyId || 'ct-001',
      direction: effect.direction,
      type: effect.type as any,
      date: new Date().toISOString().split('T')[0],
      amount: effect.amount,
      method: effect.method,
      description: `${effect.type} — ${effect.reference}`,
      createdBy: 'System',
    })
  }
}

export class MockTransactionStore implements TransactionStore {
  save(record: TransactionRecord): void {
    if (record.transactionType === 'purchase' || record.transactionType === 'purchase-return') {
      addPurchaseBill({
        id: record.id,
        invoiceRef: record.invoiceRef,
        supplierId: record.partyId ?? '',
        supplierName: record.partyName ?? '',
        date: record.date,
        items: record.items.map((item) => ({
          id: item.id,
          productId: item.productId,
          productName: item.productName,
          baseUnitId: item.unitId,
          baseUnitName: item.unitName,
          purchasePackName: item.unitName,
          purchasePackQty: item.baseUnitFactor,
          purchaseQuantity: item.quantity,
          unitCost: item.unitPrice,
          totalCost: item.total,
        })),
        subtotal: record.subtotal,
        totalAmount: record.grandTotal,
        amountPaid: record.amountPaid,
        outstandingBalance: record.outstandingBalance,
        paymentStatus: record.paymentStatus,
        status: record.transactionType === 'purchase' ? 'received' : 'received',
        createdBy: record.createdBy,
        createdAt: record.createdAt,
      })
    } else {
      const isReturn = record.transactionType === 'sale-return' || record.transactionType === 'purchase-return'
      allSales.push({
        id: record.id,
        invoiceNumber: record.invoiceRef,
        source: isReturn ? 'pos' : 'pos',
        date: record.date,
        customerId: record.partyId ?? undefined,
        customerName: record.partyName ?? undefined,
        items: record.items.map((item) => ({
          id: item.id,
          productId: item.productId,
          name: item.productName,
          sellingUnitId: item.unitId,
          packagingName: item.unitName,
          packagingQuantity: item.quantity,
          baseUnitQuantity: item.baseUnitFactor,
          baseQuantity: item.baseQuantity,
          unitPrice: item.unitPrice,
          total: item.total,
          category: item.category ?? '',
        })),
        subtotal: record.subtotal,
        discount: record.discount,
        grandTotal: record.grandTotal,
        amountPaid: record.amountPaid,
        outstandingBalance: record.outstandingBalance,
        paymentStatus: record.paymentStatus as 'paid' | 'partial',
        createdBy: record.createdBy,
        notes: record.notes ?? (isReturn ? `Return for invoice` : undefined),
      })
    }
  }
}
