// ── Lightweight measurement conversion ──
// 7 common units with known conversions to their base dimension.

const KNOWN_CONVERSIONS: Record<string, { toBase: number; base: string }> = {
  KG:    { toBase: 1000, base: 'Gram' },
  Gram:  { toBase: 1, base: 'Gram' },
  Liter: { toBase: 1000, base: 'mL' },
  mL:    { toBase: 1, base: 'mL' },
  Meter: { toBase: 100, base: 'cm' },
  cm:    { toBase: 1, base: 'cm' },
  Piece: { toBase: 1, base: 'Piece' },
}

/**
 * Convert a value from one measurement unit to another.
 * Returns null if units are incompatible (different dimensions).
 *
 * @example convertMeasurement(2, 'KG', 'Gram')   → 2000
 * @example convertMeasurement(500, 'mL', 'Liter') → 0.5
 * @example convertMeasurement(1, 'KG', 'mL')      → null (incompatible)
 */
export function convertMeasurement(value: number, from: string, to: string): number | null {
  const fromConv = KNOWN_CONVERSIONS[from]
  const toConv = KNOWN_CONVERSIONS[to]
  if (!fromConv || !toConv) return null
  if (fromConv.base !== toConv.base) return null
  return (value * fromConv.toBase) / toConv.toBase
}

/**
 * Format a measurement value into its most natural representation.
 *
 * @example formatMeasurement(1000, 'Gram') → "1 KG"
 * @example formatMeasurement(250, 'Gram')  → "250 Grams"
 * @example formatMeasurement(0.5, 'Liter') → "500 mL"
 * @example formatMeasurement(1, 'KG')      → "1 KG"
 * @example formatMeasurement(5, 'Piece')   → "5 Pieces"
 */
export function formatMeasurement(value: number, unit: string): string {
  switch (unit) {
    case 'Gram':
      if (value >= 1000) {
        const kg = value / 1000
        return `${Number.isInteger(kg) ? kg : kg.toFixed(2)} KG`
      }
      return `${value} Gram${value !== 1 ? 's' : ''}`
    case 'KG':
      if (value < 1) {
        const g = value * 1000
        return `${Number.isInteger(g) ? g : g.toFixed(2)} Gram`
      }
      return `${Number.isInteger(value) ? value : value.toFixed(2)} KG`
    case 'mL':
      if (value >= 1000) {
        const l = value / 1000
        return `${Number.isInteger(l) ? l : l.toFixed(2)} Liter`
      }
      return `${value} mL`
    case 'Liter':
      if (value < 1) {
        const ml = value * 1000
        return `${Number.isInteger(ml) ? ml : ml.toFixed(2)} mL`
      }
      return `${Number.isInteger(value) ? value : value.toFixed(2)} Liter`
    case 'cm':
      if (value >= 100) {
        const m = value / 100
        return `${Number.isInteger(m) ? m : m.toFixed(2)} Meter`
      }
      return `${value} cm`
    case 'Meter':
      if (value < 1) {
        const cm = value * 100
        return `${Number.isInteger(cm) ? cm : cm.toFixed(2)} cm`
      }
      return `${Number.isInteger(value) ? value : value.toFixed(2)} Meter`
    case 'Piece':
      return `${value} Piece${value !== 1 ? 's' : ''}`
    default:
      return `${value} ${unit}`
  }
}
