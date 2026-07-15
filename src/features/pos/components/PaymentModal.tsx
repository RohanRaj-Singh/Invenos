import { useState, useEffect, useRef } from 'react'
import { CheckCircle2, Banknote, CreditCard, Building2, Smartphone, Receipt, X, Wallet } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { formatCurrency } from '@/data/dashboard'
import { cn } from '@/lib/utils'
import type { POSCustomer, PaymentMethod } from '@/types'

interface PaymentModalProps {
  open: boolean
  onClose: () => void
  onConfirm: (method: PaymentMethod, amountPaid: number) => void
  grandTotal: number
  itemCount: number
  customer: POSCustomer
}

const paymentMethods: { id: PaymentMethod; label: string; desc: string; icon: typeof Banknote; color: string; bgClass: string }[] = [
  { id:'cash', label:'Cash', desc:'Receive cash payment', icon: Banknote, color:'text-emerald-600', bgClass:'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-800' },
  { id:'easypaisa', label:'Easypaisa', desc:'Mobile account transfer', icon: Smartphone, color:'text-orange-600', bgClass:'bg-orange-50 dark:bg-orange-500/10 border-orange-200 dark:border-orange-800' },
  { id:'jazzcash', label:'JazzCash', desc:'Mobile account transfer', icon: Wallet, color:'text-red-600', bgClass:'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-800' },
  { id:'card', label:'Card', desc:'Debit / Credit card', icon: CreditCard, color:'text-blue-600', bgClass:'bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-800' },
  { id:'transfer', label:'Bank Transfer', desc:'Online / bank transfer', icon: Building2, color:'text-purple-600', bgClass:'bg-purple-50 dark:bg-purple-500/10 border-purple-200 dark:border-purple-800' },
]

const QUICK_AMOUNTS = [100, 500, 1000, 2000]

export default function PaymentModal({ open, onClose, onConfirm, grandTotal, itemCount, customer }: PaymentModalProps) {
  const [selected, setSelected] = useState<PaymentMethod | null>(null)
  const [amountPaid, setAmountPaid] = useState('')
  const [processing, setProcessing] = useState(false)
  const amountRef = useRef<HTMLInputElement>(null)
  const isCash = selected === 'cash'

  useEffect(() => { if (open) { setSelected(null); setAmountPaid(''); setProcessing(false); setAmountPaid('') } }, [open])

  const paidValue = parseFloat(amountPaid) || 0
  const change = isCash && paidValue > grandTotal ? paidValue - grandTotal : 0
  const effectivePaid = isCash ? Math.max(paidValue, grandTotal) : paidValue
  const isPartial = paidValue > 0 && paidValue < grandTotal
  const isExact = paidValue >= grandTotal
  const canConfirm = selected && paidValue > 0

  const handleQuickAmount = (amt: number) => { setAmountPaid((grandTotal + amt).toString()) }
  const handleExactAmount = () => { setAmountPaid(grandTotal.toString()) }

  const handleConfirm = () => {
    if (!canConfirm) return
    setProcessing(true)
    setTimeout(() => {
      onConfirm(selected!, effectivePaid)
      setProcessing(false)
    }, 400)
  }

  const handleAmountKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && canConfirm) handleConfirm()
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v && !processing) onClose() }}>
      <DialogContent className="sm:max-w-lg gap-0 p-0">
        <DialogHeader className="p-5 pb-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-base">Complete Sale</DialogTitle>
            <button onClick={onClose} disabled={processing} className="flex items-center justify-center size-7 rounded-md hover:bg-muted transition-colors disabled:opacity-30">
              <X className="size-4" />
            </button>
          </div>
          <DialogDescription className="text-xs">Enter the amount received and select payment method.</DialogDescription>
        </DialogHeader>

        <div className="p-5 space-y-4">
          <div className="rounded-xl bg-muted/30 p-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Customer</span>
              <span className="font-medium text-foreground">{customer.name}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Items</span>
              <span className="font-medium text-foreground">{itemCount} item{itemCount > 1 ? 's' : ''}</span>
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-border">
              <span className="text-sm font-semibold text-foreground">Total Due</span>
              <span className="text-xl font-bold text-foreground">{formatCurrency(grandTotal)}</span>
            </div>
            {change > 0 && (
              <div className="flex items-center justify-between pt-1 border-t border-emerald-200 dark:border-emerald-800">
                <span className="text-sm font-semibold text-emerald-600">Change Due</span>
                <span className="text-lg font-bold text-emerald-600">{formatCurrency(change)}</span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Payment Method</span>
            <div className="grid grid-cols-5 gap-2">
              {paymentMethods.map((method) => {
                const Icon = method.icon
                const isSel = selected === method.id
                return (
                  <button key={method.id} onClick={() => { setSelected(method.id); if (!amountPaid) setAmountPaid(grandTotal.toString()); setTimeout(() => amountRef.current?.focus(), 50) }}
                    className={cn('flex flex-col items-center gap-1 p-2.5 rounded-xl border-2 transition-all',
                      isSel ? `${method.bgClass} ring-2 ring-offset-1 ${method.color.replace('text-', 'ring-')}` : 'border-border hover:border-muted-foreground/30 bg-background'
                    )}>
                    <Icon className={cn('size-5', isSel ? method.color : 'text-muted-foreground')} />
                    <span className={cn('text-[10px] font-semibold leading-tight', isSel ? 'text-foreground' : 'text-muted-foreground')}>{method.label}</span>
                    {isSel && <CheckCircle2 className={cn('size-3', method.color)} />}
                  </button>
                )
              })}
            </div>
          </div>

          {selected && (
            <div className="space-y-3 rounded-xl bg-muted/30 p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-foreground">{isCash ? 'Amount Tendered' : 'Amount Received'}</span>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-muted-foreground">Rs.</span>
                  <input
                    ref={amountRef}
                    type="number"
                    value={amountPaid}
                    onChange={(e) => setAmountPaid(e.target.value)}
                    onKeyDown={handleAmountKeyDown}
                    className="w-28 h-8 px-2 rounded-md border border-input bg-background text-sm font-semibold text-right outline-none focus:border-ring"
                    autoFocus
                    min="0"
                  />
                </div>
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                <button onClick={handleExactAmount} className="px-2.5 py-1 rounded-md bg-primary text-primary-foreground text-[10px] font-medium hover:bg-primary/90">
                  {isCash ? 'Exact' : `Full (${formatCurrency(grandTotal)})`}
                </button>
                {isCash && QUICK_AMOUNTS.map((amt) => (
                  <button key={amt} onClick={() => handleQuickAmount(amt)}
                    className="px-2.5 py-1 rounded-md bg-background border border-border text-[10px] font-medium hover:bg-muted transition-colors">
                    +{formatCurrency(amt)}
                  </button>
                ))}
              </div>

              {paidValue > 0 && paidValue < grandTotal && (
                <p className="text-[11px] text-amber-600">Partial payment — {formatCurrency(grandTotal - paidValue)} outstanding will be recorded</p>
              )}
              {paidValue >= grandTotal && !isCash && (
                <p className="text-[11px] text-emerald-600">Full payment — no outstanding balance</p>
              )}
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <Button variant="outline" size="lg" className="flex-1 h-11" onClick={onClose} disabled={processing}>Cancel</Button>
            <Button size="lg" className="flex-1 h-11 gap-1.5 shadow-sm" disabled={!canConfirm || processing} onClick={handleConfirm}>
              {processing ? (
                <span className="flex items-center gap-2"><span className="size-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />Processing...</span>
              ) : (
                <><Receipt className="size-4" />{isExact ? 'Complete Sale' : isPartial ? 'Record Partial Payment' : `Collect ${formatCurrency(effectivePaid)}`}</>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
