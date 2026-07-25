import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Store, Search, Plus, ShoppingBag, ArrowRight, RotateCcw } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { purchaseBills } from '@/data/purchases'
import { formatCurrency } from '@/lib/format'
import { cn } from '@/lib/utils'
import { usePermission } from '@/features/auth/PermissionGuard'

const paymentColors: Record<string, { label: string; cls: string }> = {
  paid: { label: 'Paid', cls: 'text-emerald-600 dark:text-emerald-400' },
  partial: { label: 'Partial', cls: 'text-amber-600 dark:text-amber-400' },
  unpaid: { label: 'Unpaid', cls: 'text-red-600 dark:text-red-400' },
}

const statusColors: Record<string, { label: string; cls: string }> = {
  received: { label: 'Received', cls: 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400' },
  pending: { label: 'Pending', cls: 'bg-slate-50 text-slate-600 dark:bg-slate-500/10 dark:text-slate-400' },
}

export default function PurchasesListPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'received' | 'pending'>('all')
  const canCreatePurchase = usePermission('purchases', 'create')

  const sortedBills = useMemo(
    () => [...purchaseBills].filter((b) => !b.invoiceRef.startsWith('PRET-')).sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id)),
    [purchaseBills]
  )

  const filtered = useMemo(() => {
    return sortedBills.filter((bill) => {
      if (search) {
        const q = search.toLowerCase()
        const nameMatch = bill.supplierName.toLowerCase().includes(q)
        const refMatch = bill.invoiceRef.toLowerCase().includes(q)
        if (!nameMatch && !refMatch) return false
      }
      if (filterStatus !== 'all' && bill.status !== filterStatus) return false
      return true
    })
  }, [sortedBills, search, filterStatus])

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 text-amber-600 mb-1">
            <ShoppingBag className="size-5" />
            <span className="text-xs font-semibold uppercase tracking-wider">Purchases</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">All Purchases</h1>
          <p className="text-sm text-muted-foreground mt-1">{purchaseBills.filter(b => !b.invoiceRef.startsWith('PRET-')).length} transactions recorded</p>
        </div>
        <div className="flex items-center gap-2">
          {canCreatePurchase && (
          <button
            onClick={() => navigate('/returns/purchase')}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors"
          >
            <RotateCcw className="size-4" />
            <span className="hidden sm:inline">Return</span>
          </button>
          )}
          {canCreatePurchase && (
          <button
            onClick={() => navigate('/purchases/new')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium shadow-sm hover:bg-primary/90 transition-colors"
          >
            <Plus className="size-4" />
            <span className="hidden sm:inline">New Purchase</span>
          </button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            type="text" placeholder="Search by invoice or supplier..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-9 pr-3 rounded-xl border border-input bg-background text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring/30 transition-colors"
          />
        </div>
        <div className="flex items-center gap-1.5">
          {(['all', 'received', 'pending'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={cn(
                'text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors',
                filterStatus === s
                  ? 'bg-foreground text-background border-foreground'
                  : 'bg-background text-muted-foreground border-border hover:text-foreground'
              )}
            >
              {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        {filtered.map((bill) => {
          const pCfg = paymentColors[bill.paymentStatus]
          const sCfg = statusColors[bill.status]
          return (
            <button
              key={bill.id}
              onClick={() => navigate(`/purchases/${bill.id}`)}
              className="w-full text-left group"
            >
              <Card size="sm" className="transition-all hover:shadow-sm hover:border-primary/20 active:scale-[0.99]">
                <CardContent className="p-0">
                  <div className="flex items-center gap-4 px-4 py-3.5">
                    <div className="flex-1 min-w-0 grid grid-cols-2 sm:grid-cols-6 gap-3 items-center">
                      <div className="sm:col-span-2">
                        <div className="text-sm font-semibold text-foreground truncate">{bill.supplierName}</div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <code className="text-[11px] font-mono text-muted-foreground">{bill.invoiceRef}</code>
                          <span className={cn('text-[11px] font-medium px-1.5 py-0.5 rounded', sCfg.cls)}>{sCfg.label}</span>
                        </div>
                      </div>
                      <div>
                        <div className="text-[11px] text-muted-foreground">Items</div>
                        <div className="text-xs font-medium">{bill.items.length}</div>
                      </div>
                      <div>
                        <div className="text-[11px] text-muted-foreground">Total</div>
                        <div className="text-sm font-semibold">{formatCurrency(bill.totalAmount)}</div>
                      </div>
                      <div>
                        <div className="text-[11px] text-muted-foreground">Status</div>
                        <div className={cn('text-xs font-medium', pCfg.cls)}>{pCfg.label}</div>
                      </div>
                      <div className="hidden sm:block">
                        <div className="text-[11px] text-muted-foreground">Date</div>
                        <div className="text-xs">{bill.date}</div>
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
          <div className="text-center py-16 text-sm text-muted-foreground">
            {purchaseBills.length === 0 ? 'No purchases recorded yet.' : 'No purchases found.'}
          </div>
        )}
      </div>
    </div>
  )
}
