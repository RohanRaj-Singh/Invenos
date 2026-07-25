import type { EventBus } from './event-bus'
import type { TransactionStore } from './stores'
import type { TransactionCreated } from '@/domain/events/types'

export class TransactionSubscriber {
  constructor(
    private eventBus: EventBus,
    private store: TransactionStore,
  ) {
    this.eventBus.on('TransactionCreated', this.handleCreated.bind(this))
  }

  private handleCreated(event: TransactionCreated): void {
    this.store.save(event.transaction)
  }
}
