import { useState, useRef, useCallback } from 'react'
import { ShoppingCart, Search, ScanLine, X, CheckCircle2, Clock, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/data/dashboard'
import { getProductByBarcode } from '@/data/pos'
import type { Product, CartItem, POSCustomer } from '@/types'

interface BottomDockProps {
  searchValue: string
  onSearchChange: (v: string) => void
  onBarcodeMatch?: (product: Product) => void
  cartItems: CartItem[]
  grandTotal: number
  itemCount: number
  customer: POSCustomer
  discount: number
  heldCount: number
  onOpenCart: () => void
  onQuickCash: () => void
  onQuickComplete: () => void
  onClearCart: () => void
  onOpenHeld: () => void
  searchInputRef?: React.RefObject<HTMLInputElement | null>
}

export default function BottomDock({
  searchValue, onSearchChange, onBarcodeMatch,
  cartItems, grandTotal, itemCount, customer, discount, heldCount,
  onOpenCart, onQuickCash, onQuickComplete,
  onClearCart, onOpenHeld,
  searchInputRef: externalRef,
}: BottomDockProps) {
  const internalRef = useRef<HTMLInputElement>(null)
  const inputRef = externalRef || internalRef
  const [confirming, setConfirming] = useState(false)
  const confirmTimerRef = useRef<number | undefined>(undefined)

  const hasItems = cartItems.length > 0
  const isWalkIn = customer.id === 'cust-0'
  const canQuickCash = hasItems && isWalkIn && discount === 0

  // Barcode simulation
  const handleInput = useCallback((v: string) => {
    onSearchChange(v)
    const cleaned = v.trim()
    if (cleaned.length >= 8 && /^\d+$/.test(cleaned) && onBarcodeMatch) {
      const product = getProductByBarcode(cleaned)
      if (product) {
        onBarcodeMatch(product)
        onSearchChange('')
      }
    }
  }, [onSearchChange, onBarcodeMatch])

  const handlePayTap = useCallback(() => {
    if (canQuickCash) {
      if (confirming) {
        setConfirming(false)
        clearTimeout(confirmTimerRef.current)
        onQuickComplete()
      } else {
        setConfirming(true)
        confirmTimerRef.current = setTimeout(() => setConfirming(false), 3000)
      }
    } else if (hasItems) {
      onQuickCash()
    }
  }, [canQuickCash, confirming, onQuickComplete, onQuickCash, hasItems])

  return (
    <>
      {/* Bottom spacer to account for fixed dock */}
      <div className="lg:hidden h-[152px] shrink-0" />

      {/* Fixed bottom dock — replaces global BottomNav on POS */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-background border-t border-border safe-area-bottom shadow-lg">
        {/* Search bar row */}
        <div className="px-3 pt-2.5 pb-1.5">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search by name, SKU, or scan barcode..."
              value={searchValue}
              onChange={(e) => handleInput(e.target.value)}
              className="w-full h-10 pl-9 pr-10 rounded-xl border border-input bg-background text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring/30"
              autoComplete="off"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {searchValue && (
                <button onClick={() => onSearchChange('')} className="flex items-center justify-center size-8 rounded-md hover:bg-muted text-muted-foreground">
                  <X className="size-3.5" />
                </button>
              )}
              <span className="flex items-center justify-center size-8 rounded-md bg-muted text-muted-foreground">
                <ScanLine className="size-4" />
              </span>
            </div>
          </div>
        </div>

        {/* Action row */}
        <div className="flex items-stretch gap-2 px-3 pb-3 pt-1">
          {/* Cart summary — always visible, tap to open half-sheet */}
          <button
            onClick={onOpenCart}
            className={cn(
              'flex items-center gap-2.5 px-3.5 rounded-xl border transition-all flex-1',
              hasItems
                ? 'bg-card border-border active:bg-muted/50'
                : 'bg-muted/30 border-dashed border-border/50'
            )}
          >
            <div className="relative">
              <ShoppingCart className="size-5 text-muted-foreground" />
              {hasItems && (
                <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center size-4.5 rounded-full bg-primary text-primary-foreground text-[9px] font-bold ring-2 ring-background min-w-[18px] h-[18px] px-1">
                  {itemCount}
                </span>
              )}
            </div>
            <div className="text-left flex-1 min-w-0">
              <div className="text-[11px] text-muted-foreground">
                {hasItems ? `${itemCount} item${itemCount > 1 ? 's' : ''}` : 'Cart is empty'}
              </div>
              <div className="text-sm font-bold text-foreground tabular-nums">
                {hasItems ? formatCurrency(grandTotal) : '—'}
              </div>
            </div>
            {hasItems && (
              <div className="flex items-center gap-1.5">
                {heldCount > 0 && (
                  <span className="flex items-center gap-0.5 text-[10px] text-amber-600 bg-amber-50 dark:bg-amber-500/10 px-1.5 py-0.5 rounded-full">
                    <Clock className="size-2.5" />{heldCount}
                  </span>
                )}
                <span className="text-[10px] text-muted-foreground">Tap ›</span>
              </div>
            )}
          </button>

          {/* Pay / Quick-cash button — only when items in cart */}
          {hasItems && (
            <div className="flex gap-1">
              {confirming && (
                <button
                  onClick={() => { setConfirming(false); clearTimeout(confirmTimerRef.current); onClearCart() }}
                  className="flex items-center justify-center rounded-xl bg-muted text-muted-foreground active:bg-muted/80 transition-all min-w-[44px]"
                >
                  <Trash2 className="size-4" />
                </button>
              )}
              <button
                onClick={handlePayTap}
                className={cn(
                  'flex items-center justify-center gap-1.5 px-5 rounded-xl font-semibold text-sm transition-all min-w-[120px] shadow-sm active:scale-[0.97]',
                  confirming
                    ? 'bg-emerald-600 text-white animate-pulse'
                    : canQuickCash
                      ? 'bg-primary text-primary-foreground shadow-primary/25'
                      : 'bg-primary text-primary-foreground shadow-primary/25'
                )}
              >
                {confirming ? (
                  <><CheckCircle2 className="size-5" /> Confirm</>
                ) : (
                  <><ShoppingCart className="size-4" />{canQuickCash ? `Cash ${formatCurrency(grandTotal)}` : `Pay ${formatCurrency(grandTotal)}`}</>
                )}
              </button>
            </div>
          )}

          {/* When cart is empty — show quick action buttons */}
          {!hasItems && (
            <div className="flex gap-1">
              {heldCount > 0 && (
                <button
                  onClick={onOpenHeld}
                  className="flex items-center justify-center gap-1.5 px-4 rounded-xl bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 text-xs font-medium active:bg-amber-100 transition-all min-w-[80px]"
                >
                  <Clock className="size-4" />
                  {heldCount}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
