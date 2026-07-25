import { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import {
  Plus,
  Trash2,
  Search,
  X,
  CheckCircle2,
  Pause,
  FileText,
  RotateCcw,
  Minus,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/format'
import {
  computeLineGrossTotal,
  computeLineDiscount,
  computeLineTotal,
  computeSubtotal,
  computeCartDiscount,
  computeGrandTotal,
} from '@/domain/transactions/cart-domain'
import {
  getPaymentDisplayState,
} from '@/domain/transactions/payment-domain'
import {
  computePricePerBaseUnit,
  computeCustomUnitPrice,
} from '@/domain/products/pricing'
import {
  getIncrementForUnit,
  getStepForUnit,
} from '@/domain/products/unit-stepping'
import { posProducts, filterPOSProducts } from '@/data/pos'
import { allSales } from '@/data/sales'
import { getDefaultSellingUnit } from '@/lib/product-adapter'
import { getUnit } from '@/lib/units'

// ─── Cart persistence helpers (inline pos-utils replacement) ───
const CART_KEY = 'invenos-pos-cart'
const DISCOUNT_KEY = 'invenos-pos-discount'
const CUSTOMER_KEY = 'invenos-pos-customer'
const HELD_KEY = 'invenos-pos-held'

function saveCartState(cart: CartItem[], discount: number, customer: POSCustomer) {
  try {
    sessionStorage.setItem(CART_KEY, JSON.stringify(cart))
    sessionStorage.setItem(DISCOUNT_KEY, String(discount))
    sessionStorage.setItem(CUSTOMER_KEY, JSON.stringify(customer))
  } catch { /* quota exceeded */ }
}

function loadCartState() {
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

function clearCartState() {
  sessionStorage.removeItem(CART_KEY)
  sessionStorage.removeItem(DISCOUNT_KEY)
  sessionStorage.removeItem(CUSTOMER_KEY)
}

function getHeldSales() {
  try { return JSON.parse(sessionStorage.getItem(HELD_KEY) || '[]') } catch { return [] }
}

function holdSaleItem(sale: { id: string; customer: POSCustomer; items: CartItem[]; discount: number; subtotal: number; grandTotal: number; heldAt: string }) {
  const held = getHeldSales()
  held.push(sale)
  try { sessionStorage.setItem(HELD_KEY, JSON.stringify(held)) } catch { /* skip */ }
}
import CustomerSelect from '@/features/pos/components/CustomerSelect'
import ReceiptDialog from '@/features/pos/components/ReceiptDialog'
import EditableQuantity from './components/EditableQuantity'
import { toast } from 'sonner'
import { getCurrentUserName } from '@/data/users'
import { saleStrategy } from '@/domain/transactions/strategies/sale'
import { useTransactionRecorder } from '@/features/transactions/useTransactionRecorder'
import { TransactionSearchBar } from '@/features/transactions/search/SearchBar'
import { TransactionSummary } from '@/features/transactions/cart/CartSummary'
import { PaymentPanel } from '@/features/transactions/payment/PaymentPanel'
import { ConfirmTransactionDialog } from '@/features/transactions/dialogs/ConfirmDialog'
import { ConfirmClearDialog } from '@/features/transactions/dialogs/ClearConfirmDialog'
import type { Product, CartItem, POSCustomer, PaymentMethod, SellingUnit } from '@/types'

// ─── Constants ───

const DEFAULT_CUSTOMER: POSCustomer = {
  id: 'cust-0',
  name: 'Walk-in Customer',
  phone: '',
}

const PAYMENT_METHODS: { id: PaymentMethod; label: string; color: string }[] = [
  {
    id: 'cash',
    label: 'Cash',
    color: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20',
  },
  {
    id: 'card',
    label: 'Card',
    color: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20',
  },
  {
    id: 'transfer',
    label: 'Transfer',
    color: 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20',
  },
  {
    id: 'easypaisa',
    label: 'Easypaisa',
    color: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20',
  },
  {
    id: 'jazzcash',
    label: 'JazzCash',
    color: 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20',
  },
]

// ─── Types ───

interface ReceiptData {
  invoiceNumber: string
  saleId: string
  items: CartItem[]
  subtotal: number
  discount: number
  grandTotal: number
  amountPaid: number
  outstanding: number
  paymentStatus: 'paid' | 'partial'
  method: PaymentMethod
  customer: POSCustomer
}

interface CustomUnitOption {
  id: string
  label: string
  factor: number
}

// ─── Component ───

export default function SaleBillPage() {
  // ── Core state ──
  const [cart, setCart] = useState<CartItem[]>([])
  const [customer, setCustomer] = useState<POSCustomer>(DEFAULT_CUSTOMER)
  const [discount, setDiscount] = useState(0)
  const [discountInput, setDiscountInput] = useState('')
  const [search, setSearch] = useState('')
  const [showResults, setShowResults] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash')
  const [amountPaid, setAmountPaid] = useState('')
  const [showReceipt, setShowReceipt] = useState(false)
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null)
  const [showConfirm, setShowConfirm] = useState(false)
  const [showClearConfirm, setShowClearConfirm] = useState(false)

  // Per-item overrides
  const [priceOverrides, setPriceOverrides] = useState<Record<string, number>>({})
  const [discountPcts, setDiscountPcts] = useState<Record<string, number>>({})

  // Inline editing
  const [editingPrice, setEditingPrice] = useState<string | null>(null)
  const [editingDisc, setEditingDisc] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const editInputRef = useRef<HTMLInputElement>(null)

  // Refs
  const restoredRef = useRef(false)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const resultsRef = useRef<HTMLDivElement>(null)

  // ── Transaction recorder ──
  const { record } = useTransactionRecorder()

  // ── Cart persistence ──
  useEffect(() => {
    if (restoredRef.current) return
    restoredRef.current = true
    const saved = loadCartState()
    if (saved && saved.cart.length > 0) {
      setCart(saved.cart)
      setDiscount(saved.discount)
      if (saved.customer) setCustomer(saved.customer)
    }
  }, [])

  useEffect(() => {
    saveCartState(cart, discount, customer)
  }, [cart, discount, customer])

  useEffect(() => {
    if (cart.length === 0) return
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [cart.length])

  // Focus edit input when editing
  useEffect(() => {
    if (editingPrice || editingDisc) {
      editInputRef.current?.focus()
    }
  }, [editingPrice, editingDisc])

  // Keyboard shortcut: Ctrl+Enter → open confirm
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && cart.length > 0) {
        e.preventDefault()
        setShowConfirm(true)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [cart.length])

  // ── Derived values ──
  const computedCart = useMemo(
    () =>
      cart.map((item) => {
        const price = priceOverrides[item.productId] ?? item.unitPrice
        const pctDiscount = discountPcts[item.productId] || 0
        const grossTotal = computeLineGrossTotal(item.packagingQuantity, price)
        const flatDiscount = computeLineDiscount(grossTotal, pctDiscount)
        return {
          ...item,
          unitPrice: price,
          total: computeLineTotal(grossTotal, flatDiscount),
          grossTotal,
        } as CartItem & { grossTotal: number }
      }),
    [cart, priceOverrides, discountPcts],
  )

  const subtotal = useMemo(
    () => computeSubtotal(computedCart.map((i) => i.total)),
    [computedCart],
  )

  const grandTotal = useMemo(
    () => computeGrandTotal(subtotal, discount),
    [subtotal, discount],
  )

  const sessionCount = useMemo(() => allSales.length + 1, [])

  // ── Product search ──
  const searchResults = useMemo(() => {
    if (!search.trim()) return []
    return filterPOSProducts(search, 'all').slice(0, 8)
  }, [search])

  // ── Handlers ──

  const addToCart = useCallback((product: Product) => {
    const defaultSU = getDefaultSellingUnit(product)
    if (!defaultSU) return
    setCart((prev) => {
      const existing = prev.find((c) => c.productId === product.id)
      if (existing) {
        return prev.map((c) =>
          c.productId === product.id
            ? {
                ...c,
                packagingQuantity: c.packagingQuantity + 1,
                baseQuantity: (c.packagingQuantity + 1) * defaultSU.quantity,
                total: (c.packagingQuantity + 1) * c.unitPrice,
              }
            : c,
        )
      }
      return [
        ...prev,
        {
          id: `ci-${Date.now()}`,
          productId: product.id,
          name: product.name,
          sellingUnitId: defaultSU.id,
          packagingName: defaultSU.name,
          packagingQuantity: 1,
          baseUnitQuantity: defaultSU.quantity,
          baseQuantity: defaultSU.quantity,
          unitPrice: defaultSU.salePrice,
          total: defaultSU.salePrice,
          category: product.category,
        },
      ]
    })
    setSearch('')
    setShowResults(false)
    searchInputRef.current?.focus()
  }, [])

  const updateQuantity = useCallback((productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((c) => {
          if (c.productId !== productId) return c
          const n = c.packagingQuantity + delta
          if (n <= 0) return null
          return {
            ...c,
            packagingQuantity: n,
            baseQuantity: n * c.baseUnitQuantity,
            total: n * c.unitPrice,
          }
        })
        .filter(Boolean) as CartItem[],
    )
  }, [])

  const getSellingUnits = useCallback((productId: string): SellingUnit[] => {
    const product = posProducts.find((p) => p.id === productId)
    return product?.sellingUnits ?? []
  }, [])

  const getCustomUnitOptions = useCallback(
    (productId: string): CustomUnitOption[] => {
      const product = posProducts.find((p) => p.id === productId)
      if (!product) return []
      const unit = getUnit(product.baseUnitId)
      if (!unit) return []
      const bu = product.baseUnitId
      const opts: CustomUnitOption[] = []
      if (unit.measurementType === 'weight') {
        opts.push({
          id: '__custom_gram',
          label: 'Per Gram',
          factor: bu === 'kg' ? 0.001 : 1,
        })
        opts.push({
          id: '__custom_kg',
          label: 'Per KG',
          factor: bu === 'kg' ? 1 : 1000,
        })
      }
      if (unit.measurementType === 'volume') {
        opts.push({
          id: '__custom_ml',
          label: 'Per mL',
          factor: bu === 'liter' ? 0.001 : 1,
        })
        opts.push({
          id: '__custom_liter',
          label: 'Per Liter',
          factor: bu === 'liter' ? 1 : 1000,
        })
      }
      if (unit.measurementType === 'length') {
        opts.push({
          id: '__custom_cm',
          label: 'Per cm',
          factor: bu === 'meter' ? 0.01 : 1,
        })
        opts.push({
          id: '__custom_meter',
          label: 'Per Meter',
          factor: bu === 'meter' ? 1 : 100,
        })
      }
      return opts
    },
    [],
  )

  const handleChangeUnit = useCallback(
    (productId: string, sellingUnitId: string) => {
      const product = posProducts.find((p) => p.id === productId)
      if (!product) return

      // Custom measurement unit
      if (sellingUnitId.startsWith('__custom_')) {
        const customOpts = getCustomUnitOptions(productId)
        const opt = customOpts.find((o) => o.id === sellingUnitId)
        if (!opt) return
        const defaultSU = getDefaultSellingUnit(product)
        const pricePerBase = defaultSU
          ? computePricePerBaseUnit(defaultSU.salePrice, defaultSU.quantity)
          : 0
        const unitPrice = computeCustomUnitPrice(pricePerBase, opt.factor)
        setCart((prev) =>
          prev.map((c) =>
            c.productId !== productId
              ? c
              : {
                  ...c,
                  sellingUnitId,
                  packagingName: opt.label,
                  baseUnitQuantity: opt.factor,
                  baseQuantity: c.packagingQuantity * opt.factor,
                  unitPrice,
                  total: c.packagingQuantity * unitPrice,
                },
          ),
        )
        setPriceOverrides((prev) => {
          const r = { ...prev }
          delete r[productId]
          return r
        })
        return
      }

      // Regular selling unit
      const su = product.sellingUnits.find((s) => s.id === sellingUnitId)
      if (!su) return
      setCart((prev) =>
        prev.map((c) =>
          c.productId !== productId
            ? c
            : {
                ...c,
                sellingUnitId: su.id,
                packagingName: su.name,
                baseUnitQuantity: su.quantity,
                baseQuantity: c.packagingQuantity * su.quantity,
                unitPrice: su.salePrice,
                total: c.packagingQuantity * su.salePrice,
              },
        ),
      )
      setPriceOverrides((prev) => {
        const r = { ...prev }
        delete r[productId]
        return r
      })
    },
    [getCustomUnitOptions],
  )

  const handleRemoveItem = useCallback(
    (productId: string) => {
      const item = cart.find((c) => c.productId === productId)
      setCart((prev) => prev.filter((c) => c.productId !== productId))
      setPriceOverrides((prev) => {
        const r = { ...prev }
        delete r[productId]
        return r
      })
      setDiscountPcts((prev) => {
        const r = { ...prev }
        delete r[productId]
        return r
      })
      if (item) {
        toast(`${item.name} removed`, {
          action: {
            label: 'Undo',
            onClick: () =>
              setCart((prev) => {
                // Restore item in its original position
                const idx = cart.findIndex((c) => c.productId === productId)
                const copy = [...prev]
                if (idx >= 0 && idx <= copy.length) {
                  copy.splice(idx, 0, item)
                } else {
                  copy.push(item)
                }
                return copy
              }),
          },
          duration: 4000,
        })
      }
    },
    [cart],
  )

  // ── Inline price editing ──
  const startEditPrice = useCallback(
    (productId: string, currentPrice: number) => {
      setEditingDisc(null)
      setEditingPrice(productId)
      setEditValue(String(priceOverrides[productId] ?? currentPrice))
    },
    [priceOverrides],
  )

  const commitPrice = useCallback(() => {
    if (editingPrice) {
      const val = parseFloat(editValue)
      if (!isNaN(val) && val > 0) {
        setPriceOverrides((prev) => ({ ...prev, [editingPrice]: val }))
      }
    }
    setEditingPrice(null)
    setEditValue('')
  }, [editingPrice, editValue])

  // ── Inline disc% editing ──
  const startEditDisc = useCallback(
    (productId: string) => {
      setEditingPrice(null)
      setEditingDisc(productId)
      setEditValue(String(discountPcts[productId] ?? ''))
    },
    [discountPcts],
  )

  const commitDisc = useCallback(() => {
    if (editingDisc) {
      const val = parseFloat(editValue)
      if (!isNaN(val) && val >= 0 && val <= 100) {
        setDiscountPcts((prev) => ({ ...prev, [editingDisc]: val }))
      } else if (editValue === '' || editValue === '0') {
        setDiscountPcts((prev) => {
          const r = { ...prev }
          delete r[editingDisc]
          return r
        })
      }
    }
    setEditingDisc(null)
    setEditValue('')
  }, [editingDisc, editValue])

  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (editingPrice) commitPrice()
      else if (editingDisc) commitDisc()
    }
    if (e.key === 'Escape') {
      setEditingPrice(null)
      setEditingDisc(null)
      setEditValue('')
    }
  }

  // ── Search keyboard ──
  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchResults.length > 0) {
      e.preventDefault()
      addToCart(searchResults[0])
    }
    if (e.key === 'Escape') {
      setSearch('')
      setShowResults(false)
    }
  }

  // ── Payment quick fill ──
  const handleQuickPay = useCallback(
    (type: 'full' | 'half' | 'none') => {
      if (type === 'full') setAmountPaid(String(grandTotal))
      else if (type === 'half')
        setAmountPaid(String(Math.ceil(grandTotal / 2)))
      else setAmountPaid('0')
    },
    [grandTotal],
  )

  // ── Reset ──
  const resetSale = useCallback(() => {
    setCart([])
    setDiscount(0)
    setDiscountInput('')
    setCustomer(DEFAULT_CUSTOMER)
    setPriceOverrides({})
    setDiscountPcts({})
    setAmountPaid('')
    clearCartState()
    setTimeout(() => searchInputRef.current?.focus(), 100)
  }, [])

  // ── Hold sale ──
  const handleHoldSale = useCallback(() => {
    if (cart.length === 0) return
          holdSaleItem({
      id: `held-${Date.now()}`,
      customer,
      items: [...cart],
      discount,
      subtotal,
      grandTotal,
      heldAt: new Date().toLocaleString(),
    })
    resetSale()
    toast.success('Sale held — you can resume it from POS')
  }, [cart, customer, discount, subtotal, grandTotal, resetSale])

  // ── Record Sale ──
  const handleRecordSale = useCallback(() => {
    if (cart.length === 0) return

    const today = new Date().toISOString().split('T')[0]
    const result = record({
      strategy: saleStrategy,
      items: computedCart,
      partyId: customer.id === 'cust-0' ? null : customer.id,
      partyName: customer.name,
      discount,
      discountPct: 0,
      paymentMethod,
      amountPaid,
      subtotal,
      grandTotal,
      date: today,
      createdBy: getCurrentUserName(),
    })

    setReceiptData({
      ...result.receipt,
      saleId: result.receipt.transactionId,
      customer,
      method: result.receipt.method,
      paymentStatus: result.receipt.paymentStatus,
    } as ReceiptData)
    setShowReceipt(true)
    resetSale()
  }, [
    cart,
    computedCart,
    subtotal,
    discount,
    grandTotal,
    customer,
    paymentMethod,
    amountPaid,
    record,
    resetSale,
  ])

  const handleNewSale = useCallback(() => {
    setShowReceipt(false)
    setReceiptData(null)
    resetSale()
  }, [resetSale])

  // ── Helpers for custom unit increment ──
  const getQuantityIncrement = useCallback(
    (productId: string): number => {
      const item = cart.find((c) => c.productId === productId)
      if (!item?.sellingUnitId) return 1
      return getIncrementForUnit(item.sellingUnitId)
    },
    [cart],
  )

  const getQuantityStep = useCallback(
    (productId: string): string => {
      const item = cart.find((c) => c.productId === productId)
      if (!item?.sellingUnitId) return '1'
      return getStepForUnit(item.sellingUnitId)
    },
    [cart],
  )

  // ── Render ──

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* ── Header ── */}
      <div className="px-5 py-3 border-b border-border bg-card shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center size-10 rounded-xl bg-primary/10 text-primary">
              <FileText className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-foreground leading-tight">
                  Create Sale
                </h1>
                {cart.length > 0 && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                    {cart.length} item{cart.length > 1 ? 's' : ''}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground">
                {new Date().toLocaleDateString('en-PK', {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}{' '}
                ·{' '}
                {new Date().toLocaleTimeString('en-PK', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">
              Session #{sessionCount}
            </span>
            <CustomerSelect value={customer} onChange={setCustomer} />
          </div>
        </div>
      </div>

      {/* ── Search Bar ── */}
      <TransactionSearchBar
        search={search}
        onSearchChange={setSearch}
        showResults={showResults}
        onShowResultsChange={setShowResults}
        results={searchResults}
        onAddProduct={(product) => addToCart(product as any)}
        placeholder="Search product by name, SKU, or barcode... (Enter to add)"
      />

      {/* ── Table ── */}
      <div className="flex-1 overflow-y-auto px-5 py-4">
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <Th className="w-10">#</Th>
                <Th>Product</Th>
                <Th className="w-32">Unit</Th>
                <Th className="w-24 text-center">Qty</Th>
                <Th className="w-24 text-right">Price</Th>
                <Th className="w-20 text-right">Disc%</Th>
                <Th className="w-28 text-right">Total</Th>
                <Th className="w-10" />
              </tr>
            </thead>
            <tbody>
              {cart.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="text-center py-16 text-sm text-muted-foreground"
                  >
                    <FileText className="size-10 text-muted-foreground/20 mx-auto mb-3" />
                    <p className="font-medium text-foreground">No items yet</p>
                    <p className="text-xs mt-1">
                      Search for a product above to add it to the bill
                    </p>
                  </td>
                </tr>
              ) : (
                cart.map((item, idx) => {
                  const product = posProducts.find(
                    (p) => p.id === item.productId,
                  )
                  const sellingUnits = getSellingUnits(item.productId)
                  const customOpts = getCustomUnitOptions(item.productId)
                  const pct = discountPcts[item.productId]
                  const computedItem =
                    computedCart.find(
                      (c) => c.productId === item.productId,
                    ) ?? item
                  const isEditingPrice = editingPrice === item.productId
                  const isEditingDisc = editingDisc === item.productId
                  const qtyIncrement = getQuantityIncrement(item.productId)
                  const qtyStep = getQuantityStep(item.productId)

                  return (
                    <tr
                      key={item.id}
                      className="border-b border-border hover:bg-muted/20 transition-colors"
                    >
                      <Td className="w-10 text-center text-xs text-muted-foreground">
                        {idx + 1}
                      </Td>
                      <Td className="min-w-0">
                        <div className="text-sm font-medium text-foreground truncate max-w-[200px]">
                          {item.name}
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          {product?.sku}
                        </div>
                      </Td>
                      <Td>
                        <select
                          value={item.sellingUnitId || ''}
                          onChange={(e) =>
                            handleChangeUnit(item.productId, e.target.value)
                          }
                          className="w-full h-8 px-2 rounded-md border border-input bg-background text-xs outline-none focus:border-ring"
                        >
                          {/* Regular selling units */}
                          {sellingUnits.map((su) => (
                            <option key={su.id} value={su.id}>
                              {su.name}
                            </option>
                          ))}
                          {/* Custom measurement options */}
                          {customOpts.length > 0 && (
                            <optgroup label="Custom amount">
                              {customOpts.map((opt) => (
                                <option key={opt.id} value={opt.id}>
                                  {opt.label}
                                </option>
                              ))}
                            </optgroup>
                          )}
                        </select>
                      </Td>
                      <Td className="w-24 text-center">
                        <div className="flex items-center justify-center gap-0.5">
                          <button
                            onClick={() =>
                              updateQuantity(
                                item.productId,
                                -qtyIncrement,
                              )
                            }
                            className="flex items-center justify-center size-7 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <Minus className="size-3" />
                          </button>
                          <EditableQuantity
                            value={item.packagingQuantity}
                            onChange={(delta) =>
                              updateQuantity(item.productId, delta)
                            }
                            step={qtyStep}
                          />
                          <button
                            onClick={() =>
                              updateQuantity(
                                item.productId,
                                qtyIncrement,
                              )
                            }
                            className="flex items-center justify-center size-7 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <Plus className="size-3" />
                          </button>
                        </div>
                      </Td>
                      <Td className="w-24 text-right">
                        {isEditingPrice ? (
                          <div className="flex items-center justify-end gap-1">
                            <span className="text-[10px] text-muted-foreground">
                              Rs.
                            </span>
                            <input
                              ref={editInputRef}
                              type="number"
                              value={editValue}
                              onChange={(e) =>
                                setEditValue(e.target.value)
                              }
                              onBlur={commitPrice}
                              onKeyDown={handleEditKeyDown}
                              className="w-20 h-7 px-2 rounded border border-primary bg-background text-sm font-semibold text-right outline-none tabular-nums"
                              autoFocus
                            />
                          </div>
                        ) : (
                          <button
                            onClick={() =>
                              startEditPrice(
                                item.productId,
                                item.unitPrice,
                              )
                            }
                            className="text-sm font-semibold tabular-nums hover:bg-muted/50 px-1.5 py-0.5 rounded transition-colors"
                            title="Click to edit price"
                          >
                            {formatCurrency(
                              computedItem.unitPrice,
                            )}
                          </button>
                        )}
                      </Td>
                      <Td className="w-20 text-right">
                        {isEditingDisc ? (
                          <div className="flex items-center justify-end gap-1">
                            <input
                              ref={editInputRef}
                              type="number"
                              value={editValue}
                              onChange={(e) =>
                                setEditValue(e.target.value)
                              }
                              onBlur={commitDisc}
                              onKeyDown={handleEditKeyDown}
                              className="w-16 h-7 px-2 rounded border border-primary bg-background text-sm font-semibold text-right outline-none tabular-nums"
                              autoFocus
                              min="0"
                              max="100"
                            />
                            <span className="text-xs text-muted-foreground">
                              %
                            </span>
                          </div>
                        ) : (
                          <button
                            onClick={() =>
                              startEditDisc(item.productId)
                            }
                            className={cn(
                              'text-sm font-semibold tabular-nums hover:bg-muted/50 px-1.5 py-0.5 rounded transition-colors',
                              pct ? 'text-amber-600' : 'text-muted-foreground',
                            )}
                            title="Click to set discount %"
                          >
                            {pct && pct > 0
                              ? `${pct}%`
                              : '—'}
                          </button>
                        )}
                      </Td>
                      <Td className="w-28 text-right">
                        <span
                          className={cn(
                            'text-sm font-bold tabular-nums',
                            computedItem.total > 0
                              ? 'text-foreground'
                              : 'text-red-500',
                          )}
                        >
                          {formatCurrency(computedItem.total)}
                        </span>
                      </Td>
                      <Td className="w-10 text-center">
                        <button
                          onClick={() =>
                            handleRemoveItem(item.productId)
                          }
                          className="flex items-center justify-center size-7 rounded-md hover:bg-red-50 text-muted-foreground hover:text-red-500 transition-colors"
                          title="Remove item"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </Td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ── Summary ── */}
        {cart.length > 0 && (
          <TransactionSummary
            subtotal={subtotal}
            discount={discount}
            discountInput={discountInput}
            grandTotal={grandTotal}
            onDiscountChange={(v) => { setDiscount(v); setDiscountInput('') }}
            onDiscountInputChange={setDiscountInput}
            onDiscountPctChange={setDiscount}
          />
        )}
      </div>

      {/* ── Payment Bar ── */}
      <PaymentPanel
        paymentMethod={paymentMethod}
        onMethodChange={setPaymentMethod}
        amountPaid={amountPaid}
        onAmountChange={setAmountPaid}
        grandTotal={grandTotal}
        cartEmpty={cart.length === 0}
        onHold={handleHoldSale}
        onClear={() => cart.length > 0 ? setShowClearConfirm(true) : resetSale()}
        onRecord={() => setShowConfirm(true)}
        onQuickPay={handleQuickPay}
      />

      {/* ── Receipt Dialog ── */}
      <ReceiptDialog
        open={showReceipt}
        saleData={receiptData}
        onClose={() => setShowReceipt(false)}
        onNewSale={handleNewSale}
      />

      {/* ── Confirm Sale Dialog ── */}
      <ConfirmTransactionDialog
        open={showConfirm}
        onOpenChange={setShowConfirm}
        itemCount={cart.length}
        items={computedCart.map((c) => ({
          name: c.name,
          qty: c.packagingQuantity,
          cost: c.unitPrice,
          total: c.total,
          unitName: c.packagingName,
        }))}
        subtotal={subtotal}
        discount={discount}
        grandTotal={grandTotal}
        amountPaid={amountPaid}
        partyName={customer.name}
        showParty={customer.name !== 'Walk-in Customer'}
        paymentMethod={paymentMethod}
        onConfirm={handleRecordSale}
      />

      {/* ── Clear Cart Dialog ── */}
      <ConfirmClearDialog
        open={showClearConfirm}
        onOpenChange={setShowClearConfirm}
        itemCount={cart.length}
        onConfirm={() => {
          resetSale()
          toast.success('Cart cleared')
        }}
      />
    </div>
  )
}

// ─── Table Cell Helpers ───

function Th({
  children,
  className,
}: {
  children?: React.ReactNode
  className?: string
}) {
  return (
    <th
      className={cn(
        'px-3 py-2.5 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider',
        className,
      )}
    >
      {children}
    </th>
  )
}

function Td({
  children,
  className,
}: {
  children?: React.ReactNode
  className?: string
}) {
  return (
    <td className={cn('px-3 py-2', className)}>
      {children}
    </td>
  )
}
