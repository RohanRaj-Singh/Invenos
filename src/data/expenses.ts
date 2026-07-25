import type { Expense, PaymentMethod } from '@/types'
import { getExpenseCategoryById, recordExpenseForCategory } from './expense-categories'

// ─── In-memory expense store ───

export let allExpenses: Expense[] = []
let nextExpNum = 1

// ─── CRUD ───

export function getExpenses(): Expense[] {
  return [...allExpenses].sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt))
}

export function getExpenseById(id: string): Expense | undefined {
  return allExpenses.find((e) => e.id === id)
}

export function getExpenseByNumber(num: string): Expense | undefined {
  return allExpenses.find((e) => e.expenseNumber === num)
}

export function addExpense(data: {
  date: string
  categoryId: string
  amount: number
  paidTo: string
  paymentMethod: PaymentMethod
  notes: string
  createdBy: string
  referenceNumber?: string
}): Expense {
  const id = `exp-${String(nextExpNum).padStart(6, '0')}`
  const cat = getExpenseCategoryById(data.categoryId)
  const now = new Date().toISOString()
  const expense: Expense = {
    id,
    expenseNumber: `EXP-${String(nextExpNum).padStart(6, '0')}`,
    date: data.date,
    categoryId: data.categoryId,
    categoryName: cat?.name || 'Unknown',
    amount: data.amount,
    paidTo: data.paidTo,
    paymentMethod: data.paymentMethod,
    referenceNumber: data.referenceNumber || '',
    notes: data.notes,
    createdBy: data.createdBy,
    createdAt: now,
    updatedAt: null,
  }
  allExpenses.unshift(expense)
  nextExpNum++

  // Update category stats
  recordExpenseForCategory(data.categoryId, data.amount)

  return expense
}

export function updateExpense(id: string, data: Partial<{
  date: string
  categoryId: string
  amount: number
  paidTo: string
  paymentMethod: PaymentMethod
  notes: string
}>): Expense | undefined {
  const idx = allExpenses.findIndex((e) => e.id === id)
  if (idx === -1) return undefined

  allExpenses[idx] = {
    ...allExpenses[idx],
    ...data,
    categoryName: data.categoryId ? (getExpenseCategoryById(data.categoryId)?.name || allExpenses[idx].categoryName) : allExpenses[idx].categoryName,
    updatedAt: new Date().toISOString(),
  }

  return allExpenses[idx]
}

export function deleteExpense(id: string): boolean {
  const idx = allExpenses.findIndex((e) => e.id === id)
  if (idx === -1) return false
  allExpenses.splice(idx, 1)
  return true
}

// ─── Helpers ───

export function getExpenseStats() {
  const all = getExpenses()
  const today = new Date().toISOString().split('T')[0]
  const thisMonth = today.slice(0, 7)
  const todayExpenses = all.filter((e) => e.date === today).reduce((s, e) => s + e.amount, 0)
  const thisMonthExpenses = all.filter((e) => e.date.startsWith(thisMonth)).reduce((s, e) => s + e.amount, 0)
  const totalExpenses = all.reduce((s, e) => s + e.amount, 0)
  const largest = all.length > 0 ? Math.max(...all.map((e) => e.amount)) : 0

  // Category spending
  const byCategory: Record<string, number> = {}
  all.forEach((e) => {
    byCategory[e.categoryName] = (byCategory[e.categoryName] || 0) + e.amount
  })
  const topCategory = Object.entries(byCategory).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'

  return {
    totalExpenses,
    todayExpenses,
    thisMonthExpenses,
    averageDaily: all.length > 0 ? totalExpenses / Math.max(1, calculateDaysSpan(all)) : 0,
    largestExpense: largest,
    topCategory,
    expenseCount: all.length,
  }
}

function calculateDaysSpan(expenses: Expense[]): number {
  if (expenses.length < 2) return 1
  const dates = expenses.map((e) => new Date(e.date).getTime()).sort()
  return Math.max(1, Math.ceil((dates[dates.length - 1] - dates[0]) / 86400000))
}
