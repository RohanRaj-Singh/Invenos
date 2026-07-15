import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Receipt, ExternalLink, Banknote } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getSaleById, getSalePayments, getPatientName } from '@/data/sales'
import { mockVisits } from '@/data/clinic'
import { mockContacts } from '@/data/contacts'
import { formatCurrency } from '@/data/dashboard'
import { cn } from '@/lib/utils'
import RecordPaymentDialog from '@/features/payments/components/RecordPaymentDialog'
import type { SaleSource, PaymentStatus } from '@/types'

const sourceConfig: Record<SaleSource, { label: string; cls: string }> = {
  pos: { label: 'POS', cls: 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400' },
  clinic: { label: 'Clinic', cls: 'bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400' },
  manual: { label: 'Manual', cls: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400' },
}

const payCfg: Record<PaymentStatus, { label: string; cls: string }> = {
  paid: { label: 'Paid', cls: 'text-emerald-600 dark:text-emerald-400' },
  partial: { label: 'Partially Paid', cls: 'text-amber-600 dark:text-amber-400' },
  unpaid: { label: 'Unpaid', cls: 'text-red-600 dark:text-red-400' },
}

export default function SaleDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [showPayment, setShowPayment] = useState(false)
  const sale = getSaleById(id || '')

  if (!sale) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
        <div className="flex flex-col items-center justify-center py-24 text-sm text-muted-foreground">
          <Receipt className="size-12 text-muted-foreground/30 mb-4" />
          <h2 className="text-lg font-semibold text-foreground mb-1">Sale not found</h2>
          <p className="mb-4">This transaction doesn't exist.</p>
          <Button variant="outline" onClick={() => navigate('/sales')}>Back to Sales</Button>
        </div>
      </div>
    )
  }

  const payments = getSalePayments(sale.id)
  const srcCfg = sourceConfig[sale.source]
  const pCfg = payCfg[sale.paymentStatus]
  const customerLabel = sale.customerName || (sale.patientId ? getPatientName(sale.patientId) : '—')
  // Find linked visit
  const linkedVisit = sale.source === 'clinic' && sale.patientId
    ? mockVisits.find((v) => v.saleId === sale.id)
    : null

  return (
    <>
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <button onClick={() => navigate('/sales')} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="size-4" />
          <span>Back to sales</span>
        </button>
        <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setShowPayment(true)}>
          <Banknote className="size-3.5" />
          Record Payment
        </Button>
      </div>

      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="size-12 sm:size-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0">
          <Receipt className="size-6 sm:size-7 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">{sale.invoiceNumber}</h1>
            <Badge variant="outline" className={cn('text-[10px] px-2 py-0 h-5 font-medium', srcCfg.cls)}>{srcCfg.label}</Badge>
            <Badge variant="outline" className={cn('text-[10px] px-2 py-0 h-5 font-medium', pCfg.cls)}>{pCfg.label}</Badge>
          </div>
          <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground flex-wrap">
            <span className="font-medium text-foreground">{customerLabel}</span>
            <span>·</span>
            <span>{sale.date}</span>
            <span>·</span>
            <span>{sale.createdBy}</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Subtotal" value={formatCurrency(sale.subtotal)} />
        {sale.discount > 0 && <StatCard label="Discount" value={`-${formatCurrency(sale.discount)}`} negative />}
        <StatCard label="Grand Total" value={formatCurrency(sale.grandTotal)} bold />
        <StatCard label="Amount Paid" value={formatCurrency(sale.amountPaid)} positive />
        <StatCard label="Outstanding" value={formatCurrency(sale.outstandingBalance)} negative={sale.outstandingBalance > 0} />
      </div>

      {/* Linked Visit (if clinic source) */}
      {linkedVisit && (
        <Card size="sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Linked Visit:</span>
                <span className="font-medium">{linkedVisit.id?.toUpperCase?.() || linkedVisit.id}</span>
                <span className="text-muted-foreground">·</span>
                <span>{linkedVisit.visitDate}</span>
                <span className="text-muted-foreground">·</span>
                <span className="text-muted-foreground">{linkedVisit.diagnosis}</span>
              </div>
              <button
                onClick={() => navigate(`/clinic/patient/${sale.patientId}`)}
                className="text-xs text-primary hover:underline inline-flex items-center gap-1"
              >
                View Visit <ExternalLink className="size-3" />
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Line Items */}
      <Card>
        <CardHeader>
          <CardTitle>Items ({sale.items.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            <div className="grid grid-cols-12 gap-3 px-3 py-2 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              <div className="col-span-5">Product</div>
              <div className="col-span-2 text-right">Qty</div>
              <div className="col-span-2 text-right">Price</div>
              <div className="col-span-3 text-right">Total</div>
            </div>
            {sale.items.map((item) => (
              <div key={item.id} className="grid grid-cols-12 gap-3 px-3 py-2.5 rounded-lg hover:bg-muted/50 transition-colors text-sm">
                <div className="col-span-5 font-medium text-foreground truncate">{item.name}</div>
                <div className="col-span-2 text-right text-muted-foreground">{item.packagingQuantity} {item.packagingName}</div>
                <div className="col-span-2 text-right text-muted-foreground">{formatCurrency(item.unitPrice)}</div>
                <div className="col-span-3 text-right font-semibold">{formatCurrency(item.total)}</div>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-border space-y-1">
            <div className="flex justify-between text-sm px-3">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatCurrency(sale.subtotal)}</span>
            </div>
            {sale.discount > 0 && (
              <div className="flex justify-between text-sm px-3">
                <span className="text-muted-foreground">Discount</span>
                <span className="text-red-500">-{formatCurrency(sale.discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-semibold px-3 pt-1 border-t border-border">
              <span>Grand Total</span>
              <span>{formatCurrency(sale.grandTotal)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payments */}
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Payments</CardTitle>
          <span className="text-xs text-muted-foreground">{payments.length} payment{payments.length !== 1 ? 's' : ''}</span>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <div className="text-center py-6 text-sm text-muted-foreground">No payments recorded.</div>
          ) : (
            <div className="space-y-1">
              {payments.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center size-8 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 shrink-0">
                      <Banknote className="size-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-foreground capitalize">{payment.method}</div>
                      <div className="text-xs text-muted-foreground">{payment.date} · {payment.reference}</div>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(payment.amount)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
      <RecordPaymentDialog open={showPayment} onClose={() => setShowPayment(false)}
        contact={sale.patientId ? mockContacts.find((c) => c.id === sale.patientId) : mockContacts.find((c) => sale.customerName?.toLowerCase().includes(c.name.toLowerCase()))}
        direction="in" linkedSaleId={sale.id} maxAmount={sale.outstandingBalance}
        onSuccess={() => setShowPayment(false)} />
    </>)

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
