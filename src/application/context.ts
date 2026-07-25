import type { EventBus } from './event-bus'
import type { TransactionOrchestrator } from './transaction-orchestrator'
import type { LiveStatsStore } from './live-stats'

export interface ApplicationContext {
  eventBus: EventBus
  transactionOrchestrator: TransactionOrchestrator
  liveStats: LiveStatsStore
}
