import type { PaymentMethod } from '@/types'
import type { CartState } from '@/domain/transactions/types'
import type {
  ExecuteResult,
} from '@/domain/transactions/engine'
import {
  executeTransaction,
  TransactionValidationError,
} from '@/domain/transactions/engine'
import type { TransactionStrategy } from '@/domain/transactions/strategies/types'
import type { TransactionCreated, TransactionCompleted } from '@/domain/events/types'
import type { EventBus } from './event-bus'

export class TransactionOrchestrator {
  constructor(private eventBus: EventBus) {}

  execute(
    strategy: TransactionStrategy,
    cart: CartState,
    payment: { method: PaymentMethod; amount: number },
    date: string,
    createdBy: string,
  ): ExecuteResult {
    const result = executeTransaction({
      strategy,
      cart,
      payment,
      date,
      createdBy,
    })

    const createdEvent: Omit<TransactionCreated, 'type' | 'timestamp'> = {
      transaction: result.transaction,
    }
    this.eventBus.emit('TransactionCreated', createdEvent)

    if (result.inventoryEffects.length > 0) {
      this.eventBus.emit('InventoryEffectRequested', {
        effects: result.inventoryEffects,
        transactionId: result.transaction.id,
      })
    }

    if (result.financialEffect && result.financialEffect.amount > 0) {
      this.eventBus.emit('FinancialEffectRequested', {
        effect: result.financialEffect,
        transactionId: result.transaction.id,
      })
    }

    const completedEvent: Omit<TransactionCompleted, 'type' | 'timestamp'> = {
      transaction: result.transaction,
      receipt: result.receipt,
    }
    this.eventBus.emit('TransactionCompleted', completedEvent)

    return result
  }
}
