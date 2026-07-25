import { useState } from 'react'
import { Package, AlertTriangle, FlaskConical, Plus } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { addInventoryTransaction, getProductById } from '@/data/inventory'
import { useApplication } from '@/features/transactions/TransactionContext'
import { toast } from 'sonner'

const ADJUSTMENT_TYPES = [
  { value: 'adjustment' as const, label: 'Adjustment', icon: Package, desc: 'Stock count correction (±)' },
  { value: 'damage' as const, label: 'Damage', icon: AlertTriangle, desc: 'Damaged or spoilt goods (−)' },
  { value: 'consumption' as const, label: 'Consumption', icon: FlaskConical, desc: 'Internal usage (−)' },
]

interface AdjustStockDialogProps {
  productId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function AdjustStockDialog({ productId, open, onOpenChange }: AdjustStockDialogProps) {
  const { eventBus } = useApplication()
  const product = getProductById(productId)
  const [type, setType] = useState<'adjustment' | 'damage' | 'consumption'>('adjustment')
  const [quantity, setQuantity] = useState('')
  const [direction, setDirection] = useState<'add' | 'remove'>('add')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)

  if (!product) return null

  const handleSave = () => {
    const qty = parseInt(quantity)
    if (!qty || qty <= 0) {
      toast.error('Enter a valid quantity')
      return
    }

    setSaving(true)
    const signedQty = direction === 'remove' ? -qty : qty

    // Adjust based on type: damage and consumption default to removal
    const finalQty = (type === 'damage' || type === 'consumption') ? -Math.abs(signedQty) : signedQty

    const txn = addInventoryTransaction({
      productId,
      type,
      quantity: finalQty,
      notes: notes || undefined,
    })

    if (txn) {
      eventBus.emit('InventoryAdjusted', {
        type: 'InventoryAdjusted',
        productId,
        quantity: finalQty,
        transactionType: type,
        timestamp: new Date().toISOString(),
      })
      toast.success(`Stock adjusted: ${finalQty > 0 ? '+' : ''}${finalQty} ${product.baseUnit}${Math.abs(finalQty) !== 1 ? 's' : ''}`)
      onOpenChange(false)
    } else {
      toast.error('Failed to adjust stock')
    }
    setSaving(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md gap-0 p-0">
        <DialogHeader className="p-5 pb-3">
          <DialogTitle className="text-base">Adjust Stock — {product.name}</DialogTitle>
        </DialogHeader>

        <div className="px-5 pb-4 space-y-4">
          {/* Current stock display */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 text-sm">
            <span className="text-muted-foreground">Current Stock</span>
            <span className="font-bold text-lg">{product.stockQuantity.toLocaleString()} {product.baseUnit}{product.stockQuantity !== 1 ? 's' : ''}</span>
          </div>

          {/* Adjustment type */}
          <div>
            <label className="block text-xs font-medium mb-2">Type</label>
            <div className="grid grid-cols-3 gap-2">
              {ADJUSTMENT_TYPES.map((at) => {
                const Icon = at.icon
                const isActive = type === at.value
                return (
                  <button
                    key={at.value}
                    onClick={() => {
                      setType(at.value)
                      setDirection(at.value === 'adjustment' ? 'add' : 'remove')
                    }}
                    className={cn(
                      'flex flex-col items-center gap-1 p-3 rounded-xl border text-center transition-all',
                      isActive ? 'border-primary bg-primary/5 ring-1 ring-primary/30' : 'border-border hover:border-muted-foreground/30',
                    )}
                  >
                    <Icon className={cn('size-4', isActive ? 'text-primary' : 'text-muted-foreground')} />
                    <span className={cn('text-xs font-medium', isActive ? 'text-foreground' : 'text-muted-foreground')}>{at.label}</span>
                    <span className="text-[9px] text-muted-foreground">{at.desc}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Direction (only for adjustment) */}
          {type === 'adjustment' && (
            <div>
              <label className="block text-xs font-medium mb-2">Direction</label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setDirection('add')}
                  className={cn(
                    'flex-1 h-9 rounded-lg text-xs font-medium border transition-colors',
                    direction === 'add' ? 'bg-emerald-500 text-white border-emerald-500' : 'border-border text-muted-foreground hover:text-foreground',
                  )}
                >
                  <Plus className="size-3.5 inline mr-1" /> Add Stock
                </button>
                <button
                  onClick={() => setDirection('remove')}
                  className={cn(
                    'flex-1 h-9 rounded-lg text-xs font-medium border transition-colors',
                    direction === 'remove' ? 'bg-red-500 text-white border-red-500' : 'border-border text-muted-foreground hover:text-foreground',
                  )}
                >
                  − Remove Stock
                </button>
              </div>
            </div>
          )}

          {/* Quantity */}
          <div>
            <label className="block text-xs font-medium mb-1.5">Quantity (in {product.baseUnit}s)</label>
            <input
              type="number" min="1" value={quantity} onChange={(e) => setQuantity(e.target.value)}
              placeholder="Enter quantity..."
              autoFocus
              className="w-full h-10 px-3 rounded-xl border border-input bg-background text-sm outline-none focus:border-ring transition-colors"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium mb-1.5">Reason / Notes</label>
            <input
              type="text" value={notes} onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Physical count correction, expired stock..."
              className="w-full h-10 px-3 rounded-xl border border-input bg-background text-sm outline-none focus:border-ring transition-colors"
            />
          </div>

          {/* Preview */}
          {quantity && parseInt(quantity) > 0 && (
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 text-sm">
              <span className="text-muted-foreground">New Stock</span>
              <span className="font-bold text-base">
                {(
                  product.stockQuantity + (
                    (type === 'damage' || type === 'consumption')
                      ? -Math.abs(parseInt(quantity))
                      : direction === 'remove'
                        ? -Math.abs(parseInt(quantity))
                        : parseInt(quantity)
                  )
                ).toLocaleString()} {product.baseUnit}s
              </span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="border-t border-border px-5 py-3 flex items-center justify-end gap-2">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button size="sm" disabled={saving || !quantity || parseInt(quantity) <= 0} onClick={handleSave}>
            {saving ? 'Saving...' : 'Save Adjustment'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
