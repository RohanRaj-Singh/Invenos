import type { FinancialTransaction, Contact, FinancialTxnType, PaymentMethod } from '@/types'
import { allSales } from './sales'
import { allPayments } from './sales'
import { mockContacts } from './contacts'
import { mockPatients } from './clinic'

// ─── CENTRAL FINANCIAL TRANSACTION STORE ───
// This is the SINGLE source of truth for all money movement.
// Everything else (ledger views, cached balances) is derived from this.

export let financialTransactions: FinancialTransaction[] = []
let nextRef = 1000

// ─── Initialize from existing data ───
export function initFinancialTransactions() {
  const fts: FinancialTransaction[] = []
  let idx = 0

  // 1. Opening balances for all contacts
  for (const contact of mockContacts) {
    if (contact.openingBalance !== 0) {
      idx++
      fts.push({
        id: `ft-${String(idx).padStart(3, '0')}`,
        contactId: contact.id,
        direction: contact.balanceType === 'receivable' ? 'in' : 'out',
        type: 'adjustment',
        date: contact.createdAt,
        amount: contact.openingBalance,
        method: 'cash',
        reference: 'OPENING',
        description: 'Opening balance',
        createdBy: 'System',
        createdAt: contact.createdAt,
      })
    }
  }

  // 2. Invoice entries from sales — matched to contacts by name
  for (const sale of allSales) {
    const contact = findContactForSale(sale)
    if (!contact) continue
    idx++
    fts.push({
      id: `ft-${String(idx).padStart(3, '0')}`,
      contactId: contact.id,
      direction: 'in',
      type: 'invoice',
      date: sale.date,
      amount: sale.grandTotal,
      method: 'cash',
      reference: sale.invoiceNumber,
      description: `Sale — ${sale.items.length} item(s)`,
      linkedSaleId: sale.id,
      createdBy: sale.createdBy,
      createdAt: sale.date,
    })

    // 3. Payments for this sale
    const salePayments = allPayments.filter((p) => p.saleId === sale.id)
    for (const payment of salePayments) {
      idx++
      fts.push({
        id: `ft-${String(idx).padStart(3, '0')}`,
        contactId: contact.id,
        direction: 'in',
        type: 'collection',
        date: payment.date,
        amount: payment.amount,
        method: payment.method,
        reference: payment.reference,
        description: `Payment received`,
        linkedSaleId: sale.id,
        createdBy: 'System',
        createdAt: payment.date,
      })
    }
  }

  financialTransactions = fts
  nextRef = 2000
  syncBalances()
}

// ─── Find contact for a sale ───
function findContactForSale(sale: { customerName?: string; patientId?: string }): Contact | undefined {
  if (sale.patientId) {
    const byContactId = mockContacts.find((c) => c.id === sale.patientId)
    if (byContactId) return byContactId
    const byPatientContactId = mockPatients.find((p) => p.id === sale.patientId)
    if (byPatientContactId?.contactId) return mockContacts.find((c) => c.id === byPatientContactId.contactId)
  }
  if (sale.customerName) {
    const name = sale.customerName.toLowerCase()
    return mockContacts.find(
      (c) => name.includes(c.name.toLowerCase().split(' ')[0]?.toLowerCase() || '')
    )
  }
  return undefined
}

// ─── Add a new transaction (the ONLY way to record money movement) ───
export function addTransaction(data: {
  contactId: string; direction: 'in' | 'out'; type: FinancialTxnType
  date: string; amount: number; method: PaymentMethod
  description?: string; linkedSaleId?: string; createdBy?: string
}): FinancialTransaction {
  nextRef++
  const ft: FinancialTransaction = {
    id: `ft-${String(financialTransactions.length + 1).padStart(3, '0')}`,
    contactId: data.contactId,
    direction: data.direction,
    type: data.type,
    date: data.date,
    amount: data.amount,
    method: data.method,
    reference: `TXN-${nextRef}`,
    description: data.description,
    linkedSaleId: data.linkedSaleId,
    createdBy: data.createdBy || 'System',
    createdAt: new Date().toISOString().split('T')[0],
  }
  financialTransactions.push(ft)
  syncBalances()
  updateSaleAmounts(ft.linkedSaleId)
  return ft
}

// ─── Sync cached Contact.currentBalance from transactions ───
function syncBalances() {
  const balanceMap = new Map<string, number>()

  for (const ft of financialTransactions) {
    const impact = getBalanceImpact(ft)
    balanceMap.set(ft.contactId, (balanceMap.get(ft.contactId) || 0) + impact)
  }

  for (const contact of mockContacts) {
    const computed = balanceMap.get(contact.id) || 0
    if (contact.currentBalance !== computed) {
      contact.currentBalance = computed // self-healing
    }
  }
}

// ─── Compute balance impact of a transaction ───
function getBalanceImpact(t: FinancialTransaction): number {
  switch (t.type) {
    case 'invoice':
      return t.amount // invoice increases what customer owes
    case 'collection':
      return -t.amount // payment decreases what customer owes
    case 'advance':
      return -t.amount // advance deposit decreases what customer owes (credit)
    case 'refund':
      return -t.amount // refund decreases what customer owes
    case 'adjustment':
      return t.direction === 'out' ? t.amount : -t.amount
    case 'payout':
      return t.amount // payout increases what customer owes
    default:
      return t.direction === 'in' ? -t.amount : t.amount
  }
}

// ─── Update cached Sale.amountPaid ───
function updateSaleAmounts(saleId?: string) {
  if (!saleId) return
  const payments = financialTransactions.filter(
    (t) => t.linkedSaleId === saleId && t.direction === 'in'
  )
  const amountPaid = payments.reduce((sum, t) => sum + t.amount, 0)
  const sale = allSales.find((s) => s.id === saleId)
  if (sale) {
    sale.amountPaid = amountPaid
    sale.outstandingBalance = Math.max(0, sale.grandTotal - amountPaid)
    sale.paymentStatus = sale.outstandingBalance === 0 ? 'paid' : amountPaid > 0 ? 'partial' : 'unpaid'
  }
}

// ─── Compute current balance for a contact ───
export function computeContactBalance(contactId: string): number {
  return financialTransactions
    .filter((t) => t.contactId === contactId)
    .reduce((sum, t) => sum + getBalanceImpact(t), 0)
}

// ─── Query helpers ───
export function getContactTransactions(contactId: string): FinancialTransaction[] {
  return financialTransactions.filter((t) => t.contactId === contactId)
}

export function getTransactionStats() {
  const today = new Date(2026, 5, 22).toISOString().split('T')[0]
  const todayTxns = financialTransactions.filter((t) => t.date === today)
  const receivedToday = todayTxns.filter((t) => t.direction === 'in').reduce((s, t) => s + t.amount, 0)
  const paidToday = todayTxns.filter((t) => t.direction === 'out').reduce((s, t) => s + t.amount, 0)
  const outstanding = allSales.reduce((s, sale) => s + sale.outstandingBalance, 0)
  const availableCredit = mockContacts
    .filter((c) => c.currentBalance < 0)
    .reduce((s, c) => s + Math.abs(c.currentBalance), 0)

  return {
    totalCount: financialTransactions.length,
    receivedToday,
    paidToday,
    netCashFlow: receivedToday - paidToday,
    outstanding,
    availableCredit,
    totalIn: financialTransactions.filter((t) => t.direction === 'in').reduce((s, t) => s + t.amount, 0),
    totalOut: financialTransactions.filter((t) => t.direction === 'out').reduce((s, t) => s + t.amount, 0),
  }
}

// ─── Derive ledger view from transactions (computed, not stored) ───
export interface LedgerViewRow {
  id: string
  date: string
  reference: string
  description: string
  debit: number
  credit: number
  runningBalance: number
  type: string
  method?: string
  contactId: string
}

export function getLedgerView(contactId: string): LedgerViewRow[] {
  const txns = financialTransactions
    .filter((t) => t.contactId === contactId)
    .sort((a, b) => a.date.localeCompare(b.date) || a.createdAt.localeCompare(b.createdAt))

  let balance = 0
  return txns.map((t) => {
    const { debit, credit } = toDebitCredit(t)
    balance += debit - credit
    return {
      id: t.id,
      date: t.date,
      reference: t.reference,
      description: t.description || '',
      debit,
      credit,
      runningBalance: balance,
      type: t.type,
      method: t.method,
      contactId: t.contactId,
    }
  })
}

function toDebitCredit(t: FinancialTransaction): { debit: number; credit: number } {
  const impact = getBalanceImpact(t)
  if (impact >= 0) return { debit: impact, credit: 0 }
  return { debit: 0, credit: Math.abs(impact) }
}

// ─── Type display config ───
export const FT_TYPE_CONFIG: Record<string, { label: string; color: string }> = {
  invoice: { label: 'Invoice', color: 'text-blue-600' },
  collection: { label: 'Collection', color: 'text-emerald-600' },
  advance: { label: 'Advance', color: 'text-purple-600' },
  refund: { label: 'Refund', color: 'text-red-600' },
  adjustment: { label: 'Adjustment', color: 'text-amber-600' },
  payout: { label: 'Payout', color: 'text-orange-600' },
}

// ─── Initialize on load ───
initFinancialTransactions()
