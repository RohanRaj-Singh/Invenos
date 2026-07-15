import { useState } from 'react'
import { Receipt, Banknote, CreditCard, Building2, Smartphone, Wallet } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { formatCurrency } from '@/data/dashboard'
import { mockContacts } from '@/data/contacts'
import { addTransaction } from '@/data/financial-transactions'
import { cn } from '@/lib/utils'
import type { PaymentMethod, Contact } from '@/types'
import { toast } from 'sonner'

const methods: { id: PaymentMethod; label: string; icon: typeof Banknote }[] = [
  { id: 'cash', label: 'Cash', icon: Banknote },
  { id: 'easypaisa', label: 'Easypaisa', icon: Smartphone },
  { id: 'jazzcash', label: 'JazzCash', icon: Wallet },
  { id: 'card', label: 'Card', icon: CreditCard },
  { id: 'transfer', label: 'Bank Transfer', icon: Building2 },
]

interface RecordPaymentDialogProps {
  open: boolean
  onClose: () => void
  contact?: Contact
  direction?: 'in' | 'out'
  linkedSaleId?: string
  maxAmount?: number
  onSuccess?: () => void
}

export default function RecordPaymentDialog({ open, onClose, contact: presetContact, direction: presetDirection, linkedSaleId, maxAmount, onSuccess }: RecordPaymentDialogProps) {
  const [direction, setDirection] = useState<'in' | 'out'>(presetDirection || 'in')
  const [contactSearch, setContactSearch] = useState('')
  const [selectedContact, setSelectedContact] = useState<Contact | null>(presetContact || null)
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null)
  const [amount, setAmount] = useState(maxAmount ? maxAmount.toString() : '')
  const [reference, setReference] = useState('')
  const [note, setNote] = useState('')
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0])
  const [processing, setProcessing] = useState(false)

  const amountValue = parseFloat(amount) || 0
  const isValid = selectedContact && selectedMethod && amountValue > 0

  const searchResults = contactSearch.trim()
    ? mockContacts.filter((c) =>
        c.name.toLowerCase().includes(contactSearch.toLowerCase()) ||
        c.phone.includes(contactSearch)
      ).slice(0, 8)
    : []

  const handleSubmit = () => {
    if (!isValid || !selectedContact || !selectedMethod) return
    const finalAmount = maxAmount ? Math.min(amountValue, maxAmount) : amountValue
    setProcessing(true)
    setTimeout(() => {
      addTransaction({
        contactId: selectedContact.id,
        direction,
        type: direction === 'in' ? 'collection' : 'refund',
        date: paymentDate,
        amount: finalAmount,
        method: selectedMethod,
        description: note || `Payment ${direction === 'in' ? 'received' : 'sent'}`,
        linkedSaleId,
        createdBy: 'Dr. Ahmed',
      })
      toast.success(`${direction === 'in' ? 'Payment received' : 'Payment sent'} — ${formatCurrency(finalAmount)}`)
      setProcessing(false)
      onSuccess?.()
      onClose()
    }, 400)
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v && !processing) onClose() }}>
      <DialogContent className="sm:max-w-sm gap-0 p-0">
        <DialogHeader className="p-5 pb-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-base">Record Payment</DialogTitle>
          </div>
        </DialogHeader>
        <div className="p-5 space-y-4">
          {/* Direction toggle */}
          {!presetDirection && (
            <div className="flex items-center gap-2 bg-muted rounded-lg p-0.5">
              <button onClick={() => setDirection('in')}
                className={cn('flex-1 px-3 py-1.5 rounded-md text-xs font-medium transition-colors', direction === 'in' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground')}>
                Money In
              </button>
              <button onClick={() => setDirection('out')}
                className={cn('flex-1 px-3 py-1.5 rounded-md text-xs font-medium transition-colors', direction === 'out' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground')}>
                Money Out
              </button>
            </div>
          )}

          {/* Party */}
          {presetContact ? (
            <div className="rounded-xl bg-muted/30 p-3 space-y-1">
              <div className="text-xs text-muted-foreground">Party</div>
              <div className="text-sm font-medium">{presetContact.name}</div>
            </div>
          ) : (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Party</label>
              <input type="text" placeholder="Search contact..." value={contactSearch}
                onChange={(e) => { setContactSearch(e.target.value); setSelectedContact(null) }}
                className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring/30" />
              {contactSearch && searchResults.length > 0 && (
                <div className="rounded-lg border border-border bg-popover shadow-sm max-h-48 overflow-y-auto">
                  {searchResults.map((c) => (
                    <button key={c.id} onClick={() => { setSelectedContact(c); setContactSearch(c.name) }}
                      className="flex items-center justify-between w-full px-3 py-2 text-sm hover:bg-muted text-left">
                      <span className="font-medium">{c.name}</span>
                      <span className="text-xs text-muted-foreground">{c.phone}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Amount */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">Amount (Rs.)</label>
            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring/30" min="1" autoFocus />
            {maxAmount && amountValue > maxAmount && (
              <p className="text-[11px] text-amber-600">Max {formatCurrency(maxAmount)}</p>
            )}
          </div>

          {/* Payment Method */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">Payment Method</label>
            <div className="grid grid-cols-5 gap-2">
              {methods.map((m) => {
                const Icon = m.icon; const isSel = selectedMethod === m.id
                return (
                  <button key={m.id} onClick={() => setSelectedMethod(m.id)}
                    className={cn('flex flex-col items-center gap-1 p-2.5 rounded-xl border-2 transition-all', isSel ? 'border-primary bg-primary/5 ring-1 ring-primary/20' : 'border-border hover:border-muted-foreground/30')}>
                    <Icon className={cn('size-4', isSel ? 'text-primary' : 'text-muted-foreground')} />
                    <span className="text-[9px] font-medium leading-tight text-center">{m.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Reference */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">Reference (optional)</label>
            <input type="text" value={reference} onChange={(e) => setReference(e.target.value)} placeholder="e.g. INV-001 or CHQ-123"
              className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring/30" />
          </div>

          {/* Note */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">Note (optional)</label>
            <input type="text" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Internal note..."
              className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring/30" />
          </div>

          {/* Date */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">Date</label>
            <input type="date" value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring/30" />
          </div>

          <Button size="lg" className="w-full h-11 gap-1.5 shadow-sm" disabled={!isValid || processing} onClick={handleSubmit}>
            {processing ? (
              <span className="flex items-center gap-2"><span className="size-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />Processing...</span>
            ) : (
              <><Receipt className="size-4" />{direction === 'in' ? 'Record Payment' : 'Record Payout'}</>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
