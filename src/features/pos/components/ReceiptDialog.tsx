import { useNavigate } from 'react-router-dom'
import { Receipt, Printer, Share2, ExternalLink, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/data/dashboard'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import type { CartItem, POSCustomer, PaymentMethod } from '@/types'

interface ReceiptDialogProps {
  open: boolean
  saleData: {
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
  } | null
  onClose: () => void
  onNewSale: () => void
}

export default function ReceiptDialog({ open, saleData, onClose, onNewSale }: ReceiptDialogProps) {
  const navigate = useNavigate()

  if (!saleData) return null

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose() }}>
      <DialogContent className="sm:max-w-md gap-0 p-0 max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-emerald-500/10 to-emerald-400/5 p-6 text-center border-b border-border">
          <div className="inline-flex items-center justify-center size-14 rounded-full bg-emerald-50 dark:bg-emerald-500/10 mb-3 ring-4 ring-emerald-500/10">
            <Receipt className="size-7 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-lg font-bold text-foreground">Sale Successful</div>
          <div className="text-xs text-muted-foreground mt-1">{saleData.invoiceNumber}</div>
        </div>

        <div className="p-5 space-y-4">
          <div className="rounded-xl bg-muted/30 p-4 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Customer</span>
              <span className="font-medium text-foreground">{saleData.customer.name}</span>
            </div>

            <div className="border-t border-border pt-2 space-y-1.5">
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Items</div>
              {saleData.items.map((item) => (
                <div key={item.id || item.productId} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground truncate max-w-[60%]">{item.name} ×{item.packagingQuantity}</span>
                  <span className="font-medium text-foreground">{formatCurrency(item.total)}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-border pt-2 space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">{formatCurrency(saleData.subtotal)}</span>
              </div>
              {saleData.discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Discount</span>
                  <span className="font-medium text-red-500">-{formatCurrency(saleData.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-semibold pt-1 border-t border-border">
                <span className="text-foreground">Grand Total</span>
                <span className="text-foreground">{formatCurrency(saleData.grandTotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Payment Method</span>
                <Badge variant="outline" className="text-[10px] px-2 py-0 h-5 font-medium capitalize">{saleData.method}</Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Amount Paid</span>
                <span className={cn('font-semibold', saleData.amountPaid >= saleData.grandTotal ? 'text-emerald-600' : 'text-amber-600')}>
                  {formatCurrency(saleData.amountPaid)}
                </span>
              </div>
              {saleData.outstanding > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Outstanding</span>
                  <span className="font-semibold text-amber-600">{formatCurrency(saleData.outstanding)}</span>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" className="gap-1.5 h-10" onClick={() => toast.success('Receipt sent to printer (prototype)')}>
              <Printer className="size-4" /> Print Receipt
            </Button>
            <Button variant="outline" className="gap-1.5 h-10" onClick={() => toast.success('Receipt link copied (prototype)')}>
              <Share2 className="size-4" /> Share Receipt
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" className="gap-1.5 h-10" onClick={() => { onClose(); navigate(`/sales/${saleData.saleId}`) }}>
              <ExternalLink className="size-4" /> View Sale
            </Button>
            <Button className="gap-1.5 h-10 shadow-sm" onClick={onNewSale}>
              <RefreshCw className="size-4" /> New Sale
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
