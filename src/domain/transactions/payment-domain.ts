export function clampPaidAmount(rawPaid: number, grandTotal: number): number {
  return Math.min(rawPaid, grandTotal)
}

export function computeOutstanding(grandTotal: number, paidAmount: number): number {
  return Math.max(0, grandTotal - paidAmount)
}

export function computePaymentStatus(grandTotal: number, paidAmount: number): 'paid' | 'partial' {
  return computeOutstanding(grandTotal, paidAmount) === 0 ? 'paid' : 'partial'
}

export function computeChange(paid: number, grandTotal: number): number {
  return Math.max(0, paid - grandTotal)
}

export type PaymentDisplayState =
  | { type: 'change'; amount: number }
  | { type: 'outstanding'; amount: number }
  | { type: 'none' }

export function getPaymentDisplayState(paid: number, grandTotal: number): PaymentDisplayState {
  if (paid > grandTotal) {
    return { type: 'change', amount: paid - grandTotal }
  }
  if (paid > 0 && paid < grandTotal) {
    return { type: 'outstanding', amount: grandTotal - paid }
  }
  return { type: 'none' }
}
