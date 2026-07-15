import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, CreditCard, Banknote, Smartphone, Wallet, Building2, ArrowUpRight, ArrowDownRight, Plus } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { financialTransactions, getTransactionStats, FT_TYPE_CONFIG } from '@/data/financial-transactions'
import { getContactById } from '@/data/contacts'
import { formatCurrency } from '@/data/dashboard'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import RecordPaymentDialog from './components/RecordPaymentDialog'
import type { PaymentMethod } from '@/types'

const methodConfig: Record<PaymentMethod, { label: string; icon: typeof Banknote; color: string; bg: string }> = {
  cash: { label: 'Cash', icon: Banknote, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
  easypaisa: { label: 'Easypaisa', icon: Smartphone, color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-500/10' },
  jazzcash: { label: 'JazzCash', icon: Wallet, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-500/10' },
  card: { label: 'Card', icon: CreditCard, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-500/10' },
  transfer: { label: 'Bank Transfer', icon: Building2, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-500/10' },
}

type TabId = 'all' | 'in' | 'out'

export default function PaymentsListPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState<TabId>('all')
  const [methodFilter, setMethodFilter] = useState<PaymentMethod | 'all'>('all')
  const [showRecordPayment, setShowRecordPayment] = useState(false)
  const [selectedFT, setSelectedFT] = useState<typeof financialTransactions[0] | null>(null)
  const stats = getTransactionStats()

  const filtered = useMemo(() => {
    return financialTransactions.filter((t) => {
      if (tab === 'in' && t.direction !== 'in') return false
      if (tab === 'out' && t.direction !== 'out') return false
      if (methodFilter !== 'all' && t.method !== methodFilter) return false
      if (search) {
        const q = search.toLowerCase()
        const contact = getContactById(t.contactId)
        const nameMatch = contact?.name.toLowerCase().includes(q)
        const refMatch = t.reference.toLowerCase().includes(q)
        if (!nameMatch && !refMatch) return false
      }
      return true
    })
  }, [search, tab, methodFilter])

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 text-primary mb-1">
            <CreditCard className="size-5" />
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">Payments</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">Financial Transactions</h1>
          <p className="text-sm text-muted-foreground mt-1">{stats.totalCount} transactions · {formatCurrency(stats.totalIn)} received · {formatCurrency(stats.totalOut)} paid</p>
        </div>
        <Button size="sm" className="gap-1.5 shadow-sm" onClick={() => setShowRecordPayment(true)}>
          <Plus className="size-4" />
          <span className="hidden sm:inline">Record Payment</span>
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <Card size="sm"><CardContent className="p-4"><div className="text-[11px] text-muted-foreground uppercase tracking-wider">Received Today</div><div className="text-lg font-bold text-emerald-600 mt-1">{formatCurrency(stats.receivedToday)}</div></CardContent></Card>
        <Card size="sm"><CardContent className="p-4"><div className="text-[11px] text-muted-foreground uppercase tracking-wider">Paid Today</div><div className="text-lg font-bold text-red-600 mt-1">{formatCurrency(stats.paidToday)}</div></CardContent></Card>
        <Card size="sm"><CardContent className="p-4"><div className="text-[11px] text-muted-foreground uppercase tracking-wider">Net Cash Flow</div><div className={cn('text-lg font-bold mt-1', stats.netCashFlow >= 0 ? 'text-emerald-600' : 'text-red-600')}>{formatCurrency(stats.netCashFlow)}</div></CardContent></Card>
        <Card size="sm"><CardContent className="p-4"><div className="text-[11px] text-muted-foreground uppercase tracking-wider">Outstanding</div><div className="text-lg font-bold text-amber-600 mt-1">{formatCurrency(stats.outstanding)}</div></CardContent></Card>
        <Card size="sm"><CardContent className="p-4"><div className="text-[11px] text-muted-foreground uppercase tracking-wider">Available Credit</div><div className="text-lg font-bold text-purple-600 mt-1">{formatCurrency(stats.availableCredit)}</div></CardContent></Card>
      </div>

      {/* Tabs + Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-1 bg-muted rounded-lg p-0.5">
          {([{ id: 'all', label: 'All' }, { id: 'in', label: 'Money In' }, { id: 'out', label: 'Money Out' }] as { id: TabId; label: string }[]).map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={cn('px-3 py-1.5 rounded-md text-xs font-medium transition-colors', tab === t.id ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground')}>
              {t.label}
            </button>
          ))}
        </div>
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input type="text" placeholder="Search by contact or reference..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-9 pr-3 rounded-xl border border-input bg-background text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring/30" />
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          <button onClick={() => setMethodFilter('all')}
            className={cn('text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors whitespace-nowrap', methodFilter === 'all' ? 'bg-foreground text-background border-foreground' : 'bg-background text-muted-foreground border-border hover:text-foreground')}>All</button>
          {(Object.entries(methodConfig) as [PaymentMethod, typeof methodConfig.cash][]).map(([key, cfg]) => {
            const Icon = cfg.icon
            return (
              <button key={key} onClick={() => setMethodFilter(key)}
                className={cn('flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors whitespace-nowrap', methodFilter === key ? `${cfg.bg} ${cfg.color} border-current` : 'bg-background text-muted-foreground border-border hover:text-foreground')}>
                <Icon className="size-3.5" />{cfg.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Desktop table */}
      <div className="hidden md:block rounded-xl border border-border overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <Th>Date</Th>
              <Th>Reference</Th>
              <Th>Contact</Th>
              <Th>Direction</Th>
              <Th>Type</Th>
              <Th>Method</Th>
              <Th className="text-right">Amount</Th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-16 text-sm text-muted-foreground"><CreditCard className="size-8 mx-auto mb-2 text-muted-foreground/30" /><span>No transactions found.</span></td></tr>
            ) : (
              filtered.map((ft) => {
                const contact = getContactById(ft.contactId)
                const cfg = methodConfig[ft.method]
                const Icon = cfg.icon
                const typeCfg = FT_TYPE_CONFIG[ft.type]
                return (
                  <tr key={ft.id}
                    className="border-b border-border last:border-b-0 hover:bg-muted/30 transition-colors group cursor-pointer"
                    onClick={() => { setSelectedFT(ft) }}>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{ft.date}</td>
                    <td className="px-4 py-3"><code className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">{ft.reference}</code></td>
                    <td className="px-4 py-3 text-sm font-medium text-foreground">{contact?.name || '—'}</td>
                    <td className="px-4 py-3">
                      {ft.direction === 'in' ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600"><ArrowDownRight className="size-3" /> IN</span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-red-600"><ArrowUpRight className="size-3" /> OUT</span>
                      )}
                    </td>
                    <td className="px-4 py-3"><span className={cn('text-xs font-medium', typeCfg?.color || '')}>{typeCfg?.label || ft.type}</span></td>
                    <td className="px-4 py-3"><span className={cn('inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full', cfg.bg, cfg.color)}><Icon className="size-3" />{cfg.label}</span></td>
                    <td className={cn('px-4 py-3 text-sm font-semibold text-right', ft.direction === 'in' ? 'text-emerald-600' : 'text-red-600')}>
                      {ft.direction === 'in' ? '+' : '-'}{formatCurrency(ft.amount)}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-sm text-muted-foreground"><CreditCard className="size-10 mx-auto mb-2 text-muted-foreground/30" /><span>No transactions found.</span></div>
        ) : (
          filtered.map((ft) => {
            const contact = getContactById(ft.contactId)
            const cfg = methodConfig[ft.method]
            const Icon = cfg.icon
            const typeCfg = FT_TYPE_CONFIG[ft.type]
            return (
              <button key={ft.id} onClick={() => ft.linkedSaleId ? navigate(`/sales/${ft.linkedSaleId}`) : navigate(`/contacts/${ft.contactId}`)} className="w-full text-left group">
                <Card size="sm" className="transition-all hover:shadow-sm active:scale-[0.99]">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={cn('flex items-center justify-center size-8 rounded-lg', cfg.bg)}><Icon className={cn('size-4', cfg.color)} /></div>
                        <div>
                          <div className="text-sm font-medium text-foreground">{contact?.name || '—'}</div>
                          <div className="text-xs text-muted-foreground">{ft.reference} <span className={cn('text-[10px]', typeCfg?.color || '')}>{typeCfg?.label || ft.type}</span></div>
                        </div>
                      </div>
                      <span className={cn('text-sm font-semibold', ft.direction === 'in' ? 'text-emerald-600' : 'text-red-600')}>
                        {ft.direction === 'in' ? '+' : '-'}{formatCurrency(ft.amount)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">{ft.direction === 'in' ? <ArrowDownRight className="size-3 text-emerald-500" /> : <ArrowUpRight className="size-3 text-red-500" />}{ft.direction === 'in' ? 'In' : 'Out'} · {ft.method}</span>
                      <span>{ft.date}</span>
                    </div>
                  </CardContent>
                </Card>
              </button>
            )
          })
        )}
      </div>

      {/* Record Payment Dialog */}
      <RecordPaymentDialog open={showRecordPayment} onClose={() => setShowRecordPayment(false)} onSuccess={() => { setSelectedFT(null); setShowRecordPayment(false) }} />

      {/* Payment Detail Modal */}
      <PaymentDetailModal ft={selectedFT} onClose={() => setSelectedFT(null)} />
    </div>
  )
}

function PaymentDetailModal({ ft, onClose }: { ft: typeof financialTransactions[0] | null; onClose: () => void }) {
  const navigate = useNavigate()
  if (!ft) return null
  const contact = getContactById(ft.contactId)
  const typeCfg = FT_TYPE_CONFIG[ft.type]

  return (
    <Dialog open={!!ft} onOpenChange={(v) => { if (!v) onClose() }}>
      <DialogContent className="sm:max-w-sm gap-0 p-0">
        {/* Receipt-style header */}
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-6 text-center border-b border-border">
          <div className="inline-flex items-center justify-center size-12 rounded-full bg-primary/10 mb-3">
            <CreditCard className="size-6 text-primary" />
          </div>
          <div className="text-lg font-bold text-foreground">{formatCurrency(ft.amount)}</div>
          <div className={cn('text-xs font-medium mt-1', ft.direction === 'in' ? 'text-emerald-600' : 'text-red-600')}>
            {ft.direction === 'in' ? 'Payment Received' : 'Payment Sent'}
          </div>
          <div className="text-[10px] text-muted-foreground mt-1">{ft.reference}</div>
        </div>

        {/* Details */}
        <div className="p-5 space-y-3">
          <DetailRow label="Date" value={ft.date} />
          <DetailRow label="Party" value={contact?.name || '—'} />
          <DetailRow label="Type" value={typeCfg?.label || ft.type} />
          <DetailRow label="Method" value={ft.method} />
          {ft.description && <DetailRow label="Note" value={ft.description} />}
          {ft.linkedSaleId && (
            <div className="flex items-center justify-between py-2">
              <span className="text-xs text-muted-foreground">Related Sale</span>
              <button onClick={() => { onClose(); navigate(`/sales/${ft.linkedSaleId}`) }}
                className="text-xs text-primary hover:underline">{ft.linkedSaleId}</button>
            </div>
          )}
          <DetailRow label="Created By" value={ft.createdBy} />

          <div className="pt-3 border-t border-border flex gap-2">
            <Button variant="outline" size="sm" className="flex-1 gap-1.5" onClick={() => toast.success('Receipt preview (prototype)')}>Print Receipt</Button>
            <Button variant="outline" size="sm" className="flex-1 gap-1.5" onClick={() => toast.success('Share link copied (prototype)')}>Share</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-xs font-medium text-foreground">{value}</span>
    </div>
  )
}

function Th({ children, className }: { children?: React.ReactNode; className?: string }) {
  return <th className={cn('px-4 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider', className)}>{children}</th>
}
