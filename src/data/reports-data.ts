import { allSales } from '@/data/sales'
import { purchaseBills } from '@/data/purchases'
import { allExpenses } from '@/data/expenses'
import { mockProducts } from '@/data/inventory'
import { allPayments } from '@/data/sales'
import { financialTransactions } from '@/data/financial-transactions'

// ─── Date Range type (matches ReportFilters) ───
export interface DateRange {
  from: string
  to: string
}

// ─── Date Helpers ───

export function filterByDateRange<T extends { date: string }>(items: T[], range: DateRange): T[] {
  return items.filter((i) => i.date >= range.from && i.date <= range.to)
}

export function sumAmount<T extends { amount?: number; grandTotal?: number; totalAmount?: number }>(items: T[]): number {
  return items.reduce((s, i) => s + (i.amount ?? i.grandTotal ?? i.totalAmount ?? 0), 0)
}

// ─── Day Book ───

export interface DayBookRow {
  date: string
  type: string
  description: string
  ref: string
  debit: number
  credit: number
}

export function getDayBook(range: DateRange): { rows: DayBookRow[]; totalDebit: number; totalCredit: number } {
  const rows: DayBookRow[] = []

  // Sales
  for (const s of filterByDateRange(allSales, range)) {
    if (s.invoiceNumber.startsWith('RET-')) {
      rows.push({ date: s.date, type: 'Sale Return', description: `Return ${s.invoiceNumber} — ${s.customerName || 'Walk-in'}`, ref: s.invoiceNumber, debit: 0, credit: s.grandTotal })
    } else {
      rows.push({ date: s.date, type: 'Sale', description: `Sale ${s.invoiceNumber} — ${s.customerName || 'Walk-in'}`, ref: s.invoiceNumber, debit: s.grandTotal, credit: 0 })
    }
  }

  // Purchases
  for (const b of filterByDateRange(purchaseBills, range)) {
    if (b.invoiceRef.startsWith('PRET-')) {
      rows.push({ date: b.date, type: 'Purchase Return', description: `Return ${b.invoiceRef} — ${b.supplierName}`, ref: b.invoiceRef, debit: b.totalAmount, credit: 0 })
    } else {
      rows.push({ date: b.date, type: 'Purchase', description: `Purchase ${b.invoiceRef} — ${b.supplierName}`, ref: b.invoiceRef, debit: 0, credit: b.totalAmount })
    }
  }

  // Expenses
  for (const e of filterByDateRange(allExpenses, range)) {
    rows.push({ date: e.date, type: 'Expense', description: `${e.categoryName} — ${e.paidTo || 'N/A'}`, ref: e.expenseNumber, debit: 0, credit: e.amount })
  }

  // Payments
  for (const p of filterByDateRange(allPayments, range)) {
    rows.push({ date: p.date, type: 'Payment', description: `Payment ${p.reference}`, ref: p.reference, debit: p.amount, credit: 0 })
  }

  rows.sort((a, b) => a.date.localeCompare(b.date))

  const totalDebit = rows.reduce((s, r) => s + r.debit, 0)
  const totalCredit = rows.reduce((s, r) => s + r.credit, 0)

  return { rows, totalDebit, totalCredit }
}

// ─── Cash Flow ───

export interface CashFlowRow {
  date: string
  type: string
  description: string
  inflow: number
  outflow: number
}

export function getCashFlow(range: DateRange): { rows: CashFlowRow[]; totalIn: number; totalOut: number; openingBalance: number; closingBalance: number } {
  const rows: CashFlowRow[] = []

  // Cash inflows (sales, collections)
  for (const s of filterByDateRange(allSales, range)) {
    if (s.amountPaid > 0) {
      rows.push({ date: s.date, type: s.invoiceNumber.startsWith('RET-') ? 'Refund Out' : 'Sale', description: `${s.invoiceNumber} — ${s.customerName || 'Walk-in'}`, inflow: s.invoiceNumber.startsWith('RET-') ? 0 : s.amountPaid, outflow: s.invoiceNumber.startsWith('RET-') ? s.amountPaid : 0 })
    }
  }

  // Cash outflows (purchases, expenses)
  for (const b of filterByDateRange(purchaseBills, range)) {
    if (b.amountPaid > 0) {
      rows.push({ date: b.date, type: b.invoiceRef.startsWith('PRET-') ? 'Refund In' : 'Purchase', description: `${b.invoiceRef} — ${b.supplierName}`, inflow: b.invoiceRef.startsWith('PRET-') ? b.amountPaid : 0, outflow: b.invoiceRef.startsWith('PRET-') ? 0 : b.amountPaid })
    }
  }

  for (const e of filterByDateRange(allExpenses, range)) {
    rows.push({ date: e.date, type: 'Expense', description: `${e.categoryName} — ${e.paidTo}`, inflow: 0, outflow: e.amount })
  }

  // Financial transactions
  for (const ft of filterByDateRange(financialTransactions, range)) {
    if (ft.direction === 'in') {
      rows.push({ date: ft.date, type: ft.type, description: ft.description || ft.reference, inflow: ft.amount, outflow: 0 })
    } else {
      rows.push({ date: ft.date, type: ft.type, description: ft.description || ft.reference, inflow: 0, outflow: ft.amount })
    }
  }

  rows.sort((a, b) => a.date.localeCompare(b.date))

  const totalIn = rows.reduce((s, r) => s + r.inflow, 0)
  const totalOut = rows.reduce((s, r) => s + r.outflow, 0)

  // Compute opening balance from all transactions before range
  const earlierIn = financialTransactions.filter((ft) => ft.date < range.from).reduce((s, ft) => s + (ft.direction === 'in' ? ft.amount : 0), 0)
  const earlierOut = financialTransactions.filter((ft) => ft.date < range.from).reduce((s, ft) => s + (ft.direction === 'out' ? ft.amount : 0), 0)
  const openingBalance = earlierIn - earlierOut
  const closingBalance = openingBalance + totalIn - totalOut

  return { rows, totalIn, totalOut, openingBalance, closingBalance }
}

// ─── Profit & Loss ───

export interface PnLData {
  revenue: number
  saleReturns: number
  netRevenue: number
  cogs: number
  grossProfit: number
  totalExpenses: number
  netProfit: number
}

export function getProfitLoss(range: DateRange): PnLData {
  const sales = filterByDateRange(allSales, range)
  const purchases = filterByDateRange(purchaseBills, range)
  const expenses = filterByDateRange(allExpenses, range)

  const revenue = sales.filter((s) => !s.invoiceNumber.startsWith('RET-')).reduce((s, x) => s + x.grandTotal, 0)
  const saleReturns = sales.filter((s) => s.invoiceNumber.startsWith('RET-')).reduce((s, x) => s + x.grandTotal, 0)
  const netRevenue = revenue - saleReturns

  // COGS = purchases (rough approximation for prototype)
  const cogs = purchases.filter((b) => !b.invoiceRef.startsWith('PRET-')).reduce((s, b) => s + b.totalAmount, 0)
  const grossProfit = netRevenue - cogs

  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0)
  const netProfit = grossProfit - totalExpenses

  return { revenue, saleReturns, netRevenue, cogs, grossProfit, totalExpenses, netProfit }
}

// ─── Stock Report ───

export interface StockReportRow {
  id: string
  name: string
  sku: string
  category: string
  stock: number
  threshold: number
  status: string
  value: number
}

export function getStockReport(): StockReportRow[] {
  return mockProducts.map((p) => {
    const cost = p.purchaseConfig
      ? p.purchaseConfig.cost / (p.purchaseConfig.quantity || 1)
      : 0
    return {
      id: p.id,
      name: p.name,
      sku: p.sku,
      category: p.category,
      stock: p.stockQuantity,
      threshold: p.lowStockThreshold,
      status: p.status,
      value: Math.round(p.stockQuantity * cost),
    }
  })
}

// ─── Sales Report ───

export interface SalesReportRow {
  id: string
  invoice: string
  date: string
  customer: string
  items: number
  total: number
  paid: number
  status: string
}

export function getSalesReport(range: DateRange): SalesReportRow[] {
  return filterByDateRange(allSales, range)
    .filter((s) => !s.invoiceNumber.startsWith('RET-'))
    .map((s) => ({
      id: s.id,
      invoice: s.invoiceNumber,
      date: s.date,
      customer: s.customerName || 'Walk-in',
      items: s.items.length,
      total: s.grandTotal,
      paid: s.amountPaid,
      status: s.paymentStatus,
    }))
}

// ─── Purchase Report ───

export interface PurchaseReportRow {
  id: string
  ref: string
  date: string
  supplier: string
  items: number
  total: number
  paid: number
  status: string
}

export function getPurchaseReport(range: DateRange): PurchaseReportRow[] {
  return filterByDateRange(purchaseBills, range)
    .filter((b) => !b.invoiceRef.startsWith('PRET-'))
    .map((b) => ({
      id: b.id,
      ref: b.invoiceRef,
      date: b.date,
      supplier: b.supplierName,
      items: b.items.length,
      total: b.totalAmount,
      paid: b.amountPaid,
      status: b.paymentStatus,
    }))
}

// ─── Party Report (unified for customer/supplier statement) ───

export interface PartyTransactionRow {
  date: string
  type: string
  ref: string
  description: string
  debit: number
  credit: number
  balance: number
}

export function getPartyStatement(range: DateRange, partyName: string, partyType?: 'customer' | 'supplier'): PartyTransactionRow[] {
  const rows: PartyTransactionRow[] = []
  let balance = 0

  // Find sales matching party name (customer mode or both)
  if (!partyType || partyType === 'customer') {
    for (const s of filterByDateRange(allSales, range)) {
      if (s.customerName?.toLowerCase().includes(partyName.toLowerCase())) {
        balance += s.grandTotal
        rows.push({ date: s.date, type: s.invoiceNumber.startsWith('RET-') ? 'Sale Return' : 'Sale', ref: s.invoiceNumber, description: `${s.customerName} — ${s.items.length} items`, debit: s.invoiceNumber.startsWith('RET-') ? 0 : s.grandTotal, credit: s.invoiceNumber.startsWith('RET-') ? s.grandTotal : 0, balance })
      }
    }
  }

  // Find purchases matching party name (supplier mode or both)
  if (!partyType || partyType === 'supplier') {
    for (const b of filterByDateRange(purchaseBills, range)) {
      if (b.supplierName.toLowerCase().includes(partyName.toLowerCase())) {
        balance -= b.totalAmount
        rows.push({ date: b.date, type: b.invoiceRef.startsWith('PRET-') ? 'Purchase Return' : 'Purchase', ref: b.invoiceRef, description: `Purchase from ${b.supplierName}`, debit: b.invoiceRef.startsWith('PRET-') ? b.totalAmount : 0, credit: b.invoiceRef.startsWith('PRET-') ? 0 : b.totalAmount, balance })
        }
      }
    }

  rows.sort((a, b) => a.date.localeCompare(b.date))
  return rows
}
