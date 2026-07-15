import { useState } from 'react'
import { Percent } from 'lucide-react'
import { formatCurrency } from '@/data/dashboard'
import { cn } from '@/lib/utils'

interface CartSummaryProps {
  subtotal: number
  discount: number
  grandTotal: number
  itemCount: number
  onDiscountChange: (v: number) => void
}

export default function CartSummary({ subtotal, discount, grandTotal, itemCount, onDiscountChange }: CartSummaryProps) {
  const [editingDiscount, setEditingDiscount] = useState(false)
  const [discountInput, setDiscountInput] = useState('0')
  const [discountMode, setDiscountMode] = useState<'flat' | 'percent'>('flat')

  const handleOpenEdit = () => {
    setDiscountInput(discountMode === 'percent' && subtotal > 0 ? String(Math.round((discount / subtotal) * 100)) : String(discount))
    setEditingDiscount(true)
  }

  const handleSave = () => {
    const val = parseFloat(discountInput) || 0
    if (discountMode === 'percent' && subtotal > 0) {
      onDiscountChange(Math.round(subtotal * (Math.min(val, 100) / 100)))
    } else {
      onDiscountChange(Math.max(0, val))
    }
    setEditingDiscount(false)
  }

  return (
    <div className="space-y-2.5">
      <div className="rounded-xl bg-muted/30 p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Percent className="size-3.5 text-muted-foreground" />
            <span className="text-xs font-medium text-foreground">Discount</span>
          </div>
          {editingDiscount ? (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setDiscountMode(discountMode === 'flat' ? 'percent' : 'flat')}
                className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-muted text-muted-foreground hover:bg-muted/80"
              >
                {discountMode === 'flat' ? 'Rs.' : '%'}
              </button>
              <input
                type="number"
                value={discountInput}
                onChange={(e) => setDiscountInput(e.target.value)}
                onBlur={handleSave}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSave() }}
                className="w-20 h-7 px-2 rounded-md border border-input bg-background text-xs font-medium text-right outline-none"
                autoFocus
                min="0"
              />
            </div>
          ) : (
            <button
              onClick={handleOpenEdit}
              className={cn('text-xs font-semibold px-2 py-0.5 rounded-md transition-colors', discount > 0 ? 'text-red-500 bg-red-50 dark:bg-red-500/10' : 'text-muted-foreground hover:text-foreground')}
            >
              {discount > 0 ? `-Rs. ${discount.toLocaleString()}` : 'Add'}
            </button>
          )}
        </div>
      </div>

      <div className="space-y-1.5 px-1">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Subtotal ({itemCount} items)</span>
          <span className="font-medium text-foreground">{formatCurrency(subtotal)}</span>
        </div>
        {discount > 0 && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Discount</span>
            <span className="font-medium text-red-500">-{formatCurrency(discount)}</span>
          </div>
        )}
        <div className="flex items-center justify-between pt-1.5 border-t border-border">
          <span className="text-sm font-semibold text-foreground">Grand Total</span>
          <span className="text-lg font-bold text-foreground">{formatCurrency(grandTotal)}</span>
        </div>
      </div>
    </div>
  )
}
