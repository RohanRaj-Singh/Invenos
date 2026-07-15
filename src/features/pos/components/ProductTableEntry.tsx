import { useState, useRef, useCallback, useEffect } from 'react'
import { Plus, Trash2, Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/data/dashboard'
import { posProducts } from '@/data/pos'
import type { Product, CartItem } from '@/types'

export interface CartItemExtras {
  priceOverride?: number
  itemDiscount?: number
  itemDiscountPercent?: number
}

interface ProductTableEntryProps {
  cart: CartItem[]
  onAddToCart: (product: Product) => void
  onUpdateQuantity: (productId: string, delta: number) => void
  onChangePackaging: (productId: string, packagingName: string) => void
  onRemoveItem: (productId: string) => void
  onPriceOverride?: (productId: string, newPrice: number) => void
  onItemDiscount?: (productId: string, discount: number) => void
}

export default function ProductTableEntry({ cart, onAddToCart, onUpdateQuantity, onChangePackaging, onRemoveItem, onPriceOverride, onItemDiscount }: ProductTableEntryProps) {
  const [rowSearch, setRowSearch] = useState('')
  const [showResults, setShowResults] = useState(false)
  const [priceInputs, setPriceInputs] = useState<Record<string, string>>({})
  const [editingPrice, setEditingPrice] = useState<Record<string, boolean>>({})
  const [discPercentages, setDiscPercentages] = useState<Record<string, string>>({})
  const [editingDisc, setEditingDisc] = useState<Record<string, boolean>>({})
  const inputRef = useRef<HTMLInputElement>(null)

  const searchResults = rowSearch.trim()
    ? posProducts.filter(
        (p) => p.name.toLowerCase().includes(rowSearch.toLowerCase()) || p.sku.toLowerCase().includes(rowSearch.toLowerCase())
      ).slice(0, 8)
    : []

  const handleSelect = useCallback((product: Product) => {
    onAddToCart(product)
    setRowSearch('')
    setShowResults(false)
    inputRef.current?.focus()
  }, [onAddToCart])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchResults.length > 0) handleSelect(searchResults[0])
    if (e.key === 'Escape') { setRowSearch(''); setShowResults(false) }
  }

  const handlePriceChange = (productId: string, value: string) => {
    setPriceInputs((p) => ({ ...p, [productId]: value }))
  }

  const handlePriceBlur = (productId: string, defaultValue: number) => {
    const val = parseFloat(priceInputs[productId] || '')
    if (val && val > 0 && val !== defaultValue) {
      onPriceOverride?.(productId, val)
    }
    setEditingPrice((p) => ({ ...p, [productId]: false }))
  }

  const handleDiscChange = (productId: string, value: string) => {
    setDiscPercentages((p) => ({ ...p, [productId]: value }))
  }

  const handleDiscBlur = (productId: string, itemTotal: number) => {
    const val = parseFloat(discPercentages[productId] || '')
    if (val > 0 && val <= 100) {
      const discAmount = Math.round(itemTotal * (val / 100))
      onItemDiscount?.(productId, discAmount)
    }
    setEditingDisc((p) => ({ ...p, [productId]: false }))
  }

  return (
    <div className="space-y-2">
      <div className="relative">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search product to add... (type name or SKU, Enter to add first result)"
              value={rowSearch}
              onChange={(e) => { setRowSearch(e.target.value); setShowResults(true) }}
              onFocus={() => setShowResults(true)}
              onKeyDown={handleKeyDown}
              className="w-full h-10 pl-9 pr-3 rounded-lg border border-input bg-background text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring/30"
              autoComplete="off"
            />
            {rowSearch && (
              <button onClick={() => { setRowSearch(''); setShowResults(false) }} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <X className="size-3.5" />
              </button>
            )}
          </div>
        </div>
        {showResults && rowSearch && searchResults.length > 0 && (
          <div className="absolute z-20 left-0 right-0 mt-1 rounded-xl border border-border bg-popover shadow-lg overflow-hidden">
            {searchResults.map((product) => {
              const smallestPkg = product.packaging.reduce((a, b) => a.quantity < b.quantity ? a : b, product.packaging[0])
              return (
                <button key={product.id} onClick={() => handleSelect(product)}
                  className="flex items-center justify-between w-full px-3 py-2.5 text-sm hover:bg-muted transition-colors text-left">
                  <div className="flex items-center gap-2 min-w-0">
                    <Plus className="size-3.5 text-primary shrink-0" />
                    <span className="font-medium truncate">{product.name}</span>
                    <code className="text-[10px] font-mono text-muted-foreground shrink-0">{product.sku}</code>
                  </div>
                  <span className="text-xs font-semibold shrink-0">{formatCurrency(smallestPkg?.salePrice || 0)}</span>
                </button>
              )
            })}
          </div>
        )}
      </div>

      <div className="rounded-xl border border-border overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <Th className="w-12">#</Th>
              <Th>Product</Th>
              <Th className="w-20">Packaging</Th>
              <Th className="w-20 text-right">Qty</Th>
              <Th className="w-24 text-right">Price</Th>
              <Th className="w-20 text-right">Disc%</Th>
              <Th className="w-24 text-right">Total</Th>
              <Th className="w-8" />
            </tr>
          </thead>
          <tbody>
            {cart.length === 0 ? (
              <tr><td colSpan={8} className="text-center py-12 text-sm text-muted-foreground"><span>No items in cart. Search and add products above.</span></td></tr>
            ) : (
              cart.map((item, idx) => {
                const product = posProducts.find((p) => p.id === item.productId)
                const packagings = product?.packaging || []
                const isEditingPrice = editingPrice[item.productId]
                const isEditingDisc = editingDisc[item.productId]
                return (
                  <tr key={item.productId} className="border-b border-border last:border-b-0 hover:bg-muted/20 transition-colors">
                    <td className="px-3 py-2.5 text-xs text-muted-foreground">{idx + 1}</td>
                    <td className="px-3 py-2.5"><span className="text-sm font-medium text-foreground">{item.name}</span></td>
                    <td className="px-3 py-2.5">
                      <select value={item.packagingName} onChange={(e) => onChangePackaging(item.productId, e.target.value)}
                        className="h-8 px-2 rounded-md border border-input bg-background text-xs outline-none focus:border-ring">
                        {packagings.map((p) => (<option key={p.name} value={p.name}>{p.name}</option>))}
                      </select>
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => onUpdateQuantity(item.productId, -1)}
                          className="flex items-center justify-center size-8 rounded-md bg-muted hover:bg-muted/80 text-foreground text-xs">−</button>
                        <span className="w-8 text-center text-sm font-semibold tabular-nums">{item.packagingQuantity}</span>
                        <button onClick={() => onUpdateQuantity(item.productId, 1)}
                          className="flex items-center justify-center size-8 rounded-md bg-primary text-primary-foreground text-xs hover:bg-primary/90">+</button>
                      </div>
                    </td>
                    <td className="px-3 py-2.5">
                      {isEditingPrice ? (
                        <input
                          type="number" value={priceInputs[item.productId] ?? item.unitPrice}
                          onChange={(e) => handlePriceChange(item.productId, e.target.value)}
                          onBlur={() => handlePriceBlur(item.productId, item.unitPrice)}
                          onKeyDown={(e) => { if (e.key === 'Enter') handlePriceBlur(item.productId, item.unitPrice) }}
                          className="w-full h-8 px-2 rounded-md border border-primary bg-background text-sm font-semibold text-right outline-none tabular-nums"
                          min="0" autoFocus
                        />
                      ) : (
                        <button
                          onClick={() => { setPriceInputs((p) => ({ ...p, [item.productId]: String(item.unitPrice) })); setEditingPrice((p) => ({ ...p, [item.productId]: true })) }}
                          className="w-full h-8 px-2 rounded-md border border-transparent hover:border-input text-sm font-semibold text-right tabular-nums hover:bg-muted/30 transition-colors"
                        >
                          {formatCurrency(item.unitPrice)}
                        </button>
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      {isEditingDisc ? (
                        <input
                          type="number" value={discPercentages[item.productId] ?? ''}
                          onChange={(e) => handleDiscChange(item.productId, e.target.value)}
                          onBlur={() => handleDiscBlur(item.productId, item.total)}
                          onKeyDown={(e) => { if (e.key === 'Enter') handleDiscBlur(item.productId, item.total) }}
                          className="w-16 h-8 px-2 rounded-md border border-primary bg-background text-xs font-medium text-right outline-none tabular-nums"
                          min="0" max="100" autoFocus placeholder="0"
                        />
                      ) : (
                        <button
                          onClick={() => { setEditingDisc((p) => ({ ...p, [item.productId]: true })); setDiscPercentages((p) => ({ ...p, [item.productId]: '' })) }}
                          className="h-8 px-2 rounded-md border border-transparent hover:border-input text-xs font-medium hover:bg-muted/30 transition-colors"
                        >
                          —
                        </button>
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <span className="text-sm font-semibold text-foreground tabular-nums">{formatCurrency(item.total)}</span>
                    </td>
                    <td className="px-3 py-2.5">
                      <button onClick={() => onRemoveItem(item.productId)}
                        className="flex items-center justify-center size-8 rounded-md hover:bg-red-50 text-muted-foreground hover:text-red-500 transition-colors">
                        <Trash2 className="size-3.5" />
                      </button>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {cart.length === 0 && !rowSearch && (
        <div className="text-center text-xs text-muted-foreground py-2">Start typing a product name or SKU above to add items</div>
      )}
    </div>
  )
}

function Th({ children, className }: { children?: React.ReactNode; className?: string }) {
  return <th className={cn('px-3 py-2.5 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider', className)}>{children}</th>
}
