import { Calculator, ArrowRight } from 'lucide-react'
import { formatCurrency } from '@/data/dashboard'
import type { PackagingConfig } from '@/types'

interface CostPreviewProps {
  purchaseCost: number
  packaging: PackagingConfig[]
  baseUnit: string
  salePrice: number
}

export default function CostPreview({ purchaseCost, packaging, baseUnit, salePrice }: CostPreviewProps) {
  const hasData = packaging.length > 0 && baseUnit
  const largestPkg = packaging.length > 0
    ? packaging.reduce((max, p) => p.quantity > max.quantity ? p : max, packaging[0])
    : null
  const effectivePurchaseCost = largestPkg ? largestPkg.purchasePrice : purchaseCost
  const costPerBaseUnit = largestPkg && largestPkg.quantity > 0 ? effectivePurchaseCost / largestPkg.quantity : 0

  if (!hasData) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-muted/20 p-4 text-center">
        <Calculator className="size-5 text-muted-foreground/50 mx-auto mb-1.5" />
        <p className="text-xs text-muted-foreground">
          Set base unit and at least one packaging level with pricing
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="px-4 py-2.5 border-b border-border bg-muted/20">
        <div className="flex items-center gap-2">
          <Calculator className="size-3.5 text-primary" />
          <span className="text-xs font-semibold text-foreground">Cost Breakdown</span>
        </div>
      </div>
      <div className="p-4 space-y-2.5">
        {largestPkg && (
          <>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Cost / {largestPkg.name}</span>
              <span className="font-semibold">{formatCurrency(effectivePurchaseCost)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{largestPkg.name} contains</span>
              <span className="font-medium">{largestPkg.quantity.toLocaleString()} {baseUnit}{largestPkg.quantity > 1 ? 's' : ''}</span>
            </div>
          </>
        )}

        {packaging.slice(0, -1).reverse().map((pkg, i) => (
          <div key={i} className="flex items-center justify-between text-sm text-muted-foreground">
            <span>1 {pkg.name}</span>
            <span>= {pkg.quantity.toLocaleString()} {baseUnit}s · {formatCurrency(pkg.purchasePrice)} cost</span>
          </div>
        ))}

        <div className="border-t border-border pt-2.5 mt-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-sm">
              <span className="text-muted-foreground">Cost per {baseUnit}</span>
              <ArrowRight className="size-3.5 text-primary" />
            </div>
            <span className="text-lg font-bold text-primary">
              {formatCurrency(Math.round(costPerBaseUnit))}
            </span>
          </div>
          {costPerBaseUnit > 0 && salePrice > 0 && (
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-border text-sm">
              <span className="text-muted-foreground">Margin ({formatCurrency(salePrice)}/ea)</span>
              <span className={salePrice > costPerBaseUnit ? 'text-emerald-600 font-semibold' : 'text-red-600 font-semibold'}>
                {Math.round(((salePrice - costPerBaseUnit) / salePrice) * 100)}%
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
