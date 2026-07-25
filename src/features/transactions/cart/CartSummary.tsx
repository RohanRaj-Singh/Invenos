import { formatCurrency } from '@/lib/format'
import { computeCartDiscount } from '@/domain/transactions/cart-domain'

interface SummaryProps {
  subtotal: number
  discount: number
  discountInput: string
  grandTotal: number
  onDiscountChange: (v: number) => void
  onDiscountInputChange: (v: string) => void
  onDiscountPctChange: (discount: number) => void
}

export function TransactionSummary({
  subtotal,
  discount,
  discountInput,
  grandTotal,
  onDiscountChange,
  onDiscountInputChange,
  onDiscountPctChange,
}: SummaryProps) {
  return (
    <div className="flex justify-end mt-4">
      <div className="w-72 space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="font-semibold text-foreground">
            {formatCurrency(subtotal)}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm gap-3">
          <span className="text-muted-foreground shrink-0">Discount</span>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-muted-foreground">Rs.</span>
              <input
                type="number"
                value={discount || ''}
                onChange={(e) => {
                  const v = parseFloat(e.target.value) || 0
                  onDiscountChange(v)
                  onDiscountInputChange('')
                }}
                placeholder="0"
                className="w-20 h-8 px-2 rounded-md border border-input bg-background text-sm text-right outline-none focus:border-ring tabular-nums"
                min="0"
              />
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-muted-foreground">%</span>
              <input
                type="number"
                value={discountInput}
                onChange={(e) => {
                  const p = parseFloat(e.target.value) || 0
                  onDiscountInputChange(e.target.value)
                  onDiscountPctChange(computeCartDiscount(subtotal, p))
                }}
                placeholder="0"
                className="w-16 h-8 px-2 rounded-md border border-input bg-background text-sm text-right outline-none focus:border-ring tabular-nums"
                min="0"
                max="100"
              />
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <span className="text-base font-bold text-foreground">Grand Total</span>
          <span className="text-lg font-bold text-foreground tabular-nums">
            {formatCurrency(grandTotal)}
          </span>
        </div>
      </div>
    </div>
  )
}
