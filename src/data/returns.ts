import type { SaleReturn, PurchaseReturn, Sale, PurchaseBill } from '@/types'
import { allSales } from '@/data/sales'
import { purchaseBills } from '@/data/purchases'

// ── Extract Sale Returns from allSales (RET- prefix) ──

export function getSaleReturns(): SaleReturn[] {
  return allSales
    .filter((s) => s.invoiceNumber.startsWith('RET-'))
    .map((s) => ({
      id: s.id,
      returnNumber: s.invoiceNumber,
      originalInvoice: findOriginalSaleInvoice(s),
      originalSaleId: findOriginalSaleId(s),
      customerName: s.customerName || 'Walk-in Customer',
      date: s.date,
      items: s.items.map((item) => ({
        originalLineId: item.id,
        productId: item.productId,
        productName: item.name,
        unitName: item.packagingName,
        originalQty: item.packagingQuantity,
        returnedQty: item.packagingQuantity,
        refundAmount: item.total,
        reason: 'other',
        condition: 'resellable' as const,
        restock: true,
      })),
      totalRefund: s.grandTotal,
      refundMethod: 'cash',
      createdBy: s.createdBy,
    }))
    .sort((a, b) => b.date.localeCompare(a.date))
}

export function getSaleReturnById(id: string): SaleReturn | undefined {
  return getSaleReturns().find((r) => r.id === id)
}

export function getSaleReturnByNumber(ref: string): SaleReturn | undefined {
  return getSaleReturns().find((r) => r.returnNumber === ref)
}

// ── Extract Purchase Returns from purchaseBills (PRET- prefix) ──

export function getPurchaseReturns(): PurchaseReturn[] {
  return purchaseBills
    .filter((b) => b.invoiceRef.startsWith('PRET-'))
    .map((b) => ({
      id: b.id,
      returnNumber: b.invoiceRef,
      originalInvoice: findOriginalPurchaseInvoice(b),
      originalPurchaseId: findOriginalPurchaseId(b),
      supplierName: b.supplierName,
      date: b.date,
      items: b.items.map((item) => ({
        originalLineId: item.id,
        productId: item.productId,
        productName: item.productName,
        unitName: item.purchasePackName,
        originalQty: item.purchaseQuantity,
        returnedQty: item.purchaseQuantity,
        refundAmount: item.totalCost,
        reason: 'other',
        condition: 'resellable' as const,
        restock: true,
      })),
      totalRefund: b.totalAmount,
      refundMethod: 'cash',
      createdBy: b.createdBy,
    }))
    .sort((a, b) => b.date.localeCompare(a.date))
}

export function getPurchaseReturnById(id: string): PurchaseReturn | undefined {
  return getPurchaseReturns().find((r) => r.id === id)
}

export function getPurchaseReturnByNumber(ref: string): PurchaseReturn | undefined {
  return getPurchaseReturns().find((r) => r.returnNumber === ref)
}

// ── Related returns for a given sale/purchase ──

export function getReturnsForSale(saleId: string): SaleReturn[] {
  return getSaleReturns().filter((r) => r.originalSaleId === saleId)
}

export function getReturnsForPurchase(purchaseId: string): PurchaseReturn[] {
  return getPurchaseReturns().filter((r) => r.originalPurchaseId === purchaseId)
}

// ── Check if a sale/purchase has returns ──

export function hasSaleReturns(saleId: string): boolean {
  return getReturnsForSale(saleId).length > 0
}

export function hasPurchaseReturns(purchaseId: string): boolean {
  return getReturnsForPurchase(purchaseId).length > 0
}

// ── Get total returned quantity for a specific sale item ──

export function getReturnedQtyForSaleItem(saleId: string, productId: string): number {
  return getReturnsForSale(saleId).reduce((sum, ret) => {
    return sum + ret.items
      .filter((i) => i.productId === productId)
      .reduce((s, i) => s + i.returnedQty, 0)
  }, 0)
}

// ── Get total returned quantity for a specific purchase item ──

export function getReturnedQtyForPurchaseItem(purchaseId: string, productId: string): number {
  return getReturnsForPurchase(purchaseId).reduce((sum, ret) => {
    return sum + ret.items
      .filter((i) => i.productId === productId)
      .reduce((s, i) => s + i.returnedQty, 0)
  }, 0)
}

// ── Dashboard stats ──

export function getReturnStats() {
  const saleReturns = getSaleReturns()
  const purchaseReturns = getPurchaseReturns()
  const today = new Date().toISOString().split('T')[0]

  return {
    totalSaleReturns: saleReturns.length,
    totalPurchaseReturns: purchaseReturns.length,
    todaySaleReturns: saleReturns.filter((r) => r.date === today).reduce((s, r) => s + r.totalRefund, 0),
    todayPurchaseReturns: purchaseReturns.filter((r) => r.date === today).reduce((s, r) => s + r.totalRefund, 0),
    totalRefundsIssued: saleReturns.reduce((s, r) => s + r.totalRefund, 0),
    totalRefundsReceived: purchaseReturns.reduce((s, r) => s + r.totalRefund, 0),
  }
}

// ── Helper: find original invoice number from sale return ──

function findOriginalSaleInvoice(returnSale: Sale): string {
  // Sale returns reference the original sale via notes or we look at matching items
  const notes = returnSale.notes || ''
  const match = notes.match(/invoice\s*#?\s*(INV-\d+)/i)
  if (match) return match[1]

  // Fallback: find sale with matching items
  const originalSale = allSales.find(
    (s) => !s.invoiceNumber.startsWith('RET-') && s.id !== returnSale.id &&
      s.items.some((si) => returnSale.items.some((ri) => ri.productId === si.productId))
  )
  return originalSale?.invoiceNumber || 'Unknown'
}

function findOriginalSaleId(returnSale: Sale): string {
  const originalSale = allSales.find(
    (s) => !s.invoiceNumber.startsWith('RET-') && s.id !== returnSale.id &&
      s.items.some((si) => returnSale.items.some((ri) => ri.productId === si.productId))
  )
  return originalSale?.id || ''
}

function findOriginalPurchaseInvoice(returnBill: PurchaseBill): string {
  const originalBill = purchaseBills.find(
    (b) => !b.invoiceRef.startsWith('PRET-') && b.id !== returnBill.id &&
      b.items.some((bi) => returnBill.items.some((ri) => ri.productId === bi.productId))
  )
  return originalBill?.invoiceRef || 'Unknown'
}

function findOriginalPurchaseId(returnBill: PurchaseBill): string {
  const originalBill = purchaseBills.find(
    (b) => !b.invoiceRef.startsWith('PRET-') && b.id !== returnBill.id &&
      b.items.some((bi) => returnBill.items.some((ri) => ri.productId === bi.productId))
  )
  return originalBill?.id || ''
}
