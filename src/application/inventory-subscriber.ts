import type { EventBus } from './event-bus'
import type { InventoryStore } from './stores'
import type { InventoryEffectRequested, InventoryUpdated } from '@/domain/events/types'

export class InventorySubscriber {
  constructor(
    private eventBus: EventBus,
    private store: InventoryStore,
  ) {
    this.eventBus.on('InventoryEffectRequested', this.handleEffectRequested.bind(this))
  }

  private handleEffectRequested(event: InventoryEffectRequested): void {
    for (const effect of event.effects) {
      this.store.applyEffect(effect)
    }

    const updatedEvent: Omit<InventoryUpdated, 'type' | 'timestamp'> = {
      productIds: event.effects.map((e) => e.productId),
      transactionId: event.transactionId,
    }
    this.eventBus.emit('InventoryUpdated', updatedEvent)
  }
}
