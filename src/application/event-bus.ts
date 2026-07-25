import type { AppDomainEvent } from '@/domain/events/types'

type EventHandler<T> = (event: T) => void

export class EventBus {
  private handlers = new Map<string, EventHandler<any>[]>()

  on<T extends AppDomainEvent>(
    type: T['type'],
    handler: EventHandler<T>,
  ): void {
    const list = this.handlers.get(type) ?? []
    list.push(handler)
    this.handlers.set(type, list)
  }

  emit<T extends AppDomainEvent>(
    type: T['type'],
    payload: Omit<T, 'type' | 'timestamp'>,
  ): void {
    const event = {
      type,
      timestamp: new Date().toISOString(),
      ...payload,
    } as T

    for (const handler of this.handlers.get(type) ?? []) {
      handler(event)
    }
  }

  off<T extends AppDomainEvent>(
    type: T['type'],
    handler: EventHandler<T>,
  ): void {
    const list = this.handlers.get(type) ?? []
    this.handlers.set(
      type,
      list.filter((h) => h !== handler),
    )
  }

  clear(): void {
    this.handlers.clear()
  }
}
