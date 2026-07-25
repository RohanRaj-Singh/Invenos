import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Save, ChevronDown, ChevronUp, Search, Plus, Sparkles, Trash2, Settings2, Beaker } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { mockProducts, categories } from '@/data/inventory'
import { cn } from '@/lib/utils'
import SessionCounter from './SessionCounter'
import { getUnit, getBaseUnitOptions, getDefaultUnitForCategory } from '@/lib/units'
import { ensureBackwardCompat, calculateMargin } from '@/lib/product-adapter'
import type { Product, SellingUnit, Ingredient } from '@/types'

// ── Category configuration ──

const CATEGORY_PREFIX_MAP: Record<string, string> = {
  Medicine: 'MED',
  Groceries: 'GRO',
  Cosmetics: 'COS',
  Skincare: 'SKN',
  'Mobile Accessories': 'MOB',
  Electronics: 'ELE',
  'Clinic Supplies': 'SUP',
}

function getCategoryPrefix(category: string): string {
  return CATEGORY_PREFIX_MAP[category] || 'PRD'
}

function generateSku(category: string, sequence: number): string {
  const prefix = getCategoryPrefix(category)
  return `${prefix}-${String(sequence).padStart(3, '0')}`
}

// ── Category search combobox (Desktop) ──

function CategoryCombobox({
  value,
  onChange,
}: {
  value: string
  onChange: (v: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  const filtered = useMemo(() => {
    if (!search) return categories
    return categories.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))
  }, [search])

  const showCreate = search.trim().length > 0 &&
    !categories.some((c) => c.name.toLowerCase() === search.trim().toLowerCase())

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        panelRef.current && !panelRef.current.contains(e.target as Node) &&
        inputRef.current && !inputRef.current.contains(e.target as Node)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search category..."
          value={open ? search : value}
          onChange={(e) => {
            setSearch(e.target.value)
            if (!open) setOpen(true)
          }}
          onFocus={() => { setOpen(true); setSearch('') }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && open && filtered.length > 0) {
              e.preventDefault(); e.stopPropagation()
              const sel = filtered[0]
              if (sel) { onChange(sel.name); setOpen(false); setSearch('') }
            }
            if (e.key === 'Escape' && open) { e.stopPropagation(); setOpen(false); setSearch('') }
          }}
          className="w-full h-10 pl-9 pr-3 rounded-lg border border-input bg-background text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring/30"
        />
      </div>
      {open && (
        <div
          ref={panelRef}
          className="absolute z-50 mt-1 w-full bg-popover border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto"
        >
          {filtered.length > 0 && (
            <div className="py-1">
              {filtered.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    onChange(cat.name)
                    setOpen(false)
                    setSearch('')
                  }}
                  className={cn(
                    'w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-muted transition-colors',
                    value === cat.name && 'bg-primary/5 text-primary'
                  )}
                >
                  <span>{cat.name}</span>
                  <span className="text-[10px] text-muted-foreground">{cat.productCount} products</span>
                </button>
              ))}
            </div>
          )}
          {showCreate && (
            <button
              type="button"
              onClick={() => {
                onChange(search.trim())
                setOpen(false)
                setSearch('')
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-primary hover:bg-primary/5 transition-colors border-t border-border"
            >
              <Plus className="size-3.5" />
              Create &quot;{search.trim()}&quot;
            </button>
          )}
          {!showCreate && filtered.length === 0 && (
            <div className="px-3 py-2 text-sm text-muted-foreground">No categories found</div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Bottom Sheet category picker (Mobile) ──

function CategorySheet({
  value,
  onChange,
  children,
}: {
  value: string
  onChange: (v: string) => void
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    if (!search) return categories
    return categories.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))
  }, [search])

  const showCreate = search.trim().length > 0 &&
    !categories.some((c) => c.name.toLowerCase() === search.trim().toLowerCase())

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <div onClick={() => setOpen(true)}>{children}</div>
      <SheetContent side="bottom" className="max-h-[70vh]">
        <SheetHeader>
          <SheetTitle>Select Category</SheetTitle>
        </SheetHeader>
        <div className="px-4 pb-4">
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              placeholder="Search category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 pl-9 pr-3 rounded-lg border border-input bg-background text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring/30"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter' && filtered.length > 0) {
                  e.preventDefault(); onChange(filtered[0].name); setOpen(false); setSearch('')
                }
              }}
            />
          </div>
          <div className="space-y-1 max-h-[40vh] overflow-y-auto">
            {filtered.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  onChange(cat.name)
                  setOpen(false)
                  setSearch('')
                }}
                className={cn(
                  'w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  value === cat.name
                    ? 'bg-primary/10 text-primary ring-1 ring-primary/30'
                    : 'text-foreground hover:bg-muted'
                )}
              >
                <span>{cat.name}</span>
                <span className="text-[10px] text-muted-foreground">{cat.productCount} products</span>
              </button>
            ))}
            {showCreate && (
              <button
                type="button"
                onClick={() => {
                  onChange(search.trim())
                  setOpen(false)
                  setSearch('')
                }}
                className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-primary hover:bg-primary/5 transition-colors"
              >
                <Plus className="size-3.5" />
                Create &quot;{search.trim()}&quot;
              </button>
            )}
            {!showCreate && filtered.length === 0 && (
              <div className="px-3 py-2 text-sm text-muted-foreground">No categories found</div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

// ── Unit Select Component ──

function UnitSelect({
  value,
  onChange,
  measurementType,
}: {
  value: string
  onChange: (v: string) => void
  measurementType?: 'count' | 'weight' | 'volume' | 'length'
}) {
  const baseOptions = getBaseUnitOptions()
  const filteredGroups = measurementType
    ? baseOptions.filter((g) => g.label.toLowerCase() === measurementType.toLowerCase())
    : baseOptions

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring/30 appearance-none cursor-pointer"
    >
      {filteredGroups.map((group) => (
        <optgroup key={group.label} label={group.label}>
          {group.options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </optgroup>
      ))}
    </select>
  )
}

// ── Unit Combobox for both sides ──
function UnitCombobox({ value, onChange, baseUnitId }: { value: string; onChange: (v: string) => void; baseUnitId: string }) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const options = getBaseUnitOptions().flatMap(g => g.options.map(o => ({ id: o.value, label: o.label })))
  const displayLabel = options.find(o => o.id === value)?.label || value
  const filtered = useMemo(() => {
    if (!search) return options.filter(o => o.id !== value)
    const q = search.toLowerCase()
    return options.filter(o => o.label.toLowerCase().includes(q) && o.id !== value)
  }, [search, options, value])
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node) && inputRef.current && !inputRef.current.contains(e.target as Node)) {
        setOpen(false); setSearch('')
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])
  return (
    <div className="relative">
      <input ref={inputRef} type="text" value={open ? search : displayLabel}
        placeholder="Unit"
        onChange={(e) => { setSearch(e.target.value); if (!open) setOpen(true) }}
        onFocus={() => { setOpen(true); setSearch('') }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && open && filtered.length > 0) {
            e.preventDefault(); e.stopPropagation(); onChange(filtered[0].id); setOpen(false); setSearch('')
          }
          if (e.key === 'Escape' && open) { e.stopPropagation(); setOpen(false); setSearch('') }
        }}
        className="h-8 px-2 rounded border border-input bg-background text-xs outline-none focus:border-ring focus:ring-1 focus:ring-ring/30" style={{ width: '72px' }} />
      {open && (
        <div ref={panelRef} className="absolute z-50 mt-1 bg-popover border border-border rounded-lg shadow-lg max-h-40 overflow-y-auto w-36">
          {filtered.map((o) => (
            <button key={o.id} type="button" onClick={() => { onChange(o.id); setOpen(false); setSearch('') }}
              className={cn('w-full px-2.5 py-1.5 text-xs text-left hover:bg-muted transition-colors', o.id === baseUnitId && 'bg-primary/5 text-primary font-medium')}>
              {o.label} {o.id === baseUnitId ? '(base)' : ''}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Selling Unit Bidirectional Row ──
interface SellingUnitRowProps {
  unit: SellingUnit
  isDefault: boolean
  costPerBaseUnit: number
  baseUnitId: string
  onChange: (unit: SellingUnit) => void
  onRemove: (() => void) | undefined
  defaultSalePrice: number
}

function SellingUnitRow({ unit, isDefault, costPerBaseUnit, baseUnitId, onChange, onRemove, defaultSalePrice }: SellingUnitRowProps) {
  const aIsBase = unit.unitId === baseUnitId
  const qty = unit.quantity
  const cost = qty > 0 ? (aIsBase ? costPerBaseUnit / qty : costPerBaseUnit * qty) : 0
  const handleAChange = (v: string) => {
    if (v === baseUnitId && unit.unitId === baseUnitId) return
    onChange({ ...unit, unitId: v === baseUnitId ? baseUnitId : v })
  }
  const handleBChange = (v: string) => {
    if (v === baseUnitId && unit.unitId === baseUnitId) return
    onChange({ ...unit, unitId: v === baseUnitId ? baseUnitId : v })
  }
  return (
    <div className={cn('flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors min-h-[40px]', isDefault ? 'bg-primary/[0.04]' : 'bg-card hover:bg-muted/20')}>
      <UnitCombobox value={aIsBase ? baseUnitId : unit.unitId} baseUnitId={baseUnitId} onChange={handleAChange} />
      <span className="text-[11px] text-muted-foreground shrink-0 text-center w-10">1 =</span>
      <input type="number" value={qty || ''} placeholder="1" step="any"
        onChange={(e) => onChange({ ...unit, quantity: parseFloat(e.target.value) || 1 })}
        className="w-16 h-8 px-2 rounded border border-input bg-background text-xs tabular-nums outline-none focus:border-ring focus:ring-1 focus:ring-ring/30 shrink-0" min="0.001" />
      <UnitCombobox value={aIsBase ? unit.unitId : baseUnitId} baseUnitId={baseUnitId} onChange={handleBChange} />
      <div className="w-24 shrink-0 relative">
        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">Rs.</span>
        <input type="number" value={unit.salePrice || ''}
          onChange={(e) => onChange({ ...unit, salePrice: parseFloat(e.target.value) || 0 })}
          className="w-full h-8 pl-7 pr-2 rounded border border-input bg-background text-xs tabular-nums outline-none focus:border-ring focus:ring-1 focus:ring-ring/30" min="0" step="0.01" />
      </div>
      <div className="flex-1 min-w-0 text-xs">
        {!costPerBaseUnit ? (
          <span className="text-muted-foreground/60">Add cost</span>
        ) : !unit.salePrice ? (
          <span className="text-amber-600 tabular-nums">≈ Rs. {Math.round(defaultSalePrice > 0 ? defaultSalePrice * qty : cost * 1.3)}</span>
        ) : (
          (() => { const { profit, marginPercent } = calculateMargin(unit.salePrice, cost); return (
            <span className={cn('tabular-nums', profit >= 0 ? 'text-emerald-600' : 'text-red-500')}>Cost {Math.round(cost)} · {Math.round(marginPercent)}%</span>
          )})()
        )}
      </div>
      {onRemove && (
        <button type="button" onClick={onRemove} className="size-7 flex items-center justify-center rounded text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-colors shrink-0">
          <Trash2 className="size-3" />
        </button>
      )}
    </div>
  )
}

// ── Main component ──

export default function ProductForm() {
  const navigate = useNavigate()

  // ── Form state ──
  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
  const [barcode, setBarcode] = useState('')
  const [productType, setProductType] = useState<'simple' | 'composite'>('simple')
  const [baseUnitId, setBaseUnitId] = useState('piece')
  const [openingStock, setOpeningStock] = useState('')
  const [lowStockThreshold] = useState('100')
  const [sellingUnits, setSellingUnits] = useState<SellingUnit[]>([
    { id: 'default', name: 'Piece', unitId: 'piece', quantity: 1, salePrice: 0, isDefault: true },
  ])

  // ── Purchasing & Cost (expandable) ──
  const [advancedOpen, setAdvancedOpen] = useState(false)
  const [purchaseCost, setPurchaseCost] = useState('')

  // ── Manufacturing (expandable, only for composite) ──
  const [ingredientSearch, setIngredientSearch] = useState('')
  const [ingredientSearchOpen, setIngredientSearchOpen] = useState(false)
  const [ingredients, setIngredients] = useState<{ productId: string; name: string; quantity: string; unitId: string }[]>([])
  const ingredientSearchRef = useRef<HTMLDivElement>(null)

  // ── Derived values ──

  // Cost per base unit from purchase config
  const costPerBaseUnit = parseFloat(purchaseCost) || 0

  // Total manufacturing ingredient cost
  const totalIngredientCost = useMemo(() => {
    if (ingredients.length === 0) return 0
    return ingredients.reduce((sum, ing) => {
      const product = mockProducts.find((p) => p.id === ing.productId)
      if (!product || !product.purchaseConfig) return sum
      const ingCostPerUnit = product.purchaseConfig.cost / product.purchaseConfig.quantity
      return sum + ingCostPerUnit * (parseFloat(ing.quantity) || 0)
    }, 0)
  }, [ingredients])

  // Ingredient search results
  const ingredientSearchResults = useMemo(() => {
    if (!ingredientSearch.trim()) return []
    const q = ingredientSearch.toLowerCase()
    return mockProducts.filter(
      (p) => p.name.toLowerCase().includes(q) && !ingredients.some((i) => i.productId === p.id)
    ).slice(0, 20)
  }, [ingredientSearch, ingredients])

  // SKU
  const [skuSequence, setSkuSequence] = useState(() => mockProducts.length + 1)
  const [sku, setSku] = useState('')

  useEffect(() => {
    if (category) {
      setSku(generateSku(category, skuSequence))
      if (!baseUnitId) {
        setBaseUnitId(getDefaultUnitForCategory(category))
      }
    } else {
      setSku('')
    }
  }, [category, skuSequence])

  // Reset selling units when base unit changes
  useEffect(() => {
    const unit = getUnit(baseUnitId)
    if (unit) {
      setSellingUnits((prev) => {
        const defaultUnit = prev.find((su) => su.isDefault)
        return [{
          id: 'default', name: unit.name, unitId: baseUnitId,
          quantity: 1, salePrice: defaultUnit?.salePrice ?? 0, isDefault: true,
        }]
      })
    }
  }, [baseUnitId])

  // Close ingredient search on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        ingredientSearchRef.current && !ingredientSearchRef.current.contains(e.target as Node)
      ) {
        setIngredientSearchOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // ── Additional fields (used in Advanced Details) ──
  const [description, setDescription] = useState('')

  // ── Session state ──
  const [sessionCount, setSessionCount] = useState(0)

  // ── UI state ──
  const [saving, setSaving] = useState(false)
  const nameInputRef = useRef<HTMLInputElement>(null)

  // Auto-focus name on mount and after save
  useEffect(() => {
    nameInputRef.current?.focus()
  }, [sessionCount])

  // ── Helper: build product object ──

  const buildProduct = useCallback((newId: string, currentSku: string) => {
    const today = new Date().toISOString().split('T')[0]
    const stockQty = parseInt(openingStock) || 0
    const categoryThreshold = parseInt(lowStockThreshold) || 100

    const newSellingUnits: SellingUnit[] = sellingUnits.map((su) => ({
      ...su,
      salePrice: su.salePrice || 0,
      quantity: su.quantity || 1,
    }))

    // Ensure at least the default selling unit exists
    if (newSellingUnits.length === 0) {
      const unit = getUnit(baseUnitId)
      newSellingUnits.push({
        id: `su-${Date.now()}-default`,
        name: unit?.name || 'Piece',
        unitId: baseUnitId,
        quantity: 1,
        salePrice: 0,
        isDefault: true,
      })
    }

    const productIngredients: Ingredient[] | undefined = productType === 'composite' && ingredients.length > 0
      ? ingredients
          .filter((i) => i.productId && i.quantity)
          .map((i) => ({
            productId: i.productId,
            quantity: parseFloat(i.quantity) || 0,
            unitId: i.unitId || baseUnitId,
          }))
      : undefined

    const product: Product = {
      id: newId,
      name: name.trim(),
      sku: currentSku,
      barcode: barcode || '',
      category: category || 'Uncategorized',
      description: description || '',
      productType: productType !== 'simple' ? productType : undefined,
      baseUnitId,
      sellingUnits: newSellingUnits,
      ingredients: productIngredients && productIngredients.length > 0 ? productIngredients : undefined,
      trackInventory: true,
      stockQuantity: stockQty,
      lowStockThreshold: categoryThreshold,
      status: stockQty === 0 ? 'out-of-stock' : stockQty <= categoryThreshold ? 'low-stock' : 'in-stock',
      createdAt: today,
      updatedAt: today,
    } as Product

    ensureBackwardCompat(product)

    return product
  }, [name, category, barcode, productType, baseUnitId, openingStock, lowStockThreshold, sellingUnits, purchaseCost, ingredients, description])

  // ── Save & Add Next ──

  const handleSaveAndAddNext = useCallback(() => {
    if (!name.trim()) {
      toast.error('Product name is required')
      nameInputRef.current?.focus()
      return
    }

    if (sellingUnits.length === 0 || sellingUnits.every((su) => !su.salePrice || su.salePrice <= 0)) {
      toast.error('At least one selling unit with a sale price is required')
      return
    }

    setSaving(true)

    const newId = `prod-${String(mockProducts.length + 1).padStart(3, '0')}`
    const currentSku = sku || (category ? generateSku(category, skuSequence) : `PRD-${String(skuSequence).padStart(3, '0')}`)

    const newProduct = buildProduct(newId, currentSku)
    mockProducts.unshift(newProduct)

    const newSeq = skuSequence + 1
    setSkuSequence(newSeq)
    setSessionCount((c) => c + 1)

    toast.success(`${name.trim()} saved ✓`)

    // Clear volatile fields, persist others
    setName('')
    setOpeningStock('')
    setIngredients([])

    setSaving(false)

    // Auto-focus name for next entry
    setTimeout(() => nameInputRef.current?.focus(), 0)
  }, [name, sku, skuSequence, category, sellingUnits, buildProduct])

  // ── Save & Open ──

  const handleSaveAndOpen = useCallback(() => {
    if (!name.trim()) {
      toast.error('Product name is required')
      nameInputRef.current?.focus()
      return
    }

    if (sellingUnits.length === 0 || sellingUnits.every((su) => !su.salePrice || su.salePrice <= 0)) {
      toast.error('At least one selling unit with a sale price is required')
      return
    }

    setSaving(true)

    const newId = `prod-${String(mockProducts.length + 1).padStart(3, '0')}`
    const currentSku = sku || (category ? generateSku(category, skuSequence) : `PRD-${String(skuSequence).padStart(3, '0')}`)

    const newProduct = buildProduct(newId, currentSku)
    mockProducts.unshift(newProduct)
    setSessionCount((c) => c + 1)

    toast.success(`${name.trim()} saved ✓`)

    setSaving(false)
    navigate(`/inventory/product/${newId}`)
  }, [name, sku, skuSequence, category, sellingUnits, buildProduct, navigate])

  // ── Keyboard handling ──

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
        e.preventDefault()
        handleSaveAndAddNext()
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault()
        handleSaveAndOpen()
      }
    },
    [handleSaveAndAddNext, handleSaveAndOpen]
  )

  // ── Template chips for selling units ──
  // quantity = "how many of this selling unit fit in 1 base unit"
  const sellingUnitTemplates = useMemo(() => {
    const unit = getUnit(baseUnitId)
    const mt = unit?.measurementType
    if (mt === 'weight') {
      // Base unit is KG or Gram — templates in terms of "per 1 kg" or "per 1000g"
      const perKg = baseUnitId === 'kg' ? 1 : 1000
      return [
        { name: '50g Pack', quantity: 1000 / 50 },
        { name: '100g Pack', quantity: 1000 / 100 },
        { name: '250g Pack', quantity: 1000 / 250 },
        { name: '500g Pack', quantity: 1000 / 500 },
        { name: '1kg Pack', quantity: perKg },
      ]
    }
    if (mt === 'volume') {
      const perLiter = baseUnitId === 'liter' ? 1 : 1000
      return [
        { name: '100ml', quantity: 1000 / 100 },
        { name: '250ml', quantity: 1000 / 250 },
        { name: '500ml', quantity: 1000 / 500 },
        { name: '1 Liter', quantity: perLiter },
      ]
    }
    if (mt === 'length') {
      const perMeter = baseUnitId === 'meter' ? 1 : 100
      return [
        { name: '10cm', quantity: 100 / 10 },
        { name: '50cm', quantity: 100 / 50 },
        { name: '1m', quantity: perMeter },
        { name: '5m', quantity: 1 / 5 },
      ]
    }
    return [
      { name: 'Half ' + (unit?.name || 'Unit'), quantity: 2 },
      { name: (unit?.name || 'Unit') + ' (same)', quantity: 1 },
      { name: 'Double ' + (unit?.name || 'Unit'), quantity: 1 / 2 },
      { name: 'Quarter ' + (unit?.name || 'Unit'), quantity: 1 / 0.25 },
    ]
  }, [baseUnitId])

  // ── Selling unit helpers ──

  const addSellingUnit = useCallback((templateName?: string, templateQty?: number) => {
    const unit = getUnit(baseUnitId)
    const newId = `su-${Date.now()}`
    const name = templateName || unit?.name || 'Piece'
    const qty = templateQty || 1
    const suggestedPrice = costPerBaseUnit > 0 ? Math.round(costPerBaseUnit * qty * 1.3) : 0
    const newUnit: SellingUnit = {
      id: newId,
      name,
      unitId: baseUnitId,
      quantity: qty,
      salePrice: suggestedPrice,
      isDefault: false,
    }
    setSellingUnits((prev) => [...prev, newUnit])
  }, [baseUnitId, costPerBaseUnit])

  const updateSellingUnit = useCallback((updated: SellingUnit) => {
    setSellingUnits((prev) => prev.map((su) => (su.id === updated.id ? updated : su)))
  }, [])

  const removeSellingUnit = useCallback((id: string) => {
    setSellingUnits((prev) => prev.filter((su) => su.id !== id))
  }, [])

  // ── Product type toggle ──

  const handleProductTypeChange = useCallback((type: 'simple' | 'composite') => {
    setProductType(type)
  }, [])

  // ── Render ──

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">Add Product</h1>
        </div>
        <div className="flex items-center gap-2">
          <SessionCounter count={sessionCount} />
        </div>
      </div>

      {/* ── Form ── */}
      <Card>
        <CardContent className="p-4 sm:p-6 space-y-5" onKeyDown={handleKeyDown}>
          {/* ════════════════════════════════════════════════ */}
          {/* QUICK ENTRY (always visible, 95% of use case) */}
          {/* ════════════════════════════════════════════════ */}

          {/* Product Name */}
          <FormField label="Product Name" required>
            <input
              ref={nameInputRef}
              type="text"
                placeholder="e.g. Enter product name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-12 px-4 rounded-lg border border-input bg-background text-base outline-none focus:border-ring focus:ring-1 focus:ring-ring/30 transition-shadow"
            />
          </FormField>

          {/* Category + Barcode */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Category">
              <div className="hidden sm:block">
                <CategoryCombobox value={category} onChange={setCategory} />
              </div>
              <div className="sm:hidden">
                <CategorySheet value={category} onChange={setCategory}>
                  <button type="button" className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm text-left outline-none focus:border-ring focus:ring-1 focus:ring-ring/30">
                    {category || <span className="text-muted-foreground">Select category</span>}
                  </button>
                </CategorySheet>
              </div>
            </FormField>

            <FormField label="Barcode (optional)">
              <input
                type="text" placeholder="e.g. 8901234567" value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring/30 font-mono"
              />
            </FormField>
          </div>

          {/* Purchase Price + Sale Price */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Your Cost">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">Rs.</span>
                <input
                  type="number" placeholder="0" value={purchaseCost}
                  onChange={(e) => setPurchaseCost(e.target.value)}
                  className="w-full h-10 pl-10 pr-3 rounded-lg border border-input bg-background text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring/30" min="0" step="0.01"
                />
              </div>
            </FormField>

            <FormField label="Selling Price" required>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">Rs.</span>
                <input
                  type="number" placeholder="0"
                  value={sellingUnits[0]?.salePrice || ''}
                  onChange={(e) => updateSellingUnit({ ...sellingUnits[0], salePrice: parseFloat(e.target.value) || 0 })}
                  className="w-full h-10 pl-10 pr-3 rounded-lg border border-input bg-background text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring/30" min="0" step="0.01"
                />
              </div>
              {(!sellingUnits[0]?.salePrice || sellingUnits[0].salePrice <= 0) && (
                <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-1">Set your selling price</p>
              )}
            </FormField>
          </div>

          {/* Product Type — small pills */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Type:</span>
            <div className="flex rounded-lg border border-input overflow-hidden">
              <button type="button" onClick={() => handleProductTypeChange('simple')}
                className={cn('px-3 py-1.5 text-xs font-medium transition-colors', productType === 'simple' ? 'bg-primary text-primary-foreground' : 'bg-background text-foreground hover:bg-muted')}>
                I Buy &amp; Sell
              </button>
              <button type="button" onClick={() => handleProductTypeChange('composite')}
                className={cn('px-3 py-1.5 text-xs font-medium transition-colors border-l border-input', productType === 'composite' ? 'bg-primary text-primary-foreground' : 'bg-background text-foreground hover:bg-muted')}>
                I Make It
              </button>
            </div>
          </div>

          {/* Starting Quantity + Unit */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Starting Quantity">
              <input
                type="number" placeholder="0" value={openingStock}
                onChange={(e) => setOpeningStock(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring/30" min="0"
              />
            </FormField>

            <FormField label="Unit">
              <UnitSelect value={baseUnitId} onChange={setBaseUnitId} />
            </FormField>
          </div>

          {/* Selling Unit — always visible, defaults to base unit */}
          {(() => {
            const defaultSU = sellingUnits[0]
            const defaultName = defaultSU?.name || getUnit(baseUnitId)?.name || baseUnitId
            const isDifferent = defaultSU && (defaultSU.name !== getUnit(baseUnitId)?.name && defaultSU.quantity !== 1)
            return (
              <div className="flex items-center gap-3 text-sm">
                <span className="text-muted-foreground text-xs">Sold as:</span>
                <span className="font-medium text-foreground">{defaultName}</span>
                {isDifferent && (
                  <span className="text-xs text-muted-foreground">
                    ({Number(defaultSU.quantity.toFixed(4))} {getUnit(baseUnitId)?.name || baseUnitId} each)
                  </span>
                )}
                <button type="button" onClick={() => setAdvancedOpen(true)} className="text-xs text-primary hover:underline">
                  {isDifferent ? 'Change' : 'Add sizes'}
                </button>
              </div>
            )
          })()}

          <SectionDivider />

          {/* ════════════════════════════════════════════════ */}
          {/* ADVANCED OPTIONS (collapsed) */}
          {/* ════════════════════════════════════════════════ */}
          <section>
            <button
              type="button"
              onClick={() => setAdvancedOpen(!advancedOpen)}
              className="w-full flex items-center justify-between py-1 group"
            >
              <div className="flex items-center gap-2">
                <Settings2 className="size-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                <span className="text-sm font-medium text-foreground">More Options</span>
              </div>
              {advancedOpen ? <ChevronUp className="size-4 text-muted-foreground" /> : <ChevronDown className="size-4 text-muted-foreground" />}
            </button>

            {advancedOpen && (
              <div className="mt-4 space-y-5 pt-4 border-t border-border">

                {/* ── Selling Sizes ── */}
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    Selling Sizes
                  </h4>

                  {/* Template suggestion chips */}
                  <div className="flex items-center gap-1.5 mb-3">
                    <span className="text-[10px] text-muted-foreground shrink-0">Quick Add:</span>
                    <div className="flex flex-wrap gap-1.5">
                    {sellingUnitTemplates.map((tmpl) => {
                      const existing = sellingUnits.find(su => su.name === tmpl.name)
                      return (
                        <button
                          key={tmpl.name}
                          type="button"
                          disabled={!!existing}
                          onClick={() => addSellingUnit(tmpl.name, tmpl.quantity)}
                          className={cn(
                            'inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-[11px] font-medium transition-colors',
                            existing
                              ? 'border-border bg-muted/30 text-muted-foreground/50 cursor-default'
                              : 'border-border text-muted-foreground hover:text-foreground hover:border-muted-foreground/30'
                          )}
                        >
                          {existing ? '✓ ' : '+ '}{tmpl.name}
                        </button>
                      )
                    })}
                    </div>
                  </div>

                  {/* Column headers */}
                  {sellingUnits.length > 1 && (
                    <div className="flex items-center gap-2 px-3 text-[10px] text-muted-foreground uppercase tracking-wider">
                      <span className="w-[72px] shrink-0">Unit</span>
                      <span className="w-10 shrink-0" />
                      <span className="w-16 shrink-0" />
                      <span className="w-[72px] shrink-0">Unit</span>
                      <span className="w-24 shrink-0">Price</span>
                      <span className="flex-1">Cost &amp; Profit</span>
                      <span className="w-7 shrink-0" />
                    </div>
                  )}

                  <div className="space-y-1">
                    {sellingUnits.map((su, idx) => (
                      <SellingUnitRow
                        key={su.id}
                        unit={su}
                        isDefault={idx === 0}
                        costPerBaseUnit={costPerBaseUnit}
                        baseUnitId={baseUnitId}
                        onChange={updateSellingUnit}
                        onRemove={idx > 0 ? () => removeSellingUnit(su.id) : undefined}
                        defaultSalePrice={sellingUnits[0]?.salePrice || 0}
                      />
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => addSellingUnit()}
                    className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
                  >
                    <Plus className="size-3.5" />
                    Add Another Size
                  </button>
                </div>

                {/* ── Manufacturing (only for composite) ── */}
                {productType === 'composite' && (
                  <>
                    <SectionDivider />
                    <div>
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                        <Beaker className="size-3.5" /> Manufacturing
                      </h4>
                      <div ref={ingredientSearchRef} className="relative mb-3">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
                          <input type="text" placeholder="Search product to add as ingredient..."
                            value={ingredientSearch}
                            onChange={(e) => { setIngredientSearch(e.target.value); if (!ingredientSearchOpen) setIngredientSearchOpen(true) }}
                            onFocus={() => setIngredientSearchOpen(true)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && ingredientSearchOpen && ingredientSearchResults.length > 0) {
                                e.preventDefault(); e.stopPropagation()
                                const prod = ingredientSearchResults[0]
                                setIngredients([...ingredients, { productId: prod.id, name: prod.name, quantity: '1', unitId: prod.baseUnitId || 'piece' }])
                                setIngredientSearch(''); setIngredientSearchOpen(false)
                              }
                              if (e.key === 'Escape' && ingredientSearchOpen) { e.stopPropagation(); setIngredientSearchOpen(false) }
                            }}
                            className="w-full h-10 pl-9 pr-3 rounded-lg border border-input bg-background text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring/30" />
                        </div>
                        {ingredientSearchOpen && ingredientSearch.trim() && (
                          <div className="absolute z-50 mt-1 w-full bg-popover border border-border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                            {ingredientSearchResults.length > 0 ? (
                              <div className="py-1">
                                {ingredientSearchResults.map((product) => (
                                  <button key={product.id} type="button"
                                    onClick={() => { setIngredients([...ingredients, { productId: product.id, name: product.name, quantity: '1', unitId: product.baseUnitId || 'piece' }]); setIngredientSearch(''); setIngredientSearchOpen(false) }}
                                    className="w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-muted transition-colors">
                                    <span className="font-medium">{product.name}</span>
                                    <span className="text-[10px] text-muted-foreground">{getUnit(product.baseUnitId)?.name || product.baseUnitId}</span>
                                  </button>
                                ))}
                              </div>
                            ) : <div className="px-3 py-2 text-sm text-muted-foreground">No matching products</div>}
                          </div>
                        )}
                      </div>
                      {ingredients.length > 0 && (
                        <div className="space-y-2">
                          {ingredients.map((ing, idx) => (
                            <div key={ing.productId} className="flex items-center gap-2 rounded-xl border border-border bg-card p-3">
                              <p className="flex-1 text-sm font-medium text-foreground truncate min-w-0">{ing.name}</p>
                              <input type="number" placeholder="Qty" value={ing.quantity}
                                onChange={(e) => { const updated = [...ingredients]; updated[idx] = { ...updated[idx], quantity: e.target.value }; setIngredients(updated) }}
                                className="w-20 h-8 px-2 rounded-lg border border-input bg-background text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring/30" min="0" step="any" />
                              <UnitSelect value={ing.unitId}
                                onChange={(v) => { const updated = [...ingredients]; updated[idx] = { ...updated[idx], unitId: v }; setIngredients(updated) }} />
                              <button type="button" onClick={() => setIngredients(ingredients.filter((_, i) => i !== idx))}
                                className="size-8 flex items-center justify-center text-muted-foreground hover:text-red-500 transition-colors shrink-0"><Trash2 className="size-3.5" /></button>
                            </div>
                          ))}
                        </div>
                      )}
                      {totalIngredientCost > 0 && (
                        <div className="mt-3 rounded-lg bg-muted/40 border border-border/50 px-4 py-3">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Estimated ingredient cost</span>
                            <span className="font-semibold text-foreground tabular-nums">Rs. {totalIngredientCost.toFixed(2)}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}

                {/* ── Details ── */}
                <SectionDivider />
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Details</h4>
                  <div className="space-y-4">
                    <FormField label="Product Code (auto-generated)">
                      <input type="text" placeholder="Will be filled automatically" value={sku}
                        onChange={(e) => setSku(e.target.value)}
                        className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring/30 font-mono" />
                    </FormField>
                    <FormField label="Description">
                      <textarea placeholder="Optional product description..." value={description}
                        onChange={(e) => setDescription(e.target.value)} rows={2}
                        className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring/30 resize-none" />
                    </FormField>
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* ── Sticky Save Bar ── */}
          <div className="sticky bottom-0 -mx-4 sm:-mx-6 px-4 sm:px-6 py-3 bg-card border-t border-border mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:justify-between z-10">
            <Button
              variant="outline"
              size="lg"
              onClick={handleSaveAndOpen}
              disabled={saving}
              className="sm:order-1 gap-1.5"
            >
              <Save className="size-4" />
              Save &amp; View
              <kbd className="hidden sm:inline-flex items-center justify-center size-4 rounded bg-muted text-[10px] font-mono">⌘⏎</kbd>
            </Button>
            <Button
              size="lg"
              onClick={handleSaveAndAddNext}
              disabled={saving}
              className="gap-1.5 shadow-sm"
            >
              <Sparkles className="size-4" />
              Save &amp; Add Another
              <kbd className="hidden sm:inline-flex items-center justify-center size-4 rounded bg-primary-foreground/20 text-[10px] font-mono">↵</kbd>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ── Shared components ──

function FormField({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-medium text-foreground">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}

function SectionDivider() {
  return <div className="border-t border-border/60" />
}
