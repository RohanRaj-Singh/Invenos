import { useState } from 'react'
import { CheckCircle2, Banknote, CreditCard, Building2, Receipt, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { formatCurrency } from '@/data/dashboard'
import { cn } from '@/lib/utils'
import type { POSCustomer } from '@/types'

interface PaymentModalProps {
  open: boolean
  onClose: () => void
  onConfirm: (method: 'cash' | 'card' | 'transfer') => void
  grandTotal: number
  itemCount: number
  customer: POSCustomer
}

const paymentMethods = [
  {
    id: 'cash' as const,
    label: 'Cash',
    description: 'Receive cash payment',
    icon: Banknote,
    color: 'text-emerald-600',
    bgClass: 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-800',
    hoverClass: 'hover:border-emerald-300 dark:hover:border-emerald-700',
  },
  {
    id: 'card' as const,
    label: 'Card',
    description: 'Debit / Credit card',
    icon: CreditCard,
    color: 'text-blue-600',
    bgClass: 'bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-800',
    hoverClass: 'hover:border-blue-300 dark:hover:border-blue-700',
  },
  {
    id: 'transfer' as const,
    label: 'Transfer',
    description: 'Bank transfer / online',
    icon: Building2,
    color: 'text-purple-600',
    bgClass: 'bg-purple-50 dark:bg-purple-500/10 border-purple-200 dark:border-purple-800',
    hoverClass: 'hover:border-purple-300 dark:hover:border-purple-700',
  },
]

export default function PaymentModal({
  open,
  onClose,
  onConfirm,
  grandTotal,
  itemCount,
  customer,
}: PaymentModalProps) {
  const [selected, setSelected] = useState<'cash' | 'card' | 'transfer' | null>(null)
  const [processing, setProcessing] = useState(false)

  const handleConfirm = () => {
    if (!selected) return
    setProcessing(true)
    // Simulate processing
    setTimeout(() => {
      onConfirm(selected)
      setProcessing(false)
      setSelected(null)
    }, 500)
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose() }}>
      <DialogContent className="sm:max-w-md gap-0 p-0">
        <DialogHeader className="p-5 pb-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-base">Complete Sale</DialogTitle>
            <button onClick={onClose} className="flex items-center justify-center size-7 rounded-md hover:bg-muted transition-colors">
              <X className="size-4" />
            </button>
          </div>
          <DialogDescription className="text-xs">
            Select a payment method to complete this transaction.
          </DialogDescription>
        </DialogHeader>

        <div className="p-5 space-y-4">
          {/* Order summary */}
          <div className="rounded-xl bg-muted/30 p-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Customer</span>
              <span className="font-medium text-foreground">{customer.name}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Items</span>
              <span className="font-medium text-foreground">{itemCount} item{itemCount !== 1 ? 's' : ''}</span>
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-border">
              <span className="text-sm font-semibold text-foreground">Total Due</span>
              <span className="text-xl font-bold text-foreground">{formatCurrency(grandTotal)}</span>
            </div>
          </div>

          {/* Payment methods */}
          <div className="space-y-2">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Payment Method
            </span>
            <div className="grid grid-cols-3 gap-2.5">
              {paymentMethods.map((method) => {
                const Icon = method.icon
                const isSelected = selected === method.id
                return (
                  <button
                    key={method.id}
                    onClick={() => setSelected(method.id)}
                    className={cn(
                      'flex flex-col items-center gap-2 p-3.5 rounded-xl border-2 transition-all',
                      isSelected
                        ? `${method.bgClass} ${method.hoverClass} ring-2 ring-offset-2 ${method.color.replace('text-', 'ring-')}`
                        : 'border-border hover:border-muted-foreground/30 bg-background'
                    )}
                  >
                    <div className={cn(
                      'flex items-center justify-center size-10 rounded-full',
                      isSelected ? method.bgClass : 'bg-muted'
                    )}>
                      <Icon className={cn('size-5', isSelected ? method.color : 'text-muted-foreground')} />
                    </div>
                    <div className="text-center">
                      <div className="text-xs font-semibold text-foreground">{method.label}</div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">{method.description}</div>
                    </div>
                    {isSelected && (
                      <CheckCircle2 className={cn('size-4', method.color)} />
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Action */}
          <div className="flex gap-2 pt-1">
            <Button variant="outline" size="lg" className="flex-1 h-11" onClick={onClose}>
              Cancel
            </Button>
            <Button
              size="lg"
              className="flex-1 h-11 gap-1.5 shadow-sm"
              disabled={!selected || processing}
              onClick={handleConfirm}
            >
              {processing ? (
                <span className="flex items-center gap-2">
                  <span className="size-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Processing...
                </span>
              ) : (
                <>
                  <Receipt className="size-4" />
                  Complete Sale
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
