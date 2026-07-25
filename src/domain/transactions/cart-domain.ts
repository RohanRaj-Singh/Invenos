export function computeLineGrossTotal(quantity: number, unitPrice: number): number {
  return quantity * unitPrice
}

export function computeLineDiscount(grossTotal: number, discountPct: number): number {
  return discountPct > 0 ? Math.round(grossTotal * (discountPct / 100)) : 0
}

export function computeLineTotal(grossTotal: number, discount: number): number {
  return Math.max(0, grossTotal - discount)
}

export function computeSubtotal(lineTotals: number[]): number {
  return lineTotals.reduce((sum, t) => sum + t, 0)
}

export function computeCartDiscount(subtotal: number, percent: number): number {
  return Math.round(subtotal * (Math.min(percent, 100) / 100))
}

export function computeGrandTotal(subtotal: number, discount: number): number {
  return Math.max(0, subtotal - discount)
}
