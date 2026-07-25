export function generateInvoiceRef(prefix: string, sequence: number): string {
  return `${prefix}-${String(1000 + sequence).slice(-3)}`
}

export function generateTransactionId(): string {
  return `txn-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}
