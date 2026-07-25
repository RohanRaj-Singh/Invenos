import type { PaymentMethod } from '@/types'
import type {
  TransactionType,
  TransactionRecord,
  TransactionParty,
  CartState,
  InventoryEffectEntry,
  FinancialEffectEntry,
  ReceiptData,
} from '../types'
import type { ProductInfo, UnitInfo, CustomUnitOption } from '@/domain/products/types'

// ── Labels ──

export interface TransactionLabels {
  pageTitle: string
  partyLabel: string
  partyPlaceholder: string
  confirmTitle: string
  confirmAction: string
  receiptTitle: string
  receiptDetailRoute: (id: string) => string
  searchPlaceholder: string
  emptyCart: string
  emptyCartHint: string
  paymentLabel: string
  recordAction: string
  holdAction: string
  clearAction: string
}

// ── Focused Interfaces ──

export interface InventoryStrategy {
  getInventoryMultiplier(): -1 | 1 | 0
  getInventoryTransactionType(): string
  getInventoryEffects(tx: TransactionRecord): InventoryEffectEntry[]
}

export interface FinancialStrategy {
  getFinancialDirection(): 'in' | 'out' | 'none'
  getFinancialTransactionType(): string | null
  getFinancialEffect(tx: TransactionRecord): FinancialEffectEntry | null
}

export interface PartyStrategy {
  requiresParty(): boolean
  getDefaultParty(): TransactionParty | null
  getPartyRole(): 'customer' | 'supplier' | null
}

export interface DocumentStrategy {
  generateInvoiceRef(): string
  getInvoicePrefix(): string
  generateReceipt(tx: TransactionRecord): ReceiptData
}

export interface ProductResolutionStrategy {
  getDefaultUnit(product: ProductInfo): UnitInfo | null
  getAvailableUnits(product: ProductInfo): UnitInfo[]
  getCustomUnitOptions(product: ProductInfo): CustomUnitOption[]
  getDefaultPrice(product: ProductInfo, unit: UnitInfo): number
  getAvailableProducts(): ProductInfo[]
  searchProducts(query: string): ProductInfo[]
}

export interface TransactionCapabilities {
  supportsDiscount(): boolean
  supportsPerItemDiscount(): boolean
  supportsPriceOverride(): boolean
  supportsPayment(): boolean
  supportsPartialPayment(): boolean
  supportsHeldTransactions(): boolean
}

export interface TransactionValidation {
  getValidationRules(): ValidationRule[]
  validate(cart: CartState): string[]
}

// ── Composite Strategy ──

export interface TransactionStrategy extends
  InventoryStrategy,
  FinancialStrategy,
  PartyStrategy,
  DocumentStrategy,
  ProductResolutionStrategy,
  TransactionCapabilities,
  TransactionValidation
{
  readonly type: TransactionType
  getLabels(): TransactionLabels
}

// ── Validation ──

export interface ValidationRule {
  check(cart: CartState, strategy: TransactionStrategy): string | null
}
