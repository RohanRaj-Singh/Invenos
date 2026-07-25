import { useState, useMemo } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, ShoppingBag, Banknote, ChevronDown, ChevronRight, RotateCcw, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getPurchaseBill } from '@/data/purchases'
import { getReturnsForPurchase } from '@/data/returns'
import { formatCurrency } from '@/lib/format'
import { mockProducts } from '@/data/inventory'
import { calculateSellingUnitCost, calculateMargin } from '@/lib/product-adapter'
import { cn } from '@/lib/utils'

const paymentColors: Record<string, { label: string; cls: string }> = {
  paid: { label: 'Paid', cls: 'text-emerald-600 dark:text-emerald-400' },
  partial: { label: 'Partially Paid', cls: 'text-amber-600 dark:text-amber-400' },
  unpaid: { label: 'Unpaid', cls: 'text-red-600 dark:text-red-400' },
}

const statusCfg: Record<string, { label: string; cls: string }> = {
  received: { label: 'Received', cls: 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400' },
  pending: { label: 'Pending', cls: 'bg-slate-50 text-slate-600 dark:bg-slate-500/10 dark:text-slate-400' },
}

export default function PurchaseDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())

  const bill = useMemo(() => (id ? getPurchaseBill(id) : undefined), [id])
  const returns = useMemo(() => (id ? getReturnsForPurchase(id) : []), [id])

  if (!bill) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
        <div className="flex flex-col items-center justify-center py-24 text-sm text-muted-foreground">
          <ShoppingBag className="size-12 text-muted-foreground/30 mb-4" />
          <h2 className="text-lg font-semibold text-foreground mb-1">Purchase not found</h2>
          <p className="mb-4">This transaction doesn't exist.</p>
          <Button variant="outline" onClick={() => navigate('/purchases')}>Back to Purchases</Button>
        </div>
      </div>
    )
  }

  const toggleExpand = (itemId: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev)
      if (next.has(itemId)) { next.delete(itemId) } else { next.add(itemId) }
      return next
    })
  }

  const getSellingUnitBreakdown = (item: typeof bill.items[0]) => {
    const product = mockProducts.find((p) => p.id === item.productId)
    if (!product) return []
    return product.sellingUnits.map((su) => {
      const costPerUnit = calculateSellingUnitCost(product, su.id)
      const yieldQty = item.purchaseQuantity * (item.purchasePackQty / su.quantity)
      const margin = calculateMargin(su.salePrice, costPerUnit)
      return { name: su.name, yieldQty: Math.floor(yieldQty), marginPercent: margin.marginPercent }
    })
  }

  const sCfg = statusCfg[bill.status] || { label: bill.status, cls: '' }
  const pCfg = paymentColors[bill.paymentStatus] || { label: bill.paymentStatus, cls: '' }
  const totalPacks = bill.items.reduce((s, i) => s + i.purchaseQuantity, 0)

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <button onClick={() => navigate('/purchases')} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="size-4" />
          <span>Back to purchases</span>
        </button>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => navigate(`/returns/purchase?ref=${bill.invoiceRef}`)}>
            <RotateCcw className="size-3.5" />
            Return
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5">
            <Banknote className="size-3.5" />
            Record Payment
          </Button>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="size-12 sm:size-14 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-500/5 flex items-center justify-center shrink-0">
          <ShoppingBag className="size-6 sm:size-7 text-amber-600" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">{bill.invoiceRef}</h1>
            <Badge variant="outline" className={cn('text-[10px] px-2 py-0 h-5 font-medium', sCfg.cls)}>{sCfg.label}</Badge>
            <Badge variant="outline" className={cn('text-[10px] px-2 py-0 h-5 font-medium', pCfg.cls)}>{pCfg.label}</Badge>
          </div>
          <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground flex-wrap">
            <span className="font-medium text-foreground">{bill.supplierName}</span>
            <span>·</span>
            <span>{bill.date}</span>
            <span>·</span>
            <span>{bill.createdBy}</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Subtotal" value={formatCurrency(bill.subtotal)} />
        <StatCard label="Grand Total" value={formatCurrency(bill.totalAmount)} bold />
        <StatCard label="Amount Paid" value={formatCurrency(bill.amountPaid)} positive />
        <StatCard label="Outstanding" value={formatCurrency(bill.outstandingBalance)} negative={bill.outstandingBalance > 0} />
      </div>

      {/* Line Items */}
      <Card>
        <CardHeader>
          <CardTitle>Items ({bill.items.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            <div className="grid grid-cols-12 gap-3 px-3 py-2 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              <div className="col-span-5">Product</div>
              <div className="col-span-2 text-right">Qty</div>
              <div className="col-span-2 text-right">Cost</div>
              <div className="col-span-3 text-right">Total</div>
            </div>
            {bill.items.map((item) => {
              const breakdown = getSellingUnitBreakdown(item)
              const isExpanded = expandedItems.has(item.id)
              return (
                <div key={item.id}>
                  <div className="grid grid-cols-12 gap-3 px-3 py-2.5 rounded-lg hover:bg-muted/50 transition-colors text-sm">
                    <div className="col-span-5 font-medium text-foreground truncate">{item.productName}</div>
                    <div className="col-span-2 text-right text-muted-foreground">
                      {item.purchaseQuantity} {item.purchasePackName}
                    </div>
                    <div className="col-span-2 text-right text-muted-foreground">{formatCurrency(item.unitCost)}</div>
                    <div className="col-span-3 text-right font-semibold">{formatCurrency(item.totalCost)}</div>
                  </div>
                  {breakdown.length > 0 && (
                    <div className="px-3 pb-2">
                      <button
                        onClick={() => toggleExpand(item.id)}
                        className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors ml-1"
                      >
                        {isExpanded ? <ChevronDown className="size-3" /> : <ChevronRight className="size-3" />}
                        Selling yield
                      </button>
                      {isExpanded && (
                        <div className="mt-1.5 flex flex-wrap gap-1.5 ml-4">
                          {breakdown.map((su) => (
                            <div key={su.name} className="text-xs px-2 py-0.5 rounded bg-muted/50 inline-flex items-center gap-1.5">
                              <span className="font-medium text-foreground">{su.name}</span>
                              <span className="text-muted-foreground">×{su.yieldQty}</span>
                              <span className={cn('font-medium', su.marginPercent > 0 ? 'text-emerald-600' : 'text-red-500')}>
                                {su.marginPercent > 0 ? '+' : ''}{su.marginPercent.toFixed(0)}%
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
          <div className="mt-3 pt-3 border-t border-border space-y-1">
            <div className="flex justify-between text-sm px-3">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatCurrency(bill.subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm px-3">
              <span className="text-muted-foreground">Items</span>
              <span>{bill.items.length} items · {totalPacks} packs</span>
            </div>
            <div className="flex justify-between text-sm font-semibold px-3 pt-1 border-t border-border">
              <span>Grand Total</span>
              <span>{formatCurrency(bill.totalAmount)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Returns */}
      {returns.length > 0 && (
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <RotateCcw className="size-4 text-amber-600" />
              Returns ({returns.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {returns.map((ret) => (
                <div key={ret.id} className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center size-8 rounded-lg bg-amber-50 dark:bg-amber-500/10 shrink-0">
                      <RotateCcw className="size-4 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                      <Link to={`/purchases/returns/${ret.returnNumber}`} className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                        {ret.returnNumber}
                      </Link>
                      <div className="text-xs text-muted-foreground">
                        {ret.items.length} item{ret.items.length !== 1 ? 's' : ''} returned · {ret.date}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-amber-600 dark:text-amber-400">
                      {formatCurrency(ret.totalRefund)}
                    </span>
                    <Link to={`/purchases/returns/${ret.returnNumber}`} className="text-xs text-primary hover:underline inline-flex items-center gap-1">
                      View <ExternalLink className="size-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment */}
      <Card>
        <CardHeader>
          <CardTitle>Payment</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center size-8 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 shrink-0">
                  <Banknote className="size-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <div className="text-sm font-medium text-foreground">{pCfg.label}</div>
                  <div className="text-xs text-muted-foreground">{bill.date} · {bill.invoiceRef}</div>
                </div>
              </div>
              <span className="text-sm font-semibold">
                {bill.amountPaid > 0 ? formatCurrency(bill.amountPaid) : '—'}
              </span>
            </div>
            {bill.outstandingBalance > 0 && (
              <div className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-amber-50/50 dark:bg-amber-500/5">
                <span className="text-sm text-amber-700 dark:text-amber-400 font-medium">Outstanding</span>
                <span className="text-sm font-bold text-amber-700 dark:text-amber-400">{formatCurrency(bill.outstandingBalance)}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function StatCard({ label, value, bold, positive, negative }: { label: string; value: string; bold?: boolean; positive?: boolean; negative?: boolean }) {
  return (
    <Card size="sm">
      <CardContent className="p-4">
        <div className="text-[11px] text-muted-foreground uppercase tracking-wider mb-1">{label}</div>
        <div className={cn(
          'text-lg tracking-tight',
          bold ? 'font-bold' : 'font-semibold',
          positive && 'text-emerald-600 dark:text-emerald-400',
          negative && 'text-red-600 dark:text-red-400'
        )}>
          {value}
        </div>
      </CardContent>
    </Card>
  )
}
