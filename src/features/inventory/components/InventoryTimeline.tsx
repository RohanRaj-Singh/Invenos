import {
  PackagePlus,
  TrendingDown,
  Undo2,
  BarChart3,
  AlertTriangle,
  FlaskConical,
  ArrowRightLeft,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { TransactionType, InventoryTransaction } from '@/types'
import { TRANSACTION_CONFIG, groupTransactionsByDate, getDateGroupLabel } from '@/lib/inventory-engine'

const iconMap: Record<string, LucideIcon> = {
  PackagePlus, TrendingDown, Undo2, BarChart3, AlertTriangle, FlaskConical, ArrowRightLeft,
}

interface InventoryTimelineProps {
  transactions: InventoryTransaction[]
}

export default function InventoryTimeline({ transactions }: InventoryTimelineProps) {
  const groups = groupTransactionsByDate(transactions)

  if (transactions.length === 0) {
    return <div className="text-center py-12 text-sm text-muted-foreground">No inventory transactions recorded.</div>
  }

  return (
    <div className="space-y-6">
      {/* Summary bar */}
      <div className="flex flex-wrap gap-2 text-xs">
        <SummaryBadge label="Purchases" amount={transactions.filter(t => t.type === 'purchase').reduce((s, t) => s + t.quantity, 0)} type="purchase" />
        <SummaryBadge label="Sold" amount={Math.abs(transactions.filter(t => t.type === 'sale').reduce((s, t) => s + t.quantity, 0))} type="sale" />
        <SummaryBadge label="Damaged" amount={Math.abs(transactions.filter(t => t.type === 'damage').reduce((s, t) => s + t.quantity, 0))} type="damage" />
        <SummaryBadge label="Consumed" amount={Math.abs(transactions.filter(t => t.type === 'consumption').reduce((s, t) => s + t.quantity, 0))} type="consumption" />
        <SummaryBadge label="Returned" amount={transactions.filter(t => t.type === 'return').reduce((s, t) => s + t.quantity, 0)} type="return" />
        <SummaryBadge label="Adjusted" amount={Math.abs(transactions.filter(t => t.type === 'adjustment').reduce((s, t) => s + t.quantity, 0))} type="adjustment" />
      </div>

      {/* Timeline */}
      {Array.from(groups.entries()).map(([dateStr, txns]) => (
        <div key={dateStr}>
          <div className="flex items-center gap-2 mb-3">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {getDateGroupLabel(dateStr)}
            </div>
            <div className="h-px flex-1 bg-border" />
            <div className="text-[10px] text-muted-foreground tabular-nums">{dateStr}</div>
          </div>
          <div className="space-y-1">
            {txns.map((txn, idx) => {
              const config = TRANSACTION_CONFIG[txn.type]
              const Icon = iconMap[txn.type] || PackagePlus
              const isLast = idx === txns.length - 1

              return (
                <div key={txn.id} className="relative flex gap-3 group pl-1">
                  {!isLast && <div className="absolute left-[19px] top-9 bottom-0 w-px bg-border" />}

                  <div className={cn(
                    'relative z-10 flex items-center justify-center size-9 rounded-xl shrink-0 mt-0.5 ring-1 ring-border',
                    config?.bgClass || 'bg-muted'
                  )}>
                    <Icon className={cn('size-4', config?.color || 'text-muted-foreground')} />
                  </div>

                  <div className="flex-1 min-w-0 pb-2 pt-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            'text-sm font-semibold',
                            txn.quantity > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                          )}>
                            {txn.quantity > 0 ? '+' : ''}{Math.abs(txn.quantity).toLocaleString()} {txn.unit}
                          </span>
                          <span className="text-xs font-medium text-foreground/70 bg-muted px-1.5 py-0.5 rounded">
                            {config?.label || txn.type}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{txn.reference}</p>
                        {txn.notes && (
                          <p className="text-[11px] text-muted-foreground/70 mt-0.5 italic">{txn.notes}</p>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-xs font-semibold text-foreground tabular-nums">
                          {txn.runningBalance.toLocaleString()}
                        </span>
                        <p className="text-[10px] text-muted-foreground">{txn.user}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

function SummaryBadge({ label, amount, type }: { label: string; amount: number; type: TransactionType }) {
  const config = TRANSACTION_CONFIG[type]
  return (
    <span className={cn(
      'inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium',
      config.inflow ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
    )}>
      <span>{config.inflow ? '+' : '-'}{amount.toLocaleString()}</span>
      <span className="text-muted-foreground">{label}</span>
    </span>
  )
}
