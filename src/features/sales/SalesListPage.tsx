import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Receipt, Search, ShoppingCart, ArrowRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { saleSummaries } from '@/data/sales'
import { formatCurrency } from '@/data/dashboard'
import { cn } from '@/lib/utils'
import type { SaleSource, PaymentStatus } from '@/types'

const sourceConfig: Record<SaleSource, { label: string; cls: string }> = {
  pos: { label: 'POS', cls: 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400' },
  clinic: { label: 'Clinic', cls: 'bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400' },
  manual: { label: 'Manual', cls: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400' },
}

const payCfg: Record<PaymentStatus, { label: string; cls: string }> = {
  paid: { label: 'Paid', cls: 'text-emerald-600 dark:text-emerald-400' },
  partial: { label: 'Partial', cls: 'text-amber-600 dark:text-amber-400' },
  unpaid: { label: 'Unpaid', cls: 'text-red-600 dark:text-red-400' },
}

export default function SalesListPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [filterSource, setFilterSource] = useState<SaleSource | 'all'>('all')

  const filtered = useMemo(() => {
    return saleSummaries.filter((s) => {
      if (search) {
        const q = search.toLowerCase()
        const nameMatch = (s.customerName || s.patientName || '').toLowerCase().includes(q)
        const invMatch = s.invoiceNumber.toLowerCase().includes(q)
        if (!nameMatch && !invMatch) return false
      }
      if (filterSource !== 'all' && s.source !== filterSource) return false
      return true
    })
  }, [search, filterSource])

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 text-primary mb-1">
            <Receipt className="size-5" />
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">Sales</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">All Sales</h1>
          <p className="text-sm text-muted-foreground mt-1">{saleSummaries.length} transactions recorded</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/sales/pos')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium shadow-sm hover:bg-primary/90 transition-colors"
          >
            <ShoppingCart className="size-4" />
            <span className="hidden sm:inline">Open POS</span>
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            type="text" placeholder="Search by invoice or customer..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-9 pr-3 rounded-xl border border-input bg-background text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring/30 transition-colors"
          />
        </div>
        <div className="flex items-center gap-1.5">
          {(['all', 'pos', 'clinic', 'manual'] as const).map((src) => (
            <button
              key={src}
              onClick={() => setFilterSource(src)}
              className={cn(
                'text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors',
                filterSource === src
                  ? 'bg-foreground text-background border-foreground'
                  : 'bg-background text-muted-foreground border-border hover:text-foreground'
              )}
            >
              {src === 'all' ? 'All' : src.charAt(0).toUpperCase() + src.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        {filtered.map((s) => {
          const srcCfg = sourceConfig[s.source]
          const pCfg = payCfg[s.paymentStatus]
          const customerLabel = s.customerName || s.patientName || '—'
          return (
            <button
              key={s.id}
              onClick={() => navigate(`/sales/${s.id}`)}
              className="w-full text-left group"
            >
              <Card size="sm" className="transition-all hover:shadow-sm hover:border-primary/20 active:scale-[0.99]">
                <CardContent className="p-0">
                  <div className="flex items-center gap-4 px-4 py-3.5">
                    <div className="flex-1 min-w-0 grid grid-cols-2 sm:grid-cols-6 gap-3 items-center">
                      <div className="sm:col-span-2">
                        <div className="text-sm font-semibold text-foreground truncate">{customerLabel}</div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <code className="text-[11px] font-mono text-muted-foreground">{s.invoiceNumber}</code>
                          <span className={cn('text-[11px] font-medium px-1.5 py-0.5 rounded', srcCfg.cls)}>{srcCfg.label}</span>
                        </div>
                      </div>
                      <div>
                        <div className="text-[11px] text-muted-foreground">Items</div>
                        <div className="text-xs font-medium">{s.itemCount}</div>
                      </div>
                      <div>
                        <div className="text-[11px] text-muted-foreground">Total</div>
                        <div className="text-sm font-semibold">{formatCurrency(s.grandTotal)}</div>
                      </div>
                      <div>
                        <div className="text-[11px] text-muted-foreground">Status</div>
                        <div className={cn('text-xs font-medium', pCfg.cls)}>{pCfg.label}</div>
                      </div>
                      <div className="hidden sm:block">
                        <div className="text-[11px] text-muted-foreground">Date</div>
                        <div className="text-xs">{s.date}</div>
                      </div>
                    </div>
                    <ArrowRight className="size-4 text-muted-foreground/30 group-hover:text-muted-foreground transition-colors shrink-0" />
                  </div>
                </CardContent>
              </Card>
            </button>
          )
        })}
        {filtered.length === 0 && (
          <div className="text-center py-16 text-sm text-muted-foreground">No sales found.</div>
        )}
      </div>
    </div>
  )
}
