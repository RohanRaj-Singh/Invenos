import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, RotateCcw, Search } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { allSales } from '@/data/sales'
import { purchaseBills } from '@/data/purchases'
import { formatCurrency } from '@/lib/format'

type ReturnSource = 'sale' | 'purchase'

interface ReturnListPageProps {
  source: ReturnSource
  title: string
  emptyMessage: string
}

export default function ReturnListPage({ source, title, emptyMessage }: ReturnListPageProps) {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')

  const returns = useMemo(() => {
    if (source === 'sale') {
      return allSales
        .filter((s) => s.invoiceNumber.startsWith('RET-'))
        .map((s) => ({
          id: s.id,
          ref: s.invoiceNumber,
          date: s.date,
          party: s.customerName || 'Walk-in Customer',
          total: s.grandTotal,
          itemCount: s.items.length,
        }))
    }
    return purchaseBills
      .filter((b) => b.invoiceRef.startsWith('PRET-'))
      .map((b) => ({
        id: b.id,
        ref: b.invoiceRef,
        date: b.date,
        party: b.supplierName,
        total: b.totalAmount,
        itemCount: b.items.length,
      }))
  }, [source])

  const filtered = useMemo(() => {
    if (!search.trim()) return returns.sort((a, b) => b.date.localeCompare(a.date))
    const q = search.toLowerCase()
    return returns.filter((r) =>
      r.ref.toLowerCase().includes(q) ||
      r.party.toLowerCase().includes(q)
    ).sort((a, b) => b.date.localeCompare(a.date))
  }, [returns, search])

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 text-amber-600 mb-1">
            <RotateCcw className="size-5" />
            <span className="text-xs font-semibold uppercase tracking-wider">Returns</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">{title}</h1>
          <p className="text-sm text-muted-foreground mt-1">{returns.length} return{returns.length !== 1 ? 's' : ''} recorded</p>
        </div>
        <button
          onClick={() => navigate(source === 'sale' ? '/returns/sale' : '/returns/purchase')}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium shadow-sm hover:bg-primary/90 transition-colors"
        >
          <RotateCcw className="size-4" />
          <span className="hidden sm:inline">New Return</span>
        </button>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            type="text" placeholder="Search by return number or name..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-9 pr-3 rounded-xl border border-input bg-background text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring/30 transition-colors"
          />
        </div>
      </div>

      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-sm text-muted-foreground">
            {returns.length === 0 ? emptyMessage : 'No returns found matching your search.'}
          </div>
        ) : (
          filtered.map((ret) => (
            <button
              key={ret.id}
              onClick={() => navigate(source === 'sale' ? `/sales/returns/${ret.ref}` : `/purchases/returns/${ret.ref}`)}
              className="w-full text-left group"
            >
              <Card size="sm" className="transition-all hover:shadow-sm hover:border-primary/20 active:scale-[0.99]">
                <CardContent className="p-0">
                  <div className="flex items-center gap-4 px-4 py-3.5">
                    <div className="flex-1 min-w-0 grid grid-cols-2 sm:grid-cols-5 gap-3 items-center">
                      <div className="sm:col-span-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-foreground">{ret.ref}</span>
                          <Badge variant="outline" className="text-[10px] bg-amber-50 text-amber-700 border-amber-200">Return</Badge>
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">{ret.party}</div>
                      </div>
                      <div>
                        <div className="text-[11px] text-muted-foreground">Items</div>
                        <div className="text-xs font-medium">{ret.itemCount}</div>
                      </div>
                      <div>
                        <div className="text-[11px] text-muted-foreground">Refund</div>
                        <div className="text-sm font-semibold text-foreground">{formatCurrency(ret.total)}</div>
                      </div>
                      <div>
                        <div className="text-[11px] text-muted-foreground">Date</div>
                        <div className="text-xs">{ret.date}</div>
                      </div>
                    </div>
                    <ArrowRight className="size-4 text-muted-foreground/30 group-hover:text-muted-foreground transition-colors shrink-0" />
                  </div>
                </CardContent>
              </Card>
            </button>
          ))
        )}
      </div>
    </div>
  )
}
