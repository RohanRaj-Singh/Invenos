import { useNavigate } from 'react-router-dom'
import { Package, ArrowRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import StockBadge from './StockBadge'
import { formatCurrency } from '@/data/dashboard'
import { cn } from '@/lib/utils'
import type { Product } from '@/types'

function getSalePrice(p: Product) { return p.packaging.length ? p.packaging.reduce((a, b) => a.quantity < b.quantity ? a : b).salePrice : 0 }
function getCostLabel(p: Product) { return p.packaging.length ? `${p.packaging.reduce((a, b) => a.quantity > b.quantity ? a : b).purchasePrice}` : '0' }
function getCostUnit(p: Product) { return p.packaging.length ? p.packaging.reduce((a, b) => a.quantity > b.quantity ? a : b).name : '' }

interface ProductCardViewProps {
  products: Product[]
}

export default function ProductCardView({ products }: ProductCardViewProps) {
  const navigate = useNavigate()

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-sm text-muted-foreground">
        <Package className="size-10 text-muted-foreground/50 mb-3" />
        <span>No products found matching your filters.</span>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-3">
      {products.map((product) => (
        <button
          key={product.id}
          onClick={() => navigate(`/inventory/product/${product.id}`)}
          className="group text-left"
        >
          <Card size="sm" className="transition-all hover:shadow-md active:scale-[0.99]">
            <CardContent className="p-0">
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
                      <Package className="size-5 text-muted-foreground" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold text-foreground leading-snug line-clamp-2">
                        {product.name}
                      </h3>
                      <code className="text-[11px] font-mono text-muted-foreground">
                        {product.sku}
                      </code>
                    </div>
                  </div>
                  <ArrowRight className="size-4 text-muted-foreground/30 group-hover:text-muted-foreground transition-colors shrink-0 mt-1" />
                </div>

                <div className="grid grid-cols-3 gap-2 mb-3">
                  <div className="rounded-lg bg-muted/50 px-2.5 py-2">
                    <div className="text-[10px] text-muted-foreground">Category</div>
                    <div className="text-xs font-medium mt-0.5 truncate">{product.category}</div>
                  </div>
                  <div className="rounded-lg bg-muted/50 px-2.5 py-2">
                    <div className="text-[10px] text-muted-foreground">Stock</div>
                    <div className={cn(
                      'text-xs font-medium mt-0.5',
                      product.stockQuantity === 0 && 'text-red-500',
                      product.stockQuantity > 0 && product.status === 'low-stock' && 'text-amber-500'
                    )}>
                      {product.stockQuantity} {product.baseUnit}{product.stockQuantity !== 1 ? 's' : ''}
                    </div>
                  </div>
                  <div className="rounded-lg bg-muted/50 px-2.5 py-2">
                    <div className="text-[10px] text-muted-foreground">Sale Price</div>
                    <div className="text-xs font-semibold mt-0.5">{formatCurrency(getSalePrice(product))}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>Cost: {formatCurrency(parseInt(getCostLabel(product)))}</span>
                    {getCostUnit(product) && <span>/ {getCostUnit(product)}</span>}
                  </div>
                  <StockBadge status={product.status} size="xs" />
                </div>
              </div>
            </CardContent>
          </Card>
        </button>
      ))}
    </div>
  )
}
