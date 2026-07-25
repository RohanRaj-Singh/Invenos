import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { CheckCircle2 } from 'lucide-react'
import { formatCurrency } from '@/lib/format'

interface ConfirmItem {
  name: string
  qty: number
  cost: number
  total: number
  unitName?: string
}

interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (v: boolean) => void
  itemCount: number
  items?: ConfirmItem[]
  subtotal?: number
  discount?: number
  grandTotal: number
  amountPaid: string
  partyName: string | null
  showParty: boolean
  paymentMethod?: string
  title?: string
  actionLabel?: string
  onConfirm: () => void
}

export function ConfirmTransactionDialog({
  open,
  onOpenChange,
  itemCount,
  items,
  subtotal,
  discount = 0,
  grandTotal,
  amountPaid,
  partyName,
  showParty,
  paymentMethod,
  title = 'Confirm Sale',
  actionLabel = 'Confirm Sale',
  onConfirm,
}: ConfirmDialogProps) {
  const paid = parseFloat(amountPaid) || grandTotal
  const change = paid > grandTotal ? paid - grandTotal : 0
  const outstanding = grandTotal - Math.min(paid, grandTotal)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md gap-0 p-0">
        <DialogHeader className="p-5 pb-0">
          <DialogTitle className="text-base">{title}</DialogTitle>
          <DialogDescription className="text-xs">
            {showParty && partyName && `Supplier: ${partyName}`}
            {paymentMethod && ` · ${paymentMethod}`}
          </DialogDescription>
        </DialogHeader>
        <div className="p-5 space-y-3">
          {items && items.length > 0 && (
            <div className="rounded-xl border border-border overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-muted/30">
                    <th className="px-3 py-1.5 text-left text-[10px] font-semibold text-muted-foreground uppercase">Item</th>
                    <th className="px-3 py-1.5 text-center text-[10px] font-semibold text-muted-foreground uppercase w-12">Qty</th>
                    <th className="px-3 py-1.5 text-right text-[10px] font-semibold text-muted-foreground uppercase w-20">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, i) => (
                    <tr key={i} className="border-t border-border">
                      <td className="px-3 py-1.5 text-xs">
                        <span className="font-medium text-foreground">{item.name}</span>
                        {item.unitName && <span className="text-muted-foreground ml-1">· {item.unitName}</span>}
                      </td>
                      <td className="px-3 py-1.5 text-xs text-center tabular-nums">{item.qty}</td>
                      <td className="px-3 py-1.5 text-xs text-right font-medium tabular-nums">{formatCurrency(item.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="rounded-xl bg-muted/30 p-4 space-y-1.5 text-sm">
            {subtotal !== undefined && discount > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">{formatCurrency(subtotal)}</span>
              </div>
            )}
            {discount > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Discount</span>
                <span className="font-medium text-amber-600">-{formatCurrency(discount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Grand Total</span>
              <span className="font-bold text-foreground">{formatCurrency(grandTotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Payment</span>
              <span className="font-semibold">{formatCurrency(paid)}</span>
            </div>
            {outstanding > 0 && paid > 0 && (
              <div className="flex justify-between text-amber-600">
                <span className="font-medium">Outstanding</span>
                <span className="font-bold">{formatCurrency(outstanding)}</span>
              </div>
            )}
            {change > 0 && (
              <div className="flex justify-between pt-1 border-t border-emerald-200 text-emerald-600 dark:text-emerald-400">
                <span className="font-medium">Change Due</span>
                <span className="font-bold">{formatCurrency(change)}</span>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1 h-10" onClick={() => onOpenChange(false)}>
              Back
            </Button>
            <Button className="flex-1 h-10 gap-1.5 shadow-sm" onClick={() => { onOpenChange(false); onConfirm() }}>
              <CheckCircle2 className="size-4" /> {actionLabel}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
