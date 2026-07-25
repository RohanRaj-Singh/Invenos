import { Button } from '@/components/ui/button'
import { CheckCircle2, Pause, RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/format'
import { getPaymentDisplayState } from '@/domain/transactions/payment-domain'
import type { PaymentMethod } from '@/types'

interface PaymentMethodOption {
  id: PaymentMethod
  label: string
  color: string
}

const DEFAULT_METHODS: PaymentMethodOption[] = [
  { id: 'cash', label: 'Cash', color: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' },
  { id: 'card', label: 'Card', color: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20' },
  { id: 'transfer', label: 'Transfer', color: 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20' },
  { id: 'easypaisa', label: 'Easypaisa', color: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20' },
  { id: 'jazzcash', label: 'JazzCash', color: 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20' },
]

interface PaymentPanelProps {
  paymentMethod: PaymentMethod
  onMethodChange: (m: PaymentMethod) => void
  amountPaid: string
  onAmountChange: (v: string) => void
  grandTotal: number
  methods?: PaymentMethodOption[]
  cartEmpty: boolean
  onHold?: () => void
  onClear: () => void
  onRecord: () => void
  holdLabel?: string
  recordLabel?: string
  showHold?: boolean
  onQuickPay?: (type: 'full' | 'half' | 'none') => void
}

export function PaymentPanel({
  paymentMethod,
  onMethodChange,
  amountPaid,
  onAmountChange,
  grandTotal,
  methods = DEFAULT_METHODS,
  cartEmpty,
  onHold,
  onClear,
  onRecord,
  holdLabel = 'Hold',
  recordLabel = 'Record Sale',
  showHold = true,
  onQuickPay,
}: PaymentPanelProps) {
  const displayState = getPaymentDisplayState(parseFloat(amountPaid) || 0, grandTotal)

  return (
    <div className="border-t border-border bg-card px-5 py-3 shrink-0">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex items-center gap-1.5">
          {methods.map((m) => (
            <button
              key={m.id}
              onClick={() => onMethodChange(m.id)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium border transition-all capitalize',
                paymentMethod === m.id
                  ? `${m.color} shadow-sm`
                  : 'border-transparent text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
            >
              {m.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground whitespace-nowrap">Amount:</span>
          <div className="flex items-center gap-1">
            <span className="text-xs text-muted-foreground">Rs.</span>
            <input
              type="number"
              value={amountPaid}
              onChange={(e) => onAmountChange(e.target.value)}
              placeholder={String(grandTotal)}
              className="w-24 h-8 px-2 rounded-md border border-input bg-background text-sm font-semibold text-right outline-none focus:border-ring tabular-nums"
              min="0"
            />
          </div>
          {displayState.type === 'change' && (
            <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums ml-2">
              Change: {formatCurrency(displayState.amount)}
            </span>
          )}
          {displayState.type === 'outstanding' && (
            <span className="text-[11px] text-amber-600 dark:text-amber-400 ml-2 whitespace-nowrap">
              {formatCurrency(displayState.amount)} outstanding
            </span>
          )}
        </div>

        {onQuickPay && (
          <div className="flex items-center gap-1">
            <button onClick={() => onQuickPay('full')} className={cn('px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors border', amountPaid === String(grandTotal) ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' : 'text-muted-foreground hover:text-foreground hover:bg-muted border-transparent')}>Full</button>
            <button onClick={() => onQuickPay('half')} className={cn('px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors border', amountPaid === String(Math.ceil(grandTotal / 2)) ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20' : 'text-muted-foreground hover:text-foreground hover:bg-muted border-transparent')}>Half</button>
            <button onClick={() => onQuickPay('none')} className={cn('px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors border', amountPaid === '0' ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20' : 'text-muted-foreground hover:text-foreground hover:bg-muted border-transparent')}>None</button>
          </div>
        )}

        <div className="flex items-center gap-2 sm:ml-auto">
          {showHold && (
            <Button variant="outline" size="sm" className="gap-1.5 h-9" disabled={cartEmpty} onClick={onHold}>
              <Pause className="size-3.5" /> {holdLabel}
            </Button>
          )}
          <Button variant="outline" size="sm" className="gap-1.5 h-9" onClick={onClear}>
            <RotateCcw className="size-3.5" /> Clear
          </Button>
          <Button size="sm" className="gap-1.5 h-9 shadow-sm" disabled={cartEmpty} onClick={onRecord}>
            <CheckCircle2 className="size-3.5" /> {recordLabel}
            <kbd className="hidden sm:inline-flex items-center ml-1.5 px-1 py-0 text-[9px] bg-primary-foreground/20 rounded">
              ⌘⏎
            </kbd>
          </Button>
        </div>
      </div>
    </div>
  )
}
