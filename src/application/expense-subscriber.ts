import { EventBus } from './event-bus'
import { LiveStatsStore } from './live-stats'

export class ExpenseSubscriber {
  constructor(
    eventBus: EventBus,
    store: LiveStatsStore,
  ) {
    eventBus.on('ExpenseCreated', () => store.recompute())
    eventBus.on('ExpenseUpdated', () => store.recompute())
    eventBus.on('ExpenseDeleted', () => store.recompute())
  }
}
