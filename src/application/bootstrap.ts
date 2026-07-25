import { EventBus } from './event-bus'
import { TransactionOrchestrator } from './transaction-orchestrator'
import { InventorySubscriber } from './inventory-subscriber'
import { FinancialSubscriber } from './financial-subscriber'
import { TransactionSubscriber } from './transaction-subscriber'
import { DashboardSubscriber } from './dashboard-subscriber'
import { ExpenseSubscriber } from './expense-subscriber'
import { LiveStatsStore } from './live-stats'
import {
  MockInventoryStore,
  MockFinancialStore,
  MockTransactionStore,
} from '@/data/store-adapters'
import type { ApplicationContext } from './context'

export function bootstrapApplication(): ApplicationContext {
  // Clear stale cart session data from previous sessions
  try {
    sessionStorage.removeItem('invenos-pos-cart')
    sessionStorage.removeItem('invenos-pos-discount')
    sessionStorage.removeItem('invenos-pos-customer')
  } catch { /* ignore */ }

  const eventBus = new EventBus()
  const inventoryStore = new MockInventoryStore()
  const financialStore = new MockFinancialStore()
  const transactionStore = new MockTransactionStore()
  const liveStats = new LiveStatsStore()

  new InventorySubscriber(eventBus, inventoryStore)
  new FinancialSubscriber(eventBus, financialStore)
  new TransactionSubscriber(eventBus, transactionStore)
  new DashboardSubscriber(eventBus, liveStats)
  new ExpenseSubscriber(eventBus, liveStats)

  const transactionOrchestrator = new TransactionOrchestrator(eventBus)

  return {
    eventBus,
    transactionOrchestrator,
    liveStats,
  }
}
