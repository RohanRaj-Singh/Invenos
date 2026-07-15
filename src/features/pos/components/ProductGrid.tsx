import { useState, useRef, useEffect } from 'react'
import { Plus, Package, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/data/dashboard'
import type { Product, CartItem } from '@/types'

function getSalePrice(p: Product) { return p.packaging.length ? p.packaging.reduce((a, b) => a.quantity < b.quantity ? a : b).salePrice : 0 }

interface ProductGridProps {
  products: (Product & { _color?: string })[]
  cartItems: CartItem[]
  onAddToCart: (product: Product) => void
  onUpdateQuantity: (productId: string, delta: number) => void
}

export default function ProductGrid({ products, cartItems, onAddToCart, onUpdateQuantity }: ProductGridProps) {
  const getCartQty = (productId: string) =>
    cartItems.find((c) => c.productId === productId)?.packagingQuantity || 0

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-sm text-muted-foreground">
        <Package className="size-12 text-muted-foreground/30 mb-3" />
        <span className="font-medium text-foreground">No products found</span>
        <span className="mt-1">Try a different search or category.</span>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
      {products.map((product) => {
        const qty = getCartQty(product.id)
        const color = product._color || 'from-muted to-muted/50'

        return (
          <div
            key={product.id}
            className={cn(
              'group relative rounded-xl border border-border bg-card overflow-hidden transition-all hover:shadow-md hover:border-primary/30 active:scale-[0.98]',
              qty > 0 && 'border-primary/40 ring-1 ring-primary/20'
            )}
          >
            <button
              onClick={() => onAddToCart(product)}
              className="w-full text-left"
            >
              <div className={cn('h-16 sm:h-20 bg-gradient-to-br flex items-center justify-center', color)}>
                <Package className="size-6 sm:size-7 text-muted-foreground/40" />
              </div>
              <div className="p-2.5 sm:p-3">
                <h3 className="text-xs sm:text-sm font-medium text-foreground leading-snug line-clamp-2 min-h-[2em]">{product.name}</h3>
                <div className="flex items-center justify-between mt-1.5">
                  <span className="text-sm sm:text-base font-bold text-foreground">{formatCurrency(getSalePrice(product))}</span>
                  <span className="text-[10px] text-muted-foreground">/{product.baseUnit.toLowerCase()}</span>
                </div>
                {product.trackInventory && product.stockQuantity <= 10 && (
                  <div className="mt-1.5 text-[10px] text-amber-500 font-medium">Only {product.stockQuantity} left</div>
                )}
              </div>
            </button>

            {qty > 0 ? (
              <QuantityControls
                qty={qty}
                onIncrement={() => onUpdateQuantity(product.id, 1)}
                onDecrement={() => onUpdateQuantity(product.id, -1)}
              />
            ) : (
              <div className="px-2.5 pb-2.5">
                <button
                  onClick={() => onAddToCart(product)}
                  className="w-full flex items-center justify-center gap-1 py-2 rounded-lg bg-muted/60 hover:bg-primary hover:text-primary-foreground text-xs font-medium text-muted-foreground transition-all"
                >
                  <Plus className="size-3.5" />
                  Add
                </button>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

function QuantityControls({ qty, onIncrement, onDecrement }: { qty: number; onIncrement: () => void; onDecrement: () => void }) {
  const [editing, setEditing] = useState(false)
  const [input, setInput] = useState(String(qty))
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editing) inputRef.current?.focus()
  }, [editing])

  useEffect(() => {
    if (!editing) setInput(String(qty))
  }, [qty, editing])

  const handleSave = () => {
    const val = parseInt(input)
    if (!isNaN(val) && val > 0) {
      const diff = val - qty
      if (diff > 0) for (let i = 0; i < diff; i++) onIncrement()
      else if (diff < 0) for (let i = 0; i < -diff; i++) onDecrement()
    }
    setEditing(false)
  }

  if (editing) {
    return (
      <div className="px-2.5 pb-2.5">
        <input
          ref={inputRef}
          type="number"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onBlur={handleSave}
          onKeyDown={(e) => { if (e.key === 'Enter') handleSave() }}
          className="w-full h-10 px-2 rounded-lg border border-primary bg-background text-center text-sm font-bold outline-none"
          min="1"
          autoFocus
        />
      </div>
    )
  }

  return (
    <div className="flex items-center gap-0 px-2.5 pb-2.5">
      <button
        onClick={(e) => { e.stopPropagation(); onDecrement() }}
        className="flex items-center justify-center size-9 rounded-lg bg-muted hover:bg-muted/80 text-foreground transition-colors"
      >
        <Minus className="size-4" />
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); setEditing(true) }}
        className="flex-1 text-center text-sm font-bold text-foreground tabular-nums h-9 flex items-center justify-center hover:bg-muted/30 rounded-lg transition-colors"
      >
        {qty}
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); onIncrement() }}
        className="flex items-center justify-center size-9 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        <Plus className="size-4" />
      </button>
    </div>
  )
}
