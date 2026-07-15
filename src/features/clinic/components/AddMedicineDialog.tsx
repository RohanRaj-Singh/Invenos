import { useState, useMemo, useEffect } from 'react'
import { Search, Plus, Minus, X, Pill, Clock, CalendarDays, FileText, Package, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { mockProducts, getProductById } from '@/data/inventory'
import { formatCurrency } from '@/data/dashboard'
import { cn } from '@/lib/utils'
import type { Product, CartItem } from '@/types'

export interface MedicineDosage {
  productId: string
  dosage: string
  frequency: string
  duration: string
  notes: string
}

export type MedicineEntry = CartItem & MedicineDosage

interface AddMedicineDialogProps {
  open: boolean
  onClose: () => void
  onAdd: (entry: MedicineEntry) => void
  selectedIds: string[]
  editEntry?: MedicineEntry | null
}

interface SelectedProduct extends MedicineDosage {
  product: Product
  packagingName: string
  packagingQuantity: number
  baseUnitQuantity: number
  baseQuantity: number
  unitPrice: number
  total: number
}

export default function AddMedicineDialog({ open, onClose, onAdd, selectedIds, editEntry }: AddMedicineDialogProps) {
  const [search, setSearch] = useState('')
  const [working, setWorking] = useState<SelectedProduct | null>(null)

  const getSmallestPkg = (product: Product) => product.packaging.length
    ? product.packaging.reduce((a, b) => a.quantity < b.quantity ? a : b)
    : null

  // When editEntry changes, pre-fill the config view
  useEffect(() => {
    if (open && editEntry) {
      const product = mockProducts.find((p) => p.id === editEntry.productId)
      if (product) {
        const pkg = product.packaging.find((p) => p.name === editEntry.packagingName) || getSmallestPkg(product)
        if (pkg) {
          setWorking({
            product,
            packagingName: editEntry.packagingName,
            packagingQuantity: editEntry.packagingQuantity,
            baseUnitQuantity: pkg.quantity,
            baseQuantity: editEntry.baseQuantity,
            unitPrice: editEntry.unitPrice,
            total: editEntry.total,
            dosage: editEntry.dosage,
            frequency: editEntry.frequency,
            duration: editEntry.duration,
            notes: editEntry.notes,
            productId: editEntry.productId,
          })
        }
      }
    }
  }, [open, editEntry])

  const filtered = useMemo(
    () => mockProducts.filter(
      (p) => search
        ? (p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase()))
        : true
    ),
    [search]
  )

  const getStockAfter = (productId: string, consumeQty: number): { current: number; remaining: number } | null => {
    const prod = getProductById(productId)
    if (!prod) return null
    return { current: prod.stockQuantity, remaining: Math.max(0, prod.stockQuantity - consumeQty) }
  }

  const handleSelectProduct = (product: Product) => {
    const pkg = getSmallestPkg(product)
    if (!pkg) return
    setWorking({
      product,
      packagingName: pkg.name,
      packagingQuantity: 1,
      baseUnitQuantity: pkg.quantity,
      baseQuantity: pkg.quantity,
      unitPrice: pkg.salePrice,
      total: pkg.salePrice,
      dosage: '1',
      frequency: 'Once daily',
      duration: '7 days',
      notes: '',
      productId: product.id,
    })
  }

  const handleChangePkg = (product: Product, pkgName: string) => {
    const pkg = product.packaging.find((p) => p.name === pkgName)
    if (!pkg) return
    setWorking((prev) => {
      if (!prev) return null
      return {
        ...prev,
        packagingName: pkg.name,
        packagingQuantity: 1,
        baseUnitQuantity: pkg.quantity,
        baseQuantity: pkg.quantity,
        unitPrice: pkg.salePrice,
        total: pkg.salePrice,
      }
    })
  }

  const handleQtyChange = (delta: number) => {
    setWorking((prev) => {
      if (!prev) return null
      const newQty = Math.max(1, prev.packagingQuantity + delta)
      return {
        ...prev,
        packagingQuantity: newQty,
        baseQuantity: newQty * prev.baseUnitQuantity,
        total: newQty * prev.unitPrice,
      }
    })
  }

  const handleAdd = () => {
    if (!working) return
    onAdd({
      id: editEntry ? editEntry.id : `med-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      productId: working.productId,
      name: working.product.name,
      packagingName: working.packagingName,
      packagingQuantity: working.packagingQuantity,
      baseUnitQuantity: working.baseUnitQuantity,
      baseQuantity: working.baseQuantity,
      unitPrice: working.unitPrice,
      total: working.total,
      category: working.product.category,
      dosage: working.dosage,
      frequency: working.frequency,
      duration: working.duration,
      notes: working.notes,
    })
    if (editEntry) {
      // Edit mode — close dialog after save
      handleClose()
    } else {
      // Add mode — reset for another entry
      setWorking(null)
      setSearch('')
    }
  }

  const handleClose = () => {
    setWorking(null)
    setSearch('')
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose() }}>
      <DialogContent className="sm:max-w-lg gap-0 p-0 max-h-[90vh] flex flex-col">
        <DialogHeader className="p-5 pb-3 shrink-0">
          <DialogTitle className="text-base">Add Medicine / Service</DialogTitle>
        </DialogHeader>

        {/* Search */}
        <div className="px-5 pb-3 shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 pl-9 pr-3 rounded-xl border border-input bg-background text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring/30"
              autoFocus
            />
          </div>
        </div>

        {working ? (
          /* ─── Configuring a product ─── */
          <div className="flex-1 overflow-y-auto px-5 pb-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-semibold">{working.product.name}</h4>
                <p className="text-xs text-muted-foreground">{working.product.sku} · {working.product.category}</p>
              </div>
              <button onClick={() => setWorking(null)} className="text-muted-foreground hover:text-foreground">
                <X className="size-4" />
              </button>
            </div>

            {/* Packaging selector */}
            {working.product.packaging.length > 1 && (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Packaging</label>
                <div className="flex flex-wrap gap-1.5">
                  {working.product.packaging.map((pkg) => (
                    <button
                      key={pkg.name}
                      onClick={() => handleChangePkg(working.product, pkg.name)}
                      className={cn(
                        'px-3 py-2 rounded-lg border text-xs font-medium transition-all',
                        working.packagingName === pkg.name
                          ? 'border-primary bg-primary/5 text-foreground ring-1 ring-primary/20'
                          : 'border-border text-muted-foreground hover:text-foreground hover:border-muted-foreground/30'
                      )}
                    >
                      {pkg.name} · {formatCurrency(pkg.salePrice)}/each
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Quantity</label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleQtyChange(-1)}
                  disabled={working.packagingQuantity <= 1}
                  className="flex items-center justify-center size-9 rounded-lg bg-muted hover:bg-muted/80 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Minus className="size-4" />
                </button>
                <span className="text-lg font-bold w-10 text-center">{working.packagingQuantity}</span>
                <button
                  onClick={() => handleQtyChange(1)}
                  className="flex items-center justify-center size-9 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <Plus className="size-4" />
                </button>
                <span className="text-xs text-muted-foreground">
                  × {working.packagingName} = {working.baseQuantity} base units
                </span>
              </div>
            </div>

            {/* Stock indicator */}
            {getStockAfter(working.productId, working.baseQuantity) && (
              <StockIndicator
                stock={getStockAfter(working.productId, working.baseQuantity)!}
                threshold={working.product.lowStockThreshold}
              />
            )}

            {/* Divider */}
            <div className="border-t border-border pt-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Prescription Info</p>
            </div>

            {/* Dosage */}
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <label className="flex items-center gap-1 text-xs font-medium text-foreground"><Pill className="size-3" /> Dosage</label>
                <input
                  type="text" value={working.dosage} placeholder="1 tablet"
                  onChange={(e) => setWorking({ ...working, dosage: e.target.value })}
                  className="w-full h-9 px-3 rounded-lg border border-input bg-background text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring/30"
                />
              </div>
              <div className="space-y-1.5">
                <label className="flex items-center gap-1 text-xs font-medium text-foreground"><Clock className="size-3" /> Frequency</label>
                <input
                  type="text" value={working.frequency} placeholder="Twice daily"
                  onChange={(e) => setWorking({ ...working, frequency: e.target.value })}
                  className="w-full h-9 px-3 rounded-lg border border-input bg-background text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring/30"
                />
              </div>
              <div className="space-y-1.5">
                <label className="flex items-center gap-1 text-xs font-medium text-foreground"><CalendarDays className="size-3" /> Duration</label>
                <input
                  type="text" value={working.duration} placeholder="7 days"
                  onChange={(e) => setWorking({ ...working, duration: e.target.value })}
                  className="w-full h-9 px-3 rounded-lg border border-input bg-background text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring/30"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="flex items-center gap-1 text-xs font-medium text-foreground"><FileText className="size-3" /> Instructions</label>
              <input
                type="text" value={working.notes} placeholder="e.g. Take with food"
                onChange={(e) => setWorking({ ...working, notes: e.target.value })}
                className="w-full h-9 px-3 rounded-lg border border-input bg-background text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring/30"
              />
            </div>

            {/* Total */}
            <div className="flex items-center justify-between py-2 px-4 rounded-xl bg-muted/50">
              <span className="text-sm text-muted-foreground">Total</span>
              <span className="text-lg font-bold">{formatCurrency(working.total)}</span>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setWorking(null)} className="flex-1 h-10">
                Back to List
              </Button>
              <Button onClick={handleAdd} className="flex-1 h-10 gap-1.5 shadow-sm">
                <Plus className="size-4" /> Add to Prescription
              </Button>
            </div>
          </div>
        ) : (
          /* ─── Product list ─── */
          <div className="flex-1 overflow-y-auto px-5 pb-5 space-y-1">
            {filtered.length === 0 && (
              <div className="text-center py-12 text-sm text-muted-foreground">
                <Package className="size-8 mx-auto mb-2 text-muted-foreground/30" />
                No products found.
              </div>
            )}
            {filtered.map((product) => {
              const pkg = getSmallestPkg(product)
              const alreadySelected = selectedIds.includes(product.id)
              const stock = getStockAfter(product.id, 0)
              return (
                <button
                  key={product.id}
                  onClick={() => !alreadySelected && handleSelectProduct(product)}
                  disabled={alreadySelected}
                  className={cn(
                    'w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors text-left',
                    alreadySelected
                      ? 'bg-primary/5 opacity-60 cursor-not-allowed'
                      : 'hover:bg-muted/50 active:bg-muted/80'
                  )}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium truncate">{product.name}</span>
                      {alreadySelected && <Check className="size-3.5 text-primary shrink-0" />}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                      <span>{pkg ? formatCurrency(pkg.salePrice) : '—'} per {pkg?.name || product.baseUnit}</span>
                      {stock && (
                        <>
                          <span>·</span>
                          <span className={cn(
                            stock.remaining <= 0 ? 'text-red-500' :
                            stock.remaining < product.lowStockThreshold ? 'text-amber-500' :
                            'text-emerald-500'
                          )}>
                            {stock.remaining} in stock
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 font-normal shrink-0 ml-2">
                    {product.category}
                  </Badge>
                </button>
              )
            })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

function StockIndicator({ stock, threshold }: { stock: { current: number; remaining: number }; threshold: number }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="text-muted-foreground">Available stock:</span>
      <span className={cn(
        'px-2 py-0.5 rounded-full font-medium',
        stock.remaining <= 0 ? 'bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400' :
        stock.remaining < threshold ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400' :
        'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400'
      )}>
        {stock.remaining} left
      </span>
    </div>
  )
}
