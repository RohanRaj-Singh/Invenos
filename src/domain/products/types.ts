export interface UnitInfo {
  id: string
  name: string
  quantity: number
  salePrice?: number
}

export interface ProductInfo {
  id: string
  name: string
  sku: string
  category: string
  baseUnitId: string
  sellingUnits: UnitInfo[]
  purchaseConfig?: {
    unitId: string
    quantity: number
    cost: number
    name?: string
  } | null
}

export interface CustomUnitOption {
  id: string
  label: string
  factor: number
}
