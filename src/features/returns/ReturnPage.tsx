import { useState, useMemo, useCallback, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Search, RotateCcw, CheckCircle2, Package, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { formatCurrency } from '@/lib/format'
import { cn } from '@/lib/utils'
import { useTransactionRecorder } from '@/features/transactions/useTransactionRecorder'
import { ConfirmTransactionDialog } from '@/features/transactions/dialogs/ConfirmDialog'
import { getCurrentUserName } from '@/data/users'
import type { TransactionStrategy } from '@/domain/transactions/strategies/types'
import type { Sale, PurchaseBill } from '@/types'
import { allSales } from '@/data/sales'
import { purchaseBills } from '@/data/purchases'
import { toast } from 'sonner'

type ReturnReason = 'defective' | 'wrong_item' | 'changed_mind' | 'expired' | 'damaged' | 'quality' | 'other'
type ItemCondition = 'resellable' | 'damaged' | 'expired'

const RETURN_REASONS: { value: ReturnReason; label: string }[] = [
  { value: 'defective', label: 'Defective' },
  { value: 'wrong_item', label: 'Wrong Item' },
  { value: 'changed_mind', label: 'Changed Mind' },
  { value: 'expired', label: 'Expired' },
  { value: 'damaged', label: 'Damaged' },
  { value: 'quality', label: 'Quality Issue' },
  { value: 'other', label: 'Other' },
]

const CONDITIONS: { value: ItemCondition; label: string }[] = [
  { value: 'resellable', label: 'Resellable' },
  { value: 'damaged', label: 'Damaged' },
  { value: 'expired', label: 'Expired' },
]

interface ReturnItemState {
  originalLineId: string
  productId: string
  productName: string
  unitName: string
  originalQty: number
  originalPrice: number
  originalTotal: number
  maxReturnable: number
  returnQty: number
  selected: boolean
  reason: ReturnReason
  condition: ItemCondition
  restock: boolean
}

interface ReturnPageProps {
  strategy: TransactionStrategy
  backPath: string
  title: string
  isPurchase: boolean
}

export default function ReturnPage({ strategy, backPath, title, isPurchase }: ReturnPageProps) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { record } = useTransactionRecorder()

  const [searchRef, setSearchRef] = useState(() => searchParams.get('ref') || '')
  const [originalTx, setOriginalTx] = useState<Sale | PurchaseBill | null>(null)
  const [returnItems, setReturnItems] = useState<ReturnItemState[]>([])
  const [refundMethod, setRefundMethod] = useState('cash')
  const [showConfirm, setShowConfirm] = useState(false)
  const [showReceipt, setShowReceipt] = useState(false)
  const [receiptRef, setReceiptRef] = useState('')
  const [loaded, setLoaded] = useState(false)
  const [highlighted, setHighlighted] = useState(0)

  const transactions = useMemo(() => {
    const list = isPurchase
      ? purchaseBills.map((b) => ({
          id: b.id, ref: b.invoiceRef, date: b.date,
          party: b.supplierName, total: b.totalAmount,
          items: b.items.length, itemsList: b.items,
        }))
      : allSales.map((s) => ({
          id: s.id, ref: s.invoiceNumber, date: s.date,
          party: s.customerName || 'Walk-in Customer', total: s.grandTotal,
          items: s.items.length, itemsList: s.items,
        }))
    return list.sort((a, b) => b.date.localeCompare(a.date))
  }, [isPurchase])

  const filteredTx = useMemo(() => {
    const q = searchRef.toLowerCase().trim()
    if (!q) return transactions.slice(0, 15)
    return transactions.filter((tx) =>
      tx.ref.toLowerCase().includes(q) ||
      tx.party.toLowerCase().includes(q) ||
      String(tx.total).includes(q) ||
      tx.itemsList.some((item: any) =>
        (item.productName || item.name || '').toLowerCase().includes(q)
      )
    ).slice(0, 15)
  }, [searchRef, transactions])

  // Auto-search when navigated from detail page with ref param
  useEffect(() => {
    const ref = searchParams.get('ref')
    if (ref && !loaded) {
      setSearchRef(ref)
    }
  }, [])

  const selectTransaction = useCallback((tx: typeof filteredTx[0]) => {
    if (isPurchase) {
      const bill = purchaseBills.find((b) => b.id === tx.id)
      if (!bill) return
      setOriginalTx(bill)
      setReturnItems(bill.items.map((item) => ({
        originalLineId: item.id, productId: item.productId,
        productName: item.productName, unitName: item.purchasePackName,
        originalQty: item.purchaseQuantity, originalPrice: item.unitCost,
        originalTotal: item.totalCost, maxReturnable: item.purchaseQuantity,
        returnQty: 0, selected: false,
        reason: 'other' as ReturnReason, condition: 'resellable' as ItemCondition, restock: false,
      })))
    } else {
      const sale = allSales.find((s) => s.id === tx.id)
      if (!sale) return
      setOriginalTx(sale)
      setReturnItems(sale.items.map((item) => ({
        originalLineId: item.id, productId: item.productId,
        productName: item.name, unitName: item.packagingName,
        originalQty: item.packagingQuantity, originalPrice: item.unitPrice,
        originalTotal: item.total, maxReturnable: item.packagingQuantity,
        returnQty: 0, selected: false,
        reason: 'other' as ReturnReason, condition: 'resellable' as ItemCondition, restock: true,
      })))
    }
    setLoaded(true)
    setSearchRef('')
    setHighlighted(0)
  }, [isPurchase])

  // Auto-select when navigated from detail page with ref param
  useEffect(() => {
    const ref = searchParams.get('ref')
    if (ref && !loaded) {
      const match = transactions.find((tx) => tx.ref === ref)
      if (match) selectTransaction(match)
    }
  }, [searchParams])

  const toggleItem = (idx: number) => {
    setReturnItems((prev) => prev.map((item, i) =>
      i === idx ? { ...item, selected: !item.selected, returnQty: !item.selected ? item.maxReturnable : 0 } : item
    ))
  }

  const setReturnQty = (idx: number, qty: number) => {
    setReturnItems((prev) => prev.map((item, i) =>
      i === idx ? { ...item, returnQty: Math.max(0, Math.min(qty, item.maxReturnable)) } : item
    ))
  }

  const setReason = (idx: number, reason: ReturnReason) => {
    setReturnItems((prev) => prev.map((item, i) =>
      i === idx ? { ...item, reason, condition: reason === 'defective' || reason === 'damaged' ? 'damaged' : item.condition } : item
    ))
  }

  const setCondition = (idx: number, condition: ItemCondition) => {
    setReturnItems((prev) => prev.map((item, i) =>
      i === idx ? { ...item, condition, restock: condition === 'resellable' } : item
    ))
  }

  const selectedItems = returnItems.filter((r) => r.selected && r.returnQty > 0)
  const refundTotal = selectedItems.reduce((sum, r) => sum + r.originalPrice * r.returnQty, 0)

  const handleProcessReturn = useCallback(() => {
    if (selectedItems.length === 0) return

    const result = record({
      strategy,
      items: selectedItems.map((r) => ({
        id: `ret-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        productId: r.productId,
        name: r.productName,
        sellingUnitId: r.productId,
        packagingName: r.unitName,
        packagingQuantity: r.returnQty,
        baseUnitQuantity: 1,
        baseQuantity: r.returnQty,
        unitPrice: r.originalPrice,
        total: r.originalPrice * r.returnQty,
        category: '',
        restock: r.restock,
      })),
      partyId: originalTx && 'supplierId' in originalTx ? (originalTx as PurchaseBill).supplierId
        : originalTx && 'customerName' in originalTx ? null : null,
      partyName: originalTx && 'supplierName' in originalTx ? (originalTx as PurchaseBill).supplierName
        : originalTx && 'customerName' in originalTx ? (originalTx as Sale).customerName ?? '' : '',
      discount: 0,
      discountPct: 0,
      paymentMethod: refundMethod,
      amountPaid: String(refundTotal),
      subtotal: refundTotal,
      grandTotal: refundTotal,
      date: new Date().toISOString().split('T')[0],
      createdBy: getCurrentUserName(),
    })

    setReceiptRef(result.receipt.invoiceNumber)
    setShowReceipt(true)
    toast.success(`${title} recorded: ${result.receipt.invoiceNumber}`)
  }, [selectedItems, strategy, originalTx, refundTotal, refundMethod, record, title])

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="px-5 py-3 border-b border-border bg-card shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(backPath)} className="flex items-center justify-center size-9 rounded-lg hover:bg-muted transition-colors">
              <ArrowLeft className="size-5 text-muted-foreground" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-foreground leading-tight">{title}</h1>
              <p className="text-[11px] text-muted-foreground">
                {new Date().toLocaleDateString('en-PK', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                {' · '}
                {new Date().toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction picker */}
      {!loaded && (
        <div className="flex-1 overflow-y-auto">
          <div className="px-5 py-3 bg-card shrink-0 sticky top-0 z-10 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                type="text"
                value={searchRef}
                onChange={(e) => { setSearchRef(e.target.value); setHighlighted(0) }}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowDown') {
                    e.preventDefault()
                    setHighlighted((prev) => Math.min(prev + 1, filteredTx.length - 1))
                  } else if (e.key === 'ArrowUp') {
                    e.preventDefault()
                    setHighlighted((prev) => Math.max(prev - 1, 0))
                  } else if (e.key === 'Enter') {
                    e.preventDefault()
                    if (filteredTx[highlighted]) selectTransaction(filteredTx[highlighted])
                  }
                }}
                placeholder={`Search ${isPurchase ? 'purchase' : 'sale'} invoice by number, ${isPurchase ? 'supplier' : 'customer'}, product, or amount...`}
                className="w-full h-10 pl-10 pr-4 rounded-lg border border-input bg-background text-sm outline-none focus:border-ring"
                autoFocus
              />
              {searchRef && (
                <button onClick={() => { setSearchRef(''); setHighlighted(0) }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center size-6 rounded-md hover:bg-muted text-muted-foreground">
                  <X className="size-3.5" />
                </button>
              )}
            </div>
            <p className="text-[10px] text-muted-foreground mt-1.5">
              {searchRef ? `${filteredTx.length} match${filteredTx.length !== 1 ? 'es' : ''}` : `Recent ${isPurchase ? 'purchases' : 'sales'} — select one to return`}
            </p>
          </div>

          <div className="divide-y divide-border">
            {filteredTx.length === 0 ? (
              <div className="text-center py-16 text-sm text-muted-foreground">
                <Package className="size-10 text-muted-foreground/20 mx-auto mb-3" />
                <p>No {isPurchase ? 'purchase' : 'sale'} invoices found</p>
              </div>
            ) : (
              filteredTx.map((tx, idx) => (
                <button
                  key={tx.id}
                  onClick={() => selectTransaction(tx)}
                  className={cn(
                    'w-full flex items-center gap-3 px-5 py-3 text-left transition-colors',
                    idx === highlighted ? 'bg-muted' : 'hover:bg-muted/50'
                  )}
                >
                  <div className="flex items-center justify-center size-9 rounded-lg bg-muted shrink-0">
                    <Package className="size-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-foreground">{tx.ref}</span>
                      <span className="text-[10px] text-muted-foreground">{tx.date}</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {tx.party} · {tx.items} item{tx.items !== 1 ? 's' : ''} · {formatCurrency(tx.total)}
                    </div>
                  </div>
                  {idx === highlighted && (
                    <kbd className="hidden sm:inline-flex items-center px-1 py-0.5 text-[9px] text-muted-foreground bg-muted rounded font-sans">⏎</kbd>
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {/* Return items */}
      {loaded && originalTx && (
        <>
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
            <div className="flex items-center gap-3 text-sm">
              <Badge variant="outline" className="text-xs">
                {isPurchase ? (originalTx as PurchaseBill).invoiceRef : (originalTx as Sale).invoiceNumber}
              </Badge>
              <span className="text-muted-foreground">
                {isPurchase ? (originalTx as PurchaseBill).supplierName : (originalTx as Sale).customerName || 'Walk-in Customer'}
              </span>
              <span className="text-muted-foreground">
                {(isPurchase ? (originalTx as PurchaseBill).date : (originalTx as Sale).date)}
              </span>
            </div>

            {returnItems.length === 0 ? (
              <div className="text-center py-12 text-sm text-muted-foreground">No items in this invoice.</div>
            ) : (
              <div className="rounded-xl border border-border overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <Th className="w-10">#</Th>
                      <Th>Item</Th>
                      <Th className="w-20 text-center">Orig Qty</Th>
                      <Th className="w-20 text-center">Return</Th>
                      <Th className="w-24">Reason</Th>
                      <Th className="w-24">Condition</Th>
                      <Th className="w-24 text-right">Refund</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {returnItems.map((item, idx) => (
                      <tr key={item.originalLineId} className={cn('border-b border-border', item.selected && 'bg-primary/5')}>
                        <Td className="w-10 text-center">
                          <input
                            type="checkbox"
                            checked={item.selected}
                            onChange={() => toggleItem(idx)}
                            className="size-4 rounded border-input"
                          />
                        </Td>
                        <Td className="min-w-0">
                          <div className="text-sm font-medium text-foreground truncate max-w-[200px]">{item.productName}</div>
                          <div className="text-[10px] text-muted-foreground">
                            {item.unitName} · {formatCurrency(item.originalPrice)} each
                          </div>
                        </Td>
                        <Td className="w-20 text-center">
                          <span className="text-sm tabular-nums text-muted-foreground">{item.originalQty}</span>
                        </Td>
                        <Td className="w-20 text-center">
                          <input
                            type="number"
                            value={item.returnQty || ''}
                            onChange={(e) => setReturnQty(idx, parseInt(e.target.value) || 0)}
                            disabled={!item.selected}
                            className="w-16 h-7 px-1 rounded border border-input bg-background text-sm text-center outline-none focus:border-ring tabular-nums disabled:opacity-30"
                            min={0}
                            max={item.maxReturnable}
                          />
                        </Td>
                        <Td>
                          <select
                            value={item.reason}
                            onChange={(e) => setReason(idx, e.target.value as ReturnReason)}
                            disabled={!item.selected}
                            className="w-full h-7 px-1 rounded border border-input bg-background text-[11px] outline-none focus:border-ring disabled:opacity-30"
                          >
                            {RETURN_REASONS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                          </select>
                        </Td>
                        <Td>
                          <select
                            value={item.condition}
                            onChange={(e) => setCondition(idx, e.target.value as ItemCondition)}
                            disabled={!item.selected}
                            className="w-full h-7 px-1 rounded border border-input bg-background text-[11px] outline-none focus:border-ring disabled:opacity-30"
                          >
                            {CONDITIONS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                          </select>
                        </Td>
                        <Td className="w-24 text-right">
                          <span className={cn('text-sm font-semibold tabular-nums', item.selected && item.returnQty > 0 ? 'text-foreground' : 'text-muted-foreground')}>
                            {item.selected && item.returnQty > 0 ? formatCurrency(item.originalPrice * item.returnQty) : '—'}
                          </span>
                        </Td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Refund summary */}
            {selectedItems.length > 0 && (
              <div className="flex justify-end">
                <div className="w-72 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Items returning</span>
                    <span className="font-semibold">{selectedItems.length}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Total units</span>
                    <span className="font-semibold">{selectedItems.reduce((s, r) => s + r.returnQty, 0)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm gap-3">
                    <span className="text-muted-foreground shrink-0">Refund method</span>
                    <select
                      value={refundMethod}
                      onChange={(e) => setRefundMethod(e.target.value)}
                      className="h-7 px-2 rounded border border-input bg-background text-xs outline-none focus:border-ring"
                    >
                      <option value="cash">Cash</option>
                      <option value="card">Card</option>
                      <option value="transfer">Transfer</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <span className="text-base font-bold text-foreground">Refund Total</span>
                    <span className="text-lg font-bold text-foreground tabular-nums">{formatCurrency(refundTotal)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action bar */}
          {loaded && (
            <div className="border-t border-border bg-card px-5 py-3 shrink-0">
              <div className="flex items-center justify-between">
                <Button variant="outline" size="sm" className="gap-1.5" onClick={() => { setLoaded(false); setOriginalTx(null); setSearchRef('') }}>
                  <RotateCcw className="size-3.5" /> Change Invoice
                </Button>
                <Button
                  size="sm"
                  className="gap-1.5 shadow-sm"
                  disabled={selectedItems.length === 0}
                  onClick={() => setShowConfirm(true)}
                >
                  <CheckCircle2 className="size-3.5" /> Process Return
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Confirm dialog */}
      <ConfirmTransactionDialog
        open={showConfirm}
        onOpenChange={setShowConfirm}
        itemCount={selectedItems.length}
        items={selectedItems.map((r) => ({
          name: r.productName,
          qty: r.returnQty,
          cost: r.originalPrice,
          total: r.originalPrice * r.returnQty,
          unitName: r.unitName,
        }))}
        subtotal={refundTotal}
        grandTotal={refundTotal}
        amountPaid={String(refundTotal)}
        partyName={isPurchase ? (originalTx as PurchaseBill)?.supplierName ?? null : (originalTx as Sale)?.customerName ?? null}
        showParty={true}
        paymentMethod={refundMethod}
        title={isPurchase ? 'Confirm Purchase Return' : 'Confirm Sale Return'}
        actionLabel="Process Return"
        onConfirm={handleProcessReturn}
      />

      {/* Receipt */}
      <Dialog open={showReceipt} onOpenChange={(v) => { if (!v) setShowReceipt(false) }}>
        <DialogContent className="sm:max-w-sm gap-0 p-0">
          <DialogHeader className="p-5 pb-0">
            <DialogTitle className="text-base">{title} Recorded</DialogTitle>
          </DialogHeader>
          <div className="p-5 space-y-4">
            <div className="rounded-xl bg-emerald-50 dark:bg-emerald-500/10 p-4 text-center">
              <CheckCircle2 className="size-10 text-emerald-500 mx-auto mb-2" />
              <p className="font-semibold text-foreground">{receiptRef}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''} returned · {formatCurrency(refundTotal)} refund
              </p>
            </div>
            <Button className="w-full gap-1" onClick={() => { setShowReceipt(false); navigate(backPath) }}>
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function Th({ children, className }: { children?: React.ReactNode; className?: string }) {
  return <th className={cn('px-3 py-2.5 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider', className)}>{children}</th>
}

function Td({ children, className }: { children?: React.ReactNode; className?: string }) {
  return <td className={cn('px-3 py-2', className)}>{children}</td>
}
