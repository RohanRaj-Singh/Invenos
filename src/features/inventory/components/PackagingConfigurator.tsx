import { useState } from 'react'
import { Plus, X, Lightbulb, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { mockProducts } from '@/data/inventory'
import { getSuggestionsForPackagingName } from '@/lib/inventory'
import type { PackagingConfig } from '@/types'

interface PackagingConfiguratorProps {
  packaging: PackagingConfig[]
  onChange: (packaging: PackagingConfig[]) => void
  baseUnit: string
}

export default function PackagingConfigurator({ packaging, onChange, baseUnit }: PackagingConfiguratorProps) {
  const [newName, setNewName] = useState('')
  const [newQty, setNewQty] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)

  const addPackaging = (name: string, quantity: number) => {
    if (!name.trim() || quantity <= 0) return
    if (packaging.some((p) => p.name.toLowerCase() === name.toLowerCase())) return
    onChange([...packaging, { name: name.trim(), quantity, purchasePrice: 0, salePrice: 0 }])
    setNewName('')
    setNewQty('')
    setShowSuggestions(false)
  }

  const removePackaging = (index: number) => {
    onChange(packaging.filter((_, i) => i !== index))
  }

  const suggestions = newName.trim().length > 0
    ? getSuggestionsForPackagingName(newName.trim(), mockProducts)
    : { common: [], usedInProducts: 0 }

  return (
    <Card>
      <CardHeader className="flex-row items-center gap-2">
        <TrendingUp className="size-4 text-primary" />
        <CardTitle>Packaging Configurations</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-xs text-muted-foreground">
          Define how this product is packaged. All stock is tracked in <strong>{baseUnit || 'base units'}</strong>.
          You can add multiple packaging levels (e.g., Strip, Box, Carton).
        </p>

        {/* Existing packaging */}
        {packaging.length > 0 && (
          <div className="space-y-2">
            {packaging.map((pkg, i) => (
              <div key={i} className="flex items-center justify-between px-4 py-3 rounded-xl border border-border bg-card hover:border-primary/30 transition-colors">
                <div>
                  <span className="text-sm font-medium text-foreground">{pkg.name}</span>
                  <span className="text-xs text-muted-foreground ml-2">
                    = {pkg.quantity.toLocaleString()} {baseUnit}{pkg.quantity > 1 ? 's' : ''}
                  </span>
                </div>
                <button onClick={() => removePackaging(i)} className="flex items-center justify-center size-7 rounded-md hover:bg-muted text-muted-foreground hover:text-red-500 transition-colors">
                  <X className="size-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Add new */}
        <div className="relative">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div className="relative">
              <input
                type="text"
                placeholder="e.g. Carton, Box, Strip"
                value={newName}
                onChange={(e) => { setNewName(e.target.value); setShowSuggestions(true) }}
                onFocus={() => setShowSuggestions(true)}
                className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring/30"
              />
              {suggestions.usedInProducts > 0 && newName.trim().length > 0 && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
                  {suggestions.usedInProducts} products
                </span>
              )}
            </div>
            <input
              type="number"
              placeholder={`Qty in ${baseUnit || 'base units'}`}
              value={newQty}
              onChange={(e) => setNewQty(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring/30"
              min="1"
            />
            <Button
              variant="outline"
              onClick={() => addPackaging(newName, parseInt(newQty) || 0)}
              disabled={!newName.trim() || !parseInt(newQty) || parseInt(newQty) <= 0}
              className="gap-1.5 h-10"
            >
              <Plus className="size-3.5" />
              Add Packaging
            </Button>
          </div>

          {/* Smart suggestions */}
          {showSuggestions && newName.trim().length > 0 && suggestions.common.length > 0 && (
            <div className="mt-2 rounded-xl border border-border bg-popover shadow-lg overflow-hidden">
              <div className="flex items-center gap-1.5 px-3 py-2 bg-muted/30 border-b border-border">
                <Lightbulb className="size-3 text-amber-500" />
                <span className="text-[11px] font-medium text-foreground">Common {newName.trim()} sizes</span>
                {suggestions.usedInProducts > 1 && (
                  <span className="text-[10px] text-muted-foreground ml-auto">
                    Used by {suggestions.usedInProducts} products
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 p-2">
                {suggestions.common.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => { setNewQty(s.quantity.toString()); addPackaging(newName.trim(), s.quantity) }}
                    className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-muted text-left transition-colors"
                  >
                    <span className="text-xs font-medium text-foreground">{s.label}</span>
                    <Plus className="size-3 text-muted-foreground shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Preview */}
        {baseUnit && packaging.length > 0 && (
          <div className="rounded-xl bg-muted/30 p-3 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">How it works: </span>
            Purchase <strong>{packaging[packaging.length - 1].name}</strong> = {packaging[packaging.length - 1].quantity.toLocaleString()} {baseUnit}s.
            Sell per <strong>{baseUnit}</strong>.
            {packaging.length > 1 && (
              <span> You can also sell in {packaging.slice(0, -1).map((p) => `${p.name} (${p.quantity} ${baseUnit}s)`).join(', ')}.</span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
