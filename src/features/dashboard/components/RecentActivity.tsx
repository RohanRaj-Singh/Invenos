import { useMemo } from 'react'
import {
  ShoppingCart,
  CreditCard,
  Stethoscope,
  Package,
  RotateCcw,
  Wallet,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/data/dashboard'
import { allSales } from '@/data/sales'
import { purchaseBills } from '@/data/purchases'
import { allExpenses } from '@/data/expenses'
import { cn } from '@/lib/utils'

const activityConfig: Record<
  string,
  { icon: LucideIcon; bgClass: string; iconClass: string }
> = {
  sale: {
    icon: ShoppingCart,
    bgClass: 'bg-blue-50 dark:bg-blue-500/10',
    iconClass: 'text-blue-600 dark:text-blue-400',
  },
  payment: {
    icon: CreditCard,
    bgClass: 'bg-emerald-50 dark:bg-emerald-500/10',
    iconClass: 'text-emerald-600 dark:text-emerald-400',
  },
  patient: {
    icon: Stethoscope,
    bgClass: 'bg-purple-50 dark:bg-purple-500/10',
    iconClass: 'text-purple-600 dark:text-purple-400',
  },
  purchase: {
    icon: Package,
    bgClass: 'bg-amber-50 dark:bg-amber-500/10',
    iconClass: 'text-amber-600 dark:text-amber-400',
  },
  return: {
    icon: RotateCcw,
    bgClass: 'bg-orange-50 dark:bg-orange-500/10',
    iconClass: 'text-orange-600 dark:text-orange-400',
  },
  expense: {
    icon: Wallet,
    bgClass: 'bg-red-50 dark:bg-red-500/10',
    iconClass: 'text-red-600 dark:text-red-400',
  },
}

type ActivityItem = {
  id: string
  type: string
  title: string
  description: string
  timeAgo: string
  amount: number
}

function timeAgo(dateStr: string): string {
  const now = new Date()
  const d = new Date(dateStr + 'T00:00:00')
  const diffMs = now.getTime() - d.getTime()
  const diffDays = Math.floor(diffMs / 86400000)
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`
  return d.toLocaleDateString('en-PK', { day: 'numeric', month: 'short' })
}

export default function RecentActivity() {
  const items = useMemo((): ActivityItem[] => {
    const result: ActivityItem[] = []

    // Recent sales (non-return)
    allSales
      .filter((s) => !s.invoiceNumber.startsWith('RET-'))
      .slice(0, 5)
      .forEach((s) => {
        result.push({
          id: `act-sale-${s.id}`,
          type: 'sale',
          title: 'Sale Created',
          description: `${s.customerName || 'Walk-in'} — ${s.items.length} items`,
          timeAgo: timeAgo(s.date),
          amount: s.grandTotal,
        })
      })

    // Recent sale returns
    allSales
      .filter((s) => s.invoiceNumber.startsWith('RET-'))
      .slice(0, 3)
      .forEach((s) => {
        result.push({
          id: `act-ret-${s.id}`,
          type: 'return',
          title: 'Sale Return Recorded',
          description: `${s.invoiceNumber} — ${s.items.length} item${s.items.length !== 1 ? 's' : ''} returned`,
          timeAgo: timeAgo(s.date),
          amount: s.grandTotal,
        })
      })

    // Recent purchases
    purchaseBills
      .filter((b) => !b.invoiceRef.startsWith('PRET-'))
      .slice(0, 3)
      .forEach((b) => {
        result.push({
          id: `act-pur-${b.id}`,
          type: 'purchase',
          title: 'Purchase Recorded',
          description: `${b.supplierName} — ${b.items.length} items`,
          timeAgo: timeAgo(b.date),
          amount: b.totalAmount,
        })
      })

    // Recent expenses
    allExpenses.slice(0, 3).forEach((e) => {
      result.push({
        id: `act-exp-${e.id}`,
        type: 'expense',
        title: 'Expense Recorded',
        description: `${e.categoryName} — ${e.paidTo || 'N/A'}`,
        timeAgo: timeAgo(e.date),
        amount: e.amount,
      })
    })

    // Sort by date descending, take 8
    return result.sort((a, b) => b.timeAgo.localeCompare(a.timeAgo)).slice(0, 8)
  }, [])

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>Recent Activity</CardTitle>
        <span className="text-xs text-muted-foreground">Live</span>
      </CardHeader>
      <CardContent>
        <div className="space-y-0">
          {items.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground">No recent activity.</div>
          ) : (
            items.map((event, idx) => {
              const config = activityConfig[event.type] || activityConfig.sale
              const Icon = config.icon
              const isLast = idx === items.length - 1

              return (
                <div key={event.id} className="relative flex gap-3 pb-4 last:pb-0">
                  {!isLast && (
                    <div className="absolute left-[17px] top-9 bottom-0 w-px bg-border" />
                  )}
                  <div
                    className={cn(
                      'relative z-10 flex items-center justify-center size-9 rounded-full shrink-0',
                      config.bgClass,
                      config.iconClass
                    )}
                  >
                    <Icon className="size-4" />
                  </div>
                  <div className="flex-1 min-w-0 pt-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium text-foreground">{event.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{event.description}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-semibold text-foreground">{formatCurrency(event.amount)}</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">{event.timeAgo}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </CardContent>
    </Card>
  )
}
