export interface DashboardStats {
  todaySales: number
  pendingPayments: number
  stockValue: number
  lowStockItems: number
  salesTrend: number
  paymentsTrend: number
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
  type: 'sale' | 'payment' | 'patient' | 'purchase'
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

// ── Inventory Core ──
export type StockStatus = 'in-stock' | 'low-stock' | 'out-of-stock'
export type BaseUnit = 'Piece' | 'Gram' | 'KG' | 'ML' | 'Liter' | 'Tablet' | 'Capsule' | 'Bottle' | 'Meter' | 'Packet' | string

export interface PackagingConfig {
  name: string
  quantity: number            // how many base units this packaging contains
  purchasePrice: number        // cost per this packaging
  salePrice: number            // sale price per this packaging
  barcode?: string
  sku?: string
}

export interface Product {
  id: string; name: string; sku: string; barcode: string
  category: string; description: string; image?: string
  trackInventory: boolean
  baseUnit: BaseUnit
  packaging: PackagingConfig[]
  stockQuantity: number        // always in base units
  lowStockThreshold: number
  status: StockStatus
  createdAt: string; updatedAt: string
  supplier?: string; location?: string
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
  customerName?: string; patientId?: string
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
  customerName?: string; patientName?: string
  itemCount: number; grandTotal: number
  amountPaid: number; outstandingBalance: number; paymentStatus: PaymentStatus
}

export interface VisitWithSale extends Visit { sale?: Sale }
