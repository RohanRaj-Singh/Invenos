import type { EventBus } from './event-bus'
import type { LiveStatsStore } from './live-stats'
import type { TransactionCompleted, InventoryUpdated, InventoryAdjusted } from '@/domain/events/types'

export class DashboardSubscriber {
  constructor(
    eventBus: EventBus,
    store: LiveStatsStore,
  ) {
    eventBus.on('TransactionCompleted', () => store.recompute())
    eventBus.on('InventoryUpdated', () => store.recompute())
    eventBus.on('InventoryAdjusted', () => store.recompute())
  }
}
