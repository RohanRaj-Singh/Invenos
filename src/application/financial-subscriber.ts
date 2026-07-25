import type { EventBus } from './event-bus'
import type { FinancialStore } from './stores'
import type { FinancialEffectRequested, PaymentRecorded } from '@/domain/events/types'

export class FinancialSubscriber {
  constructor(
    private eventBus: EventBus,
    private store: FinancialStore,
  ) {
    this.eventBus.on('FinancialEffectRequested', this.handleEffectRequested.bind(this))
  }

  private handleEffectRequested(event: FinancialEffectRequested): void {
    if (event.effect.amount <= 0) return

    this.store.recordEffect(event.effect)

    const recordedEvent: Omit<PaymentRecorded, 'type' | 'timestamp'> = {}
    this.eventBus.emit('PaymentRecorded', recordedEvent)
  }
}
