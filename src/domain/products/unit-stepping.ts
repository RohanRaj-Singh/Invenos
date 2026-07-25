const SMALL_UNIT_IDS = new Set(['__custom_gram', '__custom_ml', '__custom_cm'])

export function getIncrementForUnit(unitId: string): number {
  if (SMALL_UNIT_IDS.has(unitId)) return 10
  if (unitId.startsWith('__custom_')) return 0.1
  return 1
}

export function getStepForUnit(unitId: string): string {
  return getIncrementForUnit(unitId) < 1 ? '0.1' : '1'
}
