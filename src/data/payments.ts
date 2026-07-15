import type { Payment, Sale } from '@/types'
import { allPayments, allSales } from './sales'

export { allPayments, allSales }

export function getPaymentById(id: string): Payment | undefined {
  return allPayments.find((p) => p.id === id)
}

export function getPaymentsForSale(saleId: string): Payment[] {
  return allPayments.filter((p) => p.saleId === saleId)
}

export function getSaleForPayment(payment: Payment): Sale | undefined {
  return allSales.find((s) => s.id === payment.saleId)
}

export function getOutstandingInvoices(): Sale[] {
  return allSales.filter((s) => s.paymentStatus !== 'paid')
}

export function getPaymentStats() {
  const totalIn = allPayments.reduce((s, p) => s + p.amount, 0)
  const outstandingTotal = allSales.reduce((s, sale) => s + sale.outstandingBalance, 0)
  const byMethod = new Map<string, number>()
  for (const p of allPayments) {
    byMethod.set(p.method, (byMethod.get(p.method) || 0) + p.amount)
  }
  return { totalPayments: allPayments.length, totalIn, outstandingTotal, byMethod }
}
