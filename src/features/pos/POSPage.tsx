import { useState, useMemo, useCallback } from 'react'
import { ShoppingCart, X, CheckCircle2, Printer, Pause } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import ProductSearch from './components/ProductSearch'
import CategoryNav from './components/CategoryNav'
import ProductGrid from './components/ProductGrid'
import CartItemRow from './components/CartItemRow'
import CartSummary from './components/CartSummary'
import CustomerSelect from './components/CustomerSelect'
import PaymentModal from './components/PaymentModal'
import { filterPOSProducts, posProducts } from '@/data/pos'
import { formatCurrency } from '@/data/dashboard'
import type { Product, CartItem, POSCustomer, PackagingConfig } from '@/types'

export default function POSPage() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [cart, setCart] = useState<CartItem[]>([])
  const [customer, setCustomer] = useState<POSCustomer>({
    id: 'cust-0',
    name: 'Walk-in Customer',
    phone: '',
  })
  const [discount, setDiscount] = useState(0)
  const [cartOpen, setCartOpen] = useState(false)
  const [showPayment, setShowPayment] = useState(false)

  const filteredProducts = useMemo(
    () => filterPOSProducts(search, category),
    [search, category]
  )

  // Cart calculations
  const subtotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.total, 0),
    [cart]
  )
  const grandTotal = useMemo(() => Math.max(0, subtotal - discount), [subtotal, discount])

  const addToCart = useCallback((product: Product) => {
    // Find smallest packaging as default sale packaging
    const pkg = product.packaging.length > 0
      ? product.packaging.reduce((a, b) => a.quantity < b.quantity ? a : b)
      : null
    if (!pkg) return

    setCart((prev) => {
      const existing = prev.find((c) => c.productId === product.id)
      if (existing) {
        return prev.map((c) =>
          c.productId === product.id
            ? { ...c, packagingQuantity: c.packagingQuantity + 1, baseQuantity: (c.packagingQuantity + 1) * pkg.quantity, total: (c.packagingQuantity + 1) * c.unitPrice }
            : c
        )
      }
      return [...prev, {
        id: `ci-${Date.now()}`,
        productId: product.id, name: product.name,
        packagingName: pkg.name, packagingQuantity: 1,
        baseUnitQuantity: pkg.quantity, baseQuantity: pkg.quantity,
        unitPrice: pkg.salePrice, total: pkg.salePrice,
        category: product.category,
      }]
    })
  }, [])

  const updateQuantity = useCallback((productId: string, delta: number) => {
    setCart((prev) => {
      return prev
        .map((c) => {
          if (c.productId !== productId) return c
          const newQty = c.packagingQuantity + delta
          if (newQty <= 0) return null
          return { ...c, packagingQuantity: newQty, baseQuantity: newQty * c.baseUnitQuantity, total: newQty * c.unitPrice }
        })
        .filter(Boolean) as CartItem[]
    })
  }, [])

  const handleChangePackaging = useCallback((productId: string, packagingName: string) => {
    const product = posProducts.find((p) => p.id === productId)
    if (!product) return
    const newPkg = product.packaging.find((p) => p.name === packagingName)
    if (!newPkg) return
    setCart((prev) => prev.map((c) => {
      if (c.productId !== productId) return c
      return { ...c, packagingName: newPkg.name, baseUnitQuantity: newPkg.quantity, baseQuantity: c.packagingQuantity * newPkg.quantity, unitPrice: newPkg.salePrice, total: c.packagingQuantity * newPkg.salePrice }
    }))
  }, [])

  const getCartPackaging = useCallback((productId: string): PackagingConfig[] => {
    const product = posProducts.find((p) => p.id === productId)
    return product?.packaging || []
  }, [])

  const clearCart = useCallback(() => {
    setCart([])
    setDiscount(0)
    setCustomer({ id: 'cust-0', name: 'Walk-in Customer', phone: '' })
  }, [])

  const handleCompleteSale = () => {
    setShowPayment(true)
  }

  const handlePaymentConfirm = (method: 'cash' | 'card' | 'transfer') => {
    // Mock: in real app would POST to API
    console.log('Sale completed', {
      items: cart,
      subtotal,
      discount,
      grandTotal,
      customer,
      paymentMethod: method,
    })
    setShowPayment(false)
    clearCart()
  }

  const itemCount = cart.reduce((sum, c) => sum + c.packagingQuantity, 0)

  return (
    <div className="h-full flex flex-col">
      {/* Desktop layout */}
      <div className="hidden lg:flex flex-1 overflow-hidden">
        {/* Left side — Products */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="p-4 lg:p-5 space-y-4">
            <ProductSearch
              value={search}
              onChange={setSearch}
              resultsCount={filteredProducts.length}
            />
            <CategoryNav active={category} onChange={setCategory} />
          </div>
          <div className="flex-1 overflow-y-auto px-4 lg:px-5 pb-5">
            <ProductGrid
              products={filteredProducts}
              cartItems={cart}
              onAddToCart={addToCart}
              onUpdateQuantity={updateQuantity}
            />
          </div>
        </div>

        {/* Right side — Cart */}
        <div className="w-[380px] xl:w-[420px] border-l border-border bg-card flex flex-col">
          <CartHeader
            itemCount={itemCount}
            customer={customer}
            onCustomerChange={setCustomer}
            onClear={clearCart}
          />
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-1">
            {cart.length === 0 ? (
              <EmptyCart />
            ) : (
              cart.map((item) => (
                <CartItemRow
                  key={item.productId}
                  item={item}
                  packagingOptions={getCartPackaging(item.productId)}
                  onUpdateQuantity={updateQuantity}
                  onChangePackaging={handleChangePackaging}
                />
              ))
            )}
          </div>
          <div className="border-t border-border p-4 space-y-3">
            <CartSummary
              subtotal={subtotal}
              discount={discount}
              grandTotal={grandTotal}
              itemCount={itemCount}
              onDiscountChange={setDiscount}
            />
            <div className="grid grid-cols-3 gap-2">
              <Button variant="outline" size="sm" className="gap-1.5 h-9">
                <Pause className="size-3.5" />
                Hold
              </Button>
              <Button
                size="sm"
                className="gap-1.5 h-9 shadow-sm"
                disabled={cart.length === 0}
                onClick={handleCompleteSale}
              >
                <CheckCircle2 className="size-3.5" />
                Complete
              </Button>
              <Button variant="outline" size="sm" className="gap-1.5 h-9" disabled={cart.length === 0}>
                <Printer className="size-3.5" />
                Print
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile layout */}
      <div className="lg:hidden flex flex-col flex-1 overflow-hidden">
        {/* Search + Categories */}
        <div className="p-3 space-y-3">
          <ProductSearch
            value={search}
            onChange={setSearch}
            resultsCount={filteredProducts.length}
          />
          <CategoryNav active={category} onChange={setCategory} />
        </div>

        {/* Products */}
        <div className="flex-1 overflow-y-auto px-3 pb-3">
          <ProductGrid
            products={filteredProducts}
            cartItems={cart}
            onAddToCart={addToCart}
            onUpdateQuantity={updateQuantity}
          />
        </div>

        {/* Sticky checkout bar */}
        <div className="sticky bottom-0 border-t border-border bg-background/95 backdrop-blur px-3 py-2.5 safe-area-bottom">
          <button
            onClick={() => setCartOpen(true)}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/25 active:scale-[0.99] transition-all"
          >
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <ShoppingCart className="size-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center size-4 rounded-full bg-primary-foreground text-primary text-[10px] font-bold">
                    {itemCount}
                  </span>
                )}
              </div>
              <div className="text-left">
                <div className="text-xs font-medium text-primary-foreground/80">View Cart</div>
                <div className="text-sm font-bold">{formatCurrency(grandTotal)}</div>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-medium text-primary-foreground/80">
              {itemCount > 0 && <span>{itemCount} item{itemCount !== 1 ? 's' : ''}</span>}
              <span>→</span>
            </div>
          </button>
        </div>
      </div>

      {/* Mobile cart overlay */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/30" onClick={() => setCartOpen(false)} />
          <div className="absolute bottom-0 inset-x-0 max-h-[85vh] bg-background rounded-t-2xl flex flex-col animate-in slide-in-from-bottom">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <CartHeader
                itemCount={itemCount}
                customer={customer}
                onCustomerChange={setCustomer}
                onClear={clearCart}
              />
              <button
                onClick={() => setCartOpen(false)}
                className="flex items-center justify-center size-8 rounded-lg hover:bg-muted transition-colors"
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-1">
              {cart.length === 0 ? (
                <EmptyCart />
              ) : (
                cart.map((item) => (
                  <CartItemRow
                    key={item.productId}
                    item={item}
                    packagingOptions={getCartPackaging(item.productId)}
                    onUpdateQuantity={updateQuantity}
                    onChangePackaging={handleChangePackaging}
                  />
                ))
              )}
            </div>
            <div className="border-t border-border p-4 space-y-3">
              <CartSummary
                subtotal={subtotal}
                discount={discount}
                grandTotal={grandTotal}
                itemCount={itemCount}
                onDiscountChange={setDiscount}
              />
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 gap-1.5 h-11"
                  disabled={cart.length === 0}
                  onClick={() => setCartOpen(false)}
                >
                  <Pause className="size-4" />
                  Hold
                </Button>
                <Button
                  className="flex-1 gap-1.5 h-11 shadow-sm"
                  disabled={cart.length === 0}
                  onClick={() => {
                    setCartOpen(false)
                    handleCompleteSale()
                  }}
                >
                  <CheckCircle2 className="size-4" />
                  Pay {formatCurrency(grandTotal)}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment modal */}
      <PaymentModal
        open={showPayment}
        onClose={() => setShowPayment(false)}
        onConfirm={handlePaymentConfirm}
        grandTotal={grandTotal}
        itemCount={itemCount}
        customer={customer}
      />
    </div>
  )
}

function CartHeader({
  itemCount,
  customer,
  onCustomerChange,
  onClear,
}: {
  itemCount: number
  customer: POSCustomer
  onCustomerChange: (c: POSCustomer) => void
  onClear: () => void
}) {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-border">
      <div className="flex items-center gap-2">
        <ShoppingCart className="size-4 text-primary" />
        <span className="text-sm font-semibold">Cart</span>
        {itemCount > 0 && (
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 font-medium">
            {itemCount}
          </Badge>
        )}
      </div>
      <div className="flex items-center gap-2">
        <CustomerSelect value={customer} onChange={onCustomerChange} />
        {itemCount > 0 && (
          <button
            onClick={onClear}
            className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2"
          >
            Clear
          </button>
        )}
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
