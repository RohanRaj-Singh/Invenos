import { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import { ShoppingCart, X, CheckCircle2, Printer, Pause, Play, Clock, LayoutGrid, List, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'sonner'
import ProductSearch from './components/ProductSearch'
import BottomDock from './components/BottomDock'
import CategoryNav from './components/CategoryNav'
import ProductGrid from './components/ProductGrid'
import ProductTableEntry from './components/ProductTableEntry'
import CartItemRow from './components/CartItemRow'
import CartSummary from './components/CartSummary'
import CustomerSelect from './components/CustomerSelect'
import PaymentModal from './components/PaymentModal'
import ReceiptDialog from './components/ReceiptDialog'
import { filterPOSProducts, posProducts } from '@/data/pos'
import { formatCurrency } from '@/data/dashboard'
import { allSales } from '@/data/sales'
import { addTransaction } from '@/data/financial-transactions'
import { saveCartState, loadCartState, clearCartState, holdSale, getHeldSales, removeHeldSale } from '@/lib/pos-utils'
import type { Product, CartItem, POSCustomer, PackagingConfig, PaymentMethod, HeldSale } from '@/types'

const DEFAULT_CUSTOMER: POSCustomer = { id: 'cust-0', name: 'Walk-in Customer', phone: '' }

export default function POSPage() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [cart, setCart] = useState<CartItem[]>([])
  const [discount, setDiscount] = useState(0)
  const [customer, setCustomer] = useState<POSCustomer>(DEFAULT_CUSTOMER)
  const [cartOpen, setCartOpen] = useState(false)
  const [showPayment, setShowPayment] = useState(false)
  const [heldSales, setHeldSales] = useState<HeldSale[]>([])
  const [showHeld, setShowHeld] = useState(false)
  const [viewMode, setViewMode] = useState<'cards' | 'table'>(() => {
    if (typeof window !== 'undefined') return (localStorage.getItem('pos-view-mode') as 'cards' | 'table') || 'cards'
    return 'cards'
  })
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [showReceipt, setShowReceipt] = useState(false)
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null)
  const restoredRef = useRef(false)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Item-level overrides
  const [priceOverrides, setPriceOverrides] = useState<Record<string, number>>({})
  const [itemDiscounts, setItemDiscounts] = useState<Record<string, number>>({})

  // ─── Restore cart from sessionStorage on mount ───
  useEffect(() => {
    if (restoredRef.current) return
    restoredRef.current = true
    const saved = loadCartState()
    if (saved && saved.cart.length > 0) {
      setCart(saved.cart)
      setDiscount(saved.discount)
      if (saved.customer) setCustomer(saved.customer)
    }
    setHeldSales(getHeldSales())
  }, [])

  // ─── Persist cart to sessionStorage on change ───
  useEffect(() => { saveCartState(cart, discount, customer) }, [cart, discount, customer])

  // ─── Warn before unload if cart is active ───
  useEffect(() => {
    if (cart.length === 0) return
    const handler = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = '' }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [cart.length])

  const filteredProducts = useMemo(() => filterPOSProducts(search, category), [search, category])

  // Compute item totals with overrides and discounts
  const computedCart = useMemo(() => cart.map((item) => {
    const overridePrice = priceOverrides[item.productId]
    const effectivePrice = overridePrice || item.unitPrice
    const itemDisc = itemDiscounts[item.productId] || 0
    const effectiveTotal = (effectivePrice * item.packagingQuantity) - itemDisc
    return { ...item, unitPrice: effectivePrice, total: Math.max(0, effectiveTotal) }
  }), [cart, priceOverrides, itemDiscounts])

  const subtotal = useMemo(() => computedCart.reduce((sum, item) => sum + item.total, 0), [computedCart])
  const grandTotal = useMemo(() => Math.max(0, subtotal - discount), [subtotal, discount])

  const addToCart = useCallback((product: Product) => {
    const pkg = product.packaging.length > 0 ? product.packaging.reduce((a, b) => a.quantity < b.quantity ? a : b) : null
    if (!pkg) return
    setCart((prev) => {
      const existing = prev.find((c) => c.productId === product.id)
      if (existing) return prev.map((c) => c.productId === product.id ? { ...c, packagingQuantity: c.packagingQuantity + 1, baseQuantity: (c.packagingQuantity + 1) * pkg.quantity, total: (c.packagingQuantity + 1) * c.unitPrice } : c)
      return [...prev, { id: `ci-${Date.now()}`, productId: product.id, name: product.name, packagingName: pkg.name, packagingQuantity: 1, baseUnitQuantity: pkg.quantity, baseQuantity: pkg.quantity, unitPrice: pkg.salePrice, total: pkg.salePrice, category: product.category }]
    })
  }, [])

  const updateQuantity = useCallback((productId: string, delta: number) => {
    setCart((prev) => prev.map((c) => { if (c.productId !== productId) return c; const n = c.packagingQuantity + delta; return n <= 0 ? null : { ...c, packagingQuantity: n, baseQuantity: n * c.baseUnitQuantity, total: n * c.unitPrice } }).filter(Boolean) as CartItem[])
  }, [])

  const handleChangePackaging = useCallback((productId: string, packagingName: string) => {
    const product = posProducts.find((p) => p.id === productId)
    if (!product) return
    const newPkg = product.packaging.find((p) => p.name === packagingName)
    if (!newPkg) return
    setCart((prev) => prev.map((c) => c.productId !== productId ? c : { ...c, packagingName: newPkg.name, baseUnitQuantity: newPkg.quantity, baseQuantity: c.packagingQuantity * newPkg.quantity, unitPrice: newPkg.salePrice, total: c.packagingQuantity * newPkg.salePrice }))
  }, [])

  const getCartPackaging = useCallback((productId: string): PackagingConfig[] => posProducts.find((p) => p.id === productId)?.packaging || [], [])

  const handleRemoveItem = useCallback((productId: string) => {
    setCart((prev) => prev.filter((c) => c.productId !== productId))
    setPriceOverrides((prev) => { const r = { ...prev }; delete r[productId]; return r })
    setItemDiscounts((prev) => { const r = { ...prev }; delete r[productId]; return r })
  }, [])

  const handlePriceOverride = useCallback((productId: string, newPrice: number) => {
    setPriceOverrides((prev) => ({ ...prev, [productId]: newPrice }))
    toast.success('Price updated for this sale')
  }, [])

  const handleItemDiscount = useCallback((productId: string, discAmount: number) => {
    setItemDiscounts((prev) => ({ ...prev, [productId]: discAmount }))
    toast.success('Item discount applied')
  }, [])

  // Persist view mode
  useEffect(() => { localStorage.setItem('pos-view-mode', viewMode) }, [viewMode])

  const resetSale = useCallback(() => {
    setCart([]); setDiscount(0); setCustomer(DEFAULT_CUSTOMER)
    setPriceOverrides({}); setItemDiscounts({})
    clearCartState()
    setTimeout(() => searchInputRef.current?.focus(), 100)
  }, [])

  const handleClearCart = useCallback(() => {
    if (cart.length > 0) setShowClearConfirm(true)
  }, [cart.length])

  const confirmClearCart = useCallback(() => {
    resetSale()
    setShowClearConfirm(false)
  }, [resetSale])

  const handleCompleteSale = () => { setShowPayment(true) }

  const handlePaymentConfirm = useCallback((method: PaymentMethod, amountPaid: number) => {
    const outstanding = Math.max(0, grandTotal - amountPaid)
    const paymentStatus = outstanding === 0 ? 'paid' as const : 'partial' as const
    const today = new Date().toISOString().split('T')[0]

    // 1. Create Sale record
    const saleIdx = allSales.length + 1
    const invoiceNum = `INV-${String(1000 + saleIdx)}`
    const sale = {
      id: `sal-${String(saleIdx).padStart(3, '0')}`,
      invoiceNumber: invoiceNum,
      source: 'pos' as const,
      date: today,
      customerName: customer.name,
      items: computedCart.map((m) => ({
        id: m.id, productId: m.productId, name: m.name,
        packagingName: m.packagingName, packagingQuantity: m.packagingQuantity,
        baseUnitQuantity: m.baseUnitQuantity, baseQuantity: m.baseQuantity,
        unitPrice: m.unitPrice, total: m.total, category: m.category,
      })),
      subtotal,
      discount,
      grandTotal,
      amountPaid,
      outstandingBalance: outstanding,
      paymentStatus,
      createdBy: 'Dr. Ahmed',
    }
    allSales.push(sale)

    // 2. Create FinancialTransaction for POS contact
    addTransaction({
      contactId: 'ct-001',
      direction: 'in',
      type: 'collection',
      date: today,
      amount: amountPaid,
      method,
      description: `POS sale — ${computedCart.length} items`,
      linkedSaleId: sale.id,
      createdBy: 'Dr. Ahmed',
    })

    // 3. Show receipt
    setReceiptData({
      invoiceNumber: invoiceNum,
      saleId: sale.id,
      items: computedCart,
      subtotal,
      discount,
      grandTotal,
      amountPaid,
      outstanding,
      paymentStatus,
      method,
      customer,
    })
    setShowPayment(false)
    setShowReceipt(true)
  }, [computedCart, subtotal, discount, grandTotal, customer])

  const handleNewSale = useCallback(() => {
    setShowReceipt(false)
    setReceiptData(null)
    resetSale()
  }, [resetSale])

  const handlePrintSale = useCallback(() => {
    if (cart.length === 0) return
    // Simulate receipt preview for current cart (without saving sale)
    const data = {
      invoiceNumber: `PREVIEW-${Date.now().toString().slice(-6)}`,
      saleId: '',
      items: computedCart,
      subtotal,
      discount,
      grandTotal,
      amountPaid: grandTotal,
      outstanding: 0,
      paymentStatus: 'paid' as const,
      method: 'cash' as PaymentMethod,
      customer,
    }
    setReceiptData(data)
    setShowReceipt(true)
  }, [computedCart, subtotal, discount, grandTotal, customer])

  // ─── Mobile quick actions ───
  const handleQuickCash = useCallback(() => {
    setCartOpen(true)
  }, [])

  const handleQuickComplete = useCallback(() => {
    const method = 'cash' as PaymentMethod
    const amountPaid = grandTotal
    const outstanding = 0
    const paymentStatus = 'paid' as const
    const today = new Date().toISOString().split('T')[0]

    const saleIdx = allSales.length + 1
    const invoiceNum = `INV-${String(1000 + saleIdx)}`
    const sale = {
      id: `sal-${String(saleIdx).padStart(3, '0')}`,
      invoiceNumber: invoiceNum,
      source: 'pos' as const,
      date: today,
      customerName: customer.name,
      items: computedCart.map((m) => ({
        id: m.id, productId: m.productId, name: m.name,
        packagingName: m.packagingName, packagingQuantity: m.packagingQuantity,
        baseUnitQuantity: m.baseUnitQuantity, baseQuantity: m.baseQuantity,
        unitPrice: m.unitPrice, total: m.total, category: m.category,
      })),
      subtotal, discount, grandTotal, amountPaid, outstandingBalance: outstanding, paymentStatus,
      createdBy: 'Dr. Ahmed',
    }
    allSales.push(sale)

    addTransaction({
      contactId: 'ct-001',
      direction: 'in',
      type: 'collection',
      date: today,
      amount: amountPaid,
      method,
      description: `POS sale — ${computedCart.length} items`,
      linkedSaleId: sale.id,
      createdBy: 'Dr. Ahmed',
    })

    setReceiptData({
      invoiceNumber: invoiceNum, saleId: sale.id, items: computedCart,
      subtotal, discount, grandTotal, amountPaid, outstanding,
      paymentStatus, method, customer,
    })
    setShowReceipt(true)
  }, [computedCart, subtotal, discount, grandTotal, customer])

  // ─── Hold Sale ───
  const handleHoldSale = useCallback(() => {
    if (cart.length === 0) return
    const held: HeldSale = {
      id: `held-${Date.now()}`,
      customer, items: [...cart], discount, subtotal, grandTotal,
      heldAt: new Date().toLocaleString(),
    }
    holdSale(held)
    setHeldSales(getHeldSales())
    resetSale()
    toast.success('Sale held — you can resume it later')
  }, [cart, customer, discount, subtotal, grandTotal, resetSale])

  const handleResumeHeld = useCallback((held: HeldSale) => {
    setCart(held.items)
    setDiscount(held.discount)
    setCustomer(held.customer)
    removeHeldSale(held.id)
    setHeldSales(getHeldSales())
    setShowHeld(false)
    toast.success('Held sale restored')
  }, [])

  const handleDeleteHeld = useCallback((id: string) => {
    removeHeldSale(id)
    setHeldSales(getHeldSales())
    toast.success('Held sale removed')
  }, [])

  // Barcode match auto-add
  const handleBarcodeMatch = useCallback((product: Product) => {
    addToCart(product)
    toast.success(`${product.name} added via barcode`)
  }, [addToCart])

  const itemCount = cart.reduce((sum, c) => sum + c.packagingQuantity, 0)

  return (
    <div className="h-full flex flex-col">
      {/* Desktop layout */}
      <div className="hidden lg:flex flex-1 overflow-hidden">
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="p-4 lg:p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <ProductSearch value={search} onChange={setSearch} resultsCount={filteredProducts.length} inputRef={searchInputRef} onBarcodeMatch={handleBarcodeMatch} />
              </div>
              <div className="flex items-center gap-0.5 bg-muted rounded-lg p-0.5 shrink-0">
                <button onClick={() => setViewMode('cards')} className={`flex items-center justify-center size-8 rounded-md transition-colors ${viewMode === 'cards' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`} title="Card view"><LayoutGrid className="size-4" /></button>
                <button onClick={() => setViewMode('table')} className={`flex items-center justify-center size-8 rounded-md transition-colors ${viewMode === 'table' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`} title="Table view"><List className="size-4" /></button>
              </div>
              {heldSales.length > 0 && (
                <button onClick={() => setShowHeld(!showHeld)} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 text-xs font-medium hover:bg-amber-100 dark:hover:bg-amber-500/20 transition-colors shrink-0">
                  <Clock className="size-3.5" />
                  {heldSales.length} Held
                </button>
              )}
            </div>
            {viewMode === 'cards' && <CategoryNav active={category} onChange={setCategory} />}
          </div>
          <div className="flex-1 overflow-y-auto px-4 lg:px-5 pb-5">
            {viewMode === 'cards' ? (
              <ProductGrid products={filteredProducts} cartItems={cart} onAddToCart={addToCart} onUpdateQuantity={updateQuantity} />
            ) : (
              <ProductTableEntry
                cart={cart}
                onAddToCart={addToCart}
                onUpdateQuantity={updateQuantity}
                onChangePackaging={handleChangePackaging}
                onRemoveItem={handleRemoveItem}
                onPriceOverride={handlePriceOverride}
                onItemDiscount={handleItemDiscount}
              />
            )}
          </div>
        </div>

        <div className="w-[380px] xl:w-[420px] border-l border-border bg-card flex flex-col">
          <CartHeader itemCount={itemCount} customer={customer} onCustomerChange={setCustomer} onClear={handleClearCart} />
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-1">
            {computedCart.length === 0 ? <EmptyCart /> : computedCart.map((item) => (
              <CartItemRow key={item.productId} item={item} packagingOptions={getCartPackaging(item.productId)} onUpdateQuantity={updateQuantity} onChangePackaging={handleChangePackaging} />
            ))}
          </div>
          <div className="border-t border-border p-4 space-y-3">
            <CartSummary subtotal={subtotal} discount={discount} grandTotal={grandTotal} itemCount={itemCount} onDiscountChange={setDiscount} />
            <div className="grid grid-cols-3 gap-2">
              <Button variant="outline" size="sm" className="gap-1.5 h-10" disabled={cart.length === 0} onClick={handleHoldSale}>
                <Pause className="size-3.5" /> Hold
              </Button>
              <Button size="sm" className="gap-1.5 h-10 shadow-sm" disabled={cart.length === 0} onClick={handleCompleteSale}>
                <CheckCircle2 className="size-3.5" /> Complete
              </Button>
              <Button variant="outline" size="sm" className="gap-1.5 h-10" disabled={cart.length === 0} onClick={handlePrintSale}>
                <Printer className="size-3.5" /> Print
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile layout */}
      <div className="lg:hidden flex flex-col flex-1 overflow-hidden">
        <div className="flex-1 overflow-y-auto px-3 pt-3">
          {/* Category pill — compact, at top of product area */}
          {viewMode === 'cards' && (
            <div className="mb-2">
              <CategoryNav active={category} onChange={setCategory} />
            </div>
          )}
          <ProductGrid products={filteredProducts} cartItems={cart} onAddToCart={addToCart} onUpdateQuantity={updateQuantity} />
        </div>
        <BottomDock
          searchValue={search}
          onSearchChange={setSearch}
          onBarcodeMatch={handleBarcodeMatch}
          cartItems={cart}
          grandTotal={grandTotal}
          itemCount={itemCount}
          customer={customer}
          discount={discount}
          heldCount={heldSales.length}
          onOpenCart={() => setCartOpen(true)}
          onQuickCash={handleQuickCash}
          onQuickComplete={handleQuickComplete}
          onClearCart={handleClearCart}
          onOpenHeld={() => setShowHeld(true)}
          searchInputRef={searchInputRef}
        />
      </div>

      {/* Mobile cart overlay */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/30" onClick={() => setCartOpen(false)} />
          <div className="absolute bottom-0 inset-x-0 max-h-[85vh] bg-background rounded-t-2xl flex flex-col animate-in slide-in-from-bottom">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <CartHeader itemCount={itemCount} customer={customer} onCustomerChange={setCustomer} onClear={handleClearCart} />
              <button onClick={() => setCartOpen(false)} className="flex items-center justify-center size-8 rounded-lg hover:bg-muted transition-colors"><X className="size-4" /></button>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-1">
              {computedCart.length === 0 ? <EmptyCart /> : computedCart.map((item) => (
                <CartItemRow key={item.productId} item={item} packagingOptions={getCartPackaging(item.productId)} onUpdateQuantity={updateQuantity} onChangePackaging={handleChangePackaging} />
              ))}
            </div>
            <div className="border-t border-border p-4 space-y-3">
              <CartSummary subtotal={subtotal} discount={discount} grandTotal={grandTotal} itemCount={itemCount} onDiscountChange={setDiscount} />
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 gap-1.5 h-12" disabled={cart.length === 0} onClick={handleHoldSale}>
                  <Pause className="size-4" /> Hold
                </Button>
                <Button className="flex-1 gap-1.5 h-12 shadow-sm" disabled={cart.length === 0} onClick={() => { setCartOpen(false); handleCompleteSale() }}>
                  <CheckCircle2 className="size-4" /> Pay {formatCurrency(grandTotal)}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment modal */}
      <PaymentModal open={showPayment} onClose={() => setShowPayment(false)} onConfirm={handlePaymentConfirm}
        grandTotal={grandTotal} itemCount={itemCount} customer={customer} />

      {/* Receipt dialog */}
      <ReceiptDialog open={showReceipt} saleData={receiptData} onClose={() => setShowReceipt(false)} onNewSale={handleNewSale} />

      {/* Clear cart confirm dialog */}
      <Dialog open={showClearConfirm} onOpenChange={(v) => { if (!v) setShowClearConfirm(false) }}>
        <DialogContent className="sm:max-w-sm gap-0 p-0">
          <DialogHeader className="p-5 pb-0">
            <DialogTitle className="text-base">Clear Cart?</DialogTitle>
          </DialogHeader>
          <div className="p-5 space-y-4">
            <p className="text-sm text-muted-foreground">This will remove all {itemCount} item{itemCount > 1 ? 's' : ''} from the cart. This cannot be undone.</p>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 h-10" onClick={() => setShowClearConfirm(false)}>Cancel</Button>
              <Button variant="destructive" className="flex-1 h-10 gap-1.5" onClick={confirmClearCart}>
                <Trash2 className="size-4" /> Clear Cart
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Held sales panel */}
      {showHeld && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/30" onClick={() => setShowHeld(false)} />
          <div className="absolute right-0 top-0 bottom-16 w-80 bg-background border-l border-border shadow-xl flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <span className="text-sm font-semibold">Held Sales ({heldSales.length})</span>
              <button onClick={() => setShowHeld(false)} className="flex items-center justify-center size-7 rounded-md hover:bg-muted"><X className="size-4" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {heldSales.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-sm text-muted-foreground">
                  <Clock className="size-8 text-muted-foreground/30 mb-2" />
                  <span className="font-medium text-foreground">No held sales</span>
                  <span className="text-xs mt-1">Hold a sale to save it for later</span>
                </div>
              )}
              {heldSales.map((held) => (
                <div key={held.id} className="rounded-xl border border-border p-3 space-y-2 bg-card group">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-foreground">{held.customer.name}</span>
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-muted-foreground">{held.heldAt}</span>
                      <button
                        onClick={() => handleDeleteHeld(held.id)}
                        className="opacity-0 group-hover:opacity-100 flex items-center justify-center size-6 rounded-md hover:bg-red-50 text-muted-foreground hover:text-red-500 transition-all"
                      >
                        <Trash2 className="size-3" />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{held.items.length} item{held.items.length > 1 ? 's' : ''}</span>
                    <span className="text-sm font-bold">{formatCurrency(held.grandTotal)}</span>
                  </div>
                  <button onClick={() => handleResumeHeld(held)} className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors">
                    <Play className="size-3" /> Resume
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function CartHeader({ itemCount, customer, onCustomerChange, onClear }: { itemCount: number; customer: POSCustomer; onCustomerChange: (c: POSCustomer) => void; onClear: () => void }) {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-border">
      <div className="flex items-center gap-2"><ShoppingCart className="size-4 text-primary" /><span className="text-sm font-semibold">Cart</span>{itemCount > 0 && <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 font-medium">{itemCount}</Badge>}</div>
      <div className="flex items-center gap-2">
        <CustomerSelect value={customer} onChange={onCustomerChange} />
        {itemCount > 0 && <button onClick={onClear} className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2">Clear</button>}
      </div>
    </div>
  )
}

function EmptyCart() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-sm text-muted-foreground">
      <ShoppingCart className="size-10 text-muted-foreground/30 mb-3" />
      <span className="font-medium text-foreground">Cart is empty</span>
      <span className="text-xs mt-1">Search and tap products to add them</span>
    </div>
  )
}

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
