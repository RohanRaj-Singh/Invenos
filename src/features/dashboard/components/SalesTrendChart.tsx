import { useMemo, useState } from 'react'
import { TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { allSales } from '@/data/sales'
import { purchaseBills } from '@/data/purchases'
import { cn } from '@/lib/utils'
import type { DateRange } from '@/features/reports/components/ReportFilters'

interface SalesTrendChartProps {
  dateRange: DateRange
}

export default function SalesTrendChart({ dateRange }: SalesTrendChartProps) {
  const [mode, setMode] = useState<'sales' | 'purchases' | 'combined'>('sales')

  const days = useMemo(() => {
    const from = new Date(dateRange.from)
    const to = new Date(dateRange.to)
    const daysArr: { label: string; sales: number; purchases: number }[] = []
    const d = new Date(from)
    while (d <= to) {
      const dateStr = d.toISOString().split('T')[0]
      const salesTotal = allSales
        .filter((s) => s.date === dateStr && !s.invoiceNumber.startsWith('RET-'))
        .reduce((sum, s) => sum + s.grandTotal, 0)
      const purchasesTotal = purchaseBills
        .filter((b) => b.date === dateStr && !b.invoiceRef.startsWith('PRET-'))
        .reduce((sum, b) => sum + b.totalAmount, 0)
      daysArr.push({
        label: d.toLocaleDateString('en-PK', { weekday: 'short', day: 'numeric' }),
        sales: salesTotal,
        purchases: purchasesTotal,
      })
      d.setDate(d.getDate() + 1)
    }
    return daysArr
  }, [dateRange])

  const maxVal = Math.max(...days.map((d) => (mode === 'sales' ? d.sales : mode === 'purchases' ? d.purchases : Math.max(d.sales, d.purchases))), 1)

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="size-4 text-primary" />
          Revenue Trend
        </CardTitle>
        <div className="flex items-center gap-1 bg-muted rounded-lg p-0.5">
          {(['sales', 'purchases', 'combined'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={cn(
                'px-2.5 py-1 text-[10px] font-medium rounded-md transition-colors',
                mode === m ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {m.charAt(0).toUpperCase() + m.slice(1)}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        {days.length === 0 ? (
          <div className="text-center py-8 text-sm text-muted-foreground">No data for this period.</div>
        ) : days.length === 1 ? (
          <div className="flex items-center justify-center h-32 text-sm text-muted-foreground">
            {mode === 'sales' ? `Revenue: Rs. ${days[0].sales.toLocaleString()}` :
             mode === 'purchases' ? `Purchases: Rs. ${days[0].purchases.toLocaleString()}` :
             `Sales: Rs. ${days[0].sales.toLocaleString()} / Purchases: Rs. ${days[0].purchases.toLocaleString()}`}
          </div>
        ) : (
          <div className="relative h-40 sm:h-48">
            {/* Bars */}
            <div className="absolute inset-0 flex items-end gap-[2px] sm:gap-1">
              {days.map((d, i) => {
                const value = mode === 'sales' ? d.sales : mode === 'purchases' ? d.purchases : d.sales
                const height = (value / maxVal) * 100
                return (
                  <div key={i} className="flex-1 flex flex-col items-center justify-end h-full group relative">
                    <div
                      className={cn(
                        'w-full rounded-t transition-all duration-200 min-h-[2px]',
                        mode === 'sales' ? 'bg-blue-500 dark:bg-blue-400' :
                        mode === 'purchases' ? 'bg-amber-500 dark:bg-amber-400' : 'bg-emerald-500 dark:bg-emerald-400',
                      )}
                      style={{ height: `${Math.max(height, 1)}%` }}
                    />
                    {/* Tooltip */}
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-foreground text-background text-[9px] px-1.5 py-0.5 rounded whitespace-nowrap transition-opacity pointer-events-none z-10">
                      Rs.{' '}{value.toLocaleString()}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* X-axis labels */}
        {days.length > 1 && (
          <div className="flex justify-between mt-2 pt-2 border-t border-border">
            {days.filter((_, i) => i % Math.max(1, Math.floor(days.length / 5)) === 0 || i === days.length - 1).map((d) => (
              <span key={d.label} className="text-[9px] text-muted-foreground">{d.label}</span>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
