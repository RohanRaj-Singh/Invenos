// ═══════════════════════════════════════════════════════════
// UNITS DOMAIN
// Canonical unit registry for all of Invenos.
// Every measurement, packaging, or quantity references a unit ID.
// ── NEVER hardcode unit strings. Use this module. ──
// ═══════════════════════════════════════════════════════════

export type MeasurementType = 'count' | 'weight' | 'volume' | 'length'

export interface UnitDefinition {
  id: string
  name: string                     // display name
  measurementType: MeasurementType
  baseFactor: number               // multiplier to convert to the canonical base for this type
  baseUnitId: string               // canonical base unit ID for this measurement type
}

// ─── Built-in units ────────────────────────────────────────

export const UNITS: Record<string, UnitDefinition> = {
  // ── Count-based ──
  piece:   { id: 'piece',   name: 'Piece',   measurementType: 'count',   baseFactor: 1,        baseUnitId: 'piece' },
  capsule: { id: 'capsule', name: 'Capsule', measurementType: 'count',   baseFactor: 1,        baseUnitId: 'piece' },
  tablet:  { id: 'tablet',  name: 'Tablet',  measurementType: 'count',   baseFactor: 1,        baseUnitId: 'piece' },
  bottle:  { id: 'bottle',  name: 'Bottle',  measurementType: 'count',   baseFactor: 1,        baseUnitId: 'piece' },
  box:     { id: 'box',     name: 'Box',     measurementType: 'count',   baseFactor: 1,        baseUnitId: 'piece' },
  strip:   { id: 'strip',   name: 'Strip',   measurementType: 'count',   baseFactor: 1,        baseUnitId: 'piece' },
  carton:  { id: 'carton',  name: 'Carton',  measurementType: 'count',   baseFactor: 1,        baseUnitId: 'piece' },
  packet:  { id: 'packet',  name: 'Packet',  measurementType: 'count',   baseFactor: 1,        baseUnitId: 'piece' },
  roll:    { id: 'roll',    name: 'Roll',    measurementType: 'count',   baseFactor: 1,        baseUnitId: 'piece' },
  inhaler:{ id: 'inhaler', name: 'Inhaler', measurementType: 'count',   baseFactor: 1,        baseUnitId: 'piece' },

  // ── Weight-based ──
  mg:      { id: 'mg',      name: 'mg',      measurementType: 'weight',  baseFactor: 1,        baseUnitId: 'mg' },
  g:       { id: 'g',       name: 'Gram',    measurementType: 'weight',  baseFactor: 1000,     baseUnitId: 'mg' },
  kg:      { id: 'kg',      name: 'KG',      measurementType: 'weight',  baseFactor: 1000000,  baseUnitId: 'mg' },

  // ── Volume-based ──
  ml:      { id: 'ml',      name: 'mL',      measurementType: 'volume',  baseFactor: 1,        baseUnitId: 'ml' },
  liter:   { id: 'liter',   name: 'Liter',   measurementType: 'volume',  baseFactor: 1000,     baseUnitId: 'ml' },

  // ── Length-based ──
  cm:      { id: 'cm',      name: 'cm',      measurementType: 'length',  baseFactor: 1,        baseUnitId: 'cm' },
  meter:   { id: 'meter',   name: 'Meter',   measurementType: 'length',  baseFactor: 100,      baseUnitId: 'cm' },
} as const

// ─── Lookup helpers ────────────────────────────────────────

export function getUnit(id: string): UnitDefinition | undefined {
  return UNITS[id]
}

export function getUnitsByType(type: MeasurementType): UnitDefinition[] {
  return Object.values(UNITS).filter((u) => u.measurementType === type)
}

export function getMeasurementType(id: string): MeasurementType | null {
  const unit = UNITS[id]
  return unit ? unit.measurementType : null
}

/**
 * Find a unit by its display name (case-insensitive).
 * Useful for backward compat when upgrading from string-based unit names.
 *
 * @example findUnitByName('KG') → UNITS.kg
 * @example findUnitByName('Gram') → UNITS.g
 */
export function findUnitByName(name: string): UnitDefinition | undefined {
  const normalized = name.trim().toLowerCase()
  return Object.values(UNITS).find(
    (u) => u.name.toLowerCase() === normalized || u.id.toLowerCase() === normalized
  )
}

// ─── Conversion ────────────────────────────────────────────

/**
 * Convert a value between two units.
 * Returns null if units are incompatible (different measurement types).
 *
 * @example convert(2, 'kg', 'g') → 2000
 * @example convert(500, 'ml', 'liter') → 0.5
 * @example convert(1, 'kg', 'ml') → null (incompatible)
 */
export function convert(value: number, fromId: string, toId: string): number | null {
  const from = UNITS[fromId]
  const to = UNITS[toId]
  if (!from || !to) return null
  if (from.baseUnitId !== to.baseUnitId) return null
  return (value * from.baseFactor) / to.baseFactor
}

// ─── Formatting ────────────────────────────────────────────

/**
 * Format a value into its most natural display string.
 * Auto-scales to larger/smaller units when appropriate.
 *
 * @example formatValue(1000, 'g') → "1 KG"
 * @example formatValue(250, 'g') → "250 Gram"
 * @example formatValue(0.5, 'liter') → "500 mL"
 */
export function formatValue(value: number, unitId: string): string {
  const unit = UNITS[unitId]
  if (!unit) return `${value} ${unitId}`

  // Count-based: show plain value with unit name
  if (unit.measurementType === 'count') {
    return `${value} ${unit.name}${value !== 1 ? 's' : ''}`
  }

  // Weight: auto-scale up/down
  if (unitId === 'g' && value >= 1000) {
    const kg = value / 1000
    return `${Number.isInteger(kg) ? kg : kg.toFixed(2)} KG`
  }
  if (unitId === 'kg' && value < 1) {
    const g = value * 1000
    return `${Number.isInteger(g) ? g : g.toFixed(2)} Gram`
  }

  // Volume: auto-scale up/down
  if (unitId === 'ml' && value >= 1000) {
    const l = value / 1000
    return `${Number.isInteger(l) ? l : l.toFixed(2)} Liter`
  }
  if (unitId === 'liter' && value < 1) {
    const ml = value * 1000
    return `${Number.isInteger(ml) ? ml : ml.toFixed(2)} mL`
  }

  // Length: auto-scale up/down
  if (unitId === 'cm' && value >= 100) {
    const m = value / 100
    return `${Number.isInteger(m) ? m : m.toFixed(2)} Meter`
  }
  if (unitId === 'meter' && value < 1) {
    const cm = value * 100
    return `${Number.isInteger(cm) ? cm : cm.toFixed(2)} cm`
  }

  const formatted = Number.isInteger(value) ? value.toString() : value.toFixed(2)
  return `${formatted} ${unit.name}`
}

/**
 * Get all units of a given type, suitable for dropdown options.
 */
export function getUnitOptions(measurementType?: MeasurementType): UnitDefinition[] {
  if (measurementType) return getUnitsByType(measurementType)
  return Object.values(UNITS)
}

/**
 * Get units grouped by measurement type, suitable for an optgroup/grouped selector.
 * Each group has a label (e.g. "Count", "Weight") and an array of options.
 */
export function getBaseUnitOptions(): { label: string; options: { value: string; label: string }[] }[] {
  const groups: { label: string; options: { value: string; label: string }[] }[] = []
  const types: MeasurementType[] = ['count', 'weight', 'volume', 'length']
  for (const type of types) {
    const units = getUnitsByType(type)
    if (units.length > 0) {
      groups.push({
        label: type.charAt(0).toUpperCase() + type.slice(1),
        options: units.map((u) => ({ value: u.id, label: u.name })),
      })
    }
  }
  return groups
}

/**
 * Get a sensible default base unit for a product category.
 * Falls back to 'piece' for unknown categories.
 */
export function getDefaultUnitForCategory(category: string): string {
  const cat = category.toLowerCase()
  if (cat.includes('medicine')) return 'capsule'
  if (cat.includes('grocery')) return 'kg'
  if (cat.includes('cosmetic') || cat.includes('skincare')) return 'piece'
  if (cat.includes('mobile') || cat.includes('electronic')) return 'piece'
  if (cat.includes('clinic')) return 'piece'
  return 'piece'
}
