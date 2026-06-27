import { useNavigate } from 'react-router-dom'
import { ArrowRight, Package } from 'lucide-react'
import StockBadge from './StockBadge'
import { formatCurrency } from '@/data/dashboard'
import { cn } from '@/lib/utils'
import type { Product } from '@/types'

function getSalePrice(p: Product) { return p.packaging.length ? p.packaging.reduce((a, b) => a.quantity < b.quantity ? a : b).salePrice : 0 }
function getCostPrice(p: Product) { return p.packaging.length ? p.packaging.reduce((a, b) => a.quantity > b.quantity ? a : b).purchasePrice : 0 }

interface ProductTableProps {
  products: Product[]
}

export default function ProductTable({ products }: ProductTableProps) {
  const navigate = useNavigate()

  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border bg-muted/30">
            <Th>Product</Th>
            <Th>SKU</Th>
            <Th>Category</Th>
            <Th>Stock</Th>
            <Th>Cost Price</Th>
            <Th>Sale Price</Th>
            <Th>Status</Th>
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
                onClick={() => navigate(`/inventory/product/${product.id}`)}
                className="border-b border-border last:border-b-0 hover:bg-muted/30 cursor-pointer transition-colors group"
              >
                <td className="px-4 py-3.5">
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
                <td className="px-4 py-3.5">
                  <code className="text-xs font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                    {product.sku}
                  </code>
                </td>
                <td className="px-4 py-3.5 text-sm text-muted-foreground">{product.category}</td>
                <td className="px-4 py-3.5">
                  <div className="flex flex-col gap-1">
                    <span
                      className={cn(
                        'text-sm font-semibold',
                        product.stockQuantity === 0 && 'text-red-500',
                        product.stockQuantity > 0 && product.status === 'low-stock' && 'text-amber-500'
                      )}
                    >
                      {product.stockQuantity}
                    </span>
                    <span className="text-[10px] text-muted-foreground">{product.baseUnit}{product.stockQuantity !== 1 ? 's' : ''}</span>
                  </div>
                </td>
                <td className="px-4 py-3.5 text-sm text-muted-foreground">{formatCurrency(getCostPrice(product))}</td>
                <td className="px-4 py-3.5 text-sm font-semibold">{formatCurrency(getSalePrice(product))}</td>
                <td className="px-4 py-3.5">
                  <StockBadge status={product.status} />
                </td>
                <td className="px-4 py-3.5">
                  <ArrowRight className="size-4 text-muted-foreground/0 group-hover:text-muted-foreground transition-colors" />
                </td>
              </tr>
            ))
          )}
        </tbody>
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
