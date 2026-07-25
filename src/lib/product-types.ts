import type { ProductType } from '@/types'

export interface ProductTypeConfig {
  id: ProductType
  label: string
  description: string
  icon: string
  features: {
    allowsBom: boolean
  }
}

const PRODUCT_TYPES: Record<ProductType, ProductTypeConfig> = {
  simple: {
    id: 'simple',
    label: 'Simple Product',
    description: 'Buy and sell as-is. No special tracking needed.',
    icon: 'Package',
    features: { allowsBom: false },
  },
  composite: {
    id: 'composite',
    label: 'Composite Product',
    description: 'Made from ingredients or raw materials.',
    icon: 'Wrench',
    features: { allowsBom: true },
  },
}

export function getProductTypeConfig(type?: ProductType | null): ProductTypeConfig {
  if (type && PRODUCT_TYPES[type]) return PRODUCT_TYPES[type]
  return PRODUCT_TYPES.simple
}

export function getAllProductTypes(): ProductTypeConfig[] {
  return Object.values(PRODUCT_TYPES)
}
