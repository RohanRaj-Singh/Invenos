import type { TransactionRecord, InventoryEffectEntry, FinancialEffectEntry, ReceiptData } from '../transactions/types'

interface DomainEvent {
  type: string
  timestamp: string
}

// ── Transaction Events ──

export interface TransactionCreated extends DomainEvent {
  type: 'TransactionCreated'
  transaction: TransactionRecord
}

export interface InventoryEffectRequested extends DomainEvent {
  type: 'InventoryEffectRequested'
  effects: InventoryEffectEntry[]
  transactionId: string
}

export interface FinancialEffectRequested extends DomainEvent {
  type: 'FinancialEffectRequested'
  effect: FinancialEffectEntry
  transactionId: string
}

export interface TransactionCompleted extends DomainEvent {
  type: 'TransactionCompleted'
  transaction: TransactionRecord
  receipt: ReceiptData
}

export interface TransactionValidated extends DomainEvent {
  type: 'TransactionValidated'
  transactionType: string
  errors: string[]
}

// ── Inventory Events ──

export interface InventoryUpdated extends DomainEvent {
  type: 'InventoryUpdated'
  productIds: string[]
  transactionId: string
}

export interface StockBelowThreshold extends DomainEvent {
  type: 'StockBelowThreshold'
  productId: string
  currentStock: number
  threshold: number
}

export interface StockDepleted extends DomainEvent {
  type: 'StockDepleted'
  productId: string
}

// ── Accounting Events ──

export interface PaymentRecorded extends DomainEvent {
  type: 'PaymentRecorded'
}

export interface BalanceUpdated extends DomainEvent {
  type: 'BalanceUpdated'
  partyId: string
  newBalance: number
  delta: number
}

// ── Expense Events ──

export interface ExpenseCreated extends DomainEvent {
  type: 'ExpenseCreated'
  expenseId: string
  amount: number
}

export interface ExpenseUpdated extends DomainEvent {
  type: 'ExpenseUpdated'
  expenseId: string
}

export interface ExpenseDeleted extends DomainEvent {
  type: 'ExpenseDeleted'
  expenseId: string
}

// ── Inventory Adjustment Events ──

export interface InventoryAdjusted extends DomainEvent {
  type: 'InventoryAdjusted'
  productId: string
  quantity: number
  transactionType: string
}

// ── Union Type ──

export type AppDomainEvent =
  | TransactionCreated
  | InventoryEffectRequested
  | FinancialEffectRequested
  | TransactionCompleted
  | TransactionValidated
  | InventoryUpdated
  | StockBelowThreshold
  | StockDepleted
  | PaymentRecorded
  | BalanceUpdated
  | ExpenseCreated
  | ExpenseUpdated
  | ExpenseDeleted
  | InventoryAdjusted
