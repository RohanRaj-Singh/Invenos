import { useState, useEffect, useRef } from 'react'
import { Search, X, ScanLine } from 'lucide-react'

interface ProductSearchProps {
  value: string
  onChange: (v: string) => void
  resultsCount: number
}

export default function ProductSearch({ value, onChange, resultsCount }: ProductSearchProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [focused, setFocused] = useState(false)

  // Cmd+K / Ctrl+K to focus
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  return (
    <div
      className={`relative transition-all duration-150 ${
        focused ? 'ring-2 ring-primary/30 rounded-xl' : ''
      }`}
    >
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search products by name, SKU, or scan barcode..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="w-full h-11 pl-10 pr-20 rounded-xl border border-input bg-background text-sm outline-none transition-colors focus:border-ring"
          autoComplete="off"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {value && (
            <button
              onClick={() => onChange('')}
              className="flex items-center justify-center size-7 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="size-3.5" />
            </button>
          )}
          <span className="hidden sm:inline-flex items-center gap-1 text-[10px] text-muted-foreground/60 bg-muted px-1.5 py-0.5 rounded border border-border">
            <ScanLine className="size-3" />
            Barcode
          </span>
          <kbd className="hidden lg:inline-flex items-center gap-0.5 rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground/70">
            ⌘K
          </kbd>
        </div>
      </div>
      {value && (
        <div className="absolute -bottom-5 left-0 text-[11px] text-muted-foreground">
          {resultsCount} product{resultsCount !== 1 ? 's' : ''} found
        </div>
      )}
    </div>
  )
}
