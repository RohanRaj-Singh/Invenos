import type { CartState } from '../types'
import type { TransactionStrategy, ValidationRule } from '../strategies/types'

export const itemsRequiredRule: ValidationRule = {
  check(cart: CartState, _strategy: TransactionStrategy): string | null {
    if (cart.items.length === 0) return 'At least one item is required'
    return null
  },
}

export const partyRequiredRule: ValidationRule = {
  check(cart: CartState, strategy: TransactionStrategy): string | null {
    if (strategy.requiresParty() && !cart.partyId) {
      return `${strategy.getLabels().partyLabel} is required`
    }
    return null
  },
}

export const paymentRequiredRule: ValidationRule = {
  check(cart: CartState, strategy: TransactionStrategy): string | null {
    if (
      strategy.supportsPayment() &&
      !strategy.supportsPartialPayment() &&
      cart.amountPaid < 0
    ) {
      return 'Full payment is required'
    }
    return null
  },
}

export function validateCart(cart: CartState, strategy: TransactionStrategy): string[] {
  const rules = strategy.getValidationRules()
  const errors: string[] = []
  for (const rule of rules) {
    const error = rule.check(cart, strategy)
    if (error) errors.push(error)
  }
  return errors
}
