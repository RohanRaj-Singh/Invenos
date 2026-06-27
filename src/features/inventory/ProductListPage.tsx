import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import ProductFilters from './components/ProductFilters'
import ProductTable from './components/ProductTable'
import ProductCardView from './components/ProductCardView'
import { mockProducts } from '@/data/inventory'
import type { StockStatus } from '@/types'

export default function ProductListPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [stockStatus, setStockStatus] = useState<StockStatus | 'all'>('all')

  const filtered = useMemo(() => {
    return mockProducts.filter((p) => {
      if (search) {
        const q = search.toLowerCase()
        if (!p.name.toLowerCase().includes(q) && !p.sku.toLowerCase().includes(q)) return false
      }
      if (category !== 'all' && p.category !== category) return false
      if (stockStatus !== 'all' && p.status !== stockStatus) return false
      return true
    })
  }, [search, category, stockStatus])

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 text-primary mb-1">
            <Package className="size-5" />
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">
              Inventory
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">Products</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {mockProducts.length} products across {new Set(mockProducts.map((p) => p.category)).size} categories
          </p>
        </div>
        <Button
          onClick={() => navigate('/inventory/add')}
          size="sm"
          className="gap-1.5 shadow-sm h-9"
        >
          <Plus className="size-4" />
          <span className="hidden sm:inline">Add Product</span>
        </Button>
      </div>

      {/* Filters */}
      <ProductFilters
        search={search}
        onSearchChange={setSearch}
        category={category}
        onCategoryChange={setCategory}
        stockStatus={stockStatus}
        onStockStatusChange={setStockStatus}
      />

      {/* Results count */}
      <div className="text-xs text-muted-foreground">
        Showing <span className="font-medium text-foreground">{filtered.length}</span> of{' '}
        {mockProducts.length} products
      </div>

      {/* Desktop table */}
      <div className="hidden md:block">
        <ProductTable products={filtered} />
      </div>

      {/* Mobile cards */}
      <div className="md:hidden">
        <ProductCardView products={filtered} />
      </div>
    </div>
  )
}
