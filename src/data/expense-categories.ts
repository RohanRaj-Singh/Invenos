import type { ExpenseCategory } from '@/types'
import { allExpenses } from './expenses'

const DEFAULT_CATEGORIES: Omit<ExpenseCategory, 'expenseCount' | 'totalSpent' | 'lastUsed'>[] = [
  { id: 'exp-cat-01', name: 'Rent', description: 'Office, shop, or storage rent payments', color: '#ef4444', icon: 'Building2', active: true },
  { id: 'exp-cat-02', name: 'Electricity', description: 'Electricity bills and utility charges', color: '#f59e0b', icon: 'Zap', active: true },
  { id: 'exp-cat-03', name: 'Water', description: 'Water supply and utility bills', color: '#3b82f6', icon: 'Droplets', active: true },
  { id: 'exp-cat-04', name: 'Internet', description: 'Internet and phone bills', color: '#8b5cf6', icon: 'Wifi', active: true },
  { id: 'exp-cat-05', name: 'Salaries', description: 'Employee salaries and wages', color: '#06b6d4', icon: 'Users', active: true },
  { id: 'exp-cat-06', name: 'Fuel', description: 'Fuel for vehicles and generators', color: '#ec4899', icon: 'Fuel', active: true },
  { id: 'exp-cat-07', name: 'Transport', description: 'Logistics and transportation costs', color: '#f97316', icon: 'Truck', active: true },
  { id: 'exp-cat-08', name: 'Packaging', description: 'Packaging materials and supplies', color: '#14b8a6', icon: 'Package', active: true },
  { id: 'exp-cat-09', name: 'Repairs & Maintenance', description: 'Equipment and property maintenance', color: '#6366f1', icon: 'Wrench', active: true },
  { id: 'exp-cat-10', name: 'Cleaning', description: 'Cleaning supplies and services', color: '#a855f7', icon: 'SprayCan', active: true },
  { id: 'exp-cat-11', name: 'Office Supplies', description: 'Stationery and office consumables', color: '#0ea5e9', icon: 'NotebookPen', active: true },
  { id: 'exp-cat-12', name: 'Marketing', description: 'Advertising and promotional activities', color: '#e11d48', icon: 'Megaphone', active: true },
  { id: 'exp-cat-13', name: 'Miscellaneous', description: 'Other business expenses', color: '#78716c', icon: 'Ellipsis', active: true },
  { id: 'exp-cat-14', name: 'Medical Supplies', description: 'Medical consumables and equipment', color: '#10b981', icon: 'Pill', active: true },
  { id: 'exp-cat-15', name: 'Equipment', description: 'Equipment purchase and leasing', color: '#64748b', icon: 'Monitor', active: true },
]

let categories: ExpenseCategory[] = DEFAULT_CATEGORIES.map((c) => ({
  ...c,
  expenseCount: 0,
  totalSpent: 0,
  lastUsed: null,
}))

export function getExpenseCategories(): ExpenseCategory[] {
  return categories
}

export function getActiveExpenseCategories(): ExpenseCategory[] {
  return categories.filter((c) => c.active)
}

export function getExpenseCategoryById(id: string): ExpenseCategory | undefined {
  return categories.find((c) => c.id === id)
}

export function addExpenseCategory(cat: Omit<ExpenseCategory, 'expenseCount' | 'totalSpent' | 'lastUsed'>): ExpenseCategory {
  const newCat: ExpenseCategory = { ...cat, expenseCount: 0, totalSpent: 0, lastUsed: null }
  categories.push(newCat)
  return newCat
}

export function updateExpenseCategory(id: string, updates: Partial<ExpenseCategory>): ExpenseCategory | undefined {
  const idx = categories.findIndex((c) => c.id === id)
  if (idx === -1) return undefined
  categories[idx] = { ...categories[idx], ...updates }
  return categories[idx]
}

export function archiveExpenseCategory(id: string): boolean {
  const cat = categories.find((c) => c.id === id)
  if (!cat) return false
  cat.active = false
  return true
}

export function recordExpenseForCategory(categoryId: string, amount: number) {
  const cat = categories.find((c) => c.id === categoryId)
  if (!cat) return
  cat.expenseCount++
  cat.totalSpent += amount
  cat.lastUsed = new Date().toISOString().split('T')[0]
}

export function refreshCategoryStats() {
  // Reset all
  categories.forEach((c) => { c.expenseCount = 0; c.totalSpent = 0; c.lastUsed = null })
  // Recompute from expenses
  for (const exp of allExpenses) {
    const cat = categories.find((c) => c.id === exp.categoryId)
    if (cat) {
      cat.expenseCount++
      cat.totalSpent += exp.amount
      if (!cat.lastUsed || exp.date > cat.lastUsed) cat.lastUsed = exp.date
    }
  }
}
