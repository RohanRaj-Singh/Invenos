export function computePricePerBaseUnit(defaultPrice: number, baseUnitQuantity: number): number {
  if (baseUnitQuantity <= 0) return 0
  return defaultPrice / baseUnitQuantity
}

export function computeCustomUnitPrice(pricePerBase: number, factor: number): number {
  return Math.round(pricePerBase * factor * 100) / 100
}
