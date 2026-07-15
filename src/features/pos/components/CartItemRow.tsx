import { useState, useRef, useEffect } from 'react'
import { Minus, Plus, Trash2, ChevronDown, Check } from 'lucide-react'
import { formatCurrency } from '@/data/dashboard'
import { cn } from '@/lib/utils'
import type { CartItem, PackagingConfig } from '@/types'

interface CartItemRowProps {
  item: CartItem
  packagingOptions: PackagingConfig[]
  onUpdateQuantity: (productId: string, delta: number) => void
  onChangePackaging: (productId: string, packagingName: string) => void
}

export default function CartItemRow({ item, packagingOptions, onUpdateQuantity, onChangePackaging }: CartItemRowProps) {
  const [open, setOpen] = useState(false)
  const [editingQty, setEditingQty] = useState(false)
  const [qtyInput, setQtyInput] = useState(String(item.packagingQuantity))
  const qtyInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editingQty) qtyInputRef.current?.focus()
  }, [editingQty])

  useEffect(() => {
    if (!editingQty) setQtyInput(String(item.packagingQuantity))
  }, [item.packagingQuantity, editingQty])

  const handleQtySave = () => {
    const val = parseInt(qtyInput)
    if (!isNaN(val) && val > 0) {
      const diff = val - item.packagingQuantity
      if (diff > 0) for (let i = 0; i < diff; i++) onUpdateQuantity(item.productId, 1)
      else if (diff < 0) for (let i = 0; i < -diff; i++) onUpdateQuantity(item.productId, -1)
    }
    setEditingQty(false)
  }

  return (
    <div className="flex items-center gap-3 py-2.5 px-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors group">
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium text-foreground truncate">{item.name}</h4>
        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
          {packagingOptions.length > 1 && (
            <div className="relative">
              <button
                onClick={(e) => { e.stopPropagation(); setOpen(!open) }}
                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-medium bg-background border border-border hover:border-ring transition-colors"
              >
                <span>{item.packagingName}</span>
                <ChevronDown className="size-3" />
              </button>
              {open && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
                  <div className="absolute left-0 bottom-full mb-1 z-50 min-w-[140px] rounded-lg border border-border bg-popover shadow-lg overflow-hidden">
                    {packagingOptions.map((pkg) => {
                      const isSelected = pkg.name === item.packagingName
                      return (
                        <button
                          key={pkg.name}
                          onClick={() => { onChangePackaging(item.productId, pkg.name); setOpen(false) }}
                          className={cn('flex items-center justify-between w-full px-3 py-2 text-xs text-left transition-colors', isSelected ? 'bg-primary/10 text-foreground font-medium' : 'hover:bg-muted text-muted-foreground')}
                        >
                          <span>{pkg.name} ({formatCurrency(pkg.salePrice)})</span>
                          {isSelected && <Check className="size-3 text-primary" />}
                        </button>
                      )
                    })}
                  </div>
                </>
              )}
            </div>
          )}
          <span className="text-xs text-muted-foreground">{formatCurrency(item.unitPrice)}</span>
          <span className="text-xs text-muted-foreground/50">·</span>
          <span className="text-xs font-semibold text-foreground">{formatCurrency(item.total)}</span>
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <button
          onClick={() => onUpdateQuantity(item.productId, -1)}
          className="flex items-center justify-center size-9 rounded-lg bg-background border border-border hover:bg-muted text-foreground transition-colors"
        >
          {item.packagingQuantity === 1 ? <Trash2 className="size-3.5 text-red-400" /> : <Minus className="size-3.5" />}
        </button>
        {editingQty ? (
          <input
            ref={qtyInputRef}
            type="number"
            value={qtyInput}
            onChange={(e) => setQtyInput(e.target.value)}
            onBlur={handleQtySave}
            onKeyDown={(e) => { if (e.key === 'Enter') handleQtySave() }}
            className="w-12 h-9 text-center text-sm font-bold rounded-lg border border-primary bg-background outline-none tabular-nums"
            min="1"
            autoFocus
          />
        ) : (
          <button
            onClick={() => setEditingQty(true)}
            className="w-10 h-9 flex items-center justify-center text-sm font-bold text-foreground tabular-nums hover:bg-muted/50 rounded-lg transition-colors"
          >
            {item.packagingQuantity}
          </button>
        )}
        <button
          onClick={() => onUpdateQuantity(item.productId, 1)}
          className="flex items-center justify-center size-9 rounded-lg bg-background border border-border hover:bg-muted text-foreground transition-colors"
        >
          <Plus className="size-3.5" />
        </button>
      </div>
    </div>
  )
}
