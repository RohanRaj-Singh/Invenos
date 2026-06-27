import { Search, SlidersHorizontal, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { categories } from '@/data/inventory'
import type { StockStatus } from '@/types'

interface ProductFiltersProps {
  search: string
  onSearchChange: (v: string) => void
  category: string
  onCategoryChange: (v: string) => void
  stockStatus: StockStatus | 'all'
  onStockStatusChange: (v: StockStatus | 'all') => void
}

export default function ProductFilters({
  search,
  onSearchChange,
  category,
  onCategoryChange,
  stockStatus,
  onStockStatusChange,
}: ProductFiltersProps) {
  const hasFilters = search || category !== 'all' || stockStatus !== 'all'

  return (
    <div className="space-y-3">
      {/* Search row */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search products by name or SKU..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full h-10 pl-9 pr-3 rounded-xl border border-input bg-background text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring/30 transition-colors"
          />
          {search && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>
        <Button variant="outline" size="sm" className="gap-1.5 shrink-0 md:hidden">
          <SlidersHorizontal className="size-3.5" />
          Filters
        </Button>
      </div>

      {/* Filter chips (desktop) */}
      <div className="hidden md:flex items-center gap-2 flex-wrap">
        <CategoryChip
          label="All Categories"
          active={category === 'all'}
          onClick={() => onCategoryChange('all')}
        />
        {categories.map((cat) => (
          <CategoryChip
            key={cat.id}
            label={cat.name}
            active={category === cat.name}
            onClick={() => onCategoryChange(cat.name)}
          />
        ))}

        <div className="w-px h-5 bg-border mx-1" />

        <StockChip label="All" active={stockStatus === 'all'} onClick={() => onStockStatusChange('all')} />
        <StockChip label="In Stock" active={stockStatus === 'in-stock'} onClick={() => onStockStatusChange('in-stock')} />
        <StockChip label="Low Stock" active={stockStatus === 'low-stock'} onClick={() => onStockStatusChange('low-stock')} />
        <StockChip label="Out of Stock" active={stockStatus === 'out-of-stock'} onClick={() => onStockStatusChange('out-of-stock')} />

        {hasFilters && (
          <button
            onClick={() => {
              onSearchChange('')
              onCategoryChange('all')
              onStockStatusChange('all')
            }}
            className="text-xs text-muted-foreground hover:text-foreground ml-2 underline underline-offset-2"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Filter chips (mobile) - compact scrollable row */}
      <div className="flex md:hidden items-center gap-2 overflow-x-auto scrollbar-none pb-1">
        <MobileFilterChip label="All" active={category === 'all' && stockStatus === 'all'} />
        {categories.slice(0, 5).map((cat) => (
          <MobileFilterChip key={cat.id} label={cat.name} active={category === cat.name} />
        ))}
      </div>
    </div>
  )
}

function CategoryChip({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors whitespace-nowrap',
        active
          ? 'bg-primary text-primary-foreground border-primary'
          : 'bg-background text-muted-foreground border-border hover:text-foreground hover:border-ring'
      )}
    >
      {label}
    </button>
  )
}

function StockChip({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors whitespace-nowrap',
        active
          ? 'bg-foreground text-background border-foreground'
          : 'bg-background text-muted-foreground border-border hover:text-foreground'
      )}
    >
      {label}
    </button>
  )
}

function MobileFilterChip({ label, active }: { label: string; active: boolean }) {
  return (
    <span
      className={cn(
        'text-xs font-medium px-3 py-1.5 rounded-lg border whitespace-nowrap',
        active
          ? 'bg-primary text-primary-foreground border-primary'
          : 'bg-background text-muted-foreground border-border'
      )}
    >
      {label}
    </span>
  )
}
