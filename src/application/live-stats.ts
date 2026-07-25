import type { DashboardStats } from '@/types'
import { allSales } from '@/data/sales'
import { mockProducts } from '@/data/inventory'
import { purchaseBills } from '@/data/purchases'
import { getExpenseStats } from '@/data/expenses'

export interface LiveStats extends DashboardStats {
  lastUpdated: number
}

type Listener = () => void

export class LiveStatsStore {
  current: LiveStats
  private listeners: Listener[] = []

  constructor() {
    this.current = this.compute()
  }

  recompute(): void {
    this.current = this.compute()
    for (const fn of this.listeners) fn()
  }

  subscribe(fn: Listener): number {
    this.listeners.push(fn)
    return this.listeners.length - 1
  }

  unsubscribe(id: number): void {
    this.listeners.splice(id, 1)
  }

  private compute(): LiveStats {
    const today = new Date().toISOString().split('T')[0]
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

    const todayAllSales = allSales.filter((s) => s.date === today)
    const todaySales = todayAllSales
      .filter((s) => !s.invoiceNumber.startsWith('RET-'))
      .reduce((sum, s) => sum + s.grandTotal, 0)
    const todaySaleReturns = todayAllSales
      .filter((s) => s.invoiceNumber.startsWith('RET-'))
      .reduce((sum, s) => sum + s.grandTotal, 0)

    const yestAllSales = allSales.filter((s) => s.date === yesterday)
    const yesterdaySales = yestAllSales
      .filter((s) => !s.invoiceNumber.startsWith('RET-'))
      .reduce((sum, s) => sum + s.grandTotal, 0)

    const salesTrend = yesterdaySales > 0
      ? Math.round(((todaySales - yesterdaySales) / yesterdaySales) * 100)
      : todaySales > 0 ? 100 : 0

    const todayAllPurchases = purchaseBills.filter((b) => b.date === today)
    const todayPurchases = todayAllPurchases
      .filter((b) => !b.invoiceRef.startsWith('PRET-'))
      .reduce((sum, b) => sum + b.totalAmount, 0)
    const todayPurchaseReturns = todayAllPurchases
      .filter((b) => b.invoiceRef.startsWith('PRET-'))
      .reduce((sum, b) => sum + b.totalAmount, 0)

    const netSales = todaySales - todaySaleReturns
    const netPurchases = todayPurchases - todayPurchaseReturns

    const lowStockItems = mockProducts.filter(
      (p) => p.status === 'low-stock' || p.status === 'out-of-stock'
    ).length

    const stockValue = mockProducts.reduce((sum, p) => {
      const cost = p.purchaseConfig
        ? p.purchaseConfig.cost / (p.purchaseConfig.quantity || 1)
        : 0
      return sum + p.stockQuantity * cost
    }, 0)

    const pendingPayments = allSales.reduce((sum, s) => sum + s.outstandingBalance, 0)
    const purchasePayables = purchaseBills.reduce((sum, b) => sum + b.outstandingBalance, 0)
    const expenseStats = getExpenseStats()

    return {
      todaySales,
      todaySaleReturns,
      netSales,
      todayPurchases,
      todayPurchaseReturns,
      netPurchases,
      pendingPayments: pendingPayments + purchasePayables,
      stockValue,
      lowStockItems,
      salesTrend,
      paymentsTrend: 0,
      refundsIssued: todaySaleReturns,
      refundsReceived: todayPurchaseReturns,
      todayExpenses: expenseStats.todayExpenses,
      thisMonthExpenses: expenseStats.thisMonthExpenses,
      totalExpenses: expenseStats.totalExpenses,
      lastUpdated: Date.now(),
    }
  }
}
