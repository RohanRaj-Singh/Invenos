import type { CartItem, POSCustomer, HeldSale } from '@/types'

const CART_KEY = 'invenos-pos-cart'
const DISCOUNT_KEY = 'invenos-pos-discount'
const CUSTOMER_KEY = 'invenos-pos-customer'
const HELD_KEY = 'invenos-pos-held'

// ─── Cart persistence ───
export function saveCartState(cart: CartItem[], discount: number, customer: POSCustomer) {
  try {
    sessionStorage.setItem(CART_KEY, JSON.stringify(cart))
    sessionStorage.setItem(DISCOUNT_KEY, String(discount))
    sessionStorage.setItem(CUSTOMER_KEY, JSON.stringify(customer))
  } catch { /* quota exceeded — silently fail */ }
}

export function loadCartState(): { cart: CartItem[]; discount: number; customer: POSCustomer | null } | null {
  try {
    const cartRaw = sessionStorage.getItem(CART_KEY)
    const discountRaw = sessionStorage.getItem(DISCOUNT_KEY)
    const customerRaw = sessionStorage.getItem(CUSTOMER_KEY)
    if (!cartRaw) return null
    return {
      cart: JSON.parse(cartRaw) as CartItem[],
      discount: discountRaw ? parseFloat(discountRaw) : 0,
      customer: customerRaw ? JSON.parse(customerRaw) as POSCustomer : null,
    }
  } catch { return null }
}

export function clearCartState() {
  sessionStorage.removeItem(CART_KEY)
  sessionStorage.removeItem(DISCOUNT_KEY)
  sessionStorage.removeItem(CUSTOMER_KEY)
}

// ─── Held sales ───
export function getHeldSales(): HeldSale[] {
  try {
    const raw = sessionStorage.getItem(HELD_KEY)
    return raw ? JSON.parse(raw) as HeldSale[] : []
  } catch { return [] }
}

export function holdSale(sale: HeldSale) {
  const held = getHeldSales()
  held.push(sale)
  try { sessionStorage.setItem(HELD_KEY, JSON.stringify(held)) } catch { /* silently fail */ }
}

export function removeHeldSale(id: string) {
  const held = getHeldSales().filter((s) => s.id !== id)
  try { sessionStorage.setItem(HELD_KEY, JSON.stringify(held)) } catch { /* silently fail */ }
}

// ─── Cart navigation guard ───
export function warnBeforeLeave(cart: CartItem[]): boolean {
  if (cart.length === 0) return true
  // beforeunload is handled via effect in the component
  return true
}
