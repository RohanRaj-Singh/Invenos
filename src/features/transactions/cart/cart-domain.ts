import type { CartItem } from '@/types'
import type { CartState, TransactionLineItem } from '@/domain/transactions/types'

function cartItemToLineItem(item: CartItem): TransactionLineItem {
  return {
    id: item.id,
    productId: item.productId,
    productName: item.name,
    sku: undefined,
    unitId: item.sellingUnitId ?? '',
    unitName: item.packagingName,
    quantity: item.packagingQuantity,
    baseUnitFactor: item.baseUnitQuantity,
    baseQuantity: item.baseQuantity,
    unitPrice: item.unitPrice,
    total: item.total,
    category: item.category,
  }
}

type CartItemLike = CartItem & { priceOverride?: number }

export function buildCartState(
  items: CartItemLike[],
  partyId: string | null,
  partyName: string | null,
  discount: number,
  discountPct: number,
  paymentMethod: string,
  amountPaid: number,
): CartState {
  return {
    items: items.map((item) => ({
      ...cartItemToLineItem(item),
      priceOverride: (item as any).priceOverride,
    })),
    partyId,
    partyName,
    discount,
    discountPct,
    paymentMethod: paymentMethod as any,
    amountPaid,
  }
}

export function createLineItem(
  product: { id: string; name: string; sku: string; category: string },
  unit: { id: string; name: string; quantity: number; salePrice?: number },
  quantity: number = 1,
): CartItem & { baseQuantity: number; baseUnitQuantity: number } {
  return {
    id: `ci-${Date.now()}`,
    productId: product.id,
    name: product.name,
    sellingUnitId: unit.id,
    packagingName: unit.name,
    packagingQuantity: quantity,
    baseUnitQuantity: unit.quantity,
    baseQuantity: quantity * unit.quantity,
    unitPrice: unit.salePrice ?? 0,
    total: quantity * (unit.salePrice ?? 0),
    category: product.category,
  }
}

export type { TransactionLineItem, CartState }
