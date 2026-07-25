export interface DashboardStats {
  todaySales: number
  todaySaleReturns: number
  netSales: number
  todayPurchases: number
  todayPurchaseReturns: number
  netPurchases: number
  pendingPayments: number
  stockValue: number
  lowStockItems: number
  salesTrend: number
  paymentsTrend: number
  refundsIssued: number
  refundsReceived: number
  todayExpenses: number
  thisMonthExpenses: number
  totalExpenses: number
}

export interface QuickAction {
  id: string
  label: string
  description: string
  icon: string
  href: string
  color: string
}

export interface ActivityEvent {
  id: string
  type: 'sale' | 'payment' | 'patient' | 'purchase' | 'return' | 'refund' | 'expense'
  title: string
  description: string
  timeAgo: string
  timestamp: Date
  amount?: number
}

export interface NavItem {
  label: string
  href: string
  icon: string
  badge?: number
  children?: { label: string; href: string }[]
}

export interface ModuleItem {
  label: string
  href: string
  icon: string
  description: string
}

// ── Contact / Unified CRM ──
export type ContactType = 'person' | 'organization'
export type ContactRole = 'customer' | 'supplier' | 'patient' | 'doctor' | 'employee' | 'vendor' | 'referrer' | 'insurance'

export interface Contact {
  id: string
  type: ContactType
  roles: ContactRole[]
  name: string
  companyName?: string
  contactPerson?: string
  phone: string
  email: string
  cnic?: string
  address: string
  openingBalance: number
  balanceType: 'receivable' | 'payable'
  currentBalance: number       // source of truth: positive = owes us, negative = we owe them
  notes?: string
  createdAt: string
  updatedAt: string
  lastActivity?: string
}

export interface ContactTransaction {
  id: string
  contactId: string
  type: 'sale' | 'purchase' | 'payment_in' | 'payment_out' | 'return'
  date: string
  amount: number
  reference: string
  description: string
}

export interface ContactPayment {
  id: string
  contactId: string
  direction: 'in' | 'out'
  date: string
  amount: number
  method: PaymentMethod
  reference: string
  notes?: string
}

// ── Patient / Clinic ──
export interface Patient {
  id: string; contactId?: string; name: string; phone: string; address: string
  gender: 'male' | 'female'; age: number; registrationDate: string
  bloodGroup?: string; avatar?: string; lastVisit?: string
}

export interface Visit {
  id: string; patientId: string; visitDate: string; type: string; doctor: string
  diagnosis: string; notes: string; consultationFee: number
  status: 'completed' | 'follow-up' | 'scheduled'; saleId: string | null
}

export interface Treatment {
  id: string; patientId: string; name: string; description: string
  startDate: string; endDate?: string; doctor: string
  status: 'ongoing' | 'completed' | 'planned'; progress: number
}

export interface Prescription {
  id: string; patientId: string; medicine: string; dosage: string
  frequency: string; duration: string; prescribedBy: string; date: string
  notes?: string; refillable: boolean
}

// ── Product Types (scalable, extensible) ──
export type ProductType = 'simple' | 'composite'

// ── Inventory Core ──
export type StockStatus = 'in-stock' | 'low-stock' | 'out-of-stock'

/** @deprecated Use unit IDs from the units domain instead. Kept for backward compat. */
export type BaseUnit = 'Piece' | 'Gram' | 'KG' | 'ML' | 'Liter' | 'Tablet' | 'Capsule' | 'Bottle' | 'Meter' | 'Packet' | string

/** @deprecated Use SellingUnit instead. Kept for backward compat during migration. */
export interface PackagingConfig {
  name: string
  quantity: number            // how many base units this packaging contains
  purchasePrice: number        // cost per this packaging
  salePrice: number            // sale price per this packaging
  barcode?: string
  sku?: string
}

/** @deprecated Use Ingredient instead. Kept for backward compat. */
export interface ProductIngredient {
  productId: string
  quantity: number
}

// ── NEW: Purchase Config ──
export interface PurchaseConfig {
  /** Unit ID (e.g. 'carton', 'box', 'kg', 'meter') describing the purchase packaging. */
  unitId: string
  /** How many inventory/base units per purchase. */
  quantity: number
  /** Cost per purchase unit (Rs.). */
  cost: number
  /** Display name override (e.g. "50 KG Bag", "Carton of 100"). */
  name?: string
}

// ── NEW: Selling Unit ──
export interface SellingUnit {
  id: string
  /** Display name: "Strip", "1kg Pack", "500ml Bottle", "Single" */
  name: string
  /** References the inventory/base unit (e.g. 'capsule', 'g', 'ml'). */
  unitId: string
  /** How many inventory/base units this selling unit contains. */
  quantity: number
  /** Sale price for this selling unit (Rs.). */
  salePrice: number
  barcode?: string
  sku?: string
  /** Which selling unit shows first at POS. */
  isDefault: boolean
}

// ── NEW: Ingredient (replaces ProductIngredient) ──
export interface Ingredient {
  productId: string
  quantity: number
  /** Unit ID for the ingredient quantity — can differ from ingredient product's base unit. */
  unitId: string
}

// ── NEW: Product (updated model) ──
export interface Product {
  id: string
  name: string
  sku: string
  barcode: string
  category: string
  description: string
  image?: string
  productType?: ProductType      // defaults to 'simple' when unset

  // ── NEW FIELDS ──
  /** The atomic unit for inventory tracking. Always required. References units domain. */
  baseUnitId: string
  /** How the business buys this product. Optional. */
  purchaseConfig?: PurchaseConfig
  /** How customers buy this product. At least 1 required. */
  sellingUnits: SellingUnit[]
  /** Ingredients for manufactured products. */
  ingredients?: Ingredient[]

  // ── OLD FIELDS (kept for backward compat during migration) ──
  /** @deprecated Use baseUnitId instead. */
  baseUnit: BaseUnit
  /** @deprecated Use sellingUnits instead. */
  packaging: PackagingConfig[]

  // ── STOCK ──
  trackInventory: boolean
  stockQuantity: number        // always in base units
  lowStockThreshold: number
  status: StockStatus

  // ── METADATA ──
  supplier?: string
  location?: string
  createdAt: string
  updatedAt: string
}

export interface PackagingSuggestion {
  name: string; quantity: number; productCount: number
}

// ── Inventory Transactions ──
export type TransactionType = 'purchase' | 'sale' | 'return' | 'adjustment' | 'damage' | 'consumption' | 'transfer'

export interface InventoryTransaction {
  id: string; productId: string; type: TransactionType
  quantity: number             // in base units
  unit: string                 // base unit name
  packagingName?: string
  packagingQuantity?: number   // how many of that packaging
  date: string; reference: string; notes?: string; user: string
  runningBalance: number
}

export interface InventorySummary {
  currentStock: number; totalPurchased: number; totalSold: number
  totalReturned: number; totalAdjusted: number; totalDamaged: number
  totalConsumed: number; totalTransferred: number
  netMovement: number; transactionCount: number
}

export type InventoryMovement = InventoryTransaction

export interface ProductPurchase {
  id: string; productId: string; date: string; supplier: string
  packagingName: string; packagingQuantity: number
  quantity: number             // in base units
  unitCost: number             // per packaging
  totalCost: number
  invoiceRef: string; status: 'received' | 'pending' | 'cancelled'
}

export interface ProductCategory {
  id: string; name: string; productCount: number; industry: string
}

// ── Cart / POS ──
export interface CartItem {
  id: string; productId: string; name: string
  sellingUnitId?: string         // references SellingUnit.id for accurate sale tracking
  packagingName: string
  packagingQuantity: number    // how many of the selected packaging
  baseUnitQuantity: number     // how many base units in 1 of this packaging (the quantity from PackagingConfig)
  baseQuantity: number         // total base units = packagingQuantity * baseUnitQuantity
  unitPrice: number            // price per packaging option
  total: number; category: string
}

export interface POSCustomer {
  id: string; name: string; phone: string
}

export type PaymentMethod = 'cash' | 'card' | 'transfer' | 'easypaisa' | 'jazzcash'

export type FinancialTxnType = 'invoice' | 'collection' | 'advance' | 'refund' | 'adjustment' | 'payout'

export interface FinancialTransaction {
  id: string
  contactId: string
  direction: 'in' | 'out'
  type: FinancialTxnType
  date: string
  amount: number
  method: PaymentMethod
  reference: string
  description?: string
  linkedSaleId?: string
  createdBy: string
  createdAt: string
}

// DEPRECATED — kept for backward compat during migration
export type LedgerEntryType = 'invoice' | 'payment' | 'advance' | 'refund' | 'adjustment' | 'write_off' | 'credit_note'
export interface LedgerEntry {
  id: string; contactId: string; type: LedgerEntryType; date: string
  reference: string; description: string; debit: number; credit: number
  runningBalance: number; method?: PaymentMethod; linkedSaleId?: string
  createdBy: string; createdAt: string
}
export interface Payment { id: string; saleId: string; date: string; amount: number; method: PaymentMethod; reference: string; notes?: string }
export interface ContactTransaction { id: string; contactId: string; type: 'sale' | 'purchase' | 'payment_in' | 'payment_out' | 'return'; date: string; amount: number; reference: string; description: string }
export interface ContactPayment { id: string; contactId: string; direction: 'in' | 'out'; date: string; amount: number; method: PaymentMethod; reference: string; notes?: string }

export interface HeldSale {
  id: string
  customer: POSCustomer
  items: CartItem[]
  discount: number
  subtotal: number
  grandTotal: number
  heldAt: string
}

// ── Sale ──
export type SaleSource = 'pos' | 'clinic' | 'manual'
export type PaymentStatus = 'paid' | 'partial' | 'unpaid'

export interface Sale {
  id: string; invoiceNumber: string; source: SaleSource; date: string
  customerId?: string; customerName?: string; patientId?: string
  items: CartItem[]
  subtotal: number; discount: number; grandTotal: number
  amountPaid: number; outstandingBalance: number; paymentStatus: PaymentStatus
  createdBy: string; notes?: string
}

export interface Payment {
  id: string; saleId: string; date: string; amount: number
  method: PaymentMethod; reference: string; notes?: string
}

export interface SaleSummary {
  id: string; invoiceNumber: string; source: SaleSource; date: string
  customerId?: string; customerName?: string; patientName?: string
  itemCount: number; grandTotal: number
  amountPaid: number; outstandingBalance: number; paymentStatus: PaymentStatus
}

export interface VisitWithSale extends Visit { sale?: Sale }

// ── Purchase Module ──

export interface PurchaseBill {
  id: string
  invoiceRef: string
  supplierId: string
  supplierName: string
  date: string
  items: PurchaseBillItem[]
  subtotal: number
  totalAmount: number
  amountPaid: number
  outstandingBalance: number
  paymentStatus: 'paid' | 'partial' | 'unpaid'
  status: 'received' | 'pending'
  notes?: string
  createdBy: string
  createdAt: string
}

export interface PurchaseBillItem {
  id: string
  productId: string
  productName: string
  baseUnitId: string
  baseUnitName: string
  purchasePackName: string
  purchasePackQty: number      // base units per purchase pack (from purchaseConfig)
  purchaseQuantity: number     // how many packs bought
  unitCost: number             // cost per pack
  totalCost: number            // unitCost × purchaseQuantity
}

// ── Return Module ──

export interface ReturnItem {
  originalLineId: string
  productId: string
  productName: string
  unitName: string
  originalQty: number
  returnedQty: number
  refundAmount: number
  reason: string
  condition: 'resellable' | 'damaged' | 'expired'
  restock: boolean
}

export interface SaleReturn {
  id: string
  returnNumber: string
  originalInvoice: string
  originalSaleId: string
  customerName: string
  date: string
  items: ReturnItem[]
  totalRefund: number
  refundMethod: string
  createdBy: string
}

export interface PurchaseReturn {
  id: string
  returnNumber: string
  originalInvoice: string
  originalPurchaseId: string
  supplierName: string
  date: string
  items: ReturnItem[]
  totalRefund: number
  refundMethod: string
  createdBy: string
}

// ── Expense Module ──

export interface ExpenseCategory {
  id: string
  name: string
  description: string
  color: string
  icon: string
  active: boolean
  expenseCount: number
  totalSpent: number
  lastUsed: string | null
}

export interface Expense {
  id: string
  expenseNumber: string
  date: string
  categoryId: string
  categoryName: string
  amount: number
  paidTo: string
  paymentMethod: PaymentMethod
  referenceNumber: string
  notes: string
  createdBy: string
  createdAt: string
  updatedAt: string | null
}
