import { CalendarDays, ArrowUpRight, ArrowDownRight, Banknote } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/data/dashboard'
import type { Payment } from '@/types'

interface PaymentsOverviewProps {
  payments: Payment[]
  totalPaid: number
  totalOutstanding: number
}

export default function PaymentsOverview({ payments, totalPaid, totalOutstanding }: PaymentsOverviewProps) {
  const lastPayment = payments.length > 0 ? payments[0] : null

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <Card size="sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Outstanding</span>
              <div className="flex items-center justify-center size-7 rounded-md bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <ArrowDownRight className="size-3.5" />
              </div>
            </div>
            <div className="text-lg font-bold tracking-tight text-amber-600 dark:text-amber-400">
              {formatCurrency(totalOutstanding)}
            </div>
          </CardContent>
        </Card>
        <Card size="sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Total Paid</span>
              <div className="flex items-center justify-center size-7 rounded-md bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <ArrowUpRight className="size-3.5" />
              </div>
            </div>
            <div className="text-lg font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
              {formatCurrency(totalPaid)}
            </div>
          </CardContent>
        </Card>
        <Card size="sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Last Payment</span>
              <div className="flex items-center justify-center size-7 rounded-md bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <CalendarDays className="size-3.5" />
              </div>
            </div>
            <div className="text-[13px] font-bold tracking-tight">{lastPayment?.date || '—'}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Payment History</CardTitle>
          <span className="text-xs text-muted-foreground">{payments.length} entries</span>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {payments.map((payment) => (
              <div key={payment.id} className="flex items-center gap-3 py-2.5 px-3 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-center size-8 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 shrink-0">
                  <Banknote className="size-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground capitalize">{payment.method}</span>
                    <span className="text-[10px] font-medium text-emerald-600">· {payment.reference}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{payment.date}</span>
                    <span>·</span>
                    <span>Sale payment</span>
                  </div>
                </div>
                <span className="text-sm font-semibold text-foreground shrink-0">
                  Rs. {payment.amount.toLocaleString()}
                </span>
              </div>
            ))}
            {payments.length === 0 && (
              <div className="text-center py-8 text-sm text-muted-foreground">No payment records.</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
