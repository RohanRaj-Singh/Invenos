import type { PurchaseBill } from '@/types'

export const purchaseBills: PurchaseBill[] = []

export function addPurchaseBill(bill: PurchaseBill) {
  purchaseBills.unshift(bill)
}

export function getPurchaseBill(id: string): PurchaseBill | undefined {
  return purchaseBills.find(b => b.id === id)
}
