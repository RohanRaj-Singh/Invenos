import type { PaymentMethod } from '@/types'

// ══════════════════════════════════════════
// Application Settings — Central Store
// All modules should consume settings here
// ══════════════════════════════════════════

export interface BusinessSettings {
  businessName: string
  businessLogo: string
  address: string
  phone: string
  email: string
  website: string
  currency: string
  currencySymbol: string
  timezone: string
  dateFormat: string
  timeFormat: string
  description: string
}

export interface POSSettings {
  defaultCustomer: string
  defaultPaymentMethod: PaymentMethod
  receiptSize: '58mm' | '80mm' | 'a4'
  autoPrintReceipt: boolean
  showProductImages: boolean
  enableHoldSales: boolean
  barcodeScannerEnabled: boolean
  keyboardShortcutsEnabled: boolean
  confirmBeforeDeleting: boolean
  autoFocusBarcode: boolean
}

export interface InventorySettings {
  allowNegativeStock: boolean
  lowStockThreshold: number
  defaultStockUnit: string
  autoGenerateSKU: boolean
  barcodeFormat: string
  defaultCategory: string
  stockValuationMethod: string
}

export interface SalesSettings {
  invoicePrefix: string
  invoiceNumberFormat: string
  defaultTax: number
  defaultDiscount: number
  allowPriceOverride: boolean
  allowBackdatedSales: boolean
  roundTotals: boolean
  enableDraftSales: boolean
}

export interface PurchaseSettings {
  purchasePrefix: string
  purchaseNumberFormat: string
  autoUpdateCostPrice: boolean
  defaultSupplier: string
  allowBackdatedPurchases: boolean
  requireSupplier: boolean
}

export interface ReceiptSettings {
  headerText: string
  footerText: string
  showBusinessLogo: boolean
  printAddress: boolean
  printPhone: boolean
  printTaxNumber: boolean
  printBarcode: boolean
  printQRCode: boolean
  paperWidth: number
}

export interface AppSettings {
  business: BusinessSettings
  pos: POSSettings
  inventory: InventorySettings
  sales: SalesSettings
  purchases: PurchaseSettings
  receipt: ReceiptSettings
}

// ─── Defaults ───

const DEFAULT_SETTINGS: AppSettings = {
  business: {
    businessName: 'Invenos',
    businessLogo: '',
    address: '123 Main Street, Lahore, Pakistan',
    phone: '+92 300 1234567',
    email: 'info@invenos.com',
    website: 'https://invenos.com',
    currency: 'PKR',
    currencySymbol: 'Rs.',
    timezone: 'Asia/Karachi',
    dateFormat: 'YYYY-MM-DD',
    timeFormat: '12h',
    description: 'Cloud Inventory & POS System',
  },
  pos: {
    defaultCustomer: 'Walk-in Customer',
    defaultPaymentMethod: 'cash',
    receiptSize: '80mm',
    autoPrintReceipt: false,
    showProductImages: true,
    enableHoldSales: true,
    barcodeScannerEnabled: true,
    keyboardShortcutsEnabled: true,
    confirmBeforeDeleting: true,
    autoFocusBarcode: false,
  },
  inventory: {
    allowNegativeStock: false,
    lowStockThreshold: 10,
    defaultStockUnit: 'piece',
    autoGenerateSKU: true,
    barcodeFormat: 'CODE128',
    defaultCategory: '',
    stockValuationMethod: 'fifo',
  },
  sales: {
    invoicePrefix: 'INV-',
    invoiceNumberFormat: '{PREFIX}{NUMBER}',
    defaultTax: 0,
    defaultDiscount: 0,
    allowPriceOverride: true,
    allowBackdatedSales: false,
    roundTotals: true,
    enableDraftSales: false,
  },
  purchases: {
    purchasePrefix: 'PUR-',
    purchaseNumberFormat: '{PREFIX}{NUMBER}',
    autoUpdateCostPrice: true,
    defaultSupplier: '',
    allowBackdatedPurchases: false,
    requireSupplier: true,
  },
  receipt: {
    headerText: 'Thank you for your business!',
    footerText: 'Goods once sold will not be taken back.',
    showBusinessLogo: true,
    printAddress: true,
    printPhone: true,
    printTaxNumber: false,
    printBarcode: false,
    printQRCode: false,
    paperWidth: 80,
  },
}

// ─── In-memory settings store ───

let settings: AppSettings = structuredClone(DEFAULT_SETTINGS)
let listeners: Array<() => void> = []

export function getSettings(): AppSettings {
  return settings
}

export function getBusinessSettings(): BusinessSettings {
  return settings.business
}

export function getPOSSettings(): POSSettings {
  return settings.pos
}

export function getInventorySettings(): InventorySettings {
  return settings.inventory
}

export function getSalesSettings(): SalesSettings {
  return settings.sales
}

export function getPurchaseSettings(): PurchaseSettings {
  return settings.purchases
}

export function getReceiptSettings(): ReceiptSettings {
  return settings.receipt
}

export function updateSettings(updates: Partial<AppSettings>): AppSettings {
  settings = {
    ...settings,
    ...updates,
    business: updates.business ? { ...settings.business, ...updates.business } : settings.business,
    pos: updates.pos ? { ...settings.pos, ...updates.pos } : settings.pos,
    inventory: updates.inventory ? { ...settings.inventory, ...updates.inventory } : settings.inventory,
    sales: updates.sales ? { ...settings.sales, ...updates.sales } : settings.sales,
    purchases: updates.purchases ? { ...settings.purchases, ...updates.purchases } : settings.purchases,
    receipt: updates.receipt ? { ...settings.receipt, ...updates.receipt } : settings.receipt,
  }

  // Notify listeners
  for (const fn of listeners) fn()

  return settings
}

export function subscribeSettings(fn: () => void): () => void {
  listeners.push(fn)
  return () => {
    listeners = listeners.filter((l) => l !== fn)
  }
}

export function resetSettings(): AppSettings {
  settings = structuredClone(DEFAULT_SETTINGS)
  for (const fn of listeners) fn()
  return settings
}
