import type { InventoryEffectEntry, FinancialEffectEntry, TransactionRecord } from '@/domain/transactions/types'

export interface InventoryStore {
  applyEffect(effect: InventoryEffectEntry): void
}

export interface FinancialStore {
  recordEffect(effect: FinancialEffectEntry): void
}

export interface TransactionStore {
  save(transaction: TransactionRecord): void
}
