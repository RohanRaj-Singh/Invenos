import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, RotateCcw, ExternalLink, ShoppingBag, Printer } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getPurchaseReturnByNumber } from '@/data/returns'
import { getPurchaseBill } from '@/data/purchases'
import { formatCurrency } from '@/data/dashboard'
import { cn } from '@/lib/utils'

const CONDITION_LABELS: Record<string, { label: string; cls: string }> = {
  resellable: { label: 'Resellable', cls: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' },
  damaged: { label: 'Damaged', cls: 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400' },
  expired: { label: 'Expired', cls: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400' },
}

export default function PurchaseReturnDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const returnData = getPurchaseReturnByNumber(id || '')

  if (!returnData) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
        <div className="flex flex-col items-center justify-center py-24 text-sm text-muted-foreground">
          <RotateCcw className="size-12 text-muted-foreground/30 mb-4" />
          <h2 className="text-lg font-semibold text-foreground mb-1">Return Not Found</h2>
          <p className="mb-4">This return transaction doesn't exist.</p>
          <Button variant="outline" onClick={() => navigate('/purchases/returns')}>Back to Purchase Returns</Button>
        </div>
      </div>
    )
  }

  const originalBill = returnData.originalPurchaseId ? getPurchaseBill(returnData.originalPurchaseId) : null

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-5">
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button onClick={() => navigate('/purchases/returns')} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="size-4" />
          <span>Back to Purchase Returns</span>
        </button>
        <div className="flex items-center gap-2">
          <button onClick={() => window.print()} className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-border text-xs font-medium hover:bg-muted transition-colors">
            <Printer className="size-3.5" />
            Print
          </button>
          {originalBill && (
            <Link to={`/purchases/${returnData.originalPurchaseId}`}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-border text-xs font-medium hover:bg-muted transition-colors">
              <ExternalLink className="size-3.5" />
              View Original Purchase
            </Link>
          )}
        </div>
      </div>

      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="size-12 sm:size-14 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-500/5 flex items-center justify-center shrink-0">
          <RotateCcw className="size-6 sm:size-7 text-amber-600 dark:text-amber-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">{returnData.returnNumber}</h1>
            <Badge variant="outline" className="text-[10px] bg-amber-50 text-amber-700 border-amber-200 px-2 py-0 h-5 font-medium">Purchase Return</Badge>
          </div>
          <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground flex-wrap">
            <span className="font-medium text-foreground">{returnData.supplierName}</span>
            <span>·</span>
            <span>{returnData.date}</span>
            <span>·</span>
            <span>{returnData.createdBy}</span>
          </div>
          {originalBill && (
            <div className="mt-1">
              <Link to={`/purchases/${returnData.originalPurchaseId}`} className="text-xs text-primary hover:underline inline-flex items-center gap-1">
                <ExternalLink className="size-3" />
                Original: {returnData.originalInvoice}
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Items Returned" value={`${returnData.items.length}`} />
        <StatCard label="Total Units" value={`${returnData.items.reduce((s, i) => s + i.returnedQty, 0)}`} />
        <StatCard label="Total Refund" value={formatCurrency(returnData.totalRefund)} bold />
        <StatCard label="Refund Method" value={returnData.refundMethod} positive />
      </div>

      {/* Original Purchase Card */}
      {originalBill && (
        <Card size="sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <ShoppingBag className="size-4 text-muted-foreground" />
                <span className="text-muted-foreground">Original Purchase:</span>
                <span className="font-medium">{returnData.originalInvoice}</span>
                <span className="text-muted-foreground">·</span>
                <span>{originalBill.date}</span>
                <span className="text-muted-foreground">·</span>
                <span>{formatCurrency(originalBill.totalAmount)}</span>
              </div>
              <Link
                to={`/purchases/${returnData.originalPurchaseId}`}
                className="text-xs text-primary hover:underline inline-flex items-center gap-1"
              >
                View Purchase <ExternalLink className="size-3" />
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Returned Items */}
      <Card>
        <CardHeader>
          <CardTitle>Returned Items ({returnData.items.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            <div className="grid grid-cols-12 gap-3 px-3 py-2 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              <div className="col-span-4">Product</div>
              <div className="col-span-2 text-center">Returned</div>
              <div className="col-span-2 text-right">Cost</div>
              <div className="col-span-2 text-right">Refund</div>
              <div className="col-span-2 text-right">Condition</div>
            </div>
            {returnData.items.map((item) => (
              <div key={item.originalLineId} className="grid grid-cols-12 gap-3 px-3 py-2.5 rounded-lg hover:bg-muted/50 transition-colors text-sm">
                <div className="col-span-4 font-medium text-foreground truncate">{item.productName}</div>
                <div className="col-span-2 text-center text-muted-foreground">{item.returnedQty} {item.unitName}</div>
                <div className="col-span-2 text-right text-muted-foreground">{formatCurrency(item.refundAmount / Math.max(1, item.returnedQty))}</div>
                <div className="col-span-2 text-right font-semibold text-amber-600 dark:text-amber-400">{formatCurrency(item.refundAmount)}</div>
                <div className="col-span-2 text-right">
                  <Badge variant="outline" className={cn('text-[10px] px-1.5 py-0 h-5', CONDITION_LABELS[item.condition]?.cls)}>
                    {CONDITION_LABELS[item.condition]?.label || item.condition}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-border">
            <div className="flex justify-between text-sm font-semibold px-3">
              <span>Total Refund</span>
              <span className="text-amber-600 dark:text-amber-400">{formatCurrency(returnData.totalRefund)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {originalBill && (
              <TimelineEntry
                icon={<ShoppingBag className="size-4" />}
                title="Original Purchase Created"
                description={`${returnData.originalInvoice} — ${formatCurrency(originalBill.totalAmount)}`}
                date={originalBill.date}
                active
              />
            )}
            <TimelineEntry
              icon={<RotateCcw className="size-4" />}
              title="Return Processed"
              description={`${returnData.returnNumber} — ${returnData.items.length} item${returnData.items.length !== 1 ? 's' : ''} returned · Refund ${formatCurrency(returnData.totalRefund)}`}
              date={returnData.date}
              active
            />
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
          negative && 'text-red-600 dark:text-red-400',
        )}>
          {value}
        </div>
      </CardContent>
    </Card>
  )
}

function TimelineEntry({ icon, title, description, date, active }: {
  icon: React.ReactNode; title: string; description: string; date: string; active?: boolean
}) {
  return (
    <div className="flex gap-3">
      <div className={cn(
        'flex items-center justify-center size-8 rounded-lg shrink-0 mt-0.5',
        active ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground',
      )}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-foreground">{title}</div>
        <div className="text-xs text-muted-foreground">{description}</div>
      </div>
      <div className="text-xs text-muted-foreground shrink-0">{date}</div>
    </div>
  )
}
