import { useNavigate } from 'react-router-dom'
import { ArrowRight, Package, Plus, Minus } from 'lucide-react'
import StockBadge from './StockBadge'
import CompletionBadge from './CompletionBadge'
import { formatCurrency } from '@/lib/format'
import { cn } from '@/lib/utils'
import { useApplication } from '@/features/transactions/TransactionContext'
import { toast } from 'sonner'
import type { Product } from '@/types'

interface ProductTableProps {
  products: Product[]
}

export default function ProductTable({ products }: ProductTableProps) {
  const navigate = useNavigate()
  const { eventBus } = useApplication()

  const handleAdjust = (product: Product, delta: number) => {
    if (!product.trackInventory) return
    const newQty = product.stockQuantity + delta
    if (newQty < 0) return

    product.stockQuantity = newQty
    if (product.stockQuantity <= 0) product.status = 'out-of-stock'
    else if (product.stockQuantity <= product.lowStockThreshold) product.status = 'low-stock'
    else product.status = 'in-stock'

    eventBus.emit('InventoryUpdated', {
      productIds: [product.id],
      transactionId: `adj-${Date.now()}`,
    })

    toast.success(`${product.name}: ${delta > 0 ? '+' : ''}${delta} units`)
  }

  const getStockValue = (p: Product): number => {
    if (p.purchaseConfig) {
      const costPerBase = p.purchaseConfig.cost / p.purchaseConfig.quantity
      return p.stockQuantity * costPerBase
    }
    return 0
  }

  const totalValue = products.reduce((sum, p) => sum + getStockValue(p), 0)

  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border bg-muted/30">
            <Th>Product</Th>
            <Th>SKU</Th>
            <Th>Category</Th>
            <Th className="text-right">Stock</Th>
            <Th className="text-right">Value</Th>
            <Th>Status</Th>
            <Th className="w-24">Adjust</Th>
            <Th className="w-10" />
          </tr>
        </thead>
        <tbody>
          {products.length === 0 ? (
            <tr>
              <td colSpan={8} className="text-center py-16 text-sm text-muted-foreground">
                <div className="flex flex-col items-center gap-2">
                  <Package className="size-8 text-muted-foreground/50" />
                  <span>No products found matching your filters.</span>
                </div>
              </td>
            </tr>
          ) : (
            products.map((product) => (
              <tr
                key={product.id}
                className="border-b border-border last:border-b-0 hover:bg-muted/30 transition-colors group"
              >
                <td
                  className="px-4 py-3.5 cursor-pointer"
                  onClick={() => navigate(`/inventory/product/${product.id}`)}
                >
                  <div className="flex items-center gap-3">
                    <div className="size-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      <Package className="size-4 text-muted-foreground" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-foreground">{product.name}</div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">{product.barcode}</div>
                    </div>
                  </div>
                </td>
                <td
                  className="px-4 py-3.5 cursor-pointer"
                  onClick={() => navigate(`/inventory/product/${product.id}`)}
                >
                  <code className="text-xs font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                    {product.sku}
                  </code>
                </td>
                <td
                  className="px-4 py-3.5 text-sm text-muted-foreground cursor-pointer"
                  onClick={() => navigate(`/inventory/product/${product.id}`)}
                >
                  {product.category}
                </td>
                <td
                  className="px-4 py-3.5 text-right cursor-pointer"
                  onClick={() => navigate(`/inventory/product/${product.id}`)}
                >
                  <div className="flex flex-col items-end gap-1">
                    <span
                      className={cn(
                        'text-sm font-semibold tabular-nums',
                        product.stockQuantity === 0 && 'text-red-500',
                        product.stockQuantity > 0 && product.status === 'low-stock' && 'text-amber-500'
                      )}
                    >
                      {product.stockQuantity.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-muted-foreground">{product.baseUnit}{product.stockQuantity !== 1 ? 's' : ''}</span>
                  </div>
                </td>
                <td
                  className="px-4 py-3.5 text-right cursor-pointer"
                  onClick={() => navigate(`/inventory/product/${product.id}`)}
                >
                  <span className="text-sm font-semibold tabular-nums">{formatCurrency(getStockValue(product))}</span>
                </td>
                <td
                  className="px-4 py-3.5 cursor-pointer"
                  onClick={() => navigate(`/inventory/product/${product.id}`)}
                >
                  <StockBadge status={product.status} />
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-0.5" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => handleAdjust(product, -1)}
                      className="flex items-center justify-center size-6 rounded hover:bg-red-50 text-muted-foreground hover:text-red-500 transition-colors"
                      title="Remove 1 unit"
                    >
                      <Minus className="size-3" />
                    </button>
                    <button
                      onClick={() => handleAdjust(product, 1)}
                      className="flex items-center justify-center size-6 rounded hover:bg-emerald-50 text-muted-foreground hover:text-emerald-500 transition-colors"
                      title="Add 1 unit"
                    >
                      <Plus className="size-3" />
                    </button>
                  </div>
                </td>
                <td
                  className="px-4 py-3.5 cursor-pointer"
                  onClick={() => navigate(`/inventory/product/${product.id}`)}
                >
                  <ArrowRight className="size-4 text-muted-foreground/0 group-hover:text-muted-foreground transition-colors" />
                </td>
              </tr>
            ))
          )}
        </tbody>
        <tfoot>
          <tr className="border-t-2 border-border bg-muted/20">
            <td colSpan={3} className="px-4 py-3 text-sm font-medium text-foreground">
              {products.length} product{products.length !== 1 ? 's' : ''}
            </td>
            <td className="px-4 py-3 text-right text-sm text-muted-foreground">
              —
            </td>
            <td className="px-4 py-3 text-right">
              <span className="text-sm font-bold text-foreground tabular-nums">{formatCurrency(totalValue)}</span>
            </td>
            <td colSpan={3} />
          </tr>
        </tfoot>
      </table>
    </div>
  )
}

function Th({ children, className }: { children?: React.ReactNode; className?: string }) {
  return (
    <th
      className={cn(
        'px-4 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider',
        className
      )}
    >
      {children}
    </th>
  )
}
