import { useRef, useState, useCallback } from 'react'
import { Search, X, Plus } from 'lucide-react'
import { formatCurrency } from '@/lib/format'
import { cn } from '@/lib/utils'

interface SearchResult {
  id: string
  name: string
  sku: string
  sellingUnits?: { name: string; salePrice?: number }[]
}

interface SearchBarProps {
  search: string
  onSearchChange: (v: string) => void
  showResults: boolean
  onShowResultsChange: (v: boolean) => void
  results: SearchResult[]
  onAddProduct: (product: SearchResult) => void
  placeholder?: string
}

export function TransactionSearchBar({
  search,
  onSearchChange,
  showResults,
  onShowResultsChange,
  results,
  onAddProduct,
  placeholder = 'Search product by name or SKU...',
}: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [highlighted, setHighlighted] = useState(0)

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showResults || results.length === 0) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlighted((prev) => (prev + 1) % results.length)
      return
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlighted((prev) => (prev - 1 + results.length) % results.length)
      return
    }
    if (e.key === 'Enter') {
      e.preventDefault()
      if (results[highlighted]) {
        onAddProduct(results[highlighted])
        setHighlighted(0)
      }
      return
    }
    if (e.key === 'Escape') {
      onSearchChange('')
      onShowResultsChange(false)
      setHighlighted(0)
    }
  }

  const handleChange = (value: string) => {
    onSearchChange(value)
    onShowResultsChange(!!value.trim())
    setHighlighted(0)
  }

  return (
    <div className="px-5 py-3 bg-card shrink-0 relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <input
          ref={inputRef}
          type="text"
          value={search}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => {
            if (search.trim()) onShowResultsChange(true)
          }}
          onBlur={() => {
            setTimeout(() => onShowResultsChange(false), 150)
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full h-10 pl-10 pr-4 rounded-lg border border-input bg-background text-sm outline-none focus:border-ring transition-colors"
        />
        {search && (
          <button
            onClick={() => {
              onSearchChange('')
              onShowResultsChange(false)
              setHighlighted(0)
              inputRef.current?.focus()
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center size-6 rounded-md hover:bg-muted text-muted-foreground"
          >
            <X className="size-3.5" />
          </button>
        )}
      </div>

      {showResults && results.length > 0 && (
        <div
          className="absolute left-5 right-5 top-full mt-1 z-50 rounded-xl border border-border bg-popover shadow-lg overflow-hidden"
        >
          {results.map((product, idx) => (
            <button
              key={product.id}
              onMouseDown={(e) => {
                e.preventDefault()
                onAddProduct(product)
                setHighlighted(0)
              }}
              onMouseEnter={() => setHighlighted(idx)}
              className={cn(
                'flex items-center gap-3 w-full px-3 py-2.5 text-left transition-colors',
                idx === highlighted
                  ? 'bg-muted'
                  : 'hover:bg-muted/50'
              )}
            >
              <div className="flex items-center justify-center size-8 rounded-lg bg-muted text-muted-foreground shrink-0">
                <Plus className="size-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-foreground truncate">
                  {product.name}
                </div>
                <div className="text-[11px] text-muted-foreground">
                  {product.sku}
                  {product.sellingUnits?.[0] && (
                    <>
                      {' '}
                      · {product.sellingUnits[0].name} ·{' '}
                      {formatCurrency(product.sellingUnits[0].salePrice ?? 0)}
                    </>
                  )}
                </div>
              </div>
              {idx === highlighted && (
                <kbd className="hidden sm:inline-flex items-center px-1 py-0.5 text-[9px] text-muted-foreground bg-muted rounded font-sans">
                  ⏎
                </kbd>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
