import { useParams, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import {
  ArrowLeft,
  Package,
  BarChart3,
  ShoppingCart,
  PackagePlus,
  ClipboardList,
  Plus,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import StockBadge from './components/StockBadge'
import InventoryTimeline from './components/InventoryTimeline'
import {
  getProductById,
  getProductPurchases,
  getProductTransactions,
} from '@/data/inventory'
import { formatCurrency } from '@/data/dashboard'
import { getStockDisplay } from '@/lib/inventory'
import { calculateInventorySummary } from '@/lib/inventory-engine'
import { cn } from '@/lib/utils'
import type { Sale } from '@/types'
import { allSales } from '@/data/sales'

export default function ProductDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [activeSection, setActiveSection] = useState('overview')

  const product = getProductById(id || '')
  const purchases = getProductPurchases(id || '')
  const sales = allSales.filter((s) => s.items.some((i) => i.productId === id))
  const transactions = getProductTransactions(id || '')
  const invSummary = calculateInventorySummary(transactions)

  if (!product) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
        <div className="flex flex-col items-center justify-center py-24 text-sm text-muted-foreground">
          <Package className="size-12 text-muted-foreground/30 mb-4" />
          <h2 className="text-lg font-semibold text-foreground mb-1">Product not found</h2>
          <p className="mb-4">The product you're looking for doesn't exist.</p>
          <Button variant="outline" onClick={() => navigate('/inventory')}>Back to Inventory</Button>
        </div>
      </div>
    )
  }

  const stockDisplay = getStockDisplay(product)

  // Cost per base unit
  const largestPkg = product.packaging.length > 0
    ? product.packaging.reduce((max, p) => p.quantity > max.quantity ? p : max, product.packaging[0])
    : null
  const smallestPkg = product.packaging.length > 0
    ? product.packaging.reduce((min, p) => p.quantity < min.quantity ? p : min, product.packaging[0])
    : null
  const defaultSalePrice = smallestPkg?.salePrice || 0
  const costPerBaseUnit = largestPkg ? largestPkg.purchasePrice / largestPkg.quantity : 0
  const margin = defaultSalePrice - costPerBaseUnit
  const marginPercent = defaultSalePrice > 0 ? ((defaultSalePrice - costPerBaseUnit) / defaultSalePrice) * 100 : 0

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <button onClick={() => navigate('/inventory')} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="size-4" />
          <span>Back to inventory</span>
        </button>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5">
            <ClipboardList className="size-3.5" />
            <span className="hidden sm:inline">Edit</span>
          </Button>
          <Button size="sm" className="gap-1.5 shadow-sm">
            <Plus className="size-3.5" />
            <span className="hidden sm:inline">Add Stock</span>
          </Button>
        </div>
      </div>

      <div className="flex items-start gap-4">
        <div className="size-14 sm:size-16 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0">
          <Package className="size-6 sm:size-7 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-3 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">{product.name}</h1>
            <StockBadge status={product.status} />
          </div>
          <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground flex-wrap">
            <code className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">{product.sku}</code>
            <span>·</span>
            <span>{product.category}</span>
            <span>·</span>
            <span>{product.barcode}</span>
            <span>·</span>
            <span>Base: {product.baseUnit}</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Total Stock" value={stockDisplay.total} />
        <StatCard label="Sale Price" value={formatCurrency(defaultSalePrice)} sub={`per ${product.baseUnit}`} />
        <StatCard label="Margin" value={`${marginPercent >= 0 ? '+' : ''}${Math.round(marginPercent)}%`} sub={formatCurrency(Math.round(margin))} positive={marginPercent >= 0} />
        <StatCard label="Transactions" value={transactions.length.toString()} sub={`${invSummary.currentStock.toLocaleString()} ${product.baseUnit}s now`} />
      </div>

      {/* Section tabs */}
      <div className="border-b border-border">
        <div className="flex -mb-px overflow-x-auto scrollbar-none">
          {[
            { id: 'overview', label: 'Overview', icon: Package },
            { id: 'purchases', label: 'Purchases', icon: PackagePlus, count: purchases.length },
            { id: 'sales', label: 'Sales', icon: ShoppingCart, count: sales.length },
            { id: 'movements', label: 'Movement', icon: BarChart3, count: transactions.length },
          ].map((tab) => {
            const Icon = tab.icon
            const isActive = activeSection === tab.id
            return (
              <button key={tab.id} onClick={() => setActiveSection(tab.id)}
                className={cn('flex items-center gap-2 px-3 sm:px-4 py-3 text-sm font-medium border-b-2 transition-colors shrink-0 whitespace-nowrap',
                  isActive ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/30'
                )}>
                <Icon className="size-4" />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className="inline-flex items-center justify-center size-5 rounded-full bg-muted text-[10px] font-semibold text-muted-foreground">{tab.count}</span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      <div>
        {activeSection === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <Card>
              <CardHeader><CardTitle>Product Information</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <InfoRow label="SKU" value={product.sku} mono />
                <InfoRow label="Barcode" value={product.barcode} />
                <InfoRow label="Category" value={product.category} />
                <InfoRow label="Supplier" value={product.supplier || '—'} />
                <InfoRow label="Location" value={product.location || '—'} />
                <InfoRow label="Base Unit" value={product.baseUnit} />
                <InfoRow label="Description" value={product.description} multiline />
                <InfoRow label="Created" value={product.createdAt} />
                <InfoRow label="Last Updated" value={product.updatedAt} />
              </CardContent>
            </Card>

            <div className="space-y-4">
              {/* Stock Card */}
              <Card>
                <CardHeader><CardTitle>Stock Information</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30">
                    <div>
                      <div className="text-sm text-muted-foreground">Current Stock</div>
                      <div className={cn('text-3xl font-bold tracking-tight mt-1', product.stockQuantity === 0 && 'text-red-500', product.status === 'low-stock' && 'text-amber-500')}>
                        {product.stockQuantity.toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">in {product.baseUnit}(s)</div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <StockBadge status={product.status} />
                      <span className="text-xs text-muted-foreground">Threshold: {product.lowStockThreshold.toLocaleString()} {product.baseUnit}s</span>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                      <span>Stock level</span>
                      <span>{product.stockQuantity.toLocaleString()} {product.baseUnit}s</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div className={cn('h-full rounded-full transition-all', product.status === 'in-stock' ? 'bg-emerald-500' : product.status === 'low-stock' ? 'bg-amber-500' : 'bg-red-500')}
                        style={{ width: `${Math.min(100, (product.stockQuantity / (product.lowStockThreshold * 3)) * 100)}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Track Inventory</span>
                    <Badge variant={product.trackInventory ? 'default' : 'secondary'} className="text-[10px] px-2 py-0 h-5">
                      {product.trackInventory ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Packaging card */}
              <Card>
                <CardHeader><CardTitle>Packaging</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Base Unit</span>
                    <span className="font-semibold text-foreground">{product.baseUnit}</span>
                  </div>
                  {product.packaging.map((pkg, i) => (
                    <div key={i} className="flex items-center justify-between text-sm py-2 px-3 rounded-lg bg-muted/30">
                      <span className="font-medium text-foreground">{pkg.name}</span>
                      <span className="text-muted-foreground">= {pkg.quantity.toLocaleString()} {product.baseUnit}{pkg.quantity > 1 ? 's' : ''}</span>
                    </div>
                  ))}
                  {product.packaging.length === 0 && (
                    <p className="text-xs text-muted-foreground">No packaging configured.</p>
                  )}

                  {/* Stock equivalents */}
                  <div className="pt-2 border-t border-border space-y-1.5">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Stock Equivalents</p>
                    {stockDisplay.equivalents.length > 0 ? stockDisplay.equivalents.map((eq, i) => (
                      <div key={i} className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">{eq.label}</span>
                        <span className="font-semibold text-foreground">{eq.qty.toLocaleString()}</span>
                      </div>
                    )) : (
                      <p className="text-xs text-muted-foreground">No equivalent packaging (less than one unit of any packaging).</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Cost & Pricing */}
              <Card>
                <CardHeader><CardTitle>Pricing Breakdown</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {largestPkg && (
                    <>
                      <InfoRow label={`Cost / ${largestPkg.name}`} value={formatCurrency(largestPkg.purchasePrice)} />
                      <InfoRow label={`Cost / ${product.baseUnit}`} value={formatCurrency(Math.round(costPerBaseUnit))} />
                      <InfoRow label={`Sale / ${product.baseUnit}`} value={formatCurrency(defaultSalePrice)} />
                      <InfoRow label="Margin" value={`${Math.round(marginPercent)}%`} />
                    </>
                  )}
                  {product.packaging.map((pkg, i) => (
                    <div key={i} className="flex items-center justify-between text-xs py-1">
                      <span className="text-muted-foreground">{pkg.name} contains</span>
                      <span className="font-medium">{pkg.quantity.toLocaleString()} {product.baseUnit}{pkg.quantity > 1 ? 's' : ''}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeSection === 'purchases' && (
          <div className="space-y-3">
            {purchases.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-sm text-muted-foreground"><PackagePlus className="size-8 text-muted-foreground/30 mb-2" /><span>No purchase records for this product.</span></div>
            ) : (
              purchases.map((p) => (
                <Card key={p.id} size="sm">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant={p.status === 'received' ? 'default' : 'secondary'} className="text-[10px] px-2 py-0 h-5">{p.status}</Badge>
                        <span className="text-sm font-medium">{p.supplier}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{p.date}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div><span className="text-muted-foreground">Qty: </span><span className="font-medium">{p.quantity} {product.baseUnit}s</span></div>
                      <div><span className="text-muted-foreground">Unit cost: </span><span className="font-medium">{formatCurrency(p.unitCost)}</span></div>
                      <div><span className="text-muted-foreground">Total: </span><span className="font-semibold">{formatCurrency(p.totalCost)}</span></div>
                    </div>
                    <div className="text-xs text-muted-foreground mt-2">Ref: {p.invoiceRef}</div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}

        {activeSection === 'sales' && (
          <div className="space-y-3">
            {sales.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-sm text-muted-foreground"><ShoppingCart className="size-8 text-muted-foreground/30 mb-2" /><span>No sale records for this product.</span></div>
            ) : (
              sales.map((sale: Sale) => {
                const saleItem = sale.items.find((i) => i.productId === product.id)
                if (!saleItem) return null
                return (
                  <Card key={sale.id} size="sm">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{sale.customerName || 'Clinic Visit'}</span>
                          <span className="text-xs text-muted-foreground capitalize">· {sale.source}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">{sale.date}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div><span className="text-muted-foreground">Qty: </span><span className="font-medium">{saleItem.baseQuantity} {product.baseUnit}s</span></div>
                        <div><span className="text-muted-foreground">Unit: </span><span className="font-medium">{formatCurrency(saleItem.unitPrice)}</span></div>
                        <div><span className="text-muted-foreground">Total: </span><span className="font-semibold">{formatCurrency(saleItem.total)}</span></div>
                      </div>
                      <div className="text-xs text-muted-foreground mt-2">Ref: {sale.invoiceNumber}</div>
                    </CardContent>
                  </Card>
                )
              })
            )}
          </div>
        )}

        {activeSection === 'movements' && (
          <div className="max-w-3xl">
            <InventoryTimeline transactions={transactions} />
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ label, value, sub, positive }: { label: string; value: string; sub?: string; positive?: boolean }) {
  return (
    <Card size="sm">
      <CardContent className="p-4">
        <div className="text-[11px] text-muted-foreground uppercase tracking-wider mb-1">{label}</div>
        <div className={cn('text-lg font-bold tracking-tight', positive === true && 'text-emerald-500', positive === false && 'text-red-500')}>{value}</div>
        {sub && <div className="text-xs text-muted-foreground mt-0.5">{sub}</div>}
      </CardContent>
    </Card>
  )
}

function InfoRow({ label, value, mono, multiline }: { label: string; value: string; mono?: boolean; multiline?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-xs text-muted-foreground shrink-0 min-w-[90px]">{label}</span>
      {multiline ? (
        <p className="text-xs text-foreground text-right leading-relaxed">{value}</p>
      ) : (
        <span className={cn('text-xs font-medium text-foreground text-right', mono && 'font-mono')}>{value}</span>
      )}
    </div>
  )
}
